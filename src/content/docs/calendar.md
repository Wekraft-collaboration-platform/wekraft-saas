# Calendar

The Wekraft Calendar gives your team a shared visual overview of project milestones, sprint timelines, and scheduled events. It helps everyone stay aware of the bigger picture — not just their individual task queue.

## Calendar Overview

The Calendar displays two types of entries:

| Type | Description |
|---|---|
| **Events** | Custom scheduled items — meetings, demos, retrospectives, deadlines |
| **Milestones** | Significant project checkpoints — feature freeze, beta launch, v1.0 release |

Tasks with due dates are also overlaid on the calendar automatically, giving you a unified view of all time-sensitive work.

---

## Creating a Calendar Entry

Click any day on the calendar to create a new entry, or use the **"+ New Event"** button.

| Field | Required | Description |
|---|---|---|
| **Title** | ✓ | Name of the event or milestone |
| **Description** | — | Additional context or agenda |
| **Type** | ✓ | `event` or `milestone` |
| **Start & End** | ✓ | Date and time range |
| **All Day** | — | Toggle for full-day events (hides time picker) |
| **Color** | — | A hex colour for visual distinction on the calendar grid |

---

## Calendar Views

The Calendar supports three display modes, accessible from the toolbar:

### Month View
A full-month grid showing all events and task due dates. Best for planning and spotting conflicts across the whole month. Click any event to see its details.

### Week View
A detailed week-by-week view showing events on a time grid. Useful for planning meetings and seeing how busy each day is.

### Day View
A single-day breakdown with hourly slots. Used when you need to schedule something precisely within a packed day.

---

## Task Integration

Tasks with `estimation.endDate` set automatically appear on the calendar as task events. The colour reflects the task's status:

| Status | Colour |
|---|---|
| `not started` | Grey |
| `inprogress` | Blue |
| `reviewing` | Purple |
| `testing` | Cyan |
| `completed` | Green |

This gives you a live picture of what's due when, without any extra data entry.

---

## Sprint Integration

When a sprint is created, its start and end dates appear as a shaded range on the calendar. You can see at a glance how many tasks fall within the sprint window and whether the workload is well-distributed or back-loaded.

---

## Managing Events

- **Edit**: Click any event and select **Edit** from the popup
- **Delete**: Click any event and select **Delete**
- **Drag to reschedule**: Drag an event to a new day to reschedule it instantly
- **Resize to extend**: Drag the bottom edge of an event to extend its duration (Week and Day views only)

---

## Team Coordination

All calendar entries are **shared across all project members**. Everyone on the project sees the same calendar. This makes it the single source of truth for:
- Sprint start and end dates
- Release dates and deadlines
- Team events (standups, retros, planning sessions)

---

## Next Steps

- [Manage project milestones with Sprints →](/web/docs/sprints)
- [View team workload with Heatmaps →](/web/docs/heatmaps)
- [Check your team's availability in Team Space →](/web/docs/team-space)
