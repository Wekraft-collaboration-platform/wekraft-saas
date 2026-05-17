import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import Ably from "ably";
import { randomUUID } from "crypto";
import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";
import {
  extractUrls,
  unfurlUrl,
} from "@/modules/workspace/teamspace/lib/unfurl";
import { ConvexHttpClient } from "convex/browser";
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

  // --- ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

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
  let reactionsMap: Record<string, { emoji: string; userIds: string[] }[]> = {};

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
  let pollVotesMap: Record<
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
    let poll = m.poll ? JSON.parse(m.poll as string) : null;
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
  } = body;

  if (!channelId || !projectId || (!content?.trim() && !poll)) {
    return NextResponse.json(
      { error: "channelId, projectId, content or poll required" },
      { status: 400 },
    );
  }

  // --- ACCESS CHECK & SERVER-SIDE PROFILE ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  const { user } = access;

  await initTeamspaceDB();

  // --- CHANNEL TYPE & PERMISSION VERIFICATION ---
  const channelRes = await turso.execute({
    sql: `SELECT type FROM ts_channels WHERE id = ? AND project_id = ?`,
    args: [channelId, projectId],
  });

  if (channelRes.rows.length === 0) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const channelType = channelRes.rows[0].type as string;
  if (channelType === "announcement") {
    if (!access.permissions.isOwner && !access.permissions.isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only project owners and admins can post in announcement channels" },
        { status: 403 }
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

  await turso.execute({
    sql: `INSERT INTO ts_messages (id, channel_id, project_id, user_id, user_name, user_image, content, link_preview, poll, thread_parent_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      channelId,
      projectId,
      userId,
      user.name,
      user.avatarUrl,
      content ? content.trim() : "",
      linkPreview,
      poll ? JSON.stringify(poll) : null,
      threadParentId ?? null,
      now,
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
    user_id: userId,
    user_name: user.name,
    user_image: user.avatarUrl,
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

  // Publish to Ably in real-time
  const ablyChannel = ably.channels.get(`teamspace:${channelId}`);
  await ablyChannel.publish("message.new", message);

  // Publish lightweight message metadata to project-wide messages channel for unread count tracking
  try {
    const projectMsgsChannel = ably.channels.get(`project:${projectId}:messages`);
    await projectMsgsChannel.publish("message.new", {
      id,
      channel_id: channelId,
      user_id: userId,
      created_at: now,
    });
  } catch (e) {
    console.error("Failed to publish to project messages channel:", e);
  }

  // --- MENTION NOTIFICATIONS (NON-BLOCKING BACKGROUND EXECUTION) ---
  const hasMentionSymbol = content && content.includes("@");
  if (hasMentionSymbol) {
    // Run in the background without blocking the HTTP response to the client
    (async () => {
      try {
        const projectMembers = await convex.query(api.project.getProjectMembers, {
          projectId: projectId as any,
        });

        const isEveryoneMentioned = content.toLowerCase().includes("@everyone");
        
        // Robust helper to check if a project member is mentioned in the content
        const isMemberMentioned = (member: any, text: string) => {
          if (!member.userName) return false;
          
          const tagsToTry = [member.userName];
          
          const noSpaces = member.userName.replace(/\s+/g, "");
          if (noSpaces && noSpaces !== member.userName) {
            tagsToTry.push(noSpaces);
          }
          
          const firstName = member.userName.split(" ")[0];
          if (firstName && firstName.length >= 3 && firstName !== member.userName) {
            tagsToTry.push(firstName);
          }
          
          if (member.githubUsername) {
            tagsToTry.push(member.githubUsername);
          }
          
          return tagsToTry.some(tag => {
            const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(`@${escapedTag}(\\b|\\s|[.,!?;:]|$)`, "i");
            return regex.test(text);
          });
        };

        // Match @Username in content or use all members if @everyone, strictly filtering out self-mentions
        const mentionedMembers = isEveryoneMentioned 
          ? projectMembers.filter(m => m.clerkUserId !== userId) // Everyone except sender
          : projectMembers.filter((member) => {
              if (member.clerkUserId === userId) return false;
              return isMemberMentioned(member, content);
            });

        // Parallelize Turso inserts and Ably publications for maximum throughput
        const notificationPromises = mentionedMembers.map(async (member) => {
          if (member.clerkUserId && member.clerkUserId !== userId) {
            const notificationId = randomUUID();
            const notification = {
              id: notificationId,
              user_id: member.clerkUserId,
              type: "mention",
              sender_id: userId,
              sender_name: user.name,
              sender_image: user.avatarUrl,
              project_id: projectId,
              channel_id: channelId,
              message_id: id,
              content: content.trim().substring(0, 100),
              is_read: 0,
              created_at: now,
            };

            // Save to Turso and publish to Ably concurrently
            await Promise.all([
              turso.execute({
                sql: `INSERT INTO ts_notifications (id, user_id, type, sender_id, sender_name, sender_image, project_id, channel_id, message_id, content, created_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                args: [
                  notification.id,
                  notification.user_id,
                  notification.type,
                  notification.sender_id,
                  notification.sender_name,
                  notification.sender_image,
                  notification.project_id,
                  notification.channel_id,
                  notification.message_id,
                  notification.content,
                  notification.created_at,
                ],
              }),
              (async () => {
                const userNotifyChannel = ably.channels.get(
                  `user:notifications:${member.clerkUserId}`,
                );
                await userNotifyChannel.publish("notification.new", notification);
              })()
            ]);
          }
        });

        await Promise.all(notificationPromises);
      } catch (e) {
        console.error("Failed to process mentions in background:", e);
      }
    })();
  }

  return NextResponse.json({ message }, { status: 201 });
}
