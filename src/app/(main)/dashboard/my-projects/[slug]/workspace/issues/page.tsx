"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import {
  Bug,
  FileCodeCorner,
  Filter,
  Github,
  Search,
  Sparkles,
  UserPlus,
} from "lucide-react";
import React, { useState } from "react";
import { api } from "../../../../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { CreateIssueDialog } from "@/modules/workspace/CreateIssueDialog";
import { cn } from "@/lib/utils";
import { useKayaStore } from "@/store/useKayaStore";
import { IssueKanbanUI } from "@/modules/workspace/IssueKanbanUI";
import { ImportGithubIssueDialog } from "@/modules/workspace/heatmaps/ImportGithubIssueDialog";

const users = [
  { name: "Ritesh", img: "https://i.pravatar.cc/40?img=1" },
  { name: "Mia", img: "https://i.pravatar.cc/40?img=2" },
  { name: "Alex", img: "https://i.pravatar.cc/40?img=3" },
  { name: "John", img: "https://i.pravatar.cc/40?img=4" },
];

const IssuesPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectName = project?.projectName;
  const [activeTab, setActiveTab] = useState<"all" | "github">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { setIsOpen } = useKayaStore();

  // Fetch all issues for the kanban board
  const issues = useQuery(
    api.issue.getIssuesForKanban,
    project?._id ? { projectId: project._id } : "skip",
  );

  const hasIssues = issues && issues.length > 0;

  return (
    <div className="w-full h-full p-6 2xl:p-8 flex flex-col">
      {/* ── Header ───────────────────────────────────── */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          <Bug className="w-6 h-6 ml-1 -mt-0.5 text-primary inline" /> Issues
        </h1>

        <div className="flex items-center gap-5">
          {/* Avatar Stack */}
          <div className="flex -space-x-3">
            {users.map((user, i) => (
              <Avatar
                key={i}
                className="w-8 h-8 border-2 border-background hover:z-10 transition"
              >
                <AvatarImage src={user.img} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            ))}
          </div>

          {/* Invite Button */}
          <Button
            className="text-xs cursor-pointer px-4 bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
          >
            <UserPlus className="w-5 h-5 mr-1" />
            Invite
          </Button>
        </div>
      </header>

      {/* ── Tabs + Controls ──────────────────────────── */}
      <div className="flex items-center w-full justify-between gap-3 mt-6 border-b border-accent pb-2">
        <div className="flex items-center gap-6">
          <Button
            variant={"ghost"}
            size={"sm"}
            className={cn(
              "text-[15px] relative h-9 px-0 hover:bg-transparent rounded-none",
              activeTab === "all" ? "text-primary" : "text-muted-foreground",
            )}
            onClick={() => setActiveTab("all")}
          >
            <Bug className="w-4 h-4 mr-2" /> All Issues
            {activeTab === "all" && (
              <div className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-primary rounded-t-full" />
            )}
          </Button>
          <Button
            variant={"ghost"}
            size={"sm"}
            className={cn(
              "text-[15px] relative h-9 px-0 hover:bg-transparent rounded-none",
              activeTab === "github" ? "text-primary" : "text-muted-foreground",
            )}
            onClick={() => setActiveTab("github")}
          >
            <Github className="w-4 h-4 mr-2" />
            Github Issue
            {activeTab === "github" && (
              <div className="absolute -bottom-[9px] left-0 right-0 h-[2px] bg-primary rounded-t-full" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-[300px] border-muted"
            />
          </div>

          {/* <Button variant="outline" size="sm" className="h-9 text-xs">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </Button> */}

          {/* Ask Kaya */}
          <Button
            size="sm"
            variant={"outline"}
            onClick={() => setIsOpen(true)}
            className="bg-linear-to-t from-indigo-600/30 via-purple-600/10 to-transparent text-xs cursor-pointer"
          >
            <Image src="/kaya.svg" alt="Kaya AI" width={18} height={18} />
            Ask bout Issues
          </Button>

          {/* New Issue */}
          {project && (
            <CreateIssueDialog
              projectId={project._id}
              projectName={projectName}
              repoFullName={project.repoFullName}
              ownerClerkId={(project as any).ownerClerkId}
              trigger={
                <Button size="sm" className="text-xs">
                  New Issue
                  <Bug className="w-5 h-5 mr-2" />
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────── */}
      <main className="w-full flex-1 mt-2 overflow-hidden">
        {activeTab === "all" && (
          <>
            {/* Loading skeleton */}
            {issues === undefined && (
              <div className="flex gap-5 pt-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[310px] w-[310px] h-[500px] rounded-xl bg-sidebar/50 border border-border/30 animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Empty state */}
            {issues !== undefined && !hasIssues && (
              <div className="flex items-center justify-center min-h-[500px]">
                <div className="flex flex-col items-start justify-center space-y-1.5 p-4 w-[360px] mx-auto">
                  <Image
                    src="/pat101.svg"
                    alt="Empty Workspace"
                    width={100}
                    height={100}
                  />
                  <p className="text-base font-medium text-primary">
                    No Issues Found
                  </p>
                  <p className="text-muted-foreground text-wrap text-left">
                    Create your First Issue and start managing your project in a
                    right way.
                  </p>

                  <div className="flex items-center gap-4 mt-2">
                    {project && (
                      <CreateIssueDialog
                        projectId={project._id}
                        projectName={projectName}
                        repoFullName={project.repoFullName}
                        ownerClerkId={(project as any).ownerClerkId}
                        trigger={
                          <Button
                            variant="default"
                            size="sm"
                            className="rounded-full text-[11px]"
                          >
                            <Bug className="w-4 h-4" />
                            Add Issue
                          </Button>
                        }
                      />
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full text-[11px]"
                    >
                      Check Docs
                      <FileCodeCorner className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Kanban Board */}
            {issues !== undefined && hasIssues && project && (
              <IssueKanbanUI
                projectId={project._id}
                projectName={projectName}
                repoFullName={project.repoFullName}
                ownerClerkId={(project as any).ownerClerkId}
              />
            )}
          </>
        )}

        {/* GitHub issues tab */}
        {activeTab === "github" && (
          <div className="flex w-full mt-4">
            <div className="flex w-full justify-end gap-3">
              {project && (
                <ImportGithubIssueDialog
                  repoFullName={project.repoFullName}
                  trigger={
                    <Button variant={"default"} size={"sm"} className="text-sm">
                      <Github className="w-4 h-4 mr-2" />
                      Import from Github
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default IssuesPage;
