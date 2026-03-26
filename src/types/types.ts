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