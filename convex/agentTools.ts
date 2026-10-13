import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// Calendar Events mutation by agent
export const insertCalendarEvent = internalMutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("event"), v.literal("milestone")),
    start: v.number(),
    end: v.number(),
    allDay: v.boolean(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error(`Project not found: ${args.projectId}`);

    const now = Date.now();
    const id = await ctx.db.insert("calendarEvents", {
      projectId: args.projectId,
      creatorId: project.ownerId,
      title: args.title,
      description: args.description,
      type: args.type,
      start: args.start,
      end: args.end,
      allDay: args.allDay,
      color: "#3b82f6",
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

// Dead sprint mutations/queries removed. Sprint analytics are consolidated under getSprintInsights.

// Scheduler query removed — setup_report_scheduler handles both viewing and setting up schedulers.

// Create or Update Scheduler by agent
export const createOrUpdateScheduler = internalMutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    frequencyDays: v.number(), // min 3 days
    recipientEmail: v.optional(v.string()), // Agent can provide or not
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error(`Project not found: ${args.projectId}`);

    const owner = await ctx.db.get(project.ownerId);
    if (!owner) throw new Error("Owner not found");

    const existingScheduler = await ctx.db
      .query("schedulers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    const now = Date.now();
    const frequency = args.frequencyDays < 3 ? 3 : args.frequencyDays;

    // Use owner email if no recipient email provided
    const emailToUse = args.recipientEmail || owner.email;

    let schedulerId;
    let runTime;

    if (existingScheduler) {
      schedulerId = existingScheduler._id;
      // Keep existing nextRunAt if already scheduled, or update if frequency changed
      runTime = existingScheduler.nextRunAt;

      await ctx.db.patch(existingScheduler._id, {
        name: args.name,
        frequencyDays: frequency,
        recipientEmail: emailToUse,
        isActive: args.isActive,
        updatedAt: now,
      });
    } else {
      // NEW schedule: set nextRunAt to NOW to trigger immediately
      runTime = now;
      schedulerId = await ctx.db.insert("schedulers", {
        projectId: args.projectId,
        name: args.name,
        frequencyDays: frequency,
        recipientEmail: emailToUse,
        isActive: args.isActive,
        nextRunAt: now,
        createdBy: project.ownerId,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Trigger the scheduled runner if active
    if (args.isActive) {
      console.log(
        `[Agent-Scheduler] Triggering run for ${schedulerId} at ${new Date(runTime).toLocaleString()}`,
      );
      await ctx.scheduler.runAt(
        runTime,
        internal.scheduleRunner.executeScheduler,
        {
          projectId: args.projectId,
          recipientEmail: emailToUse,
          schedulerName: args.name,
          schedulerId: schedulerId,
        },
      );
    }

    return {
      id: schedulerId,
      recipientEmail: emailToUse,
      message: existingScheduler
        ? "Scheduler updated successfully"
        : "Scheduler created successfully",
    };
  },
});

/**
 * getMemberWorkloadPYAgent: Returns a detailed breakdown of each team member's current task and issue assignments,
 * including overloaded status, idle/stale status, blocked tasks, and overdue items.
 * Specially for Python Agent where we pass projectId as string.
 */
export const getMemberWorkloadPYAgent = internalQuery({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const projectId = args.projectId as Id<"projects">;
    const now = Date.now();
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
      const completedTasks = memberTasks.filter((t) => t.status === "completed");
      const activeIssues = memberIssues.filter((i) => i.status !== "closed");
      const closedIssues = memberIssues.filter((i) => i.status === "closed");

      const blockedTasks = activeTasks.filter((t) => t.isBlocked === true);
      const overdueTasks = activeTasks.filter(
        (t) => t.estimation && t.estimation.endDate && t.estimation.endDate < now,
      );
      const overdueIssues = activeIssues.filter(
        (i) => i.due_date && i.due_date < now,
      );
      const highPriorityCount =
        activeTasks.filter((t) => t.priority === "high").length +
        activeIssues.filter((i) => i.severity === "critical").length;

      const totalActive = activeTasks.length + activeIssues.length;
      const overdueCount = overdueTasks.length + overdueIssues.length;
      const blockedCount = blockedTasks.length;

      // Status classification: overloaded, stale_or_blocked, idle, balanced
      let workloadStatus: "overloaded" | "stale_or_blocked" | "idle" | "balanced" = "balanced";
      let statusNote = "Workload balanced";

      if (totalActive >= 5 || highPriorityCount >= 3) {
        workloadStatus = "overloaded";
        statusNote = `Overloaded (${totalActive} active items, ${highPriorityCount} critical/high)`;
      } else if (overdueCount > 0 || blockedCount > 0) {
        workloadStatus = "stale_or_blocked";
        statusNote = `Sitting stale / blocked (${overdueCount} overdue, ${blockedCount} blocked)`;
      } else if (totalActive === 0) {
        workloadStatus = "idle";
        statusNote = "Sitting idle / underutilized (0 active assignments)";
      } else {
        workloadStatus = "balanced";
        statusNote = `Optimal (${totalActive} active items)`;
      }

      return {
        name: m.userName,
        role: m.AccessRole ?? "member",
        totalTasks: memberTasks.length,
        activeTasksCount: activeTasks.length,
        completedTasksCount: completedTasks.length,
        totalIssues: memberIssues.length,
        activeIssuesCount: activeIssues.length,
        closedIssuesCount: closedIssues.length,
        totalActive,
        overdueCount,
        blockedCount,
        highPriorityCount,
        workloadStatus,
        statusNote,
        tasks: activeTasks.map((t) => ({
          title: t.title,
          priority: t.priority ?? "low",
          status: t.status,
          isBlocked: t.isBlocked ?? false,
          isOverdue: Boolean(t.estimation && t.estimation.endDate && t.estimation.endDate < now),
        })),
        issues: activeIssues.map((i) => ({
          title: i.title,
          severity: i.severity ?? "medium",
          status: i.status,
          isOverdue: Boolean(i.due_date && i.due_date < now),
        })),
      };
    });
  },
});

/**
 * getMemberWorkload: Returns a detailed breakdown of each team member's current task and issue assignments.
 */
export const getMemberWorkload = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const now = Date.now();
    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const taskAssignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const issueAssignees = await ctx.db
      .query("issueAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
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
      const completedTasks = memberTasks.filter((t) => t.status === "completed");
      const activeIssues = memberIssues.filter((i) => i.status !== "closed");
      const closedIssues = memberIssues.filter((i) => i.status === "closed");

      const blockedTasks = activeTasks.filter((t) => t.isBlocked === true);
      const overdueTasks = activeTasks.filter(
        (t) => t.estimation && t.estimation.endDate && t.estimation.endDate < now,
      );
      const overdueIssues = activeIssues.filter(
        (i) => i.due_date && i.due_date < now,
      );
      const highPriorityCount =
        activeTasks.filter((t) => t.priority === "high").length +
        activeIssues.filter((i) => i.severity === "critical").length;

      const totalActive = activeTasks.length + activeIssues.length;
      const overdueCount = overdueTasks.length + overdueIssues.length;
      const blockedCount = blockedTasks.length;

      let workloadStatus: "overloaded" | "stale_or_blocked" | "idle" | "balanced" = "balanced";
      let statusNote = "Workload balanced";

      if (totalActive >= 5 || highPriorityCount >= 3) {
        workloadStatus = "overloaded";
        statusNote = `Overloaded (${totalActive} active items, ${highPriorityCount} critical/high)`;
      } else if (overdueCount > 0 || blockedCount > 0) {
        workloadStatus = "stale_or_blocked";
        statusNote = `Sitting stale / blocked (${overdueCount} overdue, ${blockedCount} blocked)`;
      } else if (totalActive === 0) {
        workloadStatus = "idle";
        statusNote = "Sitting idle / underutilized (0 active assignments)";
      } else {
        workloadStatus = "balanced";
        statusNote = `Optimal (${totalActive} active items)`;
      }

      return {
        name: m.userName,
        role: m.AccessRole ?? "member",
        totalTasks: memberTasks.length,
        activeTasksCount: activeTasks.length,
        completedTasksCount: completedTasks.length,
        totalIssues: memberIssues.length,
        activeIssuesCount: activeIssues.length,
        closedIssuesCount: closedIssues.length,
        totalActive,
        overdueCount,
        blockedCount,
        highPriorityCount,
        workloadStatus,
        statusNote,
        tasks: activeTasks.map((t) => ({
          title: t.title,
          priority: t.priority ?? "low",
          status: t.status,
          isBlocked: t.isBlocked ?? false,
          isOverdue: Boolean(t.estimation && t.estimation.endDate && t.estimation.endDate < now),
        })),
        issues: activeIssues.map((i) => ({
          title: i.title,
          severity: i.severity ?? "medium",
          status: i.status,
          isOverdue: Boolean(i.due_date && i.due_date < now),
        })),
      };
    });
  },
});

/**
 * getSprintInsights: Returns comprehensive analytics for all project sprints, including progress metrics and timelines.
 * returns: Array<{ name: string, goal: string, status: string, duration: { start: string, end: string }, stats: { completedTasks: number, totalTasks: number, closedIssues: number, totalIssues: number, progressPercent: number } }>
 */
export const getSprintInsights = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const sprints = await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const allIssues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return sprints.map((s) => {
      let completedTasks = 0;
      let totalTasks = 0;
      let closedIssues = 0;
      let totalIssues = 0;

      if (s.status === "completed" && s.finalStats) {
        completedTasks = s.finalStats.completedTasks;
        totalTasks = s.finalStats.totalTasks;
        closedIssues = s.finalStats.closedIssues;
        totalIssues = s.finalStats.totalIssues;
      } else {
        const sprintTasks = allTasks.filter((t) => t.sprintId === s._id);
        const sprintIssues = allIssues.filter((i) => i.sprintId === s._id);

        completedTasks = sprintTasks.filter(
          (t) => t.status === "completed",
        ).length;
        totalTasks = sprintTasks.length;
        closedIssues = sprintIssues.filter((i) => i.status === "closed").length;
        totalIssues = sprintIssues.length;
      }

      const totalItems = totalTasks + totalIssues;
      const completedItems = completedTasks + closedIssues;
      const progress =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      return {
        name: s.sprintName,
        goal: s.sprintGoal,
        status: s.status,
        duration: {
          start: new Date(s.duration.startDate).toLocaleDateString(),
          end: new Date(s.duration.endDate).toLocaleDateString(),
        },
        stats: {
          completedTasks,
          totalTasks,
          closedIssues,
          totalIssues,
          progressPercent: progress,
        },
      };
    });
  },
});

/**
 * getProjectInsights: Returns basic project timeline information.
 */
export const getProjectInsights = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error("Project not found");

    const projectDetail = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    const deadlineTimestamp = projectDetail?.targetDate ?? null;
    let daysRemaining = null;
    let formattedDeadline = null;

    if (deadlineTimestamp) {
      const now = Date.now();
      const diff = deadlineTimestamp - now;
      daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
      formattedDeadline = new Date(deadlineTimestamp).toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        },
      );
    }

    return {
      projectName: project.projectName,
      createdAt: project.createdAt,
      deadline: formattedDeadline,
      deadlineTimestamp,
      daysRemaining:
        daysRemaining !== null ? (daysRemaining > 0 ? daysRemaining : 0) : null,
      isOverdue: daysRemaining !== null && daysRemaining < 0,
    };
  },
});

/**
 * getTasksSummary: Returns an AI-optimized summary of tasks, prioritizing active and high-priority ones.
 */
export const getTasksSummary = internalQuery({
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

    // Return all tasks regardless of status

    const completedCount = tasks.filter((t) => t.status === "completed").length;
    const blockedCount = tasks.filter((t) => t.isBlocked).length;

    return {
      tasks: tasks.map((t) => {
        const isOverdue = now > t.estimation.endDate;
        const isNearOverdue =
          !isOverdue && now > t.estimation.endDate - NEAR_OVERDUE_THRESHOLD;

        let deadlineStatus = "on track";
        if (isOverdue) {
          const days = Math.ceil(
            (now - t.estimation.endDate) / (1000 * 60 * 60 * 24),
          );
          deadlineStatus = `OVERDUE by ${days} days`;
        } else if (isNearOverdue) {
          const days = Math.ceil(
            (t.estimation.endDate - now) / (1000 * 60 * 60 * 24),
          );
          deadlineStatus = `due in ${days} days`;
        }

        const assignee =
          taskAssignees
            .filter((a) => a.taskId === t._id)
            .map((a) => a.name)
            .join(", ") || "Unassigned";

        return {
          title: t.title,
          assignee,
          deadlineStatus,
          priority: t.priority ?? "medium",
        };
      }),
      totalCount: tasks.length,
      completedCount,
      blockedCount,
    };
  },
});

/**
 * getIssuesSummary: Returns an AI-optimized summary of issues, prioritizing critical and open ones.
 */
export const getIssuesSummary = internalQuery({
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
 * getUserStandup: Returns all active tasks and open issues assigned to a specific user.
 * This is used for daily standup and prioritization.
 */
export const getUserStandup = internalQuery({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 1. Get user's tasks
    const taskAssignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();

    const taskIds = taskAssignees.map((a) => a.taskId);
    const tasks = await Promise.all(taskIds.map((id) => ctx.db.get(id)));
    const activeTasks = tasks.filter((t) => t && t.status !== "completed");

    // 2. Get user's issues
    const issueAssignees = await ctx.db
      .query("issueAssignees")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();

    const issueIds = issueAssignees.map((a) => a.issueId);
    const issues = await Promise.all(issueIds.map((id) => ctx.db.get(id)));
    const openIssues = issues.filter((i) => i && i.status !== "closed");

    return {
      tasks: activeTasks.map((t) => ({
        id: t!._id,
        title: t!.title,
        status: t!.status,
        priority: t!.priority,
        endDate: t!.estimation.endDate,
        isBlocked: t!.isBlocked ?? false,
      })),
      issues: openIssues.map((i) => ({
        id: i!._id,
        title: i!.title,
        status: i!.status,
        severity: i!.severity,
        due_date: i!.due_date ?? null,
      })),
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
 *
 * Returns:
 *   weeklyVelocity  — Array<{ weekLabel, tasksCompleted, issuesResolved, total }>
 *   avgCycleTimeDays — { tasks: number|null, issues: number|null }
 *   trend           — "improving" | "stable" | "declining" | "insufficient_data"
 *   totalCompleted  — all-time completed tasks + closed issues count
 *   summary         — compact string Kaya can embed directly in a response
 */
export const getProjectVelocity = internalQuery({
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
        (t) =>
          t.finalCompletedAt! >= weekStart && t.finalCompletedAt! < weekEnd,
      ).length;

      const issuesResolved = doneIssues.filter(
        (i) =>
          i.finalCompletedAt! >= weekStart && i.finalCompletedAt! < weekEnd,
      ).length;

      return {
        weekLabel,
        tasksCompleted,
        issuesResolved,
        total: tasksCompleted + issuesResolved,
      };
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
 * Returns all sprints (completed → active → planned) with enriched signals:
 *   name, goal, status, createdBy (resolved name), start/end dates,
 *   durationDays, stats (completedTasks, totalTasks, closedIssues, totalIssues),
 *   completionRate (%)
 *
 * Uses finalStats for completed sprints (locked), live counts for others.
 * Only fields that carry signal for Kaya — no internal IDs or noise.
 */
export const getSprintHistory = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const sprints = await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const statusOrder: Record<string, number> = {
      completed: 0,
      active: 1,
      planned: 2,
    };
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
        if (user)
          creatorMap[id as string] =
            user.name ?? user.githubUsername ?? "Unknown";
      }),
    );

    const MS_PER_DAY = 24 * 60 * 60 * 1000;

    // Keep last 6 completed (most recent) + active sprint only; skip empty planned
    const completed = sprints.filter((s) => s.status === "completed").slice(-6);
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
        completedTasks = sprintTasks.filter(
          (t) => t.status === "completed",
        ).length;
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

function inferTaskTag(title: string): { label: string; color: string } {
  const t = title.toLowerCase();
  if (/pay|bill|invoice|finance|money|subscri/.test(t))
    return { label: "Payment", color: "green" };
  if (/auth|login|sign|jwt|user|secu|iam/.test(t))
    return { label: "Auth", color: "blue" };
  if (/ui|front|design|view|css|page|client|meet/.test(t))
    return { label: "UI", color: "purple" };
  if (/middle|rout|api|back|serv|data|db|sql|endp/.test(t))
    return { label: "API", color: "yellow" };
  if (/bug|fix|err|patch|resolv/.test(t))
    return { label: "Bugfix", color: "grey" };
  return { label: "Feature", color: "blue" };
}

// Bulk Insert Tasks mutation for PRD / Document AI Extractor
export const bulkInsertTasks = internalMutation({
  args: {
    projectId: v.id("projects"),
    tasks: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.union(v.string(), v.null())),
        priority: v.optional(
          v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
        ),
        type: v.optional(
          v.object({
            label: v.string(),
            color: v.string(),
          }),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error(`Project not found: ${args.projectId}`);

    const now = Date.now();
    const tomorrow = now + 86400000;
    const insertedIds = [];

    for (const taskItem of args.tasks) {
      const id = await ctx.db.insert("tasks", {
        projectId: args.projectId,
        createdByUserId: project.ownerId,
        title: taskItem.title,
        description: taskItem.description || undefined,
        priority: taskItem.priority ?? "medium",
        type: taskItem.type ?? inferTaskTag(taskItem.title),
        status: "not started",
        estimation: {
          startDate: now,
          endDate: tomorrow,
        },
        createdAt: now,
        updatedAt: now,
      });
      insertedIds.push(id);
    }

    return {
      success: true,
      count: insertedIds.length,
      taskIds: insertedIds,
    };
  },
});

// Bulk Insert Issues mutation for PRD / Document AI Extractor
export const bulkInsertIssues = internalMutation({
  args: {
    projectId: v.id("projects"),
    issues: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.union(v.string(), v.null())),
        environment: v.optional(
          v.union(
            v.literal("local"),
            v.literal("dev"),
            v.literal("staging"),
            v.literal("production"),
          ),
        ),
        severity: v.optional(
          v.union(v.literal("critical"), v.literal("medium"), v.literal("low")),
        ),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error(`Project not found: ${args.projectId}`);

    const now = Date.now();
    const dayAfterTomorrow = now + 2 * 86400000;
    const insertedIds = [];

    for (const issueItem of args.issues) {
      const id = await ctx.db.insert("issues", {
        projectId: args.projectId,
        createdByUserId: project.ownerId,
        title: issueItem.title,
        description: issueItem.description || undefined,
        environment: issueItem.environment ?? "dev",
        severity: issueItem.severity ?? "medium",
        status: "not opened",
        type: "manual",
        due_date: dayAfterTomorrow,
        createdAt: now,
        updatedAt: now,
      });
      insertedIds.push(id);
    }

    return {
      success: true,
      count: insertedIds.length,
      issueIds: insertedIds,
    };
  },
});
