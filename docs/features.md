## Github_subagent 
get_pull_requests_summary (PR Review Status, Stale PRs, Blockers)
get_issues
get_contributor_activity (Developer Velocity & Contribution Tracking)
get_release_and_ci_status (Release Tags, Milestones & Build Health)



## finding from web 
In 2026, agentic AI architecture has matured into a sophisticated ecosystem centered on specialization, modularity, and intelligent orchestration. The shift is away from monolithic, all-purpose models toward "router-based" multi-agent systems that delegate tasks to expert sub-agents.

Core Architectural Patterns
Current production-grade systems typically employ one or more of these four primary patterns:

Router + Specialists: An orchestrator agent analyzes the incoming request and dynamically routes it to the most capable "specialist" agent. This is preferred for high-value tasks where domain-specific expertise outweighs the cost of routing.
Hierarchical Orchestrator: A supervisor agent manages multiple executor agents, monitoring outputs, handling failures, and performing aggregation. This is the standard for long-horizon or highly complex, multi-stage workflows.
Sequential Pipeline: A deterministic flow where the output of one agent serves as the input for the next (e.g., Research Agent → Critic Agent → Writer Agent).
Single Agent + Tools: While multi-agent systems are trending, industry guidance (e.g., from Anthropic) emphasizes that many tasks are still best served by a single well-prompted agent with access to a robust library of tools.
Skill Selection and Definition
In 2026, "Skills" have become a standardized, portable unit of agentic capability:

Standardized Format: Most platforms now support the SKILL.md format (introduced in 2025), which packages instructions, constraints, and context into a file that an agent reads to understand how to handle a specific task.
Separation from Plugins: Unlike plugins (which typically execute code or API calls), a "skill" primarily instructs the agent on how to think and process a specific domain, making it a higher-level abstraction for guiding agent behavior.
The "Skill" Ecosystem: There are now large registries (such as the Skillselion catalog) tracking tens of thousands of reusable skills, allowing developers to "plug and play" capabilities into their agentic workflows.
Routing Mechanisms
Routing logic has evolved significantly beyond legacy intent classifiers:

LLM-Based Routing: Modern routers use the semantic reasoning capabilities of LLMs to interpret user context, allowing for dynamic, zero-shot routing without extensive training data.
Agent-as-a-Router: Emerging research (e.g., Agent-as-a-Router frameworks) treats model selection as a continuous feedback loop. These systems use memory modules and execution-grounded experience to optimize routing decisions for cost, latency, and performance.
Hierarchical & Auction-Based Routing: Advanced systems may use hierarchical (supervisor-led) or even auction-based mechanisms (where agents "bid" to perform a task) to manage complex, multi-domain problem-solving.
Key Frameworks & Best Practices
Orchestration Frameworks: LangGraph (popular for its state-machine, cyclic-graph approach) and CrewAI (favored for role-based, hierarchical team structures) remain industry standards for implementing these architectures.
The "95/5" Rule: Engineering efforts are heavily focused on the "unseen" 95% of agent development—handling state management, error cascading, cost optimization, and human-in-the-loop oversight—rather than just the 5% spent on API calls.
Reliability: Production leaders are increasingly focused on state-driven transitions and checkpointing, which allow systems to pause, recover from failures, and maintain visibility into the routing decision-making process.



## AGENT

vs. what does not, and the essential tools needed for real engineering and product teams.

1. Sub-Agents & Their Current Tools
Your architecture in 

kaya_graph.py
 routes user queries across 4 specialized sub-agents (orchestrated by the Supervisor Router and synthesized by Kaya):

                       ┌────────────────────────────┐
                       │  Supervisor Router (Groq)  │
                       └──────────────┬─────────────┘
          ┌──────────────────┬────────┴─────────┬──────────────────┐
          ▼                  ▼                  ▼                  ▼
┌──────────────────┐ ┌───────────────┐ ┌─────────────────┐ ┌───────────────┐
│ Analyst Sub-Agent│ │DB Write Agent │ │ Sprint Sub-Agent│ │ MCP Sub-Agent │
└─────────┬────────┘ └───────┬───────┘ └────────┬────────┘ └───────┬───────┘
          └──────────────────┴────────┬─────────┴──────────────────┘
                                      ▼
                       ┌────────────────────────────┐
                       │ Kaya Synthesizer (OpenAI)  │
                       └────────────────────────────┘
🛠️ Sub-Agent 1: Project Analyst Sub-Agent
Defined in 

analyst_worker_node
 & 

tools.py
.

Tool / Function	Execution	Capabilities & Scope


get_user_standup
Async Parallel	Fetches active tasks and open issues assigned specifically to the calling user (userId, projectId) to construct personal daily standups and today's priority list.


get_tasks_summary
Async Parallel	Pulls project-wide task metrics (totalCount, completedCount, blockedCount) along with high-priority and active tasks.


get_issues_summary
Async Parallel	Fetches active project bugs and critical blockers, categorized by severity.


get_member_workload
Async Parallel	Retrieves per-team-member task and issue load distribution to assist in workload balancing.
parse_document_eval (Doc Cache)	Async Sub-LLM	Ingests uploaded PRDs/specifications from cache and extracts scope, architecture risks, system bottlenecks, and missing edge cases.
✍️ Sub-Agent 2: DB Write Sub-Agent (Mutations & HITL)
Defined in 

db_write_worker_node
 & 

tools.py
.

Tool / Function	Execution	Capabilities & Scope


bulk_create_tasks
 / 

write_bulk_tasks_to_convex
HITL Interrupt	Extracts structured tasks (titles, descriptions, priorities, domain tags) from conversation or PRDs, pauses graph execution for user review, and batch inserts into Convex DB.


bulk_create_issues
 / 

write_bulk_issues_to_convex
HITL Interrupt	Extracts bugs/blockers from chat context, error traces, or PRDs, triggers approval modal, and writes them to Convex.


create_calendar_event
 / 

write_calendar_event_to_convex
HITL Interrupt	Parses meeting/event details (start/end ISO timestamps, title, event type), interrupts for approval, and creates the calendar entry in Convex.
🏃 Sub-Agent 3: Sprint Sub-Agent
Defined in 

sprint_worker_node
 & 

tools.py
.

Tool / Function	Execution	Capabilities & Scope


get_sprint_insights
Async Query	Queries sprint analytics, active vs completed sprint counts, sprint goals, and active sprint timelines.


create_sprint
 (Stub)	Schema Intercept	Declares sprint creation parameters (sprint_name, sprint_goal, start_date, end_date).


add_items_to_sprint
 (Stub)	Schema Intercept	Intended to associate backlog tasks to an active sprint.
🔌 Sub-Agent 4: MCP External Integrations Sub-Agent
Defined in 

mcp_worker_node
 & 

mcp_client.py
.

Uses Model Context Protocol (MCP) with dynamic token resolution, smart intent pruning, and custom procedural skills:

Connector / Service	Available Operations / Capabilities
Atlassian Jira	getAccessibleAtlassianResources, searchJiraIssuesUsingJql, createJiraIssue, getJiraIssue
Linear	list_teams, list_issues, save_issue, get_issue
Sentry	find_organizations, find_projects, search_issues (is:unresolved), get_sentry_resource
Notion	notion-create-pages (sync markdown reports/specs), notion-search-pages, notion-fetch-page-content
Slack	Channel lookup, thread reading, posting status reports / incident notifications
Calendly	Discover scheduling links, fetch user event types and booking slots
Vercel	Fetch project deployment status, inspect build errors, commit branches, live deployment URLs
GitHub (Configured)	Pull request status, repository inspection, commit log verification
Supabase / Neon / Stripe / PostHog	Database querying, subscription status, telemetry & funnel analytics via MCP discovery
2. Which Tools Don't Make Much Sense or Have Redundancies?
add_items_to_sprint & create_sprint in 

tools.py
:
Why it doesn't make sense: These tools return "intercepted" but have no HITL interrupt handler inside sprint_worker_node or db_write_worker_node. If a user asks "Create Sprint 3 with these 4 tasks", the router triggers the Sprint worker, which only calls get_sprint_insights (read-only). Sprint creation is therefore blocked.
Duplicated Tool Declarations (@tool vs Structured Pydantic Extraction):
In 

tools.py
, bulk_create_tasks and bulk_create_issues exist as @tool decorators that return "intercepted". However, 

db_write_worker_node
 uses ChatOpenAI.with_structured_output(DBWriteIntentExtraction) instead of tool calling. The LangChain @tool write wrappers are dead code.
Internal Calendar Events vs. External Calendar Sync:
create_calendar_event only inserts an internal event record into Convex. Real PMs and engineers do not check an isolated platform calendar; they use Google Calendar or Microsoft Outlook. Creating an event without syncing an .ics or GCal/Outlook invite is rarely utilized.
Asymmetric MCP Sync (Read/Write Silos):
Kaya can read Sentry errors and write internal Convex issues, or read Jira tasks and create Jira tickets. However, there is no tool to link an internal task to a Jira ticket key or Sentry incident ID, meaning users end up with duplicated tracking across platforms.
3. What Tools MUST Be Added for Real Teams & PMs to Use This?
To make Kaya indispensable for real engineering teams and Product Managers, the following high-impact tools should be implemented:

1. PRD-to-Epic & User Story Breakdown Generator
What it does: Takes a feature idea or PRD document and automatically decomposes it into:
Epic ➔ User Stories (with "As a user, I want... So that...") ➔ Acceptance Criteria (Gherkin/Given-When-Then) ➔ Story Points / T-Shirt Sizing.
Why teams want it: Saves PMs 4–6 hours per feature spec and ensures developers get crisp requirements with zero ambiguous edge cases.
2. Bi-Directional 2-Way Sync (Jira / Linear / GitHub Issues)
What it does:
sync_issue_status(internalId, externalTicketId): When a developer completes a task in WeKraft or merges a PR, auto-transition the Jira/Linear ticket to Done.
import_epic_with_subtasks(epicKey): One-click import of an entire Jira epic into a WeKraft Sprint.
Why teams want it: Eliminates double entry. Developers hate updating two issue trackers.
3. Deep GitHub / GitLab PR & Release Radar
What it does:
get_stale_pull_requests(repo): Identifies PRs waiting on review for >24h or failing CI/CD checks.
generate_release_changelog(fromTag, toTag): Analyzes merged PRs and commits since the last deployment, auto-generating clean user-facing release notes.
Why teams want it: Keeps engineering velocity high and automates sprint release documentation.
4. Automated Blocker & Stalled Task Detector
What it does:
Compares task deadlines against sprint start dates and team member workloads. Flags tasks stuck in In Progress for >3 days or overdue without updates.
Generates actionable escalation alerts: "Task X is blocked by API schema migration assigned to Ronit."
Why teams want it: Proactive risk mitigation before a sprint fails.
5. Slack / Discord Daily Standup Broadcast Tool
What it does:
post_daily_standup_summary(channelId): Gathers yesterday's completed tasks, today's targets, and critical blockers across all team members and posts an executive summary to #engineering-standup every morning.
Why teams want it: Replaces repetitive 30-minute status meetings with an automated async standup digest.
6. Google Calendar / Outlook Meeting Scheduler
What it does:
schedule_team_meeting(attendees, title, durationMinutes, agendaMarkdown): Queries attendee free/busy availability via Google Calendar / MS Graph MCP and sends calendar invites with an AI-generated agenda attached.
Why teams want it: Turns meeting planning from an internal database entry into a real calendar booking.
7. Sprint Retrospective & Velocity Forecaster
What it does:
calculate_sprint_velocity(projectId): Calculates rolling velocity (story points or completed tasks per sprint), identifies scope creep added mid-sprint, and generates a structured retrospective report (What went well, What slowed us down, Action items).
Why teams want it: Gives leadership data-backed sprint predictability and capacity planning for future milestones.
12:28 AM
in my whole agent architecture what seems wrong or do u take this architecture as a serious enterprise level ? (forget minor things) is architecture good like a real system as antrhopic or open ai devs said in 2026 ?
search and tell ?
anything further to add to agentic systems ?
12:34 AM
An objective, deep-dive architectural review of your system evaluates it against the 2025/2026 Agentic Architecture Standards established by Anthropic ("Building Effective Agents"), OpenAI, and modern enterprise production systems.

1. Executive Verdict: Is This a Serious Enterprise-Level Architecture?
Verdict: 8.5 / 10 — Production-Grade & Structurally Sound. Your core architecture is not a toy prototype. It follows the exact Orchestrator-Workers + Parallel Fan-Out/Fan-In + Model Context Protocol (MCP) + Human-in-the-Loop (HITL) patterns that Anthropic and OpenAI advocate for enterprise multi-agent systems.

You avoided the biggest trap of early agent hype (monolithic autonomous loops that hallucinate and loop endlessly) and instead built a directed, predictable workflow graph in 

kaya_graph.py
.

However, to reach the standard of a Tier-1 Enterprise System (like GitHub Copilot Workspace, Cursor, or Linear AI), there are specific architectural gaps in Evaluation harnesses, Guardrails, and Context Window compaction that need addressing.

2. What Anthropic & OpenAI Advocate in 2025/2026
Anthropic's core architectural guidelines for production agents emphasize:

                      Anthropic 2025/2026 Agent Paradigm
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ 1. Workflows > Autonomous Swarms (Code coordinates, LLMs reason)        │
 │ 2. Routing & Orchestrator-Workers (Fast intent classifier + workers)    │
 │ 3. Standardized Protocol (MCP for universal tool discovery & execution) │
 │ 4. Parallel Branching with Zero Cascading Failures                      │
 │ 5. Hard Human-in-the-Loop (Interrupts on destructive mutations)        │
 │ 6. Continuous Evaluation & Golden Datasets (Evals as first-class code)  │
 └─────────────────────────────────────────────────────────────────────────┘
3. What Your Architecture Got Exactly Right (Elite Strengths)
Orchestrator-Worker Pattern with Model Specialization:
You used Groq fast inference for the Supervisor Router (

supervisor_router_node
) and Pydantic structured output for routing decisions, while reserving higher-reasoning models (GPT-4.1 / Claude) for synthesis. This minimizes latency and cost.
Standardized Model Context Protocol (MCP) Client:
In 

mcp_client.py
, you implemented Anthropic’s native JSON-RPC MCP handshake (initialize, tools/list, tools/call, SSE streaming session tracking) rather than writing custom one-off API scrapers.
State Isolation & Fault Boundaries (Zero Cascading Failures):
Each sub-agent runs in an isolated try/except returning structured error envelopes (_analyst_messages, _mcp_messages, _sprint_messages). If Sentry or Jira MCP is down, it does not crash Kaya or block internal task fetching.
Deterministic Human-in-the-Loop (HITL) Interrupts:
Using LangGraph's interrupt(...) in 

db_write_worker_node
 for database writes ensures no LLM can mutate production task boards without human review.
Real-time Observability via SSE Stream Emission:


_emit_stream_status
 streams reasoning steps, active sub-agents, and tools invoked to the frontend, giving enterprise users complete transparency.
4. What Holds It Back from Tier-1 Enterprise Level (Flaws & Fragilities)
Here are the specific areas where the current architecture deviates from enterprise standards:

A. Imperative Keyword Heuristics Overpowering the Router
The Problem: In 

kaya_graph.py (Lines 237–276)
, you have hardcoded Python keyword overrides (mcp_keywords, sprint_keywords, has_task_kw).
Why it fails in production: Keyword matching breaks on edge cases and negative prompts (e.g., "Summarize our project without touching Jira" still triggers the MCP agent because "jira" matched).
Enterprise Fix: Use the structured router LLM with strict few-shot examples and schema bounds; eliminate imperative string substring matching.
B. Lack of Automated Evals (Anthropic's #1 Requirement)
The Problem: There is currently no automated evaluation framework benchmarking routing accuracy, tool selection, and synthesis quality.
Why it fails in production: Any change to prompt instructions or model weights risks silent regressions across other workflows.
Enterprise Fix: Build a golden dataset of ~100 diverse multi-modal test prompts run via Pytest / LangSmith to measure precision and tool recall on every commit.
C. Token Bloat & Missing Context Compaction
The Problem: As chat sessions grow, full message histories and raw tool JSON responses are fed directly into the state graph.
Why it fails in production: Sessions with 20+ turns become sluggish and run into context limits or high API bills.
Enterprise Fix: Implement a Sliding Window Summarizer that compacts past turns into an executive state memory while retaining only the last 3 raw dialogue turns.
D. Missing Pre/Post Output Guardrails
The Problem: PII, internal database ID filtering (kn71qtgem...), and prompt injection defenses are enforced only via prompt guidelines ("DO NOT LEAK IDs").
Why it fails in production: Prompt instructions alone can be bypassed with adversarial user prompts.
Enterprise Fix: Add deterministic regex/sanitization filters and output guardrails between the synthesizer and the client stream.
5. Architectural Roadmap: What to Add for a Complete 2026 Enterprise Agentic Platform
Domain	What to Implement	Enterprise Benefit
Evaluations & CI/CD	LangSmith / DeepEval benchmark suite	Automatically tests agent routing and tool execution on every PR before deployment.
Semantic Long-Term Memory	Vector Memory over Decisions & Retros	Allows Kaya to recall team velocity patterns and architectural decisions made months ago.
Async Task Delegation	Background Worker Queue (Celery / Convex Queues)	Handles long-running multi-repo analyses or large PRD ingestions without HTTP timeouts.
Deterministic Guardrail Layer	Pre/Post-Flight Sanitizers	Scrub secrets, API tokens, internal IDs, and jailbreak vectors outside the LLM context.
Bi-Directional State Sync	Two-Way Webhook Ingestion	Kaya proactively notifies teams when a Jira ticket moves or a Sentry incident exceeds thresholds without waiting for a user query.



=========================================================================
## ISSUES 

# FIRST 
Why MCP is Being Called Spuriously (The Exact Culprit)
In 

kaya_graph.py
(Lines 251–257)
, there is a hardcoded Python override running after the Router LLM finishes:

python
mcp_keywords = ["jira", "linear", "slack", "calendly", "notion", "hubspot", "sentry", "vercel", "github", "pr", "prs", "pull request", "repo", "repository", "codebase", "branch", "commit", "mcp", "integration", "integrations"]
has_mcp_kw = any(k in lower_latest for k in mcp_keywords)
if has_mcp_kw:
    if "mcp" not in decision.actions:
        decision.actions.append("mcp")  # 💥 Overrides the Router LLM completely!
Why this wastes tokens & breaks routing:
Common English words trigger MCP: Words like "repo", "codebase", "branch", "commit", and "integration" are in mcp_keywords. If a user asks:
"What tasks are in this repository?" ➔ repo matches ➔ MCP worker is forced to run.
"Who is assigned to the auth branch task?" ➔ branch matches ➔ MCP worker is forced to run.
Blind to Negations:
"Summarize our project without touching Jira" ➔ jira matches ➔ MCP worker runs anyway, ignoring the user's explicit instruction.
No Integration Check:
Even if your project has zero MCP apps connected, the keyword match still spins up the MCP sub-agent loop and makes unnecessary HTTP calls.


=========================

great !!
now lets improve analysist agent !
add the get sprint insights to analysist sub agent and tell him , only call when u required sprint related data only . !!

second Tool get project health -> very very important -> 
get all stale tasks / stale issues( stale means overdue is coming) 
blocked tasks (isBlocked true) 
not assigned tasks and issues. 
Issues that are still not opened.
sprints that are overdue and not yet completed.
Github PR that are still not merged.  (only if repo is connected to project)
Github issues still open.
Team velocity (number of task/issue completed , left and team workload balance).

now this tool is important and agent calls when only he needs a detailed project info 
blockers , and what is holding project back.
we need to design in such a way that nothing makes too complicated.
we will also use gpt-5-mini model with reasoning- low for this , so that we have a better model handling these tool call. 
----------------------------

hey last thing i wonder is !!
as router provides reasoning ?
our mcp agent is also gpt-5-mini it will also provide reasoning !!

so currently only showing router reasoning on ui and stale until , agent strats replying - looks agent has reason only which sub agent to call !
but when mcp work is there and mcp agent is invoked its again gpt-5-mini which can provide reasoning for his work 

so we can extract and then shw that  chnaging router reeasoning !!
same with analysist agent which is also gpt-5-mini 
thid makes user know agent is reasoning and doing 

i know small thing but 
