"use client";

import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  Activity,
  AlertCircle,
  AudioLines,
  CalendarIcon,
  CalendarRange,
  ChartBar,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  ClockFading,
  ExternalLink,
  FlagTriangleRight,
  History,
  Home,
  Lock,
  Plus,
  PlusCircle,
  Settings2,
  Sparkles,
  Table,
  Timer,
  Users,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SetTargetDateDialog } from "@/modules/workspace/SetTargetDateDialog";
import { ActivityOverviewCard } from "@/modules/workspace/workspace-modules/ActivityOverviewCard";
import { EnvironmentalSeverityHeatmap } from "@/modules/workspace/workspace-modules/EnvironmentalSeverityHeatmap";
import { MemberWorkloadCard } from "@/modules/workspace/workspace-modules/MemberWorkloadCard";
import { ProjectConfigTab } from "@/modules/workspace/workspace-modules/ProjectConfigTab";
import { SchedulerCard } from "@/modules/workspace/workspace-modules/SchedulerCard";
import { SprintBarChart } from "@/modules/workspace/workspace-modules/SprintBarChart";
import { TaskStatusCard } from "@/modules/workspace/workspace-modules/TaskStatusCard";
import { TeamContributionRadarCard } from "@/modules/workspace/workspace-modules/TeamContributionRadarCard";
import { UserWorkTable } from "@/modules/workspace/workspace-modules/UserWorkTable";
import { WeeklyEngagementChartCard } from "@/modules/workspace/workspace-modules/WeeklyEngagementChartCard";
import { WeeklyVelocityChart } from "@/modules/workspace/workspace-modules/WeeklyVelocityChart";
import { api } from "../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../convex/_generated/dataModel";

const ProjectWorkspace = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [isDeadlineDialogOpen, setIsDeadlineDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"charts" | "work" | "config">(
    "charts",
  );
  const [cachedData, setCachedData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const user = useQuery(api.user.getCurrentUser);
  const isOwner = !!project && !!user && project.ownerId === user._id;

  const fetchAnalytics = async (projectId: string, forceRefresh = false) => {
    const params = new URLSearchParams({ projectId });
    if (forceRefresh) params.set("forceRefresh", "true");
    const res = await fetch(`/api/analytics/dashboard?${params}`);
    if (!res.ok) throw new Error("Failed to fetch analytics");
    return res.json();
  };

  const projectId = project?._id;

  const projectDetails = useQuery(
    api.projectDetails.getProjectDetails,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  // const updateDeadline = useMutation(api.projectDetails.updateTargetDate);
  const updateProjectAlerts = useMutation(api.projectDetails.updateProjectAlerts);

  const tasks = useQuery(
    api.workspace.getTimelineTasks,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );
  const issues = useQuery(
    api.issue.getFilteredIssues,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const scheduler = useQuery(
    api.scheduler.getScheduler,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const sprints = useQuery(
    api.sprint.getSprintsByProject,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  useEffect(() => {
    if (projectId && activeTab === "charts" && !cachedData) {
      fetchAnalytics(projectId).then(setCachedData).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, activeTab]);

  const handleToggleAlert = async (percent: number, checked: boolean) => {
    if (!projectId) return;

    const currentAlerts = projectDetails?.alerts || [];
    let newAlerts: number[];
    if (checked) {
      newAlerts = [...currentAlerts, percent].sort((a, b) => a - b);
    } else {
      newAlerts = currentAlerts.filter((a) => a !== percent);
    }

    try {
      await updateProjectAlerts({
        projectId: projectId as Id<"projects">,
        alerts: newAlerts,
      });
      toast.success(`Alert for ${percent}% duration updated!`);
    } catch (e) {
      toast.error("Failed to update project alerts");
    }
  };

  const handleRefresh = async () => {
    if (!projectId) return;
    setIsRefreshing(true);
    try {
      const data = await fetchAnalytics(projectId, true);
      setCachedData(data);
      toast.success("Analytics refreshed!");
    } catch {
      toast.error("Failed to refresh analytics");
    } finally {
      setIsRefreshing(false);
    }
  };

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
      {/* max-w-420 mx-auto */}
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
            className="text-xs cursor-pointer font-sans font-medium! text-primary bg-linear-to-br from-transparent to-indigo-500"
            variant="outline"
            size="sm"
          >
            <Image src="/kaya.svg" alt="kaya" width={20} height={20} />
            Today Insights
          </Button>
        </div>
      </header>

      {/* TOP STATS CARDS */}
      <section className="grid grid-cols-3 gap-6 mt-10">
        {/* Project Deadline Card */}
        <Card className="p-3! overflow-hidden shadow-md dark:shadow-sm dark:bg-sidebar bg-card dark:border-accent border-neutral-300">
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
            <div className="flex justify-between items-end my-2.5">
              <p className="text-sm tracking-wide text-muted-foreground ">
                Days Remaining
              </p>
              <p className="text-base font-inter tracking-tight">
                {daysRemaining} Days
              </p>
            </div>
            <div className="relative my-4">
              <Progress
                value={calculateProgress()}
                className="h-3 bg-blue-100/50 dark:bg-accent [&>div]:bg-blue-500 transition-all duration-500"
              />
              {/* Alert Markers */}
              {deadline && projectDetails?.alerts?.map((percent) => {
                const progress = calculateProgress();
                const isPassed = progress >= percent;
                return (
                  <div
                    key={percent}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                    style={{ left: `${percent}%` }}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-popover border border-border text-[9px] font-semibold text-popover-foreground px-1.5 py-0.5 rounded shadow-md whitespace-nowrap z-50">
                      Alert set at {percent}%
                    </div>
                    {/* Tiny circle indicator */}
                    <div
                      className={cn(
                        "w-2.5 h-2.5 rounded-full border-2 transition-all duration-300",
                        isPassed
                          ? "bg-blue-500 border-background dark:border-sidebar ring-1 ring-blue-500 scale-110"
                          : "bg-background dark:bg-sidebar border-muted-foreground/60 hover:border-blue-400"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3 border-t pt-5! px-2!">
            <div className="flex flex-col gap-4 w-full">
              {/* Duration Dates Flex Container */}
              <div className="flex items-center justify-around w-full gap-4 py-1 text-xs text-muted-foreground border bg-muted rounded-md p-2">
                {/* Created Date */}
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span className="flex items-center gap-1 text-xs  text-muted-foreground ">
                    <Clock3 className="w-3 h-3 text-muted-foreground" /> Created
                  </span>
                  <span className="font-medium text-foreground">
                    {createdAt ? format(createdAt, "PPP") : "---"}
                  </span>
                </div>

                {/* Vertical Divider */}
                <div className="h-6 w-px bg-accent" />

                {/* Deadline Date */}
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <span className="flex items-center gap-1 text-xs  font-medium text-muted-foreground ">
                    <FlagTriangleRight className="w-3 h-3 text-muted-foreground" />{" "}
                    Deadline
                  </span>
                  <span className="font-medium text-foreground">
                    {deadline ? format(deadline, "PPP") : "Not Set"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex w-full items-center justify-between px-2">
                {/* Deadline button */}
                <Button
                  id="create-deadline-btn"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDeadlineDialogOpen(true)}
                  disabled={!isOwner}
                  className={cn(
                    "text-[10px]",
                    isOwner
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50",
                  )}
                >
                  Set Deadline <ClockFading className="w-3 h-3!" />
                </Button>

                {/* Alerts Popover Button */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!isOwner}
                      className={cn(
                        "text-[10px]",
                        isOwner
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-50",
                      )}
                    >
                      Set Alerts <AlertCircle className="w-3 h-3!" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64 p-4 bg-card border border-accent rounded-xl shadow-xl dark:shadow-none">
                    <h3 className="text-sm font-semibold mb-2 text-center text-foreground flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-primary" /> Project Alerts
                    </h3>
                    <Separator className="my-2 bg-accent" />
                    {!deadline ? (
                      <div className="text-center py-4 space-y-2">
                        <AlertCircle className="w-7 h-7 text-amber-500/80 mx-auto" />
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          Please set a project deadline first to enable duration alerts.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 mt-2">
                        <p className="text-[11px] text-muted-foreground mb-3 leading-normal">
                          Notify project owner and admins when elapsed project duration passes:
                        </p>
                        <div className="space-y-2">
                          {[25, 50, 75, 90].map((percent) => {
                            const isChecked = projectDetails?.alerts?.includes(percent) ?? false;
                            return (
                              <div
                                key={percent}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Checkbox
                                    id={`alert-${percent}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      handleToggleAlert(percent, !!checked);
                                    }}
                                  />
                                  <label
                                    htmlFor={`alert-${percent}`}
                                    className="text-xs font-medium cursor-pointer select-none text-foreground/80 hover:text-foreground"
                                  >
                                    {percent}% passes
                                  </label>
                                </div>
                                <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md border border-primary/10">
                                  {percent}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {projectId && (
                <SetTargetDateDialog
                  isOpen={isDeadlineDialogOpen}
                  onOpenChange={setIsDeadlineDialogOpen}
                  projectId={projectId as Id<"projects">}
                  projectName={project?.projectName}
                  projectCreatedAt={project.createdAt}
                />
              )}
            </div>
          </CardFooter>
        </Card>
        {/* Activity Overview Card */}
        <ActivityOverviewCard slug={slug} tasks={tasks} issues={issues} />
        {/* Task Status Pie Chart Card */}
        <TaskStatusCard tasks={tasks || []} />
      </section>

      {/* TABS: advance charts (scheduler + advance charts) / My work table */}
      <div className="flex mt-8 mb-2 items-center justify-end px-10">
        <div className="flex items-center gap-4">
          <Button
            className="text-xs cursor-pointer"
            variant={activeTab === "charts" ? "default" : "outline"}
            size={"sm"}
            onClick={() => setActiveTab("charts")}
          >
            Advance Charts <ChartBar />
          </Button>

          <Button
            className="text-xs cursor-pointer"
            variant={activeTab === "work" ? "default" : "outline"}
            size={"sm"}
            onClick={() => setActiveTab("work")}
          >
            My Work <Table />
          </Button>

          <Button
            className="text-xs cursor-pointer"
            variant={activeTab === "config" ? "default" : "outline"}
            size={"sm"}
            onClick={() => setActiveTab("config")}
          >
            Config <Settings2 />
          </Button>
        </div>
      </div>

      <Separator className="bg-accent" />

      <section className="mt-4 w-full">
        {activeTab === "charts" &&
          (project as any)?.ownerAccountType !== "free" && (
            <Button
              className={cn(
                "text-[10px] h-7 px-2 flex justify-end ml-auto mb-5 cursor-pointer transition-all",
                isRefreshing && "animate-pulse opacity-50",
              )}
              variant="default"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <History
                className={cn("w-3 h-3 mr-1", isRefreshing && "animate-spin")}
              />
              {isRefreshing ? "Refreshing..." : "Refresh Analytics"}
            </Button>
          )}
        {/* Advace charts area */}
        {activeTab === "charts" && (
          <div className="mt-6">
            {(project as any)?.ownerAccountType === "free" ? (
              <div className="flex flex-col items-center justify-center py-16 ">
                <div className="flex flex-col items-start gap-1.5 max-w-sm text-sm">
                  <Image
                    src="/pat106.svg"
                    alt="locked features"
                    width={120}
                    height={120}
                  />
                  <h3 className="text-muted-foreground">
                    Project Owner must upgrade in order to unlock advanced
                    analytics / Team insights and much more.
                  </h3>
                  <div className="flex items-center gap-4 mt-3">
                    <Button
                      className="cursor-pointer"
                      variant="default"
                      size="sm"
                    >
                      Upgrade
                    </Button>
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      size="sm"
                    >
                      Learn More <Plus className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-10 gap-y-6 px-5">
                <TeamContributionRadarCard
                  projectId={projectId as Id<"projects">}
                  data={cachedData?.contributions}
                />
                <SprintBarChart
                  projectId={projectId as Id<"projects">}
                  data={cachedData?.sprints}
                />
                <EnvironmentalSeverityHeatmap
                  projectId={projectId as Id<"projects">}
                  data={cachedData?.heatmap}
                />

                <WeeklyVelocityChart
                  projectId={projectId as Id<"projects">}
                  data={cachedData?.velocity}
                />

                <MemberWorkloadCard
                  projectId={projectId as Id<"projects">}
                  data={cachedData?.workload}
                />

                <WeeklyEngagementChartCard
                  projectId={projectId as Id<"projects">}
                  data={cachedData?.weeklyEngagement}
                />
              </div>
            )}
          </div>
        )}

        {/* My Work Area */}
        {activeTab === "work" && (
          <div className="mt-6 px-8">
            <UserWorkTable
              userName={user?.name}
              projectId={projectId as Id<"projects">}
            />
          </div>
        )}

        {/* Config Area */}
        {activeTab === "config" && projectId && (
          <ProjectConfigTab
            projectId={projectId as Id<"projects">}
            projectDetails={projectDetails}
            scheduler={scheduler}
            isOwner={isOwner}
          />
        )}
      </section>
    </div>
  );
};

export default ProjectWorkspace;
