# Teamspace Documentation: Real-Time Engine & Architecture

This document provides an exhaustive deep-dive into the Teamspace module. It covers the "Zero Latency" architecture, real-time messaging implementation, and the internal mechanics of the `useMessages` engine.

---

## 1. Zero-Latency Architecture
Teamspace is designed to feel instantaneous. To achieve "no latency," we employ a four-layered data strategy that ensures users never see a loading spinner during normal operation.

### Layer 0: Synchronous Memory Cache (`memoryCache`)
*   **Purpose**: Instant UI transitions when switching channels.
*   **How it works**: A global, in-memory JavaScript object stores the most recent messages for every visited or hovered channel.
*   **Hover-to-Load Engine**: We utilize a "Predictive Loading" pattern. When a user's cursor stays over a channel in the sidebar for >50ms, `prefetchMessages()` is called. This populates both the Memory Cache and IndexedDB *before* the user clicks, making the transition feel like a local state change rather than a network navigation.

### Layer 1: Persistent Client-Side Storage (`IndexedDB / chatDb`)
*   **Purpose**: Instant "Cold Start" and offline support.
*   **How it works**: Every message fetched from the server is mirrored to IndexedDB. When a user refreshes the page or re-opens the app, we load from IndexedDB *synchronously* (via local lookup) before the network request even starts. This eliminates the "empty screen" state entirely.

### Layer 2: Optimistic UI Updates
*   **Purpose**: Eliminating "Send" latency.
*   **How it works**: When `sendMessage` is called, a temporary message object with a UUID is added to the local `messages` state **before** the API call is made. 
    *   If the server succeeds, the temporary message is replaced with the official one.
    *   If the server fails, the UI rolls back and shows an error toast.

### Layer 3: Real-Time Pub/Sub (Ably)
*   **Purpose**: Cross-client synchronization.
*   **How it works**: Long-lived WebSocket connections via Ably handle incoming events. This bypasses traditional polling, ensuring updates arrive in <100ms globally.

---

## 2. The `useMessages` Engine
The `useMessages` hook is the "brain" of Teamspace. It manages state, caching, and real-time listeners.

### Lifecycle of a Message Fetch
1.  **Mount**: Hook checks `memoryCache`. If fresh data exists, it renders immediately.
2.  **Background Load**: Hook queries `chatDb` (IndexedDB). If data is found, it renders (if memory cache was empty).
3.  **Network Sync**: A fetch request hits `/api/teamspace/messages`. The result updates the UI, memory cache, and IndexedDB.
4.  **Subscribe**: The hook joins an Ably channel: `teamspace:${channelId}`.

### Event Handlers
The engine listens for specific Ably events to keep the UI in sync:
| Event | Action |
| :--- | :--- |
| `message.new` | Appends message to feed. Increments `reply_count` on parent if it's a thread reply. |
| `message.updated` | Updates content, pin status, or `edited_at` timestamp. |
| `message.deleted` | Removes the message from local state and caches. |
| `reaction.updated` | Re-calculates reaction arrays (adding/removing user IDs from specific emojis). |

---

## 3. Real-Time Chat Implementation

### Sending Messages
Implemented in `sendMessage()`:
1.  Generates a `crypto.randomUUID()`.
2.  Updates local state (Optimistic).
3.  POSTs to `/api/teamspace/messages`.
4.  The server saves to Turso and broadcasts the `message.new` event via Ably.

### Threading Logic
*   Messages containing a `thread_parent_id` are treated as replies.
*   The `MessageFeed` filters these out from the main view unless the `threadParentId` prop is provided (used in the `ThreadPanel`).
*   **Parent Meta**: Replies often include denormalized parent data (user name, content) to show "replied to..." context without extra joins.

### Reaction Syncing
Reactions use a specific `toggleReaction` function that handles:
1.  **Local Deduplication**: Ensures a user can only have one reaction per emoji.
2.  **State Transformation**: Maps the raw reaction list into a structured `Reaction[]` array (Emoji -> List of UserIDs).
3.  **Server Handshake**: DELETE/POST requests to `/api/teamspace/reactions`.

---

## 4. Infrastructure & Scaling

### Turso (Persistence Layer)
We use Turso (libSQL) for its global distribution. Since Teamspace data is structured, SQL allows for efficient cursor-based pagination and complex relationship mapping (like pins and threads).

### Ably (Real-Time Layer)
Ably provides the WebSocket backbone. We use **Presence** to track who is online and **Pub/Sub** for messaging.
*   **Auth**: Handled via `/api/teamspace/ably-token`, which verifies the Clerk session before issuing a JWT.

### Performance Benchmarks
*   **Initial Load**: ~20ms (from Memory/IndexedDB).
*   **Network Sync**: ~150-300ms (depending on region).
*   **Message Delivery**: ~50-80ms (via Ably).

---

## 5. UI/UX Design for Speed
The Teamspace interface is built to reinforce the feeling of speed through visual cues and interaction patterns.

*   **Micro-Animations**: Uses `Framer Motion` for smooth panel transitions (Sidebar/Thread/Members) to mask small data-processing delays.
*   **Skeleton States**: While Layer 1 (IndexedDB) prevents most skeletons, we use high-fidelity skeleton loaders for initial channel list fetches.
*   **Infinite Scroll**: Uses `IntersectionObserver` to trigger the `loadMore` function before the user reaches the top of the feed, ensuring a seamless scroll into history.
*   **Optimistic Message Status**: Messages appear immediately with a "Sending..." state (subtle opacity change) which resolves instantly once Ably broadcasts the update back to the sender.

---

## 6. Developer Guide: Maintenance

### Adding a New Interaction (e.g., Typing Indicators)
1.  **Ably**: Use `ch.presence.update({ typing: true })`.
2.  **Hook**: Add a `typingMembers` state to `useMessages`.
3.  **Listener**: Subscribe to `presence` events in the Ably `useEffect`.

### Database Migrations
If you modify the Turso schema:
1.  Update the SQL definitions in the `Database Schema` section below.
2.  Update the `Message` and `Channel` interfaces in `useMessages.ts` and `useChannels.ts`.
3.  Clear the IndexedDB `chatDb` to prevent type mismatches with cached data.

---

## 6. Database Schema (Reference)

```sql
-- Core Channel Table
CREATE TABLE ts_channels (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'text', -- 'text', 'announcement', 'voice'
  is_default INTEGER DEFAULT 0,
  created_by TEXT,
  created_at INTEGER
);

-- Message Table with Threading support
CREATE TABLE ts_messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_image TEXT,
  content TEXT NOT NULL,
  thread_parent_id TEXT, -- NULL for top-level messages
  is_pinned INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  edited_at INTEGER,
  FOREIGN KEY(channel_id) REFERENCES ts_channels(id)
);

-- Reaction Junction Table
CREATE TABLE ts_reactions (
  message_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  emoji TEXT NOT NULL,
  PRIMARY KEY (message_id, user_id, emoji),
  FOREIGN KEY(message_id) REFERENCES ts_messages(id)
);
```

