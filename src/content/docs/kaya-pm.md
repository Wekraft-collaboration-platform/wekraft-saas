# Kaya PM Agent

**Kaya** is Wekraft's autonomous AI Product Manager agent. Integrated deeply with the Convex backend and frontend components, Kaya manages backlog planning, schedules recurring project updates, and syncs calendar events.

---

## Workspace Integration & Chat Interfaces

Teammates can interact with Kaya in two primary views:
1. **AI Workspace Tab (`/workspace/ai?kaya=true`)**: A full chat workspace where you can input prompts, select model types (`Kaya Fast` or `Kaya Pro`), and view interactive card overlays.
2. **Teamspace Channels**: Mentions of `@kaya` inside chat rooms cause the agent to read the surrounding channel logs and reply to queries.

---

## LangGraph Interactive Interrupt Cards

Kaya operates as an agentic state machine built on LangGraph. When performing complex operations, she presents interactive visual cards (interrupts) in the chat feed, requiring explicit human approval:

### 1. Calendar Event Approval (`CalendarApprovalCard`)
- **Trigger**: When you request Kaya to schedule a meeting or demo (calling the `create_calendar_event` tool).
- **Behavior**: Renders an interactive card showing the proposed event title, description, and date/time. You can click **"Approve"** to sync it to the calendar or **"Reject"** to cancel the operation.

### 2. Sprint Backlog Allocation (`SprintItemSelectionCard`)
- **Trigger**: When you ask Kaya to plan a sprint or allocate items (calling the `add_items_to_sprint` tool).
- **Behavior**: Renders a card listing eligible backlog items. You can select or deselect specific tasks and confirm the allocation.

### 3. Report Summaries Scheduler (`SchedulerSetupCard`)
- **Trigger**: When you command Kaya to automate status reporting (calling the `setup_report_scheduler` tool).
- **Behavior**: Renders a setup card to select the reporting frequency (daily/weekly), channels, and target metrics.

---

## Monthly AI Usage Limits

- **Allocation**: Projects owned by a **Pro** subscriber receive a generous allocation of **360 Kaya AI calls** per month.
- **Monitoring**: Current usage is visualised in a Recharts radial pie chart inside the **Right Sidebar** dashboard widget (`RightSidebar.tsx`).
- **Policy Control**: The project owner can disable team member access to Kaya by toggling the **"Member AI Access (Kaya)"** switch in the Workspace Config tab.

---

## Next Steps

- Check active beta agent details in [Harry Dev Agent](/web/docs/harry-dev).
- Review keyboard shortcuts for chat in [Shortcuts & Keyboard Commands](/web/docs/shortcuts).
- Link repository activity in [Git Repositories](/web/docs/repositories).
