# Privacy Policy

Your privacy is important to WeKraft. This Privacy Policy describes how we collect, use, and handle your data when you use our platform, services, and integrations.

---

## 1. Data Collection

We collect information required to deliver project coordination, time tracking, and chat features. This includes:
- **Profile details** supplied during registration (e.g., name, work email, and avatar picture).
- **Code hosting account details** authorized during registration.
- **Repository metadata** from your linked code hosting repositories (e.g., branch names, commit hashes, pull request descriptions, and commit timestamps).
- **Interactive inputs** like team chats, tasks, issues, and calendar events.

> [!IMPORTANT]
> **No Code Storage**: We do not clone, pull, or cache your raw codebase scripts. WeKraft only reads file structures, names, and commit history necessary to populate the visual map and Git metrics.

---

## 2. How We Share Data

We share necessary data with our infrastructure sub-processors to run the platform services:
- **Authentication Service**: Manages secure logins and session tokens.
- **Reactive Database Backend**: Hosts and caches reactive document records and web sockets.
- **Billing Gateway**: Securely processes paid subscription invoices and renewals (we do not store or transmit credit card details on our own servers).
- **Repository Hosting API**: Synchronizes active project tasks, commits, and pull requests.

We do not sell, rent, or trade your personal information to third parties for marketing purposes.

---

## 3. Data Safety & Authentication Tokens

Your software projects are treated with strict confidentiality:
- **API Keys & Handshake Tokens** are stored encrypted using database protection mechanisms.
- **Scope Isolation**: Permissions are isolated per project workspace. The AI agents and external integrations can only query metadata within the repositories explicitly linked by the project owners.

---

## 4. Cookies & Telemetry

We use standard cookies and local storage to preserve active authentication sessions. These cookies are essential for navigating the workspace. We may also gather non-identifying telemetry (e.g., screen resolution, page load times, and navigation paths) to improve performance and usability.
