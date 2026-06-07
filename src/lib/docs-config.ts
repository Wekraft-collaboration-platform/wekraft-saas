export interface DocItem {
  title: string;
  slug: string;
  description: string;
  category?: string;
  badge?: "New" | "Updated" | "Beta";
  icon?: string;
  created?: string; // YYYY-MM-DD
  updated?: string; // YYYY-MM-DD
  children?: DocItem[];
}

export function getDocBadge(item: DocItem): "New" | "Updated" | "Beta" | undefined {
  return item.badge;
}

export const docsConfig: { [key: string]: DocItem[] } = {
  "Getting Started": [
    {
      title: "Overview",
      slug: "overview",
      description: "What Wekraft is, how it works end-to-end, and your plan limits.",
      icon: "FileText",
      created: "2026-01-01",
    },
    {
      title: "Quick Start Guide",
      slug: "getting-started",
      description: "Sign up, create your first project, invite your team, and start your first sprint.",
      icon: "Rocket",
      created: "2026-01-01",
    },
    {
      title: "Shortcuts",
      slug: "shortcuts",
      description: "Master Wekraft with keyboard shortcuts for navigation and tasks.",
      icon: "Command",
      created: "2026-01-01",
    },
    {
      title: "Community Hub",
      slug: "community",
      description: "Explore and discover public projects and collaboration opportunities.",
      icon: "Users",
      created: "2026-01-01",
    },
  ],
  "Workspace": [
    {
      title: "Workspace Dashboard",
      slug: "project-workspace",
      description: "Detailed guide to the project workspace dashboard, timeline checkpoints, and analytics charts.",
      icon: "LayoutDashboard",
      created: "2026-01-01",
    },
    {
      title: "Git Repositories",
      slug: "repositories",
      description: "Learn how to connect and link GitHub repositories to your projects.",
      icon: "Code",
      created: "2026-01-01",
    },
    {
      title: "IDE Extension",
      slug: "extension",
      description: "Install, authenticate, and manage tasks without leaving your editor.",
      icon: "Terminal",
      created: "2026-01-01",
    },
  ],
  "Manage Project": [
    {
      title: "Sprint",
      slug: "sprints",
      description: "Plan, start, and complete time-boxed work periods with live analytics.",
      icon: "Zap",
      created: "2026-01-01",
      children: [
        {
          title: "Get started",
          slug: "sprints",
          description: "Sprint overview.",
          icon: "Zap",
          created: "2026-01-01",
        },
        {
          title: "Create sprints",
          slug: "create-sprints",
          description: "Step-by-step guide on creating planned sprints, selecting dates, and committing tasks.",
          icon: "Zap",
          created: "2026-06-07",
        },
        {
          title: "Edit sprints",
          slug: "edit-sprints",
          description: "Step-by-step guide on starting/closing sprints, managing goals, and monitoring charts.",
          icon: "Zap",
          created: "2026-06-07",
        },
        {
          title: "Assign sprints",
          slug: "assign-sprints",
          description: "Step-by-step guide on allocating work to members and balancing workloads.",
          icon: "Zap",
          created: "2026-06-07",
        },
      ],
    },
    {
      title: "Tasks",
      slug: "tasks",
      description: "Create, assign, and track work items across List, Board, and Table views.",
      icon: "CheckSquare",
      created: "2026-01-01",
      children: [
        {
          title: "Get started",
          slug: "tasks",
          description: "Tasks overview.",
          icon: "CheckSquare",
          created: "2026-01-01",
        },
        {
          title: "Create tasks",
          slug: "create-tasks",
          description: "Step-by-step guide on backlog task creation, setting priorities, and estimations.",
          icon: "CheckSquare",
          created: "2026-06-07",
        },
        {
          title: "Edit tasks",
          slug: "edit-tasks",
          description: "Step-by-step guide on transitioning states, using layouts, and inline updates.",
          icon: "CheckSquare",
          created: "2026-06-07",
        },
        {
          title: "Assign tasks",
          slug: "assign-tasks",
          description: "Step-by-step guide on team task assignment and tracking work progress.",
          icon: "CheckSquare",
          created: "2026-06-07",
        },
      ],
    },
    {
      title: "Tickets",
      slug: "tickets",
      description: "Create, assign, prioritize, and resolve support tickets with SLA tracking and status workflows.",
      icon: "Ticket",
      created: "2026-06-06",
      children: [
        {
          title: "Get started",
          slug: "tickets",
          description: "Tickets overview.",
          icon: "Ticket",
          created: "2026-06-06",
        },
        {
          title: "Create tickets",
          slug: "create-tickets",
          description: "Step-by-step guide on creating support tickets via Customer Desk, IDE, or client portal.",
          icon: "Ticket",
          created: "2026-06-07",
        },
        {
          title: "Edit tickets",
          slug: "edit-tickets",
          description: "Step-by-step guide on responding, configuring categories/priorities, and resolving tickets.",
          icon: "Ticket",
          created: "2026-06-07",
        },
        {
          title: "Assign tickets",
          slug: "assign-tickets",
          description: "Step-by-step guide on manual assignments, AI triage, and SLA priority tracking.",
          icon: "Ticket",
          created: "2026-06-07",
        },
      ],
    },
    {
      title: "Issues",
      slug: "issues",
      description: "Track bugs, incidents, and reactive work from three different sources.",
      icon: "AlertCircle",
      created: "2026-01-01",
      children: [
        {
          title: "Get started",
          slug: "issues",
          description: "Issues overview.",
          icon: "AlertCircle",
          created: "2026-01-01",
        },
        {
          title: "Create issues",
          slug: "create-issues",
          description: "Step-by-step guide on logging issues manually, via task blockage, or webhook sync.",
          icon: "AlertCircle",
          created: "2026-06-07",
        },
        {
          title: "Edit issues",
          slug: "edit-issues",
          description: "Step-by-step guide on updating issue status, environments, linked files, and deadlines.",
          icon: "AlertCircle",
          created: "2026-06-07",
        },
        {
          title: "Assign issues",
          slug: "assign-issues",
          description: "Step-by-step guide on assigning developers and syncing tasks with active issues.",
          icon: "AlertCircle",
          created: "2026-06-07",
        },
      ],
    },
    {
      title: "Time Logs",
      slug: "time-logs",
      description: "Auto-track time from the IDE or log manually. Export for reporting.",
      icon: "Clock",
      created: "2026-01-01",
    },
    {
      title: "Project Calendar",
      slug: "calendar",
      description: "Shared view of milestones, events, and task due dates across the team.",
      icon: "Calendar",
      created: "2026-01-01",
    },
  ],
  "Team & Collaboration": [
    {
      title: "Projects",
      slug: "projects",
      description: "Create and configure projects, manage visibility, and invite team members.",
      icon: "FolderTree",
      created: "2026-01-01",
      children: [
        {
          title: "Get started",
          slug: "projects",
          description: "Projects overview.",
          icon: "FolderTree",
          created: "2026-01-01",
        },
        {
          title: "Invite member",
          slug: "invite-member",
          description: "Step-by-step guide on inviting members to a project.",
          icon: "FolderTree",
          created: "2026-06-07",
        },
        {
          title: "Join projects",
          slug: "join-projects",
          description: "Step-by-step guide on submitting join requests and joining projects.",
          icon: "FolderTree",
          created: "2026-06-07",
        },
        {
          title: "Delete projects",
          slug: "delete-projects",
          description: "Step-by-step guide on deleting and archiving projects.",
          icon: "FolderTree",
          created: "2026-06-07",
        },
      ],
    },
    {
      title: "Team Space",
      slug: "team-space",
      description: "See who's on your team, what they're building, and their profiles.",
      icon: "Layers",
      created: "2026-01-01",
      children: [
        {
          title: "Get started",
          slug: "team-space",
          description: "Team Space overview.",
          icon: "Layers",
          created: "2026-01-01",
        },
        {
          title: "Create channels",
          slug: "create-channels",
          description: "Step-by-step guide on creating chat channels.",
          icon: "Layers",
          created: "2026-06-07",
        },
        {
          title: "Team Space Settings",
          slug: "team-space-settings",
          description: "Step-by-step guide on managing and configuring channel settings.",
          icon: "Layers",
          created: "2026-06-07",
        },
        {
          title: "Team Space Permissions",
          slug: "team-space-permissions",
          description: "Step-by-step guide on managing channel members and access permissions.",
          icon: "Layers",
          created: "2026-06-07",
        },
      ],
    },
    {
      title: "Team Meet",
      slug: "team-meet",
      description: "Collaborate in real-time with your teammates via video call rooms.",
      icon: "Video",
      created: "2026-01-01",
    },
    {
      title: "Repository Heatmaps",
      slug: "heatmaps",
      description: "AI-powered workload analysis, burnout risk detection, and activity trends.",
      icon: "BarChart3",
      created: "2026-01-01",
    },
    {
      title: "Manage Teams & Roles",
      slug: "manage-teams",
      description: "Invite members, set roles, handle join requests, and configure permissions.",
      icon: "Settings",
      created: "2026-01-01",
    },
  ],
  "Customer Desk": [
    {
      title: "Customer Desk",
      slug: "customer-desk",
      description: "Manage inbound customer requests, service tickets, and client support workflows from a unified desk.",
      icon: "LifeBuoy",
      created: "2026-06-06",
    },
  ],
  "AI Agents": [
    {
      title: "Kaya PM Agent",
      slug: "kaya-pm",
      description: "Meet your AI product manager for reporting, sprint planning, and insights.",
      icon: "Sparkles",
      created: "2026-05-29",
    },
    {
      title: "Harry Dev Agent",
      slug: "harry-dev",
      description: "Meet your AI senior developer for code reviews, automation, and issue resolution.",
      icon: "Bot",
      created: "2026-05-29",
    },
  ],
  "Settings & Platform": [
    {
      title: "User Profile",
      slug: "profile",
      description: "Manage your active profile, skills, and social links.",
      icon: "UserCog",
      created: "2026-01-01",
    },
    {
      title: "Notifications & Alerts",
      slug: "notifications",
      description: "Real-time alerts for task assignments, sprint events, and team activity.",
      icon: "Bell",
      created: "2026-01-01",
    },
    {
      title: "Security & Permissions",
      slug: "security",
      description: "Understand project visibility, team roles, and data protection.",
      icon: "ShieldCheck",
      created: "2026-01-01",
    },
    {
      title: "Billing & Plans",
      slug: "billing",
      description: "Detailed breakdown of Free, Plus, and Pro plans and usage limits.",
      icon: "CreditCard",
      created: "2026-01-01",
    },
    {
      title: "Referral Program",
      slug: "referrals",
      description: "Share your unique code to invite users and earn rewards.",
      icon: "UserPlus",
      created: "2026-06-03",
    },
    {
      title: "Help & Support",
      slug: "support",
      description: "Submit support tickets, track issues, and talk to the AI Support Assistant.",
      icon: "HelpCircle",
      created: "2026-06-03",
    },
    {
      title: "Terms of Service",
      slug: "terms",
      description: "Terms and conditions for utilizing the WeKraft platform and AI agents.",
      icon: "FileText",
      created: "2026-06-05",
    },
    {
      title: "Privacy Policy",
      slug: "privacy",
      description: "Privacy practices detailing WeKraft data collection, repository safety, and cookies.",
      icon: "ShieldCheck",
      created: "2026-06-05",
    },
  ],
};

function flattenDocs(items: DocItem[]): DocItem[] {
  const result: DocItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children) {
      result.push(...flattenDocs(item.children));
    }
  }
  return result;
}

const uniqueDocs: DocItem[] = [];
const seenSlugs = new Set<string>();
for (const doc of flattenDocs(Object.values(docsConfig).flat())) {
  if (!seenSlugs.has(doc.slug)) {
    seenSlugs.add(doc.slug);
    uniqueDocs.push(doc);
  }
}

export const allDocs = uniqueDocs;