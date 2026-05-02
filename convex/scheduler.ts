import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

async function getMemberWorkloadLogic(
  ctx: QueryCtx,
  args: { projectId: Id<"projects"> },
) {
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
      issueAssignees.some((a) => a.issueId === i._id && a.userId === m.userId),
    );

    return {
      name: m.userName,
      role: m.AccessRole ?? "member",
      tasks: memberTasks.map((t) => ({
        title: t.title,
        priority: t.priority ?? "low",
        status: t.status,
      })),
      totalTasks: memberTasks.length,
      issues: memberIssues.map((i) => ({
        title: i.title,
        status: i.status,
      })),
      totalIssues: memberIssues.length,
    };
  });
}

async function getSprintInsightsLogic(
  ctx: QueryCtx,
  args: { projectId: Id<"projects"> },
) {
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

      completedTasks = sprintTasks.filter((t) => t.status === "completed").length;
      totalTasks = sprintTasks.length;
      closedIssues = sprintIssues.filter((i) => i.status === "closed").length;
      totalIssues = sprintIssues.length;
    }

    const totalItems = totalTasks + totalIssues;
    const completedItems = completedTasks + closedIssues;
    const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

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
}

async function getProjectInsightsLogic(
  ctx: QueryCtx,
  args: { projectId: Id<"projects"> },
) {
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
}

async function getTasksSummaryLogic(
  ctx: QueryCtx,
  args: { projectId: Id<"projects"> },
) {
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

  // Filter tasks as requested: Not started, Overdue/Near Overdue, or High Priority incomplete
  const criticalTasks = tasks.filter((t) => {
    if (t.status === "completed") return false;

    const isOverdue = now > t.estimation.endDate;
    const isNearOverdue =
      !isOverdue && now > t.estimation.endDate - NEAR_OVERDUE_THRESHOLD;
    const isNotStarted = t.status === "not started";
    const isHighPriority = t.priority === "high";

    return (
      isOverdue || isNearOverdue || isNotStarted || isHighPriority || t.isBlocked
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
        const days = Math.ceil((now - t.estimation.endDate) / (1000 * 60 * 60 * 24));
        timelineStatus = `OVERDUE by ${days} days`;
      } else if (isNearOverdue) {
        const days = Math.ceil((t.estimation.endDate - now) / (1000 * 60 * 60 * 24));
        timelineStatus = `Near overdue (due in ${days} days)`;
      }

      return {
        title: t.title,
        status: t.status,
        priority: t.priority ?? "medium",
        isBlocked: t.isBlocked ?? false,
        assignees: taskAssignees.filter((a) => a.taskId === t._id).map((a) => a.name),
        endDate: new Date(t.estimation.endDate).toLocaleDateString(),
        timelineStatus,
      };
    }),
    completedCount,
    blockedCount,
    totalCount: tasks.length,
  };
}

async function getIssuesSummaryLogic(
  ctx: QueryCtx,
  args: { projectId: Id<"projects"> },
) {
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
      assignees: issueAssignees.filter((a) => a.issueId === i._id).map((a) => a.name),
    })),
    closedCount,
    criticalCount,
    totalCount: issues.length,
  };
}

// --- Public Queries (Client API) ---

export const getMemberWorkload = query({
  args: { projectId: v.id("projects") },
  handler: getMemberWorkloadLogic,
});

export const getSprintInsights = query({
  args: { projectId: v.id("projects") },
  handler: getSprintInsightsLogic,
});

export const getProjectInsights = query({
  args: { projectId: v.id("projects") },
  handler: getProjectInsightsLogic,
});

export const getTasksSummary = query({
  args: { projectId: v.id("projects") },
  handler: getTasksSummaryLogic,
});

export const getIssuesSummary = query({
  args: { projectId: v.id("projects") },
  handler: getIssuesSummaryLogic,
});

/**
 * getProjectScheduleContext: Aggregates all data points needed for the AI scheduler brief.
 */
export const getProjectScheduleContext = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const [insights, tasks, issues, sprints, workload] = await Promise.all([
      getProjectInsightsLogic(ctx, args),
      getTasksSummaryLogic(ctx, args),
      getIssuesSummaryLogic(ctx, args),
      getSprintInsightsLogic(ctx, args),
      getMemberWorkloadLogic(ctx, args),
    ]);

    return {
      insights,
      tasks,
      issues,
      sprints,
      workload,
    };
  },
});

/**
 * upsertScheduler: Called by Kaya or the UI to create/update a schedule.
 * It handles the initial scheduling of the runner.
 */
export const upsertScheduler = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
    frequencyDays: v.number(),
    recipientEmail: v.string(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();
    if (!user) throw new Error("User not found");

    const existing = await ctx.db
      .query("schedulers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    const now = Date.now();
    const frequency = Math.max(3, args.frequencyDays); // Hard enforce min 3 days
    let schedulerId: Id<"schedulers">;

    if (existing) {
      schedulerId = existing._id;
      await ctx.db.patch(existing._id, {
        name: args.name,
        frequencyDays: args.frequencyDays,
        recipientEmail: args.recipientEmail,
        isActive: args.isActive,
        updatedAt: now,
      });
    } else {
      schedulerId = await ctx.db.insert("schedulers", {
        projectId: args.projectId,
        name: args.name,
        frequencyDays: args.frequencyDays,
        recipientEmail: args.recipientEmail,
        isActive: args.isActive,
        nextRunAt: now, // Run immediately if new
        createdBy: user._id,
        createdAt: now,
        updatedAt: now,
      });
    }

    // If active, schedule the first run
    if (args.isActive) {
      const scheduler = await ctx.db.get(schedulerId);
      const nextRun = scheduler?.nextRunAt ?? now;

      console.log(
        `[Scheduler] Scheduling first run for ${schedulerId} at ${new Date(nextRun).toLocaleString()}`,
      );

      await ctx.scheduler.runAt(
        nextRun,
        internal.scheduleRunner.executeScheduler,
        {
          projectId: args.projectId,
          recipientEmail: args.recipientEmail,
          schedulerName: args.name,
          schedulerId: schedulerId,
        },
      );
    }

    return schedulerId;
  },
});

/**
 * markRunCompleteAndScheduleNext: Called by the Action after successful execution.
 * It handles the recursive scheduling of the NEXT run.
 */
export const markRunCompleteAndScheduleNext = internalMutation({
  args: { schedulerId: v.id("schedulers") },
  handler: async (ctx, args) => {
    const scheduler = await ctx.db.get(args.schedulerId);
    if (!scheduler || !scheduler.isActive) {
      console.log(
        `[Scheduler] ${args.schedulerId} is no longer active or exists. Stopping recursion.`,
      );
      return;
    }

    const lastRunAt = Date.now();
    const nextRunAt = lastRunAt + scheduler.frequencyDays * 24 * 60 * 60 * 1000;

    await ctx.db.patch(args.schedulerId, {
      lastRunAt,
      nextRunAt,
      isRunning: false,
      lastRunStatus: "success",
      updatedAt: lastRunAt,
    });

    // RECURSIVE STEP: Schedule the next one!
    console.log(
      `[Scheduler] Scheduling NEXT run for ${args.schedulerId} at ${new Date(nextRunAt).toLocaleString()}`,
    );

    await ctx.scheduler.runAt(
      nextRunAt,
      internal.scheduleRunner.executeScheduler,
      {
        projectId: scheduler.projectId,
        recipientEmail: scheduler.recipientEmail,
        schedulerName: scheduler.name,
        schedulerId: scheduler._id,
      },
    );
  },
});

/**
 * handleRunError: Critical for production. Resets the isRunning state
 * if an action fails, allowing the system to recover.
 */
export const handleRunError = internalMutation({
  args: { schedulerId: v.id("schedulers"), error: v.string() },
  handler: async (ctx, args) => {
    console.error(
      `[Scheduler] ERROR in run ${args.schedulerId}: ${args.error}`,
    );
    await ctx.db.patch(args.schedulerId, {
      isRunning: false,
      lastRunStatus: "failure",
      updatedAt: Date.now(),
    });
  },
});

export const markRunStarted = internalMutation({
  args: { schedulerId: v.id("schedulers") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.schedulerId, {
      isRunning: true,
      updatedAt: Date.now(),
    });
  },
});
