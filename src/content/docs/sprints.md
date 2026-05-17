# Sprints

Sprints are time-boxed periods — typically one to two weeks — during which your team commits to completing a defined set of tasks and issues. Wekraft's sprint system is built around a simple lifecycle: **plan, start, complete**, with rich analytics at every stage.

## Sprint Lifecycle

A sprint moves through exactly three states:

```
Planned → Active → Completed
```

Only **one sprint can be active per project** at any time. You can have multiple planned sprints queued up, but only the active one is tracking live progress.

---

## Creating a Sprint

Click **"New Sprint"** from the Sprints tab. Fill in:

| Field | Required | Description |
|---|---|---|
| **Sprint Name** | ✓ | Must be unique within the project (e.g. "Sprint 3", "Authentication Week"). |
| **Sprint Goal** | ✓ | A one-sentence statement of what this sprint will achieve. |
| **Start Date** | ✓ | When work begins. |
| **End Date** | ✓ | When the sprint closes. Must be after the start date. Cannot exceed the project's target date if one is set. |

After creation, the sprint is in the **Planned** state. You can now add tasks and issues to it.

---

## Sprint Planning: The Backlog

The **Backlog** contains all tasks and issues that are not assigned to any sprint. This is your pool of unscheduled work.

From the Backlog view:
- Drag items into a planned sprint to add them
- Use the **"Move to Sprint"** action on any task or issue
- Filter by priority or status to decide what to pull in

> **Tip:** Completed tasks and closed issues are automatically excluded from the backlog — they live in the sprint history instead.

---

## Starting a Sprint

When you're ready to begin, click **"Start Sprint"** on a planned sprint.

Before activating, Wekraft automatically:
1. Removes any already-completed tasks from the sprint (they shouldn't be there)
2. Removes any already-closed issues
3. **Snapshots the final task and issue IDs** — this creates a historical record used for accurate reporting even if items are later re-assigned

> Only one sprint can be active at a time. If another sprint is already active, you'll need to complete it first.

---

## During a Sprint

While a sprint is active, the **Sprint Dashboard** shows live metrics:

### Burn Rate
How many items (tasks + issues) are completed per day. Formula:

```
burn_rate = completed_items / days_elapsed
```

A healthy burn rate means you're on track. A low burn rate early in the sprint is a signal to check for blockers.

### Estimated Completion
Based on your current burn rate, Wekraft calculates how many days remain until all items are done — even if that's beyond the sprint end date. This surfaces scope risk early.

### Days Remaining
Calculated from `sprint.endDate - now`. The progress ring on the sprint card shows how far through the timeline you are.

### Task Status Breakdown
A visual breakdown of tasks by status: `not started`, `inprogress`, `reviewing`, `testing`, `completed`. Helps identify where work is piling up.

### Team Members
A list of all unique assignees in the sprint with their task count. Useful for spotting overload or underutilization at a glance.

### Blocked Tasks
Tasks that are blocked by open issues are highlighted with a warning indicator. The `blockedTasks` count in the stats panel surfaces this immediately.

---

## Completing a Sprint

Click **"Complete Sprint"** to finalize it. This action:

1. **Freezes the final stats** — `completedTasks`, `totalTasks`, `closedIssues`, `totalIssues` are stored permanently on the sprint record. These never change, even if tasks are edited later.
2. **Moves incomplete tasks back to the backlog** — any task that is not `completed` has its `sprintId` cleared.
3. **Moves unclosed issues back to the backlog** — any issue that is not `closed` is returned to the backlog.

> Only the sprint **creator** can complete a sprint.

After completion, the sprint's final stats card shows:
- Completion rate (e.g., `8/10 tasks — 80%`)
- Issues closed vs. total
- Historical team composition

---

## Sprint Permissions

| Action | Who can do it |
|---|---|
| Create sprint | Owner, Admin |
| Add items to sprint | Owner, Admin, Member |
| Start sprint | Owner, Admin |
| Edit active sprint | Sprint creator only |
| Complete sprint | Sprint creator only |
| Delete sprint | Owner, Admin |
| Move items from active sprint | Sprint creator only |

---

## Kaya AI & Sprint Planning (Pro)

On the Pro plan, you can ask **Kaya AI** to plan your sprint for you. Kaya analyzes:
- Your backlog of tasks and their priorities
- The project deadline and remaining time
- Historical velocity from past completed sprints
- Current team workload from the Heatmap data

Kaya will suggest which tasks to pull into the next sprint, set the sprint goal, and can even create the sprint directly with one confirmation click.

---

## Next Steps

- [Understand Tasks →](/web/docs/tasks)
- [Track bugs in Issues →](/web/docs/issues)
- [Analyze your team with Heatmaps →](/web/docs/heatmaps)
