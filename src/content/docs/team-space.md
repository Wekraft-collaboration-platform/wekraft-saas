# Teamspace Chat & Channels

WeKraft **Teamspace** (accessed via the `Teamspace` workspace sidebar tab) is a real-time, channel-based chat application built directly into your workspace. It enables instant team communication, poll creations, file attachments, and direct mentions of colleagues or AI agents.

---

## Sub-topics

To help you coordinate with your team using WeKraft Teamspace, see the following operational guides:

- **[Create Channels](/web/docs/create-channels)**: Step-by-step instructions on creating public, private, or announcement-only channels.
- **[Team Space Settings](/web/docs/team-space-settings)**: How to update channel topics, toggle announcement-only mode, and archive or delete channels.
- **[Team Space Permissions](/web/docs/team-space-permissions)**: How to manage channel member lists, restrict posting access, and understand role privileges.

---

## Teamspace Interface Layout

The Teamspace viewport is divided into three functional columns:

### 1. Left Sidebar: Channels List
- **General Channels**: Standard channels (e.g., `#general`, `#announcements`, `#dev-updates`) for broad coordination.
- **Announcement Mode**: Public channels can be flagged as announcement-only, restricting post rights. If announcement mode is enabled, the composer is disabled for regular members, displaying a warning badge.
- **Channel Actions**: Create or delete channels (restricted by project member permissions and role).

### 2. Center Panel: Active Chat Feed
- **Message Feed**: Real-time message thread rendering messages, user avatar indicators, usernames, and message timestamps.
- **Message Composer**: Autocomplete-aware rich text input supporting emojis, system file attachments up to 10MB, and interactive polls.

### 3. Right Sidebar: Members Directory
- Lists all project members grouped by active presence and status (Online/Offline).
- Displays member names, avatars, and role badges (`owner`, `admin`, `member`, `viewer`).

---

## Rich Message Composer Features

The message input composer is designed for high-speed developer navigation:
- **Emojis Picker**: Integrated popup categorized by emojis.
- **Composer Autocomplete Triggers**:
  - `/` (Slash): Launches the **Create Ticket Dialog** directly inside chat, allowing team members to create support/chat tickets on the fly.
  - `@` (At-sign): Summons the member mention directory. Mentions of `@everyone`, `@kaya`, or `@harry` are highlighted.
  - `\` (Backslash): Opens the **Code Linker** to search your repository structure and insert direct path links.
  - `#` (Hash): Instantly launches your device file selector to upload attachments (max 10MB).
- **Interactive Polls**: Click the plus menu and select **Poll** to create a multiple-choice poll with custom options. Members can vote live, updating stats instantly.
