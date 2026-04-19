import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { initTeamspaceDB } from "@/lib/teamspace-db";
import { randomUUID } from "crypto";

// GET /api/teamspace/channels?projectId=xxx
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  await initTeamspaceDB();

  const result = await turso.execute({
    sql: "SELECT * FROM ts_channels WHERE project_id = ? ORDER BY is_default DESC, created_at ASC",
    args: [projectId],
  });

  let channels = result.rows;

  // Auto-create #general if this project has no channels yet
  if (channels.length === 0) {
    const id = randomUUID();
    const now = Date.now();
    await turso.execute({
      sql: `INSERT INTO ts_channels (id, project_id, name, description, type, is_default, created_by, created_at, updated_at)
            VALUES (?, ?, 'general', 'General discussion for the whole team', 'text', 1, ?, ?, ?)`,
      args: [id, projectId, userId, now, now],
    });
    const refetch = await turso.execute({
      sql: "SELECT * FROM ts_channels WHERE project_id = ? ORDER BY is_default DESC, created_at ASC",
      args: [projectId],
    });
    channels = refetch.rows;
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
