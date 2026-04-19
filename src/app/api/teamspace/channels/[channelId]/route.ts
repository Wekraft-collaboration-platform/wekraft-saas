import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

type Params = { channelId: string };

async function checkOwnership(userId: string, projectId: string) {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const user = await convex.query(api.user.getUserByClerkToken, { clerkToken: userId });
  if (!user) return { error: "User not found", status: 404 };

  const project = await convex.query(api.project.getProjectById, { projectId: projectId as Id<"projects"> });
  if (!project) return { error: "Project not found", status: 404 };

  if (project.ownerId !== user._id) {
    return { error: "Forbidden: Only owner can manage channels", status: 403 };
  }

  return { user, project };
}

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
  const isDefault = existing.rows[0].is_default as number === 1;

  const ownership = await checkOwnership(userId, projectId);
  if (ownership.error) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  const now = Date.now();
  const cleanName = name ? name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") : null;

  // Prevent renaming #general? Usually okay to rename, but maybe keep name for default.
  // Requirement says "only owner can edit", so we allow it.

  await turso.execute({
    sql: `UPDATE ts_channels SET name = COALESCE(?, name), description = COALESCE(?, description), updated_at = ? WHERE id = ?`,
    args: [cleanName, description ?? null, now, channelId],
  });

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

  const ownership = await checkOwnership(userId, projectId);
  if (ownership.error) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status });
  }

  await turso.execute({
    sql: "DELETE FROM ts_channels WHERE id = ?",
    args: [channelId],
  });

  // Turso schema has ON DELETE CASCADE for messages and reactions.
  
  return NextResponse.json({ success: true });
}
