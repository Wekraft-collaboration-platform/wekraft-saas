# Dashboard & Navigation

The WeKraft Dashboard is your command center — the first screen you see after logging in. It gives you a bird's-eye view of all your projects, repository activity, notifications, and quick access to every feature.

## Main Dashboard

When you log in, the dashboard is divided into two sections: a **main content area** on the left and a collapsible **right sidebar**.

### Metric Cards

At the top of the dashboard, three metric cards give you a snapshot of your activity:

| Card | What it shows |
|---|---|
| **Commits** | Your total repository commits from the past year. Click "Connect Now" if your version control account isn't linked yet. |
| **Pull Requests / Merged PRs** | Total pull requests and how many have been merged — split into two columns. |
| **Projects Created / Joined** | How many projects you own vs. how many you've joined, with plan limits shown (e.g., `2/20`). |

> [!TIP]
> If you see `....` in the PR cards, it means your code hosting account isn't connected yet. Click the "Connect Now" button on the Commits card to link your account.

### Dashboard Tabs

Below the metric cards, you'll find three tabs:

| Tab | Description |
|---|---|
| **Stats** | Getting Started Checklist (for new users), notifications feed, upcoming deadlines, and upcoming calendar events |
| **Projects** | A grid of all your projects (owned + joined) with status, visibility, and member count |
| **Discover** | Community exploration — find public projects and collaborate |

### Getting Started Checklist

New users see a **Getting Started Checklist** at the top of the Stats tab. It tracks your progress through key setup steps. Complete all steps to unlock the full experience.

Once completed, the checklist is replaced by the **Notifications** panel.

---

## The App Sidebar

The left sidebar is your primary navigation tool. It is present on every dashboard screen.

### Sidebar Sections

| Section | What it contains |
|---|---|
| **Logo & Home** | Click the logo to return to the dashboard |
| **Projects List** | All your projects — click any to open its workspace |
| **Quick Actions** | New Project, Join Project shortcuts |
| **User Menu** | Profile, Code Repositories, Documentation, Log out |

### Collapsing the Sidebar

Press `Ctrl+B` (or `Cmd+B` on Mac) to toggle sidebar visibility. This gives you more screen real estate when working on tasks.

---

## The Right Sidebar

The right side of the dashboard has a collapsible panel that you can expand or collapse. It provides quick access to account details, shortcuts, and the **Referral Dialog**, where you can view your unique referral code, track your progress, and earn rewards for inviting users.

---

## The Project Workspace

When you click a project from the dashboard, you enter the **Project Workspace** — a dedicated environment with its own sidebar and navigation.

### Project Workspace Dashboard

The workspace dashboard is the first view when you enter a project. It shows:

| Section | Description |
|---|---|
| **Track Your Project** | Project deadline progress bar with days remaining, alert milestones (25%, 50%, 75%, 90%), and date info |
| **Activity Overview** | Live counts of total tasks, active issues, and recent activity |
| **Task Status** | Pie chart showing task distribution by status (not started, in progress, reviewing, testing, completed) |

Below these cards, two sub-tabs provide deeper configurations and analytics:

| Sub-Tab | Description |
|---|---|
| **Advanced Charts** | Team contribution radar, sprint bar chart, severity heatmap, weekly velocity, member workload, and weekly engagement (Plus/Pro only) |
| **Config** | Project configuration settings (owner only) |

> [!NOTE]
> Advanced charts require a **Plus or Pro** plan. Free plan users see a prompt to upgrade.

### Workspace Header Tools
When inside any workspace view, the header includes a "View More" toggle that gives access to:
- **Home**: Link to return to the project homepage.
- **My Work**: Opens the **My Work Side Sheet** from the right, listing tasks and issues assigned to you.
- **Team Meet**: Launches the project's real-time video calling space.

### Project Sidebar

The project sidebar provides access to all project features:

| Tab | Description |
|---|---|
| **Dashboard** | Project overview with analytics, deadline tracking, and team insights |
| **Tasks** | All project tasks in List, Board (Kanban), or Table view |
| **Issues** | Bug tracking and incident management |
| **Sprints** | Sprint planning, active sprint monitoring, and history |
| **Calendar** | Shared calendar with events, milestones, and task due dates |
| **Time Logs** | Time tracking records for all project members |
| **Team Space** | View all team members, their roles, and current workload |
| **Heatmaps** | AI-powered workload analysis and activity trends |
| **AI Workspace** | AI assistant for reports, planning, and insights (Pro) |
| **Code** | File explorer — browse your repository directly |

---

## Breadcrumb Navigation

At the top of every workspace page, breadcrumbs show your current location:

```
Dashboard → My Projects → Project Name → Tasks
```

Click any breadcrumb segment to jump back to that level. This makes deep navigation fast and intuitive.

---

## User Menu

Click your avatar in the sidebar footer to access:

- **Profile** — view and edit your profile on the My Profile page
- **Repositories** — quick link to your connected code repository accounts
- **Documentation** — opens this documentation site
- **Log Out** — sign out of your account

---

## Notifications

The **bell icon** in the dashboard shows your notification count in the Stats tab. WeKraft sends notifications for:

- Join requests on your projects
- Task assignments and status changes
- Sprint start and completion events
- Issue escalations and comments
- Team member activity

Click any notification to navigate directly to the relevant item. Hover over a notification to reveal **Mark as read** (✓) and **Delete** (🗑) actions.

> [!TIP]
> For more details, see the [Notifications guide →](/web/docs/notifications)
