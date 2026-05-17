import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { channelId } = params;
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

  // --- ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

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

  return NextResponse.json({ success: true });
}
