# Production Infrastructure Audit — Wekraft SaaS
### Mapping the 3 System Design Failure Modes to Your Codebase

---

## Stack Overview (Discovered)

| Layer | Technology | Purpose |
|---|---|---|
| Frontend cache | IndexedDB (`db.ts`) | Client-side chat message cache |
| Realtime | Ably | Pub/Sub for messages, channels, presence |
| App DB | Convex | Tasks, users, projects, notifications, payments |
| Chat DB | Turso (libSQL) | Messages, channels, reactions, polls |
| Cache / Rate-limit | Upstash Redis | Rate limiting + any server-side caching |
| Auth | Clerk | Identity, tokens |
| Background jobs | Inngest | Async workflows |
| AI Proxy | `/api/agent/route.ts` | Streaming AI agent with rate limit |

---

## ❶ Cache Penetration — The Ghost Request Attack

> **Condition:** A request for a non-existent key bypasses your cache and hammers the DB.

### 🔴 Critical: `/api/agent/route.ts` — User ID Probe Attack

**File:** [route.ts](file:///e:/wekraft-saas/src/app/api/agent/route.ts#L49-L51)

```ts
// Line 49–51 — Vulnerable probe path
const proCheckPromise = userId
  ? convex.query(api.user.getUserById, { userId })
  : Promise.resolve({ accountType: "pro" }); // Fallback
```

**The Problem:**
- An attacker can POST with any random `state.user_id` (e.g., `"j97abc123xyz"`)
- Every request queries Convex DB for a non-existent user — no cache, no guard
- The fallback at line 51 returns `{ accountType: "pro" }` for missing `userId`, which means **unauthenticated requests get treated as Pro users** — this is a logic bug *and* a penetration vector

**Fix — Cache Null Values with Upstash + Fix the Logic Bug:**
```ts
// redis.ts already exists — use it here
import { redis } from "@/lib/redis";

const cacheKey = `user:${userId}`;
const cached = await redis.get(cacheKey);
let user = cached ? JSON.parse(cached as string) : null;

if (!user) {
  user = await convex.query(api.user.getUserById, { userId });
  // Cache null sentinel to block repeat probes for 60s
  await redis.set(cacheKey, JSON.stringify(user ?? "__NULL__"), { ex: 60 });
}

// FIX the logic bug: missing userId should NOT be treated as Pro
if (!userId || !user || user === "__NULL__" || user.accountType !== "pro") {
  // reject
}
```

---

### 🟡 Medium: `convex/user.ts` — `getUserByClerkToken` Full Table Scan

**File:** [user.ts](file:///e:/wekraft-saas/convex/user.ts#L72-L79)

```ts
// Lines 72–79 — Full table scan on suffix match fallback
const all = await ctx.db.query("users").collect();
return (
  all.find(
    (u) =>
      u.clerkToken === args.clerkToken ||
      u.clerkToken.endsWith(`|${args.clerkToken}`),
  ) ?? null
);
```

**The Problem:**  
If the exact index match fails, it falls back to loading **every user in the database** into memory. As the user base grows, this becomes increasingly expensive and will cause DB timeouts.

**Fix:**  
Add a second Convex index `by_clerk_user_id` on a parsed user ID column, or enforce that all tokens are stored in their full `provider|id` form to guarantee the `by_token` index always hits.

---

### 🟡 Medium: `src/lib/turso/schema.ts` — `initTeamspaceDB()` on Every Cold Start

**File:** [schema.ts](file:///e:/wekraft-saas/src/lib/turso/schema.ts#L1-L77)

```ts
// Migrations run on EVERY cold start before the isDbInitialized guard (lines 3–76)
// Three separate ALTER TABLE and PRAGMA calls happen unconditionally
await turso.execute("ALTER TABLE ts_messages ADD COLUMN expires_at INTEGER;");
await turso.execute("ALTER TABLE ts_notifications ADD COLUMN type TEXT;");
await turso.execute("PRAGMA turso_enable_expiry = ON;");
```

**The Problem:**  
The `isDbInitialized` guard is checked on line 77, **after** 3 unconditional DB calls run. On serverless (Vercel), every function instance is a cold start. Under traffic spikes, dozens of simultaneous cold starts each issue the same DDL migrations to Turso, creating a mini-stampede.

**Fix:**  
Move `if (isDbInitialized) return;` to **line 10** (the very top of the function), before any DB calls.

---

## ❷ Thundering Herd (Cache Stampede) — The TTL Expiry Disaster

> **Condition:** A popular cache key expires and thousands of requests simultaneously race to regenerate it.

### 🔴 Critical: `src/lib/db.ts` — IndexedDB TTL with No Stampede Protection

**File:** [db.ts](file:///e:/wekraft-saas/src/lib/db.ts#L65-L68)

```ts
// Lines 65–68 — Hard TTL with no soft expiry or coalescing
if (Date.now() - result.lastAccessed > CACHE_TTL_MS) {
  return null; // Hard miss — all concurrent tabs re-fetch simultaneously
}
```

**The Problem:**  
When the 1-hour TTL expires for a busy channel, **every open browser tab for that channel** simultaneously gets a cache miss and triggers an API call to `GET /api/teamspace/messages`. With many team members, this is a direct N-concurrent-tabs stampede against Turso.

**Fix — Soft Expiry Pattern:**  
Store a `softExpiry` timestamp (e.g., 55 minutes) inside the cached object. When a request detects the data is within the soft window, serve stale data immediately while one tab triggers a background refresh.

```ts
interface CachedChat {
  channelId: string;
  messages: any[];
  nextCursor: string | null;
  lastAccessed: number;
  softExpiry: number; // new field — e.g., lastAccessed + 55min
}

async get(channelId: string): Promise<CachedChat | null> {
  // ...existing logic...
  
  const now = Date.now();
  const isHardExpired = now - result.lastAccessed > CACHE_TTL_MS;
  const isSoftExpired = now > result.softExpiry;
  
  if (isHardExpired) return null; // true miss
  
  if (isSoftExpired) {
    // Serve stale immediately; signal caller to trigger background refresh
    return { ...result, messages: filteredMessages, __stale: true };
  }
  
  return { ...result, messages: filteredMessages };
}
```

---

### 🟡 Medium: `/api/teamspace/channels/route.ts` — No Channel List Caching

**File:** [channels/route.ts](file:///e:/wekraft-saas/src/app/api/teamspace/channels/route.ts#L40-L69)

```ts
// Lines 40–69 — Full SQL with 3x subquery executed on EVERY request
const querySql = `
  SELECT c.*, 
    (SELECT COUNT(*) FROM ts_messages ...) AS unread_count,
    (SELECT COUNT(*) FROM ts_notifications ...) AS mention_count
  FROM ts_channels c WHERE c.project_id = ?
  ORDER BY ...
`;
```

**The Problem:**  
Every component mount and navigation event re-runs this 3-subquery SQL against Turso. In a project with 20 channels and 50 concurrent users, this fires 50+ times per second. When the channel list is "busy" (everyone opening teamspace simultaneously), this creates a thundering herd pattern against the same Turso table.

**Fix — Cache with Upstash + Invalidate on Channel Events:**
```ts
import { redis } from "@/lib/redis";

const cacheKey = `channels:${projectId}:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return NextResponse.json({ channels: JSON.parse(cached as string) });

// Run the SQL...
const result = await turso.execute({ sql: querySql, args: [...] });

// Cache for 30 seconds — short enough to stay fresh, long enough to absorb spikes
await redis.set(cacheKey, JSON.stringify(result.rows), { ex: 30 });
```

---

### 🟡 Medium: `convex/notifications.ts` — `deleteOldNotifications` Full Table Scan

**File:** [notifications.ts](file:///e:/wekraft-saas/convex/notifications.ts#L537-L555)

```ts
// Lines 543–546 — Unbounded .filter() scan (no index!)
const oldNotifications = await ctx.db
  .query("notifications")
  .filter((q) => q.lt(q.field("createdAt"), cutoff))
  .collect();
```

**The Problem:**  
This runs as a scheduled cron. It performs a **full collection scan** of the notifications table because `.filter()` doesn't use indexes in Convex — only `.withIndex()` does. As notifications accumulate, this cron job will time out and begin retrying, creating a thundering retry storm.

**Fix:**  
Add a Convex index `by_createdAt` on the notifications table and use `.withIndex()`:
```ts
// In schema.ts, add:
.index("by_created_at", ["createdAt"])

// In notifications.ts:
const oldNotifications = await ctx.db
  .query("notifications")
  .withIndex("by_created_at", (q) => q.lt("createdAt", cutoff))
  .collect();
```

---

## ❸ Hot Keys — The Shard Overload

> **Condition:** One specific key receives disproportionate traffic, saturating a single node.

### 🔴 Critical: `src/lib/rate-limit.ts` — Single Rate-Limit Key Structure

**File:** [rate-limit.ts](file:///e:/wekraft-saas/src/lib/rate-limit.ts)

```ts
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "agent_rl",
});
```

**The Problem:**  
With `prefix: "agent_rl"`, Upstash generates keys like `agent_rl:<identifier>`. In `/api/agent/route.ts`, when `userId` is missing, the fallback is `request.headers.get("x-forwarded-for") || "anonymous"`. All anonymous users share the key `agent_rl:anonymous` — a single hot key that is hit on every unauthenticated request, saturating one Redis slot.

**Fix — Multiple Prefixes + Ensure Anonymous Has Per-IP Fallback:**
```ts
// rate-limit.ts — add tiered limiters
export const agentRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true,
  prefix: "@wekraft/agent",
});

// In route.ts, never let "anonymous" be a shared key:
const identifier = userId 
  ?? request.headers.get("x-real-ip")
  ?? request.headers.get("x-forwarded-for")?.split(",")[0].trim()
  ?? `anon:${Math.random()}`; // last resort, effectively a no-limit
```

---

### 🟠 High: `convex/workspace.ts` — `getUniqueTags` Full Project Scan as Hot Query

**File:** [workspace.ts](file:///e:/wekraft-saas/convex/workspace.ts#L520-L539)

```ts
// Lines 524–538 — Fetches ALL tasks every time tags are needed
const tasks = await ctx.db
  .query("tasks")
  .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
  .collect(); // No .take() limit — unbounded!

tasks.forEach((task) => {
  if (task.type) tagsMap.set(task.type.label, task.type);
});
```

**The Problem:**  
`getUniqueTags` is a Convex `query`, meaning it re-runs on every subscription update. It loads **every task in the project** into memory just to extract a small tag set. For active projects with hundreds of tasks, this is an O(n) hot query that fires frequently and wastes bandwidth.

**Fix:**  
Denormalize tags into a separate `projectTags` table and maintain it via `mutation` side effects when tasks are created/updated. The query then becomes O(1).

---

### 🟡 Medium: `/api/teamspace/messages/route.ts` — No Message Deduplication / Idempotency

**File:** [messages/route.ts](file:///e:/wekraft-saas/src/app/api/teamspace/messages/route.ts#L225-L257)

```ts
const id = clientId || randomUUID(); // Line 225

// Then immediately INSERT without checking if id exists
await turso.execute({
  sql: `INSERT INTO ts_messages (id, ...) VALUES (?, ...)`,
  args: [id, ...],
});
```

**The Problem:**  
If a client retries a POST (network timeout, double-tap), a second message with a different `randomUUID()` is inserted. There's no idempotency check on `clientId`. Under high concurrency (many users typing simultaneously in a popular channel), this also puts write pressure on a single Turso table without batching.

**Fix — Upsert with Client ID:**
```ts
await turso.execute({
  sql: `INSERT OR IGNORE INTO ts_messages (id, ...) VALUES (?, ...)`,
  args: [id, ...],
});
```

---

## ⚙️ Additional Critical Production Issues Found

### 🔴 `src/lib/static-store.tsx` — Hardcoded localhost URL in Production File

**File:** [static-store.tsx](file:///e:/wekraft-saas/src/lib/static-store.tsx#L292-L293)

```ts
export const INVITE_LINK = "http://localhost:3000/";
// export const INVITE_LINK = "https://wekraft-saas.vercel.app/";
```

The production URL is **commented out**. Every invite link generated in production points to `localhost:3000`. This will break all invite flows silently.

**Fix:** Use env variable:
```ts
export const INVITE_LINK = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000/";
```

---

### 🟡 `src/app/api/agent/route.ts` — ConvexHttpClient Instantiated Per-Module (Not Singleton)

**File:** [route.ts](file:///e:/wekraft-saas/src/app/api/agent/route.ts#L7)

```ts
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
```

In Next.js serverless, each invocation may create a new client. This is fine for Convex HTTP clients (stateless), but the same pattern in [messages/route.ts](file:///e:/wekraft-saas/src/app/api/teamspace/messages/route.ts#L14) creates both `convex` and `ably` as module-level singletons — **this is actually correct**. Keep the pattern consistent.

---

### 🟡 `convex/crons.ts` — Need to Verify Cron Frequency

**File:** [crons.ts](file:///e:/wekraft-saas/convex/crons.ts) — check that `deleteOldNotifications` isn't set to run too frequently, as the full-table scan noted above will compete with live queries.

---

## 📊 Priority Summary

| # | Issue | File | Severity | Pattern |
|---|---|---|---|---|
| 1 | Ghost userId probing + Pro bypass bug | `api/agent/route.ts` | 🔴 Critical | Penetration + Logic Bug |
| 2 | `localhost` invite link in production | `lib/static-store.tsx` | 🔴 Critical | Config |
| 3 | IndexedDB hard TTL → tab stampede | `lib/db.ts` | 🔴 Critical | Thundering Herd |
| 4 | `anonymous` rate-limit hot key | `lib/rate-limit.ts` | 🔴 High | Hot Key |
| 5 | `initTeamspaceDB()` migration storm | `lib/turso/schema.ts` | 🟠 High | Thundering Herd |
| 6 | `getUniqueTags` unbounded task scan | `convex/workspace.ts` | 🟠 High | Hot Key |
| 7 | Channel list has no caching | `api/teamspace/channels/route.ts` | 🟡 Medium | Thundering Herd |
| 8 | `getUserByClerkToken` full table scan | `convex/user.ts` | 🟡 Medium | Penetration |
| 9 | `deleteOldNotifications` no-index cron | `convex/notifications.ts` | 🟡 Medium | Thundering Herd |
| 10 | POST messages not idempotent | `api/teamspace/messages/route.ts` | 🟡 Medium | Hot Write |

---

## 🛠 Recommended Implementation Order

1. **Fix the `localhost` invite link** — 1 line change, zero risk, immediate production impact
2. **Fix the Pro bypass logic bug** in `/api/agent/route.ts` — security fix
3. **Add null-value caching** to the agent user lookup (Redis `set` with 60s TTL)
4. **Fix `initTeamspaceDB()`** — move the guard to the top
5. **Add `INSERT OR IGNORE`** to message inserts
6. **Fix anonymous rate-limit key** to be per-IP
7. **Add soft-expiry** to `db.ts` IndexedDB TTL
8. **Add channel list caching** with 30s Redis TTL
9. **Add `by_created_at` index** for notification cleanup cron
10. **Denormalize project tags** into their own table
