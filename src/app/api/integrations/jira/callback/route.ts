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

  const { projectId, slug, sessionId = `jira:${projectId}`, userId, userName } = state;
  const redirectUri = `${baseUrl}/api/integrations/jira/callback`;
  const integrationsUrl = `${baseUrl}/dashboard/my-projects/${slug}/workspace/integrations`;

  if (error || !code) {
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(error || "Authorization cancelled")}`
    );
  }

  try {
    const tokens = await completeMCPOAuth(
      "https://mcp.atlassian.com/v2/mcp",
      sessionId,
      redirectUri,
      code
    );

    const accessToken = tokens.access_token;

    const { count: toolsCount, tools } = await fetchMCPTools(
      "https://mcp.atlassian.com/v2/mcp",
      accessToken
    );

    const defaultJiraTools = [
      "jira_list_issues",
      "jira_search_issues_jql",
      "jira_get_sprint_issues",
      "jira_create_issue",
      "jira_get_project_components",
    ];

    const finalTools = tools.length > 0 ? tools : defaultJiraTools;

    await convex.mutation(api.mcp.saveOAuthConnection, {
      projectId,
      connectorId: "jira",
      agent: "kaya",
      accessToken,
      userId,
      userName: userName ? decodeURIComponent(userName) : undefined,
      metadata: {
        workspaceName: "Atlassian Jira Workspace",
        toolsCount: toolsCount || finalTools.length,
        tools: finalTools,
        mcpUrl: "https://mcp.atlassian.com/v2/mcp",
        refreshToken: tokens.refresh_token || undefined,
        expiresIn: tokens.expires_in || undefined,
        tokenExpiresAt: tokens.expires_in ? Date.now() + tokens.expires_in * 1000 : undefined,
      },
    });

    return NextResponse.redirect(`${integrationsUrl}?connected=jira`);
  } catch (err: any) {
    console.error("Jira Dynamic MCP Callback Error:", err);
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(err.message || "Jira OAuth connection error")}`
    );
  }
}
