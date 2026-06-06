# Tasks & Backlog

Tasks in Wekraft are the primary planning units used to organize product backlogs, map engineering work, and execute sprint goals. This document provides a detailed reference of task properties, lifecycles, and database integration rules.

---

## Task Schema & Properties

Every task document in the datastore contains the following attributes:

- **Title (`title`)**: String representing the work description.
- **Description (`description`)**: Optional text content detailing requirements or checklist items.
- **Priority (`priority`)**: Urgent classifications set as `high`, `medium`, or `low`.
- **Status (`status`)**: The workflow state representing the phase of execution (see Lifecycle).
- **Estimation (`estimation`)**: Object containing unix timestamps in milliseconds representing the planned window:
  - `startDate`: Simple timestamp when work should begin.
  - `endDate`: Target delivery timestamp.
- **Is Blocked (`isBlocked`)**: A boolean flag indicating whether the task is blocked by an open issue. While blocked, status updates are restricted.
- **Codebase Link (`linkWithCodebase`)**: Optional relative path to a repository file (e.g., `src/components/Button.tsx`).
- **Sprint Association (`sprintId`)**: Optional reference pointing to a time-boxed sprint. Unassigned tasks reside in the Project Backlog pool.
- **Attachments (`attachments`)**: Optional array of uploaded assets. Each asset records a name, URL, and size in bytes.

---

## Task Workflow & Lifecycle

Tasks move through a standard linear state machine. Status updates trigger automatic database recalculations, including developer workloads and active sprint burn rates.

```mermaid
stateDiagram-v2
    [*] --> NotStarted : Task Created
    NotStarted --> InProgress : Work Begins
    InProgress --> Reviewing : PR Created / Under Review
    Reviewing --> Testing : Deployed to QA / Staging
    Testing --> Completed : Verified & Done
    Completed --> [*]
```

1. **Not Started (`not started`)**: Task is parked in the backlog or active sprint.
2. **In Progress (`inprogress`)**: A developer has accepted the task and is actively writing code.
3. **Reviewing (`reviewing`)**: Development is complete; work is awaiting pull request approval or peer reviews.
4. **Testing (`testing`)**: The feature has been built and is undergoing validation on dev or staging builds.
5. **Completed (`completed`)**: The task is fully delivered. Marking completion sets the completion timestamp and logs the resolver's user ID.

---

## Workspace Layout Views

Wekraft renders the active sprint board and project backlog across three distinct layouts:

- **List View**: A dense spreadsheet-style table. Designed for project managers to quickly scan, bulk-edit priority labels, edit dates, and drag items directly into active sprints.
- **Board View (Kanban)**: A column-based visual layout mapped to task status. Team members can drag-and-drop cards between columns to mutate task status instantly. Dragging cards triggers real-time backend mutations that update all viewing clients.
- **Table View**: A structured grid view designed to display assignees, estimation dates, and codebase links side-by-side.

---

## Codebase Linking & Editor Integration

If a task contains a `linkWithCodebase` filepath, developers can navigate directly from the browser dashboard to the exact line of code in their editor:

1. **Focus Click**: Inside the Kanban card or the Table row, click the codebase link/icon.
2. **Handshake Verification**: The browser verifies the active API key through the local editor extension handshake.
3. **Editor Focus**: The local code editor receives the file focus command and automatically opens the file from the workspace root, matching the relative path.

---

## Blocking & Task-Issue Escalation

When a task encounters an unexpected barrier (such as a dependency block or critical bug), developers can escalate the task:

- **Trigger**: Click the **"Escalate to Issue"** action on the task details sheet.
- **Behavior**: This initiates a blockage escalation mutation. It sets `isBlocked` to `true` on the task and inserts a new incident in the issues database linked back to the task.
- **Resolution**: The task is locked in a read-only state. Once the linked issue is fixed and marked as `closed`, a database mutation automatically resets `isBlocked` to `false`, freeing the task for completion.

---

## Database API Reference (Developer Guide)

For editor extension sync and custom automations, tasks are managed via the following backend API endpoints:

### Create Task
Creates a task and records assignees in the task assignees join table.
```typescript
args: {
  projectId: Id,
  title: string,
  description?: string,
  status?: "not started" | "inprogress" | "reviewing" | "testing" | "completed",
  priority?: "high" | "medium" | "low",
  sprintId?: Id,
  estimation?: { startDate: number, endDate: number },
  linkWithCodebase?: string,
  assigneeIds?: Array<Id>,
  userId: Id
}
```

### Update Task
Updates fields and automatically syncs the task assignees join table.
```typescript
args: {
  taskId: Id,
  title?: string,
  description?: string,
  status?: string,
  priority?: string,
  estimation?: any,
  linkWithCodebase?: string,
  assigneeIds?: Array<Id>,
  isBlocked?: boolean,
  sprintId?: Id,
  userId: Id
}
```

### Delete Task
Deletes the task and performs cascading deletions on related comments, assignees, and linked blocking issues.
```typescript
args: {
  taskId: Id,
  userId: Id
}
```
