import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// =======================================
// CREATING TASK WITH NO ISSUE INITIAL
// =======================================
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.optional(v.object({ label: v.string(), color: v.string() })), // Custom tag
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    ),
    assignees: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          name: v.string(),
          avatar: v.optional(v.string()),
        }),
      ),
    ),
    status: v.union(
      v.literal("not started"),
      v.literal("inprogress"),
      v.literal("reviewing"),
      v.literal("testing"),
      v.literal("completed"),
    ),
    estimation: v.object({
      startDate: v.number(),
      endDate: v.number(),
    }),
    linkWithCodebase: v.optional(v.string()),
    projectId: v.id("projects"),
    sprintId: v.optional(v.id("sprints")),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
          size: v.optional(v.number()),
        }),
      ),
    ),
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

    const { assignees, ...taskData } = args;

    const taskId = await ctx.db.insert("tasks", {
      ...taskData,
      createdByUserId: user._id,
      isBlocked: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Handle Assignees
    if (assignees && assignees.length > 0) {
      await Promise.all(
        assignees.map((assignee) =>
          ctx.db.insert("taskAssignees", {
            taskId,
            userId: assignee.userId,
            name: assignee.name,
            avatar: assignee.avatar,
            projectId: args.projectId,
          }),
        ),
      );

    }

    return taskId;
  },
});

//=======================================
// GETTING TASKS WITH PAGINATION
//=======================================
export const getTasks = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.neq(q.field("status"), "issue"))
      .take(args.limit ?? 10);

    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        const assignees = await ctx.db
          .query("taskAssignees")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect();
        return { ...task, assignees: assignees };
      }),
    );

    return tasksWithAssignees;
  },
});

// --------------------------------------------
export const getTimelineTasks = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        const assignees = await ctx.db
          .query("taskAssignees")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect();
        return { ...task, assignees: assignees };
      }),
    );

    return tasksWithAssignees;
  },
});

// --------------------------------------------
export const createComment = mutation({
  args: {
    taskId: v.id("tasks"),
    comment: v.string(),
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

    const commentId = await ctx.db.insert("taskComments", {
      taskId: args.taskId,
      userId: user._id,
      userName: user.name || "Anonymous",
      userImage: user.avatarUrl,
      comment: args.comment,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // ── @mention detection ──────────────────────────────────────────────────
    // Parses "@username" patterns and notifies each mentioned user once.
    const mentionRegex = /@([\w-]+)/g;
    const mentionedNames = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(args.comment)) !== null) {
      mentionedNames.add(match[1].toLowerCase());
    }

    if (mentionedNames.size > 0) {
      const task = await ctx.db.get(args.taskId);
      if (task) {
        const project = await ctx.db.get(task.projectId);
        for (const mentionName of mentionedNames) {
          const mentionedUser = await ctx.db
            .query("users")
            .withIndex("by_name", (q) => q.eq("name", mentionName))
            .unique();

          if (mentionedUser && project) {
            await ctx.runMutation(internal.notifications.notifyMentioned, {
              actorId: user._id,
              actorName: user.name ?? "Someone",
              actorAvatar: user.avatarUrl,
              mentionedUserId: mentionedUser._id,
              projectId: task.projectId,
              projectName: project.projectName,
              entityId: args.taskId as string,
              entityTitle: task.title,
              context: "task",
            });
          }
        }
      }
    }

    return commentId;
  },
});

export const getComments = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("taskComments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .order("desc")
      .collect();
  },
});

// =============================================
// KANBAN STATUS UPDATES...
// =============================================
export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("not started"),
      v.literal("inprogress"),
      v.literal("reviewing"),
      v.literal("testing"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    if (args.status === "completed") {
      if (task.isBlocked) {
        return;
      }

      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) =>
          q.eq("clerkToken", identity.tokenIdentifier),
        )
        .unique();

      if (!user) throw new Error("User not found");

      await ctx.db.patch(args.taskId, {
        status: args.status,
        finalCompletedAt: Date.now(),
        finalCompletedBy: user._id,
        updatedAt: Date.now(),
      });

    } else {
      await ctx.db.patch(args.taskId, {
        status: args.status,
        finalCompletedAt: undefined,
        finalCompletedBy: undefined,
        updatedAt: Date.now(),
      });
    }
  },
});

// =============================================
// TASK ASSIGNEES UPDATES...
// =============================================
export const updateTaskAssignees = mutation({
  args: {
    taskId: v.id("tasks"),
    assignees: v.array(
      v.object({
        userId: v.id("users"),
        name: v.string(),
        avatar: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // 1. Delete existing assignees
    const existingAssignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    await Promise.all(existingAssignees.map((a) => ctx.db.delete(a._id)));

    // 2. Insert new assignees
    await Promise.all(
      args.assignees.map((assignee) =>
        ctx.db.insert("taskAssignees", {
          taskId: args.taskId,
          userId: assignee.userId,
          name: assignee.name,
          avatar: assignee.avatar,
          projectId: task.projectId,
        }),
      ),
    );


    await ctx.db.patch(args.taskId, {
      updatedAt: Date.now(),
    });
  },
});

// =============================================
// MARK TASK AS ISSUE
// =============================================
export const markTaskAsIssue = mutation({
  args: {
    taskId: v.id("tasks"),
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

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    // 1. Update task to isBlocked: true
    await ctx.db.patch(args.taskId, {
      isBlocked: true,
      updatedAt: Date.now(),
    });

    // 2. Create issue
    const issueId = await ctx.db.insert("issues", {
      title: task.title,
      description: task.description,
      fileLinked: task.linkWithCodebase,
      status: "not opened",
      type: "task-issue",
      projectId: task.projectId,
      taskId: task._id,
      createdByUserId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 3. Move assignees from task to issue
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
        }),
      ),
    );

    return issueId;
  },
});

// =======================================
// EDITING TASK
// =======================================
export const editTask = mutation({
  args: {
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.object({ label: v.string(), color: v.string() })),
    priority: v.optional(
      v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    ),
    assignees: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          name: v.string(),
          avatar: v.optional(v.string()),
        }),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal("not started"),
        v.literal("inprogress"),
        v.literal("reviewing"),
        v.literal("testing"),
        v.literal("completed"),
      ),
    ),
    estimation: v.optional(
      v.object({
        startDate: v.number(),
        endDate: v.number(),
      }),
    ),
    linkWithCodebase: v.optional(v.string()),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
          size: v.optional(v.number()),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { taskId, assignees, ...updateFields } = args;

    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    const patchData: any = {
      ...updateFields,
      updatedAt: Date.now(),
    };

    if (updateFields.status !== undefined) {
      if (updateFields.status === "completed") {
        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("clerkToken", identity.tokenIdentifier),
          )
          .unique();
        if (user) {
          patchData.finalCompletedAt = Date.now();
          patchData.finalCompletedBy = user._id;
        }
      } else {
        patchData.finalCompletedAt = undefined;
        patchData.finalCompletedBy = undefined;
      }
    }

    await ctx.db.patch(taskId, patchData);

    // Handle Assignees update if provided
    if (assignees !== undefined) {
      // 1. Delete existing assignees
      const existingAssignees = await ctx.db
        .query("taskAssignees")
        .withIndex("by_task", (q) => q.eq("taskId", taskId))
        .collect();

      await Promise.all(existingAssignees.map((a) => ctx.db.delete(a._id)));

      // 2. Insert new assignees
      await Promise.all(
        assignees.map((assignee) =>
          ctx.db.insert("taskAssignees", {
            taskId,
            userId: assignee.userId,
            name: assignee.name,
            avatar: assignee.avatar,
            projectId: task.projectId,
          }),
        ),
      );
    }

    return taskId;
  },
});

// =============================================
// GET PROJECT SCHEDULER
// =============================================
export const getProjectScheduler = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("schedulers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();
  },
});
// =============================================
// GET UNIQUE TAGS FOR A PROJECT
// =============================================
export const getUniqueTags = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const tagsMap = new Map<string, { label: string; color: string }>();

    tasks.forEach((task) => {
      if (task.type) {
        tagsMap.set(task.type.label, task.type);
      }
    });

    return Array.from(tagsMap.values());
  },
});

// =============================================
// GET MY TASKS (Paginated — for UserWorkTable)
// =============================================
export const getMyTasks = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()), // skip count
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { items: [], nextCursor: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return { items: [], nextCursor: null };

    const limit = args.limit ?? 10;
    const skip = args.cursor ?? 0;

    // 1. Find all taskAssignee rows for this user in this project
    const assignments = await ctx.db
      .query("taskAssignees")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();

    // 2. Get unique task IDs
    const taskIds = [...new Set(assignments.map((a) => a.taskId))];

    // 3. Fetch and filter out completed tasks
    const allUserTasks = await Promise.all(taskIds.map((id) => ctx.db.get(id)));
    const activeTasks = allUserTasks.filter(
      (t): t is any => t !== null && t.status !== "completed",
    );

    // 4. Paginate over activeTasks
    const paginatedTasks = activeTasks.slice(skip, skip + limit);

    const items = await Promise.all(
      paginatedTasks.map(async (task) => {
        const creator = await ctx.db.get(task.createdByUserId as Id<"users">);
        const assignees = await ctx.db
          .query("taskAssignees")
          .withIndex("by_task", (q) => q.eq("taskId", task._id))
          .collect();

        const assigneesWithAvatars = await Promise.all(
          assignees.map(async (a) => {
            const u = await ctx.db.get(a.userId);
            return {
              userId: a.userId,
              name: u?.name || a.name,
              avatar: u?.avatarUrl || a.avatar,
            };
          }),
        );

        return {
          _id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          estimation: task.estimation,
          isBlocked: task.isBlocked,
          creator: creator
            ? { name: creator.name, avatar: creator.avatarUrl }
            : undefined,
          assignees: assigneesWithAvatars,
        };
      }),
    );

    const nextCursor = skip + limit < activeTasks.length ? skip + limit : null;

    return { items, nextCursor };
  },
});

// =============================================
// GET MY ISSUES (Paginated — for UserWorkTable)
// =============================================
export const getMyIssues = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { items: [], nextCursor: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return { items: [], nextCursor: null };

    const limit = args.limit ?? 10;
    const skip = args.cursor ?? 0;

    // 1. Find all issueAssignee rows for this user in this project
    const assignments = await ctx.db
      .query("issueAssignees")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .collect();

    // 2. Get unique issue IDs
    const issueIds = [...new Set(assignments.map((a) => a.issueId))];

    // 3. Paginate
    const paginatedIds = issueIds.slice(skip, skip + limit);

    // 4. Fetch lean issue data
    const items = (
      await Promise.all(
        paginatedIds.map(async (issueId) => {
          const issue = await ctx.db.get(issueId);
          if (!issue) return null;

          const creator = await ctx.db.get(issue.createdByUserId);
          const assignees = await ctx.db
            .query("issueAssignees")
            .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
            .collect();

          return {
            _id: issue._id,
            title: issue.title,
            description: issue.description,
            severity: issue.severity,
            status: issue.status,
            due_date: issue.due_date,
            environment: issue.environment,
            type: issue.type,
            creator: creator
              ? { name: creator.name, avatar: creator.avatarUrl }
              : undefined,
            assignees: await Promise.all(
              assignees.map(async (a) => {
                const u = await ctx.db.get(a.userId);
                return {
                  userId: a.userId,
                  name: u?.name || a.name,
                  avatar: u?.avatarUrl || a.avatar,
                };
              }),
            ),
          };
        }),
      )
    ).filter(Boolean);

    const nextCursor = skip + limit < issueIds.length ? skip + limit : null;

    return { items, nextCursor };
  },
});

// =============================================
// GET MY TICKETS (Paginated — for UserWorkTable)
// =============================================
export const getMyTickets = query({
  args: {
    projectId: v.id("projects"),
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { items: [], nextCursor: null };

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) return { items: [], nextCursor: null };

    const limit = args.limit ?? 10;
    const skip = args.cursor ?? 0;

    const allUserTickets = await ctx.db
      .query("tickets")
      .withIndex("by_assignee", (q) => q.eq("assignedTo", user._id))
      .filter((q) => q.eq(q.field("projectId"), args.projectId))
      .order("desc")
      .collect();

    const paginatedTickets = allUserTickets.slice(skip, skip + limit);

    const items = await Promise.all(
      paginatedTickets.map(async (ticket) => {
        const creator = await ctx.db.get(ticket.createdBy);
        const assignee = await ctx.db.get(ticket.assignedTo);

        return {
          _id: ticket._id,
          body: ticket.body,
          status: ticket.status,
          createdAt: ticket.createdAt,
          creator: creator
            ? { name: creator.name, avatar: creator.avatarUrl }
            : undefined,
          assignee: assignee
            ? { name: assignee.name, avatar: assignee.avatarUrl }
            : undefined,
        };
      }),
    );

    const nextCursor = skip + limit < allUserTickets.length ? skip + limit : null;

    return { items, nextCursor };
  },
});

// =============================================
// DELETE TASKS (Bulk)
// =============================================
export const deleteTasks = mutation({
  args: {
    taskIds: v.array(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    await Promise.all(
      args.taskIds.map(async (taskId) => {
        // 1. Delete task assignees
        const assignees = await ctx.db
          .query("taskAssignees")
          .withIndex("by_task", (q) => q.eq("taskId", taskId))
          .collect();
        await Promise.all(assignees.map((a) => ctx.db.delete(a._id)));

        // 2. Delete task comments
        const comments = await ctx.db
          .query("taskComments")
          .withIndex("by_task", (q) => q.eq("taskId", taskId))
          .collect();
        await Promise.all(comments.map((c) => ctx.db.delete(c._id)));

        // 3. Delete the task itself
                // 3. Free attachment storage
        const task = await ctx.db.get(taskId);
        if (task) {
          const currentAttachments = task.attachments ?? [];
          let totalSizeToFree = 0;
          for (const att of currentAttachments) {
            if (att.size) {
              totalSizeToFree += att.size;
            }
          }
          if (totalSizeToFree > 0) {
            const project = await ctx.db.get(task.projectId);
            if (project) {
              const owner = await ctx.db.get(project.ownerId);
              if (owner) {
                const currentUsage = owner.cloudStorageUsage ?? 0;
                await ctx.db.patch(owner._id, {
                  cloudStorageUsage: Math.max(0, currentUsage - totalSizeToFree),
                  updatedAt: Date.now(),
                });
              }
            }
          }
        }
        await ctx.db.delete(taskId);
      }),
    );
  },
});

export const addTaskAttachment = mutation({
  args: {
    taskId: v.id("tasks"),
    name: v.string(),
    url: v.string(),
    size: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const currentAttachments = task.attachments ?? [];

    await ctx.db.patch(args.taskId, {
      attachments: [...currentAttachments, { name: args.name, url: args.url, size: args.size }],
      updatedAt: Date.now(),
    });
  },
});

export const removeTaskAttachment = mutation({
  args: {
    taskId: v.id("tasks"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("Task not found");

    const currentAttachments = task.attachments ?? [];
    const newAttachments = currentAttachments.filter((a) => a.url !== args.url);

    // Decrement owner storage
    const removedAttachment = currentAttachments.find((a) => a.url === args.url);
    if (removedAttachment && removedAttachment.size) {
      const project = await ctx.db.get(task.projectId);
      if (project) {
        const owner = await ctx.db.get(project.ownerId);
        if (owner) {
          const currentUsage = owner.cloudStorageUsage ?? 0;
          await ctx.db.patch(owner._id, {
            cloudStorageUsage: Math.max(0, currentUsage - removedAttachment.size),
            updatedAt: Date.now(),
          });
        }
      }
    }

    await ctx.db.patch(args.taskId, {
      attachments: newAttachments,
      updatedAt: Date.now(),
    });
  },
});

// =============================================
// GET PROJECT CONTRIBUTIONS (For Radar Chart)
// =============================================
export const getProjectContributions = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch completed work for the whole project
    const completedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_project_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "completed"),
      )
      .collect();

    const resolvedIssues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.eq(q.field("status"), "closed"))
      .collect();

    // 2. Aggregate counts in memory
    const userStats: Record<string, { tasks: number; issues: number }> = {};

    completedTasks.forEach((t) => {
      const uid = t.finalCompletedBy;
      if (!uid) return;
      const uidStr = uid.toString();
      if (!userStats[uidStr]) userStats[uidStr] = { tasks: 0, issues: 0 };
      userStats[uidStr].tasks++;
    });

    resolvedIssues.forEach((i) => {
      const uid = i.finalCompletedBy;
      if (!uid) return;
      const uidStr = uid.toString();
      if (!userStats[uidStr]) userStats[uidStr] = { tasks: 0, issues: 0 };
      userStats[uidStr].issues++;
    });

    // 3. Get Top 3 performers purely by total work
    const topUserIds = Object.keys(userStats)
      .sort((a, b) => {
        const totalA = userStats[a].tasks + userStats[a].issues;
        const totalB = userStats[b].tasks + userStats[b].issues;
        return totalB - totalA;
      })
      .slice(0, 3);

    // 4. Fetch details for those 3
    return await Promise.all(
      topUserIds.map(async (uidStr) => {
        const userId = uidStr as Id<"users">;
        const user = await ctx.db.get(userId);
        const stats = userStats[uidStr];

        return {
          userId,
          name: user?.name || "Unknown",
          avatar: user?.avatarUrl || "",
          tasks: stats.tasks,
          issues: stats.issues,
          speed: Math.min(10, stats.tasks + 2),
          reliability: Math.min(10, stats.tasks + stats.issues),
        };
      }),
    );
  },
});

// =============================================
// GET ENVIRONMENTAL SEVERITY HEATMAP
// =============================================
export const getEnvironmentalSeverityHeatmap = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch all non-closed issues for the project
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) => q.neq(q.field("status"), "closed"))
      .collect();

    // 2. Define environments and severities
    const envs = ["production", "staging", "dev", "local"];

    // 3. Count issues per environment/severity
    return envs.map((env) => {
      const envIssues = issues.filter((i) => (i.environment || "dev") === env);
      return {
        environment: env.charAt(0).toUpperCase() + env.slice(1),
        total: envIssues.length,
        critical: envIssues.filter((i) => i.severity === "critical").length,
        medium: envIssues.filter((i) => i.severity === "medium").length,
        low: envIssues.filter((i) => i.severity === "low").length,
      };
    });
  },
});

// =============================================
// GET WEEKLY VELOCITY (This Week)
// =============================================
export const getWeeklyVelocity = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Calculate start of current week (Monday 00:00)
    const now = new Date();
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const monday = new Date(new Date().setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const mondayTs = monday.getTime();

    // 2. Fetch completed work since Monday
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "completed"),
      )
      .filter((q) => q.gte(q.field("finalCompletedAt"), mondayTs))
      .collect();

    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "closed"),
          q.gte(q.field("finalCompletedAt"), mondayTs),
        ),
      )
      .collect();

    // 3. Group by day (Mon-Sun)
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((name, i) => {
      const dayStart = mondayTs + i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      return {
        day: name,
        tasks: tasks.filter(
          (t) =>
            t.finalCompletedAt! >= dayStart && t.finalCompletedAt! < dayEnd,
        ).length,
        issues: issues.filter(
          (i) =>
            i.finalCompletedAt! >= dayStart && i.finalCompletedAt! < dayEnd,
        ).length,
      };
    });
  },
});

// =============================================
// GET MEMBER WORKLOAD (For Resource Leveling)
// =============================================
export const getMemberWorkload = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Get all active tasks for the project
    // We fetch each active status separately to leverage indexes
    const activeStatuses = [
      "not started",
      "inprogress",
      "reviewing",
      "testing",
    ];

    const activeTasksResults = await Promise.all(
      activeStatuses.map((status) =>
        ctx.db
          .query("tasks")
          .withIndex("by_project_status", (q) =>
            q.eq("projectId", args.projectId).eq("status", status as any),
          )
          .collect(),
      ),
    );

    const activeTasks = activeTasksResults.flat();
    if (activeTasks.length === 0) return [];

    const taskIds = activeTasks.map((t) => t._id);
    const tasksMap = new Map(activeTasks.map((t) => [t._id, t]));

    // 2. Get all assignees for these active tasks
    // Fetching assignees for the project is faster than per task
    const projectAssignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // 3. Aggregate workload
    const memberWorkload: Record<
      string,
      {
        userId: string;
        name: string;
        avatar: string;
        high: number;
        medium: number;
        low: number;
        total: number;
      }
    > = {};

    projectAssignees.forEach((a) => {
      const task = tasksMap.get(a.taskId);
      if (!task) return; // Not an active task

      if (!memberWorkload[a.userId]) {
        memberWorkload[a.userId] = {
          userId: a.userId,
          name: a.name,
          avatar: a.avatar || "",
          high: 0,
          medium: 0,
          low: 0,
          total: 0,
        };
      }

      const priority = (task.priority || "low") as "high" | "medium" | "low";
      memberWorkload[a.userId][priority]++;
      memberWorkload[a.userId].total++;
    });

    // 4. Sort by total workload and take top 15 (max team size)
    return Object.values(memberWorkload)
      .sort((a, b) => b.total - a.total)
      .slice(0, 15);
  },
});

// =============================================
// GET WEEKLY ENGAGEMENT GRID (completions of tasks & issues)
// =============================================
export const getWeeklyEngagement = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch project members
    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    // 2. Fetch completed tasks and closed issues in the last 12 days
    const now = new Date();
    const twelveDaysAgo = new Date();
    twelveDaysAgo.setDate(now.getDate() - 11);
    twelveDaysAgo.setHours(0, 0, 0, 0);
    const startTs = twelveDaysAgo.getTime();

    const completedTasks = await ctx.db
      .query("tasks")
      .withIndex("by_project_status", (q) =>
        q.eq("projectId", args.projectId).eq("status", "completed")
      )
      .filter((q) => q.gte(q.field("finalCompletedAt"), startTs))
      .collect();

    const closedIssues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "closed"),
          q.gte(q.field("finalCompletedAt"), startTs)
        )
      )
      .collect();

    // 3. Generate the 12 days timestamps & labels (X-axis labels: days)
    const days: { label: string; startTs: number; endTs: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(twelveDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      days.push({
        label: d.getDate().toString(), // e.g. "18", "19", etc.
        startTs: dayStart.getTime(),
        endTs: dayEnd.getTime(),
      });
    }

    // 4. Map contributions per member per day
    const memberEngagement = members.map((m) => {
      // Initials (e.g. "Rox" -> "ROX" or first letters)
      const nameParts = m.userName.trim().split(/\s+/);
      let initials = "";
      if (nameParts.length >= 2) {
        initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
      } else if (nameParts[0]) {
        initials = nameParts[0].slice(0, 3).toUpperCase();
      }

      const dailyActivity = days.map((day) => {
        const tasksCount = completedTasks.filter(
          (t) =>
            t.finalCompletedBy === m.userId &&
            t.finalCompletedAt! >= day.startTs &&
            t.finalCompletedAt! <= day.endTs
        ).length;

        const issuesCount = closedIssues.filter(
          (i) =>
            i.finalCompletedBy === m.userId &&
            i.finalCompletedAt! >= day.startTs &&
            i.finalCompletedAt! <= day.endTs
        ).length;

        return {
          tasks: tasksCount,
          issues: issuesCount,
          total: tasksCount + issuesCount,
        };
      });

      return {
        userId: m.userId,
        name: m.userName,
        avatar: m.userImage || "",
        initials,
        dailyActivity,
      };
    });

    return {
      days: days.map((d) => d.label),
      members: memberEngagement,
    };
  },
});

// =============================================
// CREATE TICKET
// =============================================
export const createTicket = mutation({
  args: {
    projectId: v.id("projects"),
    body: v.string(),
    assignedTo: v.id("users"),
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

    const ticketId = await ctx.db.insert("tickets", {
      projectId: args.projectId,
      body: args.body,
      createdBy: user._id,
      assignedTo: args.assignedTo,
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return ticketId;
  },
});

// =============================================
// GET TICKETS (with creator and assignee resolved)
// =============================================
export const getTickets = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const tickets = await ctx.db
      .query("tickets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    return await Promise.all(
      tickets.map(async (ticket) => {
        const creator = await ctx.db.get(ticket.createdBy);
        const assignee = await ctx.db.get(ticket.assignedTo);
        return {
          ...ticket,
          creator: creator ? { name: creator.name, avatar: creator.avatarUrl } : null,
          assignee: assignee ? { name: assignee.name, avatar: assignee.avatarUrl } : null,
        };
      }),
    );
  },
});

// =============================================
// UPDATE TICKET STATUS
// =============================================
export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.union(v.literal("open"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found");

    await ctx.db.patch(args.ticketId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
