# Project Calendar

The WeKraft Calendar provides a shared timeline of events, scheduled milestones, task deadlines, and sprint scopes across the entire project space.

---

## Calendar Event Properties

Every calendar entry has the following properties:

- **Title**: The display name of the event or milestone checkpoint.
- **Description** *(optional)*: Additional context or agenda details.
- **Event Type**:
  - Event: Standard meetings, daily standups, or retrospective sessions.
  - Milestone: Critical checkpoints like release freezes, beta releases, or customer deliveries.
- **All Day Option**: Toggles absolute day views, disabling the hour/minute selection.
- **Duration**: The time range representing when the event occurs.
- **Color Overlay**: Custom color for visual grouping on the calendar grid.

---

## Workspace Integrations

WeKraft merges calendar records with project boards to compile a single dashboard view:

### 1. Task Deadline Overlays
Any active task with an `estimation.endDate` is automatically plotted on the calendar grid. The visual color corresponds to the task's state:
- **Grey**: `not started`
- **Blue**: `inprogress`
- **Purple**: `reviewing`
- **Cyan**: `testing`
- **Green**: `completed`

### 2. Sprint Timeline Blocks
Active and planned sprints display as shaded horizontal bars covering their duration (`duration.startDate` -> `duration.endDate`), making it easy to spot sprint overlaps.

---

## Next Steps

- Track tasks with [Tasks & Backlog](/web/docs/tasks).
- Organize periods in [Sprints & Planning](/web/docs/sprints).
- View delivery targets in the [Project Delivery Timeline & Gantt Chart](/web/docs/time-logs).
