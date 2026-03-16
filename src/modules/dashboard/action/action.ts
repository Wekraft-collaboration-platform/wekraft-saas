import { redis } from "@/lib/redis";
import {
  fetchUserContributions,
  getGithubAccessToken,
} from "@/modules/github/actions/action";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { Octokit } from "octokit";

interface DashboardStats {
  totalCommits: number;
  totalPRs: number;
  totalMergedPRs: number;
  totalIssuesClosed: number;
  totalOpenIssues: number;
  totalReviews: number;
  accountAgeInYears: number;
  accountCreatedAt: string;
}

async function fetchDashboardStats(
  githubName: string,
  accessToken: string,
): Promise<DashboardStats> {
  const octokit = new Octokit({ auth: accessToken });

  const [
    calendar,
    prResult,
    mergedPRResult,
    closedIssuesResult,
    openIssuesResult,
    reviewsResult,
    userResult,
  ] = await Promise.allSettled([
    fetchUserContributions(accessToken, githubName),
    octokit.rest.search.issuesAndPullRequests({
      q: `author:${githubName} type:pr`,
      per_page: 1,
    }),
    octokit.rest.search.issuesAndPullRequests({
      q: `author:${githubName} type:pr is:merged`,
      per_page: 1,
    }),
    octokit.rest.search.issuesAndPullRequests({
      q: `author:${githubName} type:issue is:closed`,
      per_page: 1,
    }),
    octokit.rest.search.issuesAndPullRequests({
      q: `author:${githubName} type:issue is:open`,
      per_page: 1,
    }),
    octokit.rest.search.issuesAndPullRequests({
      q: `commenter:${githubName} type:pr`,
      per_page: 1,
    }),
    octokit.rest.users.getByUsername({ username: githubName }),
  ]);

  const accountCreatedAt =
    userResult.status === "fulfilled"
      ? userResult.value.data.created_at
      : new Date().toISOString();

  return {
    totalCommits:
      calendar.status === "fulfilled"
        ? (calendar.value?.totalContributions ?? 0)
        : 0,
    totalPRs:
      prResult.status === "fulfilled" ? prResult.value.data.total_count : 0,
    totalMergedPRs:
      mergedPRResult.status === "fulfilled"
        ? mergedPRResult.value.data.total_count
        : 0,
    totalIssuesClosed:
      closedIssuesResult.status === "fulfilled"
        ? closedIssuesResult.value.data.total_count
        : 0,
    totalOpenIssues:
      openIssuesResult.status === "fulfilled"
        ? openIssuesResult.value.data.total_count
        : 0,
    totalReviews:
      reviewsResult.status === "fulfilled"
        ? reviewsResult.value.data.total_count
        : 0,
    accountAgeInYears:
      (Date.now() - new Date(accountCreatedAt).getTime()) /
      (1000 * 60 * 60 * 24 * 365),
    accountCreatedAt,
  };
}

export async function getDashboardStats(
  githubName: string,
): Promise<DashboardStats> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const cacheKey = `wekraft:dashboard:${githubName}`;

  const cached = await redis.get<DashboardStats>(cacheKey);
  if (cached) {
    console.log("----Dashboard stats cached HIt----");
    return cached;
  }

  console.log("----Dashboard stats , Hitting github API----");
  const accessToken = await getGithubAccessToken();
  const data = await fetchDashboardStats(githubName, accessToken);

  await redis.set(cacheKey, data, { ex: 60 * 30 });

  return data;
}
