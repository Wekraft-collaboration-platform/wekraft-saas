import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const updatePlanServerSide = mutation({
  args: {
    backendSecret: v.string(),
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("plus"), v.literal("pro")),
    subscriptionId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Validate secret
    const secret = process.env.BACKEND_SECRET;
    if (!secret || args.backendSecret !== secret) {
      throw new Error("Unauthorized backend request");
    }

    // Update user plan
    const normalizedUserId = ctx.db.normalizeId("users", args.userId);
    if (!normalizedUserId) {
      throw new Error("Invalid user ID");
    }

    const user = await ctx.db.get(normalizedUserId);
    
    // Only upgrade the plan if the subscription is active or in trial (or similar active status in Lemon Squeezy)
    let newPlan = args.plan;
    if (args.status !== "active" && args.status !== "on_trial" && args.status !== "trialing") {
      newPlan = user?.accountType || "free";
    }

    await ctx.db.patch(normalizedUserId, {
      accountType: newPlan,
      subscriptionId: args.subscriptionId,
      customerId: args.customerId,
      subscriptionStatus: args.status,
      subscriptionProvider: "lemonsqueezy",
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: false, // Reset this so the UI doesn't think the new plan is cancelling
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const handleSubscriptionUpdate = mutation({
  args: {
    backendSecret: v.string(),
    subscriptionId: v.string(),
    customerId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Validate secret
    const secret = process.env.BACKEND_SECRET;
    if (!secret || args.backendSecret !== secret) {
      throw new Error("Unauthorized backend request");
    }

    // Find the user with this subscriptionId or customerId
    let user = await ctx.db
      .query("users")
      .withIndex("by_subscriptionId", (q) => q.eq("subscriptionId", args.subscriptionId))
      .first();

    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
        .first();
    }

    if (!user) {
      throw new Error(`[Lemon Squeezy Webhook] User not found for customerId: ${args.customerId} or subscriptionId: ${args.subscriptionId}`);
    }

    // Determine plan type. If canceled/expired, they drop to free.
    let newPlan = user.accountType;
    if (args.status === "cancelled" || args.status === "expired" || args.status === "unpaid") {
      newPlan = "free";
    }

    await ctx.db.patch(user._id, {
      accountType: newPlan,
      subscriptionStatus: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Server-only: verifies that a given Lemon Squeezy customerId belongs to the authenticated Clerk user.
 * Used by the billing portal route to prevent one user from accessing another user's billing portal.
 */
export const verifyCustomerOwner = query({
  args: {
    backendSecret: v.string(),
    customerId: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const secret = process.env.BACKEND_SECRET;
    if (!secret || args.backendSecret !== secret) {
      throw new Error("Unauthorized backend request");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .first();

    if (!user) return false;

    // clerkToken is stored as "https://clerk-domain|user_xxx" — match the Clerk user ID suffix
    return (
      user.clerkToken === args.clerkUserId ||
      user.clerkToken.endsWith(`|${args.clerkUserId}`)
    );
  },
});
