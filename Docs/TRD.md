# Technical Requirements Document (TRD) — Wekraft SaaS
**System Architecture, Technology Stack, and Technical Debt Audit**

---

## 1. Executive Summary & Project Overview

**Wekraft SaaS** is a high-performance, real-time collaboration and project management platform designed for developers and product teams. It integrates traditional project management workflows (Sprints, Kanban boards, Task tracking, and Issue management) with a unified workspace containing:
- **Real-Time Teamspace**: Chat channels, threaded conversations, poll voting, and markdown unfurling.
- **Agentic AI Assistance ("Kaya")**: A persistent, context-aware AI assistant with a semantic memory layer (using Mem0) and IDE extension hooks.
- **Location-Based Payment Routing**: Dual-payment paths dynamically routing domestic Indian transactions via Razorpay and global cards via Stripe.
- **Edge-Optimized Collaborative Features**: Integrated video meetings, project scheduling, and automated delivery alerts.

---

## 2. Core Technology Stack

Wekraft operates on a highly decentralized, serverless architecture that leverages specialized edge services for specific workloads. 

```mermaid
graph TD
    Client[Next.js Client v16.1.6 / React 19] -->|Auth Token| Clerk[Clerk Auth]
    Client -->|GraphQL Queries / Mutations| Convex[Convex DB Serverless]
    Client -->|SQL / HTTP API| Turso[Turso Database LibSQL]
    Client -->|SSE Channel Subscriptions| Ably[Ably Pub/Sub Router]
    Client -->|Video & Audio Streams| Stream[GetStream Video SDK]
    Client -->|Checkout Redirect| Stripe[Stripe Checkout]
    Client -->|Modal SDK Checkout| Razorpay[Razorpay Subscription SDK]

    subgraph Serverless Backend (Next.js API Routes)
        Proxy[/api/agent] -->|IP / UserID Rate Limit| Upstash[Upstash Redis + RateLimit]
        Proxy -->|SSE Stream Proxy| ExternalAgent[External AI Agent Engine]
        Paymentsstripe[/api/payments/stripe] --> StripeAPI[Stripe Node SDK]
        Paymentsrazorpay[/api/payments/razorpay] --> RazorpayAPI[Razorpay SDK]
    end

    Convex -->|Triggers Alert Workflows| Inngest[Inngest Event Engine]
    Inngest -->|Fires Notifications| Convex
```

### Stack Breakdown by Layer

| Layer | Technologies Used | Purpose & Implementation |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js `16.1.6` (Canary), React `19.2.3`, TypeScript | Core SPA application with app-router structure, server actions, and Serverless route support. |
| **Styling & UX** | Tailwind CSS `v4`, Radix UI, Framer Motion, GSAP, Lenis | Rich, hardware-accelerated animations, smooth scroll, layout transitions, and premium dark/light mode interfaces. |
| **Realtime Gateway** | Ably (`ably` client) | Pub/Sub event bus handling channel chat messages, presence events, and live team meeting synchronization. |
| **Operational DB** | Convex (`convex` v1.32.0) | Relational application database (users, details, tasks, sprints, calendar events, notifications, upvotes, service requests). |
| **Chat DB (Edge)** | Turso / libSQL (`@libsql/client`) | SQLite-compatible database distributed to the edge. Stores high-throughput messages, reactions, channels, settings, and full-text index (`fts5`). |
| **Cache & Limits** | Upstash Redis (`@upstash/redis` & `@upstash/ratelimit`) | Low-latency state caching for user objects, and rate limiting (sliding window) on API routes. |
| **Auth & Identity** | Clerk (`@clerk/nextjs` v7.0.4) | Secure authentication, OAuth providers (GitHub), session tokens, and middleware protection. |
| **Async Workflows** | Inngest (`inngest` v4.1.0) | Event-driven serverless cron jobs and background tasks (e.g. project duration alerts). |
| **Payments** | Stripe (`@aws-sdk/client-s3` used for attachments) & Razorpay (`razorpay` v2.9.5) | Dual billing gates. Stripe controls international credit cards; Razorpay processes Indian UPI/cards. |
| **Video Meeting** | Stream Video SDK (`@stream-io/video-react-sdk`) | Interactive multi-party video calling embedded directly in team meets. |
| **Agentic AI** | Vercel AI SDK (`ai`), LangChain (`@langchain/core`, `@langchain/langgraph`) | Streaming AI backend powered by LangGraph, LangGraph SDK, and Mem0 (semantic memory). |

---

## 3. Storage Architecture (Hybrid Approach)

Wekraft utilizes a hybrid storage model to optimize performance:
1. **Primary Operational Storage (Convex)**: Serves as the transactional store for application state (Sprints, Tasks, Onboarding, and user metadata).
2. **High-Throughput Chat Messaging (Turso)**: Edge-distributed database dedicated to absorbing chat traffic, reactions, and real-time messaging histories.

---

## 4. Key Architectural Integrations

### 4.1. Dynamic Payment Routing Engine
Located in [Pricing.tsx](file:///r:/wekraft-saas/src/modules/web/Pricing.tsx):
- On pricing page initialization, the client queries IP geolocation.
- If the country is **India (`IN`)**, Rupees (₹) are rendered, routing checking flows through the `useRazorpay` hook.
- If the country is **Non-India**, USD ($) is rendered, redirecting to a Stripe hosted Checkout Session.
- Webhooks for Stripe (`checkout.session.completed`, `customer.subscription.deleted`) and Razorpay (`subscription.charged`, `subscription.cancelled`) securely invoke Convex database mutations to update user account tiers.
- A fallback auto-downgrade cron runs daily at **00:30 UTC** in Convex to process expired plans if webhooks fail.

### 4.2. Stream Video Call Engine
Located in [notifications.ts](file:///r:/wekraft-saas/convex/notifications.ts) and [teamspace](file:///r:/wekraft-saas/src/modules/team-meet):
- Starting a call inserts a `team_meets` record. A notification is fanned out to all project members.
- The notification body carries the Stream call ID, which deep-links to `/workspace/meet/[meetingId]`.
- Participant joins are appended to the meeting document.
- Stale meetings (where hosts closed their tab without ending the call) are cleaned up by a daily Convex cron job running at **03:00 UTC** (marking active meetings older than 4 hours as inactive).

---

## 5. Technical Debt & Production Vulnerabilities Audit

The codebase was recently audited for performance bottlenecks and system design failure modes. While major issues have been solved, several critical optimizations remain to achieve absolute production grade.

### 5.1. System Design Failure Matrix

#### ❶ Cache Penetration (Ghost Request Attacks)
- **Status:** **Partially Resolved**
- **Vulnerability:** Unauthenticated/anonymous user probes attacking database endpoints.
- **Fixes Applied:** 
  - [route.ts](file:///r:/wekraft-saas/src/app/api/agent/route.ts) now caches non-existent user lookups (`__NULL__` sentinels) in Upstash Redis for 60 seconds.
  - The fallback treating unauthenticated requests as Pro users is deleted.
- **Remaining Debt:**
  - **`getUserByClerkToken` scan:** (High Severity) In [user.ts](file:///r:/wekraft-saas/convex/user.ts#L134-145), if the exact token lookup fails, the query loads **every user** into memory using `ctx.db.query("users").collect()` to perform suffix matching. In a growing database, this scan will hit Convex processing time limits and crash.
    - *Proposed Fix:* Force unified `provider\|id` format on insert and query exclusively through the `by_token` index. Remove the `.collect()` scan entirely.

#### ❷ Thundering Herd (Cache Stampede)
- **Status:** **Partially Resolved**
- **Vulnerability:** Sudden cache TTL expiry forcing concurrent clients to hammer the databases.
- **Fixes Applied:**
  - Client-side IndexedDB chat caching ([db.ts](file:///r:/wekraft-saas/src/lib/db.ts)) now uses a **Soft Expiry Pattern** (`CACHE_SOFT_TTL_MS` of 55 minutes). If data is stale but under the 24-hour hard TTL, it immediately returns cached state and spins up a background refresh.
  - `initTeamspaceDB()` cold start query stampede ([schema.ts](file:///r:/wekraft-saas/src/lib/turso/schema.ts)) is mitigated. It queries `sqlite_master` once to check initialization state instead of firing multiple DDL/migration queries per serverless cold start.
- **Remaining Debt:**
  - **`deleteOldNotifications` scan:** (High Severity) In [notifications.ts](file:///r:/wekraft-saas/convex/notifications.ts#L724-743), the daily cleanup cron filters notifications using `filter(q => q.lt(q.field("createdAt"), cutoff))`. Convex `.filter()` runs a **full database scan** of the notifications table because it is not backed by a Convex index.
    - *Proposed Fix:* Create a Convex index on `createdAt` and use `.withIndex()`.
  - **No Channel List Caching:** (Medium Severity) In [channels/route.ts](file:///r:/wekraft-saas/src/app/api/teamspace/channels/route.ts), every channel render and navigation runs a complex 3x subquery SELECT statement against Turso.
    - *Proposed Fix:* Implement a short 30-second Redis cache layer for the channel list per user-project, invalidating it only on new channel insertion.

#### ❸ Hot Keys (Shard Overloads)
- **Status:** **Partially Resolved**
- **Vulnerability:** Disproportionate traffic directed at a single key or database table partition.
- **Fixes Applied:**
  - [/api/agent/route.ts](file:///r:/wekraft-saas/src/app/api/agent/route.ts) rate limiting resolves anonymous starvation by hashing the client's IP (`x-real-ip` / `x-forwarded-for`) as a fallback rather than a shared `"anonymous"` string.
  - Chat message submissions use `INSERT OR IGNORE` to deduplicate retries on `clientId`.
- **Remaining Debt:**
  - **`getUniqueTags` scan:** (High Severity) In [workspace.ts](file:///r:/wekraft-saas/convex/workspace.ts#L522-542), when fetching tags for a project, the query collects **all tasks** in the project from Convex into memory, filtering them locally. This is an $O(n)$ query that fires reactively on every task update.
    - *Proposed Fix:* Denormalize project tags into their own `projectTags` table, updating them on task creation/deletion mutations. The read query then becomes $O(1)$.

---

## 6. Technical Debt Summary Table

| Severity | Component / Path | Technical Debt Description | Proposed Remediation |
| :--- | :--- | :--- | :--- |
| 🔴 **High** | [convex/user.ts](file:///r:/wekraft-saas/convex/user.ts#L134-145) | Suffix-matching fallback loads all users into memory (`users.collect()`). | Remove suffix matching fallback; enforce strict Clerk format indexed on `by_token`. |
| 🔴 **High** | [convex/notifications.ts](file:///r:/wekraft-saas/convex/notifications.ts#L724-743) | Notification cleanup cron scans entire DB table using unindexed `.filter()`. | Add `.index("by_created_at", ["createdAt"])` and query via `.withIndex()`. |
| 🔴 **High** | [convex/workspace.ts](file:///r:/wekraft-saas/convex/workspace.ts#L522-542) | `getUniqueTags` reactive query loads all project tasks to compute tags. | Denormalize tags into a project metadata table updated via mutators. |
| 🟡 **Medium** | [channels/route.ts](file:///r:/wekraft-saas/src/app/api/teamspace/channels/route.ts) | Uncached channel list query runs 3 SQL subqueries on every navigation. | Cache the channel list in Upstash Redis for 30s; invalidate on channel updates. |
| 🟡 **Medium** | [Pricing.tsx](file:///r:/wekraft-saas/src/modules/web/Pricing.tsx) | Pricing page relies on free, un-fallback-guarded IP API (`ipapi.co`). | Move geolocation parsing to Vercel edge headers (`x-vercel-ip-country`) or configure a fallback provider. |
| 🟢 **Low** | `package.json` | Unused client-side packages (e.g. `livekit-client` along with `stream-io`). | Audit dependency list and clean up unused packages to optimize bundles. |

---

## 7. Production-Grade Practice Rating

### **Overall Rating: 8.2 / 10**

#### **Strengths (Why it rates highly):**
- **Modern Infrastructure Choice:** The combination of Convex (reactive state), Turso (edge SQL), and Ably (SSE networking) is excellent for latency and real-time responsiveness.
- **Robust Security Hygiene:** Clerk is used comprehensively, routes check ownership of resource tokens before actions (such as subscription cancels), and webhook signatures are protected with timing-safe comparison operations.
- **Edge Caching Patterns:** Soft-expiry IndexedDB architecture handles connection loss and prevents client-side rendering bottlenecks cleanly.

#### **Areas for Improvement (Why it lost points):**
- **Convex Query Architecture:** Unindexed collection scans (`.collect()`) are the primary risk factor. They function in development environments but act as timebombs when user lists and project notifications grow in production.
- **SaaS Geolocation Fragility:** Low-reliability dependencies on free geolocation APIs can result in global users hitting Indian pricing routes, causing card payment declines.
