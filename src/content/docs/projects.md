# Projects

Projects are the top-level containers in Wekraft. Every task, issue, sprint, calendar event, and team member lives inside a project. Understanding how projects work is the foundation for everything else.

## Creating a Project

You can create a project from the **Dashboard** or during the **Onboarding** flow.

1. Click **"New Project"** from the project list on your dashboard.
2. Fill in the project details:

| Field | Required | Description |
|---|---|---|
| **Project Name** | ✓ | The name of your project. A URL-safe slug is generated automatically (e.g. `my-app-a3x7k`). |
| **Description** | — | A short summary of what the project is about. |
| **Visibility** | ✓ | **Public** projects are discoverable by other Wekraft users. **Private** projects require an invite link. |
| **Work Status** | ✓ | The current phase of the project (see below). |

3. Click **Create Project**. You're automatically added as the `owner`.

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

When you open a project, the dashboard provides a real-time overview:

- **Sprint progress**: How many tasks and issues are completed in the active sprint vs. total
- **Member activity**: Who has been active recently
- **Upcoming deadlines**: Tasks and sprint end dates coming up in the next 7 days
- **Blocked items**: Tasks flagged as blocked due to an open issue

---

## Roles & Permissions

Every project member has an **Access Role** that controls what they can do.

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| Create/edit tasks | ✓ | ✓ | ✓* | — |
| Create/edit issues | ✓ | ✓ | ✓* | — |
| Create sprints | ✓ | ✓ | — | — |
| Start/complete sprint | ✓ | ✓ | — | — |
| Manage members | ✓ | ✓ | — | — |
| Edit project settings | ✓ | — | — | — |
| Delete project | ✓ | — | — | — |

> *Members can create tasks and issues only if the project owner has enabled **"Members can create"** in Project Settings.

### Inviting Members

From **Project Settings → Members**, click **"Invite Member"**. You can share the unique invite link directly, or accept join requests from users who discovered your public project.

When a user clicks the invite link, they submit a join request. The owner or any admin can **Accept** or **Reject** the request from the **Join Requests** panel.

---

## GitHub Integration

Linking a GitHub repository to your project unlocks powerful integrations:

1. Navigate to **Project Settings → Repository**.
2. Select a repository from your connected GitHub account.
3. Optionally enable the **Webhook** to auto-sync new GitHub issues.

Once linked:
- **GitHub Issues** can be imported as Wekraft Issues (one-click import from the Issues panel)
- Commits and pull requests are referenced in the task timeline

---

## Project Settings

Access **Project Settings** from the gear icon (⚙) in the project sidebar.

### General
- Rename the project
- Update description, tags, and work status
- Set a **Project Target Date** (deadline) — sprints cannot exceed this date
- Upload a project thumbnail

### Configuration
- **Member can create** — toggle whether members (not just owners/admins) can create tasks and issues
- **Member use Kaya** — toggle Kaya AI access for members (Pro plan)
- **Kaya threshold** — maximum number of Kaya AI calls this project can use per month

### Danger Zone
- **Delete project** — permanently deletes the project and all its data. This cannot be undone.

---

## Project Limits by Plan

| Plan | Projects owned | Projects joined |
|---|---|---|
| Free | 2 | 2 |
| Plus | 3 | 5 |
| Pro | 10 | Unlimited |

---

## Next Steps

- [Create and manage tasks →](/web/docs/tasks)
- [Track bugs with issues →](/web/docs/issues)
- [Plan your first sprint →](/web/docs/sprints)
