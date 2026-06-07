# Edit Tasks

Modify task properties, update progress statuses, link codebase paths.

---

## Where to Go & How to Go

### 1. Kanban Status Transitions (Board View)
- **Where to Go**: Navigate to **Manage → Tasks** and select the **Board View** tab.
- **How to Go**:
  1. Hover over a task card and drag it between status columns (`Not Started`, `In Progress`, `Reviewing`, `Testing`, `Completed`).
  2. **Status Change Constraint (Block Lock)**: If a task has been flagged as blocked (`isBlocked === true`), attempting to transition it to `Completed` will be rejected by the UI, showing the warning toast:
     > **"task is marked as blocked , kindly fix that"**
  3. You must resolve the blocking issue before marking the task complete.

### 2. Task Details Sheet (Read-Only & Escalation)
- **Where to Go**: Click on any task card or row in the List, Board, or Table views.
- **How to Go**:
  1. A detailed workspace sheet (`TaskDetailSheet.tsx`) will slide open from the right.
  2. This sheet is primarily **read-only** for task parameters, but allows you to:
     - View title, description, dates, priority, codebase link, and assignees.
     - View, add, and download attachments (max 10MB per file; disabled on Free plan).
     - Add team comments and mentions in the comment feed.
     - **Escalate Blockages**: Click **"Mark as Issue"** to flag the task as blocked. This sets `isBlocked` to `true`, creates a linked issue, and automatically copies over all task assignees.

### 3. Detailed Parameter Editing (Edit Task Dialog)
- **Where to Go**: Open the task details side sheet.
- **How to Go**:
  1. Click the **"Edit Task"** button at the top of the side sheet.
  2. The `EditTaskDialog.tsx` modal will open.
  3. Here, project members can make full edits: modify the **Title**, **Description**, **Priority**, **Duration** (Start/End dates), **Tag**, **Codebase Link**, and modify the **Assignee Checklist**.
  4. Click **Save Changes**.

---

## Task Views Comparison

- **List View**: Structured by status sections. Best for quick inline task additions and overview scanning.
- **Board View**: Visual Kanban board. Best for tracking daily progress.
- **Table View**: Spreadsheet-like grid. Allows sorting by priority, tag, status, and dates.
