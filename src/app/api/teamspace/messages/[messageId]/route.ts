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
  const { content, is_pinned } = await req.json();

  if (content === undefined && is_pinned === undefined) {
    return NextResponse.json({ error: "content or is_pinned required" }, { status: 400 });
  }

  // Ensure the message belongs to this user (for edits) or user is admin (for pins)
  const existing = await turso.execute({
    sql: "SELECT user_id, channel_id FROM ts_messages WHERE id = ?",
    args: [messageId],
  });

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // For simplicity, allowing anyone to pin for now (or you can restrict to owner/admin)
  const isEditing = content !== undefined;
  if (isEditing && existing.rows[0].user_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = Date.now();
  const updates: string[] = [];
  const args: any[] = [];

  if (content !== undefined) {
    updates.push("content = ?, edited_at = ?");
    args.push(content.trim(), now);
  }
  if (is_pinned !== undefined) {
    updates.push("is_pinned = ?");
    args.push(is_pinned ? 1 : 0);
  }

  args.push(messageId);

  await turso.execute({
    sql: `UPDATE ts_messages SET ${updates.join(", ")} WHERE id = ?`,
    args,
  });

  // Notify channel subscribers
  const channelId = existing.rows[0].channel_id as string;
  const ablyChannel = ably.channels.get(`teamspace:${channelId}`);
  
  await ablyChannel.publish("message.updated", {
    id: messageId,
    content: content?.trim(),
    is_pinned: is_pinned,
    edited_at: content !== undefined ? now : undefined,
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
