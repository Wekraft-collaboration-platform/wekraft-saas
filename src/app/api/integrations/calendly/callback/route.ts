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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

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

  const { projectId, slug, sessionId = `calendly:${projectId}`, userId, userName } = state;
  const redirectUri = `${baseUrl}/api/integrations/calendly/callback`;
  const integrationsUrl = `${baseUrl}/dashboard/my-projects/${slug}/workspace/integrations`;

  if (error || !code) {
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(error || "Authorization cancelled")}`
    );
  }

  try {
    const tokens = await completeMCPOAuth(
      "https://mcp.calendly.com",
      sessionId,
      redirectUri,
      code
    );

    const accessToken = tokens.access_token;

    const { count: toolsCount, tools } = await fetchMCPTools(
      "https://mcp.calendly.com",
      accessToken
    );

    await convex.mutation(api.mcp.saveOAuthConnection, {
      projectId,
      connectorId: "calendly",
      agent: "kaya",
      accessToken,
      userId,
      userName: userName ? decodeURIComponent(userName) : undefined,
      metadata: {
        workspaceName: "Calendly",
        toolsCount: toolsCount || undefined,
        tools: tools.length > 0 ? tools : undefined,
        mcpUrl: "https://mcp.calendly.com",
      },
    });

    return NextResponse.redirect(`${integrationsUrl}?connected=calendly`);
  } catch (err: any) {
    console.error("Calendly Dynamic MCP Callback Error:", err);
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(err.message || "Calendly OAuth connection error")}`
    );
  }
}
