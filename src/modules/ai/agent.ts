import { createAgent, humanInTheLoopMiddleware, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";

import {
  getTasks,
  getSprints,
  getProjectDetails,
  getDeadlineVelocity,
  addTaskToSprint,
} from "./tools";

// ─────────────────────────────────────────────────────────────────────────────
//  BUILD SUBAGENTS
// ─────────────────────────────────────────────────────────────────────────────

const model = new ChatOpenAI({
  model: "gpt-4.1-nano",
  temperature: 0,
  streaming: true,
});

export const projectBasicsSubagent = createAgent({
  model,
  tools: [getTasks, getSprints],
  systemPrompt: `You are the Project Basics Intel subagent for Wekraft.
Your job: gather and summarize task and sprint data only.
Never modify anything. Be concise and data-driven.
Highlight: blocked tasks, unassigned tasks, sprint progress.`,
});

export const insightsSubagent = createAgent({
  model,
  tools: [getProjectDetails, getDeadlineVelocity],
  systemPrompt: `You are the Insights Intel subagent for Wekraft.
Your job: analyze project health — deadlines, milestones, and velocity trends.
Never modify anything. Give actionable insights. Flag risks clearly.`,
});

// ─────────────────────────────────────────────────────────────────────────────
//  SUBAGENT INVOKER HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function invokeSubagent(
  agent: any, // Use standard Langchain Agent typings here
  agentName: string,
  query: string,
  threadId: string,
) {
  const config = { configurable: { thread_id: `${agentName}-${threadId}` } };

  // Use invoke() for a clean single run per subagent query without stream bleeding
  const result = await agent.invoke(
    { messages: [{ role: "user", content: query }] },
    config,
  );

  const lastMsg = result.messages?.at(-1);
  return typeof lastMsg?.content === "string"
    ? lastMsg.content
    : JSON.stringify(lastMsg?.content ?? "no output");
}

function safeParseInput(raw: any): { query: string; threadId: string } {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return { query: raw, threadId: "default" };
    }
  }
  if (raw && typeof raw === "object") {
    if (typeof raw.input === "string") {
      try {
        return JSON.parse(raw.input);
      } catch {
        return { query: raw.input, threadId: "default" };
      }
    }
    return raw;
  }
  return { query: String(raw), threadId: "default" };
}

// ─────────────────────────────────────────────────────────────────────────────
//  WRAP SUBAGENTS AS TOOLS
// ─────────────────────────────────────────────────────────────────────────────

export const askProjectBasics = tool(
  async (rawInput: any) => {
    const { query, threadId } = safeParseInput(rawInput);
    return invokeSubagent(
      projectBasicsSubagent,
      "PROJECT-BASICS",
      query,
      threadId,
    );
  },
  {
    name: "ask_project_basics",
    description:
      "Ask the Project Basics subagent: tasks, sprints, blocked items, unassigned tasks.",
    schema: z.object({
      query: z.string().describe("What data do you need?"),
      threadId: z.string().describe("Current session thread ID"),
    }),
  },
);

export const askInsights = tool(
  async (rawInput: any) => {
    const { query, threadId } = safeParseInput(rawInput);
    return invokeSubagent(insightsSubagent, "INSIGHTS", query, threadId);
  },
  {
    name: "ask_insights",
    description:
      "Ask the Insights subagent: project health, deadlines, velocity, milestone risks.",
    schema: z.object({
      query: z.string().describe("What insights do you need?"),
      threadId: z.string().describe("Current session thread ID"),
    }),
  },
);

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN AGENT — ROXO
// ─────────────────────────────────────────────────────────────────────────────

export const checkpointer = new MemorySaver();

export const roxo = createAgent({
  model,
  tools: [askProjectBasics, askInsights, addTaskToSprint],
  checkpointer,
  systemPrompt: `You are ROXO, the AI PM agent for Wekraft.

ARCHITECTURE:
- ask_project_basics  → read-only subagent (tasks, sprints)
- ask_insights        → read-only subagent (project health, deadline, velocity)
- add_task_to_sprint  → WRITE tool, requires human approval

WORKFLOW:
1. Always GATHER DATA first via subagents before deciding anything
2. ANALYZE what you found
3. ACT only when you have enough context
4. Always pass the current threadId when calling subagents

Be concise, data-driven, and always justify write actions with data.`,

  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: {
        add_task_to_sprint: true,
      },
      descriptionPrefix: "⏸  ROXO needs your approval",
    }),
  ],
});
