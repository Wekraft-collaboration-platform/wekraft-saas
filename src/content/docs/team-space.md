# Teamspace Chat & Channels

Wekraft **Teamspace** (accessed via the `Teamspace` workspace sidebar tab) is a real-time, channel-based chat application built directly into your workspace. It enables instant team communication, poll creations, file attachments, and direct mentions of colleagues or AI agents.

---

## Teamspace Interface Layout

The Teamspace viewport is divided into three functional columns:

### 1. Left Sidebar: Channels List
- **General Channels**: Standard channels (e.g., `#general`, `#announcements`, `#dev-updates`) for broad coordination.
- **Announcement Mode**: Public channels can be flagged as announcement-only, restricting post rights. If announcement mode is enabled, the composer is disabled for regular members, displaying a warning badge.
- **Channel Actions**: Create or delete channels (restricted to Project Owners/Admins).

### 2. Center Panel: Active Chat Feed
- **Message Feed**: Real-time message thread rendering messages, user avatar indicators, colored usernames, and message timestamps.
- **Message Composer**: Autocomplete-aware rich text input supporting emojis, system file attachments up to 10MB, and interactive polls.

### 3. Right Sidebar: Members & Roles Directory
- Lists all project members grouped by active presence and status.
- Displays member names, avatars, and role badges (`owner`, `admin`, `member`, `viewer`).

---

## Rich Message Composer Features

The message input composer is designed for high-speed developer navigation:
- **Emojis Picker**: Integrated popup categorized by React emojis (👍, ❤️), Work indicators (✅, ⚠️, 🚀), and symbols (👀, 🤔).
- **Composer Autocomplete Triggers**:
  - `/` (Slash): Launches the **Create Ticket Dialog** directly inside chat, allowing team members to save new backlog tasks on the fly.
  - `@` (At-sign): Summons the member mention directory. Mentions of `@everyone`, `@kaya`, or `@harry` are highlighted.
  - `\` (Backslash): Opens the **Code Linker** to search your repository structure and insert direct path links.
  - `#` (Hash): Instantly launches your device file selector to upload attachments (max 10MB).
- **Interactive Polls**: Click the plus menu and select **Poll** to create a multiple-choice poll with custom options. Members can vote live, updating stats instantly.

---

## Next Steps

- Manage member seats and roles in [Manage Teams & Roles](/web/docs/manage-teams).
- Launch video meetings directly in [Team Meet Rooms](/web/docs/team-meet).
- Learn about composer commands in [Shortcuts & Keyboard Commands](/web/docs/shortcuts).
