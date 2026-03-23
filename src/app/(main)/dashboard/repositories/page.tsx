"use client";
import { FolderGit2, GitBranch, Layers2, LayoutGrid, LucideGitBranch, Search } from "lucide-react";
import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ShowRepo from "@/modules/repo/ShowRepo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

const RepositoriesPage = () => {
  const [selectedRepo, setSelectedRepo] = useState<{
    owner: string;
    repo: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const unlinkedProjects = useQuery(api.project.getUnlinkedProjects);
  const connectedRepos = useQuery(api.repo.getConnectedRepos);

  return (
    <div className="w-full h-full animate-in fade-in duration-700 p-6 2xl:p-10 2xl:py-7">
      <h1 className="text-3xl font-bold tracking-tight">
        Manage Repositories
        <FolderGit2 className="h-7 w-7 inline ml-2" />
      </h1>
      <p className="text-muted-foreground mt-2">
        Manage & Connect your GitHub repositories to your Projects .
      </p>

      <div className="my-10 px-12 mx-auto">
        <div className="flex items-center gap-6">
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-3 top-2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              className="bg-accent border-muted-foreground/10 pl-10 focus:ring-1 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" className="text-xs cursor-pointer gap-2">
                View Connected Repo <GitBranch className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="end">
              <div className="p-4 border-b bg-muted/50">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <GitBranch className="size-4 text-primary" /> Active Linked
                  Repositories
                </h3>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Repositories currently linked to your projects.
                </p>
              </div>
              <ScrollArea className="h-64">
                {connectedRepos === undefined ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    Loading...
                  </div>
                ) : connectedRepos.filter((r) => r.projectName).length === 0 ? (
                  <div className="p-8 text-center space-y-2">
                    <FolderGit2 className="size-8 text-muted-foreground/20 mx-auto" />
                    <p className="text-xs text-muted-foreground font-medium">
                      No linked repositories
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 px-4">
                      No repo is currently linked to any project. Start by
                      connecting one below.
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {connectedRepos
                      .filter((r) => r.projectName)
                      .map((repo) => (
                        <div
                          key={repo._id}
                          className="p-2.5 rounded-lg border dark:bg-accent/30 bg-accent"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate font-inter capitalize">
                               <Layers2 className="size-3 text-primary inline mr-1" /> {repo.projectName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <Badge
                                  variant="secondary"
                                  className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20"
                                >
                                  {repo.repoName}
                                </Badge>
                                <span className="text-[9px] text-muted-foreground font-medium">
                                  Linked
                                </span>
                              </div>
                            </div>
                            <Link
                              href={`/dashboard/my-projects/${repo.projectId}`}
                              className=" cursor-pointer"
                            >
                              <Button
                                size="icon"
                                variant="outline"
                                className="size-6 shrink-0"
                              >
                                <LayoutGrid className="size-3" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
              <div className="p-3 bg-muted/30 border-t">
                <p className="text-[9px] text-center text-muted-foreground">
                  Total{" "}
                  {connectedRepos?.filter((r) => r.projectName).length || 0}{" "}
                  active connections
                </p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <ShowRepo
          searchQuery={searchQuery}
          selectedRepo={selectedRepo}
          setSelectedRepo={setSelectedRepo}
          unlinkedProjects={unlinkedProjects}
          connectedRepos={connectedRepos}
        />
      </div>
    </div>
  );
};

export default RepositoriesPage;
