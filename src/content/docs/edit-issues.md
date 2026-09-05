# Edit Issues

Modify existing issues to update progress, adjust severity, change target deadlines, or link specific files.

---

## Where to Go & How to Go

### 1. Detailed Issue Editing (Edit Issue Dialog)
- **Where to Go**: Open any issue details side sheet by clicking on its title in the list, then click the **"Edit Issue"** button in the header.
- **How to Go**:
  1. The `EditIssueDialog` modal will appear.
  2. Modify the fields as needed:
     - **Title**: Update the description.
     - **Description**: Add specs, steps to reproduce, or notes.
     - **Severity**: Choose `low`, `medium`, or `critical`.
     - **Impact Environment**: Choose `local`, `dev`, `staging`, or `production`.
     - **Due Date**: Select the target resolution date.
     - **File Linked**: Select or type the relative path of the buggy file.
     - **Assignee Checklist**: Check or uncheck team members.
  3. Click **Save Changes**.

### 2. Transitioning Issue Status (Detail Sheet Toggle)
- **Where to Go**: Open the issue details side sheet from the **Issues** list view.
- **How to Go**:
  1. Look at the top action header of the side sheet.
  2. Click the **"Close Issue"** button (or **"Reopen Issue"** button if the issue is currently closed).
  3. The status transitions immediately between `closed` and `reopened`/`opened`, logging the completer's user ID and timestamp on close.

### 3. Quick Actions in Detail Sheet
While the side sheet is open, you can also perform these quick modifications:
- **Manage Assignees**: Click the assignee avatars circle to open a dropdown list and check/uncheck project members.
- **Upload Attachments**: Upload screenshots or error logs (max 10MB per file; disabled on Free plan).
- **Team Comments**: View, add, and reply to comments in the Comments tab.

---

## Modifying Properties Reference

| Parameter | Options | Description |
|---|---|---|
| **Status** | `not opened`, `opened`, `reopened`, `closed` | Toggle via Close/Reopen buttons in sheet header. |
| **Severity** | `low`, `medium`, `critical` | Edit in `EditIssueDialog`. Filters queues. |
| **Impact Environment** | `local`, `dev`, `staging`, `production` | Edit in `EditIssueDialog`. Identifies target build. |
| **File Linked** | Text (path) | Relative codebase path. Clickable file link. |
| **Due Date** | Date | Target resolution date. |
