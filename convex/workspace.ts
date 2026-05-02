import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
      type: "manual",
      projectId: task.projectId,
      taskId: task._id,
      createdByUserId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // 3. Move assignees from task to issue (Optional but consistent)
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
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const { taskId, assignees, ...updateFields } = args;

    const task = await ctx.db.get(taskId);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(taskId, {
      ...updateFields,
      updatedAt: Date.now(),
    });

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
