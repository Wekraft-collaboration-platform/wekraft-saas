import { Id } from "../../convex/_generated/dataModel";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
    type: string;
  };
  private: boolean;
  forks_count: number;
  watchers_count: number;
  pushed_at: string;
}

export interface ProjectQuickStats {
  _id: string;
  projectName: string;
  isPublic: boolean;
  thumbnailUrl?: string;
  repoId?: string;
  repoName?: string;
  projectWorkStatus?: string;
  slug: string;
  members?: {
    userId: string;
    userImage?: string;
    userName: string;
  }[];
  totalMembers: number;
}

export interface Tag {
  label: string;
  color: string;
}

export interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  estimation: { startDate: number; endDate: number };
  type?: Tag;
  assignees?: { name: string; avatar?: string; userId: Id<"users"> }[];
  priority?: string;
  status: string;
  linkWithCodebase?: string;
  isBlocked?: boolean;
  projectId: Id<"projects">;
  createdByUserId: Id<"users">;
  finalCompletedAt?: number;
  finalCompletedBy?: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

// Kanban
export type Status =
  | "not started"
  | "inprogress"
  | "reviewing"
  | "testing"
  | "completed";

export const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: "not started", label: "Not Started", color: "bg-slate-400" },
  { id: "inprogress", label: "In Progress", color: "bg-amber-400" },
  { id: "reviewing", label: "Reviewing", color: "bg-blue-400" },
  { id: "testing", label: "Testing", color: "bg-indigo-400" },
  { id: "completed", label: "Completed", color: "bg-green-400" },
];
export type MyTaskItem = {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low";
  status: "not started" | "inprogress" | "reviewing" | "testing" | "completed";
  estimation: { startDate: number; endDate: number };
  isBlocked?: boolean;
};

export type MyIssueItem = {
  _id: Id<"issues">;
  title: string;
  description?: string;
  severity?: "critical" | "medium" | "low";
  status: "not opened" | "opened" | "in review" | "reopened" | "closed";
  due_date?: number;
  environment?: "local" | "dev" | "staging" | "production";
  type: "manual" | "task-issue" | "github";
};

export type PaginatedResult<T> = {
  items: T[];
  nextCursor: number | null;
};
