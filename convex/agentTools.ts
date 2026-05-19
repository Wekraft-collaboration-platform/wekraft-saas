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

// returns: project deadline, all sprint names, count of incomplete unassigned tasks, and duration to deadline.
export const getSprintPlannerContext = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error(`Project not found: ${args.projectId}`);

    // Get project details for the targetDate (deadline)
    const projectDetail = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    const projectDeadline = projectDetail?.targetDate ?? null;

    // Get all sprints for the project
    const sprints = await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // Get tasks to count unassigned and incomplete ones
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const sprintTitles = sprints.map((s) => s.sprintName);

    // Count tasks that are NOT completed AND have NO sprintId
    const unassignedTasksCount = tasks.filter(
      (t) => t.status !== "completed" && !t.sprintId,
    ).length;

    // Calculate duration from today to deadline
    let daysToDeadline = null;
    if (projectDeadline) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const diffTime = projectDeadline - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysToDeadline =
        diffDays > 0
          ? `${diffDays} days`
          : diffDays === 0
            ? "0 days (today)"
            : "past due";
    }

    return {
      projectDeadline,
      daysToDeadline,
      sprintTitles,
      unassignedTasksCount,
    };
  },
});

// create_sprint: agent will call to create with sprint name, sprint goal and duration as start date and end date and return sprint created id.
export const createSprint = internalMutation({
  args: {
    projectId: v.id("projects"),
    sprintName: v.string(),
    sprintGoal: v.string(),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) throw new Error(`Project not found: ${args.projectId}`);

    const now = Date.now();
    const id = await ctx.db.insert("sprints", {
      projectId: args.projectId,
      creatorId: project.ownerId,
      sprintName: args.sprintName,
      sprintGoal: args.sprintGoal,
      duration: { startDate: args.startDate, endDate: args.endDate },
      status: "planned",
      taskIds: [],
      issueIds: [],
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

// add_items_to_sprint : tasks id assigned to the sprint id.
export const addItemsToSprint = internalMutation({
  args: {
    sprintId: v.id("sprints"),
    taskIds: v.array(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const sprint = await ctx.db.get(args.sprintId);
    if (!sprint) throw new Error(`Sprint not found: ${args.sprintId}`);

    // Update historical tracking array on the sprint
    const existingTaskIds = sprint.taskIds || [];
    const newTaskIds = Array.from(
      new Set([...existingTaskIds, ...args.taskIds]),
    );

    await ctx.db.patch(args.sprintId, {
      taskIds: newTaskIds,
      updatedAt: Date.now(),
    });

    // Update sprintId on each task for live view
    for (const taskId of args.taskIds) {
      const task = await ctx.db.get(taskId);
      if (!task) continue;

      await ctx.db.patch(taskId, {
        sprintId: args.sprintId,
        updatedAt: Date.now(),
      });
    }

    return "Tasks added to sprint successfully";
  },
});

// Scheduler query by agent
export const getScheduler = internalQuery({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const scheduler = await ctx.db
      .query("schedulers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (!scheduler) return null;

    return {
      name: scheduler.name,
      frequencyDays: scheduler.frequencyDays,
      recipientEmail: scheduler.recipientEmail,
      isActive: scheduler.isActive,
      lastRunAt: scheduler.lastRunAt ?? null,
      nextRunAt: scheduler.nextRunAt,
    };
  },
});

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
 * getMemberWorkloadPYAgent: Returns a detailed breakdown of each team member's current task and issue assignments.
 * Specially for Python Agent where we pass projectId as string.
 */
export const getMemberWorkloadPYAgent = internalQuery({
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
  },
});

/**
 * getMemberWorkload: Returns a detailed breakdown of each team member's current task and issue assignments.
 * returns: Array<{ name: string, role: string, tasks: Array<{ title: string, priority: string, status: string }>, totalTasks: number, issues: Array<{ title: string, status: string }>, totalIssues: number }>
 */
export const getMemberWorkload = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
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

/** Get all tasks for a project */
export const getProjectTasksFull = internalQuery({
  args: { projectId: v.id("projects"), sprintId: v.optional(v.id("sprints")) },
  handler: async (ctx, args) => {
    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
    if (args.sprintId) {
      tasks = tasks.filter((t) => t.sprintId === args.sprintId);
    }
    return tasks;
  },
});

/** Get all issues for a project */
export const getProjectIssuesFull = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

/** Get all members for a project */
export const getProjectMembersFull = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

/** Authenticate an API key */
export const authenticateApiKey = internalQuery({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    const keyRecord = await ctx.db
      .query("userApiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.apiKey))
      .unique();
    if (!keyRecord) return null;
    const user = await ctx.db.get(keyRecord.userId);
    if (!user) return null;
    return {
      id: user._id,
      name: user.name ?? "Unknown",
      email: (user as any).email,
      accountType: (user as any).accountType,
      avatarUrl: user.avatarUrl,
      apiKeyId: keyRecord._id,
    };
  },
});

/** Touch API Key Last Used */
export const touchApiKeyLastUsed = internalMutation({
  args: { apiKeyId: v.id("userApiKeys") },
  handler: async () => {
    // No-op since lastUsedAt is not in schema
  },
});

/** Mark Task As Issue */
export const markTaskAsIssueInternal = internalMutation({
  args: { taskId: v.id("tasks"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    await ctx.db.patch(args.taskId, { isBlocked: true, updatedAt: Date.now() });
    const issueId = await ctx.db.insert("issues", {
      title: task.title,
      description: task.description,
      fileLinked: task.linkWithCodebase,
      status: "not opened",
      type: "task-issue",
      projectId: task.projectId,
      taskId: task._id,
      createdByUserId: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const taskAssignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    await Promise.all(
      taskAssignees.map((a) =>
        ctx.db.insert("issueAssignees", {
          issueId,
          userId: a.userId,
          name: a.name,
          avatar: a.avatar,
          projectId: task.projectId,
        })
      )
    );
    return issueId;
  },
});

/** Delete Task */
export const deleteTaskInternal = internalMutation({
  args: { taskId: v.id("tasks"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");
    const assignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    await Promise.all(assignees.map((a) => ctx.db.delete(a._id)));
    const comments = await ctx.db
      .query("taskComments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    await Promise.all(comments.map((c) => ctx.db.delete(c._id)));
    const linkedIssues = await ctx.db
      .query("issues")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    await Promise.all(
      linkedIssues.map(async (issue) => {
        const issueAssignees = await ctx.db
          .query("issueAssignees")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();
        await Promise.all(issueAssignees.map((ia) => ctx.db.delete(ia._id)));
        const issueComments = await ctx.db
          .query("issueComments")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();
        await Promise.all(issueComments.map((ic) => ctx.db.delete(ic._id)));
        await ctx.db.delete(issue._id);
      })
    );
    await ctx.db.delete(args.taskId);
    return args.taskId;
  },
});

/** Delete Issue */
export const deleteIssueInternal = internalMutation({
  args: { issueId: v.id("issues"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");
    const assignees = await ctx.db
      .query("issueAssignees")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();
    await Promise.all(assignees.map((a) => ctx.db.delete(a._id)));
    const comments = await ctx.db
      .query("issueComments")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();
    await Promise.all(comments.map((c) => ctx.db.delete(c._id)));
    if (issue.type === "task-issue" && issue.taskId) {
      const linkedTask = await ctx.db.get(issue.taskId);
      if (linkedTask && linkedTask.isBlocked) {
        await ctx.db.patch(issue.taskId, { isBlocked: false, updatedAt: Date.now() });
      }
    }
    await ctx.db.delete(args.issueId);
    return args.issueId;
  },
});

/** Create Task */
export const createTaskInternal = internalMutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    description: v.optional(v.any()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    sprintId: v.optional(v.any()),
    estimation: v.optional(v.any()),
    type: v.optional(v.any()),
    linkWithCodebase: v.optional(v.any()),
    assigneeId: v.optional(v.any()),
    isBlocked: v.optional(v.boolean()),
    labels: v.optional(v.any()),
    dueDate: v.optional(v.any()),
    estimatedHours: v.optional(v.any()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId, sprintId, assigneeId, labels, dueDate, estimatedHours, ...rest } = args;
    
    const cleanRest: any = {};
    for (const [k, val] of Object.entries(rest)) {
      if (val !== null && val !== undefined) {
        cleanRest[k] = val;
      }
    }
    
    if (assigneeId) {
      const user = await ctx.db.get(assigneeId as any) as any;
      if (user) {
        cleanRest.assignedTo = [{ userId: user._id, name: user.name || "Unknown", avatar: user.avatarUrl }];
      }
    }

    const taskId = await ctx.db.insert("tasks", {
      ...cleanRest,
      status: (rest.status as any) || "not started",
      priority: (rest.priority as any) || "medium",
      sprintId: sprintId ? (sprintId as any) : undefined,
      createdByUserId: userId,
      estimation: rest.estimation || { startDate: Date.now(), endDate: Date.now() + 86400000 },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return taskId;
  }
});

/** Update Task */
export const updateTaskInternal = internalMutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.any()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    estimation: v.optional(v.any()),
    type: v.optional(v.any()),
    linkWithCodebase: v.optional(v.any()),
    assigneeId: v.optional(v.any()),
    isBlocked: v.optional(v.boolean()),
    sprintId: v.optional(v.any()),
    labels: v.optional(v.any()),
    dueDate: v.optional(v.any()),
    estimatedHours: v.optional(v.any()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { taskId, userId, labels, dueDate, estimatedHours, ...updates } = args;
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");
    
    let patchData: any = { updatedAt: Date.now() };
    for (const [k, val] of Object.entries(updates)) {
      if (k === "assigneeId") {
        if (val) {
          const user = await ctx.db.get(val as any) as any;
          if (user) {
            patchData.assignedTo = [{ userId: user._id, name: user.name || "Unknown", avatar: user.avatarUrl }];
          }
        } else if (val === "" || val === null) {
          patchData.assignedTo = undefined; // Clears the assignee
        }
        continue;
      }

      if (val === null) {
        patchData[k] = undefined;
      } else if (val !== undefined) {
        patchData[k] = val;
      }
    }
    
    await ctx.db.patch(taskId, patchData);
    const updatedTask = await ctx.db.get(taskId);
    return updatedTask;
  }
});

/** Update Issue */
export const updateIssueInternal = internalMutation({
  args: {
    issueId: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { issueId, userId, ...updates } = args;
    const issue = await ctx.db.get(issueId);
    if (!issue) throw new Error("Issue not found");
    
    let patchData: any = { updatedAt: Date.now() };
    if (updates.title !== undefined) patchData.title = updates.title;
    if (updates.description !== undefined) patchData.description = updates.description;
    if (updates.status !== undefined) patchData.status = updates.status;
    if (updates.priority !== undefined) patchData.severity = updates.priority; // map priority to severity
    
    await ctx.db.patch(issueId, patchData);
    
    if (updates.status === "closed" && issue.taskId && issue.type === "task-issue") {
       await ctx.db.patch(issue.taskId, { isBlocked: false, updatedAt: Date.now() });
    }
    const updatedIssue = await ctx.db.get(issueId);
    return updatedIssue;
  }
});

/** Get all projects for a user */
export const getUserProjectsFull = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberRecords = await ctx.db
      .query("projectMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    const projects = await Promise.all(
      memberRecords.map((m) => ctx.db.get(m.projectId))
    );
    return projects.filter((p) => p !== null);
  },
});

/** Get all sprints for a project */
export const getProjectSprintsFull = internalQuery({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});
