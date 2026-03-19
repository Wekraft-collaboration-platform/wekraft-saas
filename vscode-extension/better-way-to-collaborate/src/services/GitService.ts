import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export interface LocalRepoInfo {
  /** e.g. "my-project" */
  name: string;
  /** full local path */
  rootPath: string;
  /** current branch name */
  branch: string;
  /** "owner/repo" parsed from remote origin URL, or null */
  ownerRepo: { owner: string; repo: string } | null;
}

/**
 * Reads local git information without depending on the git extension API,
 * so it works even when the git extension is slow to activate.
 */
export class GitService {
  async getLocalRepoInfo(): Promise<LocalRepoInfo | null> {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders?.length) {
      return null;
    }

    // Try each workspace folder until we find a git root
    for (const folder of folders) {
      const info = await this._readGitDir(folder.uri.fsPath);
      if (info) {
        return info;
      }
    }
    return null;
  }

  private async _readGitDir(rootPath: string): Promise<LocalRepoInfo | null> {
    const gitDir = path.join(rootPath, '.git');
    if (!fs.existsSync(gitDir)) {
      return null;
    }

    const name = path.basename(rootPath);
    const branch = this._readBranch(gitDir);
    const ownerRepo = this._readRemoteOrigin(gitDir);

    return { name, rootPath, branch, ownerRepo };
  }

  private _readBranch(gitDir: string): string {
    try {
      const headPath = path.join(gitDir, 'HEAD');
      const head = fs.readFileSync(headPath, 'utf-8').trim();
      // e.g. "ref: refs/heads/main"
      const match = head.match(/^ref: refs\/heads\/(.+)$/);
      return match ? match[1] : head.slice(0, 7);
    } catch {
      return 'unknown';
    }
  }

  private _readRemoteOrigin(gitDir: string): { owner: string; repo: string } | null {
    try {
      const configPath = path.join(gitDir, 'config');
      const config = fs.readFileSync(configPath, 'utf-8');

      // Find [remote "origin"] section and extract url
      const originSection = config.match(/\[remote "origin"\][\s\S]*?url\s*=\s*([^\n]+)/);
      if (!originSection) {
        return null;
      }
      const url = originSection[1].trim();
      return this._parseGitHubUrl(url);
    } catch {
      return null;
    }
  }

  private _parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    // SSH: git@github.com:owner/repo.git
    const sshMatch = url.match(/git@github\.com:([^/]+)\/([^/.]+)(\.git)?$/);
    if (sshMatch) {
      return { owner: sshMatch[1], repo: sshMatch[2] };
    }
    // HTTPS: https://github.com/owner/repo[.git]
    const httpsMatch = url.match(/https?:\/\/github\.com\/([^/]+)\/([^/.]+)(\.git)?$/);
    if (httpsMatch) {
      return { owner: httpsMatch[1], repo: httpsMatch[2] };
    }
    return null;
  }
}
