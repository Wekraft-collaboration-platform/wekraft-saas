"use server";

import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "octokit";
import pLimit from "p-limit";
import { getGithubAccessToken } from "@/lib/github-auth";



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

export const searchRepositories = async (query: string) => {
  const token = await getGithubAccessToken();
  const octokit = new Octokit({ auth: token });
  
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    affiliation: "owner,organization_member",
    per_page: 100, // Fetch the 100 most recently active repos
  });

  const lowerQuery = query.toLowerCase();
  const filtered = data.filter((repo: any) => 
    repo.name.toLowerCase().includes(lowerQuery)
  );

  return filtered.slice(0, 10); // Return top 10 matches
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

// ===================================================
// 1. GET PULL REQUESTS SUMMARY (Review Status, Stale PRs, Blockers)
// ===================================================
export const getPullRequestsSummary = async (
  owner: string,
  repo: string,
  userId?: string,
) => {
  const token = await getGithubAccessToken(userId);
  const octokit = new Octokit({ auth: token });

  try {
    const { data: pulls } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: 30,
    });

    const now = Date.now();
    const STALE_THRESHOLD_MS = 48 * 60 * 60 * 1000; // 48 hours

    const openPRs = pulls.filter((p) => p.state === "open").map((p) => {
      const updatedAtMs = new Date(p.updated_at).getTime();
      const isStale = now - updatedAtMs > STALE_THRESHOLD_MS;
      return {
        number: p.number,
        title: p.title,
        author: p.user?.login || "unknown",
        authorAvatar: p.user?.avatar_url || "",
        draft: p.draft || false,
        state: p.state,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        isStale,
        htmlUrl: p.html_url,
        headBranch: p.head.ref,
        baseBranch: p.base.ref,
        requestedReviewers: (p.requested_reviewers || []).map((r: any) => r.login),
      };
    });

    const stalePRs = openPRs.filter((p) => p.isStale);
    const closedPRs = pulls.filter((p) => p.state === "closed");
    const mergedPRs = closedPRs.filter((p) => p.merged_at !== null);

    return {
      totalCount: pulls.length,
      openCount: openPRs.length,
      closedCount: closedPRs.length,
      mergedCount: mergedPRs.length,
      staleCount: stalePRs.length,
      openPRs,
      stalePRs,
      recentMergedPRs: mergedPRs.slice(0, 5).map((p) => ({
        number: p.number,
        title: p.title,
        mergedAt: p.merged_at,
        author: p.user?.login || "unknown",
        htmlUrl: p.html_url,
      })),
    };
  } catch (error: any) {
    console.error("❌ Error fetching pull requests summary:", error);
    throw new Error(`Failed to fetch pull requests: ${error.message}`);
  }
};

// ===================================================
// 2. GET ISSUES SUMMARY (Open, Unassigned & Critical Blockers)
// ===================================================
export const getIssuesSummary = async (
  owner: string,
  repo: string,
  userId?: string,
  state: "open" | "closed" | "all" = "all",
) => {
  const token = await getGithubAccessToken(userId);
  const octokit = new Octokit({ auth: token });

  try {
    const { data: rawItems } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state,
      sort: "updated",
      direction: "desc",
      per_page: 30,
    });

    // Filter out pull requests
    const issues = rawItems.filter((item) => !item.pull_request).map((iss) => {
      const isUnassigned = !iss.assignee && (!iss.assignees || iss.assignees.length === 0);
      const labels = (iss.labels || []).map((l: any) => (typeof l === "string" ? l : l.name));
      const isBlocker = labels.some((lbl: string) =>
        /bug|critical|blocker|urgent|p0|high/i.test(lbl || ""),
      );

      return {
        number: iss.number,
        title: iss.title,
        state: iss.state,
        author: iss.user?.login || "unknown",
        assignees: (iss.assignees || []).map((a: any) => a.login),
        isUnassigned,
        isBlocker,
        labels,
        commentsCount: iss.comments,
        createdAt: iss.created_at,
        updatedAt: iss.updated_at,
        htmlUrl: iss.html_url,
      };
    });

    const openIssues = issues.filter((i) => i.state === "open");
    const closedIssues = issues.filter((i) => i.state === "closed");
    const unassignedOpen = openIssues.filter((i) => i.isUnassigned);
    const blockerIssues = openIssues.filter((i) => i.isBlocker);

    return {
      totalCount: issues.length,
      openCount: openIssues.length,
      closedCount: closedIssues.length,
      unassignedCount: unassignedOpen.length,
      blockerCount: blockerIssues.length,
      openIssues,
      unassignedIssues: unassignedOpen,
      blockerIssues,
    };
  } catch (error: any) {
    console.error("❌ Error fetching issues summary:", error);
    throw new Error(`Failed to fetch issues summary: ${error.message}`);
  }
};

// ===================================================
// 3. GET CONTRIBUTOR ACTIVITY (Developer Velocity & Contribution Tracking)
// ===================================================
export const getContributorActivity = async (
  owner: string,
  repo: string,
  userId?: string,
  days: number = 14,
) => {
  const token = await getGithubAccessToken(userId);
  const octokit = new Octokit({ auth: token });

  const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgoDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      since: sinceDate,
      per_page: 100,
    });

    const authorMap: Record<
      string,
      { login: string; name: string; avatarUrl: string; commitCount: number; lastCommitDate: string }
    > = {};

    let commitsLast7Days = 0;

    for (const c of commits) {
      const authorLogin = c.author?.login || c.commit.author?.name || "unknown";
      const authorName = c.commit.author?.name || authorLogin;
      const avatarUrl = c.author?.avatar_url || "";
      const commitDateStr = c.commit.author?.date || "";
      const commitDate = new Date(commitDateStr);

      if (commitDate >= sevenDaysAgoDate) {
        commitsLast7Days++;
      }

      if (!authorMap[authorLogin]) {
        authorMap[authorLogin] = {
          login: authorLogin,
          name: authorName,
          avatarUrl,
          commitCount: 0,
          lastCommitDate: commitDateStr,
        };
      }

      authorMap[authorLogin].commitCount += 1;
    }

    const topContributors = Object.values(authorMap).sort((a, b) => b.commitCount - a.commitCount);

    const recentCommits = commits.slice(0, 8).map((c) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message.split("\n")[0],
      author: c.author?.login || c.commit.author?.name || "unknown",
      date: c.commit.author?.date || "",
      htmlUrl: c.html_url,
    }));

    return {
      timeframeDays: days,
      totalCommits: commits.length,
      commitsLast7Days,
      activeContributorsCount: topContributors.length,
      topContributors,
      recentCommits,
    };
  } catch (error: any) {
    console.error("❌ Error fetching contributor activity:", error);
    throw new Error(`Failed to fetch contributor activity: ${error.message}`);
  }
};

// ===================================================
// 4. GET RELEASE AND CI STATUS (Release Tags, Milestones & Build Health)
// ===================================================
export const getReleaseAndCiStatus = async (
  owner: string,
  repo: string,
  userId?: string,
) => {
  const token = await getGithubAccessToken(userId);
  const octokit = new Octokit({ auth: token });

  try {
    const [releasesRes, runsRes] = await Promise.allSettled([
      octokit.rest.repos.listReleases({ owner, repo, per_page: 5 }),
      octokit.rest.actions.listWorkflowRunsForRepo({ owner, repo, per_page: 10 }),
    ]);

    const releases =
      releasesRes.status === "fulfilled"
        ? releasesRes.value.data.map((r) => ({
            id: r.id,
            tagName: r.tag_name,
            name: r.name || r.tag_name,
            publishedAt: r.published_at,
            prerelease: r.prerelease,
            htmlUrl: r.html_url,
          }))
        : [];

    const latestRelease = releases[0] || null;

    let workflowRuns: Array<{
      id: number;
      name: string;
      headBranch: string;
      status: string;
      conclusion: string | null;
      createdAt: string;
      htmlUrl: string;
    }> = [];

    if (runsRes.status === "fulfilled") {
      workflowRuns = (runsRes.value.data.workflow_runs || []).map((w: any) => ({
        id: w.id,
        name: w.name || "CI Workflow",
        headBranch: w.head_branch,
        status: w.status, // "completed", "in_progress", "queued"
        conclusion: w.conclusion, // "success", "failure", "cancelled"
        createdAt: w.created_at,
        htmlUrl: w.html_url,
      }));
    }

    const passingRuns = workflowRuns.filter((w) => w.conclusion === "success").length;
    const failingRuns = workflowRuns.filter(
      (w) => w.conclusion === "failure" || w.conclusion === "timed_out",
    ).length;
    const inProgressRuns = workflowRuns.filter(
      (w) => w.status === "in_progress" || w.status === "queued",
    ).length;

    return {
      latestRelease,
      releases,
      recentWorkflowRuns: workflowRuns,
      ciHealth: {
        totalTracked: workflowRuns.length,
        passingRuns,
        failingRuns,
        inProgressRuns,
        isHealthy: failingRuns === 0,
      },
    };
  } catch (error: any) {
    console.error("❌ Error fetching release and CI status:", error);
    throw new Error(`Failed to fetch release and CI status: ${error.message}`);
  }
};