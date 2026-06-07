import { query } from "./_generated/server";

const ADMIN_EMAILS = new Set([
  "ronitrai1237@gmail.com",
  "raironit127@gmail.com",
  "ssaiet.ritesh@gmail.com",
]);

async function verifyIsAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthorized: No active session");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) =>
      q.eq("clerkToken", identity.tokenIdentifier)
    )
    .unique();

  if (!user) {
    throw new Error("Unauthorized: User not found");
  }

  const isEmailAdmin = user.email ? ADMIN_EMAILS.has(user.email) : false;
  const isDbAdmin = user.isAdmin === true;

  if (!isDbAdmin || !isEmailAdmin) {
    throw new Error("Unauthorized: Access denied");
  }
  return user;
}

export const checkIsAdmin = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { isAdmin: false, reason: "No active session" };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier)
      )
      .unique();

    if (!user) {
      return { isAdmin: false, reason: "User not found in database" };
    }

    const isEmailAdmin = user.email ? ADMIN_EMAILS.has(user.email) : false;
    const isDbAdmin = user.isAdmin === true;

    if (isDbAdmin && isEmailAdmin) {
      return { isAdmin: true };
    }

    return { isAdmin: false, reason: "Access denied" };
  },
});

export const getAdminDashboardData = query({
  handler: async (ctx) => {
    // 1. Verify admin permissions
    await verifyIsAdmin(ctx);

    // 2. Fetch all users
    const allUsers = await ctx.db.query("users").collect();
    const totalUsers = allUsers.length;

    // 3. Plans breakdown
    let freeCount = 0;
    let plusCount = 0;
    let proCount = 0;

    // 4. Onboarding stats
    let completedGettingStartedCount = 0;
    let completedOnboardingCount = 0;

    for (const u of allUsers) {
      if (u.accountType === "pro") proCount++;
      else if (u.accountType === "plus") plusCount++;
      else freeCount++;

      if (u.gettingstartedcompleted) completedGettingStartedCount++;
      if (u.hasCompletedOnboarding) completedOnboardingCount++;
    }

    // 5. Total support queries count
    const rawQueries = await ctx.db.query("supportQueries").collect();
    const totalQueries = rawQueries.length;

    // 6. Chronological user growth and onboarding stats aggregated into 24h, 7d, and 30d timeframes
    const nowMs = Date.now();

    const generateHourlyBuckets = () => {
      const list = [];
      const now = new Date(nowMs);
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        d.setMinutes(0, 0, 0);
        list.push(d);
      }
      return list;
    };

    const generateDailyBuckets = (daysCount: number) => {
      const list = [];
      const now = new Date(nowMs);
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        d.setHours(0, 0, 0, 0);
        list.push(d);
      }
      return list;
    };

    const sortedUsers = [...allUsers].sort((a, b) => a.createdAt - b.createdAt);

    // 24h Aggregation (hourly)
    const buckets24h = generateHourlyBuckets();
    const data24h = buckets24h.map((bStart) => {
      const startMs = bStart.getTime();
      const endMs = startMs + 60 * 60 * 1000;

      const signups = sortedUsers.filter(u => u.createdAt >= startMs && u.createdAt < endMs).length;
      const onboarded = sortedUsers.filter(u => {
        if (!u.hasCompletedOnboarding) return false;
        const onboardingTime = u.updatedAt || u.createdAt;
        return onboardingTime >= startMs && onboardingTime < endMs;
      }).length;

      return {
        label: bStart.toLocaleTimeString("en-US", {
          hour: "numeric",
          hour12: true,
        }),
        signups,
        onboarded,
        cumulative: 0,
      };
    });

    let cum24h = sortedUsers.filter(u => u.createdAt < buckets24h[0].getTime()).length;
    for (const item of data24h) {
      cum24h += item.signups;
      item.cumulative = cum24h;
    }

    // 7d Aggregation (daily)
    const buckets7d = generateDailyBuckets(7);
    const data7d = buckets7d.map((bStart) => {
      const startMs = bStart.getTime();
      const endMs = startMs + 24 * 60 * 60 * 1000;

      const signups = sortedUsers.filter(u => u.createdAt >= startMs && u.createdAt < endMs).length;
      const onboarded = sortedUsers.filter(u => {
        if (!u.hasCompletedOnboarding) return false;
        const onboardingTime = u.updatedAt || u.createdAt;
        return onboardingTime >= startMs && onboardingTime < endMs;
      }).length;

      return {
        label: bStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        signups,
        onboarded,
        cumulative: 0,
      };
    });

    let cum7d = sortedUsers.filter(u => u.createdAt < buckets7d[0].getTime()).length;
    for (const item of data7d) {
      cum7d += item.signups;
      item.cumulative = cum7d;
    }

    // 30d Aggregation (daily)
    const buckets30d = generateDailyBuckets(30);
    const data30d = buckets30d.map((bStart) => {
      const startMs = bStart.getTime();
      const endMs = startMs + 24 * 60 * 60 * 1000;

      const signups = sortedUsers.filter(u => u.createdAt >= startMs && u.createdAt < endMs).length;
      const onboarded = sortedUsers.filter(u => {
        if (!u.hasCompletedOnboarding) return false;
        const onboardingTime = u.updatedAt || u.createdAt;
        return onboardingTime >= startMs && onboardingTime < endMs;
      }).length;

      return {
        label: bStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        signups,
        onboarded,
        cumulative: 0,
      };
    });

    let cum30d = sortedUsers.filter(u => u.createdAt < buckets30d[0].getTime()).length;
    for (const item of data30d) {
      cum30d += item.signups;
      item.cumulative = cum30d;
    }

    // 7. Recent 10 users (newest first)
    const recentUsers = sortedUsers
      .reverse()
      .slice(0, 10)
      .map(u => ({
        _id: u._id,
        name: u.name || "Unknown",
        email: u.email,
        avatarUrl: u.avatarUrl,
        accountType: u.accountType,
        createdAt: u.createdAt,
        hasCompletedOnboarding: u.hasCompletedOnboarding,
      }));

    // 8. Recent support queries (enriched with submitter info)
    rawQueries.sort((a, b) => b.createdAt - a.createdAt);

    const recentQueries = [];
    for (const q of rawQueries.slice(0, 20)) {
      const u = await ctx.db.get(q.userId);
      recentQueries.push({
        _id: q._id,
        title: q.title,
        reason: q.reason,
        description: q.description,
        createdAt: q.createdAt,
        userName: u?.name || "Unknown",
        userEmail: u?.email || "Unknown",
        userAvatar: u?.avatarUrl || null,
      });
    }

    // 9. Advanced stats
    const allDetails = await ctx.db.query("userDetails").collect();
    
    // heardFrom frequencies
    const heardFromMap = new Map<string, number>();
    for (const u of allUsers) {
      if (u.heardFrom) {
        const source = u.heardFrom.trim();
        heardFromMap.set(source, (heardFromMap.get(source) || 0) + 1);
      }
    }
    const heardFromStats = Array.from(heardFromMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // freeTrialUsed counts
    let trialUsedCount = 0;
    let trialNotUsedCount = 0;
    for (const d of allDetails) {
      if (d.freeTrialUsed) trialUsedCount++;
      else trialNotUsedCount++;
    }

    // referalUsing statistics
    let totalWithReferral = 0;
    for (const d of allDetails) {
      if (d.referalUsing) {
        totalWithReferral++;
      }
    }

    // Tutorial view counts
    let taskTutorialCount = 0;
    let issueTutorialCount = 0;
    let sprintTutorialCount = 0;
    let timeLogsTutorialCount = 0;

    for (const d of allDetails) {
      if (d.taskTutorialSeen === true) taskTutorialCount++;
      if (d.issueTutorialSeen === true) issueTutorialCount++;
      if (d.sprintTutorialSeen === true) sprintTutorialCount++;
      if (d.timeLogsTutorialSeen === true) timeLogsTutorialCount++;
    }

    return {
      stats: {
        totalUsers,
        freeUsers: freeCount,
        plusUsers: plusCount,
        proUsers: proCount,
        completedGettingStarted: completedGettingStartedCount,
        completedOnboarding: completedOnboardingCount,
        totalQueries,
      },
      timeframeCharts: {
        "24h": data24h,
        "7d": data7d,
        "30d": data30d,
      },
      recentUsers,
      queries: recentQueries,
      advanced: {
        heardFrom: heardFromStats,
        freeTrial: {
          used: trialUsedCount,
          unused: trialNotUsedCount,
        },
        referrals: {
          totalUsed: totalWithReferral,
        },
        tutorials: {
          task: taskTutorialCount,
          issue: issueTutorialCount,
          sprint: sprintTutorialCount,
          timeLogs: timeLogsTutorialCount,
        },
      },
    };
  },
});
