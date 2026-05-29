# Notifications

Wekraft's notification system keeps you informed about everything happening across your projects — from task assignments to sprint completions — without requiring you to constantly check each project manually.

## How Notifications Work

Notifications are **real-time** and powered by Wekraft's live data sync. You never need to refresh the page — new notifications appear instantly as they're created.

Notifications appear in two places:

1. **Dashboard Stats Tab** — the notifications feed is embedded directly in the Stats tab on your main dashboard, showing all notifications with project context, event details, and timestamps
2. **Toast Popups** — new notifications appear as brief toast messages in the corner of your screen with a preview of the content

Each notification includes:

| Element | Description |
|---|---|
| **Sender avatar** | The profile photo of the person who triggered the event (or a type icon if system-generated) |
| **Project badge** | A small badge showing which project the event occurred in |
| **Event details** | What happened — displayed as formatted text |
| **Timestamp** | When the event occurred (shown as relative time: "5m ago", "2h ago", etc.) |
| **Click action** | Click any notification to navigate directly to the relevant item |

---

## Notification Events

Wekraft sends notifications for the following events:

### Project Activity

| Event | Triggered when... |
|---|---|
| **Join request** | Someone requests to join your project |
| **Request accepted** | Your join request is approved by an owner or admin |
| **Member joined** | A new member joins a project you're in |
| **Role changed** | Your role in a project is updated (e.g., promoted to admin) |

### Task & Issue Updates

| Event | Triggered when... |
|---|---|
| **Task assigned** | You are assigned to a task |
| **Task completed** | A task you're watching or assigned to is marked complete |
| **Issue escalated** | A task you're working on is blocked by a new issue |
| **Comment added** | Someone comments on a task or issue you're involved in |

### Sprint Events

| Event | Triggered when... |
|---|---|
| **Sprint started** | A sprint begins in a project you're a member of |
| **Sprint completed** | A sprint is finalized with completion stats |

### Project Alerts

| Event | Triggered when... |
|---|---|
| **Deadline alert** | Project duration passes a configured milestone (25%, 50%, 75%, or 90%) |

---

## Managing Notifications

### Mark as Read

- **Single notification**: Hover over a notification and click the **✓** (checkmark) icon that appears
- **Auto-mark on click**: Clicking a notification to navigate to the item automatically marks it as read

### Delete Notifications

- **Single notification**: Hover over a notification and click the **🗑** (trash) icon
- Deleted notifications are removed permanently and cannot be recovered

### Notification Count

The notification panel header shows a **total count** badge (e.g., "Total: 12"). Unread notifications are highlighted with a subtle background colour to distinguish them from read ones.

---

## Notification Behavior

### Real-Time Updates

Notifications are powered by Wekraft's real-time data sync:
- New notifications appear **instantly** without refreshing
- The notification count updates in real time
- Read/unread state syncs across all your open tabs

### Toast Notifications

When a new notification arrives while you're using Wekraft, a **toast popup** appears in the corner with:
- The sender's avatar or an event icon
- The project name (if applicable)
- A preview of the notification content

Click the toast to navigate directly to the relevant item. Toasts auto-dismiss after a few seconds.

### Navigation on Click

Every notification is clickable. Clicking a notification:
1. Marks it as read automatically
2. Navigates you to the relevant page (e.g., the project workspace, the sprint view, or the task detail)

> [!TIP]
> If you see a project badge on a notification, it tells you exactly which project the event belongs to — helpful when you're a member of multiple projects.

---

## Empty State

When you have no notifications, the dashboard shows an "All caught up!" message with a bell icon, letting you know there are no action items.

---

## Best Practices

- **Check the Stats tab daily** — the notification feed is front-and-centre on your dashboard, making it easy to stay on top of activity
- **Use the project badge** — notifications show which project they belong to, so you can quickly prioritize by project importance
- **Delete resolved notifications** — keep your feed clean by removing notifications you've already addressed
- **Act on join requests promptly** — team members waiting for access can't contribute until their request is accepted

---

## Next Steps

- [Navigate your dashboard →](/web/docs/dashboard)
- [Manage your tasks →](/web/docs/tasks)
- [Learn about sprints →](/web/docs/sprints)
- [Set up project alerts →](/web/docs/projects)
