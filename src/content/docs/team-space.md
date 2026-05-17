# Team Space

Team Space is the social and collaborative layer of a Wekraft project. It shows you who is on your team, what they're working on, and how the team is structured — all in one place.

## Overview

Team Space surfaces information that would otherwise require manually digging through tasks and issues:

- **Who is on the project** — every member with their role, avatar, and when they joined
- **What each person is working on** — a live view of their in-progress tasks and open issues
- **Member profiles** — skills, bio, occupation, and social links from each person's public profile

---

## Viewing the Team

Open the **Team Space** tab from your project sidebar. You'll see a card grid with one card per member.

Each member card shows:
- **Avatar** and **name**
- **Access role** (`owner`, `admin`, `member`, or `viewer`)
- **Date joined** the project
- **In-progress tasks** — tasks currently assigned to them with status `inprogress`
- **Open issues** — issues currently assigned to them that are not closed

Click any member card to open their **full profile**, which includes their bio, occupation, skills, and social links if they've filled them in.

---

## Roles in Team Space

| Role | Badge | Who gets it |
|---|---|---|
| `owner` | 👑 Crown | The person who created the project |
| `admin` | 🛡 Shield | Promoted by the owner |
| `member` | — | Regular contributor |
| `viewer` | 👁 Eye | Read-only access |

---

## Inviting Members

From the **Members** section in Project Settings (or the Team Space tab), click **"Invite Member"**.

### Via Invite Link
Share the project's unique invite link. Anyone with the link can submit a join request. The owner or admin can then **accept or reject** it from the **Join Requests** panel.

### Via Direct Invite
If you know the user's Wekraft username, you can send them a direct invitation. They'll receive a notification and be added immediately upon acceptance.

### Public Project Discovery
If your project is set to **Public**, other Wekraft users can discover it and submit a join request with a message. You'll see these in the Join Requests panel.

---

## Member Capacity

Understanding each member's current workload is critical for fair task distribution. Team Space gives you a quick snapshot, but for deep workload analytics, use the **Heatmaps** feature, which shows task load scores, burnout risk, and activity trends across the whole team.

---

## Member Limits by Plan

| Plan | Members per project |
|---|---|
| Free | 3 |
| Plus | 5 |
| Pro | 15 |

---

## Removing a Member

Owners and admins can remove members from **Project Settings → Members**. Removing a member:
- Revokes their access to the project immediately
- Does **not** delete their past contributions (tasks they created, comments, time logs)
- Records `leftAt` on their membership record

---

## Next Steps

- [Set member roles and permissions →](/web/docs/manage-teams)
- [Analyze workload distribution →](/web/docs/heatmaps)
- [Track progress with Sprints →](/web/docs/sprints)
