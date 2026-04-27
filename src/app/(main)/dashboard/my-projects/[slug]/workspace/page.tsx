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
  AudioLines,
  ExternalLink,
  Clock3,
  FlagTriangleRight,
  ClockFading,
  ChevronRight,
  Bug,
  Users,
  Timer,
  CheckCircle2,
  XCircle,
  History,
  CalendarRange,
  CalendarSync,
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

const ProjectWorkspace = () => {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const projectId = project?._id;

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

      {/* TOP STATS CARDS */}
      <section className="grid grid-cols-3 gap-6 mt-10">
        {/* Project Deadline Card */}
        <Card className="p-3! overflow-hidden shadow-sm bg-linear-to-br from-card to-muted/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <AudioLines /> Track Your Project
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
            <div className="flex justify-between items-end mb-2">
              <p className="text-[10px] tracking-wide text-muted-foreground ">
                Days Remaining
              </p>
              <p className="text-base font-inter tracking-tight">
                {daysRemaining} Days
              </p>
            </div>
            <Progress
              value={calculateProgress()}
              className="h-5 bg-blue-100/50 dark:bg-accent [&>div]:bg-blue-500 transition-all duration-500"
            />
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2 border-t pt-4 ">
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
        <Card className="p-3! overflow-hidden shadow-sm bg-linear-to-br from-card to-muted/70">
          <CardHeader className=" pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 font-bold tracking-tight">
              <Layers3 className="w-4 h-4" /> Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 grid grid-cols-2 gap-3 -mt-5">
            {[
              {
                label: "Tasks",
                count: tasks?.length || 0,
                href: `/dashboard/my-projects/${slug}/workspace/tasks`,
                action: "View",
              },
              {
                label: "Issues",
                count: issues?.length || 0,
                href: `/dashboard/my-projects/${slug}/workspace/issues`,
                action: "Track",
              },
              {
                label: "Team",
                count: members?.length || 0,
                href: "#",
                action: "Manage",
              },
              {
                label: "Events",
                count: events?.length || 0,
                href: `/dashboard/my-projects/${slug}/workspace/calendar`,
                action: "Calendar",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-card/40 border border-border/50 flex flex-col justify-between h-24"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                    {stat.label}
                  </span>
                  <span className="text-xl font-black tracking-tighter leading-none">
                    {stat.count}
                  </span>
                </div>
                <Link href={stat.href}>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-[10px] font-bold uppercase text-foreground hover:translate-x-0.5 transition-transform"
                  >
                    {stat.action} <ChevronRight className="w-3 h-3 ml-0.5" />
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Scheduler  Card */}
        <Card className="p-3! overflow-hidden shadow-sm bg-linear-to-br from-card to-muted/70 flex flex-col justify-between">
          <div>
            <CardHeader className=" pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 font-bold tracking-tight">
                <CalendarSync className="w-4 h-4" /> Project Scheduler
              </CardTitle>
              {scheduler && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground opacity-60">
                  {scheduler.isActive ? "Active" : "Inactive"}
                </span>
              )}
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {!scheduler ? (
                <div className="py-8 text-center flex flex-col items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[9px] font-bold uppercase"
                  >
                    Setup
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                        Name
                      </p>
                      <p className="text-base font-black tracking-tighter">
                        {scheduler.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
                        Frequency
                      </p>
                      <p className="text-xs font-bold">
                        {scheduler.frequencyDays} Days
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        Last Run
                      </span>
                      <span className="text-[11px] font-semibold">
                        {scheduler.lastRunAt
                          ? format(scheduler.lastRunAt, "MMM d, HH:mm")
                          : "---"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        Next Run
                      </span>
                      <span className="text-[11px] font-bold">
                        {format(scheduler.nextRunAt, "MMM d, HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </div>
          {scheduler && (
            <CardFooter className="p-0 pt-4 border-t flex justify-between items-center">
              <span className="text-[9px] text-muted-foreground truncate max-w-[100px]">
                {scheduler.recipientEmail}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[9px] font-bold uppercase"
              >
                Settings
              </Button>
            </CardFooter>
          )}
        </Card>
      </section>
    </div>
  );
};

export default ProjectWorkspace;
