import { NextRequest, NextResponse } from "next/server";
import { initiateMCPOAuth } from "@/lib/mcp/dynamic-auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const slug = searchParams.get("slug");
  const userId = searchParams.get("userId");
  const userName = searchParams.get("userName");

  if (!projectId || !slug) {
    return NextResponse.json({ error: "Missing projectId or slug" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/integrations/jira/callback`;
  const sessionId = `jira:${projectId}`;

  try {
    const authUrl = await initiateMCPOAuth(
      "https://mcp.atlassian.com/v2/mcp",
      sessionId,
      redirectUri
    );

    const redirectUrl = new URL(authUrl);
    const statePayload = Buffer.from(
      JSON.stringify({ projectId, slug, sessionId, userId, userName })
    ).toString("base64url");
    redirectUrl.searchParams.set("state", statePayload);

    return NextResponse.redirect(redirectUrl.toString());
  } catch (err: any) {
    console.error("Jira Dynamic MCP OAuth Error:", err);
    return NextResponse.redirect(
      new URL(
        `/dashboard/my-projects/${slug}/workspace/integrations?error=${encodeURIComponent(
          err.message || "Failed to start Jira MCP authorization"
        )}`,
        req.url
      )
    );
  }
}
