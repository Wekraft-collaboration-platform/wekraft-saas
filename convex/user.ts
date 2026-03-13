import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==================================
// NEW USER
// ==================================
export const createNewUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized sorry !");
    }
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (user) {
      return user?._id;
    }

    return await ctx.db.insert("users", {
      name: identity?.name || "",
      clerkToken: identity?.tokenIdentifier!,
      email: identity?.email!,
      githubUsername: identity.nickname ?? undefined,
      accountType: "free",
      hasCompletedOnboarding: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
// ==================================
// GET USER
// ==================================
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    return user ?? null;
  },
});