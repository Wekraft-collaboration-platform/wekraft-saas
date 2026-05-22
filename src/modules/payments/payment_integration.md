# Wekraft SaaS: Payment Integration & Webhook Guide

This comprehensive reference document details the architecture, configuration, testing procedures, and environment variables for the dual-payment integration (**Stripe** and **Razorpay**) inside Wekraft SaaS.

> **Last updated:** 2026-05-22 — Security hardening pass (auth on cancel/portal, HMAC fix, internalMutation, auto-downgrade cron)

---

## 1. High-Level Architecture Overview

Wekraft uses a dynamic, location-based payment routing engine. This architecture handles global cards via **Stripe** while routing Indian transactions through **Razorpay** to fully support local card mandates and UPI payment structures.

```mermaid
graph TD
    A[Pricing Page / Upgrade Click] --> B{IP Geolocation Check}
    B -- Country = IN --> C[Razorpay Flow]
    B -- Country != IN --> D[Stripe Flow]

    C --> C1[Server: Create Subscription]
    C1 --> C2[Client: Open Razorpay SDK Modal]
    C2 --> C3[Client: Send payment_id + signature]
    C3 --> C4[Server: Verify HMAC Signature]
    C4 --> C5[Server: Fulfill Plan in Convex]

    D --> D1[Server: Create Checkout Session]
    D1 --> D2[Client: Redirect to Stripe Hosted Checkout]
    D2 --> D3[Stripe Webhook → Server: Fulfill Plan]

    C5 & D3 --> E[Convex Database Sync]

    F[Daily Cron 00:30 UTC] --> G{Users with cancelAtPeriodEnd=true\nAND currentPeriodEnd expired?}
    G -- Yes --> H[Downgrade to free]
    G -- No --> I[Skip]
```

### Key Technical Decisions

1. **Server-Side Pricing Control:** All plans, amounts, and metadata are validated and configured on the server. The client cannot send custom pricing to prevent tampering.
2. **Authenticated Cancel & Portal Routes:** The `/api/payments/razorpay/cancel` and `/api/payments/stripe/portal` routes require a valid Clerk session **and** verify that the resource (subscriptionId / customerId) belongs to the authenticated caller before taking any action.
3. **Graceful Cancellations (No Instant Downgrades):** When users cancel, their premium plans remain active (`"pro"` or `"plus"`) with `cancelAtPeriodEnd: true` in Convex until their paid billing period (`currentPeriodEnd`) terminates. Downgrades to `"free"` happen via the `customer.subscription.deleted` webhook **and** the daily safety-net cron.
4. **Webhook Signature Security:** All webhook entry points use `crypto.timingSafeEqual` (Razorpay) and `stripe.webhooks.constructEvent` (Stripe) to prevent replay / spoofing. The Razorpay verify route will return `500` if `RAZORPAY_KEY_SECRET` is missing — it never falls back to an empty string.
5. **Plan Upgrade is Server-Only:** The `upgradeAccount` Convex mutation is an `internalMutation`. It cannot be called from any browser client — only from other Convex server functions (e.g., coupon redemption flows).

---

## 2. Dynamic Location-Based Routing

The entry point for payment selection resides in the frontend Pricing component (`src/modules/web/Pricing.tsx`):

- **IP Lookup API:** Hits `https://ipapi.co/json/` to fetch the client's current country code on page load.
- **Condition:** If `country_code === "IN"`, payments route to `useRazorpay()`. Otherwise, they route to `useStripeCheckout()`.
- **Fallback:** If geolocation fails, `isIndia` defaults to `false` (Stripe). Indian users on unstable connections may be routed to Stripe — replace `ipapi.co` with a more reliable authenticated provider (e.g., `x-vercel-ip-country` header or ipinfo.io) before full production launch.

---

## 3. Stripe Integration Breakdown

Stripe is integrated completely server-side, using hosted Checkout Sessions and the Customer Billing Portal.

### A. Stripe Keys — Where to Get Them

Log into [Stripe Dashboard](https://dashboard.stripe.com/) and obtain:

1. **`STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`:** Developers → API Keys.
2. **`STRIPE_PLUS_PRICE_ID` / `STRIPE_PRO_PRICE_ID`:**
   - Go to **Product Catalog** → **Add Product**.
   - Create "Plus" ($7/mo) and "Pro" ($16/mo) as **recurring monthly** products.
   - Copy the **Price IDs** (starts with `price_...`). ⚠️ **Do NOT use the Product ID (`prod_...`)** — that will cause a hard error on every checkout.
3. **`STRIPE_WEBHOOK_SECRET`:** Generated when you create a webhook endpoint (see Section 3C).
4. **`STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL`:** Set to your production domain URLs, not localhost.

### B. Local Webhook Testing (Stripe CLI)

```bash
# 1. Login to your Stripe account
stripe login

# 2. Forward webhook events to your local server
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

Copy the `whsec_...` signing secret printed by the CLI and set it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### C. Production Webhook Configuration

1. Go to **Developers → Webhooks → Add Endpoint**.
2. URL: `https://yourdomain.com/api/payments/stripe/webhook`
3. Select these events:
   - `checkout.session.completed` — initial payment fulfillment
   - `customer.subscription.updated` — scheduled cancellations, plan changes
   - `customer.subscription.deleted` — downgrade when billing term ends
4. Copy the **Signing Secret** → `STRIPE_WEBHOOK_SECRET` in production env.

### D. Stripe Billing Portal (Cancel / Manage)

The portal route (`/api/payments/stripe/portal`) is guarded:
1. Caller must be authenticated (Clerk session required → `401` otherwise).
2. The `customerId` in the request body is verified against the caller's Convex record via `api.stripe.verifyCustomerOwner` → `403` if mismatch.
3. Only then is a Stripe Billing Portal session created and the URL returned.

---

## 4. Razorpay Integration Breakdown

Razorpay uses a hybrid flow: subscription created on the server, processed on the client via the Razorpay Web SDK, then verified securely back on the server.

### A. Razorpay Keys — Where to Get Them

Log into [Razorpay Dashboard](https://dashboard.razorpay.com/):

1. **`NEXT_PUBLIC_RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`:** Account & Settings → API Keys.
2. **`RAZORPAY_PLUS_PLAN_ID` / `RAZORPAY_PRO_PLAN_ID`:**
   - Go to **Subscriptions → Plans → Create Plan**.
   - Define the interval (monthly) and amount (₹649 / ₹1499).
   - Copy the Plan IDs (e.g., `plan_...`). ⚠️ **Do NOT use placeholder values** — the subscription creation will fail.
3. **`RAZORPAY_WEBHOOK_SECRET`:** Set when creating a webhook in Razorpay Dashboard (see Section 4C).

### B. Local Webhook Testing (ngrok)

Razorpay has no CLI forwarder — use ngrok to expose localhost:

```bash
ngrok http 3000
```

1. Copy the HTTPS URL (e.g., `https://xxxx-xx.ngrok-free.app`).
2. Razorpay Dashboard → Settings → Webhooks → Add New Webhook.
3. Webhook URL: `https://xxxx-xx.ngrok-free.app/api/payments/razorpay/webhook`
4. Set a strong **Webhook Secret** → `RAZORPAY_WEBHOOK_SECRET` in `.env.local`.
5. Active Events:
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.halted`
   - `subscription.paused`
   - `subscription.resumed`

### C. Production Webhook Configuration

Update the Webhook URL to: `https://yourdomain.com/api/payments/razorpay/webhook`

### D. Razorpay Cancel Flow

The cancel route (`/api/payments/razorpay/cancel`) is guarded:
1. Caller must be authenticated (Clerk session required → `401` otherwise).
2. The `subscriptionId` in the request body is verified against the caller's Convex record via `api.razorpay.verifySubscriptionOwner` → `403` if mismatch.
3. Only then does `razorpay.subscriptions.cancel(subscriptionId, true)` execute (scheduled at period end, not immediate).
4. Convex is updated immediately with `cancelAtPeriodEnd: true` so the UI reflects the cancellation without waiting for the webhook.

### E. Razorpay Payment Signature Verification (Security)

The verify route (`/api/payments/razorpay/verify`) computes:
```
HMAC-SHA256(RAZORPAY_KEY_SECRET, razorpay_payment_id + "|" + razorpay_subscription_id)
```

**Critical rules enforced:**
- If `RAZORPAY_KEY_SECRET` is missing, the route returns `500`. It **never** falls back to an empty string (an empty HMAC key allows anyone to forge signatures).
- Signature comparison uses `crypto.timingSafeEqual` wrapped in `try/catch` — no pre-length-check is done (which would re-introduce a timing side channel).

---

## 5. Convex Database Architecture

Both payment integrations feed into a unified schema in `convex/schema.ts`.

### A. User Document — Payment Fields

```typescript
users: defineTable({
  accountType: v.union(v.literal("free"), v.literal("plus"), v.literal("pro")),

  // Subscription Data
  subscriptionId:       v.optional(v.string()),  // Stripe sub_... or Razorpay sub_...
  customerId:           v.optional(v.string()),  // Stripe cus_... (not used by Razorpay)
  subscriptionStatus:   v.optional(v.string()),  // "active", "cancelled", "past_due", etc.
  subscriptionProvider: v.optional(v.string()),  // "stripe" | "razorpay"
  currentPeriodEnd:     v.optional(v.number()),  // Unix timestamp in ms
  cancelAtPeriodEnd:    v.optional(v.boolean()), // true = scheduled to cancel at cycle end
  planExpiry:           v.optional(v.number()),  // For temporary coupon-based upgrades
})
  .index("by_subscriptionId", ["subscriptionId"])
  .index("by_customerId",     ["customerId"])
  .index("by_accountType",    ["accountType"])   // Used by downgrade cron
```

### B. Convex Mutations & Queries — Payment Functions

| File | Function | Type | Purpose |
|------|----------|------|---------|
| `convex/stripe.ts` | `updatePlanServerSide` | `mutation` | Fulfills new Stripe subscription (called from checkout webhook) |
| `convex/stripe.ts` | `handleSubscriptionUpdate` | `mutation` | Updates status/cancelAtPeriodEnd for subscription changes (called from webhook) |
| `convex/stripe.ts` | `verifyCustomerOwner` | `query` | Verifies a `customerId` belongs to a given Clerk user (called from portal route) |
| `convex/razorpay.ts` | `updatePlanServerSide` | `mutation` | Fulfills new Razorpay subscription (called from verify route) |
| `convex/razorpay.ts` | `handleSubscriptionUpdate` | `mutation` | Updates status/cancelAtPeriodEnd for subscription changes (called from cancel route + webhook) |
| `convex/razorpay.ts` | `verifySubscriptionOwner` | `query` | Verifies a `subscriptionId` belongs to a given Clerk user (called from cancel route) |
| `convex/payments.ts` | `downgradeExpiredPlans` | `internalMutation` | Scans paid users and downgrades those with expired periods (called by cron) |
| `convex/user.ts` | `upgradeAccount` | `internalMutation` | Upgrades a user's plan — **server-only**, not callable from browser |

### C. Cancellation Grace Period Flow

#### Stripe
1. User clicks "Cancel subscription" → frontend calls `/api/payments/stripe/portal`.
2. Portal route verifies auth + ownership, creates a Stripe Billing Portal session.
3. User cancels inside Stripe's portal → Stripe fires `customer.subscription.updated`.
4. Webhook calls `handleSubscriptionUpdate` in Convex: sets `cancelAtPeriodEnd: true`, saves `currentPeriodEnd`. Plan stays `plus`/`pro`.
5. At cycle end, Stripe fires `customer.subscription.deleted` → webhook sets `accountType: "free"`.
6. **Safety net:** Daily cron at 00:30 UTC also catches missed webhooks.

#### Razorpay
1. User clicks "Cancel subscription" → frontend calls `/api/payments/razorpay/cancel`.
2. Cancel route verifies auth + ownership, calls `razorpay.subscriptions.cancel(id, true)`.
3. Convex is updated immediately: `cancelAtPeriodEnd: true`, `status: "active"`.
4. UI shows "Ends on [date]" immediately without waiting for webhook.
5. At cycle end, Razorpay fires `subscription.cancelled` → webhook sets `accountType: "free"`.
6. **Safety net:** Daily cron at 00:30 UTC also catches missed webhooks.

---

## 6. Auto-Downgrade Cron (Safety Net)

**File:** `convex/payments.ts` — `downgradeExpiredPlans`
**Schedule:** Daily at **00:30 UTC** (defined in `convex/crons.ts`)

This cron is the safety net for when provider webhooks are delayed or missed. It:
1. Queries all `plus` and `pro` users using the `by_accountType` index.
2. Filters those where `cancelAtPeriodEnd === true` AND `currentPeriodEnd < Date.now()`.
3. Patches matching users: `accountType → "free"`, `subscriptionStatus → "canceled"`, `cancelAtPeriodEnd → false`.

> **Important:** This cron runs **in addition to** (not instead of) webhook-based downgrades. Webhooks are the primary mechanism and fire in near-real-time; the cron is the daily catch-all.

---

## 7. Complete Environment Variable Reference

Add these to `.env.local` (local dev) and your production host (Vercel / Convex dashboard env vars).

| Variable | Required For | Source | Notes |
|----------|-------------|--------|-------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client SDK + verify route | Razorpay API Keys | `rzp_live_...` in production |
| `RAZORPAY_KEY_SECRET` | Server verify + cancel routes | Razorpay API Keys | Never expose to client. Missing = 500, not empty HMAC |
| `RAZORPAY_PLUS_PLAN_ID` | Subscription creation | Razorpay Plans | Must be real `plan_...` ID, not placeholder |
| `RAZORPAY_PRO_PLAN_ID` | Subscription creation | Razorpay Plans | Must be real `plan_...` ID, not placeholder |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook signature verification | Razorpay Webhook Settings | Use a strong random secret |
| `STRIPE_SECRET_KEY` | All Stripe server routes | Stripe API Keys | `sk_live_...` in production |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Reference only | Stripe API Keys | Currently unused client-side |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verifier | Stripe CLI / Webhook Settings | `whsec_...` |
| `STRIPE_SUCCESS_URL` | Redirect after checkout | Your app URL | Use production URL, not localhost |
| `STRIPE_CANCEL_URL` | Redirect on checkout cancel | Your app URL | Use production URL, not localhost |
| `STRIPE_PLUS_PRICE_ID` | Stripe Checkout | Stripe Product Catalog | Must be `price_...`, NOT `prod_...` |
| `STRIPE_PRO_PRICE_ID` | Stripe Checkout | Stripe Product Catalog | Must be `price_...`, NOT `prod_...` |
| `BACKEND_SECRET` | Server-to-Convex auth | Generated 64-char hex | All payment mutations validate this |
| `NEXT_PUBLIC_CONVEX_URL` | ConvexHttpClient in API routes | Convex Dashboard | `https://xxx.convex.cloud` |

---

## 8. API Route Security Summary

| Route | Auth Required | Ownership Check | Notes |
|-------|-------------|-----------------|-------|
| `POST /api/payments/stripe/checkout` | ❌ No Clerk auth | — | User provides userId; rate limit recommended |
| `POST /api/payments/stripe/webhook` | ✅ Stripe signature | — | Public (webhooks are server-to-server) |
| `POST /api/payments/stripe/portal` | ✅ Clerk auth | ✅ customerId ownership | Returns 401 / 403 on violation |
| `POST /api/payments/razorpay/subscription` | ❌ No Clerk auth | — | Rate limit recommended |
| `POST /api/payments/razorpay/verify` | ❌ No Clerk auth | ✅ HMAC signature | Signature IS the proof of payment |
| `POST /api/payments/razorpay/cancel` | ✅ Clerk auth | ✅ subscriptionId ownership | Returns 401 / 403 on violation |
| `POST /api/payments/razorpay/webhook` | ✅ Razorpay HMAC signature | — | Public (webhooks are server-to-server) |

---

## 9. Adding New Plans (Future Expansion)

To add a new tier (e.g., "Enterprise"):

1. **Schema:** Add `v.literal("enterprise")` to `accountType` in `convex/schema.ts`.
2. **Plan limits:** Add `enterprise` entry to `PLAN_CONFIGS` in `convex/pricing.ts`.
3. **Stripe:** Create product in Stripe → get `price_...` ID → set `STRIPE_ENTERPRISE_PRICE_ID`.
4. **Razorpay:** Create plan in Razorpay → get `plan_...` ID → set `RAZORPAY_ENTERPRISE_PLAN_ID`.
5. **Checkout route:** Add `planType === "enterprise"` branch in `stripe/checkout/route.ts` and `razorpay/subscription/route.ts`.
6. **UI:** Add new plan object to the `plans` array in `src/modules/web/Pricing.tsx`.
7. **Convex mutations:** Update `updatePlanServerSide` arg validators in `stripe.ts` and `razorpay.ts` to accept `"enterprise"`.
