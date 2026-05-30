import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { CallTracker } from "assert";

export const createSupportQuery = mutation({
  args: {
    title: v.string(),
    reason: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const queryId = await ctx.db.insert("supportQueries", {
      title: args.title,
      reason: args.reason,
      description: args.description,
      createdAt: Date.now(),
      userId: user._id,
    });

    return queryId;
  },
});

// -----------------------------------
// AI Call 
// -----------------------------------
export const getSupportQueriesForUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("supportQueries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// ----------------------------
// AI CALL
// ----------------------------
export const createQueryByAi = mutation({
  args: {
    userId: v.id("users"),
    category: v.string(),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      await ctx.db.insert("supportQueries", {
        title: args.title,
        reason: args.category,
        description: args.description,
        createdAt: Date.now(),
        userId: args.userId,
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create support query";
      return {
        success: false,
        error: errorMessage,
      };
    }
  },
});
