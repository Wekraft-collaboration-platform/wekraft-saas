import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.string(), // Custom tags
    priority: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    assignedTo: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          name: v.string(),
          avatar: v.optional(v.string()),
        }),
      ),
    ),
    status: v.union(
      v.literal("not started"),
      v.literal("inprogress"),
      v.literal("issue"),
      v.literal("reviewing"),
      v.literal("testing"),
      v.literal("completed"),
    ),
    estimation: v.object({
      startDate: v.number(),
      endDate: v.number(),
    }),
    linkWithCodebase: v.optional(v.string()),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) throw new Error("User not found");

    const taskId = await ctx.db.insert("tasks", {
      ...args,
      createdByUserId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return taskId;
  },
});

// ---------------------------------------
export const getTasks = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// --------------------------------------------
export const getTimelineTasks = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.neq(q.field("status"), "issue"))
      .collect();

    return tasks;
  },
});
