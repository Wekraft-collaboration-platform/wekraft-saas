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