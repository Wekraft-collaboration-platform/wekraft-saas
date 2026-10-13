import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { completeMCPOAuth } from "@/lib/mcp/dynamic-auth";
import { fetchMCPTools } from "@/lib/mcp/tool-fetcher";

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
    sessionId?: string;
    userId?: Id<"users">;
    userName?: string;
  };
  try {
    state = JSON.parse(Buffer.from(stateRaw, "base64url").toString());
  } catch {
    return NextResponse.redirect(`${baseUrl}/?error=malformed_oauth_state`);
  }

  const { projectId, slug, sessionId = `posthog:${projectId}`, userId, userName } = state;
  const redirectUri = `${baseUrl}/api/integrations/posthog/callback`;
  const integrationsUrl = `${baseUrl}/dashboard/my-projects/${slug}/workspace/integrations`;

  if (error || !code) {
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(error || "Authorization cancelled")}`
    );
  }

  try {
    const tokens = await completeMCPOAuth(
      "https://mcp.posthog.com/mcp",
      sessionId,
      redirectUri,
      code
    );

    const accessToken = tokens.access_token;

    const { count: toolsCount, tools } = await fetchMCPTools(
      "https://mcp.posthog.com/mcp",
      accessToken
    );

    await convex.mutation(api.mcp.saveOAuthConnection, {
      projectId,
      connectorId: "posthog",
      agent: "kaya",
      accessToken,
      userId,
      userName: userName ? decodeURIComponent(userName) : undefined,
      metadata: {
        workspaceName: "PostHog",
        toolsCount: toolsCount || undefined,
        tools: tools.length > 0 ? tools : undefined,
        mcpUrl: "https://mcp.posthog.com/mcp",
        refreshToken: tokens.refresh_token || undefined,
        expiresIn: tokens.expires_in || undefined,
        tokenExpiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
      },
    });

    return NextResponse.redirect(`${integrationsUrl}?connected=posthog`);
  } catch (err: any) {
    console.error("PostHog Dynamic MCP Callback Error:", err);
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(err.message || "PostHog OAuth connection error")}`
    );
  }
}
