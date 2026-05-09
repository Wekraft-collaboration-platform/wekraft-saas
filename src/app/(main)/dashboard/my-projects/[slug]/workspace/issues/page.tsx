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
import {
  IssueKanbanUI,
  SEVERITY_CONFIG,
  TYPE_CONFIG,
  Issue,
} from "@/modules/workspace/IssueKanbanUI";
import { ImportGithubIssueDialog } from "@/modules/workspace/heatmaps/ImportGithubIssueDialog";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, ExternalLink, FileCode, MoreHorizontal } from "lucide-react";

const users = [
  { name: "Ritesh", img: "https://i.pravatar.cc/40?img=1" },
  { name: "Mia", img: "https://i.pravatar.cc/40?img=2" },
  { name: "Alex", img: "https://i.pravatar.cc/40?img=3" },
  { name: "John", img: "https://i.pravatar.cc/40?img=4" },
];

const GithubIssueCard = ({ issue }: { issue: Issue }) => {
  const severity = issue.severity
    ? SEVERITY_CONFIG[issue.severity]
    : {
        label: "No Severity",
        iconColor: "text-neutral-500",
        icon: null,
      };
  const type = TYPE_CONFIG[issue.type];

  return (
    <Card className="group cursor-pointer p-3! bg-sidebar border-accent hover:border-primary/30 transition-all rounded-xl shadow-xs">
      <div className="flex flex-col gap-3">
        {/* Top: Severity and Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-1 rounded bg-muted border border-border text-neutral-400 flex items-center gap-1.5",
              )}
            >
              <span className={cn(severity.iconColor)}>
                {severity.icon &&
                  React.cloneElement(severity.icon as React.ReactElement, {
                    // @ts-ignore
                    className: "w-2.5 h-2.5",
                  })}
              </span>
              {severity.label}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-1 rounded bg-muted border border-border text-neutral-400 flex items-center gap-1.5",
              )}
            >
              <span className={cn(type.iconColor)}>
                {type.icon &&
                  React.cloneElement(type.icon as React.ReactElement, {
                    // @ts-ignore
                    className: "w-2.5 h-2.5",
                  })}
              </span>
              {type.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {issue.githubIssueUrl && (
              <a
                href={issue.githubIssueUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-neutral-500 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </a>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Name */}
        <h4 className="text-[13px] font-medium text-neutral-200 line-clamp-2 leading-snug">
          {issue.title}
        </h4>

        {/* Codebase Linked */}
        <div className="flex items-center gap-2 text-neutral-500">
          <FileCode className="h-3.5 w-3.5" />
          <span className="text-[11px] truncate">
            {issue.fileLinked ? (
              <span className="text-neutral-400">
                {issue.fileLinked.split("/").pop()}
              </span>
            ) : (
              "Not linked any file"
            )}
          </span>
        </div>

        {/* Footer: Due Date and Assignee */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-1">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">
              {issue.due_date ? format(issue.due_date, "MMM d") : "No due date"}
            </span>
          </div>

          <div className="flex -space-x-1.5">
            {issue.assignedTo?.slice(0, 3).map((assignee, i) => (
              <Avatar
                key={i}
                className="h-5.5 w-5.5 border border-sidebar group-hover:border-neutral-800 transition-all"
              >
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="text-[8px] bg-neutral-800 text-neutral-400">
                  {assignee.name[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

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
          <div className="flex flex-col w-full mt-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
                  <Github className="w-5 h-5 text-primary" />
                  Imported issues from Github
                </h2>
                <p className="text-sm text-muted-foreground">
                  View and manage all issues imported from your GitHub
                  repository.
                </p>
              </div>
              {project && (
                <ImportGithubIssueDialog
                  projectId={project._id}
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

            {issues === undefined ? (
              <div className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-[200px] rounded-xl bg-sidebar/50 border border-border/30 animate-pulse"
                  />
                ))}
              </div>
            ) : issues.filter((i) => i.type === "github").length === 0 ? (
              <div className="flex flex-col space-y-1 mt-10 items-center justify-center min-h-[300px] text-center">
                <Github className="w-8 h-8 text-primary" />

                <h3 className="text-base font-semibold">No Imported Issues</h3>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">
                  You haven't imported any issues from GitHub yet. Use the
                  button above to sync your repository issues.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {issues
                  .filter((i) => i.type === "github")
                  .map((issue) => (
                    <GithubIssueCard key={issue._id} issue={issue as any} />
                  ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default IssuesPage;
