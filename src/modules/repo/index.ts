
import { useQuery } from "@tanstack/react-query";
import { getRepositories } from "../github/actions/action";
import { Repository } from "@/types/types";


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

