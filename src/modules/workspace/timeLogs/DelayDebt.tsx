"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Hourglass } from "lucide-react";
import { Task } from "@/types/types";
import { useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface DelayDebtProps {
  tasks: Task[];
  projectId: Id<"projects">;
}

export const DelayDebt = ({ tasks, projectId }: DelayDebtProps) => {
  const [activeTab, setActiveTab] = useState<"tasks" | "issues">("tasks");

  // Use existing getFilteredIssues query
  const issues = useQuery(api.issue.getFilteredIssues, { projectId }) || [];

  const now = Date.now();
  const msInDay = 1000 * 60 * 60 * 24;

  // Use useMemo for performance - critical for potential high-frequency updates or large datasets
  const data = useMemo(() => {
    // 1. Process Tasks
    const tasksWithDueDate = tasks?.filter((t) => t.estimation?.endDate) || [];
    const overdueTasks = tasksWithDueDate
      .filter((t) => t.estimation.endDate < now && t.status !== "completed")
      .map((t) => ({
        id: t._id,
        title: t.title,
        daysOverdue: Math.max(0, (now - t.estimation.endDate) / msInDay),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    // 2. Process Issues
    const issuesWithDueDate = issues.filter((i) => i.due_date);
    const overdueIssues = issuesWithDueDate
      .filter((i) => i.due_date! < now && i.status !== "closed")
      .map((i) => ({
        id: i._id,
        title: i.title,
        daysOverdue: Math.max(0, (now - i.due_date!) / msInDay),
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    return {
      tasksWithDueDate,
      overdueTasks,
      overdueIssues,
    };
  }, [tasks, issues, now]);

  const { tasksWithDueDate, overdueTasks, overdueIssues } = data;

  // Threshold: >= 5 tasks with due dates
  const isReady = tasksWithDueDate.length >= 5;

  if (!isReady) {
    return (
      <div className="h-full w-full border border-neutral-800 rounded-xl bg-neutral-900/20 p-5 flex flex-col items-center justify-center text-center space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-primary/80">Delay Debt</h3>
          <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px] leading-relaxed">
            Not enough data yet. Add at least 5 tasks with due dates to unlock
            Delay Debt tracking.
          </p>
        </div>
      </div>
    );
  }

  const currentOverdueList =
    activeTab === "tasks" ? overdueTasks : overdueIssues;
  const currentOverdueCount = currentOverdueList.length;

  const totalDaysOverdueForTab = currentOverdueList.reduce(
    (sum, item) => sum + item.daysOverdue,
    0,
  );

  // Top 5 worst offenders (increased from 3 for more visibility)
  const worstOffenders = currentOverdueList.slice(0, 5);
  const hiddenOffendersCount = Math.max(0, currentOverdueCount - 5);

  // Simple color logic - primary usage
  let badgeColor = "text-muted-foreground border-neutral-800 bg-neutral-900/50";
  if (currentOverdueCount > 0) {
    badgeColor = "text-primary border-primary/20 bg-primary/5";
  }

  return (
    <div className="h-full w-full border border-border rounded-lg bg-accent/20 p-4 flex flex-col justify-start relative overflow-hidden">
      {/* HEADER: Title & Compact Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-md border bg-muted/50")}>
            <Hourglass className={cn("w-3 h-3! text-primary")} />
          </div>
          <h3 className="text-[13px] font-bold tracking-tight text-white/90">
            Delay Debt
          </h3>
        </div>

        <div className="flex p-0.5 bg-card rounded-md border border-border">
          <button
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "px-2 py-0.5 text-[10px] font-medium rounded transition-all",
              activeTab === "tasks"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-muted-foreground hover:text-neutral-300",
            )}
          >
            Tasks
          </button>
          <button
            onClick={() => setActiveTab("issues")}
            className={cn(
              "px-2 py-0.5 text-[10px] font-medium rounded transition-all",
              activeTab === "issues"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-muted-foreground hover:text-neutral-300",
            )}
          >
            Issues
          </button>
        </div>
      </div>

      {/* STAT CARDS: Compact & Simplified */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-card rounded-lg p-2 border border-border">
          <div
            className={cn(
              "text-xl font-bold tracking-tight leading-none mb-1 text-primary",
            )}
          >
            {Math.ceil(totalDaysOverdueForTab)}
          </div>
          <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-semibold">
            Days Overdue
          </div>
        </div>
        <div className="bg-card rounded-lg p-2 border border-border relative">
          <div
            className={cn(
              "text-xl font-bold tracking-tight leading-none mb-1 text-primary",
            )}
          >
            {currentOverdueCount}
          </div>
          <div className="text-[9px] text-neutral-500 uppercase tracking-widest font-semibold">
            Total {activeTab}
          </div>
        </div>
      </div>

      {/* WORST OFFENDERS: Clean List */}
      <div className="flex-1 overflow-hidden flex flex-col pt-1">
        <div className="mb-2.5 text-[10px] font-semibold text-primary flex items-center justify-between">
          <span>Worst offenders</span>
          <div
            className={cn(
              "px-2 py-0.5 rounded text-[9px] border font-bold bg-red-500/40!",
              badgeColor,
            )}
          >
            {currentOverdueCount} {activeTab.toUpperCase()}
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {worstOffenders.length === 0 ? (
            <div className="text-[11px] text-neutral-500 italic py-6 flex flex-col items-center justify-center border border-dashed border-neutral-800/50 rounded-lg">
              No overdue {activeTab} detected.
            </div>
          ) : (
            worstOffenders.map((item) => {
              const days = Math.ceil(item.daysOverdue);
              const isSevere = days >= 6;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between group py-0.5"
                >
                  <span className="text-[12px] text-neutral-300 truncate max-w-[150px] group-hover:text-white transition-colors">
                    {item.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-[1px] w-4 bg-neutral-800 group-hover:bg-neutral-700" />
                    <span
                      className={cn(
                        "text-[10px] font-bold min-w-[30px] text-right text-primary",
                      )}
                    >
                      -{days}d
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
