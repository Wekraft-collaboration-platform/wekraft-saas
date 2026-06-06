# Customer Desk

The **WeKraft Customer Desk** is a centralized hub for managing all inbound customer requests, service tickets, and client support workflows — directly inside your project workspace. It bridges the gap between your development team and your clients, ensuring no request falls through the cracks.

> **Available on Plus & Pro Plans** — The Customer Desk is available to Plus and Pro plan users. Free plan users can view desk tickets but cannot create or manage them.

---

## What Is the Customer Desk?

The Customer Desk is WeKraft's built-in service management layer, purpose-built for software teams that manage client-facing work alongside their internal development sprints. It gives you:

- A **unified inbox** for all client-submitted requests and bug reports.
- A **ticket lifecycle system** with configurable statuses and SLA tracking.
- **Two-way visibility** — your team sees tickets linked to tasks and issues; clients see real-time status updates.
- **AI-assisted triage** — Harry Dev can automatically classify and assign incoming tickets based on severity and category.

---

## Key Features

### 📥 Unified Request Inbox
- All incoming customer requests land in a single, filterable inbox.
- Requests can be submitted by clients via the **client-facing portal**, email integration, or directly by team members.
- Duplicate detection flags similar requests to avoid redundant tickets.

### 🏷️ Ticket Categorization
Tickets are organized by category to speed up routing:
- **Bug Report** — functionality not working as expected.
- **Feature Request** — new capability or enhancement request.
- **Account / Billing** — subscription, invoice, or access issues.
- **Integration** — issues with connected tools (GitHub, Slack, etc.).
- **General Inquiry** — questions or clarifications.

### 📊 SLA Tracking
Each ticket is assigned a **Service Level Agreement (SLA)** target based on its priority:

| Priority  | First Response SLA | Resolution SLA |
|-----------|--------------------|----------------|
| Critical  | 1 hour             | 4 hours        |
| High      | 4 hours            | 24 hours       |
| Medium    | 8 hours            | 72 hours       |
| Low       | 24 hours           | 7 days         |

SLA timers are visible on each ticket card and turn red when approaching breach.

### 🔗 Linked to Tasks & Issues
- Any ticket can be escalated and **linked to an internal task or issue** with one click.
- When the linked task or issue is resolved, the ticket status automatically updates.
- Developers can see which open tickets are related to a file or feature they are working on.

### 💬 Client Communication Thread
Each ticket includes a **threaded response panel**:
- Respond directly to the client from within WeKraft — no need to switch to email.
- Attach screenshots, log excerpts, or documentation links.
- Internal notes (visible only to your team) can be added alongside client-visible replies.

### 📡 Real-Time Status Notifications
- Clients receive automatic email notifications when their ticket status changes.
- Your team is alerted in-app when a critical ticket is submitted or a SLA breach is imminent.

---

## Ticket Lifecycle

```
Submitted → Triaged → In Progress → Pending Client → Resolved → Closed
```

| Status             | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| **Submitted**      | Ticket has been created and is awaiting triage.                             |
| **Triaged**        | Ticket has been reviewed, categorized, and assigned to a team member.       |
| **In Progress**    | Active work is underway to resolve the ticket.                              |
| **Pending Client** | WeKraft team is waiting for additional information from the client.         |
| **Resolved**       | The issue has been fixed or the request has been fulfilled.                 |
| **Closed**         | The ticket has been acknowledged as resolved by the client or auto-closed.  |

---

## Accessing the Customer Desk

1. Navigate to your **Project Workspace** from the sidebar.
2. Select **Customer Desk** from the workspace navigation.
3. Use the **Inbox**, **All Tickets**, or **My Assigned** tabs to filter your view.
4. Click any ticket to open the full detail panel with the response thread.

---

## Permissions

| Role        | View Tickets | Create Tickets | Respond | Close/Resolve | Manage SLA |
|-------------|:------------:|:--------------:|:-------:|:-------------:|:----------:|
| Owner       | ✅           | ✅             | ✅      | ✅            | ✅         |
| Admin       | ✅           | ✅             | ✅      | ✅            | ✅         |
| Member      | ✅           | ✅             | ✅      | ✅            | ❌         |
| Viewer      | ✅           | ❌             | ❌      | ❌            | ❌         |

---

## Related Pages
- [Tickets](/web/docs/tickets) — full guide to creating and resolving tickets.
- [Issues & Bug Tracking](/web/docs/issues) — for internal engineering bugs.
- [Help & Support](/web/docs/support) — for WeKraft platform support queries.
