# AI Workspace (Kaya & Harry Agents)

The **AI Workspace** provides access to Wekraft's built-in AI agents: **Kaya PM Agent** and **Harry Dev Agent**. Available on the **Pro Plan**, these agents serve as intelligent, project-scoped collaborators that automate management workflows and assist in software development.

---

## Accessing the Agents

You can interact with the AI agents through several entry points:

| Access Method | How to use it |
|---|---|
| **Project Sidebar AI Tab** | Expand the **AI Assistant** section in the project sidebar to select **Kaya PM Agent** or **Harry Dev Agent** |
| **Command Palette** | Press `Ctrl + K` (or `Cmd + K`) from anywhere in a project workspace to toggle the quick-access panel |
| **Ask Kaya Button** | Click **"Ask Kaya"** next to the "New Task" button in the Tasks view |
| **Today Insights** | Click the **"Today Insights"** button in the workspace dashboard header |

---

## 1. Kaya PM Agent (Project Manager)

Kaya focuses on project management, team productivity, reporting, and sprint tracking.

### Key Capabilities
- **Smart Sprint Planning**: Analyzes backlog tasks, priority, assignee workloads (from heatmap data), and project deadlines to recommend a balanced sprint.
  - *Try it:* `"Kaya, help me plan a 2-week sprint with the highest priority backend tasks."`
- **Automated Project Reports**: Generates sprint health metrics, completion rates, blocked items, and bottleneck warnings (tasks stalled for 3+ days).
  - *Try it:* `"Kaya, generate a project report for the current active sprint."`
- **Workload Summaries**: Evaluates heatmap data to flag member burnout risk.
  - *Try it:* `"Kaya, are there any team members overloaded with high-priority tasks?"`

---

## 2. Harry Dev Agent (Software Engineer)

Harry focuses on codebase analytics, software development, code reviews, and testing.

### Key Capabilities
- **Codebase Link Integration**: Connects tasks to repository files, explaining code changes directly in the AI workspace.
- **Code Reviews & Refactoring**: Analyze code blocks for potential optimization or safety bugs.
  - *Try it:* `"Harry, review this React hook and suggest improvements for state rendering."`
- **Unit Testing**: Automatically drafts test suites for backend logic or frontend components.
  - *Try it:* `"Harry, write Biome-compliant Vitest unit tests for this query handler."`

---

## Configuration & Usage Limits

- **Plan Required**: Pro Plan.
- **Monthly Call Quota**: 50 calls per account (monitored via the [System Limits Sidebar](/web/docs/right-sidebar#2-ai-usage-meter)).
- **Project Limits Configuration**: Owners can set a custom usage threshold per project under **Project Settings → Configuration** to prevent a single project from consuming the entire quota.
- **Access Settings**: Owners can toggle **"Members use Kaya"** to restrict non-admin access to AI features.
