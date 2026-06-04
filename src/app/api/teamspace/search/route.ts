import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { initTeamspaceDB, turso } from "@/lib/turso";
import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("q");
  const projectId = req.nextUrl.searchParams.get("projectId");
  const channelId = req.nextUrl.searchParams.get("channelId");

  if (!query || !projectId)
    return NextResponse.json(
      { error: "query and projectId required" },
      { status: 400 },
    );

  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access)
    return NextResponse.json(
      { error: access.error },
      { status: access.status },
    );

  await initTeamspaceDB();

  try {
    // ── Private-channel-aware search ──────────────────────────────────────────
    // JOIN ts_channels + LEFT JOIN ts_private_channel_members so we can
    // exclude private-channel messages the user cannot access.
    // Owners and admins bypass this filter (they see everything).
    const isPrivileged =
      access.permissions.isOwner || access.permissions.isAdmin;

    const privateFilter = isPrivileged
      ? "" // owners/admins see everything
      : `AND (
           ch.type != 'private'
           OR ch.created_by = ?
           OR pcm.user_id IS NOT NULL
         )`;

    const sql = channelId
      ? `
        SELECT
          m.*,
          snippet(ts_messages_fts, 2, '<b>', '</b>', '...', 32) as match_snippet
        FROM ts_messages m
        JOIN ts_messages_fts ON m.id = ts_messages_fts.message_id
        JOIN ts_channels ch ON m.channel_id = ch.id
        LEFT JOIN ts_private_channel_members pcm
          ON pcm.channel_id = ch.id AND pcm.user_id = ?
        WHERE ts_messages_fts.project_id = ?
          AND m.channel_id = ?
          ${privateFilter}
          AND ts_messages_fts MATCH ?
        ORDER BY m.created_at DESC
        LIMIT 20
      `
      : `
        SELECT
          m.*,
          snippet(ts_messages_fts, 2, '<b>', '</b>', '...', 32) as match_snippet
        FROM ts_messages m
        JOIN ts_messages_fts ON m.id = ts_messages_fts.message_id
        JOIN ts_channels ch ON m.channel_id = ch.id
        LEFT JOIN ts_private_channel_members pcm
          ON pcm.channel_id = ch.id AND pcm.user_id = ?
        WHERE ts_messages_fts.project_id = ?
          ${privateFilter}
          AND ts_messages_fts MATCH ?
        ORDER BY m.created_at DESC
        LIMIT 20
      `;

    // Build args: pcm JOIN userId + projectId + (channelId) + (created_by userId if not privileged) + query
    let args: string[];
    if (isPrivileged) {
      args = channelId
        ? [userId, projectId, channelId, `${query}*`]
        : [userId, projectId, `${query}*`];
    } else {
      // Extra userId arg for the `OR ch.created_by = ?` in privateFilter
      args = channelId
        ? [userId, projectId, channelId, userId, `${query}*`]
        : [userId, projectId, userId, `${query}*`];
    }

    const result = await turso.execute({ sql, args });

    return NextResponse.json({
      results: result.rows.map((m) => ({
        ...m,
        link_preview: m.link_preview
          ? JSON.parse(m.link_preview as string)
          : null,
      })),
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
