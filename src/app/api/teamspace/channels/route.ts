import { auth } from "@clerk/nextjs/server";
import Ably from "ably";
import { randomUUID } from "crypto";
import { type NextRequest, NextResponse } from "next/server";
import { initTeamspaceDB, turso } from "@/lib/turso";
import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/teamspace/channels?projectId=xxx
// Returns all channels for the project. For private channels, computes
// `has_access` (0 or 1) inline via SQL CASE WHEN — no extra round trips.
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId)
    return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  await initTeamspaceDB();

  // LEFT JOIN ts_private_channel_members so we can compute has_access inline.
  // Arg slots (in order):
  //   has_access CASE     → userId (created_by check), userId (pcm join — already in ON clause)
  //   unread CASE guard   → userId, userId
  //   unread subquery     → userId (sender filter), userId (last_read_at)
  //   mention subquery    → userId
  //   pcm ON clause       → userId
  //   WHERE               → projectId
  const querySql = `
    SELECT
      c.*,
      CASE
        WHEN c.type != 'private'       THEN 1
        WHEN c.created_by = ?          THEN 1
        WHEN pcm.user_id IS NOT NULL   THEN 1
        ELSE 0
      END AS has_access,
      CASE
        WHEN c.type = 'private' AND c.created_by != ? AND pcm.user_id IS NULL THEN 0
        ELSE (
          SELECT COUNT(*)
          FROM ts_messages m
          WHERE m.channel_id = c.id
            AND m.user_id != ?
            AND m.created_at > COALESCE(
              (SELECT r.last_read_at FROM ts_channel_reads r WHERE r.user_id = ? AND r.channel_id = c.id),
              0
            )
        )
      END AS unread_count,
      CASE
        WHEN c.type = 'private' AND c.created_by != ? AND pcm.user_id IS NULL THEN 0
        ELSE (
          SELECT COUNT(*)
          FROM ts_notifications n
          WHERE n.channel_id = c.id
            AND n.user_id = ?
            AND n.type = 'mention'
            AND n.is_read = 0
        )
      END AS mention_count
    FROM ts_channels c
    LEFT JOIN ts_private_channel_members pcm
      ON pcm.channel_id = c.id AND pcm.user_id = ?
    WHERE c.project_id = ?
    ORDER BY c.is_default DESC, c.created_at ASC
  `;

  const queryArgs = [
    userId, // has_access: created_by check
    userId, // unread CASE: created_by check
    userId, // unread subquery: sender filter
    userId, // unread subquery: last_read_at lookup
    userId, // mention CASE: created_by check
    userId, // mention subquery: user_id
    userId, // pcm JOIN: user_id
    projectId,
  ];

  const result = await turso.execute({ sql: querySql, args: queryArgs });
  let channels = result.rows;

  // Seed default channels if missing (first visit to this teamspace)
  const hasDefaultText = channels.some(
    (c) => c.is_default === 1 && c.type === "text",
  );
  const hasDefaultAnnouncement = channels.some(
    (c) => c.is_default === 1 && c.type === "announcement",
  );

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
              VALUES (?, ?, 'announcements', 'Important updates and announcements', 'announcement', 1, ?, ?, ?)`,
        args: [randomUUID(), projectId, userId, now, now],
      });
      madeChanges = true;
    }

    if (madeChanges) {
      const refetch = await turso.execute({ sql: querySql, args: queryArgs });
      channels = refetch.rows;
    }
  }

  return NextResponse.json({ channels });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teamspace/channels
// Creates a new channel. For private channels, bulk-inserts membership records
// in a single parameterized query (creator + selected memberIds).
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, name, description, type = "text", memberIds } = body;

  if (!projectId || !name)
    return NextResponse.json(
      { error: "projectId and name required" },
      { status: 400 },
    );

  if (!["text", "announcement", "private"].includes(type))
    return NextResponse.json(
      { error: "Invalid channel type" },
      { status: 400 },
    );

  // Sanitise memberIds: array of non-empty strings, max 50
  const validatedMemberIds: string[] = Array.isArray(memberIds)
    ? memberIds
        .filter(
          (id): id is string => typeof id === "string" && id.trim().length > 0,
        )
        .slice(0, 50)
    : [];

  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  // Permission gate: owner/admin can always create; regular members need the setting
  if (!access.permissions.isOwner && !access.permissions.isAdmin) {
    await initTeamspaceDB();
    const settings = await turso.execute({
      sql: "SELECT members_can_create_channels FROM ts_settings WHERE project_id = ?",
      args: [projectId],
    });
    const canCreate =
      settings.rows.length > 0 &&
      settings.rows[0].members_can_create_channels === 1;
    if (!canCreate) {
      return NextResponse.json(
        { error: "Forbidden: Only owner or admin can create channels" },
        { status: 403 },
      );
    }
  }

  await initTeamspaceDB();

  const id = randomUUID();
  const now = Date.now();
  const cleanName = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  await turso.execute({
    sql: `INSERT INTO ts_channels (id, project_id, name, description, type, is_default, created_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    args: [
      id,
      projectId,
      cleanName,
      description ?? null,
      type,
      userId,
      now,
      now,
    ],
  });

  // ── Private channel: bulk-insert membership records ────────────────────────
  // Always includes the creator (userId). Deduplicates if creator is in memberIds.
  // Single parameterized multi-row INSERT avoids N+1 round trips.
  if (type === "private") {
    const allMembers = Array.from(new Set([userId, ...validatedMemberIds]));
    const placeholders = allMembers.map(() => "(?, ?, ?, ?)").join(", ");
    const memberArgs = allMembers.flatMap((uid) => [id, uid, userId, now]);

    await turso.execute({
      sql: `INSERT OR IGNORE INTO ts_private_channel_members
              (channel_id, user_id, added_by, added_at)
            VALUES ${placeholders}`,
      args: memberArgs,
    });
  }

  const result = await turso.execute({
    sql: "SELECT * FROM ts_channels WHERE id = ?",
    args: [id],
  });

  const newChannel = { ...result.rows[0], has_access: 1 }; // creator always has access

  // Broadcast to all project members so their sidebars update in real-time
  const ablyChannel = ably.channels.get(`project:${projectId}:channels`);
  await ablyChannel.publish("channel.created", newChannel);

  return NextResponse.json({ channel: newChannel }, { status: 201 });
}
