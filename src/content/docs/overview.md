# Wekraft Overview

Welcome to **Wekraft** — the unified collaboration platform built for software teams who want to move fast without losing visibility. This documentation covers every feature, from creating your first project to advanced AI-driven sprint insights.

## What is Wekraft?

Wekraft bridges the gap between your **project management dashboard** and your **development environment**. Instead of context-switching between Linear, Jira, GitHub, and your IDE, Wekraft brings all of these into one coherent workflow.

At its core, Wekraft is:

- **A project management hub** — tasks, issues, sprints, calendars, and team spaces all in one place
- **A developer-first tool** — deep VS Code extension integration means you manage work without leaving your editor
- **An AI-powered assistant** — Kaya, the built-in AI, plans sprints, analyzes workloads, and generates daily standups automatically

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

## Plans & Limits

Wekraft offers three plans:

| Feature | Free | Plus | Pro |
|---|---|---|---|
| Projects (owned) | 2 | 3 | 10 |
| Projects (joined) | 2 | 5 | Unlimited |
| Members per project | 3 | 5 | 15 |
| Kaya AI | — | — | 50 calls/mo |
| VS Code Extension | Limited | Limited | Full |
| Team Heatmaps | Limited | Limited | Full |
| Priority support | — | — | ✓ |

> **Note:** Free and Plus users can still use the VS Code extension for task viewing. Full two-way sync (completing tasks, logging time from the IDE) requires a Pro plan.

---

## Key Integrations

### GitHub
Link a repository to your project to automatically sync GitHub Issues as Wekraft Issues. Commits and pull requests are visible in the task timeline, giving full traceability from task to code.

### VS Code Extension
The Wekraft extension for VS Code is available in the [VS Code Marketplace](https://marketplace.visualstudio.com). After a one-click authentication handshake, your assigned tasks appear directly in your editor sidebar.

### Kaya AI (PM Agent)
Kaya is Wekraft's built-in AI agent available to Pro users. It can plan and create sprints from your backlog, analyze team workloads, generate daily standup reports, and predict sprint completion risks — all without leaving the dashboard.

---

## Next Steps

- [Install the VS Code Extension →](/web/docs/extension)
- [Create your first project →](/web/docs/projects)
- [Plan your first sprint →](/web/docs/sprints)
