"use server";

import { Octokit } from "octokit";
import { redis } from "@/lib/redis";
import { getGithubAccessToken } from "@/modules/github/actions/action";

const SKIP_FOLDERS = new Set([
  // Node / JS
  "node_modules", ".next", ".nuxt", ".output", "dist", "build", "out", ".cache", ".turbo", ".vercel", ".parcel-cache", ".vite", ".expo",
  // Git
  ".git", ".github",
  // Logs & coverage
  "coverage", "logs",
  // Public static heavy assets
  "public", "assets", "static", "images", "fonts",
  // IDE / Editor
  ".vscode", ".idea",
  // Python
  "__pycache__", ".pytest_cache", ".mypy_cache", ".venv", "venv", "env",
  // Java / Kotlin / Rust
  ".gradle", "target", "build", "vendor",
  // Ruby / Go / Swift / Docker / Terraform
  ".bundle", "bin", "pkg", "DerivedData", ".build", ".docker", ".terraform",
  // Misc
  "tmp", "temp", "doc", "docs"
]);

const SKIP_FILES = new Set([
  "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lockb",
  "LICENSE", "LICENSE.txt", "CODE_OF_CONDUCT.md", "CONTRIBUTING.md", "README.md",
  "tsconfig.json", "tailwind.config.ts", "next.config.ts", "next.config.js", "biome.json",
  "components.json", ".gitignore", ".env", ".env.local", ".env.example",
  "postcss.config.js", "postcss.config.ts", "tailwind.config.js"
]);

function shouldSkip(itemPath: string, type: "blob" | "tree"): boolean {
  const parts = itemPath.split("/");
  const fileName = parts[parts.length - 1];
  
  // Check folder skip
  if (parts.some((part) => SKIP_FOLDERS.has(part))) return true;

  if (type === "blob") {
    // Check specific file skip
    if (SKIP_FILES.has(fileName)) return true;
    
    // Skip markdown files if in root (usually documentation)
    if (fileName.toLowerCase().endsWith(".md")) return true;
    
    // Skip hidden files
    if (fileName.startsWith(".")) return true;
  }
  
  return false;
}

export type TreeNode = {
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
  ownerClerkId?: string
): Promise<GetRepoTreeResult> => {
  const cacheKey = `wekraft:repo-tree:v2:${owner}:${repo}:${dirPath || "root"}`;

  try {
    //  Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log("----CAHED GITHUB FOLDER TREE HIT-----");
      return { success: true, data: cached as TreeNode[] };
    }

    const token = await getGithubAccessToken(ownerClerkId);
    const octokit = new Octokit({ auth: token });

    // const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    // const branch = repoData.default_branch;

    const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: dirPath ? `${BRANCH}:${dirPath}` : BRANCH,
    });

    const nodes: TreeNode[] = (data.tree ?? [])
      .filter((item) => {
        if (!item.path || !item.type || !item.sha) return false;
        // skip ignored folders and noise files
        return !shouldSkip(item.path, item.type as "blob" | "tree");
      })
      .map((item) => ({
        path: dirPath ? `${dirPath}/${item.path}` : item.path!,
        type: item.type as "blob" | "tree",
        sha: item.sha!,
      }))
      .sort((a, b) => {
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
