import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * getMemberWorkload: Returns a detailed breakdown of each team member's current task and issue assignments.
 */
export const getMemberWorkload = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const projectId = args.projectId as Id<"projects">;
    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const taskAssignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const issueAssignees = await ctx.db
      .query("issueAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    return members.map((m) => {
      const memberTasks = tasks.filter((t) =>
        taskAssignees.some((a) => a.taskId === t._id && a.userId === m.userId),
      );

      const memberIssues = issues.filter((i) =>
        issueAssignees.some(
          (a) => a.issueId === i._id && a.userId === m.userId,
        ),
      );

      const activeTasks = memberTasks.filter((t) => t.status !== "completed");
      const activeIssues = memberIssues.filter((i) => i.status !== "closed");

      const completedTasksCount = memberTasks.length - activeTasks.length;
      const closedIssuesCount = memberIssues.length - activeIssues.length;

      return {
        name: m.userName,
        role: m.AccessRole ?? "member",
        activeTasks: activeTasks.slice(0, 8).map((t) => ({
          title: t.title,
          priority: t.priority ?? "low",
          status: t.status,
        })),
        totalActiveTasks: activeTasks.length,
        completedTasksCount,
        activeIssues: activeIssues.slice(0, 8).map((i) => ({
          title: i.title,
          status: i.status,
        })),
        totalActiveIssues: activeIssues.length,
        closedIssuesCount,
      };
    });
  },
});

/**
 * getProjectInsights: Returns basic project timeline information.
 */
export const getProjectInsights = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const projectDetail = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    const deadline = projectDetail?.targetDate ?? null;
    let daysRemaining = null;

    if (deadline) {
      const now = Date.now();
      const diff = deadline - now;
      daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    return {
      projectName: project.projectName,
      createdAt: project.createdAt,
      deadline,
      daysRemaining:
        daysRemaining !== null ? (daysRemaining > 0 ? daysRemaining : 0) : null,
      isOverdue: daysRemaining !== null && daysRemaining < 0,
    };
  },
});

/**
 * getTasksSummary: Returns an AI-optimized summary of tasks, prioritizing active and high-priority ones.
 */
export const getTasksSummary = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const taskAssignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const now = Date.now();
    const NEAR_OVERDUE_THRESHOLD = 2 * 24 * 60 * 60 * 1000; // 2 days

    const criticalTasks = tasks.filter((t) => {
      if (t.status === "completed") return false;

      const isOverdue = now > t.estimation.endDate;
      const isNearOverdue =
        !isOverdue && now > t.estimation.endDate - NEAR_OVERDUE_THRESHOLD;
      const isNotStarted = t.status === "not started";
      const isHighPriority = t.priority === "high";

      return (
        isOverdue ||
        isNearOverdue ||
        isNotStarted ||
        isHighPriority ||
        t.isBlocked
      );
    });

    const completedCount = tasks.filter((t) => t.status === "completed").length;
    const blockedCount = tasks.filter((t) => t.isBlocked).length;

    return {
      criticalAndActiveTasks: criticalTasks.map((t) => {
        const isOverdue = now > t.estimation.endDate;
        const isNearOverdue =
          !isOverdue && now > t.estimation.endDate - NEAR_OVERDUE_THRESHOLD;

        let timelineStatus = "on track";
        if (isOverdue) {
          const days = Math.ceil(
            (now - t.estimation.endDate) / (1000 * 60 * 60 * 24),
          );
          timelineStatus = `OVERDUE by ${days} days`;
        } else if (isNearOverdue) {
          const days = Math.ceil(
            (t.estimation.endDate - now) / (1000 * 60 * 60 * 24),
          );
          timelineStatus = `Near overdue (due in ${days} days)`;
        }

        return {
          title: t.title,
          status: t.status,
          priority: t.priority ?? "medium",
          isBlocked: t.isBlocked ?? false,
          assignees: taskAssignees
            .filter((a) => a.taskId === t._id)
            .map((a) => a.name),
          endDate: new Date(t.estimation.endDate).toLocaleDateString(),
          timelineStatus,
        };
      }),
      completedCount,
      blockedCount,
      totalCount: tasks.length,
    };
  },
});

/**
 * getIssuesSummary: Returns an AI-optimized summary of issues, prioritizing critical and open ones.
 */
export const getIssuesSummary = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const issueAssignees = await ctx.db
      .query("issueAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const openIssues = issues.filter((i) => i.status !== "closed");
    const closedCount = issues.filter((i) => i.status === "closed").length;
    const criticalCount = issues.filter(
      (i) => i.severity === "critical" && i.status !== "closed",
    ).length;

    return {
      activeIssues: openIssues.map((i) => ({
        title: i.title,
        status: i.status,
        severity: i.severity ?? "medium",
        type: i.type,
        assignees: issueAssignees
          .filter((a) => a.issueId === i._id)
          .map((a) => a.name),
      })),
      closedCount,
      criticalCount,
      totalCount: issues.length,
    };
  },
});

/**
 * Tool 5 — getProjectVelocity
 *
 * Calculates project throughput (velocity) using `finalCompletedAt` timestamps
 * on tasks and issues. Returns weekly completion rates, average cycle time
 * (createdAt → finalCompletedAt), and a rolling 4-week trend so Kaya can
 * reason about whether the team is speeding up or slowing down.
 */
export const getProjectVelocity = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const MS_PER_WEEK = 7 * MS_PER_DAY;
    const WEEKS_BACK = 4;

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const allIssues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const doneTasks = allTasks.filter(
      (t) => t.status === "completed" && t.finalCompletedAt,
    );
    const doneIssues = allIssues.filter(
      (i) => i.status === "closed" && i.finalCompletedAt,
    );

    // --- Weekly buckets (last 4 weeks, oldest first) ---
    const weeklyVelocity = Array.from({ length: WEEKS_BACK }, (_, idx) => {
      const weekEnd = now - idx * MS_PER_WEEK;
      const weekStart = weekEnd - MS_PER_WEEK;
      const weekLabel = `Week -${idx + 1}`;

      const tasksCompleted = doneTasks.filter(
        (t) => t.finalCompletedAt! >= weekStart && t.finalCompletedAt! < weekEnd,
      ).length;

      const issuesResolved = doneIssues.filter(
        (i) => i.finalCompletedAt! >= weekStart && i.finalCompletedAt! < weekEnd,
      ).length;

      return { weekLabel, tasksCompleted, issuesResolved, total: tasksCompleted + issuesResolved };
    }).reverse();

    // --- Average cycle time (createdAt → finalCompletedAt) ---
    const avg = (arr: number[]) =>
      arr.length > 0
        ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10
        : null;

    const avgCycleTimeDays = {
      tasks: avg(
        doneTasks
          .map((t) => (t.finalCompletedAt! - t.createdAt) / MS_PER_DAY)
          .filter((d) => d > 0),
      ),
      issues: avg(
        doneIssues
          .map((i) => (i.finalCompletedAt! - i.createdAt) / MS_PER_DAY)
          .filter((d) => d > 0),
      ),
    };

    // --- Trend: first 2 weeks vs last 2 weeks ---
    let trend: "improving" | "stable" | "declining" | "insufficient_data" =
      "insufficient_data";
    if (weeklyVelocity.length === 4) {
      const firstHalf = weeklyVelocity[0].total + weeklyVelocity[1].total;
      const secondHalf = weeklyVelocity[2].total + weeklyVelocity[3].total;
      if (secondHalf > firstHalf * 1.15) trend = "improving";
      else if (secondHalf < firstHalf * 0.85) trend = "declining";
      else if (firstHalf + secondHalf > 0) trend = "stable";
    }

    const thisWeek = weeklyVelocity[weeklyVelocity.length - 1];
    const summary =
      `Last 4 weeks throughput: ${weeklyVelocity.map((w) => w.total).join(", ")} items/week. ` +
      `This week: ${thisWeek.total} (${thisWeek.tasksCompleted} tasks, ${thisWeek.issuesResolved} issues). ` +
      `Avg task cycle: ${avgCycleTimeDays.tasks ?? "N/A"} days. ` +
      `Avg issue cycle: ${avgCycleTimeDays.issues ?? "N/A"} days. ` +
      `Trend: ${trend}.`;

    return {
      trend,
      avgCycleTimeDays,
      totalCompleted: doneTasks.length + doneIssues.length,
      summary,
    };
  },
});

/**
 * Tool 6 — getSprintHistory
 *
 * Returns all sprints (completed → active → planned) with enriched signals.
 */
export const getSprintHistory = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const sprints = await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const statusOrder: Record<string, number> = { completed: 0, active: 1, planned: 2 };
    sprints.sort(
      (a, b) =>
        statusOrder[a.status] - statusOrder[b.status] ||
        a.duration.startDate - b.duration.startDate,
    );

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const allIssues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Resolve creator names in one pass
    const creatorIds = [...new Set(sprints.map((s) => s.creatorId))];
    const creatorMap: Record<string, string> = {};
    await Promise.all(
      creatorIds.map(async (id) => {
        const user = await ctx.db.get(id);
        if (user) creatorMap[id as string] = user.name ?? user.githubUsername ?? "Unknown";
      }),
    );

    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    // Keep last 6 completed (most recent) + active sprint only; skip empty planned
    const completed = sprints
      .filter((s) => s.status === "completed")
      .slice(-6);
    const active = sprints.filter((s) => s.status === "active");
    const relevant = [...completed, ...active];

    return relevant.map((s) => {
      let completedTasks: number;
      let totalTasks: number;
      let closedIssues: number;
      let totalIssues: number;

      if (s.status === "completed" && s.finalStats) {
        completedTasks = s.finalStats.completedTasks;
        totalTasks = s.finalStats.totalTasks;
        closedIssues = s.finalStats.closedIssues;
        totalIssues = s.finalStats.totalIssues;
      } else {
        const sprintTasks = allTasks.filter((t) => t.sprintId === s._id);
        const sprintIssues = allIssues.filter((i) => i.sprintId === s._id);
        completedTasks = sprintTasks.filter((t) => t.status === "completed").length;
        totalTasks = sprintTasks.length;
        closedIssues = sprintIssues.filter((i) => i.status === "closed").length;
        totalIssues = sprintIssues.length;
      }

      const totalItems = totalTasks + totalIssues;
      const doneItems = completedTasks + closedIssues;
      const completionRate =
        totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : null;

      const durationDays = Math.round(
        (s.duration.endDate - s.duration.startDate) / MS_PER_DAY,
      );

      // Truncate long goals so they don't bloat the prompt
      const goal =
        s.sprintGoal.length > 100
          ? s.sprintGoal.slice(0, 100) + "…"
          : s.sprintGoal;

      return {
        name: s.sprintName,
        goal,
        status: s.status,
        createdBy: creatorMap[s.creatorId as string] ?? "Unknown",
        durationDays,
        stats: { completedTasks, totalTasks, closedIssues, totalIssues },
        completionRate,
      };
    });
  },
});
