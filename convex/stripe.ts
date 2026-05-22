import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
    // We get userId as string from Stripe webhook, we need to cast it
    const normalizedUserId = ctx.db.normalizeId("users", args.userId);
    if (!normalizedUserId) {
      throw new Error("Invalid user ID");
    }

    await ctx.db.patch(normalizedUserId, {
      accountType: args.plan,
      subscriptionId: args.subscriptionId,
      customerId: args.customerId,
      subscriptionStatus: args.status,
      subscriptionProvider: "stripe",
      currentPeriodEnd: args.currentPeriodEnd,
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

    // Find the user with this customerId or subscriptionId
    const user = await ctx.db
      .query("users")
      .withIndex("by_customerId", (q) => q.eq("customerId", args.customerId))
      .first();

    if (!user) {
      console.error(`[Stripe Webhook] User not found for customerId: ${args.customerId}`);
      return { success: false, error: "User not found" };
    }

    // Determine plan type. If canceled, they usually drop to free at the end of the period
    // but here we just update status and let them stay "pro" or "plus" until `currentPeriodEnd`.
    // In actual implementation, a cron job or a check on the `accountType` would downgrade them 
    // when `currentPeriodEnd` is reached.

    // For now, if status is "canceled" or "past_due" and currentPeriodEnd is in the past, downgrade them immediately.
    let newPlan = user.accountType;
    if (args.status === "canceled" || args.status === "unpaid") {
      newPlan = "free";
    }

    await ctx.db.patch(user._id, {
      accountType: newPlan,
      subscriptionStatus: args.status,
      currentPeriodEnd: args.currentPeriodEnd,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

