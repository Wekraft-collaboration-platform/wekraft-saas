# Edit & Monitor Sprints

Learn how to start planned sprints, complete active sprints, and monitor live performance stats.

---

## Where to Go & How to Go

### 1. Activating a Planned Sprint
- **Where to Go**: Navigate to **Manage → Sprint** in the left sidebar, and click on the planned sprint's card (or navigate to `/workspace/sprint/[sprintName]`).
- **How to Go**:
  1. Once on the sprint details page, verify that the backlog items are correctly assigned.
  2. Click **"Start Sprint"** in the top-right corner of the header.
  3. Confirm the action in the validation prompt. The sprint status will transition to `active`.
  4. *Note: **Only one sprint can be active at a time** per project workspace.*

### 2. Completing an Active Sprint
- **Where to Go**: Open your active sprint's details page (`/workspace/sprint/[sprintName]`).
- **How to Go**:
  1. Once the sprint period concludes, click **"Complete"** in the top-right corner of the header.
  2. Confirm the action in the prompt.
  3. The status will update to `completed`, and:
     - The sprint statistics are frozen for historical velocity records.
     - All uncompleted tasks and open issues are automatically returned to the project **Backlog**.
     - Sprint details (name, goal, dates) are frozen and cannot be modified.

---

## Sprint Performance Analytics

During an active or completed sprint, the details page displays three real-time stats cards:

1. **Sprint Progress**:
   - Shows the percentage of tasks and issues completed.
   - Displays a progress bar visual representation.
   - Shows total completed items vs total items count (e.g., `3 of 10 items`).
2. **Burn Rate**:
   - Displays the rate of item resolution measured in `items/day`.
3. **Assignees**:
   - Renders a list of stacked avatar circles representing the team members assigned to tasks or issues within the sprint.
