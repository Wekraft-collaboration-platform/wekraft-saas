# Issues

Issues track unplanned, reactive work — bugs discovered in production, incidents, feature requests from users, and anything that doesn't fit neatly into a sprint plan. Wekraft gives issues a separate, first-class workflow that integrates tightly with tasks and GitHub.

## Issues vs. Tasks

It's important to understand the distinction:

| | Tasks | Issues |
|---|---|---|
| **Nature** | Planned work | Unplanned / reactive work |
| **Source** | Created manually | Manual, from a task, or from GitHub |
| **Priority** | `high / medium / low` | `critical / medium / low` (severity) |
| **Environment** | — | `local / dev / staging / production` |
| **Blocking** | Can be blocked by issues | Can block tasks |
| **Sprint support** | ✓ | ✓ |

As a rule of thumb: if it was in the plan, it's a **task**. If it was a surprise, it's an **issue**.

---

## Creating an Issue

Click **"New Issue"** from the Issues tab inside your project.

| Field | Description |
|---|---|
| **Title** | A concise description of the problem. |
| **Description** | Context, reproduction steps, screenshots. Supports Markdown. |
| **Severity** | `Critical` (blocking users), `Medium` (degraded experience), `Low` (minor). |
| **Environment** | Where the issue occurs: `local`, `dev`, `staging`, or `production`. |
| **Due Date** | Optional deadline for resolution tracking. |
| **Assignees** | One or more team members responsible for fixing this. |
| **Sprint** | Assign to the current or a planned sprint. |
| **File Linked** | A file path associated with the bug (clickable in VS Code). |

---

## Issue Sources

Issues in Wekraft come from three sources, tracked by the `type` field:

### Manual (`type: manual`)
Created directly in the Issues tab. The most common type — use these for bugs found during development, user feedback, or anything that needs attention.

### Task Escalation (`type: task-issue`)
When a task encounters a blocker that needs to be tracked separately, you can **escalate it to an issue**. This sets `task.isBlocked = true`, which:
- Prevents the task from being marked as `completed` until the issue is closed
- Links the issue back to the originating task via `issue.taskId`

This creates a traceable chain: **task → blocking issue → resolution**.

### GitHub Import (`type: github`)
If your project has a connected GitHub repository with webhook enabled, new GitHub Issues are automatically imported as Wekraft Issues. Each imported issue stores the original `githubIssueUrl` for reference.

You can also manually import GitHub issues by clicking **"Import from GitHub"** in the Issues panel.

---

## Issue Lifecycle

Issues move through four states:

```
Not Opened → Opened → (Reopened) → Closed
```

| Status | Description |
|---|---|
| `not opened` | Created but not yet triaged |
| `opened` | Actively being investigated or fixed |
| `reopened` | Was closed but the problem recurred |
| `closed` | Resolved — triggers `finalCompletedAt` timestamp |

> **Note:** Closing an issue that is linked to a task automatically unblocks the task, allowing it to be marked as `completed`.

---

## Issue Views

Issues support two display modes:

### List View
A vertical list with severity badges, status indicators, assignee avatars, and environment tags. Filter by severity, environment, or status. Sort by due date or creation date.

### Kanban View
Drag-and-drop columns by status (`opened`, `reopened`, `closed`). Each card shows the severity colour-coding at a glance — red for critical, yellow for medium, grey for low.

---

## Issue Comments

Like tasks, every issue has a comments thread. Use this to document investigation steps, post links to related PRs, or communicate resolution decisions. Comments store the author, avatar, and timestamp.

---

## Sprint Integration

Issues can be added to a sprint alongside tasks. During sprint planning, drag issues from the backlog into the active sprint to commit to resolving them. The sprint completion stats track `closedIssues` separately from `completedTasks`.

---

## Next Steps

- [Track planned work with Tasks →](/web/docs/tasks)
- [Organise work into Sprints →](/web/docs/sprints)
- [View workload with Heatmaps →](/web/docs/heatmaps)
