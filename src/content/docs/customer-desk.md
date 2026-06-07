# Customer Desk

The **WeKraft Customer Desk** is a centralized workspace module for managing customer profiles and triaging inbound service requests into actionable tasks or issues.

---

## Where to Go & How to Go

- **Where to Go**: Click on **Customer Desk** in the project sidebar (or navigate to `/dashboard/my-projects/[slug]/workspace/customer-desk`).
- **How to Go**:
  1. Toggle between the **Requests** and **Customers** tabs.
  2. Use the search bar to filter items by name, email, or description.
  3. Filter requests by status (All, Pending, Approved, Rejected) using the table header dropdown.

---

## Managing Customer Profiles

Customer profiles represent the clients or users submitting feedback or reports.
- **Fields**: Name, Email, Contact (Optional).
- **Adding a Customer**: Click the **Add Customer** button at the top right.
- **Editing / Deleting a Customer**: Click the options menu next to a customer row under the **Customers** tab to edit details or delete the profile (deleting a customer profile also deletes all their linked requests).
- **Permissions**: Adding, editing, and deleting customer profiles is restricted to the **Project Owner** only.

---

## Triaging Service Requests

Service requests are logged under specific customer profiles and triaged by project administrators.
- **Fields**: Customer, Title, Description, Type (`Bug Report` or `Feature Request`).
- **Logging a Request**:
  1. Click **Log Request** at the top right.
  2. Select the customer profile.
  3. Enter the Title and Description.
  4. Select the Request Type: **Feature Request** or **Bug Report**.
  5. Click **Submit**. (Regular members can log requests; Viewers cannot).

---

## Request Approval Pipeline

Logged requests are marked as **Pending** and can be triaged with the following actions:

### 1. Approving Requests
- When you click **Approve** on a pending request, an approval dialog opens:
  - Select team member **Assignees** to handle the item.
  - Set the **Start Date** and **End Date** (for feature requests only).
- Click **Approve**.
- The request status updates to **Approved** and WeKraft automatically creates:
  - An internal **Task** (if it was a Feature Request), populated with the estimated dates and assignees.
  - An internal **Issue** (if it was a Bug Report), populated with the assigned team members.

### 2. Rejecting Requests
- If a request is duplicate or out of scope, click **Reject**.
- The request status updates to **Rejected** and is discarded.

---

## Roles & Privileges

| Action | Owner | Admin | Member | Viewer |
|---|:---:|:---:|:---:|:---:|
| Manage Customers (Create, Edit, Delete) | ✅ | ❌ | ❌ | ❌ |
| Log Service Requests | ✅ | ✅ | ✅ | ❌ |
| Approve / Reject Requests | ✅ | ✅ | ❌ | ❌ |
| View Customer Desk Data | ✅ | ✅ | ✅ | ✅ |
