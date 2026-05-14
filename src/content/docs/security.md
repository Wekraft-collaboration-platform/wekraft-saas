# Security & Permissions

Wekraft uses a robust **Role-Based Access Control (RBAC)** system to ensure your project data is only accessible to the right people.

## Project Visibility

Every project has a visibility setting that determines who can find and join it:

- **Public**: Discoverable via search. Anyone can see the project overview and request to join.
- **Private**: Hidden from search. Users can only join if they have a direct invite link or are added by an Admin.

---

## Team Roles

There are four primary roles within a Wekraft project:

| Role | Permissions |
|---|---|
| **Owner** | Full control. Can delete the project, manage billing, and transfer ownership. |
| **Admin** | Can invite/remove members, update project settings, and manage sprints. |
| **Member** | Can create, edit, and complete tasks/issues. Can use Kaya AI (if enabled). |
| **Viewer** | Read-only access. Can view tasks, calendars, and heatmaps but cannot make changes. |

### Permissions Matrix

| Action | Viewer | Member | Admin | Owner |
|---|---|---|---|---|
| View Tasks/Issues | ✓ | ✓ | ✓ | ✓ |
| Create/Edit Tasks | — | ✓ | ✓ | ✓ |
| Start/End Sprints | — | — | ✓ | ✓ |
| Manage Team Members | — | — | ✓ | ✓ |
| Configure Integrations | — | — | ✓ | ✓ |
| Delete Project | — | — | — | ✓ |

---

## Data Security

### Authentication
Wekraft uses secure OAuth providers (GitHub, Google) for authentication. we never store your passwords.

### Encryption
All data is encrypted at rest and in transit using industry-standard TLS 1.3 and AES-256 encryption.

### Third-Party Access (GitHub)
When you connect a GitHub repository, Wekraft only requests the minimum permissions required to:
1. Sync Issues and Pull Requests.
2. Read commit metadata for task linking.
3. Verify repository existence.

We do not store your source code on our servers.

---

## Best Practices

1.  **Use the Viewer role** for stakeholders who need to stay informed but aren't actively developing.
2.  **Limit Admin roles** to 1-2 trusted team members to prevent accidental configuration changes.
3.  **Review Join Requests** regularly in the "Manage Team" tab to ensure only authorized users have access.

---

## Next Steps
- [Manage your team →](/web/docs/manage-teams)
- [Configure project settings →](/web/docs/projects)
- [Learn about Billing →](/web/docs/billing)
