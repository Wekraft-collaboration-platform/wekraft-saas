# Time Logs

Time logs give you a clear record of how long work actually takes versus how long it was estimated. Wekraft supports both automatic time tracking via the VS Code extension and manual entry from the web app.

## Why Track Time?

Accurate time data helps your team:
- **Improve estimation** — compare planned vs. actual time to calibrate future sprints
- **Understand capacity** — see how much time each member has been spending on tasks
- **Generate client reports** — export a summary of hours spent per project
- **Identify bottlenecks** — tasks with disproportionately high time logged relative to their estimate signal complexity that wasn't planned for

---

## Automatic Time Tracking (VS Code Extension)

When you use the Wekraft VS Code extension, time tracking happens silently in the background:

1. **Set a task to "In Progress"** — the timer starts automatically.
2. **Work in your editor** — time is tracked while VS Code is the focused window.
3. **Mark the task as "Reviewing" or "Completed"** — the timer stops and the elapsed duration is saved as a time log entry.

> **Note:** Automatic time tracking requires the **Pro plan** and the VS Code extension. Free and Plus users can view time logs but cannot auto-log from the IDE.

The auto-log entry includes:
- Duration (in minutes)
- Associated task
- Timestamp of the session
- A system-generated description ("Auto-tracked via VS Code extension")

---

## Manual Time Logging

You can log time manually from the task detail page on the web app:

1. Open a task by clicking on it in any view (List, Board, or Table).
2. In the **Task Detail Sheet**, scroll to the **Time Logs** section.
3. Click **"+ Log Time"**.
4. Enter:
   - **Duration** — hours and minutes worked
   - **Description** — what you did during this session (optional but recommended)
   - **Date** — defaults to today, can be backdated

5. Click **Save**. The entry is added to the task's log immediately.

---

## Viewing Time Logs

### Per Task
Every task shows a **Total Time Logged** badge at the top of its detail sheet, alongside a log history of all individual entries (who logged, when, and how long).

### Per Project (Time Logs Tab)
The **Time Logs** tab in your project gives a project-wide view. You can:
- Filter by team member
- Filter by date range
- See a daily/weekly breakdown chart of hours logged
- Export the log as a CSV

---

## Time Estimation vs. Actuals

Every task has an **estimation window** (`startDate` → `endDate`). This is the planned time range for completing the task, not a duration estimate. Time logs give you the actual hours spent within (or outside) that window.

Use the **Table View** of tasks to see both the estimation window and the total hours logged side-by-side — a quick way to spot tasks that overran.

---

## Best Practices

- **Log daily, not retroactively** — logging at the end of the week leads to inaccurate entries. Make it a habit to log at the end of each work session.
- **Use descriptions** — "Debugged auth flow, found token expiry mismatch" is far more useful than "worked on task" three months later.
- **Auto-tracking + manual corrections** — let the extension auto-track, then add a manual entry if you worked on paper or in a meeting that wasn't captured.

---

## Next Steps

- [Use the VS Code extension for auto-tracking →](/web/docs/extension)
- [Analyze team workload with Heatmaps →](/web/docs/heatmaps)
- [View activity in the Calendar →](/web/docs/calendar)
