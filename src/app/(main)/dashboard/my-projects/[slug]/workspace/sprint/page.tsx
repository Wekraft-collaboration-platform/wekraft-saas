"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Zap, Clock, CheckCircle2, Target } from "lucide-react";
import { CreateSprintDialog } from "@/modules/workspace/CreateSprintDialog";

const SprintPage = () => {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const sprints = useQuery(
    api.sprint.getSprintsByProject,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip",
  );

  if (!project) {
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Sprints</h1>
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
      </div>

      {/* Active Sprint — highlighted */}
      {activeSprints.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Active
            </h2>
          </div>
          {activeSprints.map((sprint) => {
            const daysRemaining = Math.max(
              0,
              Math.ceil(
                (sprint.duration.endDate - Date.now()) /
                  (1000 * 60 * 60 * 24),
              ),
            );
            const totalItems = sprint.totalTasks + sprint.totalIssues;
            const completedItems =
              sprint.completedTasks + sprint.closedIssues;
            const percent =
              totalItems > 0
                ? Math.round((completedItems / totalItems) * 100)
                : 0;

            return (
              <Link
                key={sprint._id}
                href={`/dashboard/my-projects/${slug}/workspace/sprint/${sprint._id}`}
              >
                <div className="border rounded-lg p-5 hover:border-primary/30 transition-colors cursor-pointer bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {sprint.sprintName}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        <Target className="w-3.5 h-3.5 inline mr-1" />
                        {sprint.sprintGoal}
                      </p>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
                    <span>
                      📅 {format(sprint.duration.startDate, "MMM d")} →{" "}
                      {format(sprint.duration.endDate, "MMM d")}
                    </span>
                    <span>⏳ {daysRemaining} days left</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {completedItems}/{totalItems} items · {percent}%
                    </span>
                    <span>
                      {sprint.totalTasks} tasks · {sprint.totalIssues} issues
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Planned Sprints */}
      {plannedSprints.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Planned
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plannedSprints.map((sprint) => (
              <Link
                key={sprint._id}
                href={`/dashboard/my-projects/${slug}/workspace/sprint/${sprint._id}`}
              >
                <div className="border rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{sprint.sprintName}</h3>
                    <Badge variant="secondary">Planned</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    {sprint.sprintGoal}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    📅 {format(sprint.duration.startDate, "MMM d")} →{" "}
                    {format(sprint.duration.endDate, "MMM d")} ·{" "}
                    {sprint.totalTasks} tasks · {sprint.totalIssues} issues
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Completed Sprints */}
      {completedSprints.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Completed
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedSprints.map((sprint) => {
              const totalItems = sprint.totalTasks + sprint.totalIssues;
              const completedItems =
                sprint.completedTasks + sprint.closedIssues;
              const percent =
                totalItems > 0
                  ? Math.round((completedItems / totalItems) * 100)
                  : 0;

              return (
                <Link
                  key={sprint._id}
                  href={`/dashboard/my-projects/${slug}/workspace/sprint/${sprint._id}`}
                >
                  <div className="border rounded-lg p-4 hover:border-primary/30 transition-colors cursor-pointer opacity-70">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{sprint.sprintName}</h3>
                      <Badge variant="outline">{percent}%</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sprint.totalTasks} tasks · {sprint.totalIssues} issues
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {sprints && sprints.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-medium mb-2">No sprints yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first sprint to start organizing your work into focused
            time-boxed iterations.
          </p>
          <CreateSprintDialog
            projectId={project._id as Id<"projects">}
            projectName={project.projectName || "Project"}
            trigger={
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Sprint
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default SprintPage;
