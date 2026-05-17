"use client";

import React from "react";
import {
  Plus,
  Settings2,
  ExternalLink,
  FolderGit2,
  Link2Off,
  Globe,
  Lock,
  LucideLayers2,
  LucideLayers3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProjectQuickStats } from "@/types/types";
import CreateProjectDialog from "@/modules/project/CreateProjectDialog";

interface ProjectCardsProps {
  projects: ProjectQuickStats[] | undefined;
  hideCreateCard?: boolean;
}

export const ProjectCards = ({
  projects,
  hideCreateCard = false,
}: ProjectCardsProps) => {
  return (
    <div className="grid grid-cols-4 gap-5">
      {projects?.map((project) => (
        <Card
          key={project._id}
          className="overflow-hidden bg-sidebar border border-border! flex flex-col h-full rounded-lg shadow-sm p-0"
        >
          <div className="aspect-video w-full bg-muted relative border-b border-accent/10 overflow-hidden">
            {project.thumbnailUrl ? (
              <img
                src={project.thumbnailUrl}
                alt={project.projectName}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-accent/10">
                <LucideLayers3 className="h-10 w-10 text-muted-foreground/80" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <span
                className={cn(
                  "text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border flex items-center gap-1.5 backdrop-blur-md",
                  project.isPublic
                    ? "bg-emerald-500/10 text-neutral-200 border-emerald-500/20"
                    : "bg-amber-500/10 text-neutral-200 border-amber-500/20",
                )}
              >
                {project.isPublic ? (
                  <Globe className="size-3" />
                ) : (
                  <Lock className="size-3" />
                )}
                {project.isPublic ? "Public" : "Private"}
              </span>
            </div>
          </div>

          <div className="p-4 flex flex-col flex-1 -mt-2">
            <div className="flex items-start justify-between gap-3 decoration-0">
              <div className="min-w-0">
                <Link href={`/dashboard/my-projects/${project._id}`}>
                  <h3 className="text-sm font-bold text-primary truncate hover:text-primary/80 transition-colors">
                    {project.projectName}
                  </h3>
                </Link>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                  {project.repoName ? (
                    <>
                      <FolderGit2 className="size-3 text-blue-400" />
                      <span className="truncate">{project.repoName}</span>
                    </>
                  ) : (
                    <>
                      <FolderGit2 className="size-3" />
                      <span className="">No Repo connected</span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Side Avatar Stack */}
              {project.totalMembers > 0 ? (
                <div className="flex -space-x-1.5 ml-2 mt-0.5">
                  {project.members?.slice(0, 3).map((member, i) => (
                    <div
                      key={i}
                      className="size-5 rounded-full border border-card bg-accent overflow-hidden shadow-sm"
                    >
                      {member.userImage ? (
                        <img
                          src={member.userImage}
                          alt={member.userName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[7px] bg-primary/20 text-primary font-bold">
                          {member.userName.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                  {project.totalMembers > 3 && (
                    <div className="size-5 rounded-full border border-card bg-accent flex items-center justify-center text-[7px] text-muted-foreground font-bold">
                      +{project.totalMembers - 3}
                    </div>
                  )}
                </div>
              ) : (
                <span className="ml-2 mt-0.5 text-[11px] text-muted-foreground">
                  0 members
                </span>
              )}
            </div>

            <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
              <Link
                href={`/dashboard/my-projects/${project.slug}`}
                className="w-full"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-[10px] gap-1.5 border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors"
                >
                  <Settings2 className="size-3" /> View
                </Button>
              </Link>
              <Link
                href={`/dashboard/my-projects/${project.slug}/workspace`}
                className="w-full"
              >
                <Button
                  size="sm"
                  className="w-full h-7 text-[10px] gap-1.5 transition-colors"
                >
                  <ExternalLink className="size-3" /> Workspace
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}

      {/* Dashed Create Card */}
      {!hideCreateCard && (
        <CreateProjectDialog
          trigger={
            <div className="flex flex-col border-2 border-dashed border-accent transition-all rounded-xl cursor-pointer items-center justify-center p-8 gap-3 min-h-[200px] bg-accent/5 hover:bg-accent/30 group">
              <div className="h-10 w-10 rounded-full border border-accent flex items-center justify-center group-hover:bg-primary group-hover:text-accent transition-all">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-primary">
                  Create Project
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Start a new venture
                </p>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
};
