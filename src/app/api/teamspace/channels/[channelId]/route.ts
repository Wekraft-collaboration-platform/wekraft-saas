import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import Ably from "ably";

import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

type Params = { channelId: string };

// PATCH /api/teamspace/channels/[channelId]
export async function PATCH(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { channelId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description } = body;

  await initTeamspaceDB();

  // Get current channel to find projectId
  const existing = await turso.execute({
    sql: "SELECT project_id, is_default FROM ts_channels WHERE id = ?",
    args: [channelId],
  });

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const projectId = existing.rows[0].project_id as string;

  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  if (!access.permissions.isOwner && !access.permissions.isAdmin) {
    const settings = await turso.execute({
      sql: "SELECT members_can_edit_channels FROM ts_settings WHERE project_id = ?",
      args: [projectId],
    });
    const canEdit = settings.rows.length > 0 && settings.rows[0].members_can_edit_channels === 1;
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden: Only owner or admin can edit channels" }, { status: 403 });
    }
  }

  const now = Date.now();
  const cleanName = name ? name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") : null;

  // Prevent renaming #general? Usually okay to rename, but maybe keep name for default.
  // Requirement says "only owner can edit", so we allow it.
  await turso.execute({
    sql: `UPDATE ts_channels SET name = COALESCE(?, name), description = COALESCE(?, description), updated_at = ? WHERE id = ?`,
    args: [cleanName, description ?? null, now, channelId],
  });

  // Publish update to Ably
  const ablyChannel = ably.channels.get(`project:${projectId}:channels`);
  await ablyChannel.publish("channel.updated", { id: channelId, name: cleanName, description });

  return NextResponse.json({ success: true });
}

// DELETE /api/teamspace/channels/[channelId]
export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  const { channelId } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initTeamspaceDB();

  // Get current channel to find projectId
  const existing = await turso.execute({
    sql: "SELECT project_id, is_default FROM ts_channels WHERE id = ?",
    args: [channelId],
  });

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const projectId = existing.rows[0].project_id as string;
  const isDefault = existing.rows[0].is_default as number === 1;

  // PREVENT DELETING DEFAULT CHANNEL
  if (isDefault) {
    return NextResponse.json({ error: "Cannot delete the default channel" }, { status: 400 });
  }

  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  if (!access.permissions.isOwner && !access.permissions.isAdmin) {
    const settings = await turso.execute({
      sql: "SELECT members_can_delete_channels FROM ts_settings WHERE project_id = ?",
      args: [projectId],
    });
    const canDelete = settings.rows.length > 0 && settings.rows[0].members_can_delete_channels === 1;
    if (!canDelete) {
      return NextResponse.json({ error: "Forbidden: Only owner or admin can delete channels" }, { status: 403 });
    }
  }
  await turso.execute({
    sql: "DELETE FROM ts_channels WHERE id = ?",
    args: [channelId],
  });

  // Publish deletion to Ably
  const ablyChannel = ably.channels.get(`project:${projectId}:channels`);
  await ablyChannel.publish("channel.deleted", { id: channelId });

  // Turso schema has ON DELETE CASCADE for messages and reactions.
  
  return NextResponse.json({ success: true });
}
