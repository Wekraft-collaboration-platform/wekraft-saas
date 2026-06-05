import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ─────────────────────────────────────────────────────────────
// RATE LIMIT CONFIGURATION
// ─────────────────────────────────────────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000;   // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60;    // 60 requests per minute per key

// ─────────────────────────────────────────────────────────────
// SECURITY HELPERS (Internal Transaction Context)
// ─────────────────────────────────────────────────────────────
async function isProjectMemberHelper(ctx: any, userId: any, projectId: any): Promise<boolean> {
  const project = await ctx.db.get(projectId);
  if (!project) return false;
  if (project.ownerId === userId) return true;

  const member = await ctx.db
    .query("projectMembers")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("projectId"), projectId))
    .unique();
  return member !== null;
}

// ─────────────────────────────────────────────────────────────
// UNIFIED AUTHENTICATION & RATE LIMITING MUTATION
// Combines 3 database calls (lookup, rate limit, touch) into 1 round-trip!
// ─────────────────────────────────────────────────────────────
export const authenticateKeyInternal = internalMutation({
  args: { apiKey: v.string() },
  handler: async (ctx, args) => {
    // 1. Lookup API key record
    const keyRecord = await ctx.db
      .query("userApiKeys")
      .withIndex("by_key", (q) => q.eq("key", args.apiKey))
      .unique();
    if (!keyRecord || keyRecord.revokedAt) {
      return { ok: false, error: "Invalid or revoked API key", status: 401 };
    }

    // 2. Fetch User document
    const user = await ctx.db.get(keyRecord.userId);
    if (!user) {
      return { ok: false, error: "User not found", status: 401 };
    }

    // 3. Sliding-window Rate Limit Check & Increment
    const now = Date.now();
    const windowStart = now - (now % RATE_LIMIT_WINDOW_MS);
    const existing = await ctx.db
      .query("apiKeyRateLimits")
      .withIndex("by_key_window", (q) =>
        q.eq("apiKeyId", keyRecord._id).eq("windowStart", windowStart)
      )
      .unique();

    if (existing) {
      if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
        return { ok: false, error: "rate_limit_exceeded", status: 429 };
      }
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
    } else {
      await ctx.db.insert("apiKeyRateLimits", {
        apiKeyId: keyRecord._id,
        windowStart,
        count: 1,
      });
    }

    // 4. Touch last used timestamp
    await ctx.db.patch(keyRecord._id, { lastUsedAt: now });

    return {
      ok: true,
      userId: user._id,
      apiKeyId: keyRecord._id,
      safeUser: {
        id: user._id,
        name: user.name ?? "Unknown",
        avatarUrl: user.avatarUrl,
        accountType: user.accountType,
      },
    };
  },
});

// ─────────────────────────────────────────────────────────────
// DATA READS (Includes built-in project authorization check)
// ─────────────────────────────────────────────────────────────

/** All projects the user belongs to (owner or member) */
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
    const validProjects = projects.filter((p) => p !== null) as NonNullable<typeof projects[number]>[];

    // Fetch projectDetails for each project to get the real deadline (targetDate)
    const withDeadlines = await Promise.all(
      validProjects.map(async (p) => {
        const detail = await ctx.db
          .query("projectDetails")
          .withIndex("by_project", (q) => q.eq("projectId", p._id))
          .unique();
        return {
          ...p,
          projectDeadline: detail?.targetDate ?? null,
        };
      })
    );
    return withDeadlines;
  },
});

/** All sprints for a project (authorized) */
export const getProjectSprintsFull = internalQuery({
  args: { projectId: v.id("projects"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const isMember = await isProjectMemberHelper(ctx, args.userId, args.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

    return await ctx.db
      .query("sprints")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

/** All tasks for a project, with assignees joined in (authorized) */
export const getProjectTasksFull = internalQuery({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    sprintId: v.optional(v.id("sprints")),
  },
  handler: async (ctx, args) => {
    const isMember = await isProjectMemberHelper(ctx, args.userId, args.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    if (args.sprintId) {
      tasks = tasks.filter((t) => t.sprintId === args.sprintId);
    }

    const taskAssignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return tasks.map((t) => ({
      ...t,
      assignedTo: taskAssignees
        .filter((a) => a.taskId === t._id)
        .map((a) => ({ userId: a.userId, name: a.name, avatar: a.avatar })),
    }));
  },
});

/** All issues for a project, with assignees joined in (authorized) */
export const getProjectIssuesFull = internalQuery({
  args: { projectId: v.id("projects"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const isMember = await isProjectMemberHelper(ctx, args.userId, args.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const issueAssignees = await ctx.db
      .query("issueAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return issues.map((i) => ({
      ...i,
      IssueAssignee: issueAssignees.filter((ia) => ia.issueId === i._id),
    }));
  },
});

/** All project members (authorized) */
export const getProjectMembersFull = internalQuery({
  args: { projectId: v.id("projects"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const isMember = await isProjectMemberHelper(ctx, args.userId, args.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

    return await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();
  },
});

// ─────────────────────────────────────────────────────────────
// MUTATIONS (Includes built-in project authorization checks)
// ─────────────────────────────────────────────────────────────

/** Mark a task as blocked and create a linked issue from it (authorized) */
export const markTaskAsIssueInternal = internalMutation({
  args: { taskId: v.id("tasks"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const isMember = await isProjectMemberHelper(ctx, args.userId, task.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

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

    // Mirror task assignees to the new issue
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

/** Delete a task and all its related records (authorized) */
export const deleteTaskInternal = internalMutation({
  args: { taskId: v.id("tasks"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const isMember = await isProjectMemberHelper(ctx, args.userId, task.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

    // Delete assignees
    const assignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    await Promise.all(assignees.map((a) => ctx.db.delete(a._id)));

    // Delete comments
    const comments = await ctx.db
      .query("taskComments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    await Promise.all(comments.map((c) => ctx.db.delete(c._id)));

    // Delete linked issues
    const linkedIssues = await ctx.db
      .query("issues")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    await Promise.all(
      linkedIssues.map(async (issue) => {
        const ia = await ctx.db
          .query("issueAssignees")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();
        await Promise.all(ia.map((x) => ctx.db.delete(x._id)));
        const ic = await ctx.db
          .query("issueComments")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();
        await Promise.all(ic.map((x) => ctx.db.delete(x._id)));
        await ctx.db.delete(issue._id);
      })
    );

    await ctx.db.delete(args.taskId);
    return args.taskId;
  },
});

/** Delete an issue and all its related records (authorized) */
export const deleteIssueInternal = internalMutation({
  args: { issueId: v.id("issues"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    const isMember = await isProjectMemberHelper(ctx, args.userId, issue.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

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

    // If issue was blocking a task, unblock it
    if (issue.type === "task-issue" && issue.taskId) {
      const linkedTask = await ctx.db.get(issue.taskId);
      if (linkedTask?.isBlocked) {
        await ctx.db.patch(issue.taskId, { isBlocked: false, updatedAt: Date.now() });
      }
    }

    await ctx.db.delete(args.issueId);
    return args.issueId;
  },
});

/** Create a new task (authorized) */
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
    assigneeIds: v.optional(v.any()),
    isBlocked: v.optional(v.boolean()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId, sprintId, assigneeId, assigneeIds, ...rest } = args;

    const isMember = await isProjectMemberHelper(ctx, userId, rest.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

    let resolvedAssignees: { userId: any; name: string; avatar: any }[] = [];

    if (Array.isArray(assigneeIds) && assigneeIds.length > 0) {
      const users = await Promise.all(assigneeIds.map((id) => ctx.db.get(id as any)));
      resolvedAssignees = users
        .filter((u): u is NonNullable<typeof u> => u !== null)
        .map((u) => ({ userId: u._id, name: (u as any).name ?? "Unknown", avatar: (u as any).avatarUrl }));
    } else if (assigneeId) {
      const user = await ctx.db.get(assigneeId as any) as any;
      if (user) resolvedAssignees = [{ userId: user._id, name: user.name ?? "Unknown", avatar: user.avatarUrl }];
    }

    const taskId = await ctx.db.insert("tasks", {
      projectId: rest.projectId,
      title: rest.title,
      description: rest.description,
      status: (rest.status as any) ?? "not started",
      priority: (rest.priority as any) ?? "medium",
      type: rest.type,
      sprintId: sprintId as any,
      isBlocked: rest.isBlocked ?? false,
      linkWithCodebase: rest.linkWithCodebase,
      estimation: rest.estimation ?? { startDate: Date.now(), endDate: Date.now() + 86_400_000 },
      createdByUserId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (resolvedAssignees.length > 0) {
      await Promise.all(
        resolvedAssignees.map((a) =>
          ctx.db.insert("taskAssignees", {
            taskId,
            userId: a.userId,
            name: a.name,
            avatar: a.avatar,
            projectId: args.projectId,
          })
        )
      );
    }
    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found after creation");
    return {
      ...task,
      assignedTo: resolvedAssignees,
    };
  },
});

/** Update a task's fields and re-sync the taskAssignees join table (authorized) */
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
    assigneeIds: v.optional(v.any()),
    isBlocked: v.optional(v.boolean()),
    sprintId: v.optional(v.any()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { taskId, userId, assigneeId, assigneeIds, ...updates } = args;

    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    const isMember = await isProjectMemberHelper(ctx, userId, task.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

    const patchData: Record<string, any> = { updatedAt: Date.now() };

    // Resolve assignees
    let resolvedAssignees: { userId: any; name: string; avatar: any }[] | undefined;

    if (Array.isArray(assigneeIds)) {
      if (assigneeIds.length > 0) {
        const users = await Promise.all(assigneeIds.map((id) => ctx.db.get(id as any)));
        resolvedAssignees = users
          .filter((u): u is NonNullable<typeof u> => u !== null)
          .map((u) => ({ userId: u._id, name: (u as any).name ?? "Unknown", avatar: (u as any).avatarUrl }));
      } else {
        resolvedAssignees = [];
      }
    } else if (assigneeId !== undefined) {
      if (assigneeId) {
        const user = await ctx.db.get(assigneeId as any) as any;
        if (user) resolvedAssignees = [{ userId: user._id, name: user.name ?? "Unknown", avatar: user.avatarUrl }];
      } else {
        resolvedAssignees = [];
      }
    }

    // Build patch object from remaining fields
    for (const [k, val] of Object.entries(updates)) {
      if (val === null) patchData[k] = undefined;
      else if (val !== undefined) patchData[k] = val;
    }

    await ctx.db.patch(taskId, patchData);

    // Re-sync assignees join table
    if (resolvedAssignees !== undefined) {
      const existing = await ctx.db
        .query("taskAssignees")
        .withIndex("by_task", (q) => q.eq("taskId", taskId))
        .collect();
      await Promise.all(existing.map((a) => ctx.db.delete(a._id)));

      if (resolvedAssignees.length > 0) {
        await Promise.all(
          resolvedAssignees.map((a) =>
            ctx.db.insert("taskAssignees", {
              taskId,
              userId: a.userId,
              name: a.name,
              avatar: a.avatar,
              projectId: task.projectId,
            })
          )
        );
      }
    } else {
      const existing = await ctx.db
        .query("taskAssignees")
        .withIndex("by_task", (q) => q.eq("taskId", taskId))
        .collect();
      resolvedAssignees = existing.map((a) => ({
        userId: a.userId,
        name: a.name,
        avatar: a.avatar,
      }));
    }

    const updatedTask = await ctx.db.get(taskId);
    if (!updatedTask) throw new Error("Task not found after update");
    return {
      ...updatedTask,
      assignedTo: resolvedAssignees,
    };
  },
});

/** Create a new issue (authorized) */
export const createIssueInternal = internalMutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    environment: v.optional(
      v.union(v.literal("local"), v.literal("dev"), v.literal("staging"), v.literal("production"))
    ),
    severity: v.optional(
      v.union(v.literal("critical"), v.literal("medium"), v.literal("low"))
    ),
    due_date: v.optional(v.number()),
    status: v.union(
      v.literal("not opened"),
      v.literal("opened"),
      v.literal("reopened"),
      v.literal("closed"),
    ),
    type: v.union(v.literal("manual"), v.literal("task-issue"), v.literal("github")),
    githubIssueUrl: v.optional(v.string()),
    fileLinked: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    projectId: v.id("projects"),
    userId: v.id("users"),
    assignees: v.optional(
      v.array(v.object({ userId: v.id("users"), name: v.string(), avatar: v.optional(v.string()) }))
    ),
  },
  handler: async (ctx, args) => {
    const { assignees, userId, ...issueData } = args;

    const isMember = await isProjectMemberHelper(ctx, userId, issueData.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

    const issueId = await ctx.db.insert("issues", {
      ...issueData,
      createdByUserId: userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (assignees && assignees.length > 0) {
      await Promise.all(
        assignees.map((a) =>
          ctx.db.insert("issueAssignees", {
            issueId,
            userId: a.userId,
            name: a.name,
            avatar: a.avatar,
            projectId: args.projectId,
          })
        )
      );
    }

    const created = await ctx.db.get(issueId);
    if (!created) throw new Error("Failed to retrieve created issue");

    const issueAssignees = await ctx.db
      .query("issueAssignees")
      .withIndex("by_issue", (q) => q.eq("issueId", issueId))
      .collect();

    return { ...created, IssueAssignee: issueAssignees };
  },
});

/** Update an issue's fields and re-sync the issueAssignees join table (authorized) */
export const updateIssueInternal = internalMutation({
  args: {
    issueId: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("not opened"),
        v.literal("opened"),
        v.literal("reopened"),
        v.literal("closed"),
      )
    ),
    priority: v.optional(v.string()),
    severity: v.optional(
      v.union(v.literal("critical"), v.literal("medium"), v.literal("low"))
    ),
    environment: v.optional(
      v.union(v.literal("local"), v.literal("dev"), v.literal("staging"), v.literal("production"))
    ),
    due_date: v.optional(v.number()),
    fileLinked: v.optional(v.string()),
    assignees: v.optional(
      v.array(v.object({ userId: v.id("users"), name: v.string(), avatar: v.optional(v.string()) }))
    ),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { issueId, userId, assignees, priority, ...updates } = args;

    const issue = await ctx.db.get(issueId);
    if (!issue) throw new Error("Issue not found");

    const isMember = await isProjectMemberHelper(ctx, userId, issue.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

    const patchData: Record<string, any> = { updatedAt: Date.now() };

    for (const [k, val] of Object.entries(updates)) {
      if (val === null) patchData[k] = undefined;
      else if (val !== undefined) patchData[k] = val;
    }

    if (priority !== undefined) patchData.severity = priority;

    if (updates.status === "closed") {
      patchData.finalCompletedAt = Date.now();
      patchData.finalCompletedBy = userId;
      if (issue.type === "task-issue" && issue.taskId) {
        await ctx.db.patch(issue.taskId, { isBlocked: false, updatedAt: Date.now() });
      }
    } else if (updates.status !== undefined) {
      patchData.finalCompletedAt = undefined;
      patchData.finalCompletedBy = undefined;
    }

    await ctx.db.patch(issueId, patchData);

    // Re-sync assignees join table
    if (assignees !== undefined) {
      const existing = await ctx.db
        .query("issueAssignees")
        .withIndex("by_issue", (q) => q.eq("issueId", issueId))
        .collect();
      await Promise.all(existing.map((a) => ctx.db.delete(a._id)));

      await Promise.all(
        assignees.map((a) =>
          ctx.db.insert("issueAssignees", {
            issueId,
            userId: a.userId,
            name: a.name,
            avatar: a.avatar,
            projectId: issue.projectId,
          })
        )
      );
    }

    const updated = await ctx.db.get(issueId);
    if (!updated) throw new Error("Issue not found after update");

    const issueAssignees = await ctx.db
      .query("issueAssignees")
      .withIndex("by_issue", (q) => q.eq("issueId", issueId))
      .collect();

    return { ...updated, IssueAssignee: issueAssignees };
  },
});

// ─────────────────────────────────────────────────────────────
// TICKETS (Extension — my tickets for a project)
// ─────────────────────────────────────────────────────────────

/**
 * Returns all tickets in a project where the caller is the assignee OR creator.
 * Enriches each ticket with assignee and creator user data (name, avatarUrl).
 */
export const getMyTicketsFull = internalQuery({
  args: { projectId: v.id("projects"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const isMember = await isProjectMemberHelper(ctx, args.userId, args.projectId);
    if (!isMember) throw new Error("Forbidden: you are not a member of this project");

    // Fetch tickets assigned to OR created by this user
    const [assignedTickets, createdTickets] = await Promise.all([
      ctx.db
        .query("tickets")
        .withIndex("by_assignee", (q) => q.eq("assignedTo", args.userId))
        .filter((q) => q.eq(q.field("projectId"), args.projectId))
        .collect(),
      ctx.db
        .query("tickets")
        .withIndex("by_creator", (q) => q.eq("createdBy", args.userId))
        .filter((q) => q.eq(q.field("projectId"), args.projectId))
        .collect(),
    ]);

    // Merge and deduplicate by _id
    const seen = new Set<string>();
    const tickets = [...assignedTickets, ...createdTickets].filter((t) => {
      if (seen.has(t._id)) return false;
      seen.add(t._id);
      return true;
    });

    // Sort newest first
    tickets.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich with user data in one pass
    const userIds = [...new Set([
      ...tickets.map((t) => t.assignedTo),
      ...tickets.map((t) => t.createdBy),
    ])];
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));
    const userMap = new Map(
      users
        .filter(Boolean)
        .map((u) => [u!._id, { id: u!._id, name: u!.name ?? "Unknown", avatarUrl: u!.avatarUrl }])
    );

    return tickets.map((t) => ({
      id: t._id,
      projectId: t.projectId,
      body: t.body,
      status: t.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      createdBy: t.createdBy,
      assignedTo: t.assignedTo,
      assignee: userMap.get(t.assignedTo) ?? null,
      creator: userMap.get(t.createdBy) ?? null,
    }));
  },
});

/**
 * Close or reopen a ticket. Only the assignee or creator may do this.
 */
export const updateTicketStatusInternal = internalMutation({
  args: {
    ticketId: v.id("tickets"),
    userId: v.id("users"),
    status: v.union(v.literal("open"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const isAssignee = ticket.assignedTo === args.userId;
    const isCreator = ticket.createdBy === args.userId;
    if (!isAssignee && !isCreator) {
      throw new Error("Forbidden: only the assignee or creator can change this ticket");
    }

    await ctx.db.patch(args.ticketId, { status: args.status, updatedAt: Date.now() });

    const updated = await ctx.db.get(args.ticketId);
    if (!updated) throw new Error("Ticket not found after update");

    const [assigneeUser, creatorUser] = await Promise.all([
      ctx.db.get(updated.assignedTo),
      ctx.db.get(updated.createdBy),
    ]);

    return {
      id: updated._id,
      projectId: updated.projectId,
      body: updated.body,
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      createdBy: updated.createdBy,
      assignedTo: updated.assignedTo,
      assignee: assigneeUser ? { id: assigneeUser._id, name: assigneeUser.name ?? "Unknown", avatarUrl: assigneeUser.avatarUrl } : null,
      creator: creatorUser ? { id: creatorUser._id, name: creatorUser.name ?? "Unknown", avatarUrl: creatorUser.avatarUrl } : null,
    };
  },
});

