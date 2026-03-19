import * as vscode from 'vscode';
import { GitHubService } from './services/GitHubService';
import { GitService } from './services/GitService';
import { WekraftSidebarProvider } from './providers/WekraftSidebarProvider';

export function activate(context: vscode.ExtensionContext): void {
  console.log('WeKraft extension activated');

  const github = new GitHubService();
  const git = new GitService();
  const provider = new WekraftSidebarProvider(context.extensionUri, github, git, context);

  // Register the sidebar webview
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(WekraftSidebarProvider.viewId, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('wekraft.connectGitHub', () => provider.connectGitHub()),
    vscode.commands.registerCommand('wekraft.disconnect', () => provider.disconnect()),
    vscode.commands.registerCommand('wekraft.refresh', () => provider.refresh()),
    vscode.commands.registerCommand('wekraft.setDeadline', async () => {
      const input = await vscode.window.showInputBox({
        title: 'WeKraft — Set Project Deadline',
        prompt: 'Enter the deadline date (YYYY-MM-DD)',
        placeHolder: '2026-12-31',
        validateInput: (v) => {
          if (!v) { return undefined; }
          if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { return 'Please use YYYY-MM-DD format'; }
          if (isNaN(Date.parse(v))) { return 'Invalid date'; }
          return undefined;
        },
      });
      if (input !== undefined) {
        await provider.setDeadline(input.trim());
      }
    })
  );

  // Auto-refresh when the active workspace changes (user opens a different folder)
  context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => provider.refresh())
  );
}

export function deactivate(): void {}
