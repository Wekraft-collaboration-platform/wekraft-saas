# User Profile

Your WeKraft profile (`/dashboard/my-profile`) represents your identity and professional skillset across the platform. It is visible to team members in Teamspace chats, project member grids, and task comments.

---

## Profile Page Layout

The profile view compiles your professional metadata into four structured areas:

### 1. Profile Header (`ProfileHeader.tsx`)

- Displays your avatar, full name, occupation title (e.g. `Lead Developer`), and subscription status badge (`Plus` or `Pro` active).
- Includes the **"Edit Profile"** toggle button to access configuration inputs.

### 2. About Me (Bio Editor)

- Located in the left column.
- Contains the **Bio Editor** to compose your professional description.
- _Plan limits_: Free tier users use a plain text input area. Upgraded users (Plus or Pro active) unlock the rich Markdown editor supporting icons, tables, formatting syntax, and live side-by-side previews.

### 3. Skills & Social Connections (Right Column)

- **Profile Skills**: Technical tag cloud displaying your skills (e.g., `React`, `Golang`, `PostgreSQL`). Press Enter inside the input to append new tags.
- **Social Links**: Lists linked URLs for developer profiles (X/Twitter, LinkedIn, Discord, Instagram, and personal portfolios).

### 4. Repository Activity Stats

- Plotted at the bottom of the profile.
- Renders your commit history metrics, contribution calendar, and streak counters synced from your linked repository hosting account.

---

## Profile Settings Configuration

Clicking the gear icon in the header switches the viewport to the profile settings tab:

- **Display Name**: Update your visible screen name.
- **Occupation Title**: Set your role description.
- **Social URLs**: Configure up to **5 external social links** using the dialog popup.
- **Handshake Connect**: Manage your synced repository account connections.

---

## Next Steps

- Share invitation codes in [Referral Program](/web/docs/referrals).
- Learn about workspace permissions in [Manage Teams & Roles](/web/docs/manage-teams).
- Review pricing updates in [Billing & Plans](/web/docs/billing).
