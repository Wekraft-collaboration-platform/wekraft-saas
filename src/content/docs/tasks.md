# Tasks

Tasks are the fundamental units of planned work in Wekraft. Everything your team commits to doing — features, refactors, documentation, research — should live as a task.

## Creating a Task

From inside a project, click **"New Task"** (or press `T` as a keyboard shortcut). The task creation dialog lets you define:

| Field | Description |
|---|---|
| **Title** | A concise description of the work. Be specific: "Fix login button alignment on Safari" is better than "Fix bug". |
| **Description** | Rich text notes, acceptance criteria, or context. Supports Markdown. |
| **Status** | The current state of the task (see below). |
| **Priority** | `High`, `Medium`, or `Low`. |
| **Start & End Date** | The estimated working window for this task. |
| **Assignees** | One or more team members responsible for this task. |
| **Type / Tag** | A custom label with a colour (e.g. `{ label: "frontend", color: "blue" }`). |
| **Sprint** | Assign to an existing sprint, or leave blank to keep it in the backlog. |
| **Codebase Link** | A file path relative to your repo root. Clickable in the VS Code extension. |
| **Attachments** | Upload images, PDFs, or any reference file (name + URL). |

---

## Task Statuses

Tasks flow through a five-stage lifecycle:

```
Not Started → In Progress → Reviewing → Testing → Completed
```

| Status | Icon | Description |
|---|---|---|
| `not started` | ○ | In the backlog or sprint, not yet begun |
| `inprogress` | ⟳ | Actively being worked on |
| `reviewing` | 👁 | Awaiting code review or peer feedback |
| `testing` | 🧪 | In QA or manual testing |
| `completed` | ✓ | Done — triggers `finalCompletedAt` timestamp |

You can update a task's status by:
- Clicking the status badge in the **List**, **Board**, or **Table** view
- Dragging the task card to a different column in **Board (Kanban) view**
- Right-clicking a task in the **VS Code extension**

---

## Task Views

Wekraft provides three ways to view your tasks, each optimised for a different mental model:

### List View
A dense, information-rich table showing all tasks with their status, priority, assignees, and due dates at a glance. Best for triaging a large backlog. Supports inline editing — click any field to update it directly.

### Board View (Kanban)
Tasks are displayed as cards in columns by status. Drag a card to a new column to update its status instantly. Each card shows the assignee avatars, priority indicator, and due date. Best for seeing the flow of work during an active sprint.

### Table View
A spreadsheet-style view with sortable and filterable columns. Ideal for analysing data across many tasks — for example, filtering by `priority: high` and sorting by `due date`.

---

## Task Properties Reference

### Priority
Priority affects visual prominence in all views. Use it to communicate urgency, not just importance.

- **High** — Blocking other work or has a hard deadline approaching
- **Medium** — Important but not time-critical
- **Low** — Nice to have, can be deferred

### Blocked Tasks
A task is marked **blocked** when an Issue has been escalated from it (type: `task-issue`). A blocked task cannot be marked as `completed` until the linked issue is closed. This is enforced at the database level.

### Codebase Link
If your project has a linked GitHub repository, you can store a file path on a task. In the VS Code extension, this becomes a clickable link that opens the exact file — perfect for "this task lives in `src/components/Button.tsx`."

### Insights
When a task is marked `completed`, Wekraft stores:
- `finalCompletedAt` — the exact timestamp of completion
- `finalCompletedBy` — which team member completed it

These are used in sprint stats, heatmaps, and Kaya AI analysis.

---

## Task Comments

Every task has a comments thread. Members can leave updates, ask questions, or paste code snippets. Comments are stored with the author's name and avatar for quick identification.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `T` | Create new task |
| `E` | Edit selected task |
| `Enter` | Open task detail sheet |
| `Esc` | Close dialog / sheet |

---

## Next Steps

- [Track bugs with Issues →](/web/docs/issues)
- [Group tasks into a Sprint →](/web/docs/sprints)
- [Manage tasks from VS Code →](/web/docs/extension)
