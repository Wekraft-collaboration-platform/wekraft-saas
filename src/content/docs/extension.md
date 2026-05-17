# VS Code Extension

The **Wekraft VS Code Extension** is the centrepiece of the developer experience. It brings your project management workflow directly into your editor, so you can view tasks, log time, and update statuses without leaving the code.

## Installation

Getting the extension set up takes under two minutes.

### Step 1 — Install from the Marketplace

Open VS Code and go to the Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`). Search for **"Wekraft"** and click **Install**.

Alternatively, install from the command line:

```bash
code --install-extension wekraft.wekraft-vscode
```

### Step 2 — Authenticate

After installation, a **Wekraft icon** will appear in your Activity Bar (left sidebar). Click it to open the Wekraft panel.

Click the **"Login with Wekraft"** button. Your browser will open to:

```
http://localhost:3000/extension?callback_url=vscode://wekraft.wekraft-vscode/auth
```

Sign in if prompted, then click **"Grant Access to IDE"**. The web app generates a short-lived **handshake token** (5-minute TTL) and immediately redirects your browser to:

```
vscode://wekraft.wekraft-vscode/auth?token=<hex>
```

VS Code intercepts this URI, calls `exchangeHandshakeToken({ token })` on the Convex backend, and receives back `{ userId, apiKey }`. The token is **deleted immediately** after exchange — it is single-use. The permanent API key is then stored in VS Code's encrypted secret storage.

### Step 3 — Open a Project

Once authenticated, the extension loads your Wekraft projects. Select a project from the dropdown to activate it. Your assigned tasks will appear in the sidebar tree.

---

## Features

### Task Management

The extension sidebar shows all tasks and issues across your projects, organized by project and status. Click any item to expand its details: priority, due date, description, and assignees.

**What you can do from the IDE:**

| Action | Tasks | Issues |
|---|---|---|
| View details | ✓ | ✓ |
| Update status | ✓ | ✓ |
| Update priority | ✓ | ✓ |
| Update assignees | ✓ | ✓ |
| Delete | ✓ | ✓ |
| **Create new** | ✗ | ✗ |

> Creating new tasks or issues is intentionally not supported from the IDE. Use the web app for that. This keeps the extension focused on execution, not planning.

### Automatic Time Tracking

When you set a task to **In Progress**, the extension begins a silent timer. When you mark it **Reviewing** or **Completed**, the elapsed time is logged automatically to the task's Time Logs.

> **Pro plan required** for full two-way sync including time tracking. Free/Plus users can view tasks but cannot update status from the IDE.

### Deep Links

From the Wekraft web app, every task has a **"Open in VS Code"** button. Clicking it sends a `vscode://` URI that opens the extension and navigates directly to that task — even if VS Code wasn't open.

### Codebase Linking

When creating or editing a task in the web app, you can set a **Codebase Link** — a file path or folder relative to the repo root. In VS Code, the extension surfaces this as a clickable link that opens the relevant file directly.

---

## Authentication Architecture

Wekraft uses a secure **one-time handshake token system** for IDE authentication — no manual API key pasting required.

```
Extension                    Web App (/extension)         Convex DB
   |                              |                           |
   |-- Open browser with ------→  |                           |
   |   ?callback_url=vscode://... |                           |
   |                              |← User clicks              |
   |                              |   "Grant Access to IDE"   |
   |                              |-- createHandshakeToken() → |
   |                              |                           |← 5-min token stored
   |                              |-- redirect to             |
   |   vscode://...?token=<hex> ← |   vscode:// URI           |
   |                              |                           |
   |-- exchangeHandshakeToken() → |                → Convex   |
   |   ← { userId, apiKey }       |                           |
   |                              |                ← Token deleted immediately
   |-- Store apiKey in            |                           |
   |   VS Code secret storage     |                           |
```

The token is **single-use and expires in 5 minutes**. The permanent API key lives only in VS Code's encrypted secret storage — never in `settings.json` or any plain-text file.

---

## Troubleshooting

### "Not authenticated" after login

This usually means the handshake token expired before you completed authorization in the browser (5-minute limit). Click **Login** again to generate a fresh token.

### Tasks not loading

1. Make sure you have at least one project in Wekraft with tasks assigned to your account.
2. Check your internet connection — the extension communicates with Convex in real time.
3. Click the **Refresh** button (↻) at the top of the extension panel.

### Status updates not syncing

If you are on the Free or Plus plan, status updates from the IDE are not synced back to the server. Upgrade to Pro for full two-way sync.

---

## Next Steps

- [Manage your tasks →](/web/docs/tasks)
- [Track time on your work →](/web/docs/time-logs)
- [View your project overview →](/web/docs/projects)
