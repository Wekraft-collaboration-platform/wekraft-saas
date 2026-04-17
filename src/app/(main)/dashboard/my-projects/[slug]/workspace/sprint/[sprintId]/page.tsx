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
} from "lucide-react";

// Helper to strip technical Convex error boilerplate
const cleanError = (error: any) => {
  const msg = error.message || String(error);
  // Removes "[CONVEX M(...)] Server Error: " and everything before the actual message
  return msg
    .replace(/\[CONVEX M\(.*?\)\] Server Error: /, "")
    .replace(/Uncaught Error: /, "");
};

const SprintDetailPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const sprintId = params.sprintId as Id<"sprints">;

  const [activeTab, setActiveTab] = useState<"tasks" | "issues">("tasks");

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const { isOwner } = useProjectPermissions(project?._id as Id<"projects">);

  const sprint = useQuery(api.sprint.getSprintById, { sprintId });
  const tasks = useQuery(api.sprint.getSprintTasks, { sprintId });
  const issues = useQuery(api.sprint.getSprintIssues, { sprintId });
  const stats = useQuery(api.sprint.getSprintStats, { sprintId });
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
    try {
      await startSprint({ sprintId });
      toast.success("Sprint started!");
    } catch (e: any) {
      toast.error(cleanError(e));
    }
  };

  const handleCompleteSprint = async () => {
    try {
      await completeSprint({ sprintId });
      toast.success("Sprint completed! Incomplete items moved to backlog.");
    } catch (e: any) {
      toast.error(cleanError(e));
    }
  };

  const handleAddTask = async (taskId: Id<"tasks">) => {
    try {
      await assignTask({ taskId, sprintId });
      toast.success("Task added to sprint");
    } catch (e: any) {
      toast.error(cleanError(e));
    }
  };

  const handleRemoveTask = async (taskId: Id<"tasks">) => {
    try {
      await removeTask({ taskId, sprintId: undefined });
      toast.success("Task removed from sprint");
    } catch (e: any) {
      toast.error(cleanError(e));
    }
  };

  const handleAddIssue = async (issueId: Id<"issues">) => {
    try {
      await assignIssue({ issueId, sprintId });
      toast.success("Issue added to sprint");
    } catch (e: any) {
      toast.error(cleanError(e));
    }
  };

  const handleRemoveIssue = async (issueId: Id<"issues">) => {
    try {
      await removeIssue({ issueId, sprintId: undefined });
      toast.success("Issue removed from sprint");
    } catch (e: any) {
      toast.error(cleanError(e));
    }
  };

  const statusColor = {
    planned: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    active: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <div className="w-full h-full p-6 2xl:p-8">
      {/* Back link */}
      <Link
        href={`/dashboard/my-projects/${slug}/workspace/sprint`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Sprints
      </Link>

      {/* Sprint Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-semibold">{sprint.sprintName}</h1>
            <Badge className={statusColor[sprint.status]}>
              {sprint.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            <Target className="w-3.5 h-3.5 inline mr-1" />
            {sprint.sprintGoal}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
            <span>
              📅 {format(sprint.duration.startDate, "MMM d, yyyy")} →{" "}
              {format(sprint.duration.endDate, "MMM d, yyyy")}
            </span>
            {sprint.status === "active" && (
              <span>⏳ {daysRemaining} days remaining</span>
            )}
          </div>
        </div>

        {/* Sprint actions — Owner only */}
        <div className="flex items-center gap-2">
          {!isOwner ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-full text-[10px] font-medium text-muted-foreground uppercase tracking-wider border">
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
                <Button size="sm" onClick={handleStartSprint}>
                  <Play className="w-4 h-4 mr-1" />
                  Start Sprint
                </Button>
              )}
              {sprint.status === "active" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCompleteSprint}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Complete Sprint
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {stats && (
        <div className="mb-8">
          <div className="w-full bg-muted rounded-full h-2 mb-1">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${stats.completionPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.completedItems}/{stats.totalItems} items completed ·{" "}
            {stats.completionPercent}%
          </p>
        </div>
      )}

      {/* Main content: Left (tasks/issues) + Right (team + stats) */}
      <div className="flex gap-6">
        {/* LEFT — Tasks / Issues */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-4 border-b mb-4">
            <button
              onClick={() => setActiveTab("tasks")}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "tasks"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              📋 Tasks ({tasks?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("issues")}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "issues"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-primary"
              }`}
            >
              🐛 Issues ({issues?.length || 0})
            </button>
          </div>

          {/* Tasks list */}
          {activeTab === "tasks" && (
            <div className="space-y-2">
              {tasks && tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="border rounded-lg p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium truncate">
                          {task.title}
                        </span>
                        {task.isBlocked && (
                          <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">
                          {task.status}
                        </Badge>
                        {task.priority && (
                          <Badge variant="outline" className="text-[10px]">
                            {task.priority}
                          </Badge>
                        )}
                        {task.estimation && (
                          <span>
                            {format(task.estimation.startDate, "MMM d")} →{" "}
                            {format(task.estimation.endDate, "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Assignees */}
                    <div className="flex items-center gap-2 ml-3">
                      <div className="flex -space-x-1.5">
                        {task.assignedTo?.map((person, i) => (
                          <Avatar
                            key={i}
                            className="w-6 h-6 border-2 border-background"
                          >
                            <AvatarImage src={person.avatar} />
                            <AvatarFallback className="text-[9px]">
                              {person.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {isOwner && sprint.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                          onClick={() => handleRemoveTask(task._id)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No tasks in this sprint yet.
                </p>
              )}

              {/* Add from backlog */}
              {sprint.status !== "completed" && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBacklog(!showBacklog)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add tasks from backlog
                  </Button>

                  {showBacklog && activeTab === "tasks" && (
                    <div className="mt-3 border rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-1">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Backlog ({backlogTasks?.length || 0} tasks)
                      </p>
                      {backlogTasks && backlogTasks.length > 0 ? (
                        backlogTasks.map((task) => (
                          <div
                            key={task._id}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm truncate">
                                {task.title}
                              </span>
                              <div className="text-xs text-muted-foreground">
                                {task.status} · {task.priority || "no priority"}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleAddTask(task._id)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No backlog tasks available.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Issues list */}
          {activeTab === "issues" && (
            <div className="space-y-2">
              {issues && issues.length > 0 ? (
                issues.map((issue) => (
                  <div
                    key={issue._id}
                    className="border rounded-lg p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">
                        {issue.title}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Badge variant="outline" className="text-[10px]">
                          {issue.status}
                        </Badge>
                        {issue.severity && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              issue.severity === "critical"
                                ? "text-red-500 border-red-500/30"
                                : ""
                            }`}
                          >
                            {issue.severity}
                          </Badge>
                        )}
                        {issue.environment && <span>{issue.environment}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-3">
                      <div className="flex -space-x-1.5">
                        {issue.IssueAssignee?.map((person, i) => (
                          <Avatar
                            key={i}
                            className="w-6 h-6 border-2 border-background"
                          >
                            <AvatarImage src={person.avatar} />
                            <AvatarFallback className="text-[9px]">
                              {person.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {isOwner && sprint.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                          onClick={() => handleRemoveIssue(issue._id)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No issues in this sprint yet.
                </p>
              )}

              {/* Add from backlog — Owner only */}
              {isOwner && sprint.status !== "completed" && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBacklog(!showBacklog)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add issues from backlog
                  </Button>

                  {showBacklog && activeTab === "issues" && (
                    <div className="mt-3 border rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-1">
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Backlog ({backlogIssues?.length || 0} issues)
                      </p>
                      {backlogIssues && backlogIssues.length > 0 ? (
                        backlogIssues.map((issue) => (
                          <div
                            key={issue._id}
                            className="flex items-center justify-between p-2 rounded hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm truncate">
                                {issue.title}
                              </span>
                              <div className="text-xs text-muted-foreground">
                                {issue.status} ·{" "}
                                {issue.severity || "no severity"}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleAddIssue(issue._id)}
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No backlog issues available.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT — Team + Quick Stats */}
        <div className="w-[280px] shrink-0 space-y-6">
          {/* Team */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">Team</h3>
            {stats && stats.teamMembers.length > 0 ? (
              <div className="space-y-3">
                {stats.teamMembers.map((member) => (
                  <div key={member.userId} className="flex items-center gap-3">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="text-[10px]">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {member.taskCount} items
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No team members assigned yet.
              </p>
            )}
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-medium">{stats.totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-medium text-emerald-500">
                    {stats.completedItems}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Blocked</span>
                  <span className="font-medium text-red-500">
                    {stats.blockedTasks}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Burn Rate</span>
                  <span className="font-medium">
                    {stats.burnRate} items/day
                  </span>
                </div>
                {stats.estimatedDaysToComplete && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Est. Completion
                    </span>
                    <span className="font-medium">
                      {stats.estimatedDaysToComplete}d remaining
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom — Metrics */}
      {stats && stats.totalItems > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          {/* Completion */}
          <div className="border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{stats.completionPercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedItems}/{stats.totalItems} completed
            </p>
          </div>

          {/* Status Breakdown */}
          <div className="border rounded-lg p-4">
            <p className="text-sm font-semibold mb-2">Task Status</p>
            <div className="space-y-1">
              {Object.entries(stats.taskStatusBreakdown).map(
                ([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="capitalize text-muted-foreground">
                      {status}
                    </span>
                    <span className="font-medium">{count as number}</span>
                  </div>
                ),
              )}
            </div>
          </div>

          {/* Burn Rate */}
          <div className="border rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{stats.burnRate}</p>
            <p className="text-xs text-muted-foreground mt-1">items/day</p>
            <p className="text-xs text-muted-foreground">
              {stats.daysRemaining} days left · {stats.daysElapsed} elapsed
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintDetailPage;
