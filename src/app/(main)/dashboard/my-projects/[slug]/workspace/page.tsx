"use client";

import { useParams } from "next/navigation";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Home,
  CalendarIcon,
  Layers3,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";

const ProjectWorkspace = () => {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectName = project?.projectName;
  const repoId = project?.repositoryId;
  const projectId = project?._id;

  const projectDetails = useQuery(
    api.projectDetails.getProjectDetails,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const updateDeadline = useMutation(api.projectDetails.updateTargetDate);

  const handleDateSelect = async (date: Date | undefined) => {
    if (!date || !projectId) return;
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();
    try {
      await updateDeadline({
        projectId: projectId as Id<"projects">,
        targetDate: normalizedDate,
      });
      toast.success("Deadline updated");
    } catch (error) {
      toast.error("Error updating deadline");
    }
  };

  return (
    <div className="p-6">
      <header className="flex items-start justify-between flex-none">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
              {" "}
              Workspace
            </p>
          </div>
          <h1 className="text-2xl font-semibold tracking-tighter">
            <Activity className="w-6 h-6 mr-2 inline" /> Activity Workspace
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Monitor project insights, track progress and team performance all in
            one Space.
          </p>
        </div>
        <Link href={`/dashboard/my-projects/${slug}`}>
          <Button
            className="text-xs cursor-pointer"
            variant="outline"
            size="sm"
          >
            <ChevronLeft />
            Back to Home
            <Home className="w-3 h-3" />
          </Button>
        </Link>
      </header>
    </div>
  );
};

export default ProjectWorkspace;
