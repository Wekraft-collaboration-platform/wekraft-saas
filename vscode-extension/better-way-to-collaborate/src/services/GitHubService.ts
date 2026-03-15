import * as vscode from 'vscode';
import * as https from 'https';

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  authorAvatar: string;
  date: string;
  url: string;
}

export interface GitHubContributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  open_issues_count: number;
  stargazers_count: number;
}

export interface GitHubPR {
  number: number;
  title: string;
  state: string;
  user: string;
  created_at: string;
  html_url: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: string;
  user: string;
  userAvatar: string;
  created_at: string;
  html_url: string;
  labels: { name: string; color: string }[];
  comments: number;
}

export interface RateLimit {
  used: number;
  limit: number;
  remaining: number;
  resetAt: string;
}

export class GitHubService {
  private _token: string | undefined;
  private _rateLimit: RateLimit | null = null;

  async getSession(): Promise<vscode.AuthenticationSession | undefined> {
    try {
      const session = await vscode.authentication.getSession(
        'github',
        ['repo', 'read:user', 'read:org'],
        { createIfNone: false }
      );
      this._token = session?.accessToken;
      return session;
    } catch {
      return undefined;
    }
  }

  async connect(): Promise<vscode.AuthenticationSession | undefined> {
    try {
      const session = await vscode.authentication.getSession(
        'github',
        ['repo', 'read:user', 'read:org'],
        { createIfNone: true }
      );
      this._token = session?.accessToken;
      return session;
    } catch (err) {
      vscode.window.showErrorMessage(`WeKraft: Failed to connect to GitHub — ${(err as Error).message}`);
      return undefined;
    }
  }

  async disconnect(): Promise<void> {
    this._token = undefined;
  }

  isConnected(): boolean {
    return !!this._token;
  }

  getRateLimit(): RateLimit | null {
    return this._rateLimit;
  }

  async getUser(): Promise<GitHubUser | null> {
    try {
      const data = await this._get<GitHubUser>('/user');
      return data;
    } catch {
      return null;
    }
  }

  async getRepo(owner: string, repo: string): Promise<GitHubRepo | null> {
    try {
      return await this._get<GitHubRepo>(`/repos/${owner}/${repo}`);
    } catch {
      return null;
    }
  }

  async getCommits(owner: string, repo: string, branch: string, perPage = 10): Promise<GitHubCommit[]> {
    try {
      interface RawCommit {
        sha: string;
        html_url: string;
        commit: { message: string; author: { date: string } };
        author: { login: string; avatar_url: string } | null;
      }
      const raw = await this._get<RawCommit[]>(`/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${perPage}`);
      return raw.map((c) => ({
        sha: c.sha.slice(0, 7),
        message: c.commit.message.split('\n')[0],
        author: c.author?.login ?? 'unknown',
        authorAvatar: c.author?.avatar_url ?? '',
        date: c.commit.author.date,
        url: c.html_url,
      }));
    } catch {
      return [];
    }
  }

  async getContributors(owner: string, repo: string, perPage = 6): Promise<GitHubContributor[]> {
    try {
      interface RawContributor {
        login: string;
        avatar_url: string;
        contributions: number;
        html_url: string;
      }
      const raw = await this._get<RawContributor[]>(`/repos/${owner}/${repo}/contributors?per_page=${perPage}`);
      return raw.map((c) => ({
        login: c.login,
        avatar_url: c.avatar_url,
        contributions: c.contributions,
        html_url: c.html_url,
      }));
    } catch {
      return [];
    }
  }

  async getOpenPRs(owner: string, repo: string): Promise<GitHubPR[]> {
    try {
      interface RawPR {
        number: number;
        title: string;
        state: string;
        user: { login: string };
        created_at: string;
        html_url: string;
      }
      const raw = await this._get<RawPR[]>(`/repos/${owner}/${repo}/pulls?state=open&per_page=5`);
      return raw.map((pr) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        user: pr.user.login,
        created_at: pr.created_at,
        html_url: pr.html_url,
      }));
    } catch {
      return [];
    }
  }

  async getIssues(owner: string, repo: string, perPage = 8): Promise<GitHubIssue[]> {
    try {
      interface RawIssue {
        number: number;
        title: string;
        state: string;
        user: { login: string; avatar_url: string };
        created_at: string;
        html_url: string;
        labels: { name: string; color: string }[];
        comments: number;
        pull_request?: unknown;
      }
      const raw = await this._get<RawIssue[]>(
        `/repos/${owner}/${repo}/issues?state=open&per_page=${perPage}&sort=created&direction=desc`
      );
      // GitHub issues API also returns PRs — filter them out
      return raw
        .filter((i) => !i.pull_request)
        .map((i) => ({
          number: i.number,
          title: i.title,
          state: i.state,
          user: i.user.login,
          userAvatar: i.user.avatar_url,
          created_at: i.created_at,
          html_url: i.html_url,
          labels: (i.labels ?? []).map((l) => ({ name: l.name, color: l.color })),
          comments: i.comments,
        }));
    } catch {
      return [];
    }
  }

  private _get<T>(path: string): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this._token) {
        reject(new Error('Not authenticated'));
        return;
      }
      const options: https.RequestOptions = {
        hostname: 'api.github.com',
        path,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'WeKraft-VSCode-Extension/0.1.0',
        },
      };
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        res.on('end', () => {
          try {
            // Capture GitHub rate-limit headers for display in the sidebar
            const limit = parseInt(res.headers['x-ratelimit-limit'] as string, 10);
            const remaining = parseInt(res.headers['x-ratelimit-remaining'] as string, 10);
            const reset = res.headers['x-ratelimit-reset'] as string;
            if (!isNaN(limit) && !isNaN(remaining)) {
              this._rateLimit = {
                limit,
                remaining,
                used: limit - remaining,
                resetAt: reset
                  ? new Date(parseInt(reset, 10) * 1000).toISOString()
                  : '',
              };
            }
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`GitHub API error ${res.statusCode}: ${body}`));
              return;
            }
            resolve(JSON.parse(body) as T);
          } catch (e) {
            reject(e);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }
}
