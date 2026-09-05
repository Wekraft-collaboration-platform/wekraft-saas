# Team Meet Video Rooms

The **Team Meet** tab (accessed via the `Meet` workspace sidebar option) is WeKraft's native, real-time video conferencing portal. It allows developers and managers to initialize video calls, share screens, and coordinate live code reviews without relying on external calendars or link directories.

---

## Room Controls & Access

WeKraft enforces strict meeting management controls based on team roles:
- **Starting a Meeting**: Starting a new call is restricted to the **Project Owner** and **Project Admins**. Clicking the **"New Meeting"** button triggers an ad-hoc room.
- **Joining a Meeting**: Any active team member (including viewers) can click to join ongoing calls.
- **Invitation Protocol**: If a call is already active, members can join by pasting a specific Meeting ID or URL in the **"Join Call"** dialog.

---

## The Meeting Lifecycle & Interface

Meetings transition through two active states tracked in the database:

### 1. Active Call (`Live`)
- Renders an emerald-colored **Live** status badge with an active pulse indicator.
- Teammates can click **"Join Now"** to route directly to `/dashboard/my-projects/[slug]/workspace/meet/[meetingId]`.
- Video streams initialize with low-latency audio/video feeds, screen sharing, and mute toggles.

### 2. Completed Call (`Ended`)
- When participants disconnect, the call is marked **Ended**.
- WeKraft registers the final disconnect timestamp, computes the total elapsed **Duration** (e.g. `24m 15s`), and displays it on the meeting timeline list.

---

## Meeting History Feed

The main portal renders a detailed feed card list of all past and active meeting events:
- **Host Info**: Shows who initiated the meeting with their username and active avatar.
- **Attendance Tracker**: Lists profile photo icons of all members who participated in the call.
- **Timestamps**: Logs exactly when the call was started, ended, and the duration.

---

## Next Steps

- Chat with team members before calls in [Teamspace Channels](/web/docs/team-space).
- Coordinate team members in [Manage Teams & Roles](/web/docs/manage-teams).
- Log tasks during calls in [Tasks & Backlog](/web/docs/tasks).
