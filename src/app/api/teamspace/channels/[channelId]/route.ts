import { auth } from "@clerk/nextjs/server";
import Ably from "ably";
import { type NextRequest, NextResponse } from "next/server";
import { initTeamspaceDB, turso } from "@/lib/turso";

import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

type Params = { channelId: string };

// GET /api/teamspace/channels/[channelId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { channelId } = await params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await initTeamspaceDB();

  const existing = await turso.execute({
    sql: "SELECT * FROM ts_channels WHERE id = ?",
    args: [channelId],
  });

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const channel = existing.rows[0];
  const projectId = channel.project_id as string;

  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json({ error: access.error }, { status: access.status });

  let memberIds: string[] = [];
  if (channel.type === "private") {
    const members = await turso.execute({
      sql: "SELECT user_id FROM ts_private_channel_members WHERE channel_id = ?",
      args: [channelId],
    });
    memberIds = members.rows.map((row) => row.user_id as string);
  }

  return NextResponse.json({ channel, memberIds });
}

// PATCH /api/teamspace/channels/[channelId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { channelId } = await params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, memberIds } = body;

  await initTeamspaceDB();

  // Get current channel to find projectId, type and created_by
  const existing = await turso.execute({
    sql: "SELECT project_id, is_default, type, created_by FROM ts_channels WHERE id = ?",
    args: [channelId],
  });

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const projectId = existing.rows[0].project_id as string;
  const channelType = existing.rows[0].type as string;
  const channelCreatedBy = existing.rows[0].created_by as string;

  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  const isPower = access.permissions.isOwner || access.permissions.isAdmin;

  if (!isPower) {
    const settings = await turso.execute({
      sql: "SELECT members_can_edit_channels FROM ts_settings WHERE project_id = ?",
      args: [projectId],
    });
    const canEdit =
      settings.rows.length > 0 &&
      settings.rows[0].members_can_edit_channels === 1;
    if (!canEdit) {
      return NextResponse.json(
        { error: "Forbidden: Only owner or admin can edit channels" },
        { status: 403 },
      );
    }
  }

  const now = Date.now();
  const cleanName = name
    ? name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
    : null;

  // Prevent renaming #general? Usually okay to rename, but maybe keep name for default.
  // Requirement says "only owner can edit", so we allow it.
  await turso.execute({
    sql: `UPDATE ts_channels SET name = COALESCE(?, name), description = COALESCE(?, description), updated_at = ? WHERE id = ?`,
    args: [cleanName, description ?? null, now, channelId],
  });

  // Manage private channel members if provided and user is owner/admin
  if (channelType === "private" && memberIds !== undefined) {
    if (!isPower) {
      return NextResponse.json(
        { error: "Forbidden: Only owner or admin can manage private channel members" },
        { status: 403 },
      );
    }

    const validatedMemberIds = Array.isArray(memberIds)
      ? memberIds.filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      : [];

    // Delete existing records
    await turso.execute({
      sql: "DELETE FROM ts_private_channel_members WHERE channel_id = ?",
      args: [channelId],
    });

    // Bulk insert new records including creator
    const allMembers = Array.from(new Set([channelCreatedBy, ...validatedMemberIds]));
    if (allMembers.length > 0) {
      const placeholders = allMembers.map(() => "(?, ?, ?, ?)").join(", ");
      const memberArgs = allMembers.flatMap((uid) => [channelId, uid, userId, now]);

      await turso.execute({
        sql: `INSERT OR IGNORE INTO ts_private_channel_members (channel_id, user_id, added_by, added_at) VALUES ${placeholders}`,
        args: memberArgs,
      });
    }
  }

  // Publish update to Ably
  const ablyChannel = ably.channels.get(`project:${projectId}:channels`);
  await ablyChannel.publish("channel.updated", {
    id: channelId,
    name: cleanName,
    description,
  });

  return NextResponse.json({ success: true });
}

// DELETE /api/teamspace/channels/[channelId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> },
) {
  const { channelId } = await params;
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  const isDefault = (existing.rows[0].is_default as number) === 1;

  // PREVENT DELETING DEFAULT CHANNEL
  if (isDefault) {
    return NextResponse.json(
      { error: "Cannot delete the default channel" },
      { status: 400 },
    );
  }

  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  if (!access.permissions.isOwner && !access.permissions.isAdmin) {
    const settings = await turso.execute({
      sql: "SELECT members_can_delete_channels FROM ts_settings WHERE project_id = ?",
      args: [projectId],
    });
    const canDelete =
      settings.rows.length > 0 &&
      settings.rows[0].members_can_delete_channels === 1;
    if (!canDelete) {
      return NextResponse.json(
        { error: "Forbidden: Only owner or admin can delete channels" },
        { status: 403 },
      );
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
