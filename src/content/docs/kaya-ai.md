# Kaya AI Assistant

**Kaya** is your built-in AI Project Manager, designed to automate the tedious parts of coordination and give you deep insights into your team's velocity and workload.

Available exclusively on the **Pro Plan**, Kaya lives in your workspace as a persistent, intelligent partner that understands your project's full context.

## How to Access Kaya

You can interact with Kaya in multiple ways:

| Access Method | How to use it |
|---|---|
| **AI Workspace Tab** | Click the **"AI"** tab in your project sidebar for a full-screen chat experience |
| **Ask Kaya Button** | Click the **"Ask Kaya"** button next to the "New Task" button in the Tasks view |
| **Command Palette** | Press `Cmd+K` (or `Ctrl+K`) from anywhere in a project workspace |
| **Today Insights** | Click the **"Today Insights"** button in the project workspace header |

> [!NOTE]
> Kaya is project-scoped. It only has access to data within the project it is active in — tasks, issues, sprints, members, and heatmap data. It does **not** see your source code unless you explicitly paste snippets into the chat.

---

## Key Capabilities

### 1. Smart Sprint Planning

Kaya can analyze your backlog and propose a balanced sprint. It considers:

- **Task priorities** — ensuring high-priority work is handled first
- **Assignee workload** — distributing tasks to prevent burnout using heatmap data
- **Sprint history** — using velocity from past completed sprints to calibrate capacity
- **Project deadline** — aligning sprint scope with remaining time

> [!TIP]
> **Try it:** *"Kaya, help me plan a 2-week sprint with the highest priority tasks from the backlog."*

Kaya will suggest which tasks to include, set the sprint goal, and can create the sprint directly with one confirmation click.

### 2. Automated Project Reports

Stop manually compiling status updates. Kaya can generate structured reports including:

- **Completion rate** — percentage of tasks finished vs. planned in the current sprint
- **Bottleneck detection** — identifying tasks that haven't moved in 3+ days
- **Activity trends** — who is making the most progress and where work is stalling
- **Sprint health** — burn rate analysis and estimated completion date
- **Blocked items** — tasks blocked by open issues with suggested actions

> [!TIP]
> **Try it:** *"Kaya, generate a project report for the current sprint."*

### 3. Workload Insights (Heatmaps)

Kaya processes data from the **Heatmap** feature to provide natural-language summaries of team health:

- *"Alice is currently carrying 3 high-priority tasks and has been in 'inprogress' status for 6 days without a completion. Consider redistributing one task to Bob, who has capacity."*
- *"The team's peak activity window is 10am–1pm IST. Scheduling reviews and demos in this window will maximize participation."*

Click **"Get Kaya Insights"** in the Heatmap panel to generate these insights on demand.

### 4. Task Analysis

Ask Kaya to analyze specific aspects of your project:

- *"Which tasks are at risk of missing their due dates?"*
- *"Show me all high-priority tasks that aren't assigned to anyone."*
- *"What's the most common blocker type across our issues?"*

---

## Quick Actions Reference

In the AI Workspace, you'll find quick-action tiles to trigger common workflows:

| Action | What it does |
|---|---|
| **Project Report** | Generates a full analysis of your current project state |
| **Set Reminder** | Creates a one-time or recurring event on your calendar |
| **Create Sprint** | Launches the smart sprint planning wizard |
| **Auto Schedulers** | Sets up automated reporting frequencies for your team |

---

## Usage Limits

| Detail | Value |
|---|---|
| **Plan required** | Pro |
| **Monthly calls** | 50 per account |
| **Scope** | Per-project (only sees data in the active project) |
| **Overage behavior** | Previous conversations remain readable; new queries paused until next billing cycle |

The project owner can configure a **Kaya threshold** per project in Project Settings → Configuration to distribute calls across multiple projects. Project owners can also toggle **"Members use Kaya"** to control whether non-admin members can access Kaya.

---

## Privacy & Context

- Kaya only accesses data within the **active project** — tasks, issues, sprints, members, and analytics
- It does **not** read your source code or access your GitHub repository files
- Kaya conversations are project-scoped and visible only to the user who initiated them
- AI responses are generated using project data and do not train external models

---

## Best Practices

- **Be specific with prompts** — "Plan a sprint with the 5 highest-priority backend tasks" gives better results than "Plan a sprint"
- **Use Kaya for weekly reports** — save 30+ minutes by letting Kaya generate your standup or status update
- **Check workload before assigning** — ask Kaya to analyze member capacity before dragging tasks into a sprint
- **Review Kaya's suggestions** — AI recommendations are starting points, not final decisions. Always review before confirming

---

## Next Steps
- [Learn about Sprints →](/web/docs/sprints)
- [View your team Heatmaps →](/web/docs/heatmaps)
- [Upgrade to Pro to unlock Kaya →](/web/docs/billing)
- [Explore keyboard shortcuts →](/web/docs/shortcuts)
