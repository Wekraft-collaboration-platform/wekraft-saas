# Git Repositories

Connecting a Git repository is the single most powerful action you can take in Wekraft. It bridges the gap between project planning and the actual codebase, bringing live development telemetry directly into your project workspace.

> [!IMPORTANT]
> To link a repository, you must first connect your GitHub account in your [User Profile](/web/docs/profile). Once authenticated, you can link any public or private repository to your Wekraft projects.

---

## Why Connect Your Repository?

When planning agile sprints and software tasks, project managers often lose visibility into what developers are writing. Conversely, developers spend unnecessary time manual-updating task boards. Connecting your codebase solves this by:

- **Eliminating Double Work**: Developers focus on their IDE and commit messages, while Wekraft auto-synchronizes their progress.
- **Unified Agile Telemetry**: Merges Git commit frequency, pull request reviews, and agile sprint tracking into a single command center.
- **Actionable Team Insights**: Detects bottleneck risks, workload imbalances, and contribution heatmaps automatically.

---

## What Are the Key Uses?

| Use Case                    | Core Benefit                                          | How It Works                                                                                       |
| :-------------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------------- |
| **Project Health Tracking** | Instantly gauge the momentum of your codebase.        | Tracks open issues, commit velocity over a 60-day window, total pull requests, and PR merge rates. |
| **Agile Sprints Alignment** | Know exactly which commits belong to which sprint.    | Links commits and active code branches to time-boxed sprints to monitor dev delivery.              |
| **Developer Productivity**  | Visually audit contribution patterns across the team. | Collects daily code commit sizes, priority workloads, and language breakdowns.                     |

---

## Features Enabled After Connecting

Once a repository is linked to a Wekraft project, a suite of advanced developer tools is unlocked across the workspace:

### 1. Codebase Links (IDE Deep Linking)

You can link any task in Wekraft to a specific code file path (e.g., `src/components/Navbar.tsx`) in your connected repository.

- **Open in VS Code**: Clicking the codebase link within the task sheet immediately opens that exact file at the specific line in your local editor (powered by the **VS Code Extension**).
- **Direct GitHub Navigation**: Click to jump directly to the online repository's file explorer.

### 2. Repo Health Dashboard

Under the **Project Workspace Dashboard**, a dedicated **Repo Health** widget will render live metrics:

- **Commits (60d)**: Tracks the volume of commits over the rolling last two months.
- **PR Merge Rate**: Calculates the percentage of pull requests merged versus closed, helping assess code review efficiency.
- **Open & Closed Issues**: Summarizes outstanding bugs versus those resolved.

### 3. Repository Heatmaps & Burnout Risk

Uses live Git contribution volume to build AI-powered workload heatmaps:

- **Weekly Engagement Grid**: A rolling 12-day heatmap displaying which days of the week team members are contributing most heavily.
- **Burnout Prevention**: Automatically detects if a team member is committing code continuously over weekends or late nights, alerting project leads.

### 4. Language Distribution Analysis

Wekraft scans the repository metadata to analyze and render a beautiful horizontal language distribution bar:

- **Visualizes Language Mix**: Displays precise percentage bars of languages used (e.g., `TypeScript 68%`, `CSS 18%`, `HTML 14%`).
- **Hover Highlights**: Shows absolute byte counts on hover to inspect codebase density.

### 5. Automated GitHub Issue Importing

Syncs your repository's issues database directly into Wekraft:

- **Import in One Click**: Pulls in existing open GitHub issues, including their descriptions, labels, and assignment status, into your Wekraft backlog.
- **State Synchronization**: Automatically marks issues as resolved in Wekraft when they are closed on GitHub.

---

## Dashboard Interface Features

In addition to advanced workspace metrics, the Wekraft **Repositories Manager** page provides tools to search, organize, and inspect your repository connections:

### 1. Linked Repository Popover

Click the **View Connected Repo** button to open a detailed status popover showcasing all active connections:

- **Project Name**: Displays the title of the linked Wekraft project.
- **Repository Name**: Displays the exact GitHub path (e.g. `owner/repo-name`).
- **Workspace Navigation**: Includes a quick icon shortcut to jump straight to the project's workspace dashboard.

### 2. Search & Filter

- **Repository Filter**: Features an interactive search bar to instantly filter your connected and unlinked repository lists by name, owner, or connection status.

### 3. Grid Repository List (Show Repo Component)

- **Visual Grid Layout**: Displays a comprehensive card grid of all repositories loaded from your authenticated GitHub account.
- **Connection Status Badges**: Displays a green **Active Connection** status badge on synced repositories for easy tracking.
- **Dynamic Linking Dropdown**: Lists all unlinked project spaces in a dropdown, letting you connect and sync workspaces instantly on the fly.

---

## Integration Flow

Follow this straightforward flow to connect your repository:

- **Step 1:** Connect GitHub Account *(via User Profile Settings)*
- **Step 2:** Open Repositories Manager *(via Global App Sidebar)*
- **Step 3:** Browse Active GitHub Repositories
- **Step 4:** Select Unlinked Repo & Choose Project
- **Step 5:** Confirm Linkage
- **Step 6:** Enjoy Automated Metrics & Code Links!

### Setup Steps:

1. **GitHub Connection**: Navigate to your [User Profile](/web/docs/profile) and link your GitHub account.
2. **Repositories Page**: Click **Repositories** in the main Wekraft sidebar.
3. **Select and Sync**: Browse the list of repos loaded from your GitHub account, click **Connect** next to any unlinked repo, select the target Wekraft project, and confirm.
