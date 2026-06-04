# Projects Management

Projects are the top-level boundary in Wekraft. Every sprint, task, issue, team space channel, and repository integration is scoped under a specific Project.

---

## Workspace Settings vs. Governance Configs

Wekraft separates project configuration into two distinct areas depending on whether you are editing public profile attributes or configuring member permission policies:

### 1. Project Home Settings (`SettingsTab.tsx`)
Accessed via the **Settings** tab on the Project Home page (`/dashboard/my-projects/[slug]`). These settings manage the project's public profile and metadata.
- **Project Title**: The display name of your project.
- **Description**: Detailed overview explaining the project's purpose.
- **Public Visibility Toggle**:
  - **Public**: Makes the project visible to the Wekraft community. Anyone can search for it, view metrics, and submit join requests.
  - **Private**: Hides the project from community searches. Access is strictly invite-only.
- **Tags Selection**: Select up to **5 descriptive tags** (e.g., `React`, `NodeJS`, `Hackathon`, `MVP`) from the static tags catalog.
- **Thumbnail Upload**: Upload a project banner (1280x300 recommended, max 1MB) which renders at the top of the project dashboard.

### 2. Workspace Config (`ProjectConfigTab.tsx`)
Accessed via the **Config** sub-tab inside the Project Workspace page (`/dashboard/my-projects/[slug]/workspace`). These settings govern member privileges and AI capabilities:
- **Member Task Creation**: Toggle whether regular team members can create new tasks and issues. If disabled, only the Owner and Admins can create tasks.
- **Member AI Access (Kaya)**: Toggle whether team members can use Kaya AI for sprint planning and insights.
- **AI in Teamspace**: Enable or disable AI assistant replies and summary generation tools inside the chat channels.

*Note: Both settings screens are restricted; only the **Project Owner** can modify details or policies. Other users will see a "Settings Restricted" warning.*

---

## Limits & Creation Scopes

Plan limits are strictly verified during project creation and join request approvals:

| Resource Limit | Free Plan | Plus Plan | Pro Plan |
| :--- | :--- | :--- | :--- |
| **Created Projects** | Max 2 projects | Max 10 projects | Max 20 projects |
| **Joined Projects** | Max 2 projects | Max 10 projects | Max 20 projects |
| **Members Per Project** | Max 3 members | Max 6 members | Max 15 members |

If you exceed these limits, you must archive/delete existing projects or upgrade your subscription plan to request additional seats.

---

## Next Steps

- Explore the [Workspace Dashboard layout](/web/docs/project-workspace).
- Integrate your source code with [GitHub Repositories](/web/docs/repositories).
- Learn about the [Project Delivery Timeline & Gantt Chart](/web/docs/time-logs).
