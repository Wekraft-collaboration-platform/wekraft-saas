import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import { randomUUID } from "crypto";
import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";
import Ably from "ably";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

// GET /api/teamspace/channels?projectId=xxx
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  // --- ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  await initTeamspaceDB();

  // Run migration to rename old default channels if any exist
  try {
    await turso.execute({
      sql: "UPDATE ts_channels SET name = 'general' WHERE is_default = 1 AND project_id = ?",
      args: [projectId],
    });
  } catch (e) {
    // Ignore migration failures
  }

  const querySql = `
    SELECT 
      c.*,
      (
        SELECT COUNT(*) 
        FROM ts_messages m
        WHERE m.channel_id = c.id
          AND m.user_id != ?
          AND m.created_at > COALESCE(
            (SELECT r.last_read_at FROM ts_channel_reads r WHERE r.user_id = ? AND r.channel_id = c.id),
            0
          )
      ) AS unread_count,
      (
        SELECT COUNT(*) 
        FROM ts_notifications n
        WHERE n.channel_id = c.id
          AND n.user_id = ?
          AND n.type = 'mention'
          AND n.is_read = 0
      ) AS mention_count
    FROM ts_channels c
    WHERE c.project_id = ?
    ORDER BY c.is_default DESC, c.created_at ASC
  `;

  const result = await turso.execute({
    sql: querySql,
    args: [userId, userId, userId, projectId],
  });

  let channels = result.rows;

  // Ensure default channels exist
  const hasDefaultText = channels.some(c => c.is_default === 1 && c.type === 'text');
  const hasDefaultAnnouncement = channels.some(c => c.is_default === 1 && c.type === 'announcement');

  if (!hasDefaultText || !hasDefaultAnnouncement) {
    const now = Date.now();
    let madeChanges = false;

    if (!hasDefaultText) {
      await turso.execute({
        sql: `INSERT INTO ts_channels (id, project_id, name, description, type, is_default, created_by, created_at, updated_at)
              VALUES (?, ?, 'general', 'General discussion for the whole team', 'text', 1, ?, ?, ?)`,
        args: [randomUUID(), projectId, userId, now, now],
      });
      madeChanges = true;
    }

    if (!hasDefaultAnnouncement) {
      await turso.execute({
        sql: `INSERT INTO ts_channels (id, project_id, name, description, type, is_default, created_by, created_at, updated_at)
              VALUES (?, ?, 'general', 'Important updates and announcements', 'announcement', 1, ?, ?, ?)`,
        args: [randomUUID(), projectId, userId, now, now],
      });
      madeChanges = true;
    }

    if (madeChanges) {
      const refetch = await turso.execute({
        sql: querySql,
        args: [userId, userId, userId, projectId],
      });
      channels = refetch.rows;
    }
  }

  return NextResponse.json({ channels });
}

// POST /api/teamspace/channels
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, name, description, type = "text" } = body;

  if (!projectId || !name) {
    return NextResponse.json({ error: "projectId and name required" }, { status: 400 });
  }

  // --- ACCESS CHECK & PERMISSION CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  // Check if user is owner/admin or if members_can_create_channels is enabled
  if (!access.permissions.isOwner && !access.permissions.isAdmin) {
    await initTeamspaceDB();
    const settings = await turso.execute({
      sql: "SELECT members_can_create_channels FROM ts_settings WHERE project_id = ?",
      args: [projectId],
    });
    const canCreate = settings.rows.length > 0 && settings.rows[0].members_can_create_channels === 1;
    if (!canCreate) {
      return NextResponse.json({ error: "Forbidden: Only owner or admin can create channels" }, { status: 403 });
    }
  }

  await initTeamspaceDB();

  const id = randomUUID();
  const now = Date.now();
  const cleanName = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  await turso.execute({
    sql: `INSERT INTO ts_channels (id, project_id, name, description, type, is_default, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    args: [id, projectId, cleanName, description ?? null, type, userId, now, now],
  });

  const result = await turso.execute({
    sql: "SELECT * FROM ts_channels WHERE id = ?",
    args: [id],
  });

  const newChannel = result.rows[0];

  // Publish to Ably
  const ablyChannel = ably.channels.get(`project:${projectId}:channels`);
  await ablyChannel.publish("channel.created", newChannel);

  return NextResponse.json({ channel: newChannel }, { status: 201 });
}

