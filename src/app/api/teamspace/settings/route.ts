import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  await initTeamspaceDB();

  const result = await turso.execute({
    sql: "SELECT * FROM ts_settings WHERE project_id = ?",
    args: [projectId],
  });

  if (result.rows.length === 0) {
    // Return default settings
    return NextResponse.json({
      settings: {
        members_can_create_channels: 0,
        members_can_edit_channels: 0,
        members_can_delete_channels: 0,
      }
    });
  }

  return NextResponse.json({ settings: result.rows[0] });
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { projectId, members_can_create_channels, members_can_edit_channels, members_can_delete_channels } = body;

  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  if (!access.permissions.isOwner && !access.permissions.isAdmin) {
    return NextResponse.json({ error: "Forbidden: Only owner or admin can update settings" }, { status: 403 });
  }

  await initTeamspaceDB();

  const now = Date.now();

  const existing = await turso.execute({
    sql: "SELECT * FROM ts_settings WHERE project_id = ?",
    args: [projectId],
  });

  if (existing.rows.length === 0) {
    await turso.execute({
      sql: `INSERT INTO ts_settings (project_id, members_can_create_channels, members_can_edit_channels, members_can_delete_channels, updated_at)
            VALUES (?, ?, ?, ?, ?)`,
      args: [projectId, members_can_create_channels ? 1 : 0, members_can_edit_channels ? 1 : 0, members_can_delete_channels ? 1 : 0, now],
    });
  } else {
    await turso.execute({
      sql: `UPDATE ts_settings SET 
              members_can_create_channels = COALESCE(?, members_can_create_channels),
              members_can_edit_channels = COALESCE(?, members_can_edit_channels),
              members_can_delete_channels = COALESCE(?, members_can_delete_channels),
              updated_at = ?
            WHERE project_id = ?`,
      args: [
        members_can_create_channels !== undefined ? (members_can_create_channels ? 1 : 0) : null,
        members_can_edit_channels !== undefined ? (members_can_edit_channels ? 1 : 0) : null,
        members_can_delete_channels !== undefined ? (members_can_delete_channels ? 1 : 0) : null,
        now,
        projectId
      ],
    });
  }

  const updated = await turso.execute({
    sql: "SELECT * FROM ts_settings WHERE project_id = ?",
    args: [projectId],
  });

  return NextResponse.json({ settings: updated.rows[0] });
}
