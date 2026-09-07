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

  const { projectId, slug, sessionId = `linear:${projectId}`, userId, userName } = state;
  const redirectUri = `${baseUrl}/api/integrations/linear/callback`;
  const integrationsUrl = `${baseUrl}/dashboard/my-projects/${slug}/workspace/integrations`;

  if (error || !code) {
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(error || "Authorization cancelled")}`
    );
  }

  try {
    const tokens = await completeMCPOAuth(
      "https://mcp.linear.app/mcp",
      sessionId,
      redirectUri,
      code
    );

    const accessToken = tokens.access_token;

    const { count: toolsCount, tools } = await fetchMCPTools(
      "https://mcp.linear.app/mcp",
      accessToken
    );

    let workspaceName = "Linear Workspace";
    let viewerName = userName ? decodeURIComponent(userName) : "Linear User";
    try {
      const viewerRes = await fetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          query: `query { viewer { name email organization { name urlKey } } }`,
        }),
      });
      const viewerData = await viewerRes.json();
      if (viewerData.data?.viewer) {
        workspaceName = viewerData.data.viewer.organization?.name || workspaceName;
        if (!userName) {
          viewerName = viewerData.data.viewer.name || viewerName;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch Linear viewer info:", e);
    }

    await convex.mutation(api.mcp.saveOAuthConnection, {
      projectId,
      connectorId: "linear",
      agent: "kaya",
      accessToken,
      userId,
      userName: viewerName,
      metadata: {
        workspaceName,
        viewerName,
        toolsCount: toolsCount || undefined,
        tools: tools.length > 0 ? tools : undefined,
        mcpUrl: "https://mcp.linear.app/mcp",
      },
    });

    return NextResponse.redirect(`${integrationsUrl}?connected=linear`);
  } catch (err: any) {
    console.error("Linear Dynamic MCP Callback Error:", err);
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(err.message || "OAuth connection error")}`
    );
  }
}
