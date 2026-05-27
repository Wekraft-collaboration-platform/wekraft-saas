import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ─── Notification type union (mirrors schema) ────────────────────────────────
const notificationType = v.union(
  v.literal("member_joined"),
  v.literal("member_left"),
  v.literal("member_removed"),
  v.literal("join_request"),
  v.literal("request_accepted"),
  v.literal("request_rejected"),
  v.literal("role_changed"),
  v.literal("mentioned"),
  v.literal("project_alert"),
);

// ─── Helper: insert one notification record ──────────────────────────────────
async function insertNotification(
  ctx: any,
  payload: {
    recipientId: Id<"users">;
    senderId?: Id<"users">;
    senderName?: string;
    senderAvatar?: string;
    projectId?: Id<"projects">;
    projectName?: string;
    type: string;
    body: string;
    entityId?: string;
    entityTitle?: string;
  },
) {
  await ctx.db.insert("notifications", {
    ...payload,
    isRead: false,
    createdAt: Date.now(),
  });
}

// ─── Helper: get power users (owners + admins) of a project ─────────────────
async function getPowerUsers(ctx: any, projectId: Id<"projects">) {
  const project = await ctx.db.get(projectId);
  if (!project) return [];

  const members = await ctx.db
    .query("projectMembers")
    .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
    .collect();

  const powerMembers = members.filter(
    (m: any) => m.AccessRole === "owner" || m.AccessRole === "admin",
  );

  const powerUserIds = new Set(powerMembers.map((m: any) => m.userId as Id<"users">));
  powerUserIds.add(project.ownerId);

  return Array.from(powerUserIds).map((userId) => ({ userId }));
}


// ─── Helper: fan-out a notification to multiple recipients ──────────────────
async function fanOut(
  ctx: any,
  recipientIds: Id<"users">[],
  payload: Omit<Parameters<typeof insertNotification>[1], "recipientId">,
  excludeId?: Id<"users">,
) {
  const targets = excludeId
    ? recipientIds.filter((id) => id !== excludeId)
    : recipientIds;

  await Promise.all(
    targets.map((recipientId) =>
      insertNotification(ctx, { recipientId, ...payload }),
    ),
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL MUTATIONS — called only from other Convex mutations/actions
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * member_joined
 * → recipient: the new member (welcome message)
 * → recipients: all power users (except the actor if they accepted the request)
 */
export const notifyMemberJoined = internalMutation({
  args: {
    actorId: v.id("users"),          // who performed the action (admin accepting)
    newMemberId: v.id("users"),      // the person who joined
    newMemberName: v.string(),
    newMemberAvatar: v.optional(v.string()),
    projectId: v.id("projects"),
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorId);

    // 1. Welcome the new member
    await insertNotification(ctx, {
      recipientId: args.newMemberId,
      senderId: args.actorId,
      senderName: actor?.name ?? "Team",
      senderAvatar: actor?.avatarUrl,
      projectId: args.projectId,
      projectName: args.projectName,
      type: "member_joined",
      body: `Your request to join **${args.projectName}** was accepted. Welcome to the team! 🎉`,
    });

    // 2. Notify power users (except the actor who accepted it)
    const powerUsers = await getPowerUsers(ctx, args.projectId);
    const powerUserIds = powerUsers.map((m: any) => m.userId as Id<"users">);

    await fanOut(
      ctx,
      powerUserIds,
      {
        senderId: args.newMemberId,
        senderName: args.newMemberName,
        senderAvatar: args.newMemberAvatar,
        projectId: args.projectId,
        projectName: args.projectName,
        type: "member_joined",
        body: `**${args.newMemberName}** joined the project.`,
      },
      args.actorId, // don't notify the person who accepted
    );
  },
});

/**
 * member_left
 * → recipients: all power users
 */
export const notifyMemberLeft = internalMutation({
  args: {
    memberId: v.id("users"),
    memberName: v.string(),
    memberAvatar: v.optional(v.string()),
    projectId: v.id("projects"),
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const powerUsers = await getPowerUsers(ctx, args.projectId);
    const powerUserIds = powerUsers.map((m: any) => m.userId as Id<"users">);

    await fanOut(ctx, powerUserIds, {
      senderId: args.memberId,
      senderName: args.memberName,
      senderAvatar: args.memberAvatar,
      projectId: args.projectId,
      projectName: args.projectName,
      type: "member_left",
      body: `**${args.memberName}** left the project.`,
    });
  },
});

/**
 * member_removed
 * → recipient: the removed member only
 */
export const notifyMemberRemoved = internalMutation({
  args: {
    actorId: v.id("users"),
    removedMemberId: v.id("users"),
    removedMemberName: v.string(),
    projectId: v.id("projects"),
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorId);

    await insertNotification(ctx, {
      recipientId: args.removedMemberId,
      senderId: args.actorId,
      senderName: actor?.name ?? "Admin",
      senderAvatar: actor?.avatarUrl,
      projectId: args.projectId,
      projectName: args.projectName,
      type: "member_removed",
      body: `You were removed from **${args.projectName}**.`,
    });
  },
});

/**
 * join_request
 * → recipients: all power users
 */
export const notifyJoinRequest = internalMutation({
  args: {
    requesterId: v.id("users"),
    requesterName: v.string(),
    requesterAvatar: v.optional(v.string()),
    projectId: v.id("projects"),
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const powerUsers = await getPowerUsers(ctx, args.projectId);
    const powerUserIds = powerUsers.map((m: any) => m.userId as Id<"users">);

    await fanOut(ctx, powerUserIds, {
      senderId: args.requesterId,
      senderName: args.requesterName,
      senderAvatar: args.requesterAvatar,
      projectId: args.projectId,
      projectName: args.projectName,
      type: "join_request",
      body: `**${args.requesterName}** wants to join **${args.projectName}**.`,
    });
  },
});

/**
 * request_accepted / request_rejected
 * → recipient: the requester
 */
export const notifyRequestDecision = internalMutation({
  args: {
    actorId: v.id("users"),
    requesterId: v.id("users"),
    decision: v.union(v.literal("accepted"), v.literal("rejected")),
    projectId: v.id("projects"),
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorId);
    const type = args.decision === "accepted" ? "request_accepted" : "request_rejected";
    const body =
      args.decision === "accepted"
        ? `Your request to join **${args.projectName}** was accepted. Welcome! 🎉`
        : `Your request to join **${args.projectName}** was declined.`;

    await insertNotification(ctx, {
      recipientId: args.requesterId,
      senderId: args.actorId,
      senderName: actor?.name ?? "Admin",
      senderAvatar: actor?.avatarUrl,
      projectId: args.projectId,
      projectName: args.projectName,
      type,
      body,
    });
  },
});

/**
 * role_changed
 * → recipient: the affected member
 */
export const notifyRoleChanged = internalMutation({
  args: {
    actorId: v.id("users"),
    memberId: v.id("users"),
    newRole: v.string(),
    projectId: v.id("projects"),
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorId);

    await insertNotification(ctx, {
      recipientId: args.memberId,
      senderId: args.actorId,
      senderName: actor?.name ?? "Admin",
      senderAvatar: actor?.avatarUrl,
      projectId: args.projectId,
      projectName: args.projectName,
      type: "role_changed",
      body: `Your role in **${args.projectName}** was changed to **${args.newRole}**.`,
    });
  },
});

/**
 * mentioned
 * → recipient: the mentioned user
 */
export const notifyMentioned = internalMutation({
  args: {
    actorId: v.id("users"),
    actorName: v.string(),
    actorAvatar: v.optional(v.string()),
    mentionedUserId: v.id("users"),
    projectId: v.id("projects"),
    projectName: v.string(),
    entityId: v.optional(v.string()),
    entityTitle: v.optional(v.string()),
    context: v.optional(v.string()), // "task" | "issue"
  },
  handler: async (ctx, args) => {
    // Don't notify if mentioning yourself
    if (args.actorId === args.mentionedUserId) return;

    const context = args.context ?? "comment";
    await insertNotification(ctx, {
      recipientId: args.mentionedUserId,
      senderId: args.actorId,
      senderName: args.actorName,
      senderAvatar: args.actorAvatar,
      projectId: args.projectId,
      projectName: args.projectName,
      type: "mentioned",
      body: `**${args.actorName}** mentioned you in a ${context} in **${args.projectName}**.`,
      entityId: args.entityId,
      entityTitle: args.entityTitle,
    });
  },
});



/**
 * notifyTeamspaceMention (PUBLIC mutation)
 * Called from the /api/teamspace/messages REST route when someone @mentions
 * a user in a channel message. Accepts Convex user IDs (already resolved by
 * getProjectMembers) and writes into the unified Convex notifications table
 * so @mentions in chat appear in the same header bell as all other events.
 */
export const notifyTeamspaceMention = mutation({
  args: {
    // Convex user ID of the message author
    actorId: v.id("users"),
    // Convex user IDs of everyone mentioned (de-duped, no self-mentions)
    mentionedUserIds: v.array(v.id("users")),
    projectId: v.id("projects"),
    channelId: v.string(),
    channelName: v.string(),
    messageId: v.string(),
    // Preview snippet (first ~120 chars of message)
    snippet: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorId);
    if (!actor) return;

    const project = await ctx.db.get(args.projectId);
    const projectName = project?.projectName ?? "the project";

    await Promise.all(
      args.mentionedUserIds
        .filter((id) => id !== args.actorId)
        .map((recipientId) =>
          insertNotification(ctx, {
            recipientId,
            senderId: args.actorId,
            senderName: actor.name ?? "Someone",
            senderAvatar: actor.avatarUrl,
            projectId: args.projectId,
            projectName,
            type: "mentioned",
            body: `**${actor.name ?? "Someone"}** mentioned you in **#${args.channelName}** — "${args.snippet}"`,
            entityId: args.channelId,
            entityTitle: `#${args.channelName}`,
          }),
        ),
    );
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC QUERIES — consumed by the frontend
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get the 30 most recent notifications for the current user.
 */
export const getMyNotifications = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) return [];

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .order("desc")
      .take(30);

    // Resolve project slugs on the fly for frontend deep-linking
    const resolvedNotifications = await Promise.all(
      notifications.map(async (n) => {
        if (!n.projectId) return { ...n, projectSlug: undefined };
        const project = await ctx.db.get(n.projectId);
        return {
          ...n,
          projectSlug: project?.slug,
        };
      }),
    );

    return resolvedNotifications;
  },
});

/**
 * Count unread notifications for the current user (for the bell badge).
 */
export const getUnreadCount = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return 0;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", user._id).eq("isRead", false),
      )
      .collect();

    return unread.length;
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC MUTATIONS — mark read / clear
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mark a single notification as read.
 */
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notif = await ctx.db.get(args.notificationId);
    if (!notif) return;

    // Safety: only the recipient can mark it read
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user || notif.recipientId !== user._id) return;

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

/**
 * Mark ALL of the current user's notifications as read.
 */
export const markAllAsRead = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) return;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_recipient_unread", (q) =>
        q.eq("recipientId", user._id).eq("isRead", false),
      )
      .collect();

    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { isRead: true })));
  },
});

/**
 * Delete all notifications for the current user (clear all).
 */
export const clearAll = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user) return;

    const all = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", user._id))
      .collect();

    await Promise.all(all.map((n) => ctx.db.delete(n._id)));
  },
});

/**
 * Delete a single notification.
 */
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notif = await ctx.db.get(args.notificationId);
    if (!notif) return;

    // Safety: only the recipient can delete it
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user || notif.recipientId !== user._id) return;

    await ctx.db.delete(args.notificationId);
  },
});

/**
 * Internal mutation to clean up old notifications.
 * Typically scheduled to run daily via cron.
 */
export const deleteOldNotifications = internalMutation({
  args: { maxAgeDays: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.maxAgeDays * 24 * 60 * 60 * 1000;

    // Scan notifications table for old records
    const oldNotifications = await ctx.db
      .query("notifications")
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();

    let count = 0;
    for (const notif of oldNotifications) {
      await ctx.db.delete(notif._id);
      count++;
    }

    console.log(`[Cron Cleanup] Successfully deleted ${count} notifications older than ${args.maxAgeDays} days.`);
    return { deletedCount: count };
  },
});

/**
 * Internal mutation called by the scheduler to send project alert.
 */
export const sendProjectDurationAlert = internalMutation({
  args: {
    projectId: v.id("projects"),
    alertPercent: v.number(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (!project) return;

    const details = await ctx.db
      .query("projectDetails")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .unique();

    if (!details) return;

    // Double check: if targetDate changed or alert was removed in the meantime, don't send
    if (!details.alerts?.includes(args.alertPercent)) return;

    // Send notifications to owner and admins
    const powerUsers = await getPowerUsers(ctx, args.projectId);
    const recipientIds = powerUsers.map((u: any) => u.userId as Id<"users">);

    await fanOut(ctx, recipientIds, {
      projectId: args.projectId,
      projectName: project.projectName,
      type: "project_alert",
      body: `**Project Alert**: **${args.alertPercent}%** of project duration has passed for **${project.projectName}**.`,
    });

    // Mark as triggered in DB
    const triggeredAlerts = details.triggeredAlerts || [];
    if (!triggeredAlerts.includes(args.alertPercent)) {
      triggeredAlerts.push(args.alertPercent);
      await ctx.db.patch(details._id, {
        triggeredAlerts,
      });
    }
  },
});

