"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import {
  ArrowLeft,
  Target,
  Plus,
  CheckCircle2,
  AlertCircle,
  Zap,
  Play,
  Check,
  Lock,
  Calendar,
  Bug,
  Circle,
} from "lucide-react";

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
      {/* Back link */}
      <Link
        href={`/dashboard/my-projects/${slug}/workspace/sprint`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Sprints
      </Link>

      {/* Sprint Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-3xl font-semibold tracking-tight">
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

            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 opacity-70" />
              <span>{sprint.sprintGoal}</span>
            </div>

            {sprint.status === "active" && (
              <div className="flex items-center gap-2 text-amber-500/90 bg-amber-500/10 px-2 py-0.5 rounded-md text-xs">
                ⏳ {daysRemaining} days remaining
              </div>
            )}
          </div>
        </div>

        {/* Sprint actions — Owner only */}
        <div className="flex items-center gap-3 shrink-0">
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
                  className="font-medium px-4 shadow-sm"
                >
                  <Play className="w-4 h-4 mr-1.5" />
                  Start Sprint
                </Button>
              )}
              {sprint.status === "active" && (
                <Button
                  size="sm"
                  onClick={handleCompleteSprint}
                  className="bg-foreground text-background hover:bg-foreground/90 font-medium px-5 shadow-sm"
                >
                  <Check className="w-4 h-4 mr-1.5" />
                  Complete
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Top Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-10">
          <div className="lg:col-span-2 border border-border/40 bg-card/40 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Sprint Progress
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completedItems} of {stats.totalItems} items completed
                </p>
              </div>
              <span className="text-3xl font-semibold tracking-tight">
                {stats.completionPercent}%
              </span>
            </div>
            <div className="w-full bg-muted/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-foreground rounded-full h-full transition-all duration-500 ease-out"
                style={{ width: `${stats.completionPercent}%` }}
              />
            </div>
          </div>

          <div className="border border-border/40 bg-card/40 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Bug className="w-4 h-4" />
              <h3 className="text-sm font-medium">Open Bugs</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-semibold tracking-tight">
                {openIssuesCount}
              </span>
            </div>
          </div>

          <div className="border border-border/40 bg-card/40 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Zap className="w-4 h-4" />
              <h3 className="text-sm font-medium">Burn Rate</h3>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-3xl font-semibold tracking-tight">
                {stats.burnRate}
              </span>
              <span className="text-xs text-muted-foreground mb-1.5 font-medium">
                items/day
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main content: Left (tasks/issues) + Right (team + stats) */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* LEFT — Tasks / Issues */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-border/40 mb-2 px-1">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "tasks"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              All Tasks
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "tasks" ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"}`}
              >
                {tasks?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("issues")}
              className={`pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "issues"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              Issues
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "issues" ? "bg-muted text-foreground" : "bg-muted/50 text-muted-foreground"}`}
              >
                {issues?.length || 0}
              </span>
            </button>
          </div>

          {/* Tasks list */}
          {activeTab === "tasks" && (
            <div className="py-2">
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/30 hover:bg-muted/30 px-3 -mx-3 rounded-lg transition-colors gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 sm:mt-0 shrink-0 text-muted-foreground">
                        {task.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        ) : (
                          <Circle className="w-4 h-4 opacity-50" />
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
                        <Link
                          href={`/dashboard/my-projects/${slug}/workspace/tasks`}
                          className="text-[13px] font-medium text-foreground truncate block hover:underline hover:text-primary transition-colors"
                        >
                          {task.title}
                        </Link>
                        {task.isBlocked && (
                          <Badge
                            variant="outline"
                            className="text-[9px] bg-red-500/10 text-red-500 border-transparent px-1.5 py-0"
                          >
                            Blocked
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pl-7 sm:pl-0">
                      {/* Priority / Points */}
                      <div className="flex items-center gap-2 w-24 sm:w-auto">
                        {task.priority && (
                          <div className="w-5 h-5 rounded flex items-center justify-center bg-muted text-[10px] uppercase font-bold text-muted-foreground">
                            {task.priority[0]}
                          </div>
                        )}
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-muted/40 border-transparent text-muted-foreground font-medium capitalize h-5"
                        >
                          {task.status}
                        </Badge>
                      </div>

                      {/* Assignees */}
                      <div className="flex items-center w-[60px] justify-end">
                        <div className="flex -space-x-1.5">
                          {task.assignedTo?.map((person, i) => (
                            <Avatar
                              key={i}
                              className="w-6 h-6 border-2 border-background"
                            >
                              <AvatarImage src={person.avatar} />
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                {person.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="w-6 flex justify-end">
                        {isOwner && sprint.status !== "completed" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 focus:opacity-100"
                            onClick={() => handleRemoveTask(task._id)}
                          >
                            ×
                          </Button>
                        ) : (
                          <div className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-xl bg-muted/10 mt-4">
                  <p className="text-sm font-medium text-foreground mb-1">
                    No tasks in this sprint
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Switch to backlog to add tasks to the sprint.
                  </p>
                </div>
              )}

              {/* Add from backlog */}
              {sprint.status !== "completed" && isOwner && (
                <div className="mt-6 mb-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setShowBacklog(!showBacklog)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add tasks from backlog
                  </Button>

                  {showBacklog && activeTab === "tasks" && (
                    <div className="mt-4 border border-border/50 rounded-xl p-4 max-h-[350px] overflow-y-auto bg-card shadow-sm">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                        Backlog ({backlogTasks?.length || 0})
                      </p>
                      <div className="space-y-1">
                        {backlogTasks && backlogTasks.length > 0 ? (
                          backlogTasks.map((task) => (
                            <div
                              key={task._id}
                              className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors gap-3 border border-transparent hover:border-border/50 cursor-pointer"
                              onClick={() => handleAddTask(task._id)}
                            >
                              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                <Circle className="w-3.5 h-3.5 opacity-40 mt-0.5 sm:mt-0" />
                                <span className="text-[13px] truncate font-medium">
                                  {task.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 pl-6 sm:pl-0 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">
                                  {task.status}
                                </div>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-6 text-[10px] px-2.5"
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground py-4 text-center">
                            Empty backlog
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Issues list */}
          {activeTab === "issues" && (
            <div className="py-2">
              {issues && issues.length > 0 ? (
                issues.map((issue) => (
                  <div
                    key={issue._id}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/30 hover:bg-muted/30 px-3 -mx-3 rounded-lg transition-colors gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      <div className="mt-0.5 sm:mt-0 shrink-0 text-muted-foreground">
                        {issue.status === "closed" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 opacity-50" />
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1">
                        <Link
                          href={`/dashboard/my-projects/${slug}/workspace/issues`}
                          className="text-[13px] font-medium text-foreground truncate block hover:underline hover:text-primary transition-colors"
                        >
                          {issue.title}
                        </Link>
                        {issue.severity === "critical" && (
                          <Badge
                            variant="outline"
                            className="text-[9px] bg-red-500/10 text-red-500 border-transparent px-1.5 py-0"
                          >
                            Critical
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 pl-7 sm:pl-0">
                      {/* Priority / Points */}
                      <div className="flex items-center gap-2 w-24 sm:w-auto">
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-muted/40 border-transparent text-muted-foreground font-medium capitalize h-5"
                        >
                          {issue.status}
                        </Badge>
                      </div>

                      {/* Assignees */}
                      <div className="flex items-center w-[60px] justify-end">
                        <div className="flex -space-x-1.5">
                          {issue.IssueAssignee?.map((person, i) => (
                            <Avatar
                              key={i}
                              className="w-6 h-6 border-2 border-background"
                            >
                              <AvatarImage src={person.avatar} />
                              <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                {person.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="w-6 flex justify-end">
                        {isOwner && sprint.status !== "completed" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 focus:opacity-100"
                            onClick={() => handleRemoveIssue(issue._id)}
                          >
                            ×
                          </Button>
                        ) : (
                          <div className="w-6 h-6" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed rounded-xl bg-muted/10 mt-4">
                  <p className="text-sm font-medium text-foreground mb-1">
                    No issues in this sprint
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Enjoy the silence.
                  </p>
                </div>
              )}

              {/* Add from backlog */}
              {sprint.status !== "completed" && isOwner && (
                <div className="mt-6 mb-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setShowBacklog(!showBacklog)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add issues from backlog
                  </Button>

                  {showBacklog && activeTab === "issues" && (
                    <div className="mt-4 border border-border/50 rounded-xl p-4 max-h-[350px] overflow-y-auto bg-card shadow-sm">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                        Backlog ({backlogIssues?.length || 0})
                      </p>
                      <div className="space-y-1">
                        {backlogIssues && backlogIssues.length > 0 ? (
                          backlogIssues.map((issue) => (
                            <div
                              key={issue._id}
                              className="group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors gap-3 border border-transparent hover:border-border/50 cursor-pointer"
                              onClick={() => handleAddIssue(issue._id)}
                            >
                              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                <Circle className="w-3.5 h-3.5 opacity-40 mt-0.5 sm:mt-0" />
                                <span className="text-[13px] truncate font-medium">
                                  {issue.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 pl-6 sm:pl-0 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">
                                  {issue.status}
                                </div>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="h-6 text-[10px] px-2.5"
                                >
                                  Add
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground py-4 text-center">
                            Empty backlog
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Context / Sidebars */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-5">
          {/* Recent Activity / Burndown Placeholder (sleek dark aesthetic) */}
          <div className="border border-border/40 bg-card rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">
                Timeline
              </h3>
            </div>

            <div className="h-[120px] w-full flex items-end justify-between gap-1 pb-2 border-b border-border/40">
              {/* Fake burndown visual bars */}
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 flex-1 group"
                >
                  <div className="w-full relative h-[80px] bg-muted/20 rounded-t-sm">
                    <div
                      className={`absolute bottom-0 w-full rounded-t-sm transition-all duration-300 ${i === 3 ? "bg-primary" : "bg-muted/60 group-hover:bg-muted/80"}`}
                      style={{ height: `${Math.max(10, 80 - i * 12)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground mt-2 uppercase tracking-wide">
              <span>{format(sprint.duration.startDate, "MMM d")}</span>
              <span>Today</span>
              <span>{format(sprint.duration.endDate, "MMM d")}</span>
            </div>
          </div>

          {/* Quick Stats list styling */}
          {stats && (
            <div className="border border-border/40 bg-card rounded-xl p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Overview
              </h3>
              <div className="space-y-3.5 text-[13px]">
                <div className="flex justify-between items-center border-b border-border/30 pb-3">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-medium text-foreground">
                    {stats.totalItems}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-3">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium text-foreground">
                    {stats.completedItems}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-border/30 pb-3">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium text-foreground">
                    {stats.totalItems - stats.completedItems}
                  </span>
                </div>
                {stats.estimatedDaysToComplete !== null && (
                  <div className="flex justify-between items-center pb-1">
                    <span className="text-muted-foreground">
                      Est. Completion
                    </span>
                    <span className="font-medium text-foreground">
                      {stats.estimatedDaysToComplete}d
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Team Members */}
          <div className="border border-border/40 bg-card rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Assignees
            </h3>
            {stats && stats.teamMembers.length > 0 ? (
              <div className="space-y-4">
                {stats.teamMembers.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <Avatar className="w-7 h-7 ring-2 ring-background">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-medium">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-foreground truncate">
                        {member.name}
                      </p>
                    </div>
                    <div className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-medium">
                      {member.taskCount}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No assignees in this sprint.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintDetailPage;
