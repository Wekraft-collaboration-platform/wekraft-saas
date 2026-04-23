import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import { randomUUID } from "crypto";
import { verifyProjectAccess } from "@/modules/teamspace/lib/auth";

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

  const result = await turso.execute({
    sql: "SELECT * FROM ts_channels WHERE project_id = ? ORDER BY is_default DESC, created_at ASC",
    args: [projectId],
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
              VALUES (?, ?, 'announcements', 'Important updates and announcements', 'announcement', 1, ?, ?, ?)`,
        args: [randomUUID(), projectId, userId, now, now],
      });
      madeChanges = true;
    }

    if (madeChanges) {
      const refetch = await turso.execute({
        sql: "SELECT * FROM ts_channels WHERE project_id = ? ORDER BY is_default DESC, created_at ASC",
        args: [projectId],
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

  // ONLY OWNER OR ADMIN CAN CREATE CHANNELS
  if (!access.permissions.isOwner && !access.permissions.isAdmin) {
    return NextResponse.json({ error: "Forbidden: Only owner or admin can create channels" }, { status: 403 });
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

  return NextResponse.json({ channel: result.rows[0] }, { status: 201 });
}

