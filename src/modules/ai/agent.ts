/**
 * lib/agent/agent.ts
 * ─────────────────────────────────────────────────────────────
 * ROXO — production LangGraph agent (no deepagents wrapper).
 *
 * ARCHITECTURE:
 *   ROXO (createReactAgent)
 *     ├── ask_project_basics  → projectBasicsAgent (createReactAgent)
 *     ├── ask_insights        → insightsAgent      (createReactAgent)
 *     └── add_task_to_sprint  → WRITE + interrupt() [HITL]
 *
 * WHY createReactAgent over createAgent (langchain unified):
 *   createReactAgent is the LangGraph native primitive. It gives you:
 *   - Full access to checkpointSaver, interruptBefore, interruptAfter
 *   - Direct streaming control (streamMode, subgraphs)
 *   - No abstraction layer hiding graph internals
 *   Use createAgent (langchain) only for quick prototypes.
 *
 * WHY interrupt() here works (no deepagents HITL bug):
 *   The deepagentsjs GitHub issue #131 shows that deepagents' tool
 *   execution middleware corrupts GraphInterrupt.interrupts before
 *   LangGraph's runner can read it. Native LangGraph's ToolNode
 *   handles GraphInterrupt correctly — interrupt() inside a tool
 *   is the officially documented pattern (see LangGraph interrupts docs).
 *
 * HITL DOUBLE-EXECUTION RULE (critical):
 *   On resume, LangGraph replays the ENTIRE node from the top.
 *   The tool runs again, hits interrupt() again, but the runtime
 *   detects the cached resume value and returns it immediately.
 *   Rule: ALL side-effects must come AFTER interrupt(). Never write
 *   to DB before interrupt() or you'll double-write on resume.
 * ─────────────────────────────────────────────────────────────
 */

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver, interrupt } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

import {
  projectBasicsTools,
  insightsTools,
  executeAddTaskToSprint,
  addTaskToSprintSchema,
} from "./tools";

// ─────────────────────────────────────────────────────────────
//  MODEL
//  One shared model for all agents. Subagents can use a cheaper
//  model (e.g. gpt-4.1-nano) while ROXO uses a smarter one.
//  Swap models per-agent without changing any tool code.
// ─────────────────────────────────────────────────────────────

const subagentModel = new ChatOpenAI({
  model: "gpt-4.1-nano",
  temperature: 0,
  streaming: true, // required for token-level streaming via useStream
});

const roxoModel = new ChatOpenAI({
  model: "gpt-4.1-mini", // smarter model for orchestration decisions
  temperature: 0,
  streaming: true,
});

// ─────────────────────────────────────────────────────────────
//  SUBAGENT 1 — Project Basics Intel
//  Owns: getTasks, getSprints
//  Constraint: READ ONLY. Never receives write tools.
//
//  Each subagent gets its own MemorySaver so its conversation
//  history is isolated from ROXO's thread. Thread ID convention:
//  `sub-basics-${roxoThreadId}` keeps them linked but separate.
// ─────────────────────────────────────────────────────────────

const projectBasicsCheckpointer = new MemorySaver();

export const projectBasicsAgent = createReactAgent({
  llm: subagentModel,
  tools: projectBasicsTools,
  checkpointSaver: projectBasicsCheckpointer,
  prompt: `You are the Project Basics Intel subagent for WEkraft.
Your only job: gather and summarize task and sprint data.
Never modify anything. Never invent data.
Always highlight: blocked tasks, unassigned tasks, sprint progress %.
Return a concise summary under 200 words — do NOT dump raw JSON.`,
});

// ─────────────────────────────────────────────────────────────
//  SUBAGENT 2 — Insights Intel
//  Owns: getProjectDetails, getDeadlineVelocity
//  Constraint: READ ONLY. Risk analysis only.
// ─────────────────────────────────────────────────────────────

const insightsCheckpointer = new MemorySaver();

export const insightsAgent = createReactAgent({
  llm: subagentModel,
  tools: insightsTools,
  checkpointSaver: insightsCheckpointer,
  prompt: `You are the Insights Intel subagent for WEkraft.
Your only job: analyze project health — deadlines, milestones, velocity trends.
Never modify anything. Give actionable insights. Flag risks clearly.
Return a concise summary under 200 words.`,
});

// ─────────────────────────────────────────────────────────────
//  SUBAGENT INVOKER — generic invoke helper
//  Subagents use invoke() not stream() — they run to completion
//  before returning context to ROXO. This keeps ROXO's stream
//  clean (you see ROXO tokens, not subagent tokens interleaved).
//
//  Thread ID pattern:
//    ROXO thread:    "thread-abc123"
//    Basics sub:     "sub-basics-thread-abc123"
//    Insights sub:   "sub-insights-thread-abc123"
//  This gives each subagent persistent memory per ROXO session.
// ─────────────────────────────────────────────────────────────

async function invokeSubagent(
  agent: typeof projectBasicsAgent,
  subPrefix: string,
  query: string,
  roxoThreadId: string,
): Promise<string> {
  const config = {
    configurable: {
      thread_id: `sub-${subPrefix}-${roxoThreadId}`,
    },
  };

  const result = await agent.invoke(
    { messages: [{ role: "user", content: query }] },
    config,
  );

  const last = result.messages?.at(-1);
  if (!last) return "No response from subagent.";
  return typeof last.content === "string"
    ? last.content
    : JSON.stringify(last.content);
}

// ─────────────────────────────────────────────────────────────
//  ROXO TOOLS  (exposed to main agent)
//  Two delegation tools + one HITL write tool.
// ─────────────────────────────────────────────────────────────

/**
 * ask_project_basics
 * Delegates to projectBasicsAgent. ROXO treats it like any tool.
 * The threadId arg lets subagent memory be scoped per ROXO session.
 */
export const askProjectBasics = tool(
  async ({ query, threadId }: { query: string; threadId: string }) => {
    return invokeSubagent(projectBasicsAgent, "basics", query, threadId);
  },
  {
    name: "ask_project_basics",
    description:
      "Ask the Project Basics subagent: tasks, sprints, blocked items, unassigned tasks, sprint progress.",
    schema: z.object({
      query: z.string().describe("What data do you need from tasks/sprints?"),
      threadId: z
        .string()
        .describe("Current ROXO session thread ID (pass through as-is)"),
    }),
  },
);

/**
 * ask_insights
 * Delegates to insightsAgent.
 */
export const askInsights = tool(
  async ({ query, threadId }: { query: string; threadId: string }) => {
    return invokeSubagent(insightsAgent, "insights", query, threadId);
  },
  {
    name: "ask_insights",
    description:
      "Ask the Insights subagent: project health, deadlines, velocity trends, milestone risk.",
    schema: z.object({
      query: z.string().describe("What insights or risk analysis do you need?"),
      threadId: z
        .string()
        .describe("Current ROXO session thread ID (pass through as-is)"),
    }),
  },
);

/**
 * add_task_to_sprint  — HITL WRITE TOOL
 *
 * Flow:
 *   1. ROXO decides to call this tool with taskId + sprintId + reason
 *   2. interrupt() fires → graph state is saved → SSE stream emits
 *      { __interrupt__: [{ value: { actionRequests: [...] } }] }
 *   3. useStream hook on frontend receives stream.interrupt
 *   4. User sees approve/reject UI
 *   5. User decides → stream.submit(null, { command: { resume: decision } })
 *   6. LangGraph resumes → this tool runs again from the top
 *   7. interrupt() sees the cached resume value → returns it immediately
 *   8. decision check passes → executeAddTaskToSprint writes to DB
 *
 * CRITICAL: executeAddTaskToSprint (the DB write) comes AFTER interrupt().
 * This is the HITL double-execution rule. The code before interrupt()
 * will run twice (once on first call, once on resume) but that's fine
 * because it's just reading the args — no side effects before interrupt().
 */
export const addTaskToSprint = tool(
  async ({
    taskId,
    sprintId,
    reason,
  }: {
    taskId: string;
    sprintId: string;
    reason: string;
  }) => {
    // ── STEP 1: Ask human for approval (pauses graph here) ──────────
    // interrupt() throws GraphInterrupt internally.
    // On resume, it returns the value passed to Command({ resume: ... }).
    const decision = interrupt({
      // This object is what useStream exposes as stream.interrupt.value
      // Structure your payload to drive your approval UI.
      actionRequests: [
        {
          name: "add_task_to_sprint",
          args: { taskId, sprintId, reason },
        },
      ],
    }) as { decisions: Array<{ type: "approve" | "reject" }> };

    // ── STEP 2: Check decision ───────────────────────────────────────
    const verdict = decision?.decisions?.[0]?.type;

    if (verdict === "reject") {
      return `❌ Action rejected by human. Task ${taskId} was NOT added to sprint ${sprintId}.`;
    }

    // ── STEP 3: Execute write (only runs after approval) ─────────────
    return executeAddTaskToSprint(taskId, sprintId, reason);
  },
  {
    name: "add_task_to_sprint",
    description:
      "Add an existing unassigned task to a sprint. REQUIRES human approval before executing. Always gather data first to justify this action.",
    schema: addTaskToSprintSchema,
  },
);

// ─────────────────────────────────────────────────────────────
//  CHECKPOINTER
//  MemorySaver = in-memory. Fine for dev and single-instance.
//  Production: swap for PostgresSaver or RedisSaver.
//  The checkpointer is what enables:
//    - Thread persistence (resume conversation after disconnect)
//    - HITL (state is saved when interrupt() fires)
//    - Time-travel (replay from any checkpoint)
// ─────────────────────────────────────────────────────────────

export const checkpointer = new MemorySaver();

// ─────────────────────────────────────────────────────────────
//  ROXO — Main Orchestration Agent
// ─────────────────────────────────────────────────────────────

export const roxo = createReactAgent({
  llm: roxoModel,
  tools: [askProjectBasics, askInsights, addTaskToSprint],
  checkpointSaver: checkpointer,

  // LangGraph allows injecting the thread_id into the system prompt
  // via the stateModifier. Here we keep it simple with a static prompt.
  // For dynamic prompts (e.g. inject user role), use stateModifier.
  prompt: `You are ROXO, the AI PM agent for Wekraft.

TOOLS AVAILABLE:
- ask_project_basics  → read-only subagent (tasks, sprints, blocked items)
- ask_insights        → read-only subagent (project health, deadline, velocity)
- add_task_to_sprint  → WRITE tool — requires human approval before executing

WORKFLOW:
1. GATHER DATA first — always call subagents before making decisions.
   Pass the current session threadId when calling subagents.
2. ANALYZE what you found — identify risks, blockers, opportunities.
3. ACT only when you have enough context — justify write actions with data.

RULES:
- Never call add_task_to_sprint without first checking tasks and sprint data.
- Always explain your reasoning before suggesting a write action.
- Be concise and data-driven.`,
});

// ─────────────────────────────────────────────────────────────
//  TYPE EXPORTS  (used by the API route for type safety)
// ─────────────────────────────────────────────────────────────

export type RoxoState = {
  messages: Array<{ role: string; content: string; id?: string }>;
};
