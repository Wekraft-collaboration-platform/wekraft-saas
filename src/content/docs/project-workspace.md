# Project Workspace Dashboard

The **Project Workspace Dashboard** is the analytics and governance hub for your active project. Accessible via the **Workspace** link in the project sidebar, it compiles timeline indicators, sprint progression charts, and configuration options.

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
- **Task Status Distribution**: Shows a visual breakdown of tasks by their active status.

---

## Tabbed Views

The bottom portion of the dashboard switches between two views:

### Tab A: Advanced Charts (Team Insights)
*Note: Available only if the Project Owner is on a **Plus** or **Pro** plan. On the Free tier, this tab displays a locked feature notice.*

When unlocked, it aggregates data across the project to display six specialized analytics widgets:
1. **Team Contribution Radar**: Visualizes contribution patterns across different team members.
2. **Sprint Progress Chart**: Renders sprint velocities and burndowns.
3. **Environmental Severity Heatmap**: Tracks reactive bugs color-coded by environment (e.g., `Production`, `Staging`, `Development`) and severity level.
4. **Weekly Velocity Chart**: Displays the rate of task completions week-over-week.
5. **Member Workload Card**: Maps priority-segmented (`High`, `Medium`, `Low`) active tasks per team member to monitor workload distribution.
6. **Weekly Engagement Chart**: Measures git commits and activity volume.

### Tab B: Config (Governance Policies)
Available to all projects, but options can only be modified by the **Project Owner** (Admins/Members see a read-only message):
- **Member Task Creation**: Toggle whether regular team members can create new tasks and issues.
- **Member AI Access (Kaya)**: Toggle whether team members are authorized to invoke Kaya AI.
- **AI in Teamspace**: Enable or disable AI assistant features inside the real-time chat channels.

---

## Next Steps

- Check the project scheduling features in [Sprints & Planning](/web/docs/sprints).
- Link repository activity in [Git Repositories](/web/docs/repositories).
- Monitor task flows in [Tasks & Backlog](/web/docs/tasks).
