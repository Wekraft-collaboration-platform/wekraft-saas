"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Globe,
  Lock,
  MoreVertical,
  FolderCode,
  Settings2,
  ExternalLink,
  GitPullRequest,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CreateProjectDialog from "@/modules/project/CreateProjectDialog";

interface DashboardProject {
  _id: string;
  projectName: string;
  isPublic: boolean;
  thumbnailUrl?: string;
  repoId?: string;
  repoName?: string;
  projectWorkStatus?: string;
  slug: string;
  createdAt?: number;
  role: "Owner" | "Member";
  members?: {
    userId: string;
    userImage?: string;
    userName: string;
  }[];
  totalMembers: number;
}

interface DashboardProjectsProps {
  projects: DashboardProject[] | undefined;
  isRightSidebarExpanded: boolean;
}

const formatRelativeTime = (ts: number): string => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (d < 1) {
    if (h < 1) {
      if (m < 1) return "just now";
      return m === 1 ? "1 minute ago" : `${m} minutes ago`;
    }
    return h === 1 ? "1 hour ago" : `${h} hours ago`;
  }
  return d === 1 ? "1 day ago" : `${d} days ago`;
};


export const DashboardProjects = ({
  projects,
  isRightSidebarExpanded,
}: DashboardProjectsProps) => {
  const router = useRouter();

  return (
    <div className="space-y-5 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Projects Tab Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h2 className="text-lg tracking-tight text-foreground flex items-center gap-2">
            Your All Projects

          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage your creations and team collaboration workspaces.
          </p>
        </div>
        <CreateProjectDialog
          trigger={
            <Button size="sm" className="h-8 text-xs gap-1.5 cursor-pointer shadow-xs hover:shadow-md transition-all duration-200">
              <Plus className="h-3.5 w-3.5" /> Create Project
            </Button>
          }
        />
      </div>

      {/* Projects Grid */}
      {projects === undefined ? (
        <div
          className={cn(
            "grid gap-4",
            isRightSidebarExpanded
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          )}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-sidebar p-3 h-[250px] animate-pulse"
            >
              <div className="aspect-video w-full bg-muted/40 rounded-xl" />
              <div className="h-3.5 bg-muted/40 rounded w-3/4 mt-2" />
              <div className="h-2.5 bg-muted/20 rounded w-1/2" />
              <div className="mt-auto h-7 bg-muted/30 rounded w-full" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-border border-dashed rounded-xl bg-muted text-center h-[260px] transition-all">
          <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3 animate-bounce">
            <FolderCode className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-foreground tracking-tight">
            No Projects Found
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
            Start a new workspace to collaborate, track stats, and manage tasks.
          </p>
          <CreateProjectDialog
            trigger={
              <Button variant="outline" size="sm" className="mt-4 h-8 text-xs gap-1.5 cursor-pointer">
                <Plus className="h-3.5 w-3.5" /> Create First Project
              </Button>
            }
          />
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-4",
            isRightSidebarExpanded
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          )}
        >
          {projects.map((project) => (
            <div
              key={project._id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-muted shadow-md h-full"
            >
              {/* Top Part: Cover Image with float badges */}
              <div className="aspect-video w-full bg-muted relative overflow-hidden shrink-0">
                {project.thumbnailUrl ? (
                  <img
                    src={project.thumbnailUrl}
                    alt={project.projectName}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full h-full bg-linear-to-br flex items-center justify-center"
                    )}
                  >
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[1.5px]" />
                    <FolderCode className="h-9 w-9 text-white/30 drop-shadow-sm" />
                  </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                  {/* Role Badge */}
                  <span
                    className={cn(
                      "text-xs  px-1.5 py-0.5 rounded-full border shadow-xs backdrop-blur-md",
                      project.role === "Owner"
                        ? "bg-blue-500/10 text-white border-blue-500/20"
                        : "bg-blue-500/10 text-white border-blue-500/20"
                    )}
                  >
                    {project.role}
                  </span>


                </div>
              </div>

              {/* Card Body - Overlapping cover image & scooped corner background */}
              <div
                className="relative flex flex-col flex-1 p-3 -mt-6 rounded-t-[20px]"
                style={{
                  background: `
                    radial-gradient(circle at 100% 0, transparent 60px, var(--muted) 27px) top right / 60px 0px no-repeat,
                    linear-gradient(var(--muted), var(--muted)) left top / calc(100% - 60px) 80% no-repeat,
                    linear-gradient(var(--muted), var(--muted)) right bottom / 60px calc(100% - 26px) no-repeat
                  `,
                }}
              >

                {/* Top Metadata Line */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground/70 mb-1 font-medium">
                  <span>
                    {project.createdAt
                      ? formatRelativeTime(project.createdAt)
                      : "some time ago"}
                  </span>


                </div>

                {/* Project Name Title */}
                <h3 className="text-xs font-bold text-foreground truncate tracking-tight mb-3">
                  <span
                    onClick={() =>
                      router.push(`/dashboard/my-projects/${project.slug}`)
                    }
                    className="hover:text-primary transition-colors cursor-pointer"
                  >
                    {project.projectName}
                  </span>
                </h3>

                {/* Footer Info: Avatars and Repository Bubble */}
                <div className="mt-auto flex items-center justify-between gap-4 pt-1.5 border-t border-border/20">
                  {/* Avatars Stack */}
                  {project.totalMembers > 0 ? (
                    <div className="flex -space-x-1">
                      {project.members?.slice(0, 3).map((member, i) => (
                        <div
                          key={i}
                          className="size-4.5 rounded-full border border-sidebar bg-accent overflow-hidden shadow-xs"
                          title={member.userName}
                        >
                          {member.userImage ? (
                            <img
                              src={member.userImage}
                              alt={member.userName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[6px] bg-primary/20 text-primary font-bold">
                              {member.userName.charAt(0)}
                            </div>
                          )}
                        </div>
                      ))}
                      {project.totalMembers > 3 && (
                        <div className="size-4.5 rounded-full border border-sidebar bg-accent flex items-center justify-center text-[6px] text-muted-foreground font-bold">
                          +{project.totalMembers - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-[9px] text-muted-foreground/60">
                      0 members
                    </span>
                  )}


                </div>

                {/* Action buttons view/workspace */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/my-projects/${project.slug}`)
                    }
                    className="h-7 text-[10px] gap-1 border-border/60 hover:bg-accent/40 transition-all font-semibold cursor-pointer"
                  >
                    <Settings2 className="size-3" /> View
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/dashboard/my-projects/${project.slug}/workspace`
                      )
                    }
                    className="h-7 text-[10px] gap-1 font-semibold transition-all cursor-pointer"
                  >
                    <ExternalLink className="size-3" /> Workspace
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
