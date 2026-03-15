import * as vscode from 'vscode';
import type { GitHubService, GitHubUser, GitHubCommit, GitHubContributor, GitHubRepo, GitHubPR, GitHubIssue, RateLimit } from '../services/GitHubService';
import type { GitService } from '../services/GitService';

export interface WekraftState {
  isConnected: boolean;
  isLoading: boolean;
  // Workspace / git detection — drives the guide screens
  hasWorkspace: boolean;
  hasGitRepo: boolean;
  hasGitHubRemote: boolean;
  user: GitHubUser | null;
  repo: GitHubRepo | null;
  repoName: string;
  branch: string;
  commits: GitHubCommit[];
  contributors: GitHubContributor[];
  openPRs: GitHubPR[];
  issues: GitHubIssue[];
  deadline: string | null;
  projectName: string;
  errorMessage: string | null;
  rateLimit: RateLimit | null;
}

export class WekraftSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = 'wekraft.sidebar';

  private _view?: vscode.WebviewView;
  private _state: WekraftState = {
    isConnected: false,
    isLoading: false,
    hasWorkspace: false,
    hasGitRepo: false,
    hasGitHubRemote: false,
    user: null,
    repo: null,
    repoName: '',
    branch: '',
    commits: [],
    contributors: [],
    openPRs: [],
    issues: [],
    deadline: null,
    projectName: '',
    errorMessage: null,
    rateLimit: null,
  };

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _github: GitHubService,
    private readonly _git: GitService,
    private readonly _context: vscode.ExtensionContext
  ) {
    // Restore deadline from persisted storage
    this._state.deadline = this._context.globalState.get<string>('wekraft.deadline', '') || null;
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtml();

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async (msg: { type: string; date?: string }) => {
      switch (msg.type) {
        case 'connectGitHub':
          await this._connectGitHub();
          break;
        case 'disconnect':
          await this._disconnect();
          break;
        case 'refresh':
          await this._refreshData();
          break;
        case 'openFolder':
          await vscode.commands.executeCommand('vscode.openFolder');
          break;
        case 'setDeadline':
          // Allow msg.date to be empty string (clears deadline)
          if (msg.date !== undefined) {
            await this._saveDeadline(msg.date);
          }
          break;
        case 'ready':
          // Webview just mounted — push current state
          await this._tryAutoConnect();
          await this._pushState();
          break;
      }
    });
  }

  /** Called externally by extension.ts commands */
  public async connectGitHub(): Promise<void> {
    await this._connectGitHub();
  }

  public async disconnect(): Promise<void> {
    await this._disconnect();
  }

  public async refresh(): Promise<void> {
    await this._refreshData();
  }

  public async setDeadline(date: string): Promise<void> {
    await this._saveDeadline(date);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async _tryAutoConnect(): Promise<void> {
    const session = await this._github.getSession();
    if (session) {
      this._state.isConnected = true;
      this._state.user = await this._github.getUser();
      await this._loadRepoData();
    }
  }

  private async _connectGitHub(): Promise<void> {
    this._setState({ isLoading: true, errorMessage: null });
    await this._pushState();

    const session = await this._github.connect();
    if (!session) {
      this._setState({ isLoading: false, errorMessage: 'GitHub authentication was cancelled.' });
      await this._pushState();
      return;
    }

    this._setState({ isConnected: true, user: await this._github.getUser() });
    await this._loadRepoData();
  }

  private async _disconnect(): Promise<void> {
    await this._github.disconnect();
    this._state = {
      ...this._state,
      isConnected: false,
      user: null,
      repo: null,
      commits: [],
      contributors: [],
      openPRs: [],
      issues: [],
      repoName: '',
      branch: '',
      rateLimit: null,
      errorMessage: null,
    };
    await this._pushState();
  }

  private async _loadRepoData(): Promise<void> {
    this._setState({ isLoading: true });
    await this._pushState();

    try {
      // ── Step 1: detect workspace ──────────────────────────────────────────
      const hasWorkspace = !!(vscode.workspace.workspaceFolders?.length);
      this._setState({ hasWorkspace });

      if (!hasWorkspace) {
        this._setState({ isLoading: false, hasGitRepo: false, hasGitHubRemote: false });
        await this._pushState();
        return;
      }

      // ── Step 2: detect local git repo ─────────────────────────────────────
      const localInfo = await this._git.getLocalRepoInfo();
      const hasGitRepo = !!localInfo;
      this._setState({ hasGitRepo });

      if (!hasGitRepo) {
        this._setState({ isLoading: false, hasGitHubRemote: false, repoName: '', branch: '' });
        await this._pushState();
        return;
      }

      const branch = localInfo!.branch;
      const repoName = localInfo!.name;
      this._setState({ branch, repoName });

      // ── Step 3: detect GitHub remote ──────────────────────────────────────
      const hasGitHubRemote = !!localInfo!.ownerRepo;
      this._setState({ hasGitHubRemote });

      if (!hasGitHubRemote) {
        this._setState({ isLoading: false });
        await this._pushState();
        return;
      }

      // ── Step 4: fetch all GitHub data ─────────────────────────────────────
      const { owner, repo } = localInfo!.ownerRepo!;
      const [repoData, commits, contributors, openPRs, issues] = await Promise.all([
        this._github.getRepo(owner, repo),
        this._github.getCommits(owner, repo, branch),
        this._github.getContributors(owner, repo),
        this._github.getOpenPRs(owner, repo),
        this._github.getIssues(owner, repo),
      ]);

      const cfg = vscode.workspace.getConfiguration('wekraft');
      const projectName = cfg.get<string>('projectName') || repoData?.name || repoName;

      this._setState({
        repo: repoData,
        commits,
        contributors,
        openPRs,
        issues,
        projectName,
        rateLimit: this._github.getRateLimit(),
        isLoading: false,
        errorMessage: null,
      });
    } catch (err) {
      this._setState({
        isLoading: false,
        errorMessage: `Failed to load repository data: ${(err as Error).message}`,
      });
    }

    await this._pushState();
  }

  private async _refreshData(): Promise<void> {
    if (this._state.isConnected) {
      await this._loadRepoData();
    } else {
      await this._tryAutoConnect();
      await this._pushState();
    }
  }

  private async _saveDeadline(date: string): Promise<void> {
    this._state.deadline = date || null;
    await this._context.globalState.update('wekraft.deadline', date);
    // Also persist in workspace config for portability
    await vscode.workspace.getConfiguration('wekraft').update(
      'projectDeadline',
      date,
      vscode.ConfigurationTarget.Workspace
    );
    await this._pushState();
  }

  private _setState(partial: Partial<WekraftState>): void {
    this._state = { ...this._state, ...partial };
  }

  private async _pushState(): Promise<void> {
    if (this._view) {
      await this._view.webview.postMessage({ type: 'stateUpdate', state: this._state });
    }
  }

  // ─── Webview HTML ─────────────────────────────────────────────────────────

  private _getHtml(): string {
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src https: data:;"/>
<title>WeKraft</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#0a0a0a;--card:#111111;--border:rgba(255,255,255,0.08);
    --accent:#3b82f6;--accent-dim:rgba(59,130,246,0.15);
    --green:#22c55e;--yellow:#eab308;--red:#ef4444;
    --text:#f4f4f5;--muted:#71717a;--muted2:#52525b;
    --radius:10px;--font:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  }
  html,body{background:var(--bg);color:var(--text);font-family:var(--font);font-size:12px;overflow-x:hidden}
  #app{padding:12px;display:flex;flex-direction:column;gap:10px;min-height:100vh}

  /* header */
  .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;border-bottom:1px solid var(--border)}
  .logo{display:flex;align-items:center;gap:7px;font-size:14px;font-weight:700;letter-spacing:-.4px}
  .header-right{display:flex;align-items:center;gap:6px}
  .badge{font-size:9px;padding:2px 6px;border-radius:20px;background:var(--accent-dim);color:var(--accent);font-weight:600;border:1px solid rgba(59,130,246,.25)}
  .rate-pill{font-size:9px;padding:2px 6px;border-radius:20px;font-weight:500;border:1px solid;display:none}
  .rate-ok{background:rgba(34,197,94,.08);color:#4ade80;border-color:rgba(34,197,94,.2)}
  .rate-warn{background:rgba(234,179,8,.1);color:#facc15;border-color:rgba(234,179,8,.2)}
  .rate-crit{background:rgba(239,68,68,.1);color:#f87171;border-color:rgba(239,68,68,.25)}

  /* cards */
  .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:11px 13px;display:flex;flex-direction:column;gap:7px}
  .card-row{display:flex;align-items:center;justify-content:space-between}
  .card-title{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);display:flex;align-items:center;gap:5px}

  /* buttons */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:600;font-family:var(--font);transition:all .15s}
  .btn-primary{background:var(--accent);color:#fff}.btn-primary:hover{background:#2563eb}
  .btn-ghost{background:rgba(255,255,255,.06);color:var(--text);border:1px solid var(--border)}.btn-ghost:hover{background:rgba(255,255,255,.1)}
  .btn-danger{background:rgba(239,68,68,.12);color:#ef4444;border:1px solid rgba(239,68,68,.2)}.btn-danger:hover{background:rgba(239,68,68,.2)}
  .btn-sm{padding:5px 10px;font-size:11px}

  /* user row */
  .user-row{display:flex;align-items:center;gap:9px}
  .avatar{width:28px;height:28px;border-radius:50%;border:1.5px solid var(--border);object-fit:cover;background:var(--muted2)}
  .user-info{flex:1;min-width:0}
  .user-name{font-weight:600;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .user-handle{font-size:10.5px;color:var(--muted)}

  /* repo chips */
  .repo-name{font-size:14px;font-weight:700;letter-spacing:-.3px;word-break:break-all}
  .chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:2px}
  .chip{font-size:10px;padding:2px 7px;border-radius:20px;background:rgba(255,255,255,.06);border:1px solid var(--border);color:var(--muted);display:flex;align-items:center;gap:3px}
  .chip.branch{color:var(--accent);background:var(--accent-dim);border-color:rgba(59,130,246,.2)}
  .chip.issues{color:var(--yellow);background:rgba(234,179,8,.1);border-color:rgba(234,179,8,.2)}
  .chip.stars{color:#f59e0b;background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.2)}

  /* commits */
  .commit-list{display:flex;flex-direction:column;gap:6px}
  .commit-item{display:flex;align-items:flex-start;gap:8px;padding:7px 9px;border-radius:7px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)}
  .commit-avatar{width:20px;height:20px;border-radius:50%;flex-shrink:0;background:var(--muted2)}
  .commit-msg{font-size:11.5px;font-weight:500;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .commit-meta{font-size:10px;color:var(--muted);display:flex;gap:5px;align-items:center;margin-top:2px}
  .sha{font-family:monospace;font-size:10px;color:var(--accent);background:var(--accent-dim);padding:1px 5px;border-radius:4px}

  /* contributors */
  .contrib-list{display:flex;flex-direction:column;gap:6px}
  .contrib-item{display:flex;align-items:center;gap:8px}
  .contrib-avatar{width:22px;height:22px;border-radius:50%;background:var(--muted2)}
  .contrib-name{flex:1;font-size:11.5px;font-weight:500;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .contrib-count{font-size:10px;color:var(--muted)}
  .contrib-bar-wrap{flex:1;height:3px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden}
  .contrib-bar{height:100%;background:var(--accent);border-radius:2px}

  /* pull requests */
  .pr-list,.issue-list{display:flex;flex-direction:column;gap:5px}
  .pr-item,.issue-item{display:flex;align-items:flex-start;gap:7px;padding:7px 9px;border-radius:7px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05)}
  .pr-dot{width:7px;height:7px;border-radius:50%;background:var(--green);flex-shrink:0;margin-top:3px}
  .issue-dot{width:7px;height:7px;border-radius:50%;background:var(--yellow);flex-shrink:0;margin-top:3px}
  .pr-title,.issue-title{flex:1;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .pr-number,.issue-number{font-size:10px;color:var(--muted);flex-shrink:0}
  .issue-meta{font-size:10px;color:var(--muted);display:flex;gap:4px;align-items:center;margin-top:2px;flex-wrap:wrap}
  .issue-label{font-size:9px;padding:1px 5px;border-radius:3px;font-weight:600}
  .issue-comments{font-size:10px;color:var(--muted);display:flex;align-items:center;gap:2px}

  /* deadline */
  .deadline-display{font-size:13px;font-weight:700;letter-spacing:-.2px}
  .countdown{font-size:11px;color:var(--muted);margin-top:2px}
  .countdown.urgent{color:var(--red)}.countdown.warning{color:var(--yellow)}
  .deadline-input-row{display:flex;gap:6px;align-items:center;margin-top:4px}
  input[type=date]{background:rgba(255,255,255,.06);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:11.5px;padding:5px 8px;font-family:var(--font);outline:none;flex:1}
  input[type=date]:focus{border-color:var(--accent)}
  input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1) opacity(.4)}

  /* guide screen */
  .guide-wrap{display:flex;flex-direction:column;gap:14px;padding:20px 4px}
  .guide-title{font-size:13px;font-weight:700}
  .guide-sub{font-size:11.5px;color:var(--muted);line-height:1.6}
  .step-list{display:flex;flex-direction:column;gap:6px;margin-top:2px}
  .step-row{display:flex;gap:9px;align-items:flex-start}
  .step-num{width:18px;height:18px;border-radius:50%;background:var(--accent-dim);color:var(--accent);font-size:9px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
  .step-text{font-size:11.5px;color:var(--muted);line-height:1.6}
  .step-text code{font-size:10.5px;background:rgba(255,255,255,.07);padding:1px 5px;border-radius:4px;color:var(--text);font-family:monospace}
  .guide-example{font-size:10.5px;color:var(--muted2);background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:7px;padding:8px 10px;font-family:monospace;line-height:1.7}
  .guide-example span{color:var(--accent)}
  .guide-divider{height:1px;background:var(--border)}

  /* storage info */
  .storage-row{display:flex;align-items:flex-start;gap:7px;padding:8px 10px;border-radius:7px;background:rgba(59,130,246,.05);border:1px solid rgba(59,130,246,.12)}
  .storage-text{font-size:10.5px;color:#93c5fd;line-height:1.6}
  .storage-icon{flex-shrink:0;margin-top:1px;color:var(--accent)}

  /* connect screen */
  .connect-wrap{display:flex;flex-direction:column;align-items:center;gap:14px;padding:24px 12px;text-align:center}
  .connect-wrap p{color:var(--muted);line-height:1.6;font-size:11.5px}

  /* misc */
  .notice{padding:8px 10px;border-radius:7px;font-size:11px;border:1px solid;line-height:1.5}
  .notice.err{background:rgba(239,68,68,.07);border-color:rgba(239,68,68,.2);color:#fca5a5}
  .notice.info{background:rgba(59,130,246,.07);border-color:rgba(59,130,246,.2);color:#93c5fd}
  .spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.12);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .loading-row{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:11px}
  .empty{color:var(--muted);font-size:11px;text-align:center;padding:8px 0}
</style>
</head>
<body>
<div id="app">
  <div class="header">
    <div class="logo">
      <svg width="18" height="18" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="18" fill="#0a0a0a"/>
        <text x="50" y="68" font-family="system-ui,-apple-system,sans-serif" font-size="52" font-weight="800" fill="#ffffff" text-anchor="middle">W</text>
        <circle cx="72" cy="28" r="8" fill="#3b82f6"/>
      </svg>
      WeKraft
    </div>
    <div class="header-right">
      <span class="rate-pill" id="ratePill"></span>
      <span class="badge" id="statusBadge">●&nbsp;Offline</span>
    </div>
  </div>
  <div id="root"></div>
</div>

<script>
const vscode = acquireVsCodeApi();
let state = null;
vscode.postMessage({ type: 'ready' });

window.addEventListener('message', ({ data }) => {
  if (data.type === 'stateUpdate') { state = data.state; render(); }
});

// ── helpers ──────────────────────────────────────────────────────────────────
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function ts(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return Math.floor(diff/60) + 'm ago';
  if (diff < 86400) return Math.floor(diff/3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff/86400) + 'd ago';
  return new Date(iso).toLocaleDateString();
}
function deadlineCountdown(iso) {
  if (!iso) return { text: '', cls: '' };
  const diff = Math.floor((new Date(iso) - Date.now()) / 1000);
  if (diff < 0) return { text: 'Deadline passed', cls: 'urgent' };
  const d = Math.floor(diff / 86400), h = Math.floor((diff % 86400) / 3600);
  if (d === 0 && h === 0) return { text: 'Due today!', cls: 'urgent' };
  if (d <= 2) return { text: d + 'd ' + h + 'h remaining', cls: 'urgent' };
  if (d <= 7) return { text: d + 'd remaining', cls: 'warning' };
  return { text: d + 'd remaining', cls: '' };
}

// ── main render ───────────────────────────────────────────────────────────────
function render() {
  if (!state) return;
  const root = document.getElementById('root');

  // Status badge
  const badge = document.getElementById('statusBadge');
  if (state.isConnected) {
    badge.textContent = '● Connected';
    badge.style.cssText = 'color:#22c55e;background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.2)';
  } else {
    badge.textContent = '● Offline';
    badge.style.cssText = '';
  }

  // Rate limit pill
  updateRatePill(state.rateLimit);

  // ── Screens ──
  if (!state.isConnected) {
    root.innerHTML = renderConnect(); bindConnect(); return;
  }
  if (!state.isLoading && !state.hasWorkspace) {
    root.innerHTML = renderNoWorkspace(); bindOpenFolder('openFolderBtn'); return;
  }
  if (!state.isLoading && state.hasWorkspace && !state.hasGitRepo) {
    root.innerHTML = renderNoGitRepo(); bindOpenFolder('openFolderBtn2'); return;
  }
  if (!state.isLoading && state.hasGitRepo && !state.hasGitHubRemote) {
    root.innerHTML = renderNoRemote();
    document.getElementById('refreshBtn')?.addEventListener('click', () => vscode.postMessage({ type: 'refresh' }));
    return;
  }

  // ── Full dashboard ──
  let html = '';
  if (state.isLoading) {
    html += \`<div class="loading-row"><div class="spinner"></div> Loading GitHub data…</div>\`;
  }
  if (state.errorMessage) {
    html += \`<div class="notice err">\${esc(state.errorMessage)}</div>\`;
  }

  // user card
  if (state.user) {
    html += \`<div class="card"><div class="card-row">
      <div class="user-row">
        <img class="avatar" src="\${esc(state.user.avatar_url)}" alt=""/>
        <div class="user-info">
          <div class="user-name">\${esc(state.user.name || state.user.login)}</div>
          <div class="user-handle">@\${esc(state.user.login)}</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-sm" id="disconnectBtn">Disconnect</button>
    </div></div>\`;
  }

  // repo card
  if (state.repoName || state.repo) {
    const name = state.projectName || state.repo?.name || state.repoName;
    html += \`<div class="card">
      <div class="card-title"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8Z"/></svg>Repository</div>
      <div class="repo-name">\${esc(name)}</div>
      <div class="chips">
        <span class="chip branch"><svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M9.5 3.25a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.492 2.492 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Z"/></svg>\${esc(state.branch)}</span>
        \${state.repo?.open_issues_count != null ? \`<span class="chip issues">⚠ \${state.repo.open_issues_count} issues</span>\` : ''}
        \${state.repo?.stargazers_count != null ? \`<span class="chip stars">★ \${state.repo.stargazers_count}</span>\` : ''}
      </div>
    </div>\`;
  }

  // deadline card
  html += renderDeadlineCard();

  // commits
  if (state.commits?.length) {
    html += \`<div class="card"><div class="card-title"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/></svg>Recent Commits</div><div class="commit-list">\`;
    for (const c of state.commits.slice(0, 6)) {
      html += \`<div class="commit-item">
        \${c.authorAvatar ? \`<img class="commit-avatar" src="\${esc(c.authorAvatar)}" alt=""/>\` : \`<div class="commit-avatar"></div>\`}
        <div style="flex:1;min-width:0">
          <div class="commit-msg" title="\${esc(c.message)}">\${esc(c.message)}</div>
          <div class="commit-meta"><span class="sha">\${esc(c.sha)}</span><span>@\${esc(c.author)}</span><span>\${ts(c.date)}</span></div>
        </div>
      </div>\`;
    }
    html += \`</div></div>\`;
  }

  // open PRs
  if (state.openPRs?.length) {
    html += \`<div class="card"><div class="card-title"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z"/></svg>Open Pull Requests</div><div class="pr-list">\`;
    for (const pr of state.openPRs) {
      html += \`<div class="pr-item"><div class="pr-dot"></div><div class="pr-title" title="\${esc(pr.title)}">\${esc(pr.title)}</div><div class="pr-number">#\${pr.number}</div></div>\`;
    }
    html += \`</div></div>\`;
  }

  // issues
  if (state.issues?.length) {
    html += \`<div class="card"><div class="card-title"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"/></svg>Open Issues</div><div class="issue-list">\`;
    for (const issue of state.issues.slice(0, 6)) {
      const labelHtml = issue.labels.slice(0,3).map(l => \`<span class="issue-label" style="background:#\${esc(l.color)}22;color:#\${esc(l.color)};border:1px solid #\${esc(l.color)}44">\${esc(l.name)}</span>\`).join('');
      html += \`<div class="issue-item">
        <div class="issue-dot"></div>
        <div style="flex:1;min-width:0">
          <div class="issue-title" title="\${esc(issue.title)}">\${esc(issue.title)}</div>
          <div class="issue-meta">\${labelHtml}<span>\${ts(issue.created_at)}</span>\${issue.comments>0 ? \`<span>💬 \${issue.comments}</span>\` : ''}</div>
        </div>
        <div class="issue-number">#\${issue.number}</div>
      </div>\`;
    }
    html += \`</div></div>\`;
  }

  // contributors
  if (state.contributors?.length) {
    const max = Math.max(...state.contributors.map(c => c.contributions), 1);
    html += \`<div class="card"><div class="card-title"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/></svg>Contributors</div><div class="contrib-list">\`;
    for (const c of state.contributors) {
      const pct = Math.round((c.contributions / max) * 100);
      html += \`<div class="contrib-item"><img class="contrib-avatar" src="\${esc(c.avatar_url)}" alt=""/><div class="contrib-name">\${esc(c.login)}</div><div class="contrib-bar-wrap"><div class="contrib-bar" style="width:\${pct}%"></div></div><div class="contrib-count">\${c.contributions}</div></div>\`;
    }
    html += \`</div></div>\`;
  }

  // storage security info
  html += \`<div class="storage-row">
    <svg class="storage-icon" width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2Zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/></svg>
    <div class="storage-text">Your GitHub token is stored securely in VS Code's system keychain (Windows Credential Manager / macOS Keychain). Deadline &amp; project name are saved in workspace settings.</div>
  </div>\`;

  root.innerHTML = html;
  bindDashboard();
}

// ── Guide screens ─────────────────────────────────────────────────────────────
function renderNoWorkspace() {
  return \`<div class="guide-wrap">
    <div>
      <div class="guide-title">📁 Open Your Project Folder</div>
      <div class="guide-sub" style="margin-top:6px">WeKraft needs a workspace folder to detect your git repository and connect it to GitHub.</div>
    </div>
    <div class="step-list">
      <div class="step-row"><div class="step-num">1</div><div class="step-text">Click <strong>Open Folder</strong> below (or use <code>File → Open Folder</code>)</div></div>
      <div class="step-row"><div class="step-num">2</div><div class="step-text">Navigate to your project — the folder that contains <code>.git/</code></div></div>
      <div class="step-row"><div class="step-num">3</div><div class="step-text">Click <strong>Select Folder</strong> and WeKraft will auto-detect the repo</div></div>
    </div>
    <div class="guide-example">
      ✅ <span>C:\\\\projects\\\\my-app\\\\</span>  (has .git inside)<br/>
      ❌ C:\\\\projects\\\\  (parent folder — WeKraft can't see deeper)
    </div>
    <button class="btn btn-primary" id="openFolderBtn">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"/></svg>
      Open Folder
    </button>
  </div>\`;
}

function renderNoGitRepo() {
  return \`<div class="guide-wrap">
    <div>
      <div class="guide-title">🔗 No Git Repository Found</div>
      <div class="guide-sub" style="margin-top:6px">The open folder does not contain a <code>.git</code> directory. WeKraft tracks repos that are already initialized with git.</div>
    </div>
    <div class="step-list">
      <div class="step-row"><div class="step-num">1</div><div class="step-text">Make sure you opened the <strong>correct inner folder</strong> (the one with <code>.git/</code>), not a parent</div></div>
      <div class="step-row"><div class="step-num">2</div><div class="step-text">Or initialize git in this folder: <code>git init</code></div></div>
      <div class="step-row"><div class="step-num">3</div><div class="step-text">Then add a GitHub remote: <code>git remote add origin https://github.com/you/repo.git</code></div></div>
    </div>
    <button class="btn btn-ghost btn-sm" id="openFolderBtn2">
      Try a Different Folder
    </button>
  </div>\`;
}

function renderNoRemote() {
  return \`<div class="guide-wrap">
    <div>
      <div class="guide-title">🐙 No GitHub Remote Found</div>
      <div class="guide-sub" style="margin-top:6px">A git repo was found at <strong>\${esc(state.repoName)}</strong> (branch: <code>\${esc(state.branch)}</code>), but there's no GitHub remote origin configured.</div>
    </div>
    <div class="step-list">
      <div class="step-row"><div class="step-num">1</div><div class="step-text">Create a repo on GitHub if you haven't already</div></div>
      <div class="step-row"><div class="step-num">2</div><div class="step-text">Run in your terminal:<br/><code>git remote add origin https://github.com/owner/repo.git</code></div></div>
      <div class="step-row"><div class="step-num">3</div><div class="step-text">Click Refresh below — WeKraft will re-scan the remote</div></div>
    </div>
    <button class="btn btn-ghost btn-sm" id="refreshBtn">
      <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1.705 8.005a.75.75 0 0 1 .834.656 5.5 5.5 0 0 0 9.592 2.97l-1.204-1.204a.25.25 0 0 1 .177-.427h3.646a.25.25 0 0 1 .25.25v3.646a.25.25 0 0 1-.427.177l-1.38-1.38A7.002 7.002 0 0 1 1.05 8.84a.75.75 0 0 1 .656-.834ZM8 2.5a5.487 5.487 0 0 0-4.131 1.869l1.204 1.204A.25.25 0 0 1 4.896 6H1.25A.25.25 0 0 1 1 5.75V2.104a.25.25 0 0 1 .427-.177l1.38 1.38A7.002 7.002 0 0 1 14.95 7.16a.75.75 0 0 1-1.49.178A5.5 5.5 0 0 0 8 2.5Z"/></svg>
      Refresh
    </button>
  </div>\`;
}

function renderConnect() {
  return \`<div class="connect-wrap">
    <svg width="42" height="42" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="18" fill="#111"/>
      <text x="50" y="68" font-family="system-ui,-apple-system,sans-serif" font-size="52" font-weight="800" fill="#ffffff" text-anchor="middle">W</text>
      <circle cx="72" cy="28" r="8" fill="#3b82f6"/>
    </svg>
    <div>
      <div style="font-size:15px;font-weight:700;margin-bottom:5px">Welcome to WeKraft</div>
      <p>Connect your GitHub account to start tracking contributions, commits, issues, and deadlines — the better way to collaborate.</p>
    </div>
    \${state?.errorMessage ? \`<div class="notice err">\${esc(state.errorMessage)}</div>\` : ''}
    <button class="btn btn-primary" id="connectBtn">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
      Connect GitHub
    </button>
    <div style="font-size:10.5px;color:var(--muted)">Uses VS Code's built-in GitHub auth — your token is stored in the system keychain, never in plain text.</div>
  </div>\`;
}

function renderDeadlineCard() {
  const dl = state?.deadline;
  const cd = deadlineCountdown(dl);
  const fmt = dl ? new Date(dl).toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' }) : '';
  return \`<div class="card">
    <div class="card-title"><svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5 .5a.5.5 0 0 1 1 0V2h6V.5a.5.5 0 0 1 1 0V2h.5A2.5 2.5 0 0 1 16 4.5v9A2.5 2.5 0 0 1 13.5 16h-11A2.5 2.5 0 0 1 0 13.5v-9A2.5 2.5 0 0 1 2.5 2H3V.5ZM1.5 6v7.5A1 1 0 0 0 2.5 14.5h11a1 1 0 0 0 1-1V6Z"/></svg>Project Deadline</div>
    \${dl ? \`<div class="deadline-display">\${esc(fmt)}</div><div class="countdown \${cd.cls}">\${esc(cd.text)}</div>\` : \`<div class="empty">No deadline set</div>\`}
    <div class="deadline-input-row">
      <input type="date" id="deadlineInput" value="\${esc(dl ? dl.slice(0,10) : '')}" min="\${new Date().toISOString().slice(0,10)}"/>
      <button class="btn btn-ghost btn-sm" id="saveDeadlineBtn">Save</button>
      \${dl ? \`<button class="btn btn-danger btn-sm" id="clearDeadlineBtn">Clear</button>\` : ''}
    </div>
  </div>\`;
}

// ── Rate limit pill ───────────────────────────────────────────────────────────
function updateRatePill(rl) {
  const pill = document.getElementById('ratePill');
  if (!rl) { pill.style.display = 'none'; return; }
  const pct = (rl.remaining / rl.limit) * 100;
  pill.style.display = 'inline-flex';
  pill.textContent = \`API \${rl.remaining}/\${rl.limit}\`;
  pill.className = 'rate-pill ' + (pct < 10 ? 'rate-crit' : pct < 30 ? 'rate-warn' : 'rate-ok');
  const resetTime = rl.resetAt ? new Date(rl.resetAt).toLocaleTimeString() : '';
  pill.title = \`GitHub API rate limit. Resets at \${resetTime}\`;
}

// ── Bindings ──────────────────────────────────────────────────────────────────
function bindConnect() {
  document.getElementById('connectBtn')?.addEventListener('click', () => vscode.postMessage({ type: 'connectGitHub' }));
}
function bindOpenFolder(id) {
  document.getElementById(id)?.addEventListener('click', () => vscode.postMessage({ type: 'openFolder' }));
}
function bindDashboard() {
  document.getElementById('disconnectBtn')?.addEventListener('click', () => vscode.postMessage({ type: 'disconnect' }));
  document.getElementById('saveDeadlineBtn')?.addEventListener('click', () => {
    const val = document.getElementById('deadlineInput')?.value ?? '';
    vscode.postMessage({ type: 'setDeadline', date: val });
  });
  document.getElementById('clearDeadlineBtn')?.addEventListener('click', () => {
    vscode.postMessage({ type: 'setDeadline', date: '' });
  });
}
</script>
</body>
</html>`;
  }
}
