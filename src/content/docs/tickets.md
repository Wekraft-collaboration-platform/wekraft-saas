# Tickets

The **Tickets** system in Wekraft provides a full-lifecycle support ticket workflow for managing client-facing requests, internal escalations, and service-level commitments. Tickets live inside the **Customer Desk** and are tightly coupled to your project's tasks and issues.

> **Tip** — Tickets are distinct from internal **Issues**. Issues track engineering bugs; Tickets track client-reported problems and service requests.

---

## Creating a Ticket

### From the Customer Desk
1. Go to **Project Workspace → Customer Desk**.
2. Click **+ New Ticket** in the top-right corner.
3. Fill in the required fields:
   - **Title** — a concise, descriptive summary of the request.
   - **Category** — Bug Report, Feature Request, Account / Billing, Integration, or General Inquiry.
   - **Priority** — Critical, High, Medium, or Low.
   - **Description** — detailed description including steps to reproduce (for bugs) or expected outcome (for requests).
   - **Requester** — select the client contact or enter their email.
4. Optionally, **link to a task or issue** in the same project.
5. Click **Create Ticket**.

### From the IDE Extension
Team members can also create tickets directly from the Wekraft **IDE Extension**:
1. Open the Wekraft panel in your editor.
2. Navigate to **Customer Desk → Tickets**.
3. Click **+ New** and fill in the form inline.

### Via Client Portal (Coming Soon)
Clients will be able to submit tickets directly through a branded self-service portal. Submitted tickets land instantly in your Customer Desk inbox.

---

## Ticket Fields

| Field         | Description                                                        | Required |
|---------------|--------------------------------------------------------------------|----------|
| Title         | Short summary of the request (max 120 characters)                 | ✅       |
| Category      | Type of issue (bug, feature, billing, integration, inquiry)       | ✅       |
| Priority      | Critical / High / Medium / Low                                    | ✅       |
| Description   | Full description with context, steps, or expected behavior        | ✅       |
| Requester     | Client contact name and email                                     | ✅       |
| Assignee      | Team member responsible for resolving the ticket                  | ❌       |
| Linked Task   | Internal task or issue this ticket relates to                     | ❌       |
| Tags          | Custom labels for grouping and filtering                          | ❌       |
| Attachments   | Screenshots, logs, or supporting files (max 20 MB each)          | ❌       |
| Due Date      | Optional hard deadline beyond the SLA target                     | ❌       |

---

## Assigning & Prioritizing Tickets

### Manual Assignment
- Open the ticket and click **Assign** in the top panel.
- Select any project member with at minimum **Member** role.
- Assigned team members receive an in-app notification and an email alert.

### AI-Assisted Triage (Pro)
When **Harry Dev** is enabled:
- Incoming tickets are automatically scanned and classified by category and severity.
- Suggested assignees are surfaced based on the team member's expertise and current workload.
- Accept or override the suggestion with one click.

### Priority Levels

| Priority   | Color  | Use When                                                        |
|------------|--------|-----------------------------------------------------------------|
| 🔴 Critical | Red    | Production outage, data loss, or security incident affecting clients |
| 🟠 High     | Orange | Major feature broken, significant client workflow blocked       |
| 🟡 Medium   | Yellow | Important bug with a workaround available                      |
| 🔵 Low      | Blue   | Minor issue, cosmetic bug, or low-urgency inquiry              |

---

## Responding to a Ticket

1. Open the ticket from the **Customer Desk** inbox or list view.
2. In the **Response Thread** panel on the right:
   - Type your reply in the composer.
   - Toggle **Internal Note** to make the message visible to your team only (not the client).
   - Attach files or paste links as needed.
3. Click **Send Reply** — the client receives an email notification with your response.

### Response Templates
Frequently used replies can be saved as **Response Templates**:
- Go to **Project Settings → Customer Desk → Templates**.
- Click **+ New Template**, name it, and write the body.
- In any ticket response, click **Use Template** to insert it instantly.

---

## Escalating a Ticket

When a ticket requires engineering work, escalate it to an internal task or issue:

1. Open the ticket and click **Escalate → Link to Task / Issue**.
2. Select an existing task/issue or click **Create New** to generate one automatically.
3. The linked item appears in the ticket panel; any status changes to the task sync back to the ticket.

---

## Resolving & Closing Tickets

### Resolving
- Set the ticket status to **Resolved** once the fix or response has been delivered.
- Clients receive an automatic notification with a satisfaction rating prompt.
- The SLA clock stops when a ticket is marked Resolved.

### Closing
- **Auto-close**: Resolved tickets are automatically closed after **5 business days** with no client response (configurable in Project Settings).
- **Manual close**: Click **Close Ticket** at any time after resolution.
- Closed tickets are read-only but remain searchable in the **Ticket Archive**.

### Reopening
- Clients can reply to a resolved ticket to reopen it.
- Team members can also manually reopen a closed ticket via **Actions → Reopen**.
- Reopened tickets restart the SLA timer from the moment they are reopened.

---

## Filtering & Searching Tickets

Use the **Customer Desk** list view filters to slice your ticket queue:

| Filter         | Options                                                            |
|----------------|--------------------------------------------------------------------|
| **Status**     | All, Submitted, Triaged, In Progress, Pending Client, Resolved, Closed |
| **Priority**   | Critical, High, Medium, Low                                       |
| **Category**   | Bug, Feature, Billing, Integration, Inquiry                      |
| **Assignee**   | Any team member or Unassigned                                    |
| **SLA Status** | On Track, At Risk, Breached                                      |
| **Date Range** | Created, Updated, or Due date range picker                       |

Use the **Search bar** at the top to find tickets by title, description, or requester name.

---

## Ticket Metrics & Reporting

Track your team's support performance from **Project Dashboard → Customer Desk Stats**:

- **Average First Response Time** — how quickly your team responds to new tickets.
- **Average Resolution Time** — how long it takes to fully resolve tickets.
- **SLA Compliance Rate** — percentage of tickets resolved within SLA targets.
- **Tickets by Category** — breakdown of ticket types over a date range.
- **Open vs Closed Trend** — volume chart of incoming vs resolved tickets over time.

---

## Notifications

| Event                         | Who is Notified             | Channel         |
|-------------------------------|-----------------------------|-----------------|
| New ticket created            | Assigned team member        | In-app + Email  |
| Ticket reply from client      | Assigned team member        | In-app + Email  |
| SLA breach imminent (1 hr)    | Assigned member + Admins    | In-app          |
| Ticket resolved               | Requester (client)          | Email           |
| Ticket reopened               | Assigned member             | In-app + Email  |

---

## Related Pages
- [Customer Desk Overview](/web/docs/customer-desk) — full desk setup and permissions.
- [Issues & Bug Tracking](/web/docs/issues) — managing internal engineering issues.
- [Help & Support](/web/docs/support) — for Wekraft platform support queries.
