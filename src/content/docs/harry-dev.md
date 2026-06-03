# Harry Dev Agent (Beta / Coming Soon)

**Harry** is Wekraft's autonomous AI senior developer agent. Harry is designed to index codebases, debug syntax or dependency issues, and suggest pull request reviews.

> [!NOTE]
> **Active Beta Development**: The Harry Dev Agent features are currently under active development. The assistant sheet and dedicated workspace inputs are disabled, displaying a *"heavy development / coming soon"* notice.

---

## Workspace Integration & Chat Interfaces

Once released, Harry will be accessible in two primary spaces:
1. **AI Assistant Sheet (`HarryAssistantSheet.tsx`)**: Accessed by clicking the Harry assistant toggle in the workspace.
2. **AI Workspace Space (`/workspace/ai?harry=true`)**: A full chat workspace for deep codebase analysis.

---

## Planned Capabilities & Model Tiers

Wekraft will offer two model presets for codebase resolution:
- **Harry Fast**: Optimised for rapid syntax reviews, regex formatting, and single-file diagnostics.
- **Harry Deep**: Leverages deeper reasoning paths to solve multi-file refactoring tasks, index directories, and review complex pull requests.

---

## Subscription Requirements

- **Pro Feature**: Harry is restricted to projects owned by a **Pro Plan** subscriber.
- **Trial / Locked State**: If a project owner is on a Free or Plus plan, clicking the Harry chat toggle displays a Pro Feature upgrade card prompting them to upgrade to the Pro plan to unlock access.

---

## Next Steps

- Leverage the active PM agent in [Kaya PM Agent](/web/docs/kaya-pm).
- Configure repository syncs in [Git Repositories](/web/docs/repositories).
- Connect editor-level workflows in [VS Code Extension](/web/docs/extension).
