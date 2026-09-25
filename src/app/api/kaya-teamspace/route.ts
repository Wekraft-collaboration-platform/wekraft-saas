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

// Strict rate limiter — 6/min per project for teamspace interactions
const kayaRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(6, "1 m"),
  analytics: true,
  prefix: "kaya_ts_rl",
});

const createTools = (callerClerkId?: string) => ({
  getProjectHealthAndInsights: tool({
    description:
      "Retrieve unified project health overview: deadline, days remaining/overdue, total task count, non-completed tasks count, high-priority tasks with assignees, total issue count, non-closed issues count, and critical/high issues with assignees.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the current project"),
    }),
    execute: async ({ projectId }) => {
      console.log("[Kaya Tool] getProjectHealthAndInsights called for", projectId);
      return await convex.query(api.teamspaceAgents.getProjectHealthAndInsights, {
        projectId,
      });
    },
  }),

  createProjectItem: tool({
    description:
      "Create a Task, Issue, or lightweight Ticket directly in the project and assign it to a team member (resolves assignee name fuzzy matching with avatar).",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the current project"),
      itemType: z
        .enum(["task", "issue", "ticket"])
        .describe("The type of item to create: 'task', 'issue', or 'ticket'"),
      titleOrBody: z
        .string()
        .describe("The title of the task/issue or the full body/content of the ticket"),
      description: z
        .string()
        .optional()
        .describe("Optional detailed description for tasks or issues"),
      priorityOrSeverity: z
        .enum(["critical", "high", "medium", "low"])
        .optional()
        .describe("Priority level for tasks ('high'|'medium'|'low') or severity for issues ('critical'|'medium'|'low')"),
      assigneeName: z
        .string()
        .optional()
        .describe("Name or username of the team member to assign (e.g. 'roxy', 'Alex', '@sarah')"),
      environment: z
        .enum(["production", "staging", "dev", "local"])
        .optional()
        .describe("Environment for issues (defaults to 'dev')"),
    }),
    execute: async ({
      projectId,
      itemType,
      titleOrBody,
      description,
      priorityOrSeverity,
      assigneeName,
      environment,
    }) => {
      console.log(
        `[Kaya Tool] createProjectItem called: ${itemType} - "${titleOrBody}", assignee: ${assigneeName}, priority: ${priorityOrSeverity}`,
      );
      return await convex.mutation(api.teamspaceAgents.createProjectItem, {
        projectId,
        itemType,
        titleOrBody,
        description,
        priorityOrSeverity,
        assigneeName,
        environment,
        callerClerkId,
      });
    },
  }),
});

const getSystemPrompt = (projectId: string, membersList: string[] = []) =>
  `
You are Kaya, the Autonomous AI Project Manager (PM) & Team Facilitator for this team.
You live inside the Teamspace chat channel to actively assist team members with project metrics, status tracking, and instant task/issue/ticket creations.

The ID of the current project is: "${projectId}".
CRITICAL: Never ask users for the project ID. Use this ID "${projectId}" directly for all of your tool calls.

VALID PROJECT TEAM MEMBERS:
${membersList.length > 0 ? membersList.map((m) => `- ${m}`).join("\n") : "- No additional members registered"}
IMPORTANT: When a user asks to assign a task, issue, or ticket to someone (e.g. "assign to roxy", "assign to @roxy"), ALWAYS select the exact matching name from the VALID PROJECT TEAM MEMBERS list above for the \`assigneeName\` parameter. Never invent or hallucinate non-existent member names.

Your Capabilities & Behaviour:
1. PROJECT HEALTH & INSIGHTS (Tool: getProjectHealthAndInsights):
   - When users ask about project health, deadlines, active tasks, critical bugs, overdue status, or general project overview:
   - Call \`getProjectHealthAndInsights\` to get the complete single-source snapshot.
   - FORMATTING REQUIREMENT: Always format the response using clean Markdown Tables:
     * First show a concise top overview summary (Project Name, Deadline / Days Remaining, Total Tasks, Total Issues).
     * If there are active tasks in \`activeTasksList\`, render an "📋 Active Tasks" markdown table:
       | Task Title | Priority | Status | Assignee |
       | :--- | :---: | :---: | :--- |
     * If there are active issues in \`activeIssuesList\`, render an "🚨 Active Issues" markdown table:
       | Issue Title | Severity | Status | Env | Assignee |
       | :--- | :---: | :---: | :---: | :--- |
     * Highlight high-priority items and critical issues clearly.

2. CREATE TASKS, ISSUES & TICKETS (Tool: createProjectItem):
   - When users ask you to create, add, or log a task, bug/issue, or ticket:
     * e.g. "create ticket saying handle client tomorrow, assign to roxy"
     * e.g. "create task fix payment webhook, set priority high and assign to roxy"
     * e.g. "log production issue: redis cache timeout"
   - Extract the parameters (itemType: 'task' | 'issue' | 'ticket', titleOrBody, priorityOrSeverity, assigneeName, environment) and immediately call \`createProjectItem\`.
   - Confirm the creation with a clear, celebratory badge showing the title, assigned team member, and priority level.

Tone & Style:
- Address team members professionally and directly. In chat history, user messages may be prefixed with [User: Username].
- Be punchy, structured, and action-oriented. Keep responses concise and focused for a team chat feed.
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

    // Fetch active project members list to ground the LLM
    let membersList: string[] = [];
    try {
      membersList = await convex.query(
        api.teamspaceAgents.getProjectMembersList,
        { projectId },
      );
    } catch (e) {
      console.error("[Kaya Route] Failed to fetch project members list:", e);
    }

    // Strict rate limit per project (6 requests per minute for the whole project team)
    const limitKey = projectId;
    const { success, limit, reset, remaining } =
      await kayaRatelimit.limit(limitKey);
    console.log(
      `[Kaya Route] Rate Limit Check - Key: ${limitKey}, Success: ${success}, Remaining: ${remaining}/${limit}`,
    );
    if (!success) {
      console.log("[Kaya Route] Rate limit exceeded!");
      return new Response(
        "Too many requests. The project rate limit is 6 requests per minute.",
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

    console.log("[Kaya Route] Starting text stream with gpt-4.1-mini...");
    const tools = createTools(userId);

    const result = streamText({
      model: customOpenai("gpt-4.1-mini"),
      system: getSystemPrompt(projectId, membersList),
      messages: convertedMessages,
      tools,
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
