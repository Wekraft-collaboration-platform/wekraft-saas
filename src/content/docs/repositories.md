# Git Repositories

Connecting your Git repository is the core integration that unlocks codebase-aware project management in Wekraft. Once linked, tasks and issues can be mapped to codebase paths, and repository details are fed directly to your workspace.

---

## Repositories Manager Dashboard

The **Manage Repositories** page (`/dashboard/repositories`) is accessed via the global sidebar and provides the interface for binding GitHub codebases to Wekraft projects:

### 1. Interactive Search
- Filter your entire list of personal and organization repositories loaded from your connected GitHub account.

### 2. Connected Repositories Popover (`View Connected Repo`)
Click this button to see a list of currently connected codebases:
- **Active Connections**: View a list of linked repositories showing which Wekraft project name each repo is currently linked to.
- **Quick Workspace Teleport**: Click the dashboard shortcut button next to any active connection to jump straight to that project's home screen.

### 3. Repository Connections Grid (`ShowRepo.tsx`)
- Displays all loaded repositories in a clean card layout.
- Synced repositories display a green **Active Connection** badge.
- Unlinked repositories display a project selection dropdown. You can choose any of your **Unlinked Wekraft Projects** and connect them instantly.

### 4. Setup Completion (`LinkedRepoDialog.tsx`)
- Linking a repository triggers a completion dialog confirming the handshake is successful.
- Closing the dialog automatically routes you back to your main Dashboard.

---

## Technical Integration & GitHub OAuth Sync

Wekraft relies on Clerk OAuth tokens to communicate securely with GitHub's APIs:

1. **Authentication**: Users sign up or authenticate with their GitHub account. If signed up via email, they connect GitHub from their user profile settings.
2. **Repository Listing**: The platform dynamically queries GitHub's REST API to retrieve repository namespaces (`owner/repo-name`).
3. **Caching**: Git structure maps are securely cached inside Convex to avoid hitting API rate limits. Project owners can trigger manual refreshes using the **CloudSync** button inside the Heatmap view.

---

## Next Steps

- Navigate the folder tree visually in [Repository Heatmaps](/web/docs/heatmaps).
- Synchronize your local files with the [VS Code Extension](/web/docs/extension).
- Manage task details in [Tasks & Backlog](/web/docs/tasks).
