import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import Ably from "ably";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

// PATCH /api/teamspace/messages/[messageId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "content required" }, { status: 400 });
  }

  // Ensure the message belongs to this user
  const existing = await turso.execute({
    sql: "SELECT user_id, channel_id FROM ts_messages WHERE id = ?",
    args: [messageId],
  });

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }
  if (existing.rows[0].user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = Date.now();
  await turso.execute({
    sql: "UPDATE ts_messages SET content = ?, edited_at = ? WHERE id = ?",
    args: [content.trim(), now, messageId],
  });

  // Notify channel subscribers of the edit
  const channelId = existing.rows[0].channel_id as string;
  const ablyChannel = ably.channels.get(`teamspace:${channelId}`);
  await ablyChannel.publish("message.edited", {
    id: messageId,
    content: content.trim(),
    edited_at: now,
  });

  return NextResponse.json({ success: true });
}

// DELETE /api/teamspace/messages/[messageId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await params;

  const existing = await turso.execute({
    sql: "SELECT user_id, channel_id FROM ts_messages WHERE id = ?",
    args: [messageId],
  });

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Allow own messages or admins (for simplicity, check own for now)
  if (existing.rows[0].user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const channelId = existing.rows[0].channel_id as string;

  await turso.execute({
    sql: "DELETE FROM ts_messages WHERE id = ?",
    args: [messageId],
  });

  // Notify subscribers
  const ablyChannel = ably.channels.get(`teamspace:${channelId}`);
  await ablyChannel.publish("message.deleted", { id: messageId });

  return NextResponse.json({ success: true });
}
