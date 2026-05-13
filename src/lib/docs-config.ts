export interface DocItem {
  title: string;
  slug: string;
  category?: string;
}

export const docsConfig: { [key: string]: DocItem[] } = {
  "Getting Started": [
    { title: "Overview", slug: "overview" },
    { title: "VS Code Extension", slug: "extension" },
  ],
  "Core Features": [
    { title: "Projects", slug: "projects" },
    { title: "Tasks", slug: "tasks" },
    { title: "Issues", slug: "issues" },
    { title: "Sprints", slug: "sprints" },
  ],
  "Advanced Tools": [
    { title: "Time Logs", slug: "time-logs" },
    { title: "Calendar", slug: "calendar" },
    { title: "Team Space", slug: "team-space" },
    { title: "Heatmaps", slug: "heatmaps" },
    { title: "Manage Teams", slug: "manage-teams" },
  ],
};

export const allDocs = Object.values(docsConfig).flat();
