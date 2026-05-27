"use client";

import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import {
  AlertCircle,
  ArrowLeft,
  Bug,
  BugIcon,
  Calendar,
  Check,
  CheckCircle2,
  Circle,
  Clipboard,
  ClipboardList,
  Clock,
  ExternalLink,
  FastForward,
  Flag,
  Lock,
  Play,
  Plus,
  Target,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { priorityIcons2, statusColors, statusIcons } from "@/lib/static-store";
import { cn } from "@/lib/utils";
import { api } from "../../../../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../../../../convex/_generated/dataModel";

const SprintDetailPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const sprintNameParam = decodeURIComponent(params.sprintName as string);

  const [activeTab, setActiveTab] = useState<"tasks" | "issues">("tasks");

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const { isOwner } = useProjectPermissions(project?._id as Id<"projects">);

  const sprint = useQuery(
    api.sprint.getSprintByName,
    project?._id
      ? {
          projectId: project._id as Id<"projects">,
          sprintName: sprintNameParam,
        }
      : "skip",
  );

  const sprintId = sprint?._id as Id<"sprints"> | undefined;

  const tasks = useQuery(
    api.sprint.getSprintTasks,
    sprintId ? { sprintId } : "skip",
  );
  const issues = useQuery(
    api.sprint.getSprintIssues,
    sprintId ? { sprintId } : "skip",
  );
  const stats = useQuery(
    api.sprint.getSprintStats,
    sprintId ? { sprintId } : "skip",
  );
  const backlogTasks = useQuery(
    api.sprint.getBacklogTasks,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );
  const backlogIssues = useQuery(
    api.sprint.getBacklogIssues,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );

  const startSprint = useMutation(api.sprint.startSprint);
  const completeSprint = useMutation(api.sprint.completeSprint);
  const assignTask = useMutation(api.sprint.assignTaskToSprint);
  const assignIssue = useMutation(api.sprint.assignIssueToSprint);
  const removeTask = useMutation(api.sprint.assignTaskToSprint);
  const removeIssue = useMutation(api.sprint.assignIssueToSprint);

  const [showBacklog, setShowBacklog] = useState(false);

  if (!sprint || !project) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const daysRemaining = Math.max(
    0,
    Math.ceil((sprint.duration.endDate - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  const handleStartSprint = async () => {
    if (!sprintId) return;
    try {
      await startSprint({ sprintId });
      toast.success("Sprint started!");
    } catch (e: any) {
      toast.error("Failed to start sprint");
    }
  };

  const handleCompleteSprint = async () => {
    if (!sprintId) return;
    try {
      await completeSprint({ sprintId });
      toast.success("Sprint completed! Incomplete items moved to backlog.");
    } catch (e: any) {
      toast.error("Failed to complete sprint");
    }
  };

  const handleAddTask = async (taskId: Id<"tasks">) => {
    if (!sprintId) return;
    try {
      await assignTask({ taskId, sprintId });
      toast.success("Task added to sprint");
    } catch (e: any) {
      toast.error("Failed to add task to sprint");
    }
  };

  const handleRemoveTask = async (taskId: Id<"tasks">) => {
    try {
      await removeTask({ taskId, sprintId: undefined });
      toast.success("Task removed from sprint");
    } catch (e: any) {
      toast.error("Failed to remove task from sprint");
    }
  };

  const handleAddIssue = async (issueId: Id<"issues">) => {
    if (!sprintId) return;
    try {
      await assignIssue({ issueId, sprintId });
      toast.success("Issue added to sprint");
    } catch (e: any) {
      toast.error("Failed to add issue to sprint");
    }
  };

  const handleRemoveIssue = async (issueId: Id<"issues">) => {
    try {
      await removeIssue({ issueId, sprintId: undefined });
      toast.success("Issue removed from sprint");
    } catch (e: any) {
      toast.error("Failed to remove issue from sprint");
    }
  };

  const statusColor = {
    planned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    active: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const openIssuesCount =
    issues?.filter((i) => i.status !== "closed").length || 0;

  return (
    <div className="w-full h-full p-6 mx-auto bg-background min-h-screen text-foreground">
      {/* Sprint Header */}
      <header className="flex flex-row md:items-start justify-between gap-6  mb-3">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              <FastForward className="w-6 h-6 inline mr-1" />{" "}
              {sprint.sprintName}
            </h1>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary border-transparent rounded-full px-2.5 py-0.5 text-xs capitalize"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-1.5" />
              {sprint.status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70" />
              <span>
                {format(sprint.duration.startDate, "MMM d")} →{" "}
                {format(sprint.duration.endDate, "MMM d")}
              </span>
            </div>

            {sprint.status === "active" && (
              <div className="flex items-center gap-2 text-primary bg-sidebar border border-primary/20 px-2 py-1 rounded-md text-xs">
                <Clock className="w-4 h-4" /> {daysRemaining} days remaining
              </div>
            )}
          </div>
        </div>

        {/* Sprint actions — Owner only */}
        <div className="flex items-center gap-5 shrink-0">
          <Link href={`/dashboard/my-projects/${slug}/workspace/sprint`}>
            <Button variant="outline" size="sm" className="text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sprints
            </Button>
          </Link>
          {!isOwner ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-[11px] font-medium text-muted-foreground uppercase tracking-wider border border-border/50">
              <Lock className="w-3 h-3" />
              Viewing as{" "}
              {!project
                ? "..."
                : project.ownerId === "skip"
                  ? "Viewer"
                  : "Member"}
            </div>
          ) : (
            <>
              {sprint.status === "planned" && (
                <Button
                  size="sm"
                  onClick={handleStartSprint}
                  className="font-medium px-4 shadow-sm text-xs"
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Start Sprint
                </Button>
              )}
              {sprint.status === "active" && (
                <Button
                  size="sm"
                  onClick={handleCompleteSprint}
                  className="bg-foreground text-background hover:bg-foreground/90 font-medium px-5 shadow-sm text-xs"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Complete
                </Button>
              )}
            </>
          )}
        </div>
      </header>

      <div className="flex items-center gap-2 mb-8">
        <Flag className="w-4 h-4 opacity-70" />
        <span className="text-sm font-medium text-foreground">
          {sprint.sprintGoal}
        </span>
      </div>

      {/* Top Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Progress Card */}
          <div className="bg-card dark:bg-accent/30 p-5 rounded-xl border border-accent min-h-[140px] flex flex-col justify-between shadow-sm dark:shadow-none">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Sprint Progress
                </p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  {stats.completedItems} of {stats.totalItems} items
                </p>
              </div>
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {stats.completionPercent}%
              </span>
            </div>
            <div className="w-full bg-muted/40 rounded-full h-6 overflow-hidden">
              <div
                className="bg-blue-600 rounded-full h-full transition-all duration-700 ease-out"
                style={{ width: `${stats.completionPercent}%` }}
              />
            </div>
          </div>

          {/* Burn Rate Card */}
          <div className="bg-card dark:bg-accent/30 p-5 rounded-xl border border-accent min-h-[140px] flex flex-col justify-between shadow-sm dark:shadow-none">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
              <Zap className="w-3.5 h-3.5" />
              <p className="text-xs font-medium">Burn Rate</p>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                {stats.burnRate}
              </span>
              <span className="text-[11px] text-muted-foreground mb-1 font-medium">
                items/day
              </span>
            </div>
          </div>

          {/* Assignees Card */}
          <div className="bg-card dark:bg-accent/30 p-5 rounded-xl border border-accent min-h-[140px] flex flex-col justify-between shadow-sm dark:shadow-none">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
              <Users className="w-3.5 h-3.5" />
              <p className="text-xs font-medium">Assignees</p>
            </div>
            {stats.teamMembers.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {stats.teamMembers.slice(0, 4).map((m) => (
                    <Avatar
                      key={m.userId}
                      className="w-7 h-7 border-2 border-background ring-1 ring-border/30"
                    >
                      <AvatarImage src={m.avatar} />
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-medium">
                        {m.name[0]}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {stats.teamMembers.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                      +{stats.teamMembers.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-muted-foreground font-medium ml-1">
                  {stats.teamMembers.length} member
                  {stats.teamMembers.length !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                No assignees yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main content: Tasks / Issues */}
      <div className="w-full">
        <div className="w-full">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-border pb-3 px-1">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab("tasks")}
                className={`pb-3 text-[15px] font-medium border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "tasks"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <ClipboardList className="w-4 h-4" /> Tasks
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "tasks" ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"}`}
                >
                  {tasks?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("issues")}
                className={`pb-3 text-[15px] font-medium border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "issues"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <BugIcon className="w-4 h-4" /> Issues
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "issues" ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"}`}
                >
                  {issues?.length || 0}
                </span>
              </button>
            </div>
            {sprint.status !== "completed" && isOwner && (
              <Button
                size="sm"
                variant="default"
                className="text-[10px] px-3 h-7 font-medium transition-all"
                onClick={() => setShowBacklog(true)}
              >
                Add {activeTab === "tasks" ? "Task" : "Issue"}{" "}
                <Plus className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>

          {/* Tasks list — table style */}
          {activeTab === "tasks" && (
            <div className="py-2 px-10">
              {tasks && tasks.length > 0 ? (
                <div className="border border-border/50 rounded-lg overflow-hidden bg-card shadow-sm dark:shadow-none">
                  <Table>
                    <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
                      <TableRow className="hover:bg-transparent border-b border-border">
                        <TableHead className="text-[12px] text-foreground/80 font-bold px-4 py-2.5 border-r border-border">
                          Task Name
                        </TableHead>
                        <TableHead className="text-[12px] text-foreground/80 font-bold px-4 py-2.5 border-r border-border text-center">
                          Tags
                        </TableHead>
                        <TableHead className="text-[12px] text-foreground/80 font-bold px-4 py-2.5 border-r border-border text-center">
                          Assigned
                        </TableHead>
                        <TableHead className="text-[12px] text-foreground/80 font-bold px-4 py-2.5 border-r border-border text-center">
                          Status
                        </TableHead>
                        <TableHead className="text-[12px] text-foreground/80 font-bold px-4 py-2.5 border-r border-border text-center">
                          Priority
                        </TableHead>
                        <TableHead className="w-[40px] px-4 py-2.5"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task) => (
                        <TableRow
                          key={task._id}
                          className={cn(
                            "group border-b border-border/40 hover:bg-muted/10 transition-all cursor-pointer",
                            sprint.status === "completed" && "opacity-80",
                          )}
                        >
                          <TableCell className="px-4 py-2 font-medium border-r border-border text-[13px] text-foreground/70 group-hover:text-foreground transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <span className="truncate">{task.title}</span>
                              {task.isBlocked && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] bg-red-500/10 text-red-500 border-red-500/20 px-1.5 py-0 shrink-0"
                                >
                                  Blocked
                                </Badge>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-2 border-r border-border">
                            <div className="flex items-center justify-center gap-1.5">
                              {task.type ? (
                                <div
                                  className={cn(
                                    "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] tracking-wide capitalize border",
                                    task.type.color === "green" &&
                                      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-400/20",
                                    task.type.color === "yellow" &&
                                      "bg-amber-50 dark:bg-yellow-500/10 text-amber-600 dark:text-primary border-amber-200 dark:border-yellow-400/20",
                                    task.type.color === "purple" &&
                                      "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-400/20",
                                    task.type.color === "blue" &&
                                      "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-400/20",
                                    task.type.color === "grey" &&
                                      "bg-neutral-50 dark:bg-muted/20 text-neutral-600 dark:text-muted-foreground border-neutral-200 dark:border-muted/30",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "w-1 h-1 rounded-full",
                                      task.type.color === "green" &&
                                        "bg-emerald-500 dark:bg-emerald-400",
                                      task.type.color === "yellow" &&
                                        "bg-amber-500 dark:bg-yellow-400",
                                      task.type.color === "purple" &&
                                        "bg-purple-500 dark:bg-purple-400",
                                      task.type.color === "blue" &&
                                        "bg-blue-500 dark:bg-blue-400",
                                      task.type.color === "grey" &&
                                        "bg-neutral-500 dark:bg-muted-foreground",
                                    )}
                                  />
                                  {task.type.label}
                                </div>
                              ) : (
                                <span className="text-[11px] text-muted/30">
                                  —
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-2 border-r border-border">
                            <div className="flex items-center justify-center">
                              {task.assignees && task.assignees.length > 0 ? (
                                <div className="flex items-center -space-x-1.5">
                                  {task.assignees
                                    .slice(0, 3)
                                    .map((person: any, i: number) => (
                                      <Avatar
                                        key={i}
                                        className="w-6 h-6 border border-background shadow-sm"
                                      >
                                        <AvatarImage src={person.avatar} />
                                        <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-bold uppercase">
                                          {person.name[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  {task.assignees.length > 3 && (
                                    <div className="w-6 h-6 rounded-full bg-muted border border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                      +{task.assignees.length - 3}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-muted-foreground">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-2 border-r border-border">
                            <div className="flex items-center justify-center">
                              <Badge
                                className={cn(
                                  "px-2 py-0.5 rounded-full text-[10px] flex items-center gap-1.5 border font-semibold capitalize",
                                  statusColors[task.status] ||
                                    "bg-primary/10 text-primary border-primary/20",
                                )}
                              >
                                {statusIcons[task.status]}
                                {task.status}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-2 border-r border-border/40">
                            <div className="flex items-center justify-center scale-90">
                              {priorityIcons2[task.priority || "none"]}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-2 text-right">
                            <Link
                              href={`/dashboard/my-projects/${slug}/workspace/tasks`}
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer ml-auto" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/20">
                  <ClipboardList className="w-8 h-8 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-primary/60">
                    No tasks in this sprint
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Add tasks from backlog to get started.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Issues list — table style */}
          {activeTab === "issues" && (
            <div className="py-2 px-10">
              {issues && issues.length > 0 ? (
                <div className="border border-border/50 rounded-lg overflow-hidden bg-card shadow-sm dark:shadow-none">
                  <Table>
                    <TableHeader className="bg-neutral-100 dark:bg-neutral-800">
                      <TableRow className="hover:bg-transparent border-b border-border/50">
                        <TableHead className="text-[12px] text-foreground/80 font-bold px-4 py-2.5 border-r border-border/50">
                          Issue Name
                        </TableHead>
                        <TableHead className="text-[12px] text-foreground/80 font-bold px-4 py-2.5 border-r border-border/50 text-center">
                          Type
                        </TableHead>
                        <TableHead className="text-[12px] text-foreground/80 font-bold px-4 py-2.5 border-r border-border/50 text-center">
                          Assigned
                        </TableHead>
                        <TableHead className="text-[12px] text-foreground/80 font-bold px-4 py-2.5 border-r border-border/50 text-center">
                          Status
                        </TableHead>
                        <TableHead className="text-[12px] text-foreground/80 font-bold px-4 py-2.5 border-r border-border/50 text-center">
                          Severity
                        </TableHead>
                        <TableHead className="w-[40px] px-4 py-2.5"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {issues.map((issue) => (
                        <TableRow
                          key={issue._id}
                          className={cn(
                            "group border-b border-border/40 hover:bg-muted/10 transition-all cursor-pointer",
                            sprint.status === "completed" && "opacity-80",
                          )}
                        >
                          <TableCell className="px-4 py-2 font-medium border-r border-border/40 text-[13px] text-foreground/70 group-hover:text-foreground transition-colors">
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <span className="truncate">{issue.title}</span>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-2 border-r border-border/40">
                            <div className="flex items-center justify-center">
                              <Badge
                                variant="outline"
                                className="text-[9px] font-bold uppercase tracking-widest bg-muted/20 text-foreground/80 border-border/40 px-2 py-0.5"
                              >
                                {issue.type || "bug"}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-2 border-r border-border/40">
                            <div className="flex items-center justify-center">
                              {issue.IssueAssignee &&
                              issue.IssueAssignee.length > 0 ? (
                                <div className="flex items-center -space-x-1.5">
                                  {issue.IssueAssignee.slice(0, 3).map(
                                    (person: any, i: number) => (
                                      <Avatar
                                        key={i}
                                        className="w-6 h-6 border border-background shadow-sm"
                                      >
                                        <AvatarImage src={person.avatar} />
                                        <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-bold uppercase">
                                          {person.name[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    ),
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-muted/30">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-2 border-r border-border/40">
                            <div className="flex items-center justify-center">
                              <Badge
                                className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[10px] flex items-center gap-1.5 border font-semibold capitalize",
                                  issue.status === "closed"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-400/20"
                                    : "bg-red-500/10 text-red-500 border-red-500/20",
                                )}
                              >
                                {issue.status === "closed" ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <AlertCircle className="w-3.5 h-3.5" />
                                )}
                                {issue.status}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-2 border-r border-border/40">
                            <div className="flex items-center justify-center scale-90">
                              {priorityIcons2[issue.severity || "none"]}
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-2 text-right">
                            <Link
                              href={`/dashboard/my-projects/${slug}/workspace/issues`}
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-primary transition-colors cursor-pointer ml-auto" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/20">
                  <BugIcon className="w-8 h-8 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-primary/60">
                    No issues in this sprint
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Clean slate! No bugs reported here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Backlog Dialog */}
          <Dialog open={showBacklog} onOpenChange={setShowBacklog}>
            <DialogContent className="max-w-2xl bg-card border-border/60 shadow-2xl p-0 overflow-hidden rounded-xl">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  {activeTab === "tasks" ? (
                    <ClipboardList className="w-5 h-5 text-primary" />
                  ) : (
                    <BugIcon className="w-5 h-5 text-red-500" />
                  )}
                  Add from Backlog
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Select {activeTab} from the backlog to include in this sprint.
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 pb-6">
                <div className="mt-4 border border-border/40 rounded-xl overflow-hidden bg-muted/5">
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {activeTab === "tasks" ? (
                      <div className="divide-y divide-border/30">
                        {backlogTasks && backlogTasks.length > 0 ? (
                          backlogTasks.map((task) => (
                            <div
                              key={task._id}
                              className="group flex items-center justify-between p-3 hover:bg-muted/30 transition-all gap-4 cursor-pointer"
                              onClick={() => {
                                handleAddTask(task._id);
                              }}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Circle className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                                <div className="min-w-0 flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-semibold text-foreground truncate">
                                      {task.title}
                                    </span>
                                    {task.type && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                                        {task.type.label}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                    <span className="capitalize">{task.status}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        {format(task.estimation.startDate, "MMM d")} → {format(task.estimation.endDate, "MMM d")}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-1" title={`Priority: ${task.priority || "none"}`}>
                                  {priorityIcons2[task.priority || "none"]}
                                </div>
                                {task.assignees && task.assignees.length > 0 ? (
                                  <div className="flex items-center -space-x-1.5">
                                    {task.assignees.slice(0, 3).map((person: any, i: number) => (
                                      <Avatar key={i} className="w-5.5 h-5.5 border border-background shadow-xs">
                                        <AvatarImage src={person.avatar} />
                                        <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-bold uppercase">
                                          {person.name[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {task.assignees.length > 3 && (
                                      <div className="w-5.5 h-5.5 rounded-full bg-muted border border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                        +{task.assignees.length - 3}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground/60">Unassigned</span>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center">
                            <p className="text-sm text-muted-foreground italic">
                              No tasks in backlog
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-border/30">
                        {backlogIssues && backlogIssues.length > 0 ? (
                          backlogIssues.map((issue) => (
                            <div
                              key={issue._id}
                              className="group flex items-center justify-between p-3 hover:bg-muted/30 transition-all gap-4 cursor-pointer"
                              onClick={() => handleAddIssue(issue._id)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <AlertCircle className="w-3.5 h-3.5 text-red-500/40 shrink-0" />
                                <div className="min-w-0 flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-semibold text-foreground truncate">
                                      {issue.title}
                                    </span>
                                    {issue.type && (
                                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 uppercase tracking-wide">
                                        {issue.type}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                                    <span className="capitalize">{issue.status}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        {issue.due_date ? `Due: ${format(issue.due_date, "MMM d")}` : "No due date"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-1" title={`Severity: ${issue.severity || "none"}`}>
                                  {priorityIcons2[issue.severity || "none"]}
                                </div>
                                {issue.IssueAssignee && issue.IssueAssignee.length > 0 ? (
                                  <div className="flex items-center -space-x-1.5">
                                    {issue.IssueAssignee.slice(0, 3).map((person: any, i: number) => (
                                      <Avatar key={i} className="w-5.5 h-5.5 border border-background shadow-xs">
                                        <AvatarImage src={person.avatar} />
                                        <AvatarFallback className="text-[8px] bg-muted text-muted-foreground font-bold uppercase">
                                          {person.name[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {issue.IssueAssignee.length > 3 && (
                                      <div className="w-5.5 h-5.5 rounded-full bg-muted border border-background flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                        +{issue.IssueAssignee.length - 3}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground/60">Unassigned</span>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 text-red-500 shrink-0"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center">
                            <p className="text-sm text-muted-foreground italic">
                              No issues in backlog
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs font-medium text-muted-foreground"
                    onClick={() => setShowBacklog(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

      </div>
    </div>
  );
};

export default SprintDetailPage;
