import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import Ably from "ably";
import { randomUUID } from "crypto";
import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";
import { extractUrls, unfurlUrl } from "@/modules/workspace/teamspace/lib/unfurl";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

// GET /api/teamspace/messages?channelId=xxx&projectId=xxx&cursor=xxx&limit=50
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const channelId = req.nextUrl.searchParams.get("channelId");
  const projectId = req.nextUrl.searchParams.get("projectId");
  const cursor = req.nextUrl.searchParams.get("cursor"); // timestamp for pagination
  const threadParentId = req.nextUrl.searchParams.get("threadParentId");
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 50), 100);

  if (!channelId || !projectId) {
    return NextResponse.json({ error: "channelId and projectId required" }, { status: 400 });
  }

  // --- ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

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
    args = cursor ? [threadParentId, Number(cursor), limit] : [threadParentId, limit];
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

  const messages = result.rows.reverse().map((m) => ({
    ...m,
    link_preview: m.link_preview ? JSON.parse(m.link_preview as string) : null,
    reactions: reactionsMap[m.id as string] ?? [],
  }));

  const nextCursor =
    result.rows.length === limit
      ? String(result.rows[0].created_at)
      : null;

  return NextResponse.json({ messages, nextCursor });
}

// POST /api/teamspace/messages
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id: clientId, channelId, projectId, content, threadParentId } = body;

  if (!channelId || !projectId || !content?.trim()) {
    return NextResponse.json({ error: "channelId, projectId, content required" }, { status: 400 });
  }

  // --- ACCESS CHECK & SERVER-SIDE PROFILE ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  const { user } = access;

  await initTeamspaceDB();

  const id = clientId || randomUUID();
  const now = Date.now();

  // --- LINK UNFURLING ---
  const urls = extractUrls(content);
  let linkPreview = null;
  if (urls.length > 0) {
    const preview = await unfurlUrl(urls[0]);
    if (preview) {
      linkPreview = JSON.stringify(preview);
    }
  }

  await turso.execute({
    sql: `INSERT INTO ts_messages (id, channel_id, project_id, user_id, user_name, user_image, content, link_preview, thread_parent_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      channelId,
      projectId,
      userId,
      user.name,
      user.avatarUrl,
      content.trim(),
      linkPreview,
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
    content: content.trim(),
    link_preview: linkPreview ? JSON.parse(linkPreview) : null,
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

  return NextResponse.json({ message }, { status: 201 });
}

