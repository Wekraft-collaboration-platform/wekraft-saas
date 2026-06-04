# Help & Support

Wekraft provides a unified, real-time **Help & Support** module directly inside the platform. You can access it from the sidebar navigation link in either the main Dashboard sidebar or the Project Workspace sidebar.

The support center is divided into two operational channels: manual **Contact Support** ticket submissions and the real-time **Talk to AI** assistant.

---

## 1. Contact Support (Manual Ticket System)

When you encounter bugs, billing discrepancies, or need personal assistance, you can log a ticket directly through the support interface.

### Category Tags
To ensure your request is routed to the correct engineering or billing lead, select one of the following classification tags:

| Category Tag | Purpose & Description |
| :--- | :--- |
| **Found Bug** | System anomalies, UI glitches, or API integration errors. |
| **Help Needed** | Workspace onboarding blockages or project setup guidance. |
| **Query** | General questions regarding features, limits, or configuration choices. |
| **Payment Issue** | Subscription billing details, invoice updates, or payment failures. |
| **Others** | Feedback, partner integrations, or general feedback. |

### Service Level Agreements (SLAs)
Response times are determined dynamically based on the project owner's subscription tier:

- > [!IMPORTANT]
  > **Priority Support (Pro Plan)**: Projects owned by Pro subscribers are routed to the priority queue with an estimated response time **within 12 hours**.
- > [!NOTE]
  > **Basic Support (Free & Plus Plans)**: Routed to the standard queue with an estimated response time **within 48 hours**.

---

## 2. Talk to AI (Wekraft Support Assistant)

The AI Support Assistant provides real-time help, documentation searches, and ticket automation. It is powered by a custom LLM runtime integrated directly with Wekraft's documentation and support systems.

### Interactive Quick Starts
When you open the AI tab, you can select one of four standard starter queries:
- *"Help me get started with Wekraft and explain what I can do here."*
- *"I have a query regarding my account or project settings."*
- *"I found a bug in the app. Can you help me report it?"*
- *"Tell me more about Wekraft and what makes it unique."*

### Tool Integrations & Capabilities
The Support Assistant is not just a text chatbot — it has access to specific backend tools to retrieve info and perform actions for you:

#### A. Document Search (`searchDocumentation` & `getDocumentationPage`)
- **How it works**: The AI can query all documentation pages by keyword or title matching. It can also pull the raw markdown of specific pages (e.g., `sprints`, `extension`, `kaya-pm`) to provide direct, context-rich answers.
- **Benefit**: You get immediate answers on plan limits, keybindings, or repository sync flows.

#### B. Fetch Past Tickets (`getSupportQueries`)
- **How it works**: The assistant can read the database table (`supportQueries`) to retrieve all tickets previously submitted by your authenticated user ID.
- **Benefit**: You can ask, *"What is the status of my open bug reports?"* or *"Show me my tickets,"* and the AI will list them with category badges.

#### C. Create Ticket on Your Behalf (`createSupportQuery`)
- **How it works**: If you describe a bug or ask the AI to contact support (e.g. *"I'm hitting a billing error, please open a ticket"*), the assistant will dynamically compose a title and description, select the correct category tag, and submit a ticket to the database on your behalf.
- **Benefit**: Zero-form support. The AI handles the data entry and submits the ticket directly from the chat feed.

### Interface Controls
- **Clear Chat (🗑)**: Purge your local message feed to start a new support topic.
- **Stop Generating (■)**: Interrupt the streaming AI response at any time if you wish to adjust your query.

---

## Best Practices for Submitting Tickets

To help Wekraft engineers resolve issues quickly, please follow these tips:
1. **Provide Clear Repos**: For bugs, detail what you did, what you expected, and what actually happened.
2. **Include Error traces**: Copy/paste console errors or terminal logs from the VS Code extension when reporting connection issues.
3. **Use the AI first**: The AI assistant can answer 95% of questions about settings, routing, pricing caps, and shortcut commands instantly.
