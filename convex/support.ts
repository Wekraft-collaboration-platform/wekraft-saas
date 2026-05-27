import { mutation } from "./_generated/server";
import { v } from "convex/values";

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
