# Assign Issues

Learn how to assign team members to resolve bugs, coordinate assignments, and manage collaboration rights.

---

## Where to Go & How to Go

### 1. Manual Assignee Checklist (Detail Sheet)
- **Where to Go**: Navigate to **Manage → Issues** in the left sidebar, click on the issue row, and locate the **Assignee** section in the details side sheet.
- **How to Go**:
  1. Click the assignee avatars circle (or the assignee dropdown trigger).
  2. In the dropdown selection list, check or uncheck team members.
  3. The changes are immediately written to the database.

### 2. Auto-Inheritance via Task Blockage Escalation
- **Where to Go**: This occurs automatically when marking tasks as blocked.
- **How to Go**:
  1. When a task is escalated (by clicking **"Mark as Issue"** inside the `TaskDetailSheet` details), WeKraft's backend automatically creates the linked issue.
  2. The new issue **automatically inherits all developers** assigned to the blocked parent task.
  3. This ensures the developers are notified of the blocking bug without needing manual reassignment.

---

## Assignment Permissions & Roles

| Role | Issue Permissions |
|---|---|
| **Admin / Owner** | Full permissions. Can create, edit, assign, delete, close, or reopen issues. |
| **Member** | Standard permissions. Can create, edit, assign, close, or reopen issues. |
| **Viewer** | Read-only. Cannot assign, edit, close, reopen, or create issues. |
