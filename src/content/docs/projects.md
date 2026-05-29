# Projects

Projects are the top-level containers in Wekraft. Every task, issue, sprint, calendar event, and team member lives inside a project. Understanding how projects work is the foundation for everything else.

## Creating a Project

You can create a project from the **Dashboard** (Projects tab) or during the **Onboarding** flow.

1. Click **"New Project"** from the project list on your dashboard.
2. Fill in the project details:

| Field | Required | Description |
|---|---|---|
| **Project Name** | ✓ | The name of your project. A URL-safe slug is generated automatically (e.g. `my-app-a3x7k`). |
| **Description** | — | A short summary of what the project is about. |
| **Visibility** | ✓ | **Public** projects are discoverable by other Wekraft users. **Private** projects require an invite link. |
| **Work Status** | ✓ | The current phase of the project (see below). |

3. Click **Create Project**. You're automatically added as the `owner`.

> [!NOTE]
> The number of projects you can create depends on your plan. Free: 2, Plus: 10, Pro: 20. See [Billing](/web/docs/billing) for details.

### Work Status Phases

Each project is tagged with one of six lifecycle phases. This helps collaborators understand the project's maturity at a glance.

| Status | Meaning |
|---|---|
| `Ideation` | Concept phase — idea is being explored |
| `Validation` | Gathering feedback or testing assumptions |
| `Development` | Actively being built |
| `Beta` | Feature-complete, being tested with real users |
| `Production` | Shipped and running live |
| `Scaling` | Handling growth and performance challenges |

---

## The Project Dashboard

When you open a project, the workspace dashboard provides a real-time overview organized into three top cards:

| Card | What it shows |
|---|---|
| **Track Your Project** | Project deadline progress bar, days remaining, created/deadline dates, alert milestones, and deadline/alert buttons |
| **Activity Overview** | Total tasks, open issues, recent task/issue activity counts |
| **Task Status** | Pie chart showing task distribution across all five statuses |

Below the cards, three tabs provide deeper analysis:

| Tab | Description | Plan Required |
|---|---|---|
| **Advance Charts** | Team contribution radar, sprint bar chart, severity heatmap, weekly velocity, member workload, and weekly engagement | Plus or Pro |
| **My Work** | Personal table showing tasks and issues assigned to you | All plans |
| **Config** | Project settings, scheduler, and configuration (owner only) | All plans |

> [!TIP]
> Click **"Refresh Analytics"** at the top of the Advance Charts tab to force a fresh data pull. Analytics are cached for performance.

---

## Roles & Permissions

Every project member has an **Access Role** that controls what they can do.

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| View all project data | ✓ | ✓ | ✓ | ✓ |
| Comment on tasks/issues | ✓ | ✓ | ✓ | — |
| Create/edit tasks | ✓ | ✓ | ✓* | — |
| Create/edit issues | ✓ | ✓ | ✓* | — |
| Create sprints | ✓ | ✓ | — | — |
| Start/complete sprint | ✓ | ✓ | — | — |
| Manage members | ✓ | ✓ | — | — |
| Edit project settings | ✓ | ✓ | — | — |
| Set deadline & alerts | ✓ | — | — | — |
| Delete project | ✓ | — | — | — |

> [!NOTE]
> *Members can create tasks and issues only if the project owner has enabled **"Members can create"** in Project Settings → Configuration.

### Inviting Members

From the project workspace, click the **"Invite"** button in the header. Share the unique invite link with your teammates. When a user clicks the invite link:

1. They submit a **join request** with an optional message
2. The owner or any admin can **Accept** or **Reject** the request from the **Join Requests** panel in Project Settings → Members

Accepted users are added as `member` by default. You can then promote them to `admin` if needed.

---

## GitHub Integration

Linking a GitHub repository to your project unlocks powerful integrations:

1. Ensure your **GitHub account is connected** via the main dashboard (click "Connect Now" on the Commits card)
2. Navigate to your project and link a repository from Project Settings
3. Once linked, you can:
   - **Browse the repository** using the built-in [File Explorer](/web/docs/file-structure) in the project sidebar
   - **Import GitHub Issues** into Wekraft with one click from the Issues panel
   - **Link tasks to code files** — set a codebase path on any task, clickable in the VS Code extension

> [!TIP]
> For the full GitHub integration experience, make sure you've connected GitHub on the main dashboard first. This gives Wekraft access to your repositories.

---

## Project Settings

Access **Project Settings** from the gear icon (⚙) in the project sidebar or the **Config** tab in the workspace dashboard.

### General
- Rename the project
- Update description, tags, and work status
- Set a **Project Target Date** (deadline) — visible on the workspace progress bar
- Upload a project thumbnail

### Configuration

| Setting | Default | Description |
|---|---|---|
| **Members can create** | Off | Allow `member` role to create tasks and issues |
| **Members use Kaya** | Off | Allow members to access Kaya AI (Pro plan required) |
| **Kaya threshold** | Plan limit | Max Kaya AI calls this project can use per month |

### Project Deadline & Alerts

Set a target deadline from the **"Set Deadline"** button on the workspace dashboard card:

1. Pick a date — a progress bar shows elapsed time as a percentage
2. Configure **Alerts** at 25%, 50%, 75%, or 90% milestones
3. When a milestone is reached, the owner and admins receive a notification

> [!NOTE]
> Only the project **owner** can set deadlines and configure alerts.

### Danger Zone
- **Delete project** — permanently deletes the project and all its data (tasks, issues, sprints, members, time logs). This action **cannot be undone**.

---

## Project Limits by Plan

| Plan | Projects owned | Projects joined | Members per project |
|---|---|---|---|
| Free | 2 | 2 | 3 |
| Plus | 10 | 10 | 5 |
| Pro | 20 | 20 | 15 |

---

## Next Steps

- [Create and manage tasks →](/web/docs/tasks)
- [Track bugs with issues →](/web/docs/issues)
- [Plan your first sprint →](/web/docs/sprints)
- [Browse files with the File Explorer →](/web/docs/file-structure)
- [Set up team roles →](/web/docs/manage-teams)
