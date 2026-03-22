import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LucideGitBranch,
  LucidePlus,
  Star,
  GitFork,
  Eye,
  Lock,
  Globe,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { Repository } from "@/types/types";
import { createWebhook } from "../github/actions/action";
import { ConnectRepo } from "./action";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface RepositoryListProps {
  searchQuery: string;
  selectedRepo: { owner: string; repo: string } | null;
  setSelectedRepo: (data: { owner: string; repo: string }) => void;
  unlinkedProjects: Doc<"projects">[] | undefined;
}

const ITEMS_PER_PAGE = 5;

const ShowRepo = ({
  searchQuery,
  selectedRepo,
  setSelectedRepo,
  unlinkedProjects,
}: RepositoryListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isConnecting, setIsConnecting] = useState<number | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [repoToConnect, setRepoToConnect] = useState<Repository | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<
    Id<"projects"> | ""
  >("");
  const {
    data: repositories,
    isLoading,
    isFetching,
    error,
  } = useRepositories(currentPage, ITEMS_PER_PAGE);

  const conectAndUpdateRepoMutation = useMutation(api.repo.connectRepository);

  const openConnectDialog = (repo: Repository) => {
    setRepoToConnect(repo);
    setSelectedProjectId("");
    setConnectDialogOpen(true);
  };

  const handleConfirmConnect = async () => {
    if (!repoToConnect || !selectedProjectId) return;
    const project = unlinkedProjects?.find((p) => p._id === selectedProjectId);

    try {
      toast.loading("Connecting repository...", {
        description: "Kindly wait for the proper syncing...",
        id: "toast-connect-repo",
      });
      await createWebhook(repoToConnect.owner.login, repoToConnect.name);

      await conectAndUpdateRepoMutation({
        projectId: selectedProjectId as Id<"projects">,
        githubId: BigInt(repoToConnect.id),
        repoName: repoToConnect.name,
        repoOwner: repoToConnect.owner.login,
        repoFullName: repoToConnect.full_name,
        repoType: repoToConnect.owner.type,
        repoUrl: repoToConnect.html_url,
      });
      toast.success(
        `Link prepared: ${repoToConnect.full_name} → ${project?.projectName ?? "project"}`,
      );

      // Fire & Forget
      // ConnectRepo({
      //   projectId: selectedProjectId as Id<"projects">,
      //   owner: repoToConnect.owner.login,
      //   repo: repoToConnect.name,
      //   githubId: BigInt(repoToConnect.id),
      //   name: repoToConnect.name,
      //   fullName: repoToConnect.full_name,
      //   url: repoToConnect.html_url,
      //   repoType: repoToConnect.owner.type,
      // });
    } catch (error) {
      toast.dismiss("toast-connect-repo");
      toast.error("Failed to connect repository");
      setConnectDialogOpen(false);
      setRepoToConnect(null);
      setSelectedProjectId("");
    } finally {
      toast.dismiss("toast-connect-repo");
      setConnectDialogOpen(false);
      setRepoToConnect(null);
      setSelectedProjectId("");
    }
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
    <div className="flex flex-col h-full pb-10 mt-10 animate-in fade-in duration-700">
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
                  "w-full flex flex-col space-y-4 p-4 rounded-xl border transition-all group cursor-pointer bg-accent/10 text-primary border-primary/10 hover:border-primary/10 hover:bg-accent/30",
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
                        <span className="text-[10px] text-muted-foreground">
                          {repo.language}
                        </span>
                      </div>
                    )}
                    {repo.owner.type === "Organization" && (
                      <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-muted-foreground border border-white/5">
                        Org
                      </span>
                    )}
                  </div>
                  <Button
                    disabled={isConnecting === repo.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openConnectDialog(repo);
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

      <Dialog
        open={connectDialogOpen}
        onOpenChange={(open) => {
          setConnectDialogOpen(open);
          if (!open) {
            setRepoToConnect(null);
            setSelectedProjectId("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect repository</DialogTitle>
            <DialogDescription>
              Choose a project without a linked repo.{" "}
              {repoToConnect && (
                <span className="text-foreground font-medium">
                  {repoToConnect.full_name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {unlinkedProjects === undefined ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Loading projects…
            </p>
          ) : unlinkedProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              You have no projects without a repository yet. Create a project
              first, then connect it here.
            </p>
          ) : (
            <ScrollArea className="max-h-[min(320px,50vh)] pr-3">
              <RadioGroup
                value={selectedProjectId}
                onValueChange={(v) => setSelectedProjectId(v as Id<"projects">)}
                className="gap-2"
              >
                {unlinkedProjects.map((project) => (
                  <div
                    key={project._id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 transition-colors",
                      selectedProjectId === project._id
                        ? "border-primary/50 bg-accent/50"
                        : "border-border hover:bg-muted/50",
                    )}
                  >
                    <RadioGroupItem
                      value={project._id}
                      id={`unlink-project-${project._id}`}
                    />
                    <Label
                      htmlFor={`unlink-project-${project._id}`}
                      className="flex-1 cursor-pointer text-sm font-medium leading-none"
                    >
                      {project.projectName}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConnectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                !selectedProjectId ||
                unlinkedProjects === undefined ||
                unlinkedProjects.length === 0
              }
              onClick={handleConfirmConnect}
            >
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShowRepo;
