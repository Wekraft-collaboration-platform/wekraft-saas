# Manage Teams & Roles

WeKraft projects support role-based member governance, allowing you to regulate workspace access, assign execution responsibilities, and control AI usage policies.

---

## Workspace Access Roles

WeKraft structures project roles into four hierarchical levels:

### 1. Owner
- **Scope**: The creator of the project.
- **Exclusive Powers**: Toggles public/private visibility, updates tags, uploads banners, manages policies in the Config tab, sets target project deadlines, and handles billing integrations.

### 2. Admin
- **Scope**: Project managers and team leads promoted by the Owner.
- **Powers**: Creates sprints, manages tasks/issues, accepts or rejects join requests, and promotes or demotes members (except the Owner).

### 3. Member
- **Scope**: Standard developers and team contributors.
- **Powers**: Updates task statuses, replies to chat threads, and joins active video meeting rooms.
- **Restricted Powers**: Can only create tasks/issues if the policy `memberCanCreate` is enabled by the owner. Can only invoke Kaya AI if the policy `memberUseKaya` is enabled.

### 4. Viewer
- **Scope**: Read-only external stakeholders or clients.
- **Powers**: Browses boards, views calendars, and reads chat channels. Write actions are entirely disabled.

---

## Role Permissions Matrix

| Workspace Capability | Owner | Admin | Member | Viewer |
| :--- | :--- | :--- | :--- | :--- |
| **View Project Data** | ✓ | ✓ | ✓ | ✓ |
| **Edit Task Status** | ✓ | ✓ | ✓ | — |
| **Write Channel Messages**| ✓ | ✓ | ✓ | — |
| **Create Sprints** | ✓ | ✓ | — | — |
| **Complete Sprints** | ✓ | ✓ | — | — |
| **Create Tasks & Issues**| ✓ | ✓ | Allowed if policy enabled | — |
| **Invoke Kaya AI** | ✓ | ✓ | Allowed if policy enabled | — |
| **Manage Join Requests**| ✓ | ✓ | — | — |
| **Configure Settings** | ✓ | — | — | — |

---

## Member Allocation Limits

Seat limitations are enforced server-side based on the Project Owner's active subscription tier:

- **Free Tier**: Max **3 members** per project (including the Owner).
- **Plus Tier**: Max **6 members** per project (including the Owner).
- **Pro Tier**: Max **15 members** per project (including the Owner).

*Note: Join requests will show as pending if approving them would exceed your active tier limit.*

---

## Handling Join Requests

When developers use your project's invite link:
1. They are prompted to submit a join request.
2. Owners and Admins receive notification alerts and see these requests in the **Requests** tab on the Project Home page.
3. Once **Accepted**, the developer is added to the project members list as a default `member`.

---

## Next Steps

- Communicate with team members in [Teamspace Channels](/web/docs/team-space).
- Coordinate video meetings in [Team Meet Rooms](/web/docs/team-meet).
- Review workload allocations in the [Project Delivery Timeline & Gantt Chart](/web/docs/time-logs).
