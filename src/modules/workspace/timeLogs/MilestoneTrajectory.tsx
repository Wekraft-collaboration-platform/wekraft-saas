"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Compass, BadgeAlert, LucideAlertTriangle } from "lucide-react";
import { Task } from "@/types/types";
import { format } from "date-fns";

interface MilestoneTrajectoryProps {
  tasks: Task[];
  createdAt: number;
  deadline: number;
}

export const MilestoneTrajectory = ({
  tasks,
  createdAt,
  deadline,
}: MilestoneTrajectoryProps) => {
  const now = Date.now();
  const msInDay = 1000 * 60 * 60 * 24;

  const totalTasks = tasks?.length || 0;
  const completedTasks =
    tasks?.filter((t) => t.status === "completed").length || 0;
  const tasksRemaining = Math.max(0, totalTasks - completedTasks);

  const daysConsumed = Math.max(0.1, (now - createdAt) / msInDay);

  // Threshold: more than 5 tasks (>=6) and >= 3 days
  const isReady = totalTasks >= 6 && daysConsumed >= 3;

  if (!isReady) {
    return (
      <div className="h-full w-full border border-neutral-200 dark:border-neutral-800 rounded-lg bg-card dark:bg-neutral-900/70 shadow-sm dark:shadow-none p-4 flex flex-col relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn("p-1.5 rounded-md border bg-muted/50")}>
            <Compass className={cn("w-3.5 h-3.5 text-primary")} />
          </div>
          <h3 className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-white/90">
            Milestone Trajectory
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center space-y-3 mt-6">
          <LucideAlertTriangle className={cn("w-8 h-8 text-primary opacity-50")} />
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center px-7">
            Your workspace atleast have{" "}
            <span className="text-primary">6 tasks and 3 days of history</span>{" "}
            to establish trajectory forecasting.
          </p>
        </div>
      </div>
    );
  }

  // MATHEMATICAL PROJECTION
  const velocity = completedTasks / daysConsumed;
  
  let daysNeeded = 0;
  if (velocity > 0) {
    daysNeeded = tasksRemaining / velocity;
  } else {
    daysNeeded = tasksRemaining * 2; 
  }

  const projectedCompletion = now + daysNeeded * msInDay;
  const varianceDays = Math.round((projectedCompletion - deadline) / msInDay);
  const isBehind = varianceDays > 0;

  // Timeline math
  const totalDuration = Math.max(deadline, projectedCompletion) - createdAt;
  const targetPos = ((deadline - createdAt) / totalDuration) * 100;
  const projectedPos = ((projectedCompletion - createdAt) / totalDuration) * 100;
  const currentPos = ((now - createdAt) / totalDuration) * 100;

  return (
    <div className="h-full w-full border border-neutral-200 dark:border-neutral-800 rounded-lg bg-card dark:bg-neutral-900/70 shadow-sm dark:shadow-none p-4 flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md border bg-muted/50")}>
              <Compass className={cn("w-3.5 h-3.5 text-primary")} />
            </div>
            <h3 className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-white/90">
              Milestone Trajectory
            </h3>
          </div>
          <div
            className={cn(
              "px-2 py-1 rounded-sm text-[10px] font-bold border",
              isBehind
                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
            )}
          >
            {isBehind
              ? `+${varianceDays} Days Late`
              : `${Math.abs(varianceDays)} Days Early`}
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[10px] text-primary uppercase tracking-widest font-medium mb-1">
            Projected Completion
          </div>
          <div className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {format(projectedCompletion, "MMM dd, yyyy")}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Current velocity: {velocity.toFixed(2)} tasks/day
          </div>
        </div>
      </div>

      <div className="">
        {/* Timeline */}
        <div className="relative h-3 w-full bg-neutral-200 dark:bg-neutral-800/50 rounded-full mb-3">
          {/* Progress fill */}
          <div
            className="absolute h-full bg-primary/70 rounded-full"
            style={{ width: `${Math.min(100, currentPos)}%` }}
          />

          {/* Target Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-neutral-100 dark:bg-neutral-900 border-2 border-neutral-900 dark:border-white rounded-full z-10 shadow-lg"
            style={{ left: `${Math.min(98, targetPos)}%` }}
          />

          {/* Projected Marker */}
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-neutral-900 rounded-full z-20 shadow-xl",
              isBehind ? "bg-rose-500" : "bg-emerald-500",
            )}
            style={{ left: `${Math.min(98, projectedPos)}%` }}
          />
        </div>

        <div className="flex justify-between text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">
          <span>Start</span>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-neutral-900 dark:bg-white rounded-full" /> Target
            </span>
            <span className="flex items-center gap-1">
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isBehind ? "bg-rose-500" : "bg-emerald-500",
                )}
              />{" "}
              Forecast
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
