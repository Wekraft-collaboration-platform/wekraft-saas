import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
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

  // Enforce one reaction per user per message (WhatsApp style)
  // 1. Get ALL existing reactions for this user on this message
  const existing = await turso.execute({
    sql: "SELECT emoji FROM ts_reactions WHERE message_id = ? AND user_id = ?",
    args: [messageId, userId],
  });

  const msgRow = await turso.execute({
    sql: "SELECT channel_id FROM ts_messages WHERE id = ?",
    args: [messageId],
  });

  if (msgRow.rows.length === 0) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }
  const channelId = msgRow.rows[0].channel_id as string;
  const ablyChannel = ably.channels.get(`teamspace:${channelId}`);

  let alreadyHasThisEmoji = false;

  if (existing.rows.length > 0) {
    // Remove ALL existing reactions for this user on this message
    // We do this to clean up any duplicates that might have existed
    await turso.execute({
      sql: "DELETE FROM ts_reactions WHERE message_id = ? AND user_id = ?",
      args: [messageId, userId],
    });

    // Broadcast removal for each existing emoji that isn't the new one
    for (const row of existing.rows) {
      const oldEmoji = row.emoji as string;
      if (oldEmoji === emoji) {
        alreadyHasThisEmoji = true;
        continue;
      }
      await ablyChannel.publish("reaction.updated", { messageId, userId, emoji: oldEmoji, action: "remove" });
    }
  }

  // 2. Add the new reaction (unless they were just toggling the same emoji off, 
  // but toggleReaction handles DELETE for that case. In POST, we always ADD.)
  const id = randomUUID();
  await turso.execute({
    sql: "INSERT OR IGNORE INTO ts_reactions (id, message_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [id, messageId, userId, emoji, Date.now()],
  });

  // Broadcast addition
  await ablyChannel.publish("reaction.updated", { messageId, userId, emoji, action: "add" });

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
