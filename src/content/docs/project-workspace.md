# Project Workspace Dashboard

The **Project Workspace Dashboard** is the analytics and governance hub for your active project. Accessible via the **Workspace** link in the project sidebar (or `/workspace`), it compiles timeline indicators, sprint progression charts, and configuration options.

---

## Workspace Layout & Main Sections

The page is divided into two structural halves: a **Top Stats Header** and a **Tabbed Details Section**.

### 1. Top Stats Cards
Three high-level summaries are always rendered at the top of the dashboard:
- **Track Your Project (Deadline Card)**:
  - Displays **Days Remaining** and a progress bar of elapsed project time.
  - Visualizes custom alert markers set at specific duration milestones (25%, 50%, 75%, 90% of project timeline).
  - Contains actions for the project owner to **Set Deadline** and toggle notifications for milestones.
- **Activity Overview**: Renders active tasks, open issues, and team member counts.
- **Task Status Distribution**: Shows a visual breakdown of tasks by status (`not started`, `inprogress`, `reviewing`, `testing`, `completed`).

### 2. Header Workspace Tools
When inside a project workspace route, the header displays a **"View More"** toggle that expands the following workspace shortcuts:
- **Home Button**: Quickly return to the main project hub page.
- **My Work Button**: Opens the **My Work Side Sheet** (`MyWorkSheet.tsx`), displaying a personal table of all tasks and issues assigned to you.
- **Team Meet Button**: Directly navigate to the integrated project video call room (`/workspace/meet`).

---

## Tabbed Views

The bottom portion of the dashboard switches between two views:

### 1. Advanced Charts Tab
*Note: Available only if the Project Owner is on a **Plus** or **Pro** plan. On the Free tier, this tab displays a locked feature notice.*

When unlocked, it aggregates data across the project to display six specialized analytics widgets:
1. **Team Contribution Radar**: Visualizes contribution patterns across different team members.
2. **Sprint Progress Chart**: Renders sprint velocities.
3. **Environmental Severity Heatmap**: Tracks reactive bugs color-coded by environment (e.g., `Production`, `Staging`, `Development`) and severity level.
4. **Weekly Velocity Chart**: Displays the rate of task completions week-over-week.
5. **Member Workload Card**: Maps priority-segmented (`High`, `Medium`, `Low`) active tasks per team member to monitor workload distribution.
6. **Weekly Engagement Chart**: Measures git activity volume.

### 2. Config Tab
Available to all projects, but options can only be modified by the **Project Owner** (Admins/Members see a read-only message):
- **Member Task Creation**: Toggle whether regular team members can create new tasks and issues.
- **Member AI Access (Kaya)**: Toggle whether team members are authorized to invoke Kaya AI.
- **AI in Teamspace**: Enable or disable AI assistant features inside the real-time chat channels.
- **Reporting Scheduler**: Configure reporting summaries to be emailed to stakeholders (Plus/Pro).

---

## Related Pages
- [Sprints](/web/docs/sprints) — planning and starting project sprints.
- [Tasks](/web/docs/tasks) — tracking daily task statuses.
- [Issues](/web/docs/issues) — debugging and managing bugs.
