import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export interface ResolvedMember {
  userId: Id<"users">;
  name: string;
  avatar?: string;
}

/**
 * Helper function: Resolves a project member name/mention against the database.
 * Supports exact match, prefix match, and substring search to prevent hallucinations.
 * Returns the resolved member with userId, name, and avatar, along with all active member names.
 */
export async function resolveProjectMember(
  ctx: any,
  projectId: Id<"projects">,
  inputName?: string,
): Promise<{ member: ResolvedMember | null; allMembers: string[] }> {
  const project = await ctx.db.get(projectId);
  if (!project) return { member: null, allMembers: [] };

  const members = await ctx.db
    .query("projectMembers")
    .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
    .collect();

  // Ensure owner is included in the searchable list
  const hasOwner = members.some((m: any) => m.userId === project.ownerId);
  if (!hasOwner) {
    const ownerUser = await ctx.db.get(project.ownerId);
    if (ownerUser) {
      members.push({
        projectId: project._id,
        userId: project.ownerId,
        userName: ownerUser.name || "Owner",
        userImage: ownerUser.avatarUrl,
        AccessRole: "owner",
      });
    }
  }

  const allMemberNames = members.map((m: any) => m.userName);

  if (!inputName || !inputName.trim()) {
    return { member: null, allMembers: allMemberNames };
  }

  const cleanQuery = inputName.toLowerCase().replace(/[@:]/g, "").trim();

  // 1. Exact match
  let matched = members.find(
    (m: any) => m.userName.toLowerCase().trim() === cleanQuery,
  );

  // 2. Substring / prefix match
  if (!matched) {
    matched = members.find((m: any) => {
      const u = m.userName.toLowerCase().trim();
      return (
        u.startsWith(cleanQuery) ||
        u.includes(cleanQuery) ||
        cleanQuery.includes(u)
      );
    });
  }

  if (matched) {
    return {
      member: {
        userId: matched.userId,
        name: matched.userName,
        avatar: matched.userImage || undefined,
      },
      allMembers: allMemberNames,
    };
  }

  return { member: null, allMembers: allMemberNames };
}

/**
 * Query: Returns the list of unique active member names in the project
 * so the LLM system prompt has the ground-truth list of members.
 */
export const getProjectMembersList = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const projectId = args.projectId as Id<"projects">;
    const { allMembers } = await resolveProjectMember(ctx, projectId);
    return allMembers;
  },
});

/**
 * Tool 1: getProjectHealthAndInsights
 * Single comprehensive query returning project deadline, task counts, non-completed tasks,
 * high-priority tasks with assignees, and issues with assignees.
 */
export const getProjectHealthAndInsights = query({
  args: { projectId: v.string() },
  handler: async (ctx, args) => {
    const projectId = args.projectId as Id<"projects">;
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    const projectDetail = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .unique();

    // 1. Deadline calculation
    const deadline = projectDetail?.targetDate ?? null;
    let daysLeftOrOverdue: string = "No target deadline set";
    if (deadline) {
      const now = Date.now();
      const diff = deadline - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      if (days > 0) {
        daysLeftOrOverdue = `${days} day${days === 1 ? "" : "s"} remaining`;
      } else if (days === 0) {
        daysLeftOrOverdue = "Due today!";
      } else {
        daysLeftOrOverdue = `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} OVERDUE`;
      }
    }

    // 2. Fetch Tasks & Task Assignees
    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const taskAssignees = await ctx.db
      .query("taskAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const completedTasks = allTasks.filter((t) => t.status === "completed");
    const nonCompletedTasks = allTasks.filter((t) => t.status !== "completed");
    const highPriorityTasks = nonCompletedTasks.filter(
      (t) => t.priority === "high",
    );

    const activeTasksDetailed = nonCompletedTasks.slice(0, 20).map((t) => {
      const assignees = taskAssignees
        .filter((a) => a.taskId === t._id)
        .map((a) => a.name);
      return {
        id: t._id,
        title: t.title,
        status: t.status,
        priority: t.priority ?? "medium",
        assignees: assignees.length > 0 ? assignees : ["Unassigned"],
      };
    });

    // 3. Fetch Issues & Issue Assignees
    const allIssues = await ctx.db
      .query("issues")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const issueAssignees = await ctx.db
      .query("issueAssignees")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    const closedIssues = allIssues.filter((i) => i.status === "closed");
    const nonClosedIssues = allIssues.filter((i) => i.status !== "closed");
    const criticalIssues = nonClosedIssues.filter((i) => i.severity === "critical");

    const activeIssuesDetailed = nonClosedIssues.slice(0, 20).map((i) => {
      const assignees = issueAssignees
        .filter((a) => a.issueId === i._id)
        .map((a) => a.name);
      return {
        id: i._id,
        title: i.title,
        severity: i.severity ?? "medium",
        status: i.status,
        environment: i.environment ?? "dev",
        assignees: assignees.length > 0 ? assignees : ["Unassigned"],
      };
    });

    return {
      projectName: project.projectName,
      deadlineFormatted: deadline ? new Date(deadline).toLocaleDateString() : null,
      daysLeftOrOverdue,
      tasks: {
        total: allTasks.length,
        completed: completedTasks.length,
        nonCompleted: nonCompletedTasks.length,
        highPriorityCount: highPriorityTasks.length,
        activeTasksList: activeTasksDetailed,
      },
      issues: {
        total: allIssues.length,
        closed: closedIssues.length,
        nonClosed: nonClosedIssues.length,
        criticalCount: criticalIssues.length,
        activeIssuesList: activeIssuesDetailed,
      },
    };
  },
});

/**
 * Tool 2: createProjectItem
 * Creates a Task, Issue, or Ticket with fuzzy assignee resolution, avatar linking, and zero hallucinations.
 */
export const createProjectItem = mutation({
  args: {
    projectId: v.string(),
    itemType: v.union(v.literal("task"), v.literal("issue"), v.literal("ticket")),
    titleOrBody: v.string(),
    description: v.optional(v.string()),
    priorityOrSeverity: v.optional(v.string()), // 'critical' | 'high' | 'medium' | 'low'
    assigneeName: v.optional(v.string()),
    environment: v.optional(v.string()), // 'production' | 'staging' | 'dev' | 'local'
    callerClerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const projectId = args.projectId as Id<"projects">;
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    // Resolve caller user ID
    let callerUserId = project.ownerId;
    if (args.callerClerkId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("clerkToken", args.callerClerkId!))
        .unique();
      if (user) callerUserId = user._id;
    }

    // Resolve assignee using robust helper
    const { member: resolvedMember, allMembers } = await resolveProjectMember(
      ctx,
      projectId,
      args.assigneeName,
    );

    const now = Date.now();

    // ── 1. Create Ticket ──────────────────────────────────────────────────────
    if (args.itemType === "ticket") {
      const assignedToUser = resolvedMember ? resolvedMember.userId : callerUserId;
      const ticketId = await ctx.db.insert("tickets", {
        projectId,
        body: args.titleOrBody,
        createdBy: callerUserId,
        assignedTo: assignedToUser,
        status: "open",
        createdAt: now,
        updatedAt: now,
      });

      const assignedLabel = resolvedMember ? resolvedMember.name : "Assigned to Creator";
      return {
        success: true,
        itemType: "ticket",
        itemId: ticketId,
        titleOrBody: args.titleOrBody,
        assigneeName: assignedLabel,
        message: `✅ Created Ticket: "${args.titleOrBody}" (Assigned to ${assignedLabel})`,
      };
    }

    // ── 2. Create Task ────────────────────────────────────────────────────────
    if (args.itemType === "task") {
      const priority =
        args.priorityOrSeverity &&
        ["high", "medium", "low"].includes(args.priorityOrSeverity.toLowerCase())
          ? (args.priorityOrSeverity.toLowerCase() as "high" | "medium" | "low")
          : "medium";

      const taskId = await ctx.db.insert("tasks", {
        projectId,
        title: args.titleOrBody,
        description: args.description ? args.description : undefined,
        priority,
        status: "not started",
        estimation: {
          startDate: now,
          endDate: now + 7 * 24 * 60 * 60 * 1000, // 1 week default
        },
        createdByUserId: callerUserId,
        createdAt: now,
        updatedAt: now,
      });

      // Insert into taskAssignees with taskId, userId, name, avatar, projectId
      if (resolvedMember) {
        await ctx.db.insert("taskAssignees", {
          taskId,
          userId: resolvedMember.userId,
          name: resolvedMember.name,
          avatar: resolvedMember.avatar,
          projectId,
        });
      }

      const assignedLabel = resolvedMember ? resolvedMember.name : "Unassigned";
      return {
        success: true,
        itemType: "task",
        itemId: taskId,
        title: args.titleOrBody,
        priority,
        assigneeName: assignedLabel,
        message: `✅ Created Task: "${args.titleOrBody}" [Priority: ${priority.toUpperCase()}] (Assigned to ${assignedLabel})`,
      };
    }

    // ── 3. Create Issue ───────────────────────────────────────────────────────
    if (args.itemType === "issue") {
      const severity =
        args.priorityOrSeverity &&
        ["critical", "medium", "low"].includes(args.priorityOrSeverity.toLowerCase())
          ? (args.priorityOrSeverity.toLowerCase() as "critical" | "medium" | "low")
          : "medium";

      const environment =
        args.environment &&
        ["production", "staging", "dev", "local"].includes(args.environment.toLowerCase())
          ? (args.environment.toLowerCase() as "production" | "staging" | "dev" | "local")
          : "dev";

      const issueId = await ctx.db.insert("issues", {
        projectId,
        title: args.titleOrBody,
        description: args.description ? args.description : undefined,
        severity,
        environment,
        status: "opened",
        type: "manual",
        createdByUserId: callerUserId,
        createdAt: now,
        updatedAt: now,
      });

      // Insert into issueAssignees with issueId, userId, name, avatar, projectId
      if (resolvedMember) {
        await ctx.db.insert("issueAssignees", {
          issueId,
          userId: resolvedMember.userId,
          name: resolvedMember.name,
          avatar: resolvedMember.avatar,
          projectId,
        });
      }

      const assignedLabel = resolvedMember ? resolvedMember.name : "Unassigned";
      return {
        success: true,
        itemType: "issue",
        itemId: issueId,
        title: args.titleOrBody,
        severity,
        environment,
        assigneeName: assignedLabel,
        message: `🚨 Logged Issue: "${args.titleOrBody}" [Severity: ${severity.toUpperCase()}, Env: ${environment}] (Assigned to ${assignedLabel})`,
      };
    }

    throw new Error(`Unsupported itemType: ${args.itemType}`);
  },
});

/**
 * Tool 3: broadcastNotifications
 * Fans out in-app project alert notifications to all active project members for an announcement.
 */
export const broadcastNotifications = mutation({
  args: {
    projectId: v.string(),
    announcementTitle: v.string(),
    message: v.string(),
    channelId: v.optional(v.string()),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const projectId = args.projectId as Id<"projects">;
    const project = await ctx.db.get(projectId);
    if (!project) throw new Error("Project not found");

    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", projectId))
      .collect();

    // Ensure owner is included in notification targets
    const memberUserIds = new Set<Id<"users">>(members.map((m) => m.userId));
    memberUserIds.add(project.ownerId);

    const now = Date.now();
    const cleanTitle = args.announcementTitle.trim();
    const cleanMsg = args.message.trim();
    const previewText = cleanMsg.length > 120 ? `${cleanMsg.slice(0, 120)}...` : cleanMsg;

    await Promise.all(
      Array.from(memberUserIds).map((recipientId) =>
        ctx.db.insert("notifications", {
          recipientId,
          projectId,
          projectName: project.projectName,
          type: "project_alert",
          body: `📢 **[Announcement] ${cleanTitle}**: "${previewText}"`,
          entityId: args.channelId,
          entityTitle: "#general (Announcements)",
          isRead: false,
          createdAt: now,
        }),
      ),
    );

    return {
      success: true,
      notifiedCount: memberUserIds.size,
    };
  },
});

