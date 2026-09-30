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
    title: "Linear & Sentry Issue Triage & Notion Sync",
    description:
      "Fetches active issues from Linear and unresolved production errors from Sentry, aggregates them into structured markdown tables, and creates a Notion page.",
    connectorId: "linear, sentry, notion",
    createdBy: "default",
    isDefault: true,
    content: `---
name: cross_platform_issue_triage_notion_sync
title: Linear & Sentry Issue Triage & Notion Sync
connectorId: linear, sentry, notion
version: 1.3.0
---

# Linear & Sentry Issue Triage & Notion Sync

## Execution Steps
1. **Linear** → call \`list_issues\` with \`{}\`. Extract \`id\`, \`title\`, \`priority\`, \`state\`, \`url\`.
2. **Sentry** → call \`find_organizations\` → capture \`organizationSlug\` → call \`search_issues\` with \`{organizationSlug, query: "is:unresolved", sort: "date"}\`. Extract error title, culprit, event count, url.
3. **Notion** → call \`notion-create-pages\` with \`{creation_mode: "draft", allow_async: false, pages: [{properties: {title: "Linear & Sentry Issue Triage - Live Sync"}, content: "<markdown>", icon: "📊"}]}\`. Capture returned \`id\` and \`url\`.
4. **Finalize** → call \`finalize_result\` with the created Notion page URL and issue counts.

## Rules
- Only output IDs, URLs, and counts that appear verbatim in tool responses. Never invent keys or links.
- Never claim the page was created until \`notion-create-pages\` returns a valid \`id\`.
- End with \`finalize_result\` containing the Notion page URL, issue counts, and top-priority highlights.

## Execution Configuration
\`\`\`json
{
  "maxSteps": 2,
  "pinnedTools": {
    "linear": [
      {
        "name": "list_issues",
        "description": "List all Linear issues. Returns issues array with id, title, priority, state, url.",
        "inputSchema": { "type": "object", "properties": {}, "required": [] }
      }
    ],
    "sentry": [
      {
        "name": "find_organizations",
        "description": "Find Sentry orgs. Returns organizations array each with a slug. Call first before search_issues.",
        "inputSchema": { "type": "object", "properties": {}, "required": [] }
      },
      {
        "name": "search_issues",
        "description": "Search Sentry issues. Requires organizationSlug. Use query 'is:unresolved', sort 'date'.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "organizationSlug": { "type": "string" },
            "query": { "type": "string" },
            "sort": { "type": "string" }
          },
          "required": ["organizationSlug", "query"]
        }
      }
    ],
    "notion": [
      {
        "name": "notion-create-pages",
        "description": "Create Notion pages. Pass creation_mode 'draft', allow_async false for sync id return.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "pages": { "type": "array", "items": { "type": "object" } },
            "creation_mode": { "type": "string", "enum": ["draft"] },
            "allow_async": { "type": "boolean" }
          },
          "required": ["pages"]
        }
      }
    ]
  }
}
\`\`\``,
  },
  {
    name: "jira_project_tasks_alignment_notion_sync",
    title: "Project & Jira Tasks Alignment & Notion Action Plan",
    description:
      "Fetches internal project tasks and live Jira tasks via JQL, performs cross-system alignment and workload gap analysis, generates actionable insights and recommended actions, and publishes a structured report to Notion.",
    connectorId: "jira, notion, project",
    createdBy: "default",
    isDefault: true,
    content: `---
name: jira_project_tasks_alignment_notion_sync
title: Project & Jira Tasks Alignment & Notion Action Plan
connectorId: jira, notion, project
version: 1.0.0
---

# Project & Jira Tasks Alignment & Notion Action Plan

## Context & Objectives
This skill coordinates internal project tasks and external Jira Kanban/Scrum tasks to identify unassigned items, status mismatches, and delivery blockers, synthesizing them into actionable insights and publishing a strategic plan to Notion.

## Step-by-Step Execution Workflow
1. **Jira Discovery:**
   - Tool: \`getAccessibleAtlassianResources\`
   - Arguments: \`{}\`
   - Capture: Active \`cloudId\` (e.g. \`e56da97a-1da4-40fd-bed2-4c2663ef28e7\`).

2. **Jira Tasks Query (Adaptive JQL):**
   - Tool: \`searchJiraIssuesUsingJql\`
   - **Default JQL (Universal for any project):**
     \`\`\`json
     {
       "cloudId": "<discovered_cloudId>",
       "jql": "status IS NOT NULL ORDER BY updated DESC",
       "maxResults": 20
     }
     \`\`\`
     *(Notice: Do not filter by \`project = '...'\` unless specifically requested. This queries all active issues across accessible boards without failing on project key mismatch).*
   - **If User Explicitly Specified a Project:** If the user prompt specifically specifies a Jira project (e.g. 'project KAN' or 'project Payments'), pass:
     \`jql: "project = '<ProjectKeyOrName>' AND status IS NOT NULL ORDER BY updated DESC"\`.
     If Jira returns an error that the project does not exist, immediately fall back to \`status IS NOT NULL ORDER BY updated DESC\`.
   - Never restrict search strictly to \`assignee = currentUser()\` because tickets in the board may be unassigned.
   - Extract: Issue \`key\` (e.g. \`KAN-5\`), \`summary\`, \`status.name\`, \`priority.name\`, \`assignee.displayName\` (or Unassigned).

3. **Internal Project Tasks Ingestion:**
   - Ingest active project tasks, priorities, assignees, and deadlines.

4. **Strategic Synthesis & Gap Analysis:**
   - Cross-reference internal tasks against Jira items.
   - Formulate 3-5 concrete **Actionable Insights** (unassigned blockers, mismatched priorities, overdue items) and 2-3 immediate **Recommended Actions**.

5. **Notion Publication:**
   - Tool: \`notion-create-pages\`
   - Arguments:
     \`\`\`json
     {
       "creation_mode": "draft",
       "allow_async": false,
       "pages": [
         {
           "properties": {
             "title": "Project & Jira Tasks Alignment & Action Plan"
           },
           "content": "<Comprehensive Markdown Report with Project Tasks Table, Jira Tasks Table, Actionable Insights & Recommended Actions>",
           "icon": "🎯"
         }
       ]
     }
     \`\`\`
   - Capture returned \`id\` and \`url\`.

6. **Finalization Handshake:**
   - Call \`finalize_result\` with:
     * Created Notion Page URL
     * Task count breakdown (Internal vs Jira)
     * Top-priority blockers and immediate actions.

## Strict Rules
- Always use the discovered \`cloudId\`, never guess an arbitrary ID.
- Never claim the Notion page is created until \`notion-create-pages\` returns a valid \`id\` and \`url\`.
- End with \`finalize_result\` containing the Notion page URL and strategic highlights.

## Execution Configuration
\`\`\`json
{
  "maxSteps": 2,
  "pinnedTools": {
    "jira": [
      {
        "name": "getAccessibleAtlassianResources",
        "description": "Discover accessible Atlassian cloudId and resources. Call first before running JQL.",
        "inputSchema": { "type": "object", "properties": {}, "required": [] }
      },
      {
        "name": "searchJiraIssuesUsingJql",
        "description": "Search Jira issues using JQL. Pass cloudId and bounded jql 'status IS NOT NULL ORDER BY updated DESC'.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "cloudId": { "type": "string" },
            "jql": { "type": "string" },
            "maxResults": { "type": "number" }
          },
          "required": ["cloudId", "jql"]
        }
      }
    ],
    "notion": [
      {
        "name": "notion-create-pages",
        "description": "Create Notion pages. Pass creation_mode 'draft', allow_async false for sync id return.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "pages": { "type": "array", "items": { "type": "object" } },
            "creation_mode": { "type": "string", "enum": ["draft"] },
            "allow_async": { "type": "boolean" }
          },
          "required": ["pages"]
        }
      }
    ]
  }
}
\`\`\``,
  },
];

/**
 * Retrieves all skills for the active user:
 * - 4 Global default skills (where userId is null or undefined)
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

    const filtered = allSkills.filter(
      (s) => !s.userId || (currentUserId && s.userId === currentUserId),
    );

    // Merge in code DEFAULT_SKILLS so newly added default skills are always available
    const result = [...filtered];
    for (const defaultSkill of DEFAULT_SKILLS) {
      const existingIdx = result.findIndex((s) => s.name === defaultSkill.name);
      if (existingIdx === -1) {
        result.push({
          _id: `default_${defaultSkill.name}` as unknown as Id<"skills">,
          ...defaultSkill,
          userId: undefined,
          createdAt: Date.now(),
        } as any);
      } else if (result[existingIdx].isDefault) {
        result[existingIdx] = {
          ...result[existingIdx],
          content: defaultSkill.content,
          title: defaultSkill.title,
          description: defaultSkill.description,
          connectorId: defaultSkill.connectorId,
        };
      }
    }

    return result;
  },
});

/**
 * Idempotent seeder: Seeds/updates default skills in Convex DB.
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
      } else if (match.isDefault) {
        await ctx.db.patch(match._id, {
          title: skill.title,
          description: skill.description,
          connectorId: skill.connectorId,
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
