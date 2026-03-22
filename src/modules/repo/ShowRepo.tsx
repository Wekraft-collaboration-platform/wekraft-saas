import { useState } from "react";
import { cn } from "@/lib/utils";
import { LucideGitBranch, LucidePlus, Star, GitFork, Eye, Lock, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRepositories } from ".";

interface RepositoryListProps {
  searchQuery: string;
  selectedRepo: string;
  setSelectedRepo: (data: { owner: string; repo: string }) => void;
}

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

const ITEMS_PER_PAGE = 5;

const ShowRepo = ({
  searchQuery,
  selectedRepo,
  setSelectedRepo,
}: RepositoryListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isConnecting, setIsConnecting] = useState<number | null>(null);
  const {
    data: repositories,
    isLoading,
    isFetching,
    error,
  } = useRepositories(currentPage, ITEMS_PER_PAGE);

  const handleConnect = async (repo: Repository) => {
    // Logic to connect repo
    console.log("Connecting repo:", repo.full_name);
  };

  const filteredRepos =
    repositories?.filter((repo: any) =>
      repo.name.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 mt-10">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-full p-2.5 rounded-lg border border-white/5 bg-white/[0.02]"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-md bg-white/5" />
                <Skeleton className="h-4 w-32 rounded bg-white/5" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full bg-white/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm p-4 bg-red-500/10 rounded-lg border border-red-500/20">
        <p className="font-semibold mb-1">Error</p>
        Failed to load repositories. Please ensure your GitHub token is valid.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pb-10 mt-10">
      {/* Scrollable Repo List */}
      <div className="flex-1">
        <div
          className={cn(
            "space-y-4 transition-opacity duration-200",
            isFetching ? "opacity-50 pointer-events-none" : "opacity-100",
          )}
        >
          {filteredRepos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <LucideGitBranch className="size-10 text-muted-foreground/20 mb-3" />
              <p className="text-muted-foreground text-sm">
                No repositories found
              </p>
            </div>
          ) : (
            filteredRepos.map((repo: Repository) => (
              <div
                key={repo.id}
                onClick={() =>
                  setSelectedRepo({ owner: repo.owner.login, repo: repo.name })
                }
                className={cn(
                  "w-full flex flex-col space-y-4 p-4 rounded-xl border transition-all duration-300 group cursor-pointer",
                  selectedRepo === repo.name
                    ? "bg-white/10 text-white border-white/30 shadow-lg shadow-black/20"
                    : "bg-white/5 text-white border-white/10 hover:border-white/10 hover:bg-white/10",
                )}
              >
                <div className="flex w-full justify-between items-start gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img 
                        src={repo.owner.avatar_url} 
                        alt={repo.owner.login} 
                        className="size-10 rounded-lg object-cover border border-white/10"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-white/10">
                        {repo.private ? (
                          <Lock className="size-3 text-amber-500" />
                        ) : (
                          <Globe className="size-3 text-emerald-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm truncate tracking-tight">
                          {repo.name}
                        </p>
                        <span className="text-[10px] text-muted-foreground/60">
                          {repo.owner.login}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
                         <span className="flex items-center gap-1">
                            <Star className="size-3" /> {repo.stargazers_count}
                         </span>
                         <span className="flex items-center gap-1">
                            <GitFork className="size-3" /> {repo.forks_count}
                         </span>
                         <span className="flex items-center gap-1">
                            <Eye className="size-3" /> {repo.watchers_count}
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-fit py-0 px-2.5 text-[10px] font-medium text-muted-foreground",
                      )}
                    >
                      {repo.private ? "Private" : "Public"}
                    </Badge>
                    <p className="text-[9px] text-muted-foreground/70 italic whitespace-nowrap">
                       Active {new Date(repo.pushed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                   <div className="flex items-center gap-2">
                       {repo.language && (
                        <div className="flex items-center gap-1.5">
                           <div className="size-2 rounded-full bg-primary" />
                           <span className="text-[10px] text-muted-foreground">{repo.language}</span>
                        </div>
                      )}
                      {repo.owner.type === "Organization" && (
                         <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground border border-white/5">Org</span>
                      )}
                   </div>
                   <Button
                      disabled={isConnecting === repo.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect(repo);
                      }}
                      size="sm"
                      className="h-7 py-0 px-6! text-[10px] bg-primary/5 hover:bg-primary/10 text-white border border-primary/40 flex items-center gap-1.5 rounded-md"
                    >
                      Connect <LucidePlus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      {filteredRepos.length > 0 && (
        <div className="pt-6 border-t mt-auto">
          <Pagination>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={cn(
                    "bg-white/5 border-white/5 hover:bg-white/10 cursor-pointer transition-all",
                    currentPage === 1 && "pointer-events-none opacity-30",
                  )}
                />
              </PaginationItem>

              <PaginationItem>
                <div className="px-3 py-1.5 rounded-md bg-white/5 border border-white/5 text-xs font-medium min-w-[32px] text-center">
                  {currentPage}
                </div>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={cn(
                    "bg-white/5 border-white/5 hover:bg-white/10 cursor-pointer transition-all",
                    filteredRepos.length < ITEMS_PER_PAGE &&
                      "pointer-events-none opacity-30",
                  )}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-[10px] text-center text-muted-foreground mt-3 italic">
            Displaying {filteredRepos.length} results
          </p>
        </div>
      )}
    </div>
  );
};

export default ShowRepo;