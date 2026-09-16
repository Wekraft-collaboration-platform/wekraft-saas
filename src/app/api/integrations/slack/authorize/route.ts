import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const slug = searchParams.get("slug");
  const userId = searchParams.get("userId");
  const userName = searchParams.get("userName");

  if (!projectId || !slug) {
    return NextResponse.json({ error: "Missing projectId or slug" }, { status: 400 });
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const redirectUri = `${baseUrl}/api/integrations/slack/callback`;

  if (!clientId) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/my-projects/${slug}/workspace/integrations?error=${encodeURIComponent(
          "SLACK_CLIENT_ID is not configured in .env.local. Add SLACK_CLIENT_ID and SLACK_CLIENT_SECRET."
        )}`,
        req.url
      )
    );
  }

  const statePayload = Buffer.from(
    JSON.stringify({ projectId, slug, userId, userName })
  ).toString("base64url");

  // Bot scopes for Slack MCP & Kaya AI
  const botScopes = [
    "channels:read",
    "channels:history",
    "groups:read",
    "groups:history",
    "im:read",
    "im:history",
    "mpim:read",
    "chat:write",
    "chat:write.public",
    "users:read",
  ].join(",");

  const slackAuthUrl = new URL("https://slack.com/oauth/v2/authorize");
  slackAuthUrl.searchParams.set("client_id", clientId);
  slackAuthUrl.searchParams.set("scope", botScopes);
  slackAuthUrl.searchParams.set("redirect_uri", redirectUri);
  slackAuthUrl.searchParams.set("state", statePayload);

  return NextResponse.redirect(slackAuthUrl.toString());
}
