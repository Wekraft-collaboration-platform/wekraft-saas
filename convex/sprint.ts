import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Helper to get the current authenticated user
 */
async function getAuthUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q: any) =>
      q.eq("clerkToken", identity.tokenIdentifier),
    )
    .unique();
}

// ==========================================
// QUERIES
// ==========================================

//==================
// getSprintsByProject: Fetches all sprints for a specific project with computed stats.
// used in: Sprints list page
//==================
export const getSprintsByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const sprints = await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    // For each sprint, compute task/issue counts
    const sprintsWithStats = await Promise.all(
      sprints.map(async (sprint) => {
        // Use historical IDs if available, otherwise fallback to current assignments
        let tasks = [];
        if (sprint.taskIds) {
          const taskResults = await Promise.all(
            sprint.taskIds.map((id) => ctx.db.get(id)),
          );
          tasks = taskResults.filter((t): t is any => t !== null);
        } else {
          tasks = await ctx.db
            .query("tasks")
            .withIndex("by_sprint", (q) => q.eq("sprintId", sprint._id))
            .collect();
        }

        let issues = [];
        if (sprint.issueIds) {
          const issueResults = await Promise.all(
            sprint.issueIds.map((id) => ctx.db.get(id)),
          );
          issues = issueResults.filter((i): i is any => i !== null);
        } else {
          issues = await ctx.db
            .query("issues")
            .withIndex("by_sprint", (q) => q.eq("sprintId", sprint._id))
            .collect();
        }

        if (sprint.status === "completed" && sprint.finalStats) {
          return {
            ...sprint,
            totalTasks: sprint.finalStats.totalTasks,
            completedTasks: sprint.finalStats.completedTasks,
            totalIssues: sprint.finalStats.totalIssues,
            closedIssues: sprint.finalStats.closedIssues,
          };
        }

        const completedTasks = tasks.filter(
          (t) => t.status === "completed",
        ).length;
        const closedIssues = issues.filter(
          (i) => i.status === "closed",
        ).length;

        return {
          ...sprint,
          totalTasks: tasks.length,
          completedTasks,
          totalIssues: issues.length,
          closedIssues,
        };
      }),
    );

    return sprintsWithStats;
  },
});

//==================
// getActiveSprint: Fetches the currently active sprint for a project.
// used in: Project dashboard, navigation
//==================
export const getActiveSprint = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sprints")
      .withIndex("by_project_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "active"),
      )
      .unique();
  },
});

//==================
// getSprintById: Fetches a sprint record by its unique ID.
// used in: Generic sprint lookups
//==================
export const getSprintById = query({
  args: { sprintId: v.id("sprints") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.sprintId);
  },
});

//==================
// getSprintByName: Fetches a sprint by its name within a project.
// used in: Sprint detail page routing
//==================
export const getSprintByName = query({
  args: { 
    projectId: v.id("projects"),
    sprintName: v.string() 
  },
  handler: async (ctx, args) => {
    const sprints = await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("sprintName"), args.sprintName))
      .collect();
    return sprints[0] || null;
  },
});

// ==========================================
// SPRINT TASKS & ISSUES QUERIES
// ==========================================

//==================
// getSprintTasks: Fetches all tasks associated with a sprint (historically or currently).
// used in: Sprint detail page tasks tab
//==================
export const getSprintTasks = query({
  args: { sprintId: v.id("sprints") },
  handler: async (ctx, args) => {
    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) return [];

    if (sprint.taskIds) {
      const taskResults = await Promise.all(
        sprint.taskIds.map((id) => ctx.db.get(id)),
      );
      return taskResults.filter((t): t is any => t !== null);
    }

    return await ctx.db
      .query("tasks")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .collect();
  },
});

//==================
// getSprintIssues: Fetches all issues associated with a sprint (historically or currently).
// used in: Sprint detail page issues tab
//==================
export const getSprintIssues = query({
  args: { sprintId: v.id("sprints") },
  handler: async (ctx, args) => {
    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) return [];

    if (sprint.issueIds) {
      const issueResults = await Promise.all(
        sprint.issueIds.map((id) => ctx.db.get(id)),
      );
      return issueResults.filter((i): i is any => i !== null);
    }

    return await ctx.db
      .query("issues")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .collect();
  },
});

// ==========================================
// SPRINT STATS (computed)
// ==========================================

//==================
// getSprintStats: Computes detailed performance metrics for a sprint.
// used in: Sprint detail page dashboard
//==================
export const getSprintStats = query({
  args: { sprintId: v.id("sprints") },
  handler: async (ctx, args) => {
    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) return null;

    let tasks = [];
    if (sprint.taskIds) {
      const taskResults = await Promise.all(
        sprint.taskIds.map((id) => ctx.db.get(id)),
      );
      tasks = taskResults.filter((t): t is any => t !== null);
    } else {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
        .collect();
    }

    let issues = [];
    if (sprint.issueIds) {
      const issueResults = await Promise.all(
        sprint.issueIds.map((id) => ctx.db.get(id)),
      );
      issues = issueResults.filter((i): i is any => i !== null);
    } else {
      issues = await ctx.db
        .query("issues")
        .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
        .collect();
    }

    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const closedIssues = issues.filter((i) => i.status === "closed").length;
    const blockedTasks = tasks.filter((t) => t.isBlocked === true).length;

    const totalItems = tasks.length + issues.length;
    const completedItems = completedTasks + closedIssues;

    // Use frozen stats for completed sprints if available
    const finalTotalTasks =
      sprint.status === "completed" && sprint.finalStats
        ? sprint.finalStats.totalTasks
        : tasks.length;
    const finalCompletedTasks =
      sprint.status === "completed" && sprint.finalStats
        ? sprint.finalStats.completedTasks
        : completedTasks;
    const finalTotalIssues =
      sprint.status === "completed" && sprint.finalStats
        ? sprint.finalStats.totalIssues
        : issues.length;
    const finalClosedIssues =
      sprint.status === "completed" && sprint.finalStats
        ? sprint.finalStats.closedIssues
        : closedIssues;

    const finalTotalItems = finalTotalTasks + finalTotalIssues;
    const finalCompletedItems = finalCompletedTasks + finalClosedIssues;
    const completionPercent =
      finalTotalItems > 0
        ? Math.round((finalCompletedItems / finalTotalItems) * 100)
        : 0;

    // Days elapsed and remaining
    const now = Date.now();
    const daysElapsed = Math.max(
      1,
      Math.ceil((now - sprint.duration.startDate) / (1000 * 60 * 60 * 24)),
    );
    const daysRemaining = Math.max(
      0,
      Math.ceil((sprint.duration.endDate - now) / (1000 * 60 * 60 * 24)),
    );
    const totalDays = Math.max(
      1,
      Math.ceil(
        (sprint.duration.endDate - sprint.duration.startDate) /
          (1000 * 60 * 60 * 24),
      ),
    );

    // Burn rate — items completed per day
    const burnRate =
      daysElapsed > 0
        ? Math.round((completedItems / daysElapsed) * 10) / 10
        : 0;

    // Estimated completion: at current burn rate, when will remaining items finish?
    const remainingItems = totalItems - completedItems;
    const estimatedDaysToComplete =
      burnRate > 0 ? Math.ceil(remainingItems / burnRate) : null;

    // Task status breakdown
    const taskStatusBreakdown: Record<string, number> = {};
    for (const task of tasks) {
      taskStatusBreakdown[task.status] =
        (taskStatusBreakdown[task.status] || 0) + 1;
    }

    // Unique team members from task assignees + issue assignees
    const memberMap = new Map<
      string,
      { userId: string; name: string; avatar?: string; taskCount: number }
    >();

    for (const task of tasks) {
      if (task.assignedTo) {
        for (const person of task.assignedTo) {
          const existing = memberMap.get(person.userId);
          if (existing) {
            existing.taskCount += 1;
          } else {
            memberMap.set(person.userId, {
              userId: person.userId,
              name: person.name,
              avatar: person.avatar,
              taskCount: 1,
            });
          }
        }
      }
    }

    for (const issue of issues) {
      if (issue.IssueAssignee) {
        for (const person of issue.IssueAssignee) {
          const existing = memberMap.get(person.userId);
          if (existing) {
            existing.taskCount += 1;
          } else {
            memberMap.set(person.userId, {
              userId: person.userId,
              name: person.name,
              avatar: person.avatar,
              taskCount: 1,
            });
          }
        }
      }
    }

    return {
      totalTasks: finalTotalTasks,
      completedTasks: finalCompletedTasks,
      totalIssues: finalTotalIssues,
      closedIssues: finalClosedIssues,
      blockedTasks,
      totalItems: finalTotalItems,
      completedItems: finalCompletedItems,
      completionPercent,
      daysElapsed,
      daysRemaining,
      totalDays,
      burnRate,
      estimatedDaysToComplete,
      taskStatusBreakdown,
      teamMembers: Array.from(memberMap.values()),
    };
  },
});

// ==========================================
// BACKLOG QUERIES (tasks/issues not in any sprint)
// ==========================================

//==================
// getBacklogTasks: Fetches tasks in a project that are not assigned to any sprint.
// used in: Backlog management, sprint planning
//==================
export const getBacklogTasks = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Only backlog tasks: no sprintId AND not completed
    return tasks.filter((t) => !t.sprintId && t.status !== "completed");
  },
});

//==================
// getBacklogIssues: Fetches issues in a project that are not assigned to any sprint.
// used in: Backlog management, sprint planning
//==================
export const getBacklogIssues = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Only backlog issues: no sprintId AND not closed
    return issues.filter((i) => !i.sprintId && i.status !== "closed");
  },
});

// ==========================================
// MUTATIONS
// ==========================================

//==================
// createSprint: Initializes a new sprint record for a project.
// used in: Create Sprint dialog
//==================
export const createSprint = mutation({
  args: {
    projectId: v.id("projects"),
    sprintName: v.string(),
    sprintGoal: v.string(),
    duration: v.object({
      startDate: v.number(),
      endDate: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Validation 1: Sprint name must be unique within the project
    const existingSprints = await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("sprintName"), args.sprintName))
      .collect();

    if (existingSprints.length > 0) {
      throw new Error("A sprint with this name already exists in this project.");
    }

    // Validation 2: end date must be after start date
    if (args.duration.endDate <= args.duration.startDate) {
      throw new Error("End date must be after start date.");
    }

    // Validation 3: end date should not exceed project deadline (if set)
    const projectDetails = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (projectDetails?.targetDate) {
      if (args.duration.endDate > projectDetails.targetDate) {
        throw new Error(
          "Sprint end date cannot exceed the project deadline.",
        );
      }
    }

    return await ctx.db.insert("sprints", {
      projectId: args.projectId,
      creatorId: user._id,
      sprintName: args.sprintName,
      sprintGoal: args.sprintGoal,
      duration: args.duration,
      status: "planned",
      taskIds: [],
      issueIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

//==================
// startSprint: Activates a planned sprint.
// used in: Sprint detail page actions
//==================
export const startSprint = mutation({
  args: { sprintId: v.id("sprints") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) throw new Error("Sprint not found");

    if (sprint.status !== "planned") {
      throw new Error("Only planned sprints can be started.");
    }

    // Check no other active sprint exists for this project
    const activeSprint = await ctx.db
      .query("sprints")
      .withIndex("by_project_status", (q) =>
        q.eq("projectId", sprint.projectId).eq("status", "active"),
      )
      .unique();

    if (activeSprint) {
      throw new Error(
        `Cannot start sprint. "${activeSprint.sprintName}" is already active. Complete it first.`,
      );
    }

    await ctx.db.patch(args.sprintId, {
      status: "active",
      updatedAt: Date.now(),
    });
  },
});

//==================
// completeSprint: Finalizes an active sprint, freezes stats, and moves incomplete items.
// used in: Sprint detail page actions
//==================
export const completeSprint = mutation({
  args: { sprintId: v.id("sprints") },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) throw new Error("Sprint not found");

    if (sprint.status !== "active") {
      throw new Error("Only active sprints can be completed.");
    }

    // Only creator can complete
    if (sprint.creatorId !== user._id) {
      throw new Error("Only the sprint creator can complete a sprint.");
    }

    // Calculate final stats before completion
    let historicalTasks = [];
    if (sprint.taskIds) {
      const taskResults = await Promise.all(
        sprint.taskIds.map((id) => ctx.db.get(id)),
      );
      historicalTasks = taskResults.filter((t): t is any => t !== null);
    } else {
      historicalTasks = await ctx.db
        .query("tasks")
        .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
        .collect();
    }

    let historicalIssues = [];
    if (sprint.issueIds) {
      const issueResults = await Promise.all(
        sprint.issueIds.map((id) => ctx.db.get(id)),
      );
      historicalIssues = issueResults.filter((i): i is any => i !== null);
    } else {
      historicalIssues = await ctx.db
        .query("issues")
        .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
        .collect();
    }

    const completedTasksCount = historicalTasks.filter((t) => t.status === "completed").length;
    const closedIssuesCount = historicalIssues.filter((i) => i.status === "closed").length;

    // Mark sprint as completed and store final stats
    await ctx.db.patch(args.sprintId, {
      status: "completed",
      finalStats: {
        totalTasks: historicalTasks.length,
        completedTasks: completedTasksCount,
        totalIssues: historicalIssues.length,
        closedIssues: closedIssuesCount,
      },
      updatedAt: Date.now(),
    });

    // Move incomplete tasks back to backlog (remove sprintId)
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .collect();

    for (const task of tasks) {
      if (task.status !== "completed") {
        await ctx.db.patch(task._id, {
          sprintId: undefined,
          updatedAt: Date.now(),
        });
      }
    }

    // Move unclosed issues back to backlog
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_sprint", (q) => q.eq("sprintId", args.sprintId))
      .collect();

    for (const issue of issues) {
      if (issue.status !== "closed") {
        await ctx.db.patch(issue._id, {
          sprintId: undefined,
          updatedAt: Date.now(),
        });
      }
    }
  },
});

//==================
// updateSprint: Updates metadata for a planned or active sprint.
// used in: Edit Sprint dialog
//==================
export const updateSprint = mutation({
  args: {
    sprintId: v.id("sprints"),
    sprintName: v.optional(v.string()),
    sprintGoal: v.optional(v.string()),
    duration: v.optional(
      v.object({
        startDate: v.number(),
        endDate: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) throw new Error("Sprint not found");

    // Active sprints: only creator can edit
    if (sprint.status === "active" && sprint.creatorId !== user._id) {
      throw new Error("Only the sprint creator can edit an active sprint.");
    }

    // Completed sprints cannot be edited
    if (sprint.status === "completed") {
      throw new Error("Completed sprints cannot be edited.");
    }

    if (args.sprintName !== undefined && args.sprintName !== sprint.sprintName) {
      const existingSprints = await ctx.db
        .query("sprints")
        .withIndex("by_project", (q) => q.eq("projectId", sprint.projectId))
        .filter((q) => q.eq(q.field("sprintName"), args.sprintName))
        .collect();

      if (existingSprints.length > 0) {
        throw new Error("A sprint with this name already exists in this project.");
      }
    }

    const { sprintId, ...patch } = args;
    await ctx.db.patch(sprintId, {
      ...patch,
      updatedAt: Date.now(),
    });
  },
});

// ==========================================
// ASSIGN TASKS / ISSUES TO SPRINT
// ==========================================

//==================
// assignTaskToSprint: Links a task to a sprint and updates historical tracking.
// used in: Backlog management, sprint detail planning
//==================
export const assignTaskToSprint = mutation({
  args: {
    taskId: v.id("tasks"),
    sprintId: v.optional(v.id("sprints")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // Can't add completed tasks to a sprint
    if (args.sprintId && task.status === "completed") {
      throw new Error("Cannot add a completed task to a sprint.");
    }

    // If task is already in an active sprint, only owner can remove
    if (task.sprintId) {
      const sprint = await ctx.db.get(task.sprintId);
      if (sprint?.status === "active" && sprint.creatorId !== user._id) {
        throw new Error(
          "Cannot move tasks out of an active sprint unless you are the owner.",
        );
      }
    }

    // Update historical tracking in sprints
    if (task.sprintId && task.sprintId !== args.sprintId) {
      const oldSprint = await ctx.db.get(task.sprintId);
      if (oldSprint) {
        const newTaskIds = (oldSprint.taskIds || []).filter((id) => id !== task._id);
        await ctx.db.patch(task.sprintId, { taskIds: newTaskIds });
      }
    }

    if (args.sprintId && task.sprintId !== args.sprintId) {
      const newSprint = await ctx.db.get(args.sprintId);
      if (newSprint) {
        const newTaskIds = [...(newSprint.taskIds || []), task._id];
        await ctx.db.patch(args.sprintId, {
          taskIds: Array.from(new Set(newTaskIds)),
        });
      }
    }

    await ctx.db.patch(args.taskId, {
      sprintId: args.sprintId,
      updatedAt: Date.now(),
    });
  },
});

//==================
// assignIssueToSprint: Links an issue to a sprint and updates historical tracking.
// used in: Backlog management, sprint detail planning
//==================
export const assignIssueToSprint = mutation({
  args: {
    issueId: v.id("issues"),
    sprintId: v.optional(v.id("sprints")),
  },
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    // Can't add closed issues to a sprint
    if (args.sprintId && issue.status === "closed") {
      throw new Error("Cannot add a closed issue to a sprint.");
    }

    if (issue.sprintId) {
      const sprint = await ctx.db.get(issue.sprintId);
      if (sprint?.status === "active" && sprint.creatorId !== user._id) {
        throw new Error(
          "Cannot move issues out of an active sprint unless you are the owner.",
        );
      }
    }

    // Update historical tracking in sprints
    if (issue.sprintId && issue.sprintId !== args.sprintId) {
      const oldSprint = await ctx.db.get(issue.sprintId);
      if (oldSprint) {
        const newIssueIds = (oldSprint.issueIds || []).filter((id) => id !== issue._id);
        await ctx.db.patch(issue.sprintId, { issueIds: newIssueIds });
      }
    }

    if (args.sprintId && issue.sprintId !== args.sprintId) {
      const newSprint = await ctx.db.get(args.sprintId);
      if (newSprint) {
        const newIssueIds = [...(newSprint.issueIds || []), issue._id];
        await ctx.db.patch(args.sprintId, {
          issueIds: Array.from(new Set(newIssueIds)),
        });
      }
    }

    await ctx.db.patch(args.issueId, {
      sprintId: args.sprintId,
      updatedAt: Date.now(),
    });
  },
});
