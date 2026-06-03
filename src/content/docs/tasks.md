# Tasks & Backlog

Tasks are the planned units of work (e.g., features, refactors, documentation) in Wekraft. They form your backlog and are grouped into sprints for team execution.

---

## Task Properties

Every task in Wekraft contains the following fields:
- **Title**: A clear description of the work.
- **Priority**: Classified as `High`, `Medium`, or `Low`.
- **Estimation Window**: A calendar start and end date (`startDate` -> `endDate`) representing the planned range for execution.
- **Assignees**: Multiple team members can be assigned to collaborate on a single task.
- **Codebase Link**: A relative file path in your linked GitHub repository (e.g., `src/App.tsx`). This allows developers to open the file directly in VS Code.

---

## The Task Lifecycle

Tasks move through five distinct status states:

| Status Badge | Technical Value | Description |
| :--- | :--- | :--- |
| **Not Started** | `not started` | Created in backlog/sprint, work has not begun |
| **In Progress** | `inprogress` | Assignee is actively working on the task |
| **Reviewing** | `reviewing` | Code is written and waiting for PR or peer review |
| **Testing** | `testing` | Code is in QA or staging verification |
| **Completed** | `completed` | The task is successfully finished |

---

## Views: Visualizing Work

Wekraft provides three layouts to manage tasks in the workspace:
1. **List View**: A spreadsheet-style breakdown ideal for bulk editing and backlog planning.
2. **Board View (Kanban)**: Column-based layout matching the task statuses. Ideal for daily standup updates.
3. **Table View**: Renders tasks along with details like estimation windows and assignees. Useful for project managers.

---

## Next Steps

- Link tasks to issues in [Issues & Bug Tracking](/web/docs/issues).
- Schedule tasks in [Sprints & Planning](/web/docs/sprints).
- Verify milestones in the [Project Delivery Timeline & Gantt Chart](/web/docs/time-logs).
