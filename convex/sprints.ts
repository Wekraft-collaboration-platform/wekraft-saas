import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// Helper to get authenticated user
async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("clerkToken", identity.tokenIdentifier))
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

export const createSprint = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    goal: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);

    return await ctx.db.insert("sprints", {
      projectId: args.projectId,
      name: args.name,
      goal: args.goal,
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateSprint = mutation({
  args: {
    sprintId: v.id("sprints"),
    name: v.optional(v.string()),
    goal: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(v.union(v.literal("planned"), v.literal("active"), v.literal("completed"))),
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);
    const { sprintId, ...updates } = args;
    
    await ctx.db.patch(sprintId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const startSprint = mutation({
  args: {
    sprintId: v.id("sprints"),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);

    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) throw new Error("Sprint not found");

    // Check if there's already an active sprint for this project
    const activeSprint = await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", sprint.projectId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .unique();

    if (activeSprint) {
      throw new Error("Only one sprint can be active at a time");
    }

    await ctx.db.patch(args.sprintId, {
      status: "active",
      startDate: args.startDate,
      endDate: args.endDate,
      updatedAt: Date.now(),
    });
  },
});

export const completeSprint = mutation({
  args: {
    sprintId: v.id("sprints"),
    moveToBacklog: v.boolean(), // true: move incomplete to backlog, false: move to next planned sprint (if any)
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);

    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) throw new Error("Sprint not found");

    // 1. Mark sprint as completed
    await ctx.db.patch(args.sprintId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    // 2. Find incomplete tasks/issues
    const incompleteTasks = await ctx.db
      .query("tasks")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .filter((q) => q.neq(q.field("status"), "completed"))
      .collect();

    const incompleteIssues = await ctx.db
      .query("issues")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .filter((q) => q.neq(q.field("status"), "closed"))
      .collect();

    // 3. Handle leftover tasks
    let targetSprintId: Id<"sprints"> | undefined = undefined;

    if (!args.moveToBacklog) {
      // Find next planned sprint
      const nextSprint = await ctx.db
        .query("sprints")
        .withIndex("by_project", (q) => q.eq("projectId", sprint.projectId))
        .filter((q) => q.eq(q.field("status"), "planned"))
        .order("asc")
        .first();
      
      if (nextSprint) {
        targetSprintId = nextSprint._id;
      }
    }

    // Move tasks
    for (const task of incompleteTasks) {
      await ctx.db.patch(task._id, {
        sprintId: targetSprintId,
        updatedAt: Date.now(),
      });
    }

    // Move issues
    for (const issue of incompleteIssues) {
      await ctx.db.patch(issue._id, {
        sprintId: targetSprintId,
        updatedAt: Date.now(),
      });
    }
  },
});

export const listSprints = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const getSprintTasks = query({
  args: {
    projectId: v.id("projects"),
    sprintId: v.optional(v.id("sprints")), // undefined means backlog
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("sprintId"), args.sprintId))
      .collect();

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("sprintId"), args.sprintId))
      .collect();

    return { tasks, issues };
  },
});

export const updateTaskSprint = mutation({
  args: {
    taskId: v.optional(v.id("tasks")),
    issueId: v.optional(v.id("issues")),
    sprintId: v.optional(v.id("sprints")), // undefined means move to backlog
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);

    if (args.taskId) {
      await ctx.db.patch(args.taskId, {
        sprintId: args.sprintId,
        updatedAt: Date.now(),
      });
    } else if (args.issueId) {
      await ctx.db.patch(args.issueId, {
        sprintId: args.sprintId,
        updatedAt: Date.now(),
      });
    }
  },
});

export const deleteSprint = mutation({
  args: {
    sprintId: v.id("sprints"),
  },
  handler: async (ctx, args) => {
    await getAuthenticatedUser(ctx);

    // Move any tasks in this sprint to backlog
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .collect();

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .collect();

    for (const task of tasks) {
      await ctx.db.patch(task._id, { sprintId: undefined });
    }

    for (const issue of issues) {
      await ctx.db.patch(issue._id, { sprintId: undefined });
    }

    await ctx.db.delete(args.sprintId);
  },
});
