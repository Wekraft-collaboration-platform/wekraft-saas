import { auth } from "@clerk/nextjs/server";
import Ably from "ably";
import { type NextRequest, NextResponse } from "next/server";
import { initTeamspaceDB, turso } from "@/lib/turso";
import {
  verifyProjectAccess,
  verifyChannelAccess,
} from "@/modules/workspace/teamspace/lib/auth";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { channelId } = await params;
  if (!channelId) {
    return NextResponse.json({ error: "channelId required" }, { status: 400 });
  }

  await initTeamspaceDB();

  // Find project_id for this channel
  const channelRes = await turso.execute({
    sql: "SELECT project_id FROM ts_channels WHERE id = ?",
    args: [channelId],
  });

  if (channelRes.rows.length === 0) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const projectId = channelRes.rows[0].project_id as string;

  // --- PROJECT ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  // --- CHANNEL ACCESS CHECK ---
  const channelAccess = await verifyChannelAccess(
    userId,
    channelId,
    access.permissions,
  );
  if (!channelAccess.allowed) {
    return NextResponse.json(
      { error: "Forbidden", code: channelAccess.code },
      { status: channelAccess.status },
    );
  }

  // Fetch all reads for this channel
  const readsRes = await turso.execute({
    sql: "SELECT user_id, last_read_at FROM ts_channel_reads WHERE channel_id = ?",
    args: [channelId],
  });

  const reads = readsRes.rows.map((r) => ({
    userId: r.user_id as string,
    lastReadAt: r.last_read_at as number,
  }));

  return NextResponse.json({ reads });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ channelId: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { channelId } = await params;
  if (!channelId) {
    return NextResponse.json({ error: "channelId required" }, { status: 400 });
  }

  await initTeamspaceDB();

  // Find project_id for this channel
  const channelRes = await turso.execute({
    sql: "SELECT project_id FROM ts_channels WHERE id = ?",
    args: [channelId],
  });

  if (channelRes.rows.length === 0) {
    return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  }

  const projectId = channelRes.rows[0].project_id as string;

  // --- PROJECT ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  // --- CHANNEL ACCESS CHECK ---
  const channelAccess = await verifyChannelAccess(
    userId,
    channelId,
    access.permissions,
  );
  if (!channelAccess.allowed) {
    return NextResponse.json(
      { error: "Forbidden", code: channelAccess.code },
      { status: channelAccess.status },
    );
  }

  const now = Date.now();

  // 1. Insert or update the read receipt
  await turso.execute({
    sql: `
      INSERT INTO ts_channel_reads (user_id, channel_id, last_read_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, channel_id) DO UPDATE SET last_read_at = excluded.last_read_at
    `,
    args: [userId, channelId, now],
  });

  // 2. Mark any unread mention notifications for this user in this channel as read
  await turso.execute({
    sql: "UPDATE ts_notifications SET is_read = 1 WHERE user_id = ? AND channel_id = ? AND type = 'mention'",
    args: [userId, channelId],
  });

  // 3. Publish to Ably for real-time read receipts sync
  const channel = ably.channels.get(`project:${projectId}:reads`);
  await channel.publish("channel.read", {
    userId,
    channelId,
    lastReadAt: now,
  });

  return NextResponse.json({ success: true });
}
