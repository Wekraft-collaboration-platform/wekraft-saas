# WeKraft 2.0 Security & Audit Logs Plan

This document outlines the architecture for integrating Application-Level Encryption (ALE) for Tasks, Issues, and Customer Desk, as well as introducing a basic Audit Log system restricted to the **Pro** tier.

---

## 1. Application-Level Encryption (ALE)

### Target Tables & Fields to Encrypt
To preserve database searchability on titles and status while ensuring absolute data confidentiality, we will encrypt only the body content, comments, and PII.

| Table | Target Plaintext Field | Storage Field (Encrypted Object) | Why Encrypt? |
| :--- | :--- | :--- | :--- |
| `tasks` | `description` | `descriptionEncrypted` | Sensitive internal requirements and links. |
| `taskComments` | `comment` | `commentEncrypted` | Dev discussions and passwords/tokens. |
| `issues` | `description` | `descriptionEncrypted` | Detailed bug reports and error outputs. |
| `issueComments` | `comment` | `commentEncrypted` | Issue resolution details and comments. |
| `serviceCustomers` | `name` | `nameEncrypted` | Customer PII. |
| `serviceCustomers` | `email` | `emailEncrypted` + `emailBlindIndex` | Customer PII (requires exact-match check). |
| `serviceCustomers` | `contact` | `contactEncrypted` | Customer phone numbers. |
| `serviceRequests` | `description` | `descriptionEncrypted` | Customer-reported bug details or requests. |

---

## 2. Encryption Architecture (AES-256-GCM)

We will implement a Node/V8-native utility in `convex/encryption.ts`.

### Cryptographic Details
*   **Algorithm:** `aes-256-gcm` (Authenticated Encryption with Associated Data).
*   **Initialization Vector (IV):** 12 cryptographically random bytes generated per field value.
*   **Authentication Tag:** 16-byte tag verifying integrity (tamper-proofing).
*   **Key Storage:** Plaintext key `DB_ENCRYPTION_KEY` supplied via project environment variables.

### The Blind Index Pattern for Email
Since `serviceCustomers` has a uniqueness constraint on `email` per project, we cannot search or prevent duplicates if the email is encrypted with a random IV.
*   **Solution:** We store `emailBlindIndex: string` using `HMAC-SHA256(email, BLIND_INDEX_SALT)`.
*   During registration/edit, we hash the email and query:
    ```typescript
    const existing = await ctx.db
      .query("serviceCustomers")
      .withIndex("by_project_email_blind_index", (q) =>
        q.eq("projectId", projectId).eq("emailBlindIndex", hashedEmail)
      )
      .unique();
    ```

---

## 3. Basic Audit Logs (Pro Tier Only)

### Schema Design (`auditLogs` Table)
```typescript
auditLogs: defineTable({
  projectId: v.id("projects"),           // Scope
  userId: v.id("users"),                 // Actor
  userName: v.string(),                  // Actor display name
  userEmail: v.string(),                 // Actor email
  action: v.string(),                    // Action code (e.g. "task.create", "issue.delete")
  targetType: v.union(                   // Affected module
    v.literal("task"),
    v.literal("issue"),
    v.literal("customer"),
    v.literal("request")
  ),
  targetId: v.string(),                  // Resource ID
  targetTitle: v.string(),               // Resource name/title
  changes: v.optional(v.any()),          // e.g. { before: { status: "inprogress" }, after: { status: "completed" } }
  createdAt: v.number(),                 // Timestamp
})
.index("by_project_time", ["projectId", "createdAt"])
.index("by_project_action", ["projectId", "action", "createdAt"])
```

### Pro Plan Access Verification
To show/record audit logs, we fetch the project's owner's subscription tier:
1.  **Creation Flow:** Every major mutation checks if the project owner's plan is `pro`. If so, we call `ctx.db.insert("auditLogs", ...)` asynchronously or as part of the transaction.
2.  **Retrieval Flow:** The query to fetch audit logs checks the user's role and verification plan. If the plan is not `pro`, we throw an error or return an empty state prompting an upgrade.

### How to Show Audit Logs to Users
*   **UI Placement:** Add an **Audit Log** tab inside the Project Settings interface (`/dashboard/my-projects/[slug]/workspace/settings`).
*   **Visual Style:** A clean table layout displaying:
    *   **Timestamp** (relative / formatted).
    *   **Actor** (Avatar + Name).
    *   **Action** (e.g. `Created a Task`).
    *   **Target** (Link to the task/issue).
    *   **Details** (collapsible JSON or pretty-diff showing fields changed).
*   **Paywall State:** Non-pro projects will see a premium blurred background or a beautiful lock screen with a CTA to upgrade to the Pro plan.

---

## 4. Zero-Downtime Migration & Backward Compatibility
To prevent any data loss, schema validation crashes, or downtime for existing production data, we will implement a multi-stage migration strategy.

### Step 4.1: Dual-Type Schema Definitions
Instead of renaming fields or forcing immediate conversion, we will configure Convex schema tables to allow **both** legacy plaintext strings and encrypted objects:

```typescript
// Example for tasks description field in schema.ts
description: v.optional(
  v.union(
    v.string(), // Legacy plaintext data
    v.object({  // Encrypted GCM object
      ciphertext: v.string(),
      iv: v.string(),
      tag: v.string(),
    })
  )
)
```

This prevents any database validation errors when querying old records.

### Step 4.2: Decryption with Plaintext Fallback
Our `decryptField` utility will check the structure of the retrieved field at runtime:
*   If the field is a standard `string`, it is returned directly (allowing the user to see legacy plaintext data without error).
*   If the field is an `object` matching the GCM format, it is decrypted and returned as a string.

```typescript
export function decryptField(data: string | { ciphertext: string; iv: string; tag: string }): string {
  if (typeof data === "string") {
    return data; // Plaintext fallback for legacy production data
  }
  return decryptText(data.ciphertext, data.iv, data.tag);
}
```

### Step 4.3: Batch Migration Script (Optional / Recommended)
We will write a Convex internal migration action (`convex/migrations.ts`) that:
1.  Queries documents in paginated batches (e.g., 100 at a time).
2.  Filters for records where target fields are still raw strings.
3.  Encrypts those fields and updates the database records in transactions.
4.  Can be triggered manually from the Convex dashboard once, safely updating all old data without blocking users.

