# Project Workspace Dashboard

The **Project Workspace Dashboard** is the command center for an active project. Accessible via the **Workspace** link in the project sidebar, it aggregates real-time progress metrics, sprint charts, team workloads, personal assignments, and administrative configurations.

---

## Workspace Layout & Tabs

The workspace interface is split into three main tabs:

1. **Analytics Charts**: Dynamic progress trackers, workload distributions, and team performance charts.
2. **My Work**: A personalized list of tasks, issues, and tickets assigned to the logged-in user.
3. **Configuration**: Settings to set/change project deadlines and sprint milestone alerts.

### Dashboard Structure

| Tab Module                  | Key Features & Sub-sections                                      | Description & Utility                                                                          |
| :-------------------------- | :--------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| 📊 **Analytics Charts Tab** | • **Deadline Tracker** (Top Card)<br><br>• **Team Charts** (Task Status, Activity Overview, Radar Charts) | • Renders project timelines and milestone duration checkpoints.<br><br>• Displays status distributions, team contribution radars, and resource workload priority views. |
| 💼 **My Work Tab**          | • **My Tasks**<br><br>• **My Issues & Tickets**                   | • Displays personalized tasks and estimations assigned to the active user.<br><br>• Displays assigned software bugs and active support tickets. |
| ⚙️ **Configuration Tab**    | • **Set Deadline**<br><br>• **Configure Alerts**                  | • Allows project owners to define target completion dates.<br><br>• Enables setting up automated timeline milestone alerts. |

---

## 1. Analytics Charts Tab

This tab visualizes the state of your project through multiple responsive chart panels:

| Widget Panel                          | Core Metrics & Visuals                                                                                                                                                                                         | Purpose & Actionable Insights                                                                                        |
| :------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| ⏰ **Deadline Tracker** (Top Card)    | • **Timeline Progress**: Horizontal duration elapsed bar.<br><br>• **Milestone Flags**: Status checks at `25%`, `50%`, `75%`, and `90%` time elapsed.<br><br>• **Days Remaining**: Active countdown timer/overdue indicator. | Tracks overall project duration and lets stakeholders gauge if the project pace aligns with the target release date. |
| 📈 **Activity Overview**              | • Total task numbers, active bug queues, and activity velocity logs.                                                                                                                                           | High-level summary of active workflow volumes and velocity trends.                                                   |
| 📊 **Task Status Distribution**       | • Circular pie/donut chart showing status percentages (`Not Started`, `In Progress`, `Reviewing`, `Testing`, `Completed`).                                                                                     | Helps identify bottlenecks in the pipeline stages.                                                                   |
| 🎯 **Team Performance Radar**         | • Multi-dimensional radar map comparing tasks resolved, bugs closed, speed, and reliability.                                                                                                                   | Standardizes and compares active team contributor velocity metrics.                                                  |
| 📅 **Weekly Velocity & Engagement**   | • **Velocity Chart**: Daily line chart of completed tasks and closed bugs.<br><br>• **Engagement Grid**: 12-day rolling heatmap of daily member contributions.                                                 | Monitors short-term team momentum and continuous integration habits.                                                 |
| 👥 **Member Workload Chart**          | • Priority-segmented (`High`, `Medium`, `Low`) task counts mapped per developer.                                                                                                                               | Visualizes team capacity to prevent over-allocation or burnout.                                                      |
| 🔥 **Environmental Severity Heatmap** | • Heatmap of active issues across environments (`Production`, `Staging`, `Dev`, `Local`) by severity level.                                                                                                    | Quickly isolates high-severity issues affecting production or critical testing environments.                         |

---

## 2. My Work Tab

Designed to reduce clutter, this tab displays a tabular interface containing only the active user's assignments:

| Worksheet         | Displayed Attributes                                                                    | Intended Use Case                                                  |
| :---------------- | :-------------------------------------------------------------------------------------- | :----------------------------------------------------------------- |
| 📋 **My Tasks**   | User stories, subtasks, story point estimations, and block/dependency state indicators. | Daily task list tracking active engineering tasks.                 |
| 🐛 **My Issues**  | Software bugs, environmental context (e.g. staging), and severity levels.               | Tracking development bugs assigned for investigation or hotfixing. |
| 🎫 **My Tickets** | Active support/feature tickets assigned for direct client or stakeholder resolution.    | Managing external and high-priority customer support items.        |

---

## 3. Configuration Tab

Reserved for project Owners and Administrators:

| Feature / Setting              | Interface Component                                  | Action & System Behavior                                                                                                        |
| :----------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------ |
| 🗓️ **Target Project Deadline** | **Set Deadline Dialog**: Calendar picker modal.      | Allows setting or extending the target project completion date.                                                                 |
| 🔔 **Sprint Milestone Alerts** | **Sprint Alerts Checklist**: Interactive checkboxes. | Activates automatic notifications to the team when project elapsed time crosses `25%`, `50%`, `75%`, or `90%` duration markers. |
