# VS Code Extension

The **Wekraft VS Code Extension** is the center of our developer-first planning workflow. It brings your tasks and issue boards directly into your code editor, allowing developers to execute sprints without shifting focus to a browser.

---

## Capabilities & Plan Support

The extension is available to all users, but write access is governed by your subscription plan:

- **Free / Plus Plans (Read-Only Mode)**:
  - Browse your assigned tasks, descriptions, and estimation windows directly from the VS Code Activity Bar.
  - Navigate to codebase links.
  - Status updates and task movements must be done on the Wekraft web dashboard.
- **Pro Plan (Full Two-Way Sync)**:
  - Update task status (e.g. from `Not Started` to `In Progress` or `Completed`) directly from your editor.
  - Syncs code focus timelines automatically based on active workspace directories.

---

## Handshake Authentication Flow

Wekraft authenticates VS Code securely without exposing sensitive password tokens:

1. **Initiate Handshake**: Click the **Wekraft icon** in the VS Code Activity Bar and select **"Login with Wekraft"**.
2. **Browser Authentication**: This launches your default browser, prompting you to log in to Wekraft.
3. **Grant Access**: Click **"Grant Access to IDE"**. The page will securely pass a temp token back to VS Code via deep-linking protocols.
4. **Active Project Selection**: Select your target project from the dropdown inside the VS Code sidebar. Your backlog tasks populate immediately.

> [!WARNING]
> **Token Expiry**: The browser authentication handshake token expires after exactly **5 minutes** for security. If authentication fails, restart the login process from VS Code.

---

## IDE Workspace Integration Features

- **Codebase Links**: Tasks in Wekraft can specify a file path relative to your repository root (e.g., `src/App.tsx`). If configured, the extension allows you to open that exact file in your active workspace with one click.
- **Backlog Scope**: Sprints and tasks cannot be created inside the IDE extension. This maintains a clean boundary: planning is handled on the web dashboard, while execution happens inside your code editor.

---

## Next Steps

- Learn about task properties in [Tasks & Backlog](/web/docs/tasks).
- View how code branches sync in [Git Repositories](/web/docs/repositories).
- Learn about the [Project Delivery Timeline & Gantt Chart](/web/docs/time-logs).
