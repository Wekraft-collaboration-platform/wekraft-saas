import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helper to get the current authenticated user
 */
async function getAuthUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) =>
      q.eq("clerkToken", identity.tokenIdentifier),
    )
    .unique();
}

// ==========================================
// QUERIES
// ==========================================

export const getSprintsByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const getActiveSprint = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sprints")
      .withIndex("by_project_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "active"),
      )
      .unique();
  },
});

// ==========================================
// MUTATIONS
// ==========================================

export const createSprint = mutation({
  args: {
    projectId: v.id("projects"),
    sprintName: v.string(),
    sprintGoal: v.string(),
    duration: v.object({
      startDate: v.number(),
      endDate: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    return await ctx.db.insert("sprints", {
      projectId: args.projectId,
      creatorId: user._id,
      sprintName: args.sprintName,
      sprintGoal: args.sprintGoal,
      duration: args.duration,
      status: "planned",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateSprint = mutation({
  args: {
    sprintId: v.id("sprints"),
    sprintName: v.optional(v.string()),
    sprintGoal: v.optional(v.string()),
    duration: v.optional(
      v.object({
        startDate: v.number(),
        endDate: v.number(),
      }),
    ),
    status: v.optional(
      v.union(
        v.literal("planned"),
        v.literal("active"),
        v.literal("completed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) throw new Error("Sprint not found");

    // "Once sprint started - they cant edit (only owner can)"
    if (sprint.status === "active" && sprint.creatorId !== user._id) {
      throw new Error("Only the sprint creator can edit an active sprint.");
    }

    const { sprintId, ...patch } = args;
    await ctx.db.patch(sprintId, {
      ...patch,
      updatedAt: Date.now(),
    });
  },
});

/**
 * One-tap assignment logic for Tasks
 */
export const assignTaskToSprint = mutation({
  args: {
    taskId: v.id("tasks"),
    sprintId: v.optional(v.id("sprints")), // null means move back to backlog
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // If task is already in a sprint, check if that sprint is active and if the user is the owner
    if (task.sprintId) {
      const sprint = await ctx.db.get(task.sprintId);
      if (sprint?.status === "active" && sprint.creatorId !== user._id) {
        throw new Error(
          "Cannot move tasks out of an active sprint unless you are the owner.",
        );
      }
    }

    await ctx.db.patch(args.taskId, {
      sprintId: args.sprintId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * One-tap assignment logic for Issues
 */
export const assignIssueToSprint = mutation({
  args: {
    issueId: v.id("issues"),
    sprintId: v.optional(v.id("sprints")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    if (issue.sprintId) {
      const sprint = await ctx.db.get(issue.sprintId);
      if (sprint?.status === "active" && sprint.creatorId !== user._id) {
        throw new Error(
          "Cannot move issues out of an active sprint unless you are the owner.",
        );
      }
    }

    await ctx.db.patch(args.issueId, {
      sprintId: args.sprintId,
      updatedAt: Date.now(),
    });
  },
});
