export interface DocItem {
  title: string;
  slug: string;
  description: string;
  category?: string;
  badge?: "New" | "Updated" | "Beta";
  icon?: string;
}

export const docsConfig: { [key: string]: DocItem[] } = {
  "Getting Started": [
    {
      title: "Overview",
      slug: "overview",
      description: "What Wekraft is, how it works end-to-end, and your plan limits.",
      icon: "BookOpen",
      badge: "Updated",
    },
    {
      title: "VS Code Extension",
      slug: "extension",
      description: "Install, authenticate, and manage tasks without leaving your editor.",
      icon: "Terminal",
    },
  ],
  "Core Features": [
    {
      title: "Projects",
      slug: "projects",
      description: "Create projects, manage roles, connect GitHub, and configure settings.",
      icon: "Layers",
    },
    {
      title: "Tasks",
      slug: "tasks",
      description: "Create, assign, and track work items across List, Board, and Table views.",
      icon: "CheckSquare",
    },
    {
      title: "Issues",
      slug: "issues",
      description: "Track bugs, incidents, and reactive work from three different sources.",
      icon: "AlertCircle",
    },
    {
      title: "Sprints",
      slug: "sprints",
      description: "Plan, start, and complete time-boxed work periods with live analytics.",
      icon: "Zap",
    },
  ],
  "Advanced Tools": [
    {
      title: "Time Logs",
      slug: "time-logs",
      description: "Auto-track time from the IDE or log manually. Export for reporting.",
      icon: "Clock",
    },
    {
      title: "Calendar",
      slug: "calendar",
      description: "Shared view of milestones, events, and task due dates across the team.",
      icon: "Calendar",
    },
    {
      title: "Team Space",
      slug: "team-space",
      description: "See who's on your team, what they're building, and their profiles.",
      icon: "Users",
    },
    {
      title: "Heatmaps",
      slug: "heatmaps",
      description: "AI-powered workload analysis, burnout risk detection, and activity trends.",
      icon: "BarChart3",
    },
    {
      title: "Manage Teams",
      slug: "manage-teams",
      description: "Invite members, set roles, handle join requests, and configure permissions.",
      icon: "Settings",
    },
  ],
};

export const allDocs = Object.values(docsConfig).flat();
