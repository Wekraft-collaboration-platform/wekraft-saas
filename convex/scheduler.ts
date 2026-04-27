import { v } from "convex/values";
import { query } from "./_generated/server";
import { QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

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

  return members.map((m) => {
    const memberTasks = tasks.filter((t) =>
      (t.assignedTo ?? []).some((a) => a.userId === m.userId),
    );

    const memberIssues = issues.filter((i) =>
      (i.IssueAssignee ?? []).some((a) => a.userId === m.userId),
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
    const sprintTasks = allTasks.filter((t) => t.sprintId === s._id);
    const sprintIssues = allIssues.filter((i) => i.sprintId === s._id);

    const completedTasks = sprintTasks.filter(
      (t) => t.status === "completed",
    ).length;
    const closedIssues = sprintIssues.filter(
      (i) => i.status === "closed",
    ).length;

    const totalItems = sprintTasks.length + sprintIssues.length;
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
        totalTasks: sprintTasks.length,
        closedIssues,
        totalIssues: sprintIssues.length,
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

  const activeTasks = tasks.filter(
    (t) =>
      ["inprogress", "reviewing", "testing"].includes(t.status) ||
      (t.status === "not started" && t.priority === "high") ||
      t.isBlocked,
  );

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const blockedCount = tasks.filter((t) => t.isBlocked).length;

  return {
    criticalAndActiveTasks: activeTasks.map((t) => ({
      title: t.title,
      status: t.status,
      priority: t.priority ?? "medium",
      isBlocked: t.isBlocked ?? false,
      assignees: (t.assignedTo ?? []).map((a) => a.name),
    })),
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
      assignees: (i.IssueAssignee ?? []).map((a) => a.name),
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
