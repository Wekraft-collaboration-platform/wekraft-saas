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

// returns: project deadline, all sprint names, count of incomplete unassigned tasks, and duration to deadline.
export const getSprintPlannerContext = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error(`Project not found: ${args.projectId}`);

    // Get project details for the targetDate (deadline)
    const projectDetail = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    const projectDeadline = projectDetail?.targetDate ?? null;

    // Get all sprints for the project
    const sprints = await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Get tasks to count unassigned and incomplete ones
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const sprintTitles = sprints.map((s) => s.sprintName);

    // Count tasks that are NOT completed AND have NO sprintId
    const unassignedTasksCount = tasks.filter(
      (t) => t.status !== "completed" && !t.sprintId,
    ).length;

    // Calculate duration from today to deadline
    let daysToDeadline = null;
    if (projectDeadline) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffTime = projectDeadline - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysToDeadline =
        diffDays > 0
          ? `${diffDays} days`
          : diffDays === 0
            ? "0 days (today)"
            : "past due";
    }

    return {
      projectDeadline,
      daysToDeadline,
      sprintTitles,
      unassignedTasksCount,
    };
  },
});

// create_sprint: agent will call to create with sprint name, sprint goal and duration as start date and end date and return sprint created id.
export const createSprint = internalMutation({
  args: {
    projectId: v.id("projects"),
    sprintName: v.string(),
    sprintGoal: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error(`Project not found: ${args.projectId}`);

    const now = Date.now();
    const id = await ctx.db.insert("sprints", {
      projectId: args.projectId,
      creatorId: project.ownerId,
      sprintName: args.sprintName,
      sprintGoal: args.sprintGoal,
      duration: { startDate: args.startDate, endDate: args.endDate },
      status: "planned",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

// add_items_to_sprint : tasks id assigned to the sprint id.
export const addItemsToSprint = internalMutation({
  args: {
    sprintId: v.id("sprints"),
    taskIds: v.array(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) throw new Error(`Sprint not found: ${args.sprintId}`);

    for (const taskId of args.taskIds) {
      const task = await ctx.db.get(taskId);
      if (!task) throw new Error(`Task not found: ${taskId}`);

      await ctx.db.patch(taskId, {
        sprintId: args.sprintId,
        updatedAt: Date.now(),
      });
    }

    return "Tasks added to sprint successfully";
  },
});
