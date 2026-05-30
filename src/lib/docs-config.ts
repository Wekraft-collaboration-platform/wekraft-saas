export interface DocItem {
  title: string;
  slug: string;
  description: string;
  category?: string;
  badge?: "New" | "Updated" | "Beta";
  icon?: string;
  created?: string; // YYYY-MM-DD
  updated?: string; // YYYY-MM-DD
}

export function getDocBadge(item: DocItem): "New" | "Updated" | "Beta" | undefined {
  if (item.badge === "Beta") return "Beta";
  if (!item.created) return undefined;

  const now = Date.now();
  const createdTime = new Date(item.created).getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

  if (now - createdTime < thirtyDaysMs) {
    return "New";
  }

  if (item.updated) {
    const updatedTime = new Date(item.updated).getTime();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (now - updatedTime < sevenDaysMs && updatedTime > createdTime) {
      return "Updated";
    }
  }

  return undefined;
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
      title: "Projects Management",
      slug: "projects",
      description: "Create projects, manage roles, connect GitHub, and configure settings.",
      icon: "FolderTree",
      created: "2026-01-01",
    },
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
      title: "VS Code Extension",
      slug: "extension",
      description: "Install, authenticate, and manage tasks without leaving your editor.",
      icon: "Terminal",
      created: "2026-01-01",
    },
  ],
  "Agile & Tasks": [
    {
      title: "Sprints & Planning",
      slug: "sprints",
      description: "Plan, start, and complete time-boxed work periods with live analytics.",
      icon: "Zap",
      created: "2026-01-01",
    },
    {
      title: "Tasks & Backlog",
      slug: "tasks",
      description: "Create, assign, and track work items across List, Board, and Table views.",
      icon: "CheckSquare",
      created: "2026-01-01",
    },
    {
      title: "Issues & Bug Tracking",
      slug: "issues",
      description: "Track bugs, incidents, and reactive work from three different sources.",
      icon: "AlertCircle",
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
      title: "Team Space",
      slug: "team-space",
      description: "See who's on your team, what they're building, and their profiles.",
      icon: "Layers",
      created: "2026-01-01",
    },
    {
      title: "Team Meet",
      slug: "team-meet",
      description: "Collaborate in real-time with your teammates via video call rooms.",
      icon: "Video",
      created: "2026-01-01",
    },
    {
      title: "Time Logs",
      slug: "time-logs",
      description: "Auto-track time from the IDE or log manually. Export for reporting.",
      icon: "Clock",
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
  ],
};

export const allDocs = Object.values(docsConfig).flat();
