"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Zap,
  Clock,
  CheckCircle2,
  Target,
  FastForward,
  FileCodeCorner,
  FastForwardIcon,
} from "lucide-react";
import { CreateSprintDialog } from "@/modules/workspace/CreateSprintDialog";
import Image from "next/image";

const SprintPage = () => {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const sprints = useQuery(
    api.sprint.getSprintsByProject,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );

  if (!project || sprints === undefined || sprints === undefined) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const activeSprints = sprints?.filter((s) => s.status === "active") || [];
  const plannedSprints = sprints?.filter((s) => s.status === "planned") || [];
  const completedSprints =
    sprints?.filter((s) => s.status === "completed") || [];

  return (
    <div className="w-full h-full p-6 2xl:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">
            <FastForward className="w-6 h-6 ml-1 -mt-0.5 text-primary inline" />{" "}
            Sprints
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your project sprints and track progress
          </p>
        </div>
        <CreateSprintDialog
          projectId={project._id as Id<"projects">}
          projectName={project.projectName || "Project"}
          trigger={
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Sprint
            </Button>
          }
        />
      </header>

      {sprints?.length === 0 && (
        <div className="mt-20">
          {/* Empty State */}
          <div className="flex flex-col items-start justify-center space-y-1.5 p-4 w-[360px] mx-auto">
            <Image
              src="/pat103.svg"
              alt="Empty Workspace"
              width={100}
              height={100}
              className=""
            />
            <p className="text-base font-medium  text-primary">
              No Sprint Created
            </p>
            <p className="text-muted-foreground text-wrap text-left">
              Create Sprints to organize your work into manageable timeframes and track progress effectively.
            </p>

            <div className="flex items-center gap-4 mt-2">
              <CreateSprintDialog
                projectId={project._id as Id<"projects">}
                projectName={project.projectName || "Project"}
                trigger={
                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-full text-[11px]"
                  >
                    <FastForwardIcon className="w-4 h-4" />
                    Create Sprint
                  </Button>
                }
              />
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
    </div>
  );
};

export default SprintPage;
