# Heatmaps

Heatmaps give your team AI-powered visibility into workload distribution, individual activity patterns, and burnout risk — before problems surface in a sprint retrospective.

## What Heatmaps Show

Wekraft's Heatmap feature has two main panels:

### 1. Member Workload

This panel ranks every team member by their **current load** — the number of active tasks and open issues assigned to them, weighted by priority.

For each member you can see:
- **Task breakdown** — how many tasks they have in each status (`inprogress`, `reviewing`, `testing`, `not started`)
- **Issue breakdown** — open and critical issues they're responsible for
- **Load score** — a computed score (Low / Medium / High / Overloaded) based on total assignments weighted by priority and urgency
- **Burnout risk indicator** — flagged when a member has been in `inprogress` or `reviewing` for an extended period without completions

Use this panel during sprint planning to make sure you're distributing new tasks fairly, not piling everything onto your two most reliable engineers.

### 2. Activity Flow

A visual timeline (similar to a GitHub contribution graph) showing when each team member is most active — when tasks are being updated, completed, or commented on.

This helps you:
- **Schedule meetings wisely** — avoid calling a team standup during peak deep-work hours
- **Spot disengaged members** — a member who hasn't touched a task in several days may be blocked or confused
- **Understand team rhythm** — does your team do most of its work on Tuesday? Does productivity drop on Fridays?

---

## Reading the Workload Matrix

The **Workload Matrix** is a table showing every member on one axis and task categories on the other. Each cell shows the count of tasks in that category.

| Member | High Priority | Medium | Low | Issues |
|---|---|---|---|---|
| Alice | 3 | 2 | 1 | 1 |
| Bob | 1 | 4 | 2 | 0 |
| Carol | 0 | 1 | 5 | 3 |

In this example, Alice has a heavy high-priority load. Carol has many low-priority tasks and 3 open issues. This is the kind of pattern that's easy to miss without a visual.

---

## AI-Powered Insights (Pro)

On the Pro plan, Kaya AI processes the heatmap data and generates natural-language insights, such as:

> *"Alice is currently carrying 3 high-priority tasks and has been in 'inprogress' status for 6 days without a completion. Consider redistributing one task to Bob, who has capacity."*

> *"The team's peak activity window is 10am–1pm IST. Scheduling reviews and demos in this window will maximize participation."*

These insights are generated on-demand when you click **"Get Kaya Insights"** in the Heatmap panel.

---

## Importing GitHub Data

If your project has a connected GitHub repository, the Heatmap can also pull in GitHub commit and PR activity. This enriches the Activity Flow with real code contributions, not just Wekraft task updates.

Enable this from **Project Settings → Repository → Sync activity with Heatmap**.

---

## Plan Requirements

| Feature | Free | Plus | Pro |
|---|---|---|---|
| Member workload view | Limited (top 3 members) | Limited (top 3 members) | Full (all members) |
| Activity flow | — | — | ✓ |
| Kaya AI workload insights | — | — | ✓ |
| GitHub activity overlay | — | — | ✓ |

---

## Next Steps

- [View your team in Team Space →](/web/docs/team-space)
- [Manage roles and access →](/web/docs/manage-teams)
- [Run a sprint with balanced workloads →](/web/docs/sprints)
