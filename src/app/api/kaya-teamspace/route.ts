import path from "node:path";
import dotenv from "dotenv";

// Force load env variables from .env.local to override any system/shell variables
dotenv.config({
  path: path.resolve(process.cwd(), ".env.local"),
  override: true,
});

import { auth } from "@clerk/nextjs/server";
import Ably from "ably";
import { randomUUID } from "crypto";
import { type NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, tool, stepCountIs } from "ai";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { initTeamspaceDB, turso } from "@/lib/turso";
import { api } from "../../../../convex/_generated/api";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

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

  broadcastAnnouncementAndNotify: tool({
    description:
      "Broadcast an announcement to all project team members: writes the announcement message to the Announcements #general channel authored by Kaya and sends an in-app notification to every team member in the project.",
    inputSchema: z.object({
      projectId: z.string().describe("The ID of the current project"),
      announcementTitle: z
        .string()
        .describe("Short punchy headline or topic for the announcement (e.g. 'Deployment at 6 PM', 'Sprint Review Tomorrow')"),
      message: z
        .string()
        .describe("The full announcement message content to broadcast to the team"),
      priority: z
        .enum(["normal", "urgent"])
        .optional()
        .describe("Priority level (defaults to 'normal')"),
    }),
    execute: async ({
      projectId,
      announcementTitle,
      message,
      priority = "normal",
    }) => {
      console.log(
        `[Kaya Tool] broadcastAnnouncementAndNotify called: "${announcementTitle}" for project ${projectId}`,
      );
      try {
        await initTeamspaceDB();

        // 1. Find the announcement channel for this project
        const channelRes = await turso.execute({
          sql: "SELECT id, name FROM ts_channels WHERE project_id = ? AND type = 'announcement' LIMIT 1",
          args: [projectId],
        });

        let announcementChannelId: string | undefined = undefined;
        let announcementChannelName = "General (Announcements)";

        if (channelRes.rows.length > 0) {
          announcementChannelId = channelRes.rows[0].id as string;
          announcementChannelName = (channelRes.rows[0].name as string) || "General";
        }

        const now = Date.now();
        const msgId = randomUUID();
        const cleanTitle = announcementTitle.trim();
        const cleanMsg = message.trim();
        const priorityBadge = priority === "urgent" ? "🚨 **[URGENT ANNOUNCEMENT]**" : "📢 **[ANNOUNCEMENT]**";
        const formattedContent = `${priorityBadge} **${cleanTitle}**\n\n${cleanMsg}`;

        // 2. Insert message into ts_messages if announcement channel exists
        if (announcementChannelId) {
          const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
          await turso.execute({
            sql: `INSERT INTO ts_messages (id, channel_id, project_id, user_id, user_name, user_image, content, created_at, expires_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              msgId,
              announcementChannelId,
              projectId,
              "kaya",
              "Kaya",
              "/kaya.svg",
              formattedContent,
              now,
              now + THIRTY_DAYS_MS,
            ],
          });

          // Publish to Ably channel so active viewers in announcements see it live
          try {
            const ablyChannel = ably.channels.get(`teamspace:${announcementChannelId}`);
            await ablyChannel.publish("message.new", {
              id: msgId,
              channel_id: announcementChannelId,
              project_id: projectId,
              user_id: "kaya",
              user_name: "Kaya",
              user_image: "/kaya.svg",
              content: formattedContent,
              created_at: now,
              reactions: [],
              reply_count: 0,
            });

            const projectMsgsChannel = ably.channels.get(`project:${projectId}:messages`);
            await projectMsgsChannel.publish("message.new", {
              id: msgId,
              channel_id: announcementChannelId,
              channel_type: "announcement",
              user_id: "kaya",
              created_at: now,
            });
          } catch (ablyErr) {
            console.error("[Kaya Tool] Ably publish error:", ablyErr);
          }
        }

        // 3. Fan out in-app notifications in Convex to all project members
        const notifyRes = await convex.mutation(
          api.teamspaceAgents.broadcastNotifications,
          {
            projectId,
            announcementTitle: cleanTitle,
            message: cleanMsg,
            channelId: announcementChannelId,
            priority,
          },
        );

        return {
          success: true,
          announcementTitle: cleanTitle,
          message: cleanMsg,
          channelName: `#${announcementChannelName}`,
          notifiedCount: notifyRes.notifiedCount,
          confirmationMessage: `📢 **Announcement Broadcasted!**\n- **Delivered to**: #${announcementChannelName} (Announcements)\n- **Team Notified**: ${notifyRes.notifiedCount} team member(s) received in-app notifications.`,
        };
      } catch (err: any) {
        console.error("[Kaya Tool] Error broadcasting announcement:", err);
        return {
          success: false,
          error: err.message || "Failed to broadcast announcement",
        };
      }
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
       | :--- | :---: | :---: | :--- | :--- |
     * Highlight high-priority items and critical issues clearly.

2. CREATE TASKS, ISSUES & TICKETS (Tool: createProjectItem):
   - When users ask you to create, add, or log a task, bug/issue, or ticket:
     * e.g. "create ticket saying handle client tomorrow, assign to roxy"
     * e.g. "create task fix payment webhook, set priority high and assign to roxy"
     * e.g. "log production issue: redis cache timeout"
   - Extract the parameters (itemType: 'task' | 'issue' | 'ticket', titleOrBody, priorityOrSeverity, assigneeName, environment) and immediately call \`createProjectItem\`.
   - Confirm the creation with a clear, celebratory badge showing the title, assigned team member, and priority level.

3. BROADCAST ANNOUNCEMENTS & NOTIFY ALL (Tool: broadcastAnnouncementAndNotify):
   - When users ask you to announce, notify all, remind everyone, or broadcast something to the team:
     * e.g. "notify all about tomorrow's demo at 3 PM"
     * e.g. "announce to team: code freeze starting at 6 PM today"
     * e.g. "remind all team members to complete timesheet"
   - Extract the \`announcementTitle\` and \`message\` (and \`priority\` if urgent) and immediately call \`broadcastAnnouncementAndNotify\`.
   - Confirm with a celebratory announcement summary in your response indicating that the message was posted to #general (Announcements) and all members were notified.

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
