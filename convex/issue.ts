import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";

// =============================
// 1. CREATE ISSUE
// =============================
export const createIssue = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
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
    due_date: v.optional(v.number()),
    status: v.union(
      v.literal("not opened"),
      v.literal("opened"),
      v.literal("reopened"),
      v.literal("closed"),
    ),
    type: v.union(
      v.literal("manual"),
      v.literal("task-issue"),
      v.literal("github"),
    ),
    githubIssueUrl: v.optional(v.string()),
    fileLinked: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    projectId: v.id("projects"),
    assignees: v.optional(
      v.array(
        v.object({
          userId: v.id("users"),
          name: v.string(),
          avatar: v.optional(v.string()),
        }),
      ),
    ),
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
          size: v.optional(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("clerkToken", identity.tokenIdentifier),
      )
      .unique();

    if (!user) throw new Error("User not found");

    const { assignees, ...issueData } = args;

    const issueId = await ctx.db.insert("issues", {
      ...issueData,
      createdByUserId: user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Handle Assignees
    if (assignees && assignees.length > 0) {
      await Promise.all(
        assignees.map((assignee) =>
          ctx.db.insert("issueAssignees", {
            issueId,
            userId: assignee.userId,
            name: assignee.name,
            avatar: assignee.avatar,
            projectId: args.projectId,
          }),
        ),
      );

    }


    return issueId;
  },
});

// =============================
// 2. GET ISSUES (PAGINATED)
// =============================
export const getIssues = query({
  args: {
    projectId: v.id("projects"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .paginate(args.paginationOpts);

    const issuesWithAssignees = await Promise.all(
      results.page.map(async (issue) => {
        const assignees = await ctx.db
          .query("issueAssignees")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();
        return { ...issue, assignedTo: assignees };
      }),
    );

    return { ...results, page: issuesWithAssignees };
  },
});

// =============================
// 3. GET ISSUES FOR KANBAN BOARD
// — Returns all project issues (all types) with their assignees.
// — No pagination: Kanban renders all at once grouped by status column.
// =============================
export const getIssuesForKanban = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    // Fetch ALL issues for this project, ordered by creation time desc
    const issues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();

    // For each issue, also fetch its assignees from the join table
    const issuesWithAssignees = await Promise.all(
      issues.map(async (issue) => {
        const assignees = await ctx.db
          .query("issueAssignees")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();
        return { ...issue, assignedTo: assignees };
      }),
    );

    return issuesWithAssignees;
  },
});

// =============================
// 4. GET FILTERED ISSUES
// =============================
export const getFilteredIssues = query({
  args: {
    projectId: v.id("projects"),
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
    status: v.optional(
      v.union(
        v.literal("not opened"),
        v.literal("opened"),
        v.literal("in review"),
        v.literal("reopened"),
        v.literal("closed"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    let baseQuery = ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId));

    if (args.environment) {
      baseQuery = baseQuery.filter((q) =>
        q.eq(q.field("environment"), args.environment),
      );
    }
    if (args.severity) {
      baseQuery = baseQuery.filter((q) =>
        q.eq(q.field("severity"), args.severity),
      );
    }
    if (args.status) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("status"), args.status));
    }

    const issues = await baseQuery.order("desc").collect();

    const issuesWithAssignees = await Promise.all(
      issues.map(async (issue) => {
        const assignees = await ctx.db
          .query("issueAssignees")
          .withIndex("by_issue", (q) => q.eq("issueId", issue._id))
          .collect();
        return { ...issue, assignedTo: assignees };
      }),
    );

    return issuesWithAssignees;
  },
});

// =============================
// 5. UPDATE ISSUE STATUS (Kanban Drag-Drop)
// — Core mutation for drag-and-drop status changes.
// — When an issue is "closed" AND it was a "task-issue":
//     → The linked task's isBlocked flag is set back to false.
//     → This unblocks the task so it can be moved to completed.
// — When "closed": records finalCompletedAt + finalCompletedBy.
// =============================
export const updateIssueStatus = mutation({
  args: {
    issueId: v.id("issues"),
    status: v.union(
      v.literal("not opened"),
      v.literal("opened"),
      v.literal("reopened"),
      v.literal("closed"),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // Fetch the issue to validate it exists
    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    // Build the patch payload
    const patchData: any = {
      status: args.status,
      updatedAt: Date.now(),
    };

    if (args.status === "closed") {
      // Record who closed it and when
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

      // If this issue originated from a blocked task → unblock it
      // This lets the task be moved to "completed" on the Kanban task board.
      if (issue.type === "task-issue" && issue.taskId) {
        const linkedTask = await ctx.db.get(issue.taskId);
        if (linkedTask && linkedTask.isBlocked) {
          await ctx.db.patch(issue.taskId, {
            isBlocked: false,
            updatedAt: Date.now(),
          });
        }
      }
    } else {
      // Reopening or re-opening — clear the completion metadata
      patchData.finalCompletedAt = undefined;
      patchData.finalCompletedBy = undefined;
    }

    await ctx.db.patch(args.issueId, patchData);

    return args.issueId;
  },
});

// =============================
// 6. UPDATE ISSUE (Full Edit)
// =============================
export const updateIssue = mutation({
  args: {
    issueId: v.id("issues"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    fileLinked: v.optional(v.string()),
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
    due_date: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("not opened"),
        v.literal("opened"),
        v.literal("reopened"),
        v.literal("closed"),
      ),
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
    attachments: v.optional(
      v.array(
        v.object({
          name: v.string(),
          url: v.string(),
          size: v.optional(v.number()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { issueId, assignees, ...updates } = args;

    const existing = await ctx.db.get(issueId);
    if (!existing) throw new Error("Issue not found");

    const updateData: any = {
      ...updates,
      updatedAt: Date.now(),
    };

    if (updates.status === "closed") {
      updateData.finalCompletedAt = Date.now();
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("clerkToken", identity.tokenIdentifier),
          )
          .unique();
        if (user) {
          updateData.finalCompletedBy = user._id;
        }
      }

      // Unblock the linked task if it's a task-issue
      if (existing.type === "task-issue" && existing.taskId) {
        const linkedTask = await ctx.db.get(existing.taskId);
        if (linkedTask && linkedTask.isBlocked) {
          await ctx.db.patch(existing.taskId, {
            isBlocked: false,
            updatedAt: Date.now(),
          });
        }
      }
    }

    await ctx.db.patch(issueId, updateData);

    // Handle Assignees update if provided
    if (assignees !== undefined) {
      // 1. Delete existing assignees
      const existingAssignees = await ctx.db
        .query("issueAssignees")
        .withIndex("by_issue", (q) => q.eq("issueId", issueId))
        .collect();

      await Promise.all(existingAssignees.map((a) => ctx.db.delete(a._id)));

      // 2. Insert new assignees
      await Promise.all(
        assignees.map((assignee) =>
          ctx.db.insert("issueAssignees", {
            issueId,
            userId: assignee.userId,
            name: assignee.name,
            avatar: assignee.avatar,
            projectId: existing.projectId,
          }),
        ),
      );
    }

    return issueId;
  },
});

// =============================
// 7. CREATE ISSUE COMMENT
// =============================
export const createIssueComment = mutation({
  args: {
    issueId: v.id("issues"),
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

    const commentId = await ctx.db.insert("issueComments", {
      issueId: args.issueId,
      userId: user._id,
      userName: user.name || "Anonymous",
      userImage: user.avatarUrl,
      comment: args.comment,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // ── @mention detection ───────────────────────────────────────────────
    const mentionRegex = /@([\w-]+)/g;
    const mentionedNames = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = mentionRegex.exec(args.comment)) !== null) {
      mentionedNames.add(match[1].toLowerCase());
    }

    if (mentionedNames.size > 0) {
      const issue = await ctx.db.get(args.issueId);
      if (issue) {
        const project = await ctx.db.get(issue.projectId);
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
              projectId: issue.projectId,
              projectName: project.projectName,
              entityId: args.issueId as string,
              entityTitle: issue.title,
              context: "issue",
            });
          }
        }
      }
    }

    return commentId;
  },
});

// =============================
// 8. GET ISSUE COMMENTS
// =============================
export const getIssueComments = query({
  args: {
    issueId: v.id("issues"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("issueComments")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .order("desc")
      .collect();
  },
});

// =============================
// 9. DELETE ISSUE
// =============================
export const deleteIssue = mutation({
  args: {
    issueId: v.id("issues"),
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

    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    // Check project permissions
    const membership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", issue.projectId))
      .filter((q) => q.eq(q.field("userId"), user._id))
      .unique();

    const project = await ctx.db.get(issue.projectId);
    const isOwner = project?.ownerId === user._id;
    const isAdmin = membership?.AccessRole === "admin";

    if (!isOwner && !isAdmin) {
      throw new Error("Only the project owner or admin can delete this issue.");
    }

    // Unblock task if it was a task-issue
    if (issue.type === "task-issue" && issue.taskId) {
      const linkedTask = await ctx.db.get(issue.taskId);
      if (linkedTask && linkedTask.isBlocked) {
        await ctx.db.patch(issue.taskId, {
          isBlocked: false,
          updatedAt: Date.now(),
        });
      }
    }

    // Cascade delete assignees
    const assignees = await ctx.db
      .query("issueAssignees")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();
    await Promise.all(assignees.map((a) => ctx.db.delete(a._id)));

    // Cascade delete comments
    const comments = await ctx.db
      .query("issueComments")
      .withIndex("by_issue", (q) => q.eq("issueId", args.issueId))
      .collect();
    await Promise.all(comments.map((c) => ctx.db.delete(c._id)));

    // Free attachment storage
    const currentAttachments = issue.attachments ?? [];
    let totalSizeToFree = 0;
    for (const att of currentAttachments) {
      if (att.size) {
        totalSizeToFree += att.size;
      }
    }
    if (totalSizeToFree > 0 && project) {
      const owner = await ctx.db.get(project.ownerId);
      if (owner) {
        const currentUsage = owner.cloudStorageUsage ?? 0;
        await ctx.db.patch(owner._id, {
          cloudStorageUsage: Math.max(0, currentUsage - totalSizeToFree),
          updatedAt: Date.now(),
        });
      }
    }

    // Delete issue
    await ctx.db.delete(args.issueId);

    return args.issueId;
  },
});

export const addIssueAttachment = mutation({
  args: {
    issueId: v.id("issues"),
    name: v.string(),
    url: v.string(),
    size: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    const currentAttachments = issue.attachments ?? [];

    await ctx.db.patch(args.issueId, {
      attachments: [...currentAttachments, { name: args.name, url: args.url, size: args.size }],
      updatedAt: Date.now(),
    });
  },
});

export const removeIssueAttachment = mutation({
  args: {
    issueId: v.id("issues"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const issue = await ctx.db.get(args.issueId);
    if (!issue) throw new Error("Issue not found");

    const currentAttachments = issue.attachments ?? [];
    const newAttachments = currentAttachments.filter((a) => a.url !== args.url);

    // Decrement owner storage
    const removedAttachment = currentAttachments.find((a) => a.url === args.url);
    if (removedAttachment && removedAttachment.size) {
      const project = await ctx.db.get(issue.projectId);
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

    await ctx.db.patch(args.issueId, {
      attachments: newAttachments,
      updatedAt: Date.now(),
    });
  },
});
