import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") as Id<"projects"> | null;
  const slug = searchParams.get("slug");
  const userId = searchParams.get("userId") as Id<"users"> | null;
  const userName = searchParams.get("userName");

  if (!projectId || !slug) {
    return NextResponse.json({ error: "Missing projectId or slug" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const integrationsUrl = `${baseUrl}/dashboard/my-projects/${slug}/workspace/integrations`;

  try {
    const { userId: clerkUserId } = await auth();
    let accessToken: string | undefined;

    if (clerkUserId) {
      try {
        const client = await clerkClient();
        const tokens = await client.users.getUserOauthAccessToken(
          clerkUserId,
          "github"
        );
        accessToken = tokens.data[0]?.token;
      } catch (tokenErr) {
        console.warn("[GitHub Authorize] Clerk OAuth token fetch failed:", tokenErr);
      }
    }

    if (!accessToken) {
      return NextResponse.redirect(
        `${integrationsUrl}?error=${encodeURIComponent(
          "No GitHub account linked. Please sign in with GitHub or link your GitHub account in your profile."
        )}`
      );
    }

    // Fetch project repository details to bind GitHub MCP directly to project repo
    let projectRepoInfo: { repoName?: string; repoFullName?: string; repositoryId?: string } = {};
    try {
      const project = await convex.query(api.project.getProjectById, { projectId });
      if (project) {
        projectRepoInfo = {
          repoName: project.repoName,
          repoFullName: project.repoFullName,
          repositoryId: project.repositoryId ? String(project.repositoryId) : undefined,
        };
      }
    } catch (e) {
      console.warn("[GitHub Authorize] Could not fetch project repo info:", e);
    }

    const defaultGitHubTools = [
      "github_list_pull_requests",
      "github_get_pull_request",
      "github_list_commits",
      "github_get_commit",
      "github_list_branches",
      "github_get_branch",
      "github_list_issues",
      "github_get_issue",
      "github_get_repository",
    ];

    await convex.mutation(api.mcp.saveOAuthConnection, {
      projectId,
      connectorId: "github",
      agent: "kaya",
      accessToken,
      userId: userId || undefined,
      userName: userName ? decodeURIComponent(userName) : undefined,
      metadata: {
        workspaceName: "GitHub",
        toolsCount: defaultGitHubTools.length,
        tools: defaultGitHubTools,
        mcpUrl: "https://api.githubcopilot.com/mcp",
        ...projectRepoInfo,
      },
    });

    return NextResponse.redirect(`${integrationsUrl}?connected=github`);
  } catch (err: any) {
    console.error("GitHub MCP Connection Error:", err);
    return NextResponse.redirect(
      `${integrationsUrl}?error=${encodeURIComponent(
        err.message || "Failed to connect GitHub MCP"
      )}`
    );
  }
}
