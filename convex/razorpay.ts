import { mutation, query } from "./_generated/server";
import { v } from "convex/values";


export const updatePlanServerSide = mutation({
  args: {
    backendSecret: v.string(),
    userId: v.id("users"),
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
    await ctx.db.patch(args.userId, {
      accountType: args.plan,
      subscriptionId: args.subscriptionId,
      customerId: args.customerId,
      subscriptionStatus: args.status,
      subscriptionProvider: "razorpay",
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
    status: v.string(),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate secret
    const secret = process.env.BACKEND_SECRET;
    if (!secret || args.backendSecret !== secret) {
      throw new Error("Unauthorized backend request");
    }

    // Find the user with this subscriptionId
    const user = await ctx.db
      .query("users")
      .withIndex("by_subscriptionId", (q) => q.eq("subscriptionId", args.subscriptionId))
      .first();

    if (!user) {
      // In Razorpay we don't always save the subscriptionId until verification.
      // If it's a renewal, it should already be there.
      console.error(`[Razorpay Webhook] User not found for subscriptionId: ${args.subscriptionId}`);
      return { success: false, error: "User not found" };
    }

    let newPlan = user.accountType;
    if (args.status === "cancelled" || args.status === "halted") {
      newPlan = "free";
    }

    const patchPayload: any = {
      accountType: newPlan,
      subscriptionStatus: args.status,
      updatedAt: Date.now(),
    };

    if (args.currentPeriodEnd !== undefined) {
      patchPayload.currentPeriodEnd = args.currentPeriodEnd;
    }

    if (args.cancelAtPeriodEnd !== undefined) {
      patchPayload.cancelAtPeriodEnd = args.cancelAtPeriodEnd;
    }

    await ctx.db.patch(user._id, patchPayload);

    return { success: true };
  },
});

/**
 * Server-only: verifies that a given subscriptionId belongs to the authenticated Clerk user.
 * Used by the cancel API route to prevent one user from cancelling another user's subscription.
 */
export const verifySubscriptionOwner = query({
  args: {
    backendSecret: v.string(),
    subscriptionId: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const secret = process.env.BACKEND_SECRET;
    if (!secret || args.backendSecret !== secret) {
      throw new Error("Unauthorized backend request");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_subscriptionId", (q) => q.eq("subscriptionId", args.subscriptionId))
      .first();

    if (!user) return false;

    // clerkToken is stored as "https://clerk-domain|user_xxx" — match the Clerk user ID suffix
    return (
      user.clerkToken === args.clerkUserId ||
      user.clerkToken.endsWith(`|${args.clerkUserId}`)
    );
  },
});
