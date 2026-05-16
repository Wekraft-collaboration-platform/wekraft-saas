"use server";

import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "octokit";
import pLimit from "p-limit";

// ========================================
// GETTING GITHUB ACCESS TOKEN FROM CLERK
// ========================================
export async function getGithubAccessToken(userId?: string) {
  let targetUserId = userId;

  if (!targetUserId) {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    targetUserId = currentUserId;
  }

  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(
    targetUserId,
    "github",
  );
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

// ============================================
// GETTING GITHUB ISSUES
// ============================================
export const getIssues = async (
  owner: string,
  repo: string,
  page: number = 1,
  perPage: number = 10,
) => {
  const token = await getGithubAccessToken();

  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: "open", // fetches only open & reopened issues
    sort: "updated",
    direction: "desc",
    page,
    per_page: perPage,
  });

  // Filter out pull requests — GitHub API returns PRs as issues too
  return data.filter((issue) => !issue.pull_request);
};

// ============================================
// GETTING GITHUB FOLDER CHURN DATA
// ============================================
export const getFolderChurnData = async (
  owner: string,
  repo: string,
  folderPath: string,
) => {
  const token = await getGithubAccessToken();
  const octokit = new Octokit({ auth: token });

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // last 7 days

  const { data: commits } = await octokit.rest.repos.listCommits({
    owner,
    repo,
    path: folderPath,
    since,
    per_page: 100,
  });

  const isChangedRecently = commits.length > 0;

  return {
    folderPath,
    isChangedRecently, // true = yellow
  };
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

  const token = await getGithubAccessToken();
  const octokit = new Octokit({ auth: token });

  const { data: hooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });
  const existingHook = hooks.find((hook) => hook.config.url === fullWebhookUrl);

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
// ============================================
// GETTING PROJECT HEALTH DATA
// openIssuesCount
// closedIssuesCount
// lastCommitDate
// commitsLast60Days
// prMergeRate
// ============================================
export const getProjectHealthData = async (
  owner: string,
  repo: string,
  userId?: string,
) => {
  console.log(`📊 Fetching health data for: ${owner}/${repo}`);

  const token = await getGithubAccessToken(userId);
  const octokit = new Octokit({ auth: token });

  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  try {
    // 🚀 Execute ALL requests in parallel
    const [
      { data: openIssuesData },
      { data: closedIssuesData },
      { data: repoData },
      { data: commits },
      { data: allPRs },
    ] = await Promise.all([
      octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: "open",
        per_page: 1,
      }),
      octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: "closed",
        per_page: 1,
      }),
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listCommits({
        owner,
        repo,
        since: sixtyDaysAgo.toISOString(),
        per_page: 100,
      }),
      octokit.rest.pulls.list({ owner, repo, state: "all", per_page: 100 }),
    ]);

    // Process results
    const openIssuesCount = openIssuesData.length;
    const closedIssuesCount = closedIssuesData.length;
    const lastCommitDate = repoData.pushed_at;
    const commitsLast60Days = commits.length;

    const totalPRs = allPRs.length;
    const mergedPRs = allPRs.filter((pr) => pr.merged_at !== null).length;
    const prMergeRate = totalPRs > 0 ? (mergedPRs / totalPRs) * 100 : 0;

    return {
      openIssuesCount,
      closedIssuesCount,
      lastCommitDate,
      commitsLast60Days,
      totalPRs,
      mergedPRs,
      prMergeRate: Math.round(prMergeRate),
    };
  } catch (error) {
    console.error("❌ Error fetching health data:", error);
    throw new Error("Failed to fetch project health data");
  }
};
// ============================================
// GETTING PROJECT LANGUAGES
// Array of { name, bytes, percentage } sorted by usage
// ============================================
export const getProjectLanguages = async (
  owner: string,
  repo: string,
  userId?: string,
) => {
  console.log(`🗣️ Fetching languages for: ${owner}/${repo}`);

  const token = await getGithubAccessToken(userId);
  const octokit = new Octokit({ auth: token });

  try {
    console.log("🔍 Fetching languages...");
    const { data: languages } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });

    console.log("✅ Raw language data:", languages);

    // Calculate total bytes
    const totalBytes = Object.values(languages).reduce(
      (sum, bytes) => sum + bytes,
      0,
    );

    // Convert to array with percentages
    const languageData = Object.entries(languages).map(([name, bytes]) => ({
      name,
      bytes,
      percentage: parseFloat(((bytes / totalBytes) * 100).toFixed(2)),
    }));

    // Sort by percentage descending
    languageData.sort((a, b) => b.percentage - a.percentage);

    console.log("✅ Languages with percentages:");
    languageData.forEach((lang) => {
      console.log(`   ${lang.name}: ${lang.percentage}%`);
    });

    return languageData;
  } catch (error) {
    console.error("❌ Error fetching languages:", error);
    throw new Error("Failed to fetch project languages");
  }
};