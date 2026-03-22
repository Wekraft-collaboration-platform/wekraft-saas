"use server"
import { redis } from "@/lib/redis";
import {
  fetchUserContributions,
  getGithubAccessToken,
} from "@/modules/github/actions/action";
import { auth } from "@clerk/nextjs/server";
import { Octokit } from "octokit";

interface DashboardStats {
  totalCommits: number;
  totalPRs: number;
  totalMergedPRs: number;
  totalIssuesClosed: number;
  totalOpenIssues: number;
  totalReviews: number;
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
  ]);

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


export async function getContributionStats(githubName: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const cacheKey = `wekraft:contributionStats:${githubName}`;

  const cached = await redis.get<{ contributions: any[]; totalContributions: number }>(cacheKey);
  if (cached) {
    console.log("----Contribution stats cache HIT----");
    return cached;
  }

  console.log("----Contribution stats, hitting GitHub API----");

  try {
    const accessToken = await getGithubAccessToken();
    const calendar = await fetchUserContributions(accessToken, githubName);

    if (!calendar) {
      return { contributions: [], totalContributions: 0 };
    }

    const contributions = calendar.weeks.flatMap((week: any) =>
      week.contributionDays.map((day: any) => {
        const count = day.contributionCount;
        let level = 0;
        if (count > 0 && count <= 3) level = 1;
        else if (count > 3 && count <= 6) level = 2;
        else if (count > 6 && count <= 10) level = 3;
        else if (count > 10) level = 4;

        return {
          date: day.date,
          count: count,
          level: level,
        };
      })
    );

    const data = { contributions, totalContributions: calendar.totalContributions };

    await redis.set(cacheKey, data, { ex: 60 * 60 * 6 }); 

    return data;
  } catch (error) {
    console.log(error);
    return { contributions: [], totalContributions: 0 };
  }
}