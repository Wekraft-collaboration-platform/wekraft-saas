"use client";
import {
  ChartNoAxesGantt,
  Loader2,
  CalendarPlus,
  Target,
  ArrowRight,
  ClipboardClock,
  Frown,
} from "lucide-react";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { PageTransition } from "@/components/PageTransition";
import { SetTargetDateDialog } from "@/modules/workspace/SetTargetDateDialog";
import { Button } from "@/components/ui/button";
import { ProjectTimeline } from "@/modules/workspace/timeLogs/ProjectTimeline";

const TimeLogsPage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const tasks = useQuery(api.workspace.getTimelineTasks, {
    projectId: project?._id as any,
  });
  const projectId = project?._id;

  const projectDetails = useQuery(api.projectDetails.getProjectDetails, {
    projectId: projectId as Id<"projects">,
  });

  if (project === undefined || projectDetails === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }
  if (project === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return (
    <PageTransition className="w-full h-full p-6 2xl:p-8">
      <header>
        <h1 className="text-2xl font-semibold">
          <ChartNoAxesGantt className="w-6 h-6 ml-1 text-primary inline" /> Time
          Logs
        </h1>
      </header>
      <div className="my-6">
        {projectDetails?.targetDate ? (
          <div className="h-full">
            <div className="h-[180px] ">
              <p>saved to displaydeadline charts later...</p>
              <p>
                Timelogs tracker below will only diaplay tasks that are going to
                hit deadline or already late.
              </p>
            </div>

            <ProjectTimeline
              tasks={tasks as any}
              projectCreatedAt={project.createdAt}
              projectDeadline={projectDetails.targetDate}
            />
          </div>
        ) : (
          <div className="h-[300px] max-w-5xl mx-auto border border-dashed border-accent bg-accent/30 rounded-md flex flex-col space-y-2 items-center justify-center">
            <ClipboardClock
              size={60}
              className="text-muted-foreground opacity-30"
            />
            <h1 className="text-lg font-medium tracking-tight text-primary/70">
              Project Deliver Date not set{" "}
            </h1>
            <p className="text-sm text-primary/70 max-w-[440px] tracking-tight text-center text-pretty">
              Setting up Delivery date for the project {project?.projectName},
              will enable deadline tracking and more insights for the project.
            </p>
            <Button
              size={"sm"}
              className="text-xs cursor-pointer mt-5"
              onClick={() => setIsDialogOpen(true)}
            >
              Set up Now <ClipboardClock />
            </Button>
          </div>
        )}
      </div>

      <SetTargetDateDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={project._id}
        projectName={project.projectName}
      />
    </PageTransition>
  );
};

export default TimeLogsPage;
