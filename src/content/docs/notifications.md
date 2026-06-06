# Notifications & Alerts

WeKraft's real-time notification system keeps you informed of critical events across your projects — from access requests to comment mentions — fanned out instantly without requiring manual page refreshes.

---

## How Notifications Work

Notifications are **real-time** and powered by Convex-native subscriptions. They are fanned out to recipients immediately upon occurrence and rendered in two areas:

1. **Dashboard Stats Tab** — The main notifications feed is embedded directly in the dashboard Stats tab, sorted by creation date.
2. **Toast Popups** — A floating toast alert pops up briefly at the bottom of your viewport with the sender's avatar, project name, relative timestamp, and body snippet.

Each notification row contains:

| Element | Description |
| :--- | :--- |
| **Sender Avatar** | Avatar of the user who performed the action (or a system icon if system-generated). |
| **Project Badge** | The source project name badge (linked directly to the project dashboard). |
| **Notification Body** | Descriptive text explaining the trigger. |
| **Timestamp** | Relative timestamp (e.g., "5m ago", "3h ago"). |
| **Interactive Action** | Clicking a notification marks it as read and deep-links to the target resource. |

---

## Core Notification Events

The backend tracks exactly ten (10) notification types for various user and system actions:

### Project Access & Requests

| Event Type | Triggered When... | Recipients |
| :--- | :--- | :--- |
| **Join Request** | A user requests to join your project. | Project Owner & Admins |
| **Request Approved** | Your join request is accepted by an administrator. | The requesting user |
| **Request Declined** | Your join request is declined. | The requesting user |

### Project Member Changes

| Event Type | Triggered When... | Recipients |
| :--- | :--- | :--- |
| **Member Joined** | A new member joins the project (either via request acceptance or direct link). | All Owner/Admin members |
| **Member Left** | A user leaves the project workspace. | All Owner/Admin members |
| **Member Removed** | An owner/admin removes a user from the team grid. | The removed user only |
| **Role Changed** | An owner or admin updates a member's workspace role. | The affected user only |

### Collaboration & Mentions

| Event Type | Triggered When... | Recipients |
| :--- | :--- | :--- |
| **User Mentioned** | Another team member tags you using `@username` in task comments, issue comments, or Teamspace channel messages. | The tagged user(s) (excludes self-mentions) |

### System Alerts & Meets

| Event Type | Triggered When... | Recipients |
| :--- | :--- | :--- |
| **Project Alert** | Project timeline reaches duration milestones (25%, 50%, 75%, or 90% target date). | All project members |
| **Meeting Started** | A team video meet is launched (initiating a Stream room). | All project members (except the host) |

---

## Managing Notifications

### Read State Management

- **Single Read**: Click the checkmark icon (**✓**) on hover, or click the notification item body to navigate to the target task/room and mark it as read.
- **Mark All Read**: Click **"Mark all as read"** at the top of the feed to bulk-update all unread notifications.

### Deletion & Cleanup

- **Individual Delete**: Hover over any notification and click the trash icon (**🗑**).
- **Clear All**: Click the **"Clear all"** button in the header to purge all notifications.
- **Automatic Cron Cleanup**: WeKraft schedules a nightly database cron cleanup (`cleanup-old-notifications`) that deletes all notifications older than **30 days** to maintain index performance.

---

## Next Steps

- [Manage team roles and access →](/web/docs/manage-teams)
- [Review security permissions →](/web/docs/security)
- [Start a video conference in Team Meet →](/web/docs/team-meet)
- [Track projects on the Workspace Dashboard →](/web/docs/project-workspace)
- [Learn about the Referral Program →](/web/docs/referrals)
