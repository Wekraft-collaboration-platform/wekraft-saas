import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ─── Shared type union (mirrors schema) ──────────────────────────────────────
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
  v.literal("meeting_started"),
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Insert a single notification row with isRead=false and createdAt=now. */
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

/** Return all owner/admin Convex user IDs for a project (deduped). */
async function getPowerUsers(ctx: any, projectId: Id<"projects">) {
  const project = await ctx.db.get(projectId);
  if (!project) return [];

  const members = await ctx.db
    .query("projectMembers")
    .withIndex("by_project", (q: any) => q.eq("projectId", projectId))
    .collect();

  const powerIds = new Set(
    members
      .filter((m: any) => m.AccessRole === "owner" || m.AccessRole === "admin")
      .map((m: any) => m.userId as Id<"users">),
  );
  powerIds.add(project.ownerId);

  return Array.from(powerIds).map((userId) => ({ userId }));
}

/**
 * Fan a notification out to multiple recipients in parallel.
 * Pass `excludeId` to skip one user (e.g. the actor who triggered the event).
 */
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

/** Notify the new member (welcome) and all power users (someone joined). */
export const notifyMemberJoined = internalMutation({
  args: {
    actorId: v.id("users"),         // admin who accepted the request
    newMemberId: v.id("users"),
    newMemberName: v.string(),
    newMemberAvatar: v.optional(v.string()),
    projectId: v.id("projects"),
    projectName: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorId);

    // Welcome the new member
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

    // Notify power users (exclude the actor who accepted)
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
      args.actorId,
    );
  },
});

/** Notify all power users that a member left. */
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

/** Notify the removed member only. */
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

/** Notify all power users of a new join request. */
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

/** Notify the requester of an accepted or rejected join request. */
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

/** Notify the affected member that their role changed. */
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

/** Notify the @mentioned user. Self-mentions are silently skipped. */
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
    if (args.actorId === args.mentionedUserId) return; // skip self-mention

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

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC MUTATIONS — called directly from the frontend
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Fan a mention notification out to all @mentioned users in a teamspace message.
 * Called from /api/teamspace/messages after resolving Clerk → Convex user IDs.
 */
export const notifyTeamspaceMention = mutation({
  args: {
    actorId: v.id("users"),
    mentionedUserIds: v.array(v.id("users")), // pre-deduped, no self-mentions
    projectId: v.id("projects"),
    channelId: v.string(),
    channelName: v.string(),
    messageId: v.string(),
    snippet: v.string(), // first ~120 chars of the message
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
// TEAM MEET — each video call maps 1-to-1 with a `team_meets` document.
//
//   notifyMeetingStarted      → creates the DB record + fans out notifications
//   recordMeetingJoin         → appends a participant to team_meets.members
//   endMeeting                → host explicitly closes the call
//   markStaleMeetingsInactive → daily cron safety-net (tab-close / crash)
//   getMeetingStatus          → real-time status check used by notification UI
//   getProjectMeetings        → history list for the meet lobby page
//
// `meetingId` is the Stream call ID — shared key between Convex and Stream API,
// and the URL segment: /workspace/meet/[meetingId].
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates the team_meets record and fans "meeting_started" notifications out to
 * all project members (except the host). Host identity is resolved from ctx.auth
 * — no client-supplied userId needed (prevents spoofing). Idempotent on meetingId.
 */
export const notifyMeetingStarted = mutation({
  args: {
    hostName: v.string(),
    hostAvatar: v.optional(v.string()),
    projectId: v.id("projects"),
    meetingId: v.string(), // Stream call ID, also the URL segment
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const host = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();
    if (!host) return;

    const project = await ctx.db.get(args.projectId);
    if (!project) return;

    // Create the team_meets record — skip if already exists (double-click guard)
    const existing = await ctx.db
      .query("team_meets")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .unique();

    if (!existing) {
      await ctx.db.insert("team_meets", {
        meetingId: args.meetingId,
        projectId: args.projectId,
        createdById: host._id,
        createdByName: args.hostName,
        createdByAvatar: args.hostAvatar,
        status: "active",
        startedAt: Date.now(),
        members: [], // populated lazily as each participant joins
      });
    }

    // Fan out to all members except the host
    const members = await ctx.db
      .query("projectMembers")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    const recipientIds = members
      .map((m) => m.userId as Id<"users">)
      .filter((id) => id !== host._id);

    await fanOut(ctx, recipientIds, {
      senderId: host._id,
      senderName: args.hostName,
      senderAvatar: args.hostAvatar,
      projectId: args.projectId,
      projectName: project.projectName,
      type: "meeting_started",
      body: `**${args.hostName}** started a team meeting in **${project.projectName}**. Join ID: \`${args.meetingId}\``,
      entityId: args.meetingId, // deep-links to /workspace/meet/[meetingId]
      entityTitle: `Meet · ${args.meetingId}`,
    });
  },
});

/**
 * Appends a participant to team_meets.members after they join the Stream call.
 * Idempotent — skips the patch if the user is already recorded.
 * Called non-blocking (.catch(() => null)) so errors never crash the call.
 */
export const recordMeetingJoin = mutation({
  args: {
    meetingId: v.string(),
    userId: v.string(), // Clerk user ID
    name: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const meet = await ctx.db
      .query("team_meets")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .unique();

    if (!meet) return; // race condition: record not yet created — harmless

    // Skip if already in the list (Strict Mode / network retry guard)
    if (meet.members.some((m) => m.userId === args.userId)) return;

    await ctx.db.patch(meet._id, {
      members: [
        ...meet.members,
        { userId: args.userId, name: args.name, avatar: args.avatar },
      ],
    });
  },
});

/**
 * Marks a meeting inactive and stamps endedAt / durationMs.
 * Called by the host after Stream's call.endCall() resolves.
 * Idempotent — skips if already inactive (cron may have closed it first).
 * Called non-blocking (.catch(() => null)) so errors never block the redirect.
 */
export const endMeeting = mutation({
  args: {
    meetingId: v.string(),
  },
  handler: async (ctx, args) => {
    const meet = await ctx.db
      .query("team_meets")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .unique();

    if (!meet || meet.status === "inactive") return; // already ended

    const now = Date.now();
    await ctx.db.patch(meet._id, {
      status: "inactive",
      endedAt: now,
      durationMs: now - meet.startedAt,
    });
  },
});

/**
 * Daily cron safety-net (runs 3:00 AM UTC via crons.ts, maxAgeHours = 4).
 *
 * Problem: if a host closes their tab without pressing End Meeting, `endMeeting`
 * is never called and the record stays "active" forever — showing a permanent
 * "Live" badge and a "Join Now" button to a dead Stream room.
 *
 * Fix: scans all team_meets where status = "active" AND startedAt < cutoff,
 * then marks each one inactive. Uses .filter() (no compound index on status+startedAt),
 * which is fine because active meetings are always a tiny subset of the table.
 * Increase maxAgeHours in crons.ts if legitimate meetings routinely run > 4 h.
 */
export const markStaleMeetingsInactive = internalMutation({
  args: { maxAgeHours: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.maxAgeHours * 60 * 60 * 1000;

    const stale = await ctx.db
      .query("team_meets")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "active"),
          q.lt(q.field("startedAt"), cutoff),
        ),
      )
      .collect();

    let count = 0;
    for (const meet of stale) {
      const now = Date.now();
      await ctx.db.patch(meet._id, {
        status: "inactive",
        endedAt: now,
        durationMs: now - meet.startedAt,
      });
      count++;
    }

    console.log(
      `[Cron] markStaleMeetingsInactive: closed ${count} stale meeting(s) older than ${args.maxAgeHours}h.`,
    );
    return { closedCount: count };
  },
});

/**
 * Real-time status check used by MeetingNotificationItem (NotificationCenter.tsx).
 * Lets the UI reactively dim / block navigation to meetings that have already ended.
 * Returns null if no record exists for the given meetingId.
 */
export const getMeetingStatus = query({
  args: { meetingId: v.string() },
  handler: async (ctx, args) => {
    if (!args.meetingId) return null;
    const meet = await ctx.db
      .query("team_meets")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .unique();
    if (!meet) return null;
    return { status: meet.status, projectId: meet.projectId };
  },
});

/**
 * Returns the 50 most recent meetings for a project, newest-first.
 * Used by the meet lobby page to render the history grid.
 * .take(50) prevents a full table scan — switch to paginate() if you need more.
 */
export const getProjectMeetings = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const meetings = await ctx.db
      .query("team_meets")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(50);
    return meetings;
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION QUERIES
// ═══════════════════════════════════════════════════════════════════════════════

/** Returns the 30 most recent notifications for the authenticated user. */
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

    // Resolve project slugs for frontend deep-linking
    const resolvedNotifications = await Promise.all(
      notifications.map(async (n) => {
        if (!n.projectId) return { ...n, projectSlug: undefined };
        const project = await ctx.db.get(n.projectId);
        return { ...n, projectSlug: project?.slug };
      }),
    );

    return resolvedNotifications;
  },
});

/** Returns the unread notification count for the header bell badge. */
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
// NOTIFICATION MUTATIONS — mark read / delete
// ═══════════════════════════════════════════════════════════════════════════════

/** Mark a single notification as read. Only the recipient can do this. */
export const markAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notif = await ctx.db.get(args.notificationId);
    if (!notif) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user || notif.recipientId !== user._id) return; // not the recipient

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

/** Mark all of the current user's notifications as read. */
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

/** Delete all notifications for the current user. */
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

/** Delete a single notification. Only the recipient can do this. */
export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const notif = await ctx.db.get(args.notificationId);
    if (!notif) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("clerkToken", identity.tokenIdentifier))
      .unique();

    if (!user || notif.recipientId !== user._id) return; // not the recipient

    await ctx.db.delete(args.notificationId);
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL CRON MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Deletes notifications older than maxAgeDays.
 * Scheduled daily at 2:00 AM UTC via crons.ts (default: 30 days).
 */
export const deleteOldNotifications = internalMutation({
  args: { maxAgeDays: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - args.maxAgeDays * 24 * 60 * 60 * 1000;

    const old = await ctx.db
      .query("notifications")
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .collect();

    let count = 0;
    for (const notif of old) {
      await ctx.db.delete(notif._id);
      count++;
    }

    console.log(`[Cron] deleteOldNotifications: removed ${count} notification(s) older than ${args.maxAgeDays} days.`);
    return { deletedCount: count };
  },
});

/**
 * Fires a project_alert notification to all owners/admins when a duration
 * threshold is reached (e.g. 50%, 75%, 90% of the project's target date).
 * Called by the Inngest scheduler — skips silently if the alert was already
 * triggered or if the project/details no longer exist.
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

    // Skip if the alert was removed or already sent (race condition guard)
    if (!details.alerts?.includes(args.alertPercent)) return;

    const powerUsers = await getPowerUsers(ctx, args.projectId);
    const recipientIds = powerUsers.map((u: any) => u.userId as Id<"users">);

    await fanOut(ctx, recipientIds, {
      projectId: args.projectId,
      projectName: project.projectName,
      type: "project_alert",
      body: `**Project Alert**: **${args.alertPercent}%** of project duration has passed for **${project.projectName}**.`,
    });

    // Mark as triggered so it doesn't fire again
    const triggeredAlerts = details.triggeredAlerts ?? [];
    if (!triggeredAlerts.includes(args.alertPercent)) {
      triggeredAlerts.push(args.alertPercent);
      await ctx.db.patch(details._id, { triggeredAlerts });
    }
  },
});
