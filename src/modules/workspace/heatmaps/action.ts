"use server";

import { auth } from "@clerk/nextjs/server";
import { Octokit } from "octokit";
import { redis } from "@/lib/redis";
import { getGithubAccessToken } from "@/modules/github/actions/action";

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

interface RepoStructure {
  root: FolderNode;
  lastUpdated: number;
}

const CACHE_TTL = 30 * 60;
const REFRESH_COOLDOWN = 5 * 60;

export async function getRepoStructure(
  owner: string,
  repo: string,
  forceRefresh: boolean = false,
  ownerClerkId?: string
): Promise<{ data: RepoStructure | null; error?: string; rateLimited?: boolean }> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // ✅ Cache key has no userId — already shared across all users for this repo
    const cacheKey = `wekraft:repo-structure:${owner}:${repo}`;
    // ✅ Rate limit key stays per-user — controls WHO can trigger a refresh
    const rateLimitKey = `wekraft:repo-refresh-limit:${userId}:${owner}:${repo}`;

    // 1. Check Rate Limit if force refreshing
    // FIX: use SET NX instead of storing a timestamp — simpler, no NaN risk
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
    console.log(`[Heatmap] Fetching repo structure for ${owner}/${repo}...`);
    const accessToken = await getGithubAccessToken(ownerClerkId);
    const octokit = new Octokit({ auth: accessToken });

    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const defaultBranch = repoData.default_branch;

    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: "true",
    });

    // FIX: warn if GitHub truncated the tree (>100k items) — silent data loss otherwise
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

    // FIX: sort so "tree" items are processed before "blob" items
    // This ensures all folder nodes exist before we walk into them for file counting
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
            // FIX: increment the direct parent's folderCount, not always root
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
            // FIX: same — direct parent, not root
            current.folderCount++;
          }
          current = current.children[part];
        }
        // REMOVED: the broken "Count subfolders for intermediate folders" loop
        // — it was double-counting and always writing to root anyway
      }
    });

    const structure: RepoStructure = {
      root,
      lastUpdated: Date.now(),
    };

    // 5. Save to Cache
    // FIX: removed the second redis.set for rateLimitKey here —
    // the NX set in step 1 already handles it with the correct TTL
    await redis.set(cacheKey, structure, { ex: CACHE_TTL });

    return { data: structure };
  } catch (error) {
    console.error(`[Heatmap] Error fetching repo structure:`, error);
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch repo structure" };
  }
}