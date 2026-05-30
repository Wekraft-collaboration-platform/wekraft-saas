# Wekraft Overview

Welcome to **Wekraft** — the unified collaboration platform built for software teams who want to move fast without losing visibility. This documentation covers every feature, from creating your first project to advanced AI-driven sprint insights.

> [!TIP]
> **New to Wekraft?** Get up and running in under 5 minutes with our **[Getting Started Quick Start Guide](/web/docs/getting-started)**. It walks you through setting up a project, inviting your team, and launching your first sprint.

## What is Wekraft?

Wekraft bridges the gap between your **project management dashboard** and your **development environment**. Instead of context-switching between Linear, Jira, GitHub, and your IDE, Wekraft brings all of these into one coherent workflow.

At its core, Wekraft is:

- **A project management hub** — tasks, issues, sprints, calendars, and team spaces all in one place
- **A developer-first tool** — deep VS Code extension integration means you manage work without leaving your editor
- **An AI-powered platform** — Kaya PM Agent and Harry Dev Agent handle planning, code reviews, and automation
- **A real-time platform** — every change syncs instantly across all connected clients with zero page refreshes

## Core Concepts

Understanding these four concepts will help you navigate Wekraft quickly.

### Projects

A **Project** is the top-level container for all your work. Each project has its own tasks, issues, sprints, members, and settings. Projects can be public (discoverable by other users) or private. Each project gets a globally unique URL slug like `my-app-a3x7k`.

### Tasks

**Tasks** are the fundamental units of planned work. Every task has a status (`not started`, `inprogress`, `reviewing`, `testing`, `completed`), a priority level (`high`, `medium`, `low`), a date range, and can be assigned to one or more members. Tasks can be linked to a codebase path and grouped into sprints.

### Issues

**Issues** track unplanned or reactive work — bugs, production incidents, and enhancement requests. Issues have a severity (`critical`, `medium`, `low`) and an environment (`local`, `dev`, `staging`, `production`). They can originate from three sources: created manually, escalated from a blocked task, or imported directly from a linked GitHub repository.

### Sprints

**Sprints** are time-boxed work periods where your team commits to completing a defined set of tasks and issues. Sprints have three states: `planned`, `active`, and `completed`. Only one sprint can be active per project at any time. When a sprint completes, unfinished items are automatically moved back to the backlog.

---

## How Wekraft Works: End-to-End

Here is a typical workflow for a team using Wekraft:

1. **Create a project** and set its work status (ideation, validation, development, beta, production, or scaling).
2. **Connect a GitHub repository** to auto-import issues and track commits per task.
3. **Add team members** via an invite link or by sharing a join request URL. Assign roles: `owner`, `admin`, `member`, or `viewer`.
4. **Create tasks** and add them to a sprint backlog. Set priorities, due dates, and assignees.
5. **Plan a sprint** by moving tasks from the backlog into a sprint with a defined goal and date range.
6. **Start the sprint** — Wekraft locks the sprint composition and begins tracking burn rate.
7. **Install the VS Code extension** so developers can view, start, and complete tasks directly from their editor. Time is automatically logged.
8. **Monitor progress** through Heatmaps (member workload), the Calendar (milestones and events), and Kaya AI (predictive sprint analytics).
9. **Complete the sprint** — final stats are frozen, incomplete items return to the backlog, and you're ready for the next cycle.

---

## The Dashboard at a Glance

When you log in, the main dashboard shows three tabs:

| Tab | What it shows |
| --- | --- |
| **Stats** | GitHub metrics (commits, PRs, merged PRs), notification feed, upcoming deadlines, and upcoming events |
| **Projects** | A grid of all projects you own or have joined — click any to enter its workspace |
| **Discover** | Community projects — explore and collaborate with others worldwide |

The dashboard also displays a **Getting Started Checklist** for new users, guiding you through every key setup step with a progress tracker.

---

## AI Agents

Wekraft ships with two built-in AI agents, each with a distinct role:

### Kaya PM Agent

**Kaya** is your AI-native Product Manager. She possesses full context of your project — tasks, sprints, Git activity, and team workloads — and operates like a human PM at machine speed.

- Automated sprint planning from backlog
- Intelligent reporting & stakeholder summaries
- Backlog grooming, triage, and task creation
- Full workspace management (create screens, assign tasks)
- Team Space integration — mention **@Kaya** in chat and she replies like a teammate

Access Kaya via the AI Workspace tab, the floating chat bubble, or `Ctrl+K` / `Cmd+K`.

### Harry Dev Agent

**Harry** is your AI-native Dev Agent. He monitors your codebase, detects bugs, conducts autonomous web research, and acts as a vigilant guardian over your repository's health.

- Continuous codebase monitoring & indexing
- Proactive bug detection and root cause analysis
- AI-driven web research for unknown dependencies
- Code review with PR comments and fix suggestions
- Two modes: **Harry Fast** (quick answers) and **Harry Deep** (full codebase analysis)

> [!NOTE]
> Both Kaya and Harry are **Pro plan** features. Harry is currently under active development.

---

## Plans & Limits

Wekraft offers three plans:

| Feature | Free | Plus | Pro |
| --- | --- | --- | --- |
| Projects (owned) | 2 | 10 | 20 |
| Projects (joined) | 2 | 10 | 20 |
| Members per project | 3 | 5 | 15 |
| Kaya AI | — | — | 300 calls/mo |
| Harry Dev Agent | — | — | ✓ |
| VS Code Extension | Read-only | Read-only | Full Two-Way Sync |
| Advanced Analytics | — | ✓ | ✓ |
| Team Heatmaps | Limited | Limited | Full |
| Priority support | — | — | ✓ |

> [!NOTE]
> Free and Plus users can still use the VS Code extension for task viewing. Full two-way sync (completing tasks, logging time from the IDE) requires a Pro plan.

---

## Key Integrations

### GitHub

Link a repository to your project to automatically sync GitHub Issues as Wekraft Issues. Commits and pull requests are visible in the task timeline, giving full traceability from task to code. The dashboard also pulls your GitHub contribution stats (total commits, pull requests, and merged PRs) for the past year.

### VS Code Extension

The Wekraft extension for VS Code is available in the [VS Code Marketplace](https://marketplace.visualstudio.com). After a one-click authentication handshake, your assigned tasks appear directly in your editor sidebar. See the [VS Code Extension guide](/web/docs/extension) for setup instructions.

### Team Meet

**Team Meet** lets your team collaborate in real-time through video call rooms built directly into the platform — no external tools needed. Start a call from the Team Space and bring your whole team together instantly.

---

## Next Steps

- [Quick Start Guide →](/web/docs/getting-started)
- [Install the VS Code Extension →](/web/docs/extension)
- [Create your first project →](/web/docs/projects)
- [Plan your first sprint →](/web/docs/sprints)
- [Meet Kaya PM Agent →](/web/docs/kaya-pm)
- [Meet Harry Dev Agent →](/web/docs/harry-dev)
- [Explore keyboard shortcuts →](/web/docs/shortcuts)
