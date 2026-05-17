import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";

// GET /api/teamspace/notifications?limit=20
export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") ?? 20),
    50,
  );

  await initTeamspaceDB();

  const result = await turso.execute({
    sql: `SELECT n.*, c.name AS channel_name 
          FROM ts_notifications n
          LEFT JOIN ts_channels c ON n.channel_id = c.id
          WHERE n.user_id = ? 
          ORDER BY n.created_at DESC LIMIT ?`,
    args: [userId, limit],
  });

  const unreadCountRes = await turso.execute({
    sql: `SELECT COUNT(*) as count FROM ts_notifications WHERE user_id = ? AND is_read = 0`,
    args: [userId],
  });

  const notifications = result.rows;
  const unreadCount = Number(unreadCountRes.rows[0].count);

  return NextResponse.json({ notifications, unreadCount });
}

// PATCH /api/teamspace/notifications - Mark all as read
// OR PATCH /api/teamspace/notifications?id=xxx - Mark one as read
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");

  await initTeamspaceDB();

  if (id) {
    await turso.execute({
      sql: `UPDATE ts_notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      args: [id, userId],
    });
  } else {
    await turso.execute({
      sql: `UPDATE ts_notifications SET is_read = 1 WHERE user_id = ?`,
      args: [userId],
    });
  }

  return NextResponse.json({ success: true });
}
