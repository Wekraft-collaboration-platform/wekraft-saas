import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// Calendar Events mutation by agent
export const insertCalendarEvent = internalMutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("event"), v.literal("milestone")),
    start: v.number(),
    end: v.number(),
    allDay: v.boolean(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error(`Project not found: ${args.projectId}`);

    const now = Date.now();
    const id = await ctx.db.insert("calendarEvents", {
      projectId: args.projectId,
      creatorId: project.ownerId,
      title: args.title,
      description: args.description,
      type: args.type,
      start: args.start,
      end: args.end,
      allDay: args.allDay,
      color: "#3b82f6",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

// Tasks query by agent
export const getProjectTasks = internalQuery({
  args: {
    projectId: v.id("projects"),
    status: v.optional(
      v.union(
        v.literal("not started"),
        v.literal("inprogress"),
        v.literal("reviewing"),
        v.literal("testing"),
        v.literal("completed"),
      ),
    ),
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    ),
    sprintId: v.optional(v.id("sprints")),
  },
  handler: async (ctx, args) => {
    let tasks;

    if (args.status) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_project_status", (q) =>
          q.eq("projectId", args.projectId).eq("status", args.status!),
        )
        .collect();
    } else {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
    }

    // Apply optional in-memory filters
    if (args.priority) {
      tasks = tasks.filter((t) => t.priority === args.priority);
    }
    if (args.sprintId) {
      tasks = tasks.filter((t) => t.sprintId === args.sprintId);
    }

    // Return only the fields the AI needs — keep tokens low
    return tasks.map((t) => ({
      id: t._id,
      title: t.title,
      status: t.status,
      priority: t.priority ?? null,
      assignedTo: (t.assignedTo ?? []).map((a) => a.name), // names only, no avatars
      startDate: t.estimation.startDate,
      endDate: t.estimation.endDate,
      isBlocked: t.isBlocked ?? false,
      sprintId: t.sprintId ?? null,
    }));
  },
});

// Issues query by agent
export const getProjectIssues = internalQuery({
  args: {
    projectId: v.id("projects"),
    status: v.optional(
      v.union(
        v.literal("not opened"),
        v.literal("opened"),
        v.literal("in review"),
        v.literal("reopened"),
        v.literal("closed"),
      ),
    ),
    severity: v.optional(
      v.union(v.literal("critical"), v.literal("medium"), v.literal("low")),
    ),
    environment: v.optional(
      v.union(
        v.literal("local"),
        v.literal("dev"),
        v.literal("staging"),
        v.literal("production"),
      ),
    ),
    sprintId: v.optional(v.id("sprints")),
  },
  handler: async (ctx, args) => {
    let issues;

    // Use indexed query where possible
    if (args.status) {
      issues = await ctx.db
        .query("issues")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .filter((q) => q.eq(q.field("projectId"), args.projectId))
        .collect();
    } else {
      issues = await ctx.db
        .query("issues")
        .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
        .collect();
    }

    // Apply optional in-memory filters
    if (args.severity) {
      issues = issues.filter((i) => i.severity === args.severity);
    }
    if (args.environment) {
      issues = issues.filter((i) => i.environment === args.environment);
    }
    if (args.sprintId) {
      issues = issues.filter((i) => i.sprintId === args.sprintId);
    }

    // Return only the fields the AI needs — keep tokens low
    return issues.map((i) => ({
      id: i._id,
      title: i.title,
      status: i.status,
      severity: i.severity ?? null,
      environment: i.environment ?? null,
      type: i.type, // user-created | task-issue | github
      due_date: i.due_date ?? null,
      taskId: i.taskId ?? null, // linked task if type === "task-issue"
      assignedTo: (i.IssueAssignee ?? []).map((a) => a.name), // names only, no avatars
      sprintId: i.sprintId ?? null,
    }));
  },
});
