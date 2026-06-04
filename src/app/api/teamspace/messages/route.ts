import { auth } from "@clerk/nextjs/server";
import Ably from "ably";
import { ConvexHttpClient } from "convex/browser";
import { randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { initTeamspaceDB, turso } from "@/lib/turso";
import {
  verifyProjectAccess,
  verifyChannelAccess,
} from "@/modules/workspace/teamspace/lib/auth";
import {
  extractUrls,
  unfurlUrl,
} from "@/modules/workspace/teamspace/lib/unfurl";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

// GET /api/teamspace/messages?channelId=xxx&projectId=xxx&cursor=xxx&limit=50
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channelId = req.nextUrl.searchParams.get("channelId");
  const projectId = req.nextUrl.searchParams.get("projectId");
  const cursor = req.nextUrl.searchParams.get("cursor"); // timestamp for pagination
  const threadParentId = req.nextUrl.searchParams.get("threadParentId");
  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") ?? 50),
    100,
  );

  if (!channelId || !projectId) {
    return NextResponse.json(
      { error: "channelId and projectId required" },
      { status: 400 },
    );
  }

  // --- PROJECT ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  // --- CHANNEL ACCESS CHECK (blocks non-members from private channels) ---
  const channelAccess = await verifyChannelAccess(
    userId,
    channelId,
    access.permissions,
  );
  if (!channelAccess.allowed) {
    return NextResponse.json(
      { error: "Forbidden", code: channelAccess.code },
      { status: channelAccess.status },
    );
  }

  await initTeamspaceDB();

  // Build query: top-level messages OR thread replies
  let sql: string;
  let args: (string | number | null)[];

  if (threadParentId) {
    // Thread replies
    sql = cursor
      ? `SELECT m.*, 
           (SELECT COUNT(*) FROM ts_reactions r WHERE r.message_id = m.id) as reaction_count
         FROM ts_messages m
         WHERE m.thread_parent_id = ? AND m.created_at < ?
         ORDER BY m.created_at ASC LIMIT ?`
      : `SELECT m.*, 
           (SELECT COUNT(*) FROM ts_reactions r WHERE r.message_id = m.id) as reaction_count
         FROM ts_messages m
         WHERE m.thread_parent_id = ?
         ORDER BY m.created_at ASC LIMIT ?`;
    args = cursor
      ? [threadParentId, Number(cursor), limit]
      : [threadParentId, limit];
  } else {
    // Top-level messages (no thread_parent_id filter)
    sql = cursor
      ? `SELECT m.*, 
           (SELECT COUNT(*) FROM ts_reactions r WHERE r.message_id = m.id) as reaction_count,
           (SELECT COUNT(*) FROM ts_messages t WHERE t.thread_parent_id = m.id) as reply_count,
           p.user_name as parent_user_name, p.content as parent_content
         FROM ts_messages m
         LEFT JOIN ts_messages p ON m.thread_parent_id = p.id
         WHERE m.channel_id = ? AND m.created_at < ?
         ORDER BY m.created_at DESC LIMIT ?`
      : `SELECT m.*, 
           (SELECT COUNT(*) FROM ts_reactions r WHERE r.message_id = m.id) as reaction_count,
           (SELECT COUNT(*) FROM ts_messages t WHERE t.thread_parent_id = m.id) as reply_count,
           p.user_name as parent_user_name, p.content as parent_content
         FROM ts_messages m
         LEFT JOIN ts_messages p ON m.thread_parent_id = p.id
         WHERE m.channel_id = ?
         ORDER BY m.created_at DESC LIMIT ?`;
    args = cursor ? [channelId, Number(cursor), limit] : [channelId, limit];
  }

  const result = await turso.execute({ sql, args });

  // Fetch reactions grouped for these messages
  const messageIds = result.rows.map((r) => r.id as string);
  const reactionsMap: Record<string, { emoji: string; userIds: string[] }[]> =
    {};

  if (messageIds.length > 0) {
    const placeholders = messageIds.map(() => "?").join(",");
    const reactions = await turso.execute({
      sql: `SELECT message_id, emoji, user_id FROM ts_reactions WHERE message_id IN (${placeholders})`,
      args: messageIds,
    });

    for (const row of reactions.rows) {
      const mid = row.message_id as string;
      const emoji = row.emoji as string;
      const uid = row.user_id as string;
      if (!reactionsMap[mid]) reactionsMap[mid] = [];
      const existing = reactionsMap[mid].find((r) => r.emoji === emoji);
      if (existing) existing.userIds.push(uid);
      else reactionsMap[mid].push({ emoji, userIds: [uid] });
    }
  }

  // Fetch poll votes grouped for these messages
  const pollVotesMap: Record<
    string,
    {
      option_id: string;
      user_id: string;
      user_name: string;
      user_image: string | null;
    }[]
  > = {};
  if (messageIds.length > 0) {
    const placeholders = messageIds.map(() => "?").join(",");
    const pollVotesRes = await turso.execute({
      sql: `SELECT message_id, option_id, user_id, user_name, user_image FROM ts_poll_votes WHERE message_id IN (${placeholders})`,
      args: messageIds,
    });

    for (const row of pollVotesRes.rows) {
      const mid = row.message_id as string;
      if (!pollVotesMap[mid]) pollVotesMap[mid] = [];
      pollVotesMap[mid].push({
        option_id: row.option_id as string,
        user_id: row.user_id as string,
        user_name: row.user_name as string,
        user_image: row.user_image as string | null,
      });
    }
  }

  const messages = result.rows.reverse().map((m) => {
    const poll = m.poll ? JSON.parse(m.poll as string) : null;
    if (poll) {
      poll.votes = pollVotesMap[m.id as string] ?? [];
    }
    return {
      ...m,
      link_preview: m.link_preview
        ? JSON.parse(m.link_preview as string)
        : null,
      poll,
      reactions: reactionsMap[m.id as string] ?? [],
    };
  });

  const nextCursor =
    result.rows.length === limit ? String(result.rows[0].created_at) : null;

  return NextResponse.json({ messages, nextCursor });
}

// POST /api/teamspace/messages
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    id: clientId,
    channelId,
    projectId,
    content,
    threadParentId,
    poll,
    isAgent,
    agentName,
  } = body;

  if (!channelId || !projectId || (!content?.trim() && !poll)) {
    return NextResponse.json(
      { error: "channelId, projectId, content or poll required" },
      { status: 400 },
    );
  }

  // --- PROJECT ACCESS CHECK & SERVER-SIDE PROFILE ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  const { user } = access;

  const senderUserId = isAgent && agentName ? agentName.toLowerCase() : userId;
  const senderUserName =
    isAgent && agentName
      ? agentName.toLowerCase() === "kaya"
        ? "Kaya"
        : "Harry"
      : user.name;
  const senderUserImage =
    isAgent && agentName ? `/${agentName.toLowerCase()}.svg` : user.avatarUrl;

  await initTeamspaceDB();

  // --- CHANNEL TYPE & PERMISSION VERIFICATION ---
  const channelRes = await turso.execute({
    sql: `SELECT name, type, created_by FROM ts_channels WHERE id = ? AND project_id = ?`,
    args: [channelId, projectId],
  });

  if (channelRes.rows.length === 0) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const channelName = channelRes.rows[0].name as string;
  const channelType = channelRes.rows[0].type as string;
  const channelCreatedBy = channelRes.rows[0].created_by as string;

  // Private channel access gate
  const channelAccess = await verifyChannelAccess(
    userId,
    channelId,
    access.permissions,
  );
  if (!channelAccess.allowed) {
    return NextResponse.json(
      { error: "Forbidden", code: channelAccess.code },
      { status: channelAccess.status },
    );
  }

  if (channelType === "announcement") {
    if (!access.permissions.isOwner && !access.permissions.isAdmin) {
      return NextResponse.json(
        {
          error:
            "Forbidden: Only project owners and admins can post in announcement channels",
        },
        { status: 403 },
      );
    }
  }

  const id = clientId || randomUUID();
  const now = Date.now();

  // --- LINK UNFURLING ---
  const urls = extractUrls(content ?? "");
  let linkPreview = null;
  if (urls.length > 0) {
    const preview = await unfurlUrl(urls[0]);
    if (preview) {
      linkPreview = JSON.stringify(preview);
    }
  }

  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  await turso.execute({
    sql: `INSERT INTO ts_messages (id, channel_id, project_id, user_id, user_name, user_image, content, link_preview, poll, thread_parent_id, created_at, expires_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      channelId,
      projectId,
      senderUserId,
      senderUserName,
      senderUserImage,
      content ? content.trim() : "",
      linkPreview,
      poll ? JSON.stringify(poll) : null,
      threadParentId ?? null,
      now,
      now + THIRTY_DAYS_MS,
    ],
  });

  let parent_user_name = null;
  let parent_content = null;

  if (threadParentId) {
    const parentRes = await turso.execute({
      sql: `SELECT user_name, content FROM ts_messages WHERE id = ?`,
      args: [threadParentId],
    });
    if (parentRes.rows.length > 0) {
      parent_user_name = parentRes.rows[0].user_name as string;
      parent_content = parentRes.rows[0].content as string;
    }
  }

  const message = {
    id,
    channel_id: channelId,
    project_id: projectId,
    user_id: senderUserId,
    user_name: senderUserName,
    user_image: senderUserImage,
    content: content ? content.trim() : "",
    link_preview: linkPreview ? JSON.parse(linkPreview) : null,
    poll: poll ? { ...poll, votes: [] } : null,
    thread_parent_id: threadParentId ?? null,
    parent_user_name,
    parent_content,
    created_at: now,
    edited_at: null,
    reactions: [],
    reply_count: 0,
  };

  // Publish to Ably — private channels use an isolated topic to prevent
  // non-members from receiving messages even if they somehow subscribe.
  const ablyTopicName =
    channelType === "private"
      ? `private:teamspace:${channelId}`
      : `teamspace:${channelId}`;
  const ablyChannel = ably.channels.get(ablyTopicName);
  await ablyChannel.publish("message.new", message);

  // Publish lightweight metadata to the project-wide channel for unread tracking.
  // Non-members will receive this event but the frontend guards against bumping
  // the unread count for channels with has_access=0.
  try {
    const projectMsgsChannel = ably.channels.get(
      `project:${projectId}:messages`,
    );
    await projectMsgsChannel.publish("message.new", {
      id,
      channel_id: channelId,
      channel_type: channelType,
      user_id: userId,
      created_at: now,
    });
  } catch (e) {
    console.error("Failed to publish to project messages channel:", e);
  }

  // --- MENTION NOTIFICATIONS → Convex (unified notification bell) ---
  const hasMentionSymbol = content && content.includes("@");
  if (hasMentionSymbol) {
    try {
      const projectMembers = await convex.query(api.project.getProjectMembers, {
        projectId: projectId as any,
      });

      const isEveryoneMentioned = content.toLowerCase().includes("@everyone");

      // Robust helper: checks userName, no-space variant, first name, githubUsername
      const isMemberMentioned = (member: any, text: string) => {
        if (!member.userName) return false;
        const tagsToTry = [member.userName];
        const noSpaces = member.userName.replace(/\s+/g, "");
        if (noSpaces && noSpaces !== member.userName) tagsToTry.push(noSpaces);
        const firstName = member.userName.split(" ")[0];
        if (firstName && firstName.length >= 3 && firstName !== member.userName)
          tagsToTry.push(firstName);
        if (member.githubUsername) tagsToTry.push(member.githubUsername);
        return tagsToTry.some((tag) => {
          const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          return new RegExp(`@${escaped}(\\b|\\s|[.,!?;:]|$)`, "i").test(text);
        });
      };

      // For private channels: restrict eligible recipients to channel members only.
      // This prevents @everyone from notifying people who can't see the channel.
      let eligibleMembers = projectMembers;
      if (channelType === "private") {
        const memberRes = await turso.execute({
          sql: "SELECT user_id FROM ts_private_channel_members WHERE channel_id = ?",
          args: [channelId],
        });
        const allowedUserIds = new Set(
          memberRes.rows.map((r) => r.user_id as string),
        );
        allowedUserIds.add(channelCreatedBy);
        eligibleMembers = projectMembers.filter(
          (m: any) => m.clerkUserId && allowedUserIds.has(m.clerkUserId),
        );
      }

      // Collect mentioned members, excluding the sender
      const mentionedMembers = isEveryoneMentioned
        ? eligibleMembers.filter((m: any) => m.clerkUserId !== userId)
        : eligibleMembers.filter((member: any) => {
            if (member.clerkUserId === userId) return false;
            return isMemberMentioned(member, content);
          });

      if (mentionedMembers.length > 0) {
        // Get the Clerk session token to authenticate the Convex mutation
        const { getToken } = await auth();
        const convexToken = await getToken({ template: "convex" });

        if (convexToken) {
          // Re-use the existing convex client with auth
          const authedConvex = new ConvexHttpClient(
            process.env.NEXT_PUBLIC_CONVEX_URL!,
          );
          authedConvex.setAuth(convexToken);

          // Fetch the actor's Convex user record (suffix-match on clerkToken)
          const actorConvexUser = await convex.query(
            api.user.getUserByClerkToken,
            {
              clerkToken: userId,
            },
          );

          if (actorConvexUser) {
            // mentionedMembers have userId (Convex user ID) from getProjectMembers
            const mentionedUserIds = mentionedMembers
              .map((m: any) => m.userId)
              .filter(Boolean);

            await authedConvex.mutation(
              api.notifications.notifyTeamspaceMention,
              {
                actorId: actorConvexUser._id,
                mentionedUserIds,
                projectId: projectId as any,
                channelId,
                channelName,
                messageId: id,
                snippet: (() => {
                  let text = (content ?? "").trim();
                  const uploadRegex =
                    /!?\[[^\]]+\]\((https?:\/\/[^\s)]+(?:amazonaws\.com|wekraft-saas-upload-s3)[^\s)]*)\)/g;
                  text = text.replace(uploadRegex, "uploaded doc");
                  return text.substring(0, 120);
                })(),
              },
            );
          }
        }
      }
    } catch (e) {
      // Non-fatal: notification failure should never block message delivery
      console.error("Failed to process mention notifications:", e);
    }
  }

  return NextResponse.json({ message }, { status: 201 });
}
