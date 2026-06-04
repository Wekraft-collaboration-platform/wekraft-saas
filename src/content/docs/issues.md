# Issues & Bug Tracking

Issues in Wekraft represent unplanned or reactive work, such as bugs found in production, environment failures, or hotfixes. They operate on a distinct lifecycle separate from your planned sprint backlog.

---

## Issue Properties & Categorization

Unlike tasks that focus on priority, issues are categorized by severity and impact environment:

- **Impact Environment**: Specifies where the issue occurred:
  - `local` (Local environment)
  - `dev` (Development server)
  - `staging` (Staging/QA build)
  - `production` (Live environment)
- **Severity**: Determines urgency:
  - `critical` (Blocker / downtime)
  - `medium` (Feature degraded)
  - `low` (Cosmetic / minor annoyance)
- **File Linked (`fileLinked`)**: Path to the problematic file in your GitHub repository. Linking a file enables visualization in [Repository Heatmaps](/web/docs/heatmaps) and direct link navigation.
- **Due Date (`due_date`)**: The deadline to resolve the issue. If an issue passes this date without being closed, it accumulates toward the project's **Delay Debt**.

---

## Issue Sources (Origins)

An issue in Wekraft can originate from three distinct entry points:

1. **Manual (`manual`)**: Created directly from the **Issues** workspace dashboard by clicking **"New Issue"**.
2. **Task Escalation (`task-issue`)**: Created when a developer flags an active task as blocked.
   - *Behavior*: Escalating a task blocks the parent task. The task remains in a read-only blocked state until the newly created issue is set to `closed`, which automatically unblocks the parent task.
3. **GitHub Sync (`github`)**: Syncs issues directly from your linked GitHub repository.
   - *Behavior*: Syncs description, labels, and URL links. Resolving the issue on GitHub closes the issue in Wekraft during periodic caching.

---

## The Issue Lifecycle

Issues transition through four states:

| Status Badge | Technical Value | Description |
| :--- | :--- | :--- |
| **Not Opened** | `not opened` | Logged in backlog, investigation has not begun |
| **Opened** | `opened` | Assignee is actively debugging the issue |
| **Reopened** | `reopened` | The fix failed validation, and the bug has recurred |
| **Closed** | `closed` | The bug is successfully resolved |

---

## Next Steps

- Drag issues into an active plan in [Sprints & Planning](/web/docs/sprints).
- View codebase issues on the [React Flow Codebase Map](/web/docs/heatmaps).
- Review project-wide delays under the [Project Delivery Timeline & Gantt Chart](/web/docs/time-logs).
