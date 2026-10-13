import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!stateRaw) {
    return NextResponse.redirect(`${baseUrl}/?error=invalid_oauth_state`);
  }

  let state: {
    projectId: Id<"projects">;
    slug: string;
    userId?: Id<"users">;
    userName?: string;
  };
  try {
    state = JSON.parse(Buffer.from(stateRaw, "base64url").toString());
  } catch {
    return NextResponse.redirect(`${baseUrl}/?error=malformed_oauth_state`);
  }

  const { projectId, slug, userId, userName } = state;
  const redirectUri = `${baseUrl}/api/integrations/slack/callback`;
  const integrationsUrl = `${baseUrl}/dashboard/my-projects/${slug}/workspace/integrations`;

  if (error || !code) {
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(error || "Authorization cancelled")}`
    );
  }

  const clientId = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(
        "SLACK_CLIENT_ID or SLACK_CLIENT_SECRET is missing in environment variables"
      )}`
    );
  }

  try {
    // Exchange OAuth code for workspace-specific bot access token
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      throw new Error(tokenData.error || "Slack token exchange failed");
    }

    // Bot token granted by user for their specific workspace (starts with xoxb-)
    const accessToken = tokenData.access_token || tokenData.authed_user?.access_token;
    const teamName = tokenData.team?.name || "Slack Workspace";
    const teamId = tokenData.team?.id || "";

    const defaultSlackTools = [
      "slack_list_channels",
      "slack_post_message",
      "slack_read_channel_history",
      "slack_get_user_profile",
      "slack_list_users",
    ];

    await convex.mutation(api.mcp.saveOAuthConnection, {
      projectId,
      connectorId: "slack",
      agent: "kaya",
      accessToken,
      userId,
      userName: userName ? decodeURIComponent(userName) : undefined,
      metadata: {
        workspaceName: teamName,
        teamId,
        toolsCount: defaultSlackTools.length,
        tools: defaultSlackTools,
        mcpUrl: "https://mcp.slack.com/mcp",
      },
    });

    return NextResponse.redirect(`${integrationsUrl}?connected=slack`);
  } catch (err: any) {
    console.error("Slack OAuth Callback Error:", err);
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(
        err.message || "Slack OAuth connection error"
      )}`
    );
  }
}
