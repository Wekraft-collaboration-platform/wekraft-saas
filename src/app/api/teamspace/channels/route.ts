import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import { randomUUID } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

// GET /api/teamspace/channels?projectId=xxx
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  await initTeamspaceDB();

  // --- ACCESS CHECK ---
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const user = await convex.query(api.user.getUserByClerkToken, { clerkToken: userId });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const project = await convex.query(api.project.getProjectById, { projectId: projectId as Id<"projects"> });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

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

  // --- OWNERSHIP CHECK ---
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  
  // Find Convex user
  const user = await convex.query(api.user.getUserByClerkToken, { clerkToken: userId });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Get project
  const project = await convex.query(api.project.getProjectById, { projectId: projectId as Id<"projects"> });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  // ONLY OWNER CAN CREATE CHANNELS
  if (project.ownerId !== user._id) {
    return NextResponse.json({ error: "Forbidden: Only owner can create channels" }, { status: 403 });
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
