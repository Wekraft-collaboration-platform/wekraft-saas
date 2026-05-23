import { internalMutation } from "./_generated/server";

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
      const hasExpired =
        user.cancelAtPeriodEnd === true &&
        user.currentPeriodEnd !== undefined &&
        user.currentPeriodEnd < now;

      if (hasExpired) {
        await ctx.db.patch(user._id, {
          accountType: "free",
          subscriptionStatus: "canceled",
          cancelAtPeriodEnd: false,
          updatedAt: now,
        });
        downgraded++;
        console.log(
          `[Cron] Downgraded user ${user._id} (${user.email}) from ${user.accountType} to free — period ended at ${new Date(user.currentPeriodEnd!).toISOString()}`,
        );
      }
    }

    console.log(`[Cron] downgradeExpiredPlans: checked ${paidUsers.length} paid users, downgraded ${downgraded}`);
    return { checked: paidUsers.length, downgraded };
  },
});
