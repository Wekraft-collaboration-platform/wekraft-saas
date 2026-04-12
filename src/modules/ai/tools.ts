import "dotenv/config";
import { humanInTheLoopMiddleware, tool } from "langchain";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
//  FAKE DATABASE
// ─────────────────────────────────────────────────────────────────────────────

const fakeDB = {
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
      assignee: null,
      sprintId: "SP-5",
      points: 3,
    },
    {
      id: "T-204",
      title: "Write API docs",
      status: "todo",
      assignee: null,
      sprintId: null,
      points: 2,
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  WRITE TOOL — Add Task to Sprint
// ─────────────────────────────────────────────────────────────────────────────

export const addTaskToSprint = tool(
  async (rawInput: any) => {
    const { taskId, sprintId, reason } =
      typeof rawInput.input === "string"
        ? JSON.parse(rawInput.input)
        : rawInput;

    console.log("WRITE:addTaskToSprint", `Adding ${taskId} → ${sprintId}`);
    const task = fakeDB.tasks.find((t) => t.id === taskId);
    if (!task) return `Task ${taskId} not found.`;
    task.sprintId = sprintId;
    console.log("WRITE:addTaskToSprint", `Task ${taskId} added to ${sprintId}`);
    return `Task "${task.title}" (${taskId}) added to sprint ${sprintId}. Reason: ${reason}`;
  },
  {
    name: "add_task_to_sprint",
    description: "Add an existing task to a sprint. Requires human approval.",
    schema: z.object({
      taskId: z.string().describe("Task ID e.g. T-204"),
      sprintId: z.string().describe("Sprint ID e.g. SP-5"),
      reason: z.string().describe("Why this task belongs in this sprint"),
    }),
  },
);

// ─────────────────────────────────────────────────────────────────────────────
//  SUBAGENT 1 TOOLS — Project Basics (tasks + sprints)
// ─────────────────────────────────────────────────────────────────────────────

// TOOL 1
export const getTasks = tool(
  async ({ sprintId, status }: { sprintId?: string; status?: string }) => {
    console.log(
      "TOOL:getTasks",
      `sprint=${sprintId ?? "all"} status=${status ?? "all"}`,
    );
    let tasks = fakeDB.tasks;
    if (sprintId) tasks = tasks.filter((t) => t.sprintId === sprintId);
    if (status) tasks = tasks.filter((t) => t.status === status);
    return JSON.stringify(tasks, null, 2);
  },
  {
    name: "get_tasks",
    description: "Fetch tasks. Optionally filter by sprintId or status.",
    schema: z.object({
      sprintId: z.string().optional(),
      status: z.string().optional(),
    }),
  },
);

// TOOL 2
export const getSprints = tool(
  async () => {
    console.log("TOOL:getSprints", "Fetching all sprints");
    return JSON.stringify(fakeDB.sprints, null, 2);
  },
  {
    name: "get_sprints",
    description: "Fetch all sprints — active, completed etc.",
    schema: z.object({}),
  },
);

// ─────────────────────────────────────────────────────────────────────────────
//  SUBAGENT 2 TOOLS — Insights (project details + velocity)
// ─────────────────────────────────────────────────────────────────────────────

// TOOL  1
export const getProjectDetails = tool(
  async () => {
    console.log("TOOL:getProjectDetails", "Fetching project details");
    const { name, description, status, milestones } = fakeDB.project;
    return JSON.stringify({ name, description, status, milestones }, null, 2);
  },
  {
    name: "get_project_details",
    description: "Get project name, description, status and milestones.",
    schema: z.object({}),
  },
);

// TOOL 2
export const getDeadlineVelocity = tool(
  async () => {
    console.log("TOOL:getDeadlineVelocity", "Fetching deadline + velocity");
    const { deadline, velocity } = fakeDB.project;
    return JSON.stringify({ deadline, velocity }, null, 2);
  },
  {
    name: "get_deadline_velocity",
    description: "Get project deadline and sprint velocity trend.",
    schema: z.object({}),
  },
);
