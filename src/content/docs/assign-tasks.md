# Assign Tasks

Learn how to assign tasks, monitor team workloads, and manage task permissions.

---

## Where to Go & How to Go

### 1. Assigning Tasks to Team Members
- **Where to Go**: Open the task details side sheet from any task view (List, Board, or Table), and click the **"Edit Task"** button.
- **How to Go**:
  1. In the `EditTaskDialog` form, locate the **Assignees** section.
  2. The section displays a list of all team members currently joined to the project.
  3. Check the box next to one or more members to assign them to the task (multiple assignees are supported).
  4. Click **Save Changes** to write the assignees mapping to the database in real-time.

### 2. Monitoring Team Workload
- **Where to Go**: Navigate to the **Project Workspace Dashboard** (`/workspace`).
- **How to Go**:
  1. Open the **Advanced Charts** tab (requires Plus or Pro plan).
  2. Locate the **Member Workload Card**, which lists all team members and their active tasks, categorized by priority (`High`, `Medium`, `Low`).
  3. If a member is overloaded, navigate to the active task list, click **"Edit Task"**, and update the assignee checklist to re-distribute work.

---

## Workspace Roles & Task Actions

Actions on tasks are governed by project member roles:

| Access Role | Backlog Creation | Assign | Edit Task Details | Resolve/Complete |
|---|:---:|:---:|:---:|:---:|
| **Owner / Admin** | ✅ | ✅ | ✅ | ✅ |
| **Member** | ✅ | ✅ | ✅ | ✅ |
| **Viewer** | ❌ | ❌ | ❌ | ❌ |

- **Note on Config Settings**: The project owner can toggle member permissions inside the dashboard **Config** tab. If **"Member Task Creation"** is disabled, regular Members cannot create or edit tasks; their role becomes read-only.
- **Viewers**: Users with the Viewer role have read-only access to all task boards and details, and cannot perform mutations.
