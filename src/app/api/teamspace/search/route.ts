import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import { verifyProjectAccess } from "@/modules/teamspace/lib/auth";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const query = req.nextUrl.searchParams.get("q");
  const projectId = req.nextUrl.searchParams.get("projectId");

  if (!query || !projectId) {
    return NextResponse.json({ error: "query and projectId required" }, { status: 400 });
  }

  // --- ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  await initTeamspaceDB();

  try {
    // Search using FTS5 MATCH query
    // snippet(table, column_index, start, end, ellipsis, tokens)
    const result = await turso.execute({
      sql: `
        SELECT 
          m.*, 
          snippet(ts_messages_fts, 2, '<b>', '</b>', '...', 32) as match_snippet
        FROM ts_messages m
        JOIN ts_messages_fts ON m.id = ts_messages_fts.message_id
        WHERE ts_messages_fts.project_id = ? AND ts_messages_fts MATCH ?
        ORDER BY m.created_at DESC
        LIMIT 20
      `,
      args: [projectId, `${query}*`], 
    });

    return NextResponse.json({ 
      results: result.rows.map(m => ({
        ...m,
        link_preview: m.link_preview ? JSON.parse(m.link_preview as string) : null,
      }))
    });
  } catch (error) {
    console.error("Search failed:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
