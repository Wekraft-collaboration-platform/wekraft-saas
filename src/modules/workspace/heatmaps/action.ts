"use server";

import { auth } from "@clerk/nextjs/server";
import { Octokit } from "octokit";
import { redis } from "@/lib/redis";
import { getGithubAccessToken } from "@/modules/github/actions/action";

export interface FolderNode {
  name: string;
  path: string;
  fileCount: number;      // Direct files in this folder
  totalFileCount: number; // Total files in this folder + subfolders
  folderCount: number;    // Total subfolders
  children: Record<string, FolderNode>;
  files: string[];        // Direct file names in this folder
  isOpen?: boolean;
}


interface RepoStructure {
  root: FolderNode;
  lastUpdated: number;
}

const CACHE_TTL = 30 * 60; // 30 minutes
const REFRESH_COOLDOWN = 5 * 60; // 5 minutes

export async function getRepoStructure(
  owner: string,
  repo: string,
  forceRefresh: boolean = false
): Promise<{ data: RepoStructure | null; error?: string; rateLimited?: boolean }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const cacheKey = `wekraft:repo-structure:${owner}:${repo}`;
    const rateLimitKey = `wekraft:repo-refresh-limit:${userId}:${owner}:${repo}`;

    // 1. Check Rate Limit if force refreshing
    if (forceRefresh) {
      const lastRefresh = await redis.get<number>(rateLimitKey);
      const now = Date.now();
      if (lastRefresh && now - lastRefresh < REFRESH_COOLDOWN * 1000) {
        return { data: null, rateLimited: true };
      }
    }

    // 2. Check Cache
    if (!forceRefresh) {
      const cachedData = await redis.get<RepoStructure>(cacheKey);
      if (cachedData) {
        return { data: cachedData };
      }
    }

    // 3. Fetch from GitHub
    console.log(`[Heatmap] Fetching repo structure for ${owner}/${repo}...`);
    const accessToken = await getGithubAccessToken();
    const octokit = new Octokit({ auth: accessToken });

    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;

    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: "true",
    });

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

    treeData.tree.forEach((item) => {
      const parts = item.path?.split("/") || [];
      let current = root;

      // Handle file counting
      if (item.type === "blob") {
        root.totalFileCount++;
        const fileName = parts[parts.length - 1];

        // Navigate to the parent folder of the file
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
            root.folderCount++;
          }
          current = current.children[part];
          current.totalFileCount++;
        }
        current.fileCount++;
        current.files.push(fileName);
      } else if (item.type === "tree") {
        // Handle folder creation
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
            root.folderCount++;
          }
          current = current.children[part];
        }

        // Count subfolders for intermediate folders
        let temp = root;
        for (let i = 0; i < parts.length - 1; i++) {
            temp = temp.children[parts[i]];
            temp.folderCount++;
        }
      }
    });

    const structure: RepoStructure = {
      root,
      lastUpdated: Date.now(),
    };

    // 5. Save to Cache & Rate Limit
    await redis.set(cacheKey, structure, { ex: CACHE_TTL });
    if (forceRefresh) {
      await redis.set(rateLimitKey, Date.now(), { ex: REFRESH_COOLDOWN });
    }

    return { data: structure };
  } catch (error) {
    console.error(`[Heatmap] Error fetching repo structure:`, error);
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch repo structure" };
  }
}
