"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  Clock,
  Activity,
  AlertCircle,
  ArrowUpRight,
  BadgeAlert,
  LucideAlertTriangle,
} from "lucide-react";
import { Task } from "@/types/types";

interface PaceTrackerProps {
  tasks: Task[];
  createdAt: number;
  deadline: number;
}

// Task progress
// Time consumed

export const PaceTracker = ({
  tasks,
  createdAt,
  deadline,
}: PaceTrackerProps) => {
  const now = Date.now();
  const msInDay = 1000 * 60 * 60 * 24;

  const totalDays = Math.max(1, (deadline - createdAt) / msInDay);
  const daysConsumed = Math.max(0, (now - createdAt) / msInDay);
  const daysRemaining = Math.max(0, (deadline - now) / msInDay);

  const totalTasks = tasks?.length || 0;
  const completedTasks =
    tasks?.filter((t) => t.status === "completed").length || 0;
  const tasksRemaining = Math.max(0, totalTasks - completedTasks);

  const timeConsumedPct = Math.min(100, (daysConsumed / totalDays) * 100);
  const taskCompletedPct = Math.min(100, (completedTasks / totalTasks) * 100);

  // -----------------------------------STATES--------------------------
  // empty: Initial state when no tasks exist.
  // growing: Project has started (tasks > 0), but we need 6 tasks and 3 days of history to accurately calculate velocity.
  // ready: Full intelligence mode. Threshold of 6 tasks and 3 days has been met.

  // THRESHOLD - project deadline should be >= 7 days (1 week) for this.

  // --------------------------COLOR MEANING---------------------------------
  // Emerald (Green): Performance is great. Task progress is outpacing time consumption.
  // Amber (Yellow): You're slipping. There is a small gap (0-15%) between time spent and work done.
  // Rose (Red): Critical danger. The gap is >15%, meaning the deadline is severely at risk.

  const isReady = totalTasks >= 6 && daysConsumed >= 3;
  let state = "empty";
  if (isReady) state = "ready";
  else if (totalTasks > 0) state = "growing";

  // const state = "ready";

  if (state === "empty") {
    return (
      <div className="h-full w-full border border-neutral-200 dark:border-neutral-800 rounded-lg bg-card dark:bg-neutral-900/70 shadow-sm dark:shadow-none p-4 flex flex-col relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn("p-1.5 rounded-md border bg-muted/50")}>
            <Activity className={cn("w-3.5 h-3.5 text-primary")} />
          </div>
          <h3 className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-white/90">
            Pace Tracker
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center space-y-3 mt-6">
          <LucideAlertTriangle className={cn("w-8 h-8 text-primary opacity-50")} />
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center px-7">
            Your workspace atleast have{" "}
            <span className="text-primary">6 tasks and 3 days of history</span>{" "}
            to establish velocity.
          </p>
        </div>
      </div>
    );
  }

  if (state === "growing") {
    return (
      <div className="h-full w-full border border-neutral-200 dark:border-neutral-800 rounded-lg bg-card dark:bg-neutral-900/70 shadow-sm dark:shadow-none p-4 flex flex-col relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className={cn("p-1.5 rounded-md border bg-muted/50")}>
            <Activity className={cn("w-3.5 h-3.5 text-primary")} />
          </div>
          <h3 className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-white/90">
            Pace Tracker
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center space-y-3 mt-6">
          <LucideAlertTriangle className={cn("w-8 h-8 text-primary opacity-50")} />
          <p className="text-[11px] text-muted-foreground leading-relaxed text-center px-7">
            Your workspace atleast have{" "}
            <span className="text-primary">6 tasks and 3 days of history</span>{" "}
            to establish velocity.
          </p>
        </div>
      </div>
    );
  }

  // READY STATE
  const gap = timeConsumedPct - taskCompletedPct; // Positive means Behind
  const isBehind = gap > 0;

  // Colors based on rules
  let statusMode: "emerald" | "amber" | "rose" = "emerald";
  if (gap > 0 && gap <= 15) statusMode = "amber";
  if (gap > 15) statusMode = "rose";

  const needPerDay =
    daysRemaining > 0 ? (tasksRemaining / daysRemaining).toFixed(1) : "0";
  const currentPace =
    daysConsumed > 0 ? (completedTasks / daysConsumed).toFixed(1) : "0";

  // Total blocks for the bar
  const totalBlocks = 35; // Number of rectangles
  const timeBlocks = Math.round((timeConsumedPct / 100) * totalBlocks);
  const taskBlocks = Math.round((taskCompletedPct / 100) * totalBlocks);

  const taskColors = {
    emerald: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]",
    amber: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]",
    rose: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.3)]",
  };

  const textColors = {
    emerald: "text-emerald-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
  };

  const bgColors = {
    emerald: "bg-emerald-500/10 border-emerald-500/20",
    amber: "bg-amber-500/10 border-amber-500/20",
    rose: "bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="h-full w-full border border-neutral-200 dark:border-neutral-800 rounded-lg bg-card dark:bg-neutral-900/70 shadow-sm dark:shadow-none p-4 flex flex-col justify-between relative overflow-hidden">
      {/* HEADER */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md border bg-muted/50")}>
              <Activity className={cn("w-3.5 h-3.5 text-primary")} />
            </div>
            <h3 className="text-[13px] font-semibold tracking-tight text-neutral-900 dark:text-white/90">
              Pace Tracker
            </h3>
          </div>
          {isBehind ? (
            <div
              className={cn(
                "px-3 py-1.5 rounded-sm text-[10px] flex items-center gap-1 border border-border bg-muted text-rose-500",
              )}
            >
              <AlertCircle className="w-3 h-3" />
              {gap.toFixed(0)}% Behind
            </div>
          ) : (
            <div
              className={cn(
                "px-3 py-1.5 rounded-sm text-[10px] flex items-center gap-1 border bg-muted/50 text-green-600",
              )}
            >
              <ArrowUpRight className="w-3 h-3" />
              Ahead
            </div>
          )}
        </div>

        {/* PROGRESS BARS */}
        <div className="space-y-3">
          {/* TASK BAR */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-medium text-primary uppercase tracking-widest">
              <span>Task Progress</span>
              <span className={cn(textColors[statusMode])}>
                {taskCompletedPct.toFixed(0)}%
              </span>
            </div>
            <div className="flex gap-[2px] h-6 w-full">
              {Array.from({ length: totalBlocks }).map((_, i) => (
                <div
                  key={`task-${i}`}
                  className={cn(
                    "flex-1 rounded-[1.5px] transition-colors",
                    i < taskBlocks
                      ? taskColors[statusMode]
                      : "bg-neutral-200 dark:bg-neutral-800",
                  )}
                />
              ))}
            </div>
          </div>

          {/* TIME BAR */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-medium text-primary uppercase tracking-widest">
              <span>Time Consumed</span>
              <span className="text-blue-400">
                {timeConsumedPct.toFixed(0)}%
              </span>
            </div>
            <div className="flex gap-[2px] h-6 w-full">
              {Array.from({ length: totalBlocks }).map((_, i) => (
                <div
                  key={`time-${i}`}
                  className={cn(
                    "flex-1 rounded-[1.5px] transition-colors",
                    i < timeBlocks
                      ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                      : "bg-neutral-200 dark:bg-neutral-800",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STATS FOOTER */}
      <div className="mt-3">
        {gap > 90 ? (
          <div className="mb-2 px-3 py-2 rounded border border-rose-500/10 bg-rose-500/10 text-muted-foreground text-[11px] font-medium flex items-center gap-2 tracking-wide">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-px" />
            {gap.toFixed(0)}% gap — speed up.{" "}
            <span className="underline underline-offset-2 text-primary">
              Ask KAYA to optimize
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5">
            <div className="bg-muted rounded-lg p-2 border border-border max-h-[48px] flex flex-col justify-center">
              <div className="text-base font-bold text-neutral-900 dark:text-white tracking-tight leading-none mb-0.5">
                {Math.ceil(daysRemaining)}
              </div>
              <div className="text-[9px] text-primary tracking-wider">
                Days left
              </div>
            </div>
            <div className="bg-muted rounded-lg p-2 border border-border max-h-[48px] flex flex-col justify-center">
              <div className="text-base font-bold text-primary tracking-tight leading-none mb-0.5">
                {tasksRemaining}
              </div>
              <div className="text-[9px] text-primary tracking-wider">
                Tasks left
              </div>
            </div>
            <div className="bg-muted rounded-lg p-2 border border-border max-h-[48px] flex flex-col justify-center">
              <div className="text-base font-bold text-primary tracking-tight leading-none mb-0.5 flex items-baseline">
                {needPerDay}
                <span className="text-[10px] ml-0.5 font-semibold">/day</span>
              </div>
              <div className="text-[9px] text-primary tracking-wider">
                Need rate
              </div>
            </div>
            <div className="bg-muted rounded-lg p-2 border border-border max-h-[48px] flex flex-col justify-center">
              <div className="text-base font-bold text-primary tracking-tight leading-none mb-0.5 flex items-baseline">
                {currentPace}
                <span className="text-[10px] ml-0.5 font-semibold">/day</span>
              </div>
              <div className="text-[9px] text-primary tracking-wider">
                Pace rate
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
