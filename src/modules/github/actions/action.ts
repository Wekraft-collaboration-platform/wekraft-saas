"use server";

import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "octokit";
import pLimit from "p-limit";

// ========================================
// GETTING GITHUB ACCESS TOKEN FROM CLERK
// ========================================
export async function getGithubAccessToken() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(userId, "github");
  const accessToken = tokens.data[0]?.token;

  return accessToken;
}

// ============================================
// GETTING GITHUB REPOSITORIES
// ============================================
export const getRepositories = async (
  page: number = 1,
  perPage: number = 10,
) => {
  const token = await getGithubAccessToken();

  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    affiliation: "owner,organization_member",
    page: page,
    per_page: perPage,
  });

  return data;
};

// ===================================================
// GET USER LANGUAGES FOR SKIILS
// ===================================================
export const getUserTopLanguages = async (
  username: string,
): Promise<string[]> => {
  const token = await getGithubAccessToken();
  const octokit = new Octokit({ auth: token });

  try {
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      per_page: 30,
      sort: "pushed",
      direction: "desc",
      type: "owner",
    });

    console.log(`📦 Got ${repos.length} repos — counting languages...`);

    const counts: Record<string, number> = {};
    for (const repo of repos) {
      if (!repo.language) continue;
      counts[repo.language] = (counts[repo.language] ?? 0) + 1;
    }

    const threshold = repos.length * 0.1;
    const topLanguages = Object.entries(counts)
      .filter(([, count]) => count >= threshold)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([lang]) => lang);

    console.log(`✅ Top languages for ${username}:`, topLanguages);
    return topLanguages;
  } catch (error: any) {
    const status = error?.status;

    if (status === 401) {
      console.error(`🔐 Unauthorized — GitHub token is invalid or expired`);
    } else if (status === 403) {
      console.error(
        `⛔ Forbidden — Rate limit hit or insufficient token scope`,
      );
    } else if (status === 404) {
      console.error(`❌ User not found: ${username}`);
    } else if (status === 422) {
      console.error(`⚠️ Unprocessable — invalid username or request params`);
    } else if (status >= 500) {
      console.error(`🔥 GitHub server error (${status}) — try again later`);
    } else {
      console.error(
        `❌ Unexpected error fetching languages for ${username}:`,
        error,
      );
    }

    return [];
  }
};
// ============================================
// CREATING WEBHOOK
// ============================================
export const createWebhook = async (
  owner: string,
  repo: string,
): Promise<{ success: boolean; error?: string }> => {
  const webhookUrl = process.env.WEBHOOK_URL_NGROK;

  if (!webhookUrl) {
    return { success: false, error: "Webhook URL is not configured" };
  }

  const fullWebhookUrl = `${webhookUrl}/api/webhooks/github`;

  try {
    const token = await getGithubAccessToken();
    const octokit = new Octokit({ auth: token });

    const { data: hooks } = await octokit.rest.repos.listWebhooks({
      owner,
      repo,
    });
    const existingHook = hooks.find(
      (hook) => hook.config.url === fullWebhookUrl,
    );

    if (existingHook) {
      return { success: true };
    }

    await octokit.rest.repos.createWebhook({
      owner,
      repo,
      config: { url: fullWebhookUrl, content_type: "json" },
      events: [
        "pull_request",
        "push",
        "issues",
        "deployment",
        "deployment_status",
      ],
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create webhook",
    };
  }
};
// ===============================
// GETTING THE USER CONTRIBUTIONS.
// ================================
export async function fetchUserContributions(token: string, username: string) {
  const accessToken = token || (await getGithubAccessToken());
  const octokit = new Octokit({
    auth: accessToken,
  });

  const query = `
    query($username:String!){
        user(login:$username){
            contributionsCollection{
                contributionCalendar{
                    totalContributions
                    weeks{
                        contributionDays{
                            contributionCount
                            date
                            color
                        }
                    }
                }
            }
        }
    }`;

  try {
    const response: any = await octokit.graphql(query, {
      username: username,
    });

    console.log("contribution collected successfully at action.ts");
    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    console.error(error);
    return null;
  }
}
