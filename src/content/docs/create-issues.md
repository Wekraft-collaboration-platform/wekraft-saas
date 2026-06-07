# Create Issues

Learn how to log bugs and issues in WeKraft manually, via task blockage escalation, or by importing them from GitHub.

---

## Where to Go & How to Go

### 1. Manual Issue Creation
- **Where to Go**: Navigate to **Manage → Issues** in the left sidebar (or go to `/workspace/issues`).
- **How to Go**:
  1. Click the **"+ New Issue"** button in the header of the page.
  2. A creation dialog modal will appear.
  3. Fill in the required fields:
     - **Title**: Brief summary of the bug/incident (required).
     - **Description**: Technical details or steps to reproduce (optional).
     - **Severity**: Choose `low`, `medium`, or `critical` (defaults to `medium`).
     - **Impact Environment**: Choose `local`, `dev`, `staging`, or `production` (defaults to `local`).
     - **Due Date**: Select the target resolution deadline using the calendar popover.
     - **File Linked**: Enter the file path pointing to the buggy component.
     - **Assignees**: Check the box next to any project members you want to assign to this issue.
     - **Attachments**: Upload screenshots or logs (max 10MB; disabled if owner is on Free tier).
  4. Click **Create**.

### 2. Task Blockage Escalation (Mark as Issue)
- **Where to Go**: Open any active task in **Manage → Tasks** to open its details side sheet.
- **How to Go**:
  1. Inside the task details side sheet, locate and click the **"Mark as Issue"** button in the header.
  2. The system will set the task's `isBlocked` property to `true` (blocking it from being completed on the Kanban board).
  3. A linked issue of type `task-issue` is automatically created.
  4. **Assignee Inheritance**: The newly created issue automatically inherits all developers assigned to the blocked task.

### 3. GitHub Issue Import
- **Where to Go**: Navigate to the **Manage → Issues** page and select the **"Github Issue"** tab.
- **How to Go**:
  1. Ensure your project's GitHub repository is connected.
  2. Click the **"Import from Github"** button.
  3. A dialog listing open issues from your GitHub repository will appear.
  4. Click on the issues you want to import.
  5. The selected issues are imported into the WeKraft database as type `github` and are linked to their source URLs.
  6. *Note: There is no automatic webhook sync; issues must be imported manually.*

---

## Issue Creation Fields Reference

| Field | Type | Description |
|---|---|---|
| **Title** | Text (Required) | High-level summary of the bug (e.g. "Checkout page returns 500 error"). |
| **Description** | Rich Text | Steps to reproduce, specs, or logs. |
| **Impact Environment** | Dropdown | `local`, `dev`, `staging`, or `production`. |
| **Severity** | Dropdown | `low`, `medium`, `critical`. |
| **Due Date** | Date | Target resolution date. |
| **File Linked** | Text | Relative codebase path (e.g., `src/components/Button.tsx`). |
| **Assignees** | Checkbox list | Collaborators assigned to resolve the bug. |
| **Attachments** | File Uploader | Screenshots or error logs (max 10MB; disabled on Free plan). |
