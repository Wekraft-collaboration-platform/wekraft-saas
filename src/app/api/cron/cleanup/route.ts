import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";

/**
 * GET /api/cron/cleanup
 *
 * Deletes teamspace messages older than 30 days from Turso.
 * Designed to be called by Vercel Cron Jobs daily at midnight UTC.
 *
 * Secured via CRON_SECRET environment variable.
 * Set CRON_SECRET in your Vercel project environment variables.
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
    // Delete messages older than 30 days (but keep pinned messages forever)
    const result = await turso.execute({
      sql: `
        DELETE FROM ts_messages
        WHERE created_at < ?
          AND (is_pinned IS NULL OR is_pinned = 0)
      `,
      args: [thirtyDaysAgo],
    });

    const deleted = result.rowsAffected ?? 0;

    // Also clean up orphaned read receipts for channels with no messages
    await turso.execute({
      sql: `
        DELETE FROM ts_channel_reads
        WHERE channel_id NOT IN (SELECT DISTINCT channel_id FROM ts_messages)
      `,
      args: [],
    });

    console.log(`[cron/cleanup] Deleted ${deleted} messages older than 30 days`);

    return NextResponse.json({
      success: true,
      deleted,
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
