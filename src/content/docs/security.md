# Security & Permissions

Wekraft takes your data security seriously. This page covers how access control works, how your data is protected, and best practices for keeping your projects secure.

## Project Visibility

Every project has a visibility setting that determines who can find and join it:

| Visibility  | Who can see it                               | How to join                                                               |
| ----------- | -------------------------------------------- | ------------------------------------------------------------------------- |
| **Public**  | Discoverable via search and the Discover tab | Anyone can view the overview and submit a join request                    |
| **Private** | Hidden from search entirely                  | Users can only join via a direct invite link shared by the owner or admin |

You can change visibility at any time from **Project Settings → General**.

> [!IMPORTANT]
> Changing a project from Private to Public makes it discoverable immediately. Any Wekraft user can then see the project overview and submit a join request.

---

## Role-Based Access Control (RBAC)

Wekraft uses a four-tier role system. Every project member is assigned exactly one role, and roles are hierarchical — each includes all permissions of the roles below it.

### Role Overview

| Role       | Badge     | Who gets it                        | Summary                                                     |
| ---------- | --------- | ---------------------------------- | ----------------------------------------------------------- |
| **Owner**  | 👑 Crown  | The person who created the project | Full control over everything                                |
| **Admin**  | 🛡 Shield | Promoted by the owner              | Can manage members, sprints, and project settings           |
| **Member** | —         | Default role for new joiners       | Can create tasks/issues (if enabled), comment, and log time |
| **Viewer** | 👁 Eye    | Assigned by owner/admin            | Read-only access to all project data                        |

### Detailed Permissions Matrix

| Action                        | Owner | Admin | Member   | Viewer |
| ----------------------------- | ----- | ----- | -------- | ------ |
| View all project data         | ✓     | ✓     | ✓        | ✓      |
| Comment on tasks/issues       | ✓     | ✓     | ✓        | —      |
| Create tasks                  | ✓     | ✓     | ✓\*      | —      |
| Create issues                 | ✓     | ✓     | ✓\*      | —      |
| Edit any task/issue           | ✓     | ✓     | Own only | —      |
| Log time                      | ✓     | ✓     | ✓        | —      |
| Create sprints                | ✓     | ✓     | —        | —      |
| Start/complete sprint         | ✓     | ✓     | —        | —      |
| Accept/reject join requests   | ✓     | ✓     | —        | —      |
| Promote/demote roles          | ✓     | ✓     | —        | —      |
| Remove a member               | ✓     | ✓     | —        | —      |
| Edit project settings         | ✓     | ✓     | —        | —      |
| Delete project                | ✓     | —     | —        | —      |
| Set project deadline & alerts | ✓     | —     | —        | —      |

> [!NOTE]
> \*Members can create tasks and issues only if the project owner has enabled **"Members can create"** in Project Settings → Configuration.

---

## Authentication

Wekraft uses secure **single sign-on (SSO)** providers:

- **GitHub** — recommended for developers; also enables repository linking and commit tracking
- **Google** — quick sign-in for non-developers

We **never** store your passwords. Authentication is handled entirely by the provider (GitHub or Google), and Wekraft receives only the minimum profile information needed (name, email, avatar).

### VS Code Extension Authentication

The VS Code extension uses a secure **one-time handshake token** system:

1. The extension opens your browser to the Wekraft web app
2. You click **"Grant Access to IDE"** — a single-use token is generated (5-minute expiry)
3. The token is exchanged for a permanent API key stored in VS Code's encrypted secret storage
4. The handshake token is **deleted immediately** after exchange — it cannot be reused

> [!TIP]
> No manual API key copying is required. The entire flow is automated. See [VS Code Extension](/web/docs/extension) for full setup details.

---

## Data Security

### Encryption

All data is encrypted at rest and in transit using industry-standard encryption protocols.

### Real-Time Sync

Wekraft uses a real-time backend infrastructure. All data changes sync instantly across all connected clients without page refreshes, with built-in data validation, access control, and transactional guarantees.

### Repository Integration Access (GitHub)

When you connect a GitHub repository, Wekraft only requests the minimum permissions required to:

1. **Read repository metadata** — name, default branch, stars, forks, language breakdown
2. **Sync Issues** — import GitHub Issues into Wekraft for tracking
3. **Read commit metadata** — link commits to tasks for traceability
4. **Fetch file tree** — display the repository file structure in the File Explorer

> [!IMPORTANT]
> We do **not** store your source code on our servers. The File Explorer fetches repository tree data via the GitHub API on demand and caches the structure temporarily for performance.

---

## Data Privacy

| Data                                                    | Visibility                                                           |
| ------------------------------------------------------- | -------------------------------------------------------------------- |
| **Email address**                                       | Never shared publicly — only visible to you                          |
| **Profile info** (name, avatar, bio, skills)            | Visible to teammates in shared projects                              |
| **Social links** (GitHub, LinkedIn, Twitter, portfolio) | Visible only when someone views your full profile                    |
| **Tasks & Issues**                                      | Visible only to project members                                      |
| **Time logs**                                           | Visible only to project members                                      |
| **Kaya AI conversations**                               | Scoped to the project; Kaya only sees data within its active project |

---

## Best Practices

1. **Use the Viewer role** for stakeholders who need to stay informed but aren't actively developing
2. **Limit Admin roles** to 1–2 trusted team members to prevent accidental configuration changes
3. **Review Join Requests regularly** in the Manage Team settings to ensure only authorized users have access
4. **Keep projects Private** unless you intentionally want public discoverability
5. **Connect GitHub through the dashboard** rather than personal access tokens for better security

---

## Next Steps

- [Manage your team →](/web/docs/manage-teams)
- [Configure project settings →](/web/docs/projects)
- [Learn about Billing →](/web/docs/billing)
- [View your profile →](/web/docs/profile)
- [Learn about the Referral Program →](/web/docs/referrals)
