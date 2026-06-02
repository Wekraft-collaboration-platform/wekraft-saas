import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Cron job: runs daily to auto-downgrade users whose paid plan period has expired.
 * This is the safety net for when webhooks are missed or delayed.
 */
export const downgradeExpiredPlans = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // Collect all paid-tier users (plus + pro)
    const plusUsers = await ctx.db
      .query("users")
      .withIndex("by_accountType", (q) => q.eq("accountType", "plus"))
      .collect();

    const proUsers = await ctx.db
      .query("users")
      .withIndex("by_accountType", (q) => q.eq("accountType", "pro"))
      .collect();

    const paidUsers = [...plusUsers, ...proUsers];
    let downgraded = 0;

    for (const user of paidUsers) {
      const hasExpiredSubscription =
        user.cancelAtPeriodEnd === true &&
        user.currentPeriodEnd !== undefined &&
        user.currentPeriodEnd < now;

      const hasExpiredTemporaryPlan =
        user.planExpiry !== undefined &&
        user.planExpiry !== null &&
        user.planExpiry < now;

      if (hasExpiredSubscription || hasExpiredTemporaryPlan) {
        await ctx.db.patch(user._id, {
          accountType: "free",
          subscriptionStatus: hasExpiredSubscription ? "canceled" : undefined,
          cancelAtPeriodEnd: false,
          planExpiry: null,
          updatedAt: now,
        });
        downgraded++;
        console.log(
          `[Cron] Downgraded user ${user._id} (${user.email}) from ${user.accountType} to free — expired plan/subscription`,
        );
      }
    }

    console.log(`[Cron] downgradeExpiredPlans: checked ${paidUsers.length} paid users, downgraded ${downgraded}`);
    return { checked: paidUsers.length, downgraded };
  },
});

export const downgradeUserByIdInternal = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const now = Date.now();
    const hasExpiredTemporaryPlan =
      user.planExpiry !== undefined &&
      user.planExpiry !== null &&
      user.planExpiry < now + 5000;

    if (hasExpiredTemporaryPlan) {
      await ctx.db.patch(user._id, {
        accountType: "free",
        planExpiry: null,
        updatedAt: now,
      });
      console.log(
        `[Scheduler] Downgraded user ${user._id} (${user.email}) to free — expired trial`,
      );
    }
  },
});
