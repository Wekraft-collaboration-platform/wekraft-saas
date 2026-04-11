import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// =============================
// Helper: Get Authenticated User
// =============================
async function getAuthenticatedUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) => q.eq("clerkToken", identity.tokenIdentifier))
    .unique();

  if (!user) throw new Error("User not found");
  return user;
}

// =============================
// 1. ISSUE COMMENTS
// =============================
export const createIssueComment = mutation({
  args: {
    issueId: v.id("issues"),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("issueComments", {
      issueId: args.issueId,
      userId: user._id,
      userName: user.name || "Anonymous",
      userImage: user.avatarUrl,
      comment: args.comment,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getIssueComments = query({
  args: {
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("issueComments")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .order("desc")
      .collect();
  },
});

// =============================
// 2. TASK COMMENTS
// =============================
export const createTaskComment = mutation({
  args: {
    taskId: v.id("tasks"),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("taskComments", {
      taskId: args.taskId,
      userId: user._id,
      userName: user.name || "Anonymous",
      userImage: user.avatarUrl,
      comment: args.comment,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getTaskComments = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("taskComments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .collect();
  },
});

// =============================
// 3. SPRINT COMMENTS
// =============================
export const createSprintComment = mutation({
  args: {
    sprintId: v.id("sprints"),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    return await ctx.db.insert("sprintComments", {
      sprintId: args.sprintId,
      userId: user._id,
      userName: user.name || "Anonymous",
      userImage: user.avatarUrl,
      comment: args.comment,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getSprintComments = query({
  args: {
    sprintId: v.id("sprints"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sprintComments")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .order("desc")
      .collect();
  },
});
