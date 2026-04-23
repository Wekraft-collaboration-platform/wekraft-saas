# Teamspace Documentation

This document provides a comprehensive overview of the Teamspace module, its architecture, real-time implementation, and data flow for future developers.

## Overview
Teamspace is a Slack-inspired real-time messaging platform integrated into the Wekraft SaaS application. It allows project members to communicate in channels, reply in threads, react with emojis, and stay updated in real-time.

---

## Core Architecture

### 1. Frontend (React + Tailwind + Framer Motion)
Located in `src/modules/teamspace`.
- **`TeamspaceView.tsx`**: The main orchestrator that manages layout (Sidebar, Feed, Panels).
- **`ChannelsSidebar.tsx`**: Handles channel listing, categorization, and CRUD operations.
- **`MessageFeed.tsx`**: The primary messaging area with infinite scroll, auto-scroll, and date dividers.
- **`MessageItem.tsx`**: Individual message component with editing, deleting, and reacting capabilities.
- **`ThreadPanel.tsx`**: Side panel for focused discussion on a specific message.
- **`MembersPanel.tsx`**: Displays project members and their real-time presence.

### 2. Backend (Next.js API Routes + Turso)
Located in `src/app/api/teamspace`.
- **Database**: Turso (SQLite) stores channels, messages, and reactions.
- **Authentication**: Clerk handles user identity and permissions.
- **Schema**:
  - `ts_channels`: Project channels.
  - `ts_messages`: Message content, user info, and threading.
  - `ts_reactions`: Emoji reactions mapped to messages and users.

### 3. Real-time (Ably)
Real-time communication is handled via **Ably**.
- **Messaging**: Pub/Sub on channels like `teamspace:${channelId}`.
- **Presence**: Tracks member online/offline status.
- **Token Exchange**: `/api/teamspace/ably-token` provides secure client authentication.

---

## Data Flow & Hooks

### `useMessages.ts` (The Messaging Engine)
This hook manages all message-related logic.
- **Multi-layer Caching**:
  1. **In-memory**: Ultra-fast prefetching when hovering over channels.
  2. **IndexedDB (`chatDb`)**: Offline persistence and faster initial loads.
  3. **Server**: Fetching fresh data via `/api/teamspace/messages`.
- **Real-time Synchronization**: Subscribes to Ably events:
  - `message.new`: Incoming new messages.
  - `message.updated`: Message edits.
  - `message.deleted`: Removal of messages.
  - `reaction.updated`: Emoji updates.
- **Pagination**: Uses cursor-based pagination (based on `created_at` timestamp).

### `useChannels.ts`
Manages channel list state and CRUD operations.
- Communicates with `/api/teamspace/channels`.
- Supports optimistic-style updates for immediate UI feedback.

---

## Key Features Implementation

### Real-time Presence
Implemented in `MembersPanel.tsx`. 
- Clients enter the presence set of a channel when they join.
- online status is derived from Ably's presence members list.
- Visual indicators (green dots) update instantly as users connect/disconnect.

### Threading
- Messages can have a `thread_parent_id`.
- The `ThreadPanel` fetches messages filtered by this ID.
- Quoted blocks in the main feed show who the reply is for.

### Performance Optimizations
- **Message Prefetching**: When a user hovers over a channel in the sidebar, `prefetchMessages` is called to load data before the user even clicks.
- **Infinite Scrolling**: Uses `IntersectionObserver` style scrolling to load earlier messages only when needed.
- **Optimistic UI**: Messages appear instantly in the UI before the server acknowledges the POST request.

---

## Administrative Permissions
Controlled via `useProjectPermissions.ts`.
- **Owners/Admins**: Can create/edit/delete any channel and delete any message.
- **Announcement Channels**: Read-only for standard members; only owners can post.

## Database Schema (SQL)
```sql
CREATE TABLE ts_channels (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  name TEXT,
  description TEXT,
  type TEXT, -- 'text' or 'announcement'
  is_default INTEGER DEFAULT 0,
  created_by TEXT,
  created_at INTEGER
);

CREATE TABLE ts_messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT,
  project_id TEXT,
  user_id TEXT,
  user_name TEXT,
  user_image TEXT,
  content TEXT,
  thread_parent_id TEXT,
  created_at INTEGER,
  edited_at INTEGER
);

CREATE TABLE ts_reactions (
  message_id TEXT,
  user_id TEXT,
  emoji TEXT,
  PRIMARY KEY (message_id, user_id, emoji)
);
```

---

## Developer Guide: Adding New Features
1. **Adding a New Event**: Update `useMessages.ts` to subscribe to a new Ably event and add a handler.
2. **Adding a New API Action**: Create a new route in `src/app/api/teamspace` and a corresponding function in `useMessages` or `useChannels`.
3. **Changing the Design**: Most styles are in `src/modules/teamspace` using Tailwind CSS and Shadcn UI components.
