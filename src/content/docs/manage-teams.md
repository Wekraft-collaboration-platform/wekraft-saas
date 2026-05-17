# Manage Teams

Managing your team effectively in Wekraft means understanding roles, permissions, and the mechanics of adding and removing members. This page covers everything an owner or admin needs to know.

## Access Roles

Every project member is assigned exactly one access role. Roles are hierarchical — each role includes all permissions of the roles below it.

### Owner
The creator of the project. There is always exactly one owner per project.

**Exclusive to owner:**
- Delete the project permanently
- Transfer ownership (coming soon)
- Edit all project settings

### Admin
Trusted collaborators with near-full access. Owners promote members to admin status.

**Admin can do everything a member can, plus:**
- Accept or reject join requests
- Promote/demote member roles
- Edit project settings (name, description, visibility)
- Create, start, and delete sprints

### Member
The default role for project contributors.

**Member can:**
- Create and edit tasks (if "member can create" is enabled in settings)
- Create and edit issues (if enabled)
- Comment on tasks and issues
- Log time
- View all project data

### Viewer
A read-only role. Viewers can browse the project — tasks, issues, sprints, team space — but cannot make any changes.

---

## Role Permissions Matrix

| Action | Owner | Admin | Member | Viewer |
|---|---|---|---|---|
| View all project data | ✓ | ✓ | ✓ | ✓ |
| Comment on tasks/issues | ✓ | ✓ | ✓ | — |
| Create tasks | ✓ | ✓ | ✓* | — |
| Create issues | ✓ | ✓ | ✓* | — |
| Edit any task/issue | ✓ | ✓ | Own only | — |
| Log time | ✓ | ✓ | ✓ | — |
| Create sprints | ✓ | ✓ | — | — |
| Start sprint | ✓ | ✓ | — | — |
| Complete sprint | Creator | Creator | — | — |
| Accept join requests | ✓ | ✓ | — | — |
| Promote/demote roles | ✓ | ✓ | — | — |
| Remove a member | ✓ | ✓ | — | — |
| Edit project settings | ✓ | ✓ | — | — |
| Delete project | ✓ | — | — | — |

> *Requires "Members can create" to be enabled in Project Settings.

---

## Adding Members

### Invite Link
Every project has a unique invite link (e.g. `https://wekraft.app/join/abc123xyz`). Share this link with your team.

When someone visits the link:
- If the project is **private**, they submit a join request with an optional message
- If the project is **public**, they can join directly or submit a request (depending on settings)

Owner and admins see join requests in the **Join Requests** panel (bell icon or Project Settings → Members → Requests).

### Accepting a Request
Click **Accept** on a pending request. The user is immediately added as a `member`. You can then promote them to `admin` if needed.

### Rejecting a Request
Click **Reject** to decline the request. The user is notified. They can re-apply in the future.

---

## Changing a Member's Role

1. Go to **Project Settings → Members**
2. Find the member in the list
3. Click the role badge (e.g. `member`) to open the role selector
4. Select the new role

Role changes take effect immediately. Downgrading a member to `viewer` will immediately restrict their write access.

---

## Removing a Member

1. Go to **Project Settings → Members**
2. Click the ⋯ menu next to the member
3. Select **Remove from project**

Removed members:
- Lose access immediately
- Are recorded in the membership history with a `leftAt` timestamp
- Their past work (tasks created, comments, time logs) is preserved

---

## Member Limits

| Plan | Members per project |
|---|---|
| Free | 3 (including owner) |
| Plus | 5 (including owner) |
| Pro | 15 (including owner) |

If you've reached your member limit, you'll need to either remove an existing member or upgrade your plan before adding new ones.

---

## Project Configuration for Members

In **Project Settings → Configuration**, owners can control what members are allowed to do:

| Setting | Default | Description |
|---|---|---|
| **Members can create** | Off | Allow `member` role to create tasks and issues |
| **Members use Kaya** | Off | Allow members to access Kaya AI (Pro plan required) |
| **Kaya threshold** | Plan limit | Max Kaya AI calls for this project per month |

---

## Next Steps

- [See your team's live workload →](/web/docs/team-space)
- [Analyze productivity with Heatmaps →](/web/docs/heatmaps)
- [Set up your project settings →](/web/docs/projects)
