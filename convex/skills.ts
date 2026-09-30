import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const DEFAULT_SKILLS = [
  {
    name: "sentry_error_triage",
    title: "Sentry Error Triage & Root Cause Analysis",
    description:
      "Discovers organizations, fetches unresolved production errors with bounded queries, identifies culprit routes, and isolates critical system crashes.",
    connectorId: "sentry",
    createdBy: "default",
    isDefault: true,
    content: `---
name: sentry_error_triage
title: Sentry Error Triage & Root Cause Analysis
description: Discovers Sentry organizations, fetches unresolved production errors with bounded queries, identifies culprit routes, and isolates critical system crashes.
connectorId: sentry
createdBy: default
version: 1.0.0
---

# Sentry Error Triage Skill

## Context & Objectives
This skill governs how Kaya and MCP sub-agents query live Sentry instances to diagnose unresolved exceptions, trace offending routes, measure affected user blast-radius, and prioritize production incidents.

## Discovery & Prerequisites Protocol
1. **Never guess the Organization Slug:** Always run \`find_organizations\` first to discover the real active slug.
2. **Verify Target Project:** Execute \`find_projects\` with the discovered \`organizationSlug\`. Match with the active project or target repository.

## Step-by-Step Tool Execution Workflow
1. **Step 1 - Discover Organization:**
   - Tool: \`find_organizations\`
   - Arguments: \`{}\`
   - Capture: \`organizationSlug\` (e.g. \`vrsa-solution-6q\`).

2. **Step 2 - Discover Project Slugs:**
   - Tool: \`find_projects\`
   - Arguments: \`{"organizationSlug": "<organizationSlug>"}\`
   - Verify: Sentry project slug (e.g. \`wekraft-saas\`).

3. **Step 3 - Query Unresolved Issues (Bounded):**
   - Tool: \`search_issues\`
   - Arguments:
     \`\`\`json
     {
       "organizationSlug": "<organizationSlug>",
       "query": "is:unresolved",
       "sort": "date"
     }
     \`\`\`
   - Limit: Maximum 10-20 most recent/frequent issues.

4. **Step 4 - Deep Dive on Outlier Issues (Optional / Triggered):**
   - Tool: \`get_sentry_resource\` or \`analyze_issue_with_seer\`
   - Arguments: \`{"issueId": "<issueId>"}\`
   - Extract root cause, stack trace line, and breadcrumb triggers.

## Strict Anti-Hallucination & Execution Rules
- **No Fabricated Error Counts:** You must only report exact \`events\` and \`users\` numbers returned by Sentry.
- **Link Preservation:** Always extract and provide the direct Sentry dashboard permalink (\`https://<org>.sentry.io/issues/<id>\`).
- **Never claim an error is fixed without verification:** An unresolved error remains open until explicit resolution via \`update_issue\`.

## Finalization Handshake
End execution by calling \`finalize_result\` with:
- \`data\`: Array of structured error objects containing \`id\`, \`title\`, \`culprit\`, \`events\`, \`users\`, \`permalink\`.
- \`resolved_context\`: \`{"organizationSlug": "...", "projectSlug": "..."}\`.
- \`summary\`: Concise Markdown table of top errors sorted by blast radius.`,
  },
  {
    name: "linear_issue_management",
    title: "Linear Issue Sync & Safe Ticket Creation",
    description:
      "Discovers Linear workspace teams, lists active/backlog tickets without truncation, safely creates tickets with required team UUIDs, and verifies creation.",
    connectorId: "linear",
    createdBy: "default",
    isDefault: true,
    content: `---
name: linear_issue_management
title: Linear Issue Sync & Safe Ticket Creation
description: Discovers Linear workspace teams, lists active/backlog tickets without truncation, safely creates tickets with required team UUIDs, and verifies creation.
connectorId: linear
createdBy: default
version: 1.0.0
---

# Linear Issue Management Skill

## Context & Objectives
This skill instructs Kaya and MCP sub-agents on how to interact with Linear: discovering workspace teams, synchronizing active/backlog issues, safely creating new tickets with required team identifiers, and preventing duplicate tickets.

## Discovery & Prerequisites Protocol
1. **Team ID is Mandatory for Mutations:** Linear requires a valid \`team\` (UUID or key) to create any issue. Always invoke \`list_teams\` if \`teamId\` is unknown.
2. **Never guess IDs:** Never pass an arbitrary string as \`team\` without verifying it via \`list_teams\`.

## Step-by-Step Tool Execution Workflow
1. **Step 1 - Team Discovery:**
   - Tool: \`list_teams\`
   - Arguments: \`{}\`
   - Extract: Team \`id\` (e.g. \`cd2935a6-0118-443e-826a-7bba84d6a2ed\`) and \`name\`.

2. **Step 2 - Sync Active Issues:**
   - Tool: \`list_issues\`
   - Arguments: \`{}\`
   - Filter locally for tickets that are not closed or completed (\`statusType != "completed"\` and \`statusType != "canceled"\`).

3. **Step 3 - Safe Issue Creation:**
   - Tool: \`save_issue\`
   - Arguments:
     \`\`\`json
     {
       "title": "<Concise, actionable title>",
       "team": "<Discovered Team ID>",
       "description": "<Detailed context, reproduction steps, or error source>",
       "priority": 1
     }
     \`\`\`

4. **Step 4 - Read-After-Write Verification:**
   - Tool: \`list_issues\`
   - Verify: Confirm that the newly created issue ID (e.g. \`TES-10\`) is present in the workspace registry.

## Strict Anti-Hallucination & Execution Rules
- **No Speculative Creation:** Never tell the user an issue "has been created" until \`save_issue\` returns a valid payload with an \`id\` and \`url\`.
- **Deduplication Check:** Before calling \`save_issue\`, cross-reference existing ticket titles to prevent creating duplicate tickets for the same bug or task.
- **Link Preservation:** Always include the direct Linear issue URL (\`https://linear.app/...\`) in the final output.

## Finalization Handshake
End execution by calling \`finalize_result\` with:
- \`data\`: List of created or retrieved Linear issues with keys, titles, priorities, and statuses.
- \`resolved_context\`: \`{"teamId": "...", "teamName": "..."}\`.
- \`summary\`: Markdown table with issue keys, titles, status badges, and direct links.`,
  },
  {
    name: "incident_escalation_triage",
    title: "Cross-App Production Incident Escalation",
    description:
      "Coordinates Sentry telemetry, Linear ticketing, and internal project issues to escalate critical production crashes (>10 events) into actionable engineering tickets.",
    connectorId: "sentry, linear, project",
    createdBy: "default",
    isDefault: true,
    content: `---
name: incident_escalation_triage
title: Cross-App Production Incident Escalation
description: Coordinates Sentry telemetry, Linear ticketing, and internal project issues to escalate critical production crashes (>10 events) into actionable engineering tickets.
connectorId: sentry, linear, project
createdBy: default
version: 1.0.0
---

# Cross-App Incident Escalation Skill

## Context & Objectives
This skill defines Kaya's executive orchestration routine across Sentry, Linear, and the internal Convex project database. It automates the detection of high-impact production anomalies and ensures they are safely escalated to the engineering backlog without human intervention or ticket flooding.

## Incident Escalation Thresholds
An error is classified as **Escalation-Ready** when:
1. \`events >= 10\` OR \`users >= 3\` in Sentry.
2. OR error is an unhandled fatal crash (e.g. \`ReferenceError\`, \`InvalidStateError\`, \`Bad credentials\`).
3. AND no open issue currently exists for this culprit in either Linear or the internal project database.

## Multi-System Coordination Workflow
1. **Phase 1 - Telemetry Ingestion (Sentry):**
   - Query \`sentry_error_triage\` skill to fetch active unresolved issues.
   - Filter for items exceeding the incident escalation threshold.

2. **Phase 2 - Deduplication & Existing Issue Scan (Linear & Project DB):**
   - Query \`linear_issue_management\` to inspect all open Linear tickets (\`TES-...\`).
   - Query internal project issues from Convex DB.
   - If a ticket with a matching culprit/title already exists -> Mark as **Tracked**; update frequency context if necessary.

3. **Phase 3 - Ticket Escalation (Linear MCP or Project DB):**
   - If untracked, construct an escalation ticket:
     * **Title:** \`[Sentry Incident] <Error Class>: <Summary>\`
     * **Description:** Include culprit route, event count, user count, last seen timestamp, and Sentry permalink.
     * **Priority:** \`1 (Urgent)\` if \`events >= 50\` or affects auth/payment; otherwise \`2 (High)\`.
   - Invoke \`save_issue\` via Linear MCP.

4. **Phase 4 - Verification & Audit Log:**
   - Verify ticket creation via \`list_issues\`.
   - Log the escalation in the project trace log with timestamps.

## Strict Anti-Hallucination & Execution Rules
- **No False Alarms:** Never escalate a warning or low-frequency event (<3 events) as an Urgent incident.
- **Traceability:** Every escalated ticket MUST contain the direct Sentry URL and error stack culprit.
- **Never claim escalation without verification:** If Linear credentials are missing or disconnected, gracefully report the Sentry findings and prompt the user to connect Linear in Integrations.

## Finalization Handshake
Return an Executive PM Synthesis featuring:
- **Incident Summary:** Error title, severity, affected route, user count.
- **Escalation Receipt:** Linear Ticket Key (\`TES-...\`), priority, and direct URL.
- **Recommended Action Plan:** Specific component/file to patch.`,
  },
  {
    name: "cross_platform_issue_triage_notion_sync",
    title: "Cross-Platform Issue Triage & Notion Sync",
    description:
      "Fetches active issues across Linear, Sentry, and GitHub, aggregates and synthesizes them into structured markdown tables, and creates a verified Notion documentation page via Notion MCP.",
    connectorId: "linear, sentry, github, notion",
    createdBy: "default",
    isDefault: true,
    content: `---
name: cross_platform_issue_triage_notion_sync
title: Cross-Platform Issue Triage & Notion Sync
description: Fetches active issues across Linear, Sentry, and GitHub, aggregates and synthesizes them into structured markdown tables, and creates a verified Notion documentation page via Notion MCP.
connectorId: linear, sentry, github, notion
createdBy: default
version: 1.0.0
---

# Cross-Platform Issue Triage & Notion Sync Skill

## Context & Objectives
This skill instructs Kaya and MCP sub-agents on how to reliably aggregate issues and production telemetry from Linear, Sentry, and GitHub, format them into an executive-ready triage document, publish it directly as a new Notion page via Notion MCP, and perform read-after-write verification.

---

## Prerequisites & Auth Resolution Protocol
1. **Decrypted Credentials:** Ensure tokens for Linear, Sentry, GitHub, and Notion are decrypted from workspace credentials using AES-256-GCM.
2. **Endpoint Mapping:**
   - **Linear:** \`https://mcp.linear.app/mcp\`
   - **Sentry:** \`https://mcp.sentry.dev/mcp\`
   - **GitHub:** REST \`https://api.github.com\` or GitHub MCP
   - **Notion:** \`https://mcp.notion.com/mcp\`

---

## Step-by-Step Tool Execution Workflow

### Step 1: Linear Issues Ingestion
1. **Tool:** \`list_issues\`
   - Target MCP: \`https://mcp.linear.app/mcp\`
   - Arguments: \`{}\`
2. **Extraction:**
   - Parse \`issues\` array from JSON response.
   - Extract \`id\` (e.g. \`TES-11\`), \`title\`, \`priority.name\`, \`state.name\`, and \`url\`.
   - Filter out closed/completed items if only active items are requested.

### Step 2: Sentry Errors Ingestion
1. **Discovery Tool:** \`find_organizations\`
   - Target MCP: \`https://mcp.sentry.dev/mcp\`
   - Arguments: \`{}\`
   - Capture: Active \`organizationSlug\` (e.g. \`vrsa-solution-6q\`).
2. **Telemetry Tool:** \`search_issues\`
   - Target MCP: \`https://mcp.sentry.dev/mcp\`
   - Arguments:
     \`\`\`json
     {
       "organizationSlug": "<organizationSlug>",
       "query": "is:unresolved",
       "sort": "date"
     }
     \`\`\`
   - Capture: Error title, culprit route, event count, affected user count, and direct dashboard URL.

### Step 3: GitHub Issues Ingestion
1. **API Call:** \`GET https://api.github.com/user/issues?filter=all&state=all&per_page=30\`
   - Headers: \`{"Authorization": "Bearer <github_token>", "Accept": "application/vnd.github.v3+json"}\`
2. **Extraction:**
   - Extract issue \`number\`, \`title\`, \`repository.full_name\`, \`state\`, \`user.login\`, and \`html_url\`.

### Step 4: Markdown Payload Synthesis
Assemble the data into Notion-compatible Enhanced Markdown:
- Use clean Markdown tables with headers (\`| ID | Title | Priority | Status | Link |\`).
- Include direct hyperlinked URLs (\`[Open in Linear](...)\`, \`[Sentry Error](...)\`, \`[GitHub Issue](...)\`).
- Escape pipe characters (\`|\`) in titles to prevent broken table syntax.

### Step 5: Notion Page Creation via Notion MCP
1. **Tool:** \`notion-create-pages\`
   - Target MCP: \`https://mcp.notion.com/mcp\`
   - Arguments:
     \`\`\`json
     {
       "creation_mode": "draft",
       "allow_async": false,
       "pages": [
         {
           "properties": {
             "title": "Unified Issue Triage & Status Report (Linear, Sentry & GitHub)"
           },
           "content": "<Generated Markdown Content>",
           "icon": "📊"
         }
       ]
     }
     \`\`\`
2. **Capture Output:**
   - Extract created page \`id\` (UUID) and \`url\` (e.g. \`https://app.notion.com/p/<pageId>\`).

### Step 6: Read-After-Write Verification
1. **Tool:** \`notion-fetch\`
   - Target MCP: \`https://mcp.notion.com/mcp\`
   - Arguments: \`{"id": "<created_page_id>"}\` (Note: parameter key is \`id\`, not \`page_id\`).
2. **Verification Check:**
   - Confirm response status is success and page content contains the synced sections.

---

## Strict Anti-Hallucination & Execution Rules
1. **Zero Hallucinated Issue Keys:** NEVER invent Linear keys (e.g. \`LIN-99\`) or Sentry IDs (e.g. \`ERR-404\`). Only output IDs present in the exact tool responses.
2. **Verified Counts Only:** Only report the exact number of tickets/errors returned by the respective tool calls.
3. **No Phantom URLs:** Always use the exact URLs returned by Linear, Sentry, and GitHub API responses.
4. **Mandatory Verification:** Never claim the Notion page is created without inspecting the response from \`notion-create-pages\` and verifying via \`notion-fetch\`.
5. **Parameter Precision:** In \`notion-fetch\`, always pass \`{"id": "<page_id>"}\`. In \`notion-create-pages\`, always pass \`creation_mode: "draft"\` when creating private workspace-level pages.

---

## Finalization Handshake
Return structured output with:
- **Notion Page URL & ID:** Permalinks to access the newly created document.
- **Synchronized Breakdown:** Exact counts of Linear tickets, Sentry unresolved errors, and GitHub issues included.
- **Top Priority Highlights:** Critical crashes or urgent tickets flagged for immediate team attention.`,
  },
];

/**
 * Retrieves all skills for the active user:
 * - 3 Global default skills (where userId is null or undefined)
 * - User's custom skills (where userId matches current user)
 */
export const getUserSkills = query({
  args: {
    userId: v.optional(v.union(v.null(), v.id("users"))),
  },
  handler: async (ctx, args) => {
    let currentUserId = args.userId ?? undefined;

    if (!currentUserId) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("clerkToken", identity.tokenIdentifier),
          )
          .unique();
        if (user) currentUserId = user._id;
      }
    }

    const allSkills = await ctx.db.query("skills").collect();

    if (allSkills.length === 0) {
      return DEFAULT_SKILLS.map((s, idx) => ({
        _id: `default_${idx}` as unknown as Id<"skills">,
        ...s,
        userId: undefined,
        createdAt: Date.now(),
      }));
    }

    return allSkills.filter(
      (s) => !s.userId || (currentUserId && s.userId === currentUserId),
    );
  },
});

/**
 * Idempotent seeder: Seeds/updates the 3 default skills in Convex DB.
 */
export const seedDefaultSkills = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("skills").collect();
    let updatedCount = 0;
    const now = Date.now();

    for (const skill of DEFAULT_SKILLS) {
      const match = existing.find((s) => s.name === skill.name);
      if (!match) {
        await ctx.db.insert("skills", {
          name: skill.name,
          title: skill.title,
          description: skill.description,
          content: skill.content,
          createdBy: "default",
          connectorId: skill.connectorId,
          isDefault: true,
          createdAt: now,
          updatedAt: now,
        });
        updatedCount++;
      } else if (match.createdBy !== "default" || !match.isDefault) {
        await ctx.db.patch(match._id, {
          createdBy: "default",
          isDefault: true,
          content: skill.content,
          updatedAt: now,
        });
        updatedCount++;
      }
    }

    return { success: true, updatedCount };
  },
});

/**
 * Creates a new custom skill belonging to the authenticated user.
 * Supports createdBy: "user" | "agent"
 */
export const createSkill = mutation({
  args: {
    name: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    content: v.string(),
    createdBy: v.union(v.literal("user"), v.literal("agent")),
    connectorId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    let finalUserId = args.userId;

    if (!finalUserId) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query("users")
          .withIndex("by_token", (q) =>
            q.eq("clerkToken", identity.tokenIdentifier),
          )
          .unique();
        if (user) finalUserId = user._id;
      }
    }

    const now = Date.now();
    const cleanName = args.name.toLowerCase().replace(/[^a-z0-9_-]/g, "_");

    const id = await ctx.db.insert("skills", {
      userId: finalUserId,
      name: cleanName,
      title: args.title,
      description: args.description,
      content: args.content,
      createdBy: args.createdBy,
      connectorId: args.connectorId,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, skillId: id };
  },
});

/**
 * Deletes a custom skill (guards against deleting platform default skills)
 */
export const deleteSkill = mutation({
  args: {
    skillId: v.id("skills"),
  },
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.skillId);
    if (!skill) return { success: false, message: "Skill not found" };
    if (skill.isDefault) {
      throw new ConvexError("Default platform skills cannot be deleted.");
    }

    await ctx.db.delete(args.skillId);
    return { success: true };
  },
});
