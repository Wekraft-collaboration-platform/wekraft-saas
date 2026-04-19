import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import { initTeamspaceDB } from "@/lib/teamspace-db";
import Ably from "ably";
import { randomUUID } from "crypto";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

// POST /api/teamspace/reactions
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, emoji } = await req.json();
  if (!messageId || !emoji) {
    return NextResponse.json({ error: "messageId and emoji required" }, { status: 400 });
  }

  await initTeamspaceDB();

  // Upsert via INSERT OR IGNORE (UNIQUE constraint handles duplicates)
  const id = randomUUID();
  await turso.execute({
    sql: "INSERT OR IGNORE INTO ts_reactions (id, message_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [id, messageId, userId, emoji, Date.now()],
  });

  // Broadcast reaction update to Ably subscribers
  const msgRow = await turso.execute({
    sql: "SELECT channel_id FROM ts_messages WHERE id = ?",
    args: [messageId],
  });

  if (msgRow.rows.length > 0) {
    const channelId = msgRow.rows[0].channel_id as string;
    const ablyChannel = ably.channels.get(`teamspace:${channelId}`);
    await ablyChannel.publish("reaction.updated", { messageId, userId, emoji, action: "add" });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/teamspace/reactions
export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId, emoji } = await req.json();
  if (!messageId || !emoji) {
    return NextResponse.json({ error: "messageId and emoji required" }, { status: 400 });
  }

  await turso.execute({
    sql: "DELETE FROM ts_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?",
    args: [messageId, userId, emoji],
  });

  const msgRow = await turso.execute({
    sql: "SELECT channel_id FROM ts_messages WHERE id = ?",
    args: [messageId],
  });

  if (msgRow.rows.length > 0) {
    const channelId = msgRow.rows[0].channel_id as string;
    const ablyChannel = ably.channels.get(`teamspace:${channelId}`);
    await ablyChannel.publish("reaction.updated", { messageId, userId, emoji, action: "remove" });
  }

  return NextResponse.json({ success: true });
}
