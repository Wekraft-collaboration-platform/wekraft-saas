import path from "node:path";
import dotenv from "dotenv";

// Force load env variables from .env.local to override any system/shell variables
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});

import { auth } from "@clerk/nextjs/server";
import { type NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, tool, stepCountIs } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Strict rate limiter — 3/min per project
const kayaRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
  prefix: "kaya_ts_rl",
});

const allTools = {
  getMemberWorkload: tool({
    description:
      "Get the current tasks and issues workload breakdown for all project members.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the project"),
    }),
    execute: async ({ projectId }) => {
      console.log("Kaya Tool: getMemberWorkload called for", projectId);
      return await convex.query(api.teamspaceAgents.getMemberWorkload, {
        projectId,
      });
    },
  }),

  getProjectInsights: tool({
    description: "Get basic project timeline and deadline tracking details.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the project"),
    }),
    execute: async ({ projectId }) => {
      console.log("Kaya Tool: getProjectInsights called for", projectId);
      return await convex.query(api.teamspaceAgents.getProjectInsights, {
        projectId: projectId as any,
      });
    },
  }),

  getTasksSummary: tool({
    description:
      "Get an AI-optimized summary of project tasks, prioritizing critical, active, completed, and blocked tasks.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the project"),
    }),
    execute: async ({ projectId }) => {
      console.log("Kaya Tool: getTasksSummary called for", projectId);
      return await convex.query(api.teamspaceAgents.getTasksSummary, {
        projectId: projectId as any,
      });
    },
  }),

  getIssuesSummary: tool({
    description: "Get a summary of active and critical project issues.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the project"),
    }),
    execute: async ({ projectId }) => {
      console.log("Kaya Tool: getIssuesSummary called for", projectId);
      return await convex.query(api.teamspaceAgents.getIssuesSummary, {
        projectId: projectId as any,
      });
    },
  }),

  getProjectVelocity: tool({
    description:
      "Get project throughput velocity, average cycle times, and the 4-week trend.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the project"),
    }),
    execute: async ({ projectId }) => {
      console.log("Kaya Tool: getProjectVelocity called for", projectId);
      return await convex.query(api.teamspaceAgents.getProjectVelocity, {
        projectId: projectId as any,
      });
    },
  }),

  getSprintHistory: tool({
    description:
      "Get sprint completion analytics and goal history for completed and active sprints.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the project"),
    }),
    execute: async ({ projectId }) => {
      console.log("Kaya Tool: getSprintHistory called for", projectId);
      return await convex.query(api.teamspaceAgents.getSprintHistory, {
        projectId: projectId as any,
      });
    },
  }),
};

const getSystemPrompt = (projectId: string) =>
  `
You are Kaya, the AI Project Manager (PM) Agent for this project.
You assist the team inside the teamspace chat by analyzing project metrics, task statuses, issues, team workloads, sprints, and velocity of the project.

The ID of the current project is: "${projectId}".
CRITICAL: Never ask users for the project ID. Use this ID "${projectId}" directly for all of your tool calls.

Your Behaviour:
- In the chat history, user messages are prefixed with [User: Username] so you know who is speaking. Address project members by name when appropriate.
- Use your tools to fetch accurate details from the project whenever the user asks for tasks, issues, workload, velocity, sprints, or overall insights. Always pass "${projectId}" as the projectId argument to your tools.
- Be clear, professional, direct, and concise in your responses. Keep responses focused and avoid unnecessary fluff.
- CRITICAL: You cannot perform any write or mutation operations in this interface (e.g. creating/assigning tasks or issues, creating sprints, calendar events, scheduling, etc.).
- If the user asks you to perform a write/mutation action, you must explicitly reply: "I cannot do that here. You need to open me outside the teamspace (e.g. by using Ctrl+K or visiting the AI page)."
`.trim();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON payload", { status: 400 });
    }

    const { messages, projectId } = body;
    console.log(
      `[Kaya Route] POST request received. Project ID: ${projectId}, Messages Count: ${messages?.length}, User ID: ${userId}`,
    );

    if (!projectId || !messages) {
      console.log(
        "[Kaya Route] Validation failed: missing projectId or messages",
      );
      return new Response("projectId and messages are required", {
        status: 400,
      });
    }

    // Pro plan check — single Convex query, ownerAccountType already computed
    const project = await convex.query(api.project.getProjectById, {
      projectId: projectId as any,
    });
    if (!project || project.ownerAccountType !== "pro") {
      return new Response("Pro plan required to use AI agents in Teamspace.", {
        status: 403,
      });
    }

    // Strict rate limit per project (3 requests per minute for the whole project team)
    const limitKey = projectId;
    const { success, limit, reset, remaining } =
      await kayaRatelimit.limit(limitKey);
    console.log(
      `[Kaya Route] Rate Limit Check - Key: ${limitKey}, Success: ${success}, Remaining: ${remaining}/${limit}`,
    );
    if (!success) {
      console.log("[Kaya Route] Rate limit exceeded!");
      return new Response(
        "Too many requests. The project rate limit is 3 requests per minute.",
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    console.log(
      "[Kaya Route] OpenAI API Key Status: ",
      apiKey ? "Found/Configured" : "MISSING",
    );
    const customOpenai = createOpenAI({
      apiKey: apiKey,
    });

    if (!Array.isArray(messages)) {
      console.log("[Kaya Route] Validation failed: messages is not an array");
      return new Response("messages must be an array", { status: 400 });
    }

    const convertedMessages = await convertToModelMessages(messages);
    console.log(
      "[Kaya Route] Converted model messages being sent to LLM:",
      JSON.stringify(convertedMessages, null, 2),
    );

    console.log("[Kaya Route] Starting text stream...");
    const result = streamText({
      model: customOpenai("gpt-4.1-nano"),
      system: getSystemPrompt(projectId),
      messages: convertedMessages,
      tools: allTools,
      toolChoice: "auto",
      maxRetries: 2,
      stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[Kaya Route] Fatal error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
