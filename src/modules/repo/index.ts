
import { useQuery } from "@tanstack/react-query";
import { getRepositories, searchRepositories } from "../github/actions/action";
import { Repository } from "@/types/types";

export function useRepositories(page: number = 1, perPage: number = 10, enabled: boolean = true, searchQuery: string = "") {
  return useQuery<Repository[]>({
    queryKey: ["repositories", page, perPage, searchQuery],
    queryFn: async () => {
      if (searchQuery.trim()) {
        const data = await searchRepositories(searchQuery.trim());
        return data as Repository[];
      }
      const data = await getRepositories(page, perPage);
      return data as Repository[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 30 * 60 * 1000,
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: 1000,
  });
}

