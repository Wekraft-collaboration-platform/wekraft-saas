"use server";

import { Octokit } from "octokit";
import { redis } from "@/lib/redis";
import { getGithubAccessToken } from "@/modules/github/actions/action";

type TreeNode = {
  path: string;
  type: "blob" | "tree"; // blob = file, tree = folder
  sha: string;
};
const BRANCH = "main";

type GetRepoTreeResult =
  | { success: true; data: TreeNode[] }
  | { success: false; error: string };

export const getRepoTree = async (
  owner: string,
  repo: string,
  dirPath: string = "",
): Promise<GetRepoTreeResult> => {
  const cacheKey = `wekraft:repo-tree:${owner}:${repo}:${dirPath || "root"}`;

  try {
    //  Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("----CAHED GITHUB FOLDER TREE HIT-----");
      return { success: true, data: cached as TreeNode[] };
    }

    const token = await getGithubAccessToken();
    const octokit = new Octokit({ auth: token });

    // const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    // const branch = repoData.default_branch;

    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: dirPath ? `${BRANCH}:${dirPath}` : BRANCH,
    });

    const nodes: TreeNode[] = (data.tree ?? [])
      .filter((item) => item.path && item.type && item.sha)
      .map((item) => ({
        path: dirPath ? `${dirPath}/${item.path}` : item.path!,
        type: item.type as "blob" | "tree",
        sha: item.sha!,
      }))
      .sort((a, b) => {
        // folders first, then files
        if (a.type === b.type) return a.path.localeCompare(b.path);
        return a.type === "tree" ? -1 : 1;
      });

    // Cache for 20 mins
    await redis.set(cacheKey, nodes, { ex: 1200 });

    return { success: true, data: nodes };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch repo tree",
    };
  }
};
