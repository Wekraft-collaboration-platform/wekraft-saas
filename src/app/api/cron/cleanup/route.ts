import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCES_KEY as string,
    secretAccessKey: process.env.AWS_SECRET_KEY_S3 as string,
  },
  region: "ap-south-1",
});

const BUCKET_NAME = "wekraft-saas-upload-s3";

/**
 * Extracts S3 object keys from message content (inline images + attachments).
 * Matches both teamspace-media/ and attachments/ prefixes.
 */
function extractS3Keys(content: string): string[] {
  if (!content) return [];
  const regex =
    /https:\/\/wekraft-saas-upload-s3\.s3\.ap-south-1\.amazonaws\.com\/(teamspace-media\/[^\s)"\\]+)/g;
  const keys: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    keys.push(match[1]);
  }
  return keys;
}

async function deleteS3Keys(keys: string[]) {
  const results = await Promise.allSettled(
    keys.map((key) =>
      s3Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }))
    )
  );
  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) {
    console.warn(`[cron/cleanup] ${failed}/${keys.length} S3 deletions failed`);
  }
  return { total: keys.length, failed };
}

/**
 * GET /api/cron/cleanup
 *
 * 1. Finds all teamspace messages older than 30 days (excluding pinned).
 * 2. Deletes any S3 media/attachment files referenced in those messages.
 * 3. Hard-deletes the messages and their reactions from Turso.
 * 4. Cleans up orphaned read receipts.
 *
 * Runs daily at midnight UTC via Vercel Cron (vercel.json).
 * Secured via CRON_SECRET environment variable.
 */
export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron (or an authorized source)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initTeamspaceDB();

  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

  try {
    // Step 1: Fetch IDs and content of messages to be deleted
    const toDelete = await turso.execute({
      sql: `
        SELECT id, content FROM ts_messages
        WHERE created_at < ?
          AND (is_pinned IS NULL OR is_pinned = 0)
          AND content != '$__DELETED__$'
      `,
      args: [thirtyDaysAgo],
    });

    const messageIds = toDelete.rows.map((r) => r.id as string);

    // Step 2: Collect and delete all referenced S3 files
    const allS3Keys: string[] = [];
    for (const row of toDelete.rows) {
      const keys = extractS3Keys(row.content as string);
      allS3Keys.push(...keys);
    }

    let s3Stats = { total: 0, failed: 0 };
    if (allS3Keys.length > 0) {
      s3Stats = await deleteS3Keys(allS3Keys);
      console.log(`[cron/cleanup] Deleted ${allS3Keys.length - s3Stats.failed} S3 objects`);
    }

    // Step 3: Hard-delete the messages from Turso in batches of 100
    let deletedMessages = 0;
    const BATCH_SIZE = 100;
    for (let i = 0; i < messageIds.length; i += BATCH_SIZE) {
      const batch = messageIds.slice(i, i + BATCH_SIZE);
      const placeholders = batch.map(() => "?").join(", ");

      // Delete reactions first (foreign key dependency)
      await turso.execute({
        sql: `DELETE FROM ts_reactions WHERE message_id IN (${placeholders})`,
        args: batch,
      });

      // Delete the messages themselves
      const result = await turso.execute({
        sql: `DELETE FROM ts_messages WHERE id IN (${placeholders})`,
        args: batch,
      });

      deletedMessages += result.rowsAffected ?? 0;
    }

    // Step 4: Clean up orphaned read receipts
    await turso.execute({
      sql: `
        DELETE FROM ts_channel_reads
        WHERE channel_id NOT IN (SELECT DISTINCT channel_id FROM ts_messages)
      `,
      args: [],
    });

    console.log(`[cron/cleanup] Done — ${deletedMessages} messages, ${allS3Keys.length} S3 objects deleted`);

    return NextResponse.json({
      success: true,
      deletedMessages,
      deletedS3Objects: allS3Keys.length - s3Stats.failed,
      failedS3Deletions: s3Stats.failed,
      cutoff: new Date(thirtyDaysAgo).toISOString(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[cron/cleanup] Error during cleanup:", error);
    return NextResponse.json(
      { error: "Cleanup failed", details: String(error) },
      { status: 500 }
    );
  }
}

