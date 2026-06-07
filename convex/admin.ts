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

    // 6. Chronological cumulative user growth trend
    const sortedUsers = [...allUsers].sort((a, b) => a.createdAt - b.createdAt);
    const dailyGrowth: { date: string; timestamp: number }[] = [];
    for (const u of sortedUsers) {
      const dateStr = new Date(u.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dailyGrowth.push({ date: dateStr, timestamp: u.createdAt });
    }

    const dateMap = new Map<string, number>();
    for (const item of dailyGrowth) {
      dateMap.set(item.date, (dateMap.get(item.date) || 0) + 1);
    }

    const chartData: { date: string; count: number }[] = [];
    let cumulative = 0;
    const uniqueDates = Array.from(new Set(dailyGrowth.map(d => d.date)));
    for (const d of uniqueDates) {
      cumulative += dateMap.get(d) || 0;
      chartData.push({ date: d, count: cumulative });
    }

    const trendData = chartData;

    // 7. Weekly growth trend (new signups per week)
    const weeklyMap = new Map<string, number>();
    for (const u of sortedUsers) {
      const date = new Date(u.createdAt);
      const day = date.getDay();
      const diff = date.getDate() - day; // Go to Sunday of that week
      const sunday = new Date(date.setDate(diff));
      sunday.setHours(0, 0, 0, 0);
      
      const weekStr = sunday.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      weeklyMap.set(weekStr, (weeklyMap.get(weekStr) || 0) + 1);
    }

    const weeklyData: { week: string; count: number }[] = [];
    const seenWeeks = new Set();
    for (const u of sortedUsers) {
      const date = new Date(u.createdAt);
      const day = date.getDay();
      const diff = date.getDate() - day;
      const sunday = new Date(date.setDate(diff));
      sunday.setHours(0, 0, 0, 0);
      const weekStr = sunday.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!seenWeeks.has(weekStr)) {
        seenWeeks.add(weekStr);
        weeklyData.push({
          week: weekStr,
          count: weeklyMap.get(weekStr) || 0,
        });
      }
    }
    const weeklyGrowthData = weeklyData.slice(-12); // Last 12 weeks

    // 8. Recent 10 users (newest first)
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

    // 9. Recent support queries (enriched with submitter info)
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

    // 10. Advanced stats
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
      trend: trendData,
      weeklyGrowth: weeklyGrowthData,
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
