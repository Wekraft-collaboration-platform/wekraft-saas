import { useQuery } from "@tanstack/react-query";
import { getRepositories } from "../github/actions/action";

interface Repository {
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
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export function useRepositories(page: number = 1, perPage: number = 10) {
  return useQuery<Repository[]>({
    queryKey: ["repositories", page, perPage],
    queryFn: async () => {
      const data = await getRepositories(page, perPage);
      return data as Repository[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000,
  });
}