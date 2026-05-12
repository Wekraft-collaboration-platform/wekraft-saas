import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso } from "@/lib/turso";
import Ably from "ably";
import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCES_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_KEY_S3 as string,
  },
  region: "ap-south-1",
});

const BUCKET_NAME = "wekraft-saas-upload-s3";

function extractS3Keys(content: string): string[] {
  if (!content) return [];
  const regex = /https:\/\/wekraft-saas-upload-s3\.s3\.ap-south-1\.amazonaws\.com\/(teamspace-media\/[^\s)"\]]+)/g;
  const keys: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }
  return keys;
}

async function deleteFromS3(keys: string[]) {
  for (const key of keys) {
    try {
      await s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }));
      console.log("Deleted from S3:", key);
    } catch (e) {
      console.error("Failed to delete from S3:", key, e);
    }
  }
}

// PATCH /api/teamspace/messages/[messageId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messageId } = await params;
  const body = await req.json();
  const { projectId, content, is_pinned, poll } = body;

  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  if (content === undefined && is_pinned === undefined && poll === undefined) {
    return NextResponse.json({ error: "content, is_pinned, or poll required" }, { status: 400 });
  }

  // --- ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  // Get existing message
  const existing = await turso.execute({
    sql: "SELECT user_id, channel_id, content FROM ts_messages WHERE id = ?",
    args: [messageId],
  });

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const isEditing = content !== undefined;
  const isPinning = is_pinned !== undefined;
  const isEditingPoll = poll !== undefined;

  // 1. EDIT content/poll: ONLY AUTHOR
  if ((isEditing || isEditingPoll) && existing.rows[0].user_id !== userId) {
    return NextResponse.json({ error: "Forbidden: You can only edit your own messages" }, { status: 403 });
  }

  // 2. PIN: ONLY OWNER OR ADMIN
  if (isPinning && !access.permissions.isOwner && !access.permissions.isAdmin) {
    return NextResponse.json({ error: "Forbidden: Only owner or admin can pin messages" }, { status: 403 });
  }

  const now = Date.now();
  const updates: string[] = [];
  const args: any[] = [];

  if (content !== undefined) {
    updates.push("content = ?, edited_at = ?");
    args.push(content.trim(), now);
    
    const oldContent = existing.rows[0].content as string;
    const oldKeys = extractS3Keys(oldContent);
    const newKeys = extractS3Keys(content);
    
    const keysToDelete = oldKeys.filter(k => !newKeys.includes(k));
    if (keysToDelete.length > 0) {
      await deleteFromS3(keysToDelete);
    }
  }
  if (is_pinned !== undefined) {
    updates.push("is_pinned = ?");
    args.push(is_pinned ? 1 : 0);
  }
  if (poll !== undefined) {
    updates.push("poll = ?, edited_at = ?");
    args.push(JSON.stringify(poll), now);
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
  const projectId = req.nextUrl.searchParams.get("projectId");

  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  // --- ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  const existing = await turso.execute({
    sql: "SELECT user_id, channel_id, content FROM ts_messages WHERE id = ?",
    args: [messageId],
  });

  if (existing.rows.length === 0) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // ALLOW AUTHOR OR OWNER/ADMIN
  const isAuthor = existing.rows[0].user_id === userId;
  const canModerate = access.permissions.isOwner || access.permissions.isAdmin;

  if (!isAuthor && !canModerate) {
    return NextResponse.json({ error: "Forbidden: You don't have permission to delete this message" }, { status: 403 });
  }

  const channelId = existing.rows[0].channel_id as string;

  const oldContent = existing.rows[0].content as string;
  const keysToDelete = extractS3Keys(oldContent);
  if (keysToDelete.length > 0) {
    await deleteFromS3(keysToDelete);
  }

  await turso.execute({
    sql: "DELETE FROM ts_messages WHERE id = ?",
    args: [messageId],
  });

  // Notify subscribers
  const ablyChannel = ably.channels.get(`teamspace:${channelId}`);
  await ablyChannel.publish("message.deleted", { id: messageId });

  return NextResponse.json({ success: true });
}

