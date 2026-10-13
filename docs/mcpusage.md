# MCP Tool Usage & Analysis: Jira, Vercel, Sentry & Linear

This document outlines the exact tools executed, parameters passed, API responses returned, and architectural learnings from querying Jira, Vercel, Sentry, and Linear MCP servers using decrypted workspace credentials.

---

## 1. Jira MCP Integration

### Discovered Tools (21 Total)
`getAccessibleAtlassianResources`, `atlassianUserInfo`, `getConfluenceContent`, `createConfluenceContent`, `updateConfluenceContent`, `searchConfluence`, `getJiraIssue`, `searchJiraIssuesUsingJql`, `createJiraIssue`, `editJiraIssue`, `transitionJiraIssue`, `addOrEditJiraIssueComment`, `getLoomVideo`, `getGraphContext`, `getGraphObject`, `addGraphContext`, `discover`, `executeRead`, `executeWrite`, `executeDestructive`, `search`.

---

### Executed Tool Calls & Tasks Found

#### 1. Discovery: `getAccessibleAtlassianResources`
* **Purpose:** Resolve the active Jira `cloudId` and accessible Atlassian products.
* **Arguments:** `{}`
* **Response Payload:** `cloudId: "e56da97a-1da4-40fd-bed2-4c2663ef28e7"` (`https://ronitrai1237.atlassian.net`)

#### 2. Querying Jira Tasks (Bounded JQL: `status IS NOT NULL ORDER BY updated DESC`)
* **Arguments:** 
  ```json
  {
    "cloudId": "e56da97a-1da4-40fd-bed2-4c2663ef28e7",
    "jql": "status IS NOT NULL ORDER BY updated DESC",
    "maxResults": 10
  }
  ```
* **Tasks Retrieved (3 Total):**

| Key | Issue Summary | Issue Type | Status | Priority | Assignee | Created Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`KAN-5`** | `payment failed` | Story | `To Do` | Medium | Unassigned (`null`) | Sept 16, 2026 |
| **`KAN-4`** | `client meet` | Story | `To Do` | Medium | Unassigned (`null`) | Sept 16, 2026 |
| **`KAN-3`** | `Subtask 2.1` | Subtask | `To Do` | - | Unassigned (`null`) | Sept 16, 2026 |

---

### Why the Sub-Agent Missed These Tasks Previously:
1. **Query Filtered by `assignee = currentUser()`:** All 3 tasks in the Jira board are **unassigned** (`assignee: null`), so querying by current user returned 0 tasks.
2. **Project Key Mismatch (`KAN` vs `wekraft-saas`):** The Jira project key is **`KAN`** (Kanban Board), while the workspace name is `wekraft-saas`. Querying `project = "wekraft-saas"` failed because Jira has no project with that key.

---

## 2. Vercel MCP Integration

### Discovered Tools (245 Total)
Key tools include: `list_projects`, `get_project`, `list_deployments`, `get_runtime_logs`, `get_runtime_errors`, `get_git_deployment_context`, `search_vercel_documentation`.

---

### Executed Tool Calls & Raw Results

#### 1. Discovery: `list_projects`
* **Arguments:** `{"limit": "10"}`
* **Response Payload (10 Projects Discovered):**
  * `rox-portfolio-tsdr` (`prj_oOKzrtxXg1joA0q5tyjDjXvPE6Qg`)
  * `rox-portfolio` (`prj_kaqbTYoGJX3nrFQoq0nFDDnvnVIJ`)
  * `looma-sketch-collaborate-deploy` (`prj_2o59OIX6CJhgdJSz4tXYSplekv5R`)
  * `aria-hackathon` (`prj_9U2ye1aPKwxEtE1kRg5TfcAiyEWN`)
  * **`wekraft-saas`** (`prj_y0tqLEHXl6L5DgJTL8nnPT7CYliw`)
  * `upharvilla` (`prj_GGpWouN10gvXAM7c8ZenbH76R52B`)
  * `asian-media` (`prj_F0FatBwxOTAfpZOwYtZoKzC9n2xw`)
  * `reskill-2-0-rox` (`prj_CjKGP0aIz3RCydz6jvY08o2hc8ap`)
  * `spark-path` (`prj_9QXJJQz7azBMV9n0AZlUkrlX5tGX`)
  * `v0-new-year-website` (`prj_8wzzwozbpSmBbPVOaCCucbzIXy68`)

---

#### 2. Project Details & Domains: `get_project`
* **Arguments:** `{"idOrName": "wekraft-saas"}`
* **Response Payload:**
  ```json
  {
    "result": {
      "id": "prj_y0tqLEHXl6L5DgJTL8nnPT7CYliw",
      "name": "wekraft-saas",
      "framework": "nextjs",
      "nodeVersion": "24.x",
      "live": false,
      "domains": [
        "www.wekraft.xyz",
        "wekraft.xyz",
        "wekraft-saas-mrronits-projects.vercel.app",
        "wekraft-saas-git-main-mrronits-projects.vercel.app"
      ],
      "latestDeployment": {
        "id": "dpl_2MhmJyi72yHx693nWHyqFhC5U8dv",
        "url": "wekraft-saas-indx1m512-mrronits-projects.vercel.app",
        "readyState": "READY",
        "target": "production"
      },
      "ssoProtection": {
        "enabled": true,
        "deploymentType": "all_except_custom_domains"
      }
    }
  }
  ```

---

#### 3. Target Deployments: `list_deployments` (Targeted Project)
* **Arguments:** 
  ```json
  {
    "projectId": "prj_y0tqLEHXl6L5DgJTL8nnPT7CYliw",
    "limit": 5
  }
  ```
* **Response Payload (5 Recent Deployments for `wekraft-saas`):**
  1. **Deployment ID:** `dpl_2MhmJyi72yHx693nWHyqFhC5U8dv`
     * **State:** `READY` (Production)
     * **Commit:** `52d4ca35...` (`main` branch) — *"error fixing."*
     * **URL:** `wekraft-saas-indx1m512-mrronits-projects.vercel.app`
  2. **Deployment ID:** `dpl_AeNG3ndwTiN3WSNuXiVcq2jeVTbP`
     * **State:** `ERROR` (Production)
     * **Commit:** `52d4ca35...` (`main` branch) — *"error fixing."*
  3. **Deployment ID:** `dpl_83LCjygKBAfzUPV5RCAkzXor54nq`
     * **State:** `ERROR` (Production)
     * **Commit:** `b4cf3c74...` — *"Merge pull request #180..."*
  4. **Deployment ID:** `dpl_H79rAMyi9efVVFNPZoVtk4aghfzW`
     * **State:** `ERROR` (`version-2-rox` branch) — *"web updates."*
  5. **Deployment ID:** `dpl_EBfnD1DAWLADQZB8ptcheQBmsJdT`
     * **State:** `ERROR` (`version-2-rox` branch) — *"feat(security): update schema..."*

---

## 3. Sentry MCP Integration

### Discovered Tools (9 Total)
`find_organizations`, `find_projects`, `update_issue`, `search_events`, `analyze_issue_with_seer`, `search_issues`, `get_sentry_resource`, `search_sentry_tools`, `execute_sentry_tool`.

---

### Executed Tool Calls & Issues Found

#### 1. Discovery: `find_organizations`
* **Purpose:** Discover organization slug and web URLs.
* **Arguments:** `{}`
* **Response Payload:** `organizationSlug: "vrsa-solution-6q"` (`https://vrsa-solution-6q.sentry.io`)

#### 2. Discovery: `find_projects`
* **Purpose:** Discover Sentry project slugs under the organization.
* **Arguments:** `{"organizationSlug": "vrsa-solution-6q"}`
* **Projects Discovered:** `bounty-monster`, `rox-ide`, **`wekraft-saas`**

#### 3. Action: `search_issues`
* **Arguments:** `{"organizationSlug": "vrsa-solution-6q", "query": "is:unresolved", "sort": "date"}`
* **Unresolved Issues Found (10 Total, Top Items):**

| Issue ID | Culprit / Location | Error Summary | Events | Users | Last Seen | Link |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`WEKRAFT-SAAS-20`** | `/dashboard/.../integrations` | `InvalidStateError: Transition was aborted because of invalid state.` | 61 | 7 | 6 mins ago | [Sentry Issue](https://vrsa-solution-6q.sentry.io/issues/WEKRAFT-SAAS-20) |
| **`WEKRAFT-SAAS-Z`** | `/web` | `UnhandledRejection: Non-Error promise rejection captured with value: Object Not Found...` | 4 | 2 | 2 hours ago | [Sentry Issue](https://vrsa-solution-6q.sentry.io/issues/WEKRAFT-SAAS-Z) |
| **`WEKRAFT-SAAS-Y`** | `/web` | `InvalidStateError: Transition was aborted because of invalid state. Document hidden` | 5 | 5 | 3 hours ago | [Sentry Issue](https://vrsa-solution-6q.sentry.io/issues/WEKRAFT-SAAS-Y) |
| **`WEKRAFT-SAAS-25`** | `/dashboard/.../teamspace` | `Error: Connection closed` | 1 | 1 | 10 hours ago | [Sentry Issue](https://vrsa-solution-6q.sentry.io/issues/WEKRAFT-SAAS-25) |
| **`WEKRAFT-SAAS-1Q`** | `/web` | `Error: aborted` | 2 | 0 | 10 days ago | [Sentry Issue](https://vrsa-solution-6q.sentry.io/issues/WEKRAFT-SAAS-1Q) |

---

## 4. Linear MCP Integration

### Discovered Tools (68 Total)
Key tools include: `list_issues`, `get_issue`, `save_issue`, `list_teams`, `list_projects`, `list_cycles`, `list_users`, `list_issue_labels`, `list_documents`, `list_custom_views`.

---

### Executed Tool Calls & Issues Found

#### 1. Discovery: `list_teams`
* **Arguments:** `{}`
* **Response Payload:** `Testing-new-123` (Key: `TES`, Team ID: `cd2935a6-0118-443e-826a-7bba84d6a2ed`)

#### 2. Discovery: `list_projects`
* **Arguments:** `{}`
* **Response Payload:** Project **`rox-test-1`** (ID: `P-TES-1`, Priority: `Urgent`, Status: `Backlog`)

#### 3. Discovery: `list_users`
* **Arguments:** `{}`
* **Workspace Member:** `Ronit Rai` (`ronitrai1237@gmail.com`, Admin)

#### 4. Action: `list_issues`
* **Arguments:** `{}`
* **Linear Issues Retrieved:**

| Issue Key | Title / Summary | Status | Priority | Label | Assignee | Project | URL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`TES-6`** | **`issue-wekraft-payemnt`** | `In Progress` | **Urgent** | `Bug` | Ronit Rai | `rox-test-1` | [Linear Issue](https://linear.app/testing-new-123/issue/TES-6/issue-wekraft-payemnt) |
| **`TES-7`** | **`Task 1`** | `Backlog` | No priority | - | Ronit Rai | - | [Linear Issue](https://linear.app/testing-new-123/issue/TES-7/task-1) |
| **`TES-5`** | **`issue-rox-1`** | `In Progress` | No priority | - | Ronit Rai | - | [Linear Issue](https://linear.app/testing-new-123/issue/TES-5/issue-rox-1) |
| **`TES-3`** | **`Connect your tools`** | `Backlog` | No priority | - | Ronit Rai | - | [Linear Issue](https://linear.app/testing-new-123/issue/TES-3/connect-your-tools) |

---

## 5. Tool Calling Best Practices & Protocol Summary

1. **Jira Protocol:**
   - Always run `getAccessibleAtlassianResources` first to extract `cloudId`.
   - Never run unbounded JQL (`ORDER BY updated DESC` without restrictions). Use bounded search `status IS NOT NULL ORDER BY updated DESC` or `created >= -30d`.
   - Include unassigned tasks by searching `status IS NOT NULL` rather than restricting strictly to `assignee = currentUser()`.
   - Omit `'view': 'compact'` to retrieve issue titles, status names, and priorities.

2. **Vercel Protocol:**
   - Run `list_projects` to discover project IDs.
   - Always pass `projectId` to `list_deployments` to target the specific app, avoiding sequential looping and HTTP 45s timeouts across multi-project accounts.
   - Use `get_project` with `idOrName` to fetch custom domains (`wekraft.xyz`), framework version (`Next.js 24.x`), and protection settings.

3. **Sentry Protocol:**
   - Run `find_organizations` first to discover `organizationSlug` (`vrsa-solution-6q`).
   - Run `find_projects` with `organizationSlug` to verify project slugs (`wekraft-saas`).
   - Call `search_issues` with `organizationSlug` and `query: "is:unresolved"` to retrieve active production errors.

4. **Linear Protocol:**
   - Run `list_teams` or `list_projects` first to discover workspace team keys.
   - Call `list_issues` with `{}` to retrieve active tickets across teams.
   - Use `save_issue` or `get_issue` for ticket updates and details.

---

## 6. Task 1: Linear & Sentry Issue Triage & Project Gap Analysis

### Goal
Query active (non-closed/non-done) Linear tickets and live Sentry unresolved errors, cross-reference against local project issues (`issue-1 client payemt` [in-progress], `issue-2 site tracing error` [closed]), and determine if new project issues must be created.

---

### Executed Tool Steps

#### Step 1: Credential Decryption
* **Linear Token:** Decrypted AES-256-GCM ciphertext `9779a5b4...` $\rightarrow$ `d62f9b0d-80b7-4c12-8ed1-1aefb3b2ba98` (Linear Personal Access Token).
* **Sentry Token:** Decrypted AES-256-GCM ciphertext `c0bc0524...` $\rightarrow$ `4166911:HJM7tQh9b41c463ba...` (Sentry Auth Token).

#### Step 2: Linear Discovery & Issue Fetch
* **MCP Tool:** `list_teams`
  * **Result:** Discovered team `Testing-new-123` (ID: `cd2935a6-0118-443e-826a-7bba84d6a2ed`).
* **MCP Tool:** `list_issues`
  * **Arguments:** `{}`
  * **Active (Not Closed / Not Done) Issues Retrieved:**

| Issue ID | Title | Status | Priority | Team | Assignee | Created Date |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`TES-8`** | `issue-client-payemnt` | `In Progress` | **High** | Testing-new-123 | Ronit Rai | Sept 26, 2026 |
| **`TES-6`** | `issue-wekraft-payemnt` | `In Progress` | **Urgent** | Testing-new-123 | Ronit Rai | Sept 17, 2026 |
| **`TES-5`** | `issue-rox-1` | `In Progress` | No priority | Testing-new-123 | Ronit Rai | Sept 17, 2026 |
| **`TES-7`** | `Task 1` | `Backlog` | No priority | Testing-new-123 | Ronit Rai | Sept 17, 2026 |

#### Step 3: Sentry Organization & Unresolved Error Fetch
* **MCP Tool:** `find_organizations`
  * **Result:** `vrsa-solution-6q` (`https://vrsa-solution-6q.sentry.io`).
* **MCP Tool:** `search_issues`
  * **Arguments:** `{"organizationSlug": "vrsa-solution-6q", "query": "is:unresolved", "sort": "date"}`
  * **Live Unresolved Sentry Errors Discovered:**

| Sentry ID | Error Message / Exception | Culprit Route | Events | Users | Last Seen | Severity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`WEKRAFT-SAAS-20`** | `InvalidStateError: Transition was aborted because of invalid state. Document hidden` | `/dashboard/my-projects/:slug/workspace/integrations` | **121** | **9** | ~7 mins ago | **Critical** |
| **`WEKRAFT-SAAS-27`** | `InvalidStateError: Transition was aborted... Viewport size changed` | `/dashboard` | 1 | 1 | ~56 mins ago | Medium |
| **`WEKRAFT-SAAS-26`** | `ReferenceError: KayaSettingsSection is not defined` | `/dashboard/my-projects/:slug/workspace/settings` | 1 | 1 | 14 hrs ago | **High** |
| **`WEKRAFT-SAAS-Z`** | `UnhandledRejection: Non-Error promise rejection captured... Id:4` | `/web` | 4 | 2 | 18 hrs ago | Medium |
| **`WEKRAFT-SAAS-Y`** | `InvalidStateError: Transition was aborted... Document hidden` | `/web` | 5 | 5 | 19 hrs ago | Medium |
| **`WEKRAFT-SAAS-25`** | `Error: Connection closed` | `/dashboard/.../teamspace` | 1 | 1 | 1 day ago | Low |
| **`WEKRAFT-SAAS-24`** | `ReferenceError: EmbeddedVoiceWaveform is not defined` | `/dashboard/.../teamspace` | 1 | 1 | 1 day ago | Medium |
| **`WEKRAFT-SAAS-8`** | `HttpError: Bad credentials - https://docs.github.com/rest` | `POST /dashboard/.../workspace` | 45 | 1 | 4 days ago | High |

---

### Project Issues Cross-Reference & Creation Needs

1. **`issue-1 client payemt` (`in-progress` in project):**
   - **Status:** Aligns with Linear `TES-8` (`issue-client-payemnt`, In Progress) and `TES-6` (`issue-wekraft-payemnt`, Urgent).
   - **Action:** No new duplicate payment issue needed; keep synchronized with `TES-8`/`TES-6`.

2. **`issue-2 site tracing error.` (`closed` in project):**
   - **Status:** Closed locally in project.

3. **New Issues Needed in Project:**
   - **`issue-rox-1` (`TES-5`):** Currently active (`In Progress`) in Linear but missing from local project tracking.
   - **`Task 1` (`TES-7`):** Active in Linear backlog, not yet represented in project issues.
   - **`Sentry WEKRAFT-SAAS-20 (Integrations Transition Error)`:** **CRITICAL** bug with 121 recurring events across 9 real users on `/workspace/integrations`. Needs a dedicated bug issue in the project to track root cause.
   - **`Sentry WEKRAFT-SAAS-26 (KayaSettingsSection ReferenceError)`:** Crashes workspace settings page. Needs an issue in the project.

---

## 7. Task 2: Project-to-Linear Sync, Creation of Unclosed Issues & Prioritization

### Goal
Given project issues:
- `issue-1 client payemt` — `closed`
- `issue-2 site tracing error.` — `not-started`

1. Check if these issues exist in Linear.
2. If non-closed issues are not in Linear, create them via Linear MCP.
3. Establish an explicit prioritization matrix.
4. Identify which unclosed Linear issues need to be brought into the local project.

---

### Executed Tool Steps & Live Issue Creation

#### Step 1: Verification Against Linear Registry
* **`issue-1 client payemt` (`closed` in project):** Found existing Linear tickets `TES-8` and `TES-6`. Since it is closed locally, no creation is required.
* **`issue-2 site tracing error.` (`not-started` in project):** **NOT found** in Linear registry.

#### Step 2: Tool Execution — `save_issue` on Linear MCP
* **Tool Invocation:**
  ```json
  {
    "title": "issue-2 site tracing error",
    "team": "cd2935a6-0118-443e-826a-7bba84d6a2ed",
    "description": "Site tracing error reported from project workspace.",
    "priority": 2
  }
  ```
* **Tool Response Payload:**
  ```json
  {
    "id": "TES-9",
    "uuid": "1bb2a5c0-1f7b-4750-bbb6-0f722860ba6c",
    "title": "issue-2 site tracing error",
    "status": "Backlog",
    "priority": { "value": 2, "name": "High" },
    "url": "https://linear.app/testing-new-123/issue/TES-9/issue-2-site-tracing-error",
    "gitBranchName": "ronitrai1237/tes-9-issue-2-site-tracing-error",
    "createdAt": "2026-09-26T08:32:08.671Z"
  }
  ```
* **Result:** **`TES-9`** created successfully in Linear!

---

### Comprehensive Prioritization Matrix

Based on live telemetry from Sentry error counts, user impact, and Linear ticket priorities:

| Rank | Priority | Issue / Error ID | Source | Summary & Impact | Recommended Action |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **P0** | **URGENT** | **`TES-6`** / **`WEKRAFT-SAAS-20`** | Linear / Sentry | **Payment blocker (`TES-6`)** + **121 recurring crash events across 9 users** in Integrations tab. | Fix immediately — directly blocks revenue and MCP connector UI. |
| **P1** | **HIGH** | **`TES-9`** | Linear (Created) | **`issue-2 site tracing error`** (High Priority, `not-started` in project). | Investigate OpenTelemetry/tracing configuration and start development. |
| **P2** | **HIGH** | **`WEKRAFT-SAAS-26`** | Sentry | `ReferenceError: KayaSettingsSection is not defined` on `/workspace/settings`. | Fix missing export/import in workspace settings module. |
| **P3** | **MEDIUM** | **`TES-8`** | Linear | `issue-client-payemnt` (Marked closed in project; verify if Linear status needs update to `Done`/`Closed`). | Close `TES-8` in Linear to match local project status. |
| **P4** | **LOW** | **`TES-5`** (`issue-rox-1`) & **`TES-7`** (`Task 1`) | Linear | Backlog/in-progress general task items. | Bring into local project task board. |

---

### Summary of Linear Issues to Bring into Local Project

The following active Linear issues are not yet done/closed and should be synced into local project tracking:
1. **`TES-11`**: `issue-2 login auth error` (Status: `Backlog`, Priority: `Urgent`, URL: `https://linear.app/testing-new-123/issue/TES-11/issue-2-login-auth-error`)
2. **`TES-10`**: `issue-1 firewall handling` (Status: `Backlog`, Priority: `High`, URL: `https://linear.app/testing-new-123/issue/TES-10/issue-1-firewall-handling`)
3. **`TES-9`**: `issue-2 site tracing error` (Status: `Backlog`, Priority: `High`, URL: `https://linear.app/testing-new-123/issue/TES-9/issue-2-site-tracing-error`)
4. **`TES-5`**: `issue-rox-1` (Status: `In Progress`, Priority: `No priority`)
5. **`TES-7`**: `Task 1` (Status: `Backlog`, Priority: `No priority`)

---

## 8. Additional Live Linear Issues Created

### MCP Tool Used: `save_issue`
* **MCP Server Endpoint:** `https://mcp.linear.app/mcp`
* **Protocol:** MCP Streamable HTTP JSON-RPC 2.0 (`initialize` $\rightarrow$ `notifications/initialized` $\rightarrow$ `tools/call`)
* **Underlying Function:** `save_issue`

---

### Executed Tool Calls & Payloads

#### 1. Creation of `issue-1 firewall handling`
* **MCP Tool:** `save_issue`
* **Input Parameters:**
  ```json
  {
    "title": "issue-1 firewall handling",
    "team": "cd2935a6-0118-443e-826a-7bba84d6a2ed",
    "description": "Configure and handle firewall security rules and rate limiting.",
    "priority": 2
  }
  ```
* **Raw Response Payload:**
  ```json
  {
    "id": "TES-10",
    "uuid": "a28b9ba8-1d86-4ef8-921b-c105957746ac",
    "title": "issue-1 firewall handling",
    "description": "Configure and handle firewall security rules and rate limiting.",
    "priority": { "value": 2, "name": "High" },
    "status": "Backlog",
    "statusType": "backlog",
    "url": "https://linear.app/testing-new-123/issue/TES-10/issue-1-firewall-handling",
    "gitBranchName": "ronitrai1237/tes-10-issue-1-firewall-handling",
    "createdAt": "2026-09-26T08:40:03.939Z",
    "team": "Testing-new-123",
    "teamId": "cd2935a6-0118-443e-826a-7bba84d6a2ed"
  }
  ```

---

#### 2. Creation of `issue-2 login auth error`
* **MCP Tool:** `save_issue`
* **Input Parameters:**
  ```json
  {
    "title": "issue-2 login auth error",
    "team": "cd2935a6-0118-443e-826a-7bba84d6a2ed",
    "description": "Authentication failure and token refresh handling on login flow.",
    "priority": 1
  }
  ```
* **Raw Response Payload:**
  ```json
  {
    "id": "TES-11",
    "uuid": "6389b1a0-6401-4abd-a62a-ff1d63e4c32e",
    "title": "issue-2 login auth error",
    "description": "Authentication failure and token refresh handling on login flow.",
    "priority": { "value": 1, "name": "Urgent" },
    "status": "Backlog",
    "statusType": "backlog",
    "url": "https://linear.app/testing-new-123/issue/TES-11/issue-2-login-auth-error",
    "gitBranchName": "ronitrai1237/tes-11-issue-2-login-auth-error",
    "createdAt": "2026-09-26T08:40:06.058Z",
    "team": "Testing-new-123",
    "teamId": "cd2935a6-0118-443e-826a-7bba84d6a2ed"
  }
  ```

---

#### 3. Verification Tool: `list_issues`
* **MCP Tool:** `list_issues`
* **Input Parameters:** `{}`
* **Verified Linear State:**

| Linear Key | Title | Priority | Status | Team | Direct Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`TES-10`** | **`issue-1 firewall handling`** | **High** (2) | `Backlog` | Testing-new-123 | [View in Linear](https://linear.app/testing-new-123/issue/TES-10/issue-1-firewall-handling) |
| **`TES-11`** | **`issue-2 login auth error`** | **Urgent** (1) | `Backlog` | Testing-new-123 | [View in Linear](https://linear.app/testing-new-123/issue/TES-11/issue-2-login-auth-error) |

---

## 9. Live GitHub MCP Integration & Codebase Triage

### Connected Repository Context
* **Target Repository:** `ronitrai27/customer_agent_punjabi`
* **Repository Owner:** `ronitrai27`
* **Repository Name:** `customer_agent_punjabi`
* **Default Branch:** `main`
* **Primary Language:** TypeScript
* **Direct Repository URL:** [https://github.com/ronitrai27/customer_agent_punjabi](https://github.com/ronitrai27/customer_agent_punjabi)
* **Strict Scoping Constraint:** Kaya and GitHub MCP sub-agent are strictly bounded to this repository. All queries enforce `owner="ronitrai27"` and `repo="customer_agent_punjabi"`.

---

### Discovered Capabilities & Available GitHub MCP Actions

| Action / Tool Name | Description & Capability | Target Parameters |
| :--- | :--- | :--- |
| **`github_get_repository`** | Fetches repository metadata, visibility, default branch, language, and open issue counts. | `{"owner": "ronitrai27", "repo": "customer_agent_punjabi"}` |
| **`github_list_issues`** | Lists open and closed issues with author, labels, comment count, and status. | `{"owner": "ronitrai27", "repo": "customer_agent_punjabi", "state": "open"}` |
| **`github_list_pull_requests`** | Retrieves active and merged pull requests, source/target branches, and review states. | `{"owner": "ronitrai27", "repo": "customer_agent_punjabi", "state": "all"}` |
| **`github_list_commits`** | Fetches recent commit history, authors, SHAs, and commit messages. | `{"owner": "ronitrai27", "repo": "customer_agent_punjabi", "per_page": 10}` |
| **`github_list_branches`** | Discovers all active branches and their latest commit references. | `{"owner": "ronitrai27", "repo": "customer_agent_punjabi"}` |
| **`github_get_issue`** | Retrieves detailed description and discussion thread for a specific issue number. | `{"owner": "ronitrai27", "repo": "customer_agent_punjabi", "issue_number": 18}` |
| **`github_get_pull_request`** | Inspects diff, mergeability, reviews, and CI status of a pull request. | `{"owner": "ronitrai27", "repo": "customer_agent_punjabi", "pull_number": 16}` |

---

### Live Inspection Results & Observations

#### 1. Open Issues in Connected Repository (Total: 2 Open Issues)

| Issue # | Title | Author | State | Created At | Comments | Direct Link |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
| **`#18`** | **`punjabi conversion is little hard.`** | `@ronitrai27` | `open` | 2026-09-30 17:00 UTC | 0 | [View Issue #18](https://github.com/ronitrai27/customer_agent_punjabi/issues/18) |
| **`#17`** | **`model router - no past message history`** | `@ronitrai27` | `open` | 2026-09-30 16:59 UTC | 0 | [View Issue #17](https://github.com/ronitrai27/customer_agent_punjabi/issues/17) |

> **Key Takeaway for Project Management:** Both issues were recently reported. Issue `#17` relates to model router memory/context, and Issue `#18` relates to language translation pipeline. Kaya can automatically ingest these issues into the project sprint backlog or link them with internal tasks.

---

#### 2. Recent Pull Requests

| PR # | Title / Feature | Author | State | Source Branch $\rightarrow$ Base | Merged | Direct Link |
| :---: | :--- | :--- | :---: | :--- | :---: | :--- |
| **`#16`** | `code asynced and latency reduced.` | `@ronitrai27` | `closed` | `prd_fixes_agent` $\rightarrow$ `main` | **Yes** | [View PR #16](https://github.com/ronitrai27/customer_agent_punjabi/pull/16) |
| **`#15`** | `Prd fixes agent` | `@ronitrai27` | `closed` | `prd_fixes_agent` $\rightarrow$ `main` | **Yes** | [View PR #15](https://github.com/ronitrai27/customer_agent_punjabi/pull/15) |
| **`#14`** | `V2 agent` | `@ronitrai27` | `closed` | `v2_agent` $\rightarrow$ `main` | **Yes** | [View PR #14](https://github.com/ronitrai27/customer_agent_punjabi/pull/14) |
| **`#13`** | `Agent updates` | `@ronitrai27` | `closed` | `agent-updates` $\rightarrow$ `main` | **Yes** | [View PR #13](https://github.com/ronitrai27/customer_agent_punjabi/pull/13) |
| **`#12`** | `Agent updates` | `@ronitrai27` | `closed` | `agent-updates` $\rightarrow$ `main` | **Yes** | [View PR #12](https://github.com/ronitrai27/customer_agent_punjabi/pull/12) |
| **`#11`** | `Dev` | `@ronitrai27` | `closed` | `dev` $\rightarrow$ `main` | **Yes** | [View PR #11](https://github.com/ronitrai27/customer_agent_punjabi/pull/11) |

---

#### 3. Recent Commit Activity

| Commit SHA | Commit Message | Author | Timestamp | Direct Commit Link |
| :---: | :--- | :--- | :--- | :--- |
| **`1396958`** | `Merge pull request #16 from ronitrai27/prd_fixes_agent` | ROX | 2026-09-02 | [Commit `1396958`](https://github.com/ronitrai27/customer_agent_punjabi/commit/139695875611a54b9d7ecfbc5ab2fad11b758036) |
| **`7c4dce1`** | `code asynced and latency reduced.` | ronirai27 | 2026-09-02 | [Commit `7c4dce1`](https://github.com/ronitrai27/customer_agent_punjabi/commit/7c4dce17dd5aac67b41ffca69de4468399e7b906) |
| **`38ee9f7`** | `Merge pull request #15 from ronitrai27/prd_fixes_agent` | ROX | 2026-08-31 | [Commit `38ee9f7`](https://github.com/ronitrai27/customer_agent_punjabi/commit/38ee9f7c0f8d617fbd1bf631284bd2c229eb8daf) |
| **`c7e54bb`** | `readme fixes....` | ronirai27 | 2026-08-31 | [Commit `c7e54bb`](https://github.com/ronitrai27/customer_agent_punjabi/commit/c7e54bb3cd6ed87e844d3ff5106f856904a67a4e) |
| **`376d13b`** | `api keys updated..` | ronirai27 | 2026-08-20 | [Commit `376d13b`](https://github.com/ronitrai27/customer_agent_punjabi/commit/376d13bd4d4e2b48327df0a8cc63c9ec89ac4842) |

---

#### 4. Active Repository Branches

* **`main`** (Default — Head: `1396958`)
* **`agent-updates`** (Head: `cf35de4`)
* **`dev`** (Head: `31965b0`)
* **`guard`** (Head: `2c4f90f`)
* **`prd_fixes_agent`** (Head: `7c4dce1`)
* **`v2_agent`** (Head: `cd540d9`)




