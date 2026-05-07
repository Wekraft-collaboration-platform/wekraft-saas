"use client";
import {
  ChartNoAxesGantt,
  Loader2,
  CalendarPlus,
  Target,
  ArrowRight,
  ClipboardClock,
  Frown,
  Calendar,
  FileCodeCorner,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../convex/_generated/dataModel";

import { SetTargetDateDialog } from "@/modules/workspace/SetTargetDateDialog";
import { Button } from "@/components/ui/button";
import { ProjectTimeline } from "@/modules/workspace/timeLogs/ProjectTimeline";
import { PaceTracker } from "@/modules/workspace/timeLogs/PaceTracker";
import { DelayDebt } from "@/modules/workspace/timeLogs/DelayDebt";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

const TimeLogsSkeleton = () => {
  return (
    <div className="w-full h-full p-6 2xl:p-8 ">
      <header className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-8 w-48" />
      </header>
      <div className="my-6 space-y-8">
        <div className="h-[200px] grid grid-cols-3 gap-6">
          <Skeleton className="rounded-xl border border-border/50" />
          <Skeleton className="rounded-xl border border-border/50" />
          <Skeleton className="rounded-xl border border-border/50" />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-32 rounded-full" />
              <Skeleton className="h-9 w-32 rounded-full" />
            </div>
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>

          <div className="relative border border-border/40 rounded-2xl overflow-hidden bg-muted/5">
            <div className="h-[400px] w-full p-4 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeLogsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const tasks = useQuery(
    api.workspace.getTimelineTasks,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );
  const projectId = project?._id;

  const projectDetails = useQuery(
    api.projectDetails.getProjectDetails,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  if (project === undefined || projectDetails === undefined) {
    return <TimeLogsSkeleton />;
  }
  if (project === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6">
      <header>
        <h1 className="text-2xl font-semibold">
          <ChartNoAxesGantt className="w-6 h-6 ml-1 text-primary inline" /> Time
          Logs
        </h1>
      </header>
      <div className="my-6">
        {projectDetails?.targetDate ? (
          <div className="h-full">
            <div className="h-[240px] grid grid-cols-3 mb-14 gap-8">
              <div className="border rounded-xl bg-accent/20 p-4 flex flex-col justify-between relative overflow-hidden group border-primary/10">
                <div className="space-y-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                    </div>
                    <h3 className="font-semibold text-[11px] tracking-wider text-primary/90 uppercase">
                      AI Prediction
                    </h3>
                  </div>

                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                      Estimated Completion
                    </p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      {new Date(
                        projectDetails.targetDate + 5 * 24 * 60 * 60 * 1000,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Deadline
                      </p>
                      <p className="text-xs font-medium flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        {new Date(projectDetails.targetDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Status
                      </p>
                      <p className="text-xs font-medium text-red-400 flex items-center gap-1.5">
                        <TrendingDown className="w-3 h-3" />
                        +5d Delay
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto p-2 rounded-lg bg-primary/5 border border-primary/5 relative z-10">
                  <p className="text-[10px] text-muted-foreground/80 leading-snug italic">
                    "Velocity analysis: Tasks lagging. Timeline shifted +5d."
                  </p>
                </div>
              </div>
              <DelayDebt tasks={tasks as any} projectId={project._id} />
              <PaceTracker
                tasks={tasks as any}
                createdAt={project.createdAt}
                deadline={projectDetails.targetDate}
              />
            </div>

            <ProjectTimeline
              tasks={tasks as any}
              projectCreatedAt={project.createdAt}
              projectDeadline={projectDetails.targetDate}
            />
          </div>
        ) : (
          <div className="flex flex-col mt-20 items-start justify-center space-y-1.5 p-4 w-[380px] mx-auto">
            <Image
              src="/pat103.svg"
              alt="Empty Workspace"
              width={100}
              height={100}
              className="opacity-90"
            />
            <p className="text-base font-medium  text-primary">
              Deadline not set
            </p>
            <p className="text-muted-foreground text-wrap text-left">
              Setting up Delivery date for the project {project?.projectName},
              will enable deadline tracking and more insights for the project.
            </p>

            <div className="flex items-center gap-4 mt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                className="rounded-full text-[11px]"
              >
                <Calendar className="w-4 h-4" />
                set Deadline
              </Button>
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
        )}
      </div>

      <SetTargetDateDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={project._id}
        projectName={project.projectName}
      />
    </div>
  );
};

export default TimeLogsPage;
