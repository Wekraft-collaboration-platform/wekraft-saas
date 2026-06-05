# React Flow Codebase Map

The **Heatmaps** page (accessed via the `Heatmap` workspace sidebar tab) renders an interactive, codebase-aware **React Flow Map** of your linked GitHub repository. This view visualizes files, directory hierarchies, commits, and active bug reports in a unified graphical node tree.

---

## The Interactive Node Graph (`HeatmapFlow.tsx`)

The main viewport displays your directory hierarchy as an expandable node tree where folders are connected by branch lines:

- **Collapse & Expand**: Clicking a folder node expands its child folders on the canvas, dynamically updating the React Flow layout.
- **Node Data Popover (Code Ownership)**: Clicking the arrow on any folder node opens a popover detailing:
  - **Assigned Tasks**: List of active tasks linked to that folder and the assigned team members.
  - **Completed Tasks**: Historically resolved tasks linked to that folder.
  - **Files & Subfolders**: Counts of files and directories within.

### Directory Heatmap Highlights
Folders on the graph are color-coded based on live development activity and outstanding bug reports (Premium features):

| Node Color | Meaning | Description |
| :--- | :--- | :--- |
| **Red Node** | `Active Issues` | The folder or its sub-directories contain open Wekraft issues / bug tickets. |
| **Yellow Node** | `Recent Modifications` | Code files inside this folder have been changed or committed within the last 7 days. |
| **Blue/Gray Node**| `Stable Node` | No active bugs or recent modifications. |

---

## Heatmap Control Panel (`HeatmapPanel.tsx`)

The collapsible left panel coordinates your repository connections and lists outstanding git metadata:

### 1. Repository Connection Link
- Renders the linked GitHub repository path (e.g. `owner/repo-name`). Clicking the card opens your repository directly on GitHub in a new tab.

### 2. Issues Directory
- Lists all active, non-closed project issues linked to codebase files (`fileLinked`).
- Displays assignee avatars and filenames.

### 3. Project Structure Tree
- Renders a collapsible file tree of the repository.
- **Direct Code Link**: Clicking on any file inside the tree opens that exact file's blob page on GitHub in a new tab.

### 4. Latest Commits
- Lists the most recent repository commits fetched from the GitHub API.

---

## Plan Limits & Free Tier Restrictions

The codebase mapping capabilities are restricted by account tier:

- **Free Tier**:
  - Browse basic repository structure.
  - Node color highlights (Red/Yellow alert highlights for bugs and modifications) are **disabled**.
  - Displays a premium upgrade dialog prompting you to upgrade to Plus/Pro.
- **Plus & Pro Tiers**:
  - Full codebase map access with active color alerts and git activity overlays.
  - Progressive tree rendering and structure caching enabled.

---

## Next Steps

- Link files to tasks in [Tasks & Backlog](/web/docs/tasks).
- Sync repository integrations in [Git Repositories](/web/docs/repositories).
- Connect editor-level workflows in [VS Code Extension](/web/docs/extension).
