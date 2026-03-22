"use client";
import { FolderGit2, GitBranch, LayoutGrid, Search } from "lucide-react";
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
      <h1 className="text-2xl font-semibold tracking-tight">
        Manage & Connect your Repositories{" "}
        <FolderGit2 className="h-6 w-6 inline ml-1" />
      </h1>
      <p className="text-muted-foreground mt-2">
        Connect your GitHub repositories to WeKraft to track your progress and
        get insights.
      </p>

      <div className="my-10 px-12 mx-auto">
        <div className="flex items-center gap-6">
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-3 top-2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search repositories..."
              className="bg-white/5 border-white/10 pl-10 focus:ring-1 focus:ring-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button size='sm' className="text-xs cursor-pointer">
            View Connected Repo <GitBranch className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <ShowRepo
          searchQuery={searchQuery}
          selectedRepo={selectedRepo}
          setSelectedRepo={setSelectedRepo}
        />
      </div>
    </div>
  );
};

export default RepositoriesPage;
