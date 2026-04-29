"use client";

import { useParams } from "next/navigation";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Home,
  CalendarIcon,
  Activity,
  AudioLines,
  ExternalLink,
  Clock3,
  FlagTriangleRight,
  ClockFading,
  Users,
  Timer,
  CheckCircle2,
  XCircle,
  History,
  CalendarRange,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { ActivityOverviewCard } from "./modules/components/ActivityOverviewCard";
import { SchedulerCard } from "./modules/components/SchedulerCard";
import { TaskStatusCard } from "./modules/components/TaskStatusCard";
import { Skeleton } from "@/components/ui/skeleton";
import { UserWorkTable } from "./modules/components/UserWork/UserWorkTable";

const ProjectWorkspace = () => {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectId = project?._id;

  const user = useQuery(api.user.getCurrentUser);

  const projectDetails = useQuery(
    api.projectDetails.getProjectDetails,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const updateDeadline = useMutation(api.projectDetails.updateTargetDate);

  const tasks = useQuery(
    api.workspace.getTimelineTasks,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const issues = useQuery(
    api.issue.getFilteredIssues,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const members = useQuery(
    api.project.getProjectMembers,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const events = useQuery(
    api.calendar.getEvents,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const scheduler = useQuery(
    api.workspace.getProjectScheduler,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const sprints = useQuery(
    api.sprint.getSprintsByProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const createdAt = project?._creationTime;
  const deadline = projectDetails?.targetDate;

  const calculateProgress = () => {
    if (!createdAt || !deadline) return 0;
    const total = deadline - createdAt;
    const elapsed = Date.now() - createdAt;
    const percentage = (elapsed / total) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  const daysRemaining = deadline
    ? Math.max(0, Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (project === undefined || user === undefined) {
    return (
      <div className="p-6 space-y-10">
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </header>

        <section className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 h-[220px]">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="pt-4 space-y-2">
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </Card>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="flex items-start justify-between flex-none">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2"></div>
          <h1 className="text-3xl font-bold font-inter tracking-wide capitalize">
            Welcome {user?.name}
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Monitor project insights, track progress and your tasks all in one
            Space.
          </p>
        </div>
        <div className="flex items-center gap-4">
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

          <Button
            className="text-xs cursor-pointer font-sans font-medium!"
            variant="default"
            size="sm"
          >
            Add Widgets
            <PlusCircle className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </header>

      {/* TOP STATS CARDS */}
      <section className="grid grid-cols-3 gap-6 mt-10">
        {/* Project Deadline Card */}
        <Card className="p-3! overflow-hidden shadow-sm bg-linear-to-br from-card to-muted/70">
          <CardHeader className="px-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AudioLines className="w-5 h-5!" /> Track Your Project
            </CardTitle>

            <Button
              size="sm"
              variant="outline"
              className=" cursor-pointer shadow-sm text-[10px]"
            >
              TimeLogs <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end my-3">
              <p className="text-[10px] tracking-wide text-muted-foreground ">
                Days Remaining
              </p>
              <p className="text-base font-inter tracking-tight">
                {daysRemaining} Days
              </p>
            </div>
            <Progress
              value={calculateProgress()}
              className="h-4.5! bg-blue-100/50 dark:bg-accent [&>div]:bg-blue-500 transition-all duration-500"
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
            <div className="flex flex-col items-start gap-3 text-xs text-muted-foreground w-full">
              <div className="flex items-center gap-1.5">
                <Clock3 className="w-3 h-3! " /> Created :
                <span className="font-semibold ">
                  {createdAt ? format(createdAt, "PPP") : "---"}
                </span>
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <FlagTriangleRight className="w-3 h-3! -ml-1" /> Deadline :
                  <span className="font-semibold ">
                    {deadline ? format(deadline, "PPP") : "Not Set"}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant={"outline"}
                  className="cursor-pointer text-[10px] bg-card!"
                >
                  Change <ClockFading className="w-3 h-3!" />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
        {/* Activity Overview Card */}
        <ActivityOverviewCard
          slug={slug}
          tasksCount={tasks?.length || 0}
          issuesCount={issues?.length || 0}
          sprintsCount={sprints?.length || 0}
          eventsCount={events?.length || 0}
        />

        {/* Scheduler Card */}
        {/* <SchedulerCard scheduler={scheduler} /> */}
        {/* Task Status Pie Chart Card */}
        <TaskStatusCard tasks={tasks || []} />
      </section>

      {/* WORK & OTHER CARDS */}
      <section className="grid grid-cols-3 gap-6 mt-14">
        <div className="flex flex-col space-y-3">
          {/* Sceduler card */}

          {/* Sprint bar graph */}
        </div>

        {/* My all work Table */}
        <div className="col-span-2">
          <UserWorkTable userName={user?.name} />
        </div>
      </section>
    </div>
  );
};

export default ProjectWorkspace;
