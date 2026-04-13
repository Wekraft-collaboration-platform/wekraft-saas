/**
 * lib/agent/tools.ts
 * ─────────────────────────────────────────────────────────────
 * All LangChain tools backed by the fake DB.
 *
 * GROUPS (maps 1-to-1 with subagents + main agent):
 *   projectBasicsTools  → project-basics-intel subagent  (READ)
 *   insightsTools       → insights-intel subagent         (READ)
 *   writeTools          → ROXO main agent only            (WRITE + HITL)
 *
 * WHY "@langchain/core/tools" not "langchain":
 *   The "langchain" unified package re-exports from @langchain/core,
 *   but tool() from @langchain/core/tools is the canonical source.
 *   Avoid the re-export to keep your dep graph clean and predictable.
 * ─────────────────────────────────────────────────────────────
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// FAKE DATABASE
// In production: swap each db.* block with Prisma / Drizzle /
// Supabase calls. The tool function signatures stay identical.
// ─────────────────────────────────────────────────────────────

export const db = {
  project: {
    name: "WEkraft",
    description: "AI-powered project management platform",
    deadline: "2025-09-01",
    status: "on-track",
    milestones: [
      { name: "MVP Launch", date: "2025-06-15", done: false },
      { name: "Beta Release", date: "2025-07-30", done: false },
    ],
    velocity: { lastSprint: 34, avgSprint: 30, trend: "improving" },
  },
  sprints: [
    {
      id: "SP-5",
      name: "Sprint 5",
      status: "active",
      startDate: "2025-04-07",
      endDate: "2025-04-21",
      goal: "Ship ROXO agent v1 + dashboard redesign",
      storyPoints: { total: 42, completed: 18, remaining: 24 },
    },
    {
      id: "SP-4",
      name: "Sprint 4",
      status: "completed",
      startDate: "2025-03-24",
      endDate: "2025-04-06",
      storyPoints: { total: 38, completed: 34, remaining: 0 },
    },
  ],
  tasks: [
    {
      id: "T-201",
      title: "Build ROXO main agent",
      status: "in-progress",
      assignee: "ali",
      sprintId: "SP-5",
      points: 8,
    },
    {
      id: "T-202",
      title: "Dashboard redesign",
      status: "todo",
      assignee: "sara",
      sprintId: "SP-5",
      points: 5,
    },
    {
      id: "T-203",
      title: "Fix auth bug",
      status: "blocked",
      assignee: null as string | null,
      sprintId: "SP-5",
      points: 3,
    },
    {
      id: "T-204",
      title: "Write API docs",
      status: "todo",
      assignee: null as string | null,
      sprintId: null as string | null,
      points: 2,
    },
  ],
};

// ─────────────────────────────────────────────────────────────
//  GROUP 1 — PROJECT BASICS  (subagent: project-basics-intel)
//  READ ONLY. Blocked/unassigned tasks, sprint progress.
// ─────────────────────────────────────────────────────────────

export const getTasks = tool(
  async ({ sprintId, status }: { sprintId?: string; status?: string }) => {
    let tasks = db.tasks;
    if (sprintId) tasks = tasks.filter((t) => t.sprintId === sprintId);
    if (status) tasks = tasks.filter((t) => t.status === status);
    return JSON.stringify(tasks, null, 2);
  },
  {
    name: "get_tasks",
    description:
      "Fetch tasks. Optionally filter by sprintId (e.g. SP-5) or status (todo | in-progress | blocked | done).",
    schema: z.object({
      sprintId: z.string().optional(),
      status: z.enum(["todo", "in-progress", "blocked", "done"]).optional(),
    }),
  },
);

export const getSprints = tool(
  async () => JSON.stringify(db.sprints, null, 2),
  {
    name: "get_sprints",
    description: "Fetch all sprints — active and completed.",
    schema: z.object({}),
  },
);

// Named array — pass directly to createReactAgent({ tools: projectBasicsTools })
export const projectBasicsTools = [getTasks, getSprints];

// ─────────────────────────────────────────────────────────────
//  GROUP 2 — INSIGHTS  (subagent: insights-intel)
//  READ ONLY. Deadlines, velocity, milestones, risk signals.
// ─────────────────────────────────────────────────────────────

export const getProjectDetails = tool(
  async () => {
    const { name, description, status, milestones } = db.project;
    return JSON.stringify({ name, description, status, milestones }, null, 2);
  },
  {
    name: "get_project_details",
    description:
      "Get project name, description, overall on-track status, and milestone dates.",
    schema: z.object({}),
  },
);

export const getDeadlineVelocity = tool(
  async () => {
    const { deadline, velocity } = db.project;
    return JSON.stringify({ deadline, velocity }, null, 2);
  },
  {
    name: "get_deadline_velocity",
    description:
      "Get project deadline and sprint velocity trend (last sprint points, average, direction).",
    schema: z.object({}),
  },
);

export const insightsTools = [getProjectDetails, getDeadlineVelocity];

// ─────────────────────────────────────────────────────────────
//  GROUP 3 — WRITE  (ROXO main agent only — never subagents)
//
//  IMPORTANT — HITL DOUBLE-EXECUTION RULE:
//  When interrupt() pauses a node and the graph later resumes,
//  LangGraph replays the ENTIRE node from the top. That means
//  the tool function runs again. interrupt() detects the cached
//  resume value and returns it instead of pausing again.
//  Therefore: keep ALL side-effects AFTER the interrupt() call.
//  Do not write to DB before calling interrupt().
// ─────────────────────────────────────────────────────────────

/**
 * Pure write helper — no interrupt here.
 * Called by the tool AFTER the human approves.
 * Separate so it's easily testable in isolation.
 */
export async function executeAddTaskToSprint(
  taskId: string,
  sprintId: string,
  reason: string,
): Promise<string> {
  const task = db.tasks.find((t) => t.id === taskId);
  if (!task) return `Task ${taskId} not found.`;
  if (!db.sprints.find((s) => s.id === sprintId))
    return `Sprint ${sprintId} not found.`;

  task.sprintId = sprintId; // ← your Prisma write goes here
  return `✅ Task "${task.title}" (${taskId}) added to sprint ${sprintId}. Reason: ${reason}`;
}

// Zod schema shared between the tool and the route's type checking
export const addTaskToSprintSchema = z.object({
  taskId: z.string().describe("Task ID e.g. T-204"),
  sprintId: z.string().describe("Sprint ID e.g. SP-5"),
  reason: z.string().describe("Why this task belongs in this sprint"),
});
