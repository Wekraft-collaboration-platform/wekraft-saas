# Create Tasks

Learn how to create backlog tasks, configure priorities, estimate durations, and link files.

---

## Where to Go & How to Go

### 1. Creating a Task
- **Where to Go**: Navigate to **Manage → Tasks** inside your workspace (or go to `/workspace/tasks`).
- **How to Go**:
  1. Click the **"+ New Task"** button in the header of the page.
  2. In the task creation form, fill out the following properties:
     - **Title**: A description of the work item (required).
     - **Description**: Detailed requirements or notes (optional).
     - **Status**: The initial status (defaults to `not started`).
     - **Priority**: Dropdown of `none`, `low`, `medium`, or `high` (defaults to `none`).
     - **Duration**: Select the **Start Date** and **Target End Date** using the calendar popover. Note that the task duration must fit within the project timeline.
     - **Tag**: Select or create exactly **one tag** (e.g., Auth, Payment, Mobile) and configure its color from the palette.
     - **Codebase Link**: Search and select a repository path to link this task to a specific codebase file.
     - **Assignees**: Check the box next to any project members you want to assign to this task.
     - **Attachments**: Upload files or logs (Max size: **10MB**). Note: Uploads are disabled if the project owner is on the Free tier.
  3. Click **Create**.

### 2. Quick Task Inline Adding
- **Where to Go**: Go to the **List View** under **Manage → Tasks**.
- **How to Go**:
  1. Scroll to the bottom of any status section list.
  2. Click **"+ Add Task"** inline.
  3. Type the task title and press <kbd>Enterk</kbd>.
  4. The task is created with default values (status: `not started`, priority: `none`). You can click on the task row to open the details sheet and add dates, assignees, or details.

---

## Task Creation Fields Reference

| Field | Type | Description |
|---|---|---|
| **Title** | Text (Required) | Brief summary of the work item. |
| **Description** | Rich Text | Detailed specifications or checklist items. |
| **Status** | Select | `not started`, `inprogress`, `reviewing`, `testing`, `completed`. |
| **Priority** | Select | `none`, `low`, `medium`, `high`. Defaults to `none`. |
| **Duration** | Date Range | Start and Target End dates. Must be before the project's target deadline. |
| **Tag** | Object | exactly one label and color from a color palette. |
| **Codebase Link** | Dropdown | File selection picker linked to the Git repository. |
| **Assignees** | Checkbox list | Select multiple project collaborators. |
| **Attachments** | File Uploader | Upload supporting assets/logs (max 10MB per file; disabled on Free plan). |
