# Getting Started

Get up and running with Wekraft in under five minutes. This guide walks you through creating your account, setting up your first project, inviting your team, and starting your first sprint.

> [!TIP]
> Wekraft includes a built-in **Getting Started Checklist** on your dashboard that tracks your progress through each setup step. Complete all steps to unlock the full platform experience.

## Step 1 — Sign Up

Visit [wekraft.xyz](https://wekraft.xyz) and click **"Get Started"**. You can sign up using:

- **GitHub** — recommended for developers, as it also enables repository linking and commit stats later
- **Google** — quick sign-in with your Google account

After authentication, you'll land on the **Onboarding** flow.

> [!NOTE]
> Wekraft uses secure, enterprise-grade identity providers for authentication. We never store your passwords. See [Security & Permissions](/web/docs/security) for more details.

---

## Step 2 — Complete Onboarding

The onboarding flow collects a few details to personalize your experience:

### Identity
- **Full Name** — displayed on your profile and in team spaces
- **Username** — a unique handle (e.g., `@ritesh`) used across the platform
- **Avatar** — upload a profile photo or use the auto-generated initials

### Role & Occupation
- Select your **identity** — Student, Professional, or Freelancer
- Pick your **role** — Developer, Designer, Project Manager, Product Owner, or Other
- Add your **occupation title** (e.g., "Senior Frontend Developer")

### Skills
- Add relevant skills (e.g., `React`, `Node.js`, `UI/UX`, `Python`)
- These appear on your public profile and help teams understand your expertise

> [!TIP]
> You can always update these details later from your [Profile & Settings](/web/docs/profile) page.

---

## Step 3 — Explore the Dashboard

After onboarding, you land on the **Main Dashboard**. Here's what you'll see:

| Section | What it shows |
|---|---|
| **Metric Cards** | Your GitHub stats (commits, PRs, merged PRs) — connect GitHub to populate |
| **Stats Tab** | Getting Started Checklist, notifications, upcoming deadlines, and calendar events |
| **Projects Tab** | All projects you own or have joined, with role badges and status indicators |
| **Discover Tab** | Community projects (coming soon) |
| **Right Sidebar** | Collapsible panel with quick links and account info |

The **Getting Started Checklist** at the top of the Stats tab guides you through the remaining setup steps. Complete each one to get the most out of Wekraft.

---

## Step 4 — Create Your First Project

1. Click **"New Project"** from the sidebar or the Projects tab
2. Enter a **Project Name** — a URL-safe slug is generated automatically (e.g., `my-app-a3x7k`)
3. Add an optional **Description**
4. Choose **Visibility**: `Public` (discoverable) or `Private` (invite-only)
5. Set the **Work Status**: Ideation, Validation, Development, Beta, Production, or Scaling
6. Click **Create Project**

You're now the project **owner** with full control.

### Project Limits by Plan

| Plan | Projects you can create | Projects you can join |
|---|---|---|
| Free | 2 | 2 |
| Plus | 10 | 10 |
| Pro | 20 | 20 |

---

## Step 5 — Connect GitHub (Optional)

If your project has a code repository:

1. On the main dashboard, click **"Connect Now"** on the Commits card (or go to the dashboard header)
2. Authorize Wekraft to access your GitHub account
3. Your GitHub username is synced automatically — commits, PRs, and merged PRs appear on the dashboard

Once connected, you can link specific repositories to individual projects for file browsing and issue importing. See [Projects → GitHub Integration](/web/docs/projects#github-integration) for setup instructions.

---

## Step 6 — Invite Your Team

1. Open your project by clicking on it from the dashboard
2. Click the **"Invite"** button in the project header
3. Copy and share the unique **invite link** with your teammates
4. When teammates click the link, they submit a **join request**
5. Accept their request from the **Join Requests** panel in Project Settings → Members

Team members are assigned the `member` role by default. Promote trusted collaborators to `admin` for expanded permissions.

### Member Limits by Plan

| Plan | Members per project |
|---|---|
| Free | 3 (including owner) |
| Plus | 5 (including owner) |
| Pro | 15 (including owner) |

---

## Step 7 — Create Tasks & Plan a Sprint

### Create Your First Task
1. Navigate to the **Tasks** tab in your project workspace
2. Click **"New Task"** (the button appears in the top-right)
3. Fill in the title, description, priority, assignees, date range, and optional tags
4. Save — the task appears in your backlog

> [!NOTE]
> If you're a `member` role and can't see the "New Task" button, the project owner needs to enable **"Members can create"** in Project Settings → Configuration.

### Plan Your First Sprint
1. Go to the **Sprints** tab
2. Click **"New Sprint"** — set a name, goal, and date range
3. Add tasks from the **Backlog** into your sprint
4. Click **"Start Sprint"** when ready

> [!IMPORTANT]
> Only one sprint can be active per project at a time. Complete the active sprint before starting a new one.

---

## Step 8 — Install the VS Code Extension

For the full developer experience:

1. Open VS Code → Extensions (`Ctrl+Shift+X`)
2. Search for **"Wekraft"** and click **Install**
3. Click the Wekraft icon in the Activity Bar
4. Click **"Login with Wekraft"** and authorize in your browser
5. Select your project — your assigned tasks appear in the sidebar

> [!NOTE]
> **Pro plan** required for full two-way sync (status updates, time tracking from IDE). Free and Plus users can view and browse tasks but cannot update status from the IDE.

---

## Step 9 — Set a Project Deadline (Optional)

From the **Project Workspace Dashboard**, you can set a target deadline for your project:

1. Click **"Set Deadline"** in the Track Your Project card
2. Pick a date — the progress bar tracks how much time has elapsed
3. Optionally configure **Alerts** at 25%, 50%, 75%, or 90% milestones to notify the owner and admins

This helps your team stay aware of the bigger timeline beyond individual sprints.

---

## What's Next?

You're all set! Here are the best places to go from here:

- [Understand the Dashboard →](/web/docs/dashboard)
- [Master Tasks →](/web/docs/tasks)
- [Track bugs with Issues →](/web/docs/issues)
- [Plan Sprints →](/web/docs/sprints)
- [Meet Kaya AI →](/web/docs/kaya-ai)
- [Learn Keyboard Shortcuts →](/web/docs/shortcuts)
- [Set up the VS Code Extension →](/web/docs/extension)
