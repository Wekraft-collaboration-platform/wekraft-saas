"use server";

import { auth } from "@clerk/nextjs/server";
import { Octokit } from "octokit";
import { redis } from "@/lib/redis";
import { getGithubAccessToken } from "@/lib/github-auth";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

export interface FolderNode {
  name: string;
  path: string;
  fileCount: number;
  totalFileCount: number;
  folderCount: number;
  children: Record<string, FolderNode>;
  files: string[];
  isOpen?: boolean;
}

// Typed task record — avoids `any` propagating through the UI
export type TaskRecord = Record<string, unknown>;

interface RepoStructure {
  root: FolderNode;
  lastUpdated: number;
  tasks?: TaskRecord[];
}

export interface CommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  date: string;
  url: string;
}

const CACHE_TTL = 30 * 60;
const REFRESH_COOLDOWN = 5 * 60;

// GitHub owner/repo names: alphanumeric, hyphens, dots, underscores only
const GITHUB_NAME_REGEX = /^[a-zA-Z0-9._-]+$/;

/**
 * Validates that owner and repo strings are safe GitHub identifiers
 * and optionally that they match the project's linked repository.
 */
function validateRepoParams(
  owner: string,
  repo: string,
  linkedRepoFullName?: string | null,
) {
  if (!GITHUB_NAME_REGEX.test(owner) || !GITHUB_NAME_REGEX.test(repo)) {
    throw new Error("Invalid repository owner or name");
  }
  if (linkedRepoFullName && linkedRepoFullName !== `${owner}/${repo}`) {
    throw new Error("Repository does not match the project's linked repository");
  }
}

export async function getRepoStructure(
  owner: string,
  repo: string,
  forceRefresh: boolean = false,
  projectId?: string
): Promise<{ data: RepoStructure | null; error?: string; rateLimited?: boolean }> {
  try {
    const { userId, getToken } = await auth();
    if (!userId) throw new Error("Unauthorized");

    let tasksData: TaskRecord[] = [];
    let finalOwnerClerkId: string | undefined = undefined;
    if (projectId) {
      const token = await getToken({ template: "convex" });
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      if (token) convex.setAuth(token);

      const projectPerms = await convex.query(api.project.getProjectPermissions, { projectId: projectId as any });
      if (!projectPerms.isPower && !projectPerms.isMember && !projectPerms.isViewer) {
        throw new Error("Unauthorized to access project repository");
      }
      
      const projectData = await convex.query(api.project.getProjectById, { projectId: projectId as any });
      if (projectData && projectData.ownerClerkId) {
        finalOwnerClerkId = projectData.ownerClerkId;
      }

      // ✅ Validate owner/repo against the project's actual linked repository
      validateRepoParams(owner, repo, projectData?.repoFullName);

      tasksData = await convex.query(api.workspace.getTimelineTasks, { projectId: projectId as any }) as TaskRecord[];
    } else {
      // ✅ Even without a projectId, sanitize the input format
      validateRepoParams(owner, repo);
    }

    // ✅ Cache key has no userId — already shared across all users for this repo
    const cacheKey = `wekraft:repo-structure:${owner}:${repo}`;
    // ✅ Rate limit key stays per-user — controls WHO can trigger a refresh
    const rateLimitKey = `wekraft:repo-refresh-limit:${userId}:${owner}:${repo}`;

    // 1. Check Rate Limit if force refreshing
    if (forceRefresh) {
      const acquired = await redis.set(rateLimitKey, "1", { nx: true, ex: REFRESH_COOLDOWN });
      if (!acquired) {
        console.log(`----------[Heatmap] Rate limited for ${owner}/${repo}----------`);
        return { data: null, rateLimited: true };
      }
    }

    // 2. Check Cache
    if (!forceRefresh) {
      const cachedData = await redis.get<RepoStructure>(cacheKey);
      if (cachedData) {
        console.log(`------------[Heatmap] Cache hit for ${owner}/${repo}---------------`);
        return { data: cachedData };
      }
    }

    // 3. Fetch from GitHub
    console.log(`[Heatmap] Fetching churn for ${owner}/${repo}...`);
    const accessToken = await getGithubAccessToken(finalOwnerClerkId);
    const octokit = new Octokit({ auth: accessToken });

    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;

    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: "true",
    });

    if (treeData.truncated) {
      console.warn(`[Heatmap] Tree for ${owner}/${repo} is truncated — results are partial.`);
    }

    // 4. Process Tree
    const root: FolderNode = {
      name: repo,
      path: "",
      fileCount: 0,
      totalFileCount: 0,
      folderCount: 0,
      children: {},
      files: [],
      isOpen: true,
    };

    const sortedTree = [...treeData.tree].sort((a) => (a.type === "tree" ? -1 : 1));

    sortedTree.forEach((item) => {
      const parts = item.path?.split("/") || [];
      let current = root;

      if (item.type === "blob") {
        root.totalFileCount++;
        const fileName = parts[parts.length - 1];

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              path: parts.slice(0, i + 1).join("/"),
              fileCount: 0,
              totalFileCount: 0,
              folderCount: 0,
              children: {},
              files: [],
            };
            current.folderCount++;
          }
          current = current.children[part];
          current.totalFileCount++;
        }
        current.fileCount++;
        current.files.push(fileName);
      } else if (item.type === "tree") {
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              path: parts.slice(0, i + 1).join("/"),
              fileCount: 0,
              totalFileCount: 0,
              folderCount: 0,
              children: {},
              files: [],
            };
            current.folderCount++;
          }
          current = current.children[part];
        }
      }
    });

    const structure: RepoStructure = {
      root,
      lastUpdated: Date.now(),
      tasks: tasksData,
    };

    // 5. Save to Cache
    await redis.set(cacheKey, structure, { ex: CACHE_TTL });

    return { data: structure };
  } catch (error) {
    console.error(`[Heatmap] Error fetching repo structure:`, error);
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch repo structure" };
  }
}

export async function getRecentlyChangedPaths(
  owner: string,
  repo: string,
  projectId?: string
): Promise<string[]> {
  try {
    const { userId, getToken } = await auth();
    if (!userId) throw new Error("Unauthorized");

    let finalOwnerClerkId: string | undefined = undefined;
    if (projectId) {
      const token = await getToken({ template: "convex" });
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      if (token) convex.setAuth(token);

      const projectPerms = await convex.query(api.project.getProjectPermissions, { projectId: projectId as any });
      if (!projectPerms.isPower && !projectPerms.isMember && !projectPerms.isViewer) {
        throw new Error("Unauthorized to access project repository");
      }
      
      const projectData = await convex.query(api.project.getProjectById, { projectId: projectId as any });
      if (projectData && projectData.ownerClerkId) {
        finalOwnerClerkId = projectData.ownerClerkId;
      }

      // ✅ Validate owner/repo against the project's actual linked repository
      validateRepoParams(owner, repo, projectData?.repoFullName);
    } else {
      // ✅ Even without a projectId, sanitize the input format
      validateRepoParams(owner, repo);
    }

    const cacheKey = `wekraft:repo-churn:${owner}:${repo}`;
    const cachedData = await redis.get<string[]>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const accessToken = await getGithubAccessToken(finalOwnerClerkId);
    const octokit = new Octokit({ auth: accessToken });

    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      since,
      per_page: 100,
    });

    if (commits.length === 0) return [];

    const oldestSha = commits[commits.length - 1].sha;
    const newestSha = commits[0].sha;

    const { data: comparison } = await octokit.rest.repos.compareCommits({
      owner,
      repo,
      base: oldestSha + "^",
      head: newestSha,
    });

    const changedPaths = new Set<string>();
    comparison.files?.forEach(file => {
      if (file.filename) {
        const parts = file.filename.split('/');
        for (let i = 1; i <= parts.length; i++) {
          const path = parts.slice(0, i).join('/');
          if (path) changedPaths.add(path);
        }
      }
    });

    const changedPathsArray = Array.from(changedPaths);
    await redis.set(cacheKey, changedPathsArray, { ex: CACHE_TTL });

    return changedPathsArray;
  } catch (error) {
    console.error(`[Heatmap] Error fetching recently changed paths:`, error);
    return [];
  }
}

export async function getLatestCommits(
  owner: string,
  repo: string,
  forceRefresh: boolean = false,
  projectId?: string
): Promise<{
  data: CommitInfo[] | null;
  error?: string;
  rateLimited?: boolean;
}> {
  try {
    const { userId, getToken } = await auth();
    if (!userId) throw new Error("Unauthorized");

    let finalOwnerClerkId: string | undefined = undefined;
    if (projectId) {
      const token = await getToken({ template: "convex" });
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      if (token) convex.setAuth(token);

      const projectPerms = await convex.query(api.project.getProjectPermissions, { projectId: projectId as any });
      if (!projectPerms.isPower && !projectPerms.isMember && !projectPerms.isViewer) {
        throw new Error("Unauthorized to access project repository");
      }
      
      const projectData = await convex.query(api.project.getProjectById, { projectId: projectId as any });
      if (projectData && projectData.ownerClerkId) {
        finalOwnerClerkId = projectData.ownerClerkId;
      }

      // ✅ Validate owner/repo against the project's actual linked repository
      validateRepoParams(owner, repo, projectData?.repoFullName);
    } else {
      // ✅ Even without a projectId, sanitize the input format
      validateRepoParams(owner, repo);
    }

    const cacheKey = `wekraft:repo-commits:${owner}:${repo}`;
    const rateLimitKey = `wekraft:repo-commits-refresh-limit:${userId}:${owner}:${repo}`;

    if (forceRefresh) {
      const acquired = await redis.set(rateLimitKey, "1", {
        nx: true,
        ex: REFRESH_COOLDOWN,
      });
      if (!acquired) {
        return { data: null, rateLimited: true };
      }
    }

    if (!forceRefresh) {
      const cachedData = await redis.get<CommitInfo[]>(cacheKey);
      if (cachedData) {
        return { data: cachedData };
      }
    }

    const accessToken = await getGithubAccessToken(finalOwnerClerkId);
    const octokit = new Octokit({ auth: accessToken });

    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 10,
    });

    const commitData: CommitInfo[] = commits.map((commit) => ({
      sha: commit.sha.substring(0, 7),
      message: commit.commit.message.split("\n")[0],
      author: {
        name: commit.commit.author?.name || "Unknown",
        avatar: commit.author?.avatar_url || "",
        username: commit.author?.login || "unknown",
      },
      date: commit.commit.author?.date || "",
      url: commit.html_url,
    }));

    await redis.set(cacheKey, commitData, { ex: CACHE_TTL });

    return { data: commitData };
  } catch (error) {
    console.error(`[Heatmap] Error fetching commits:`, error);
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to fetch commits",
    };
  }
}