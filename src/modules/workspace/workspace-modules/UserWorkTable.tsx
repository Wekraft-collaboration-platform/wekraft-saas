"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  ClipboardList,
  Bug,
  Ticket,
  CalendarDays,
  Layers2,
  FastForward,
  Loader2,
  ChevronDown,
  AlertTriangle,
  ClockAlert,
  Clock12,
} from "lucide-react";
import { useKayaStore } from "@/store/useKayaStore";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import type { MyTaskItem, MyIssueItem } from "@/types/types";
import { priorityIcons, statusColors } from "@/lib/static-store";
import { useParams, useRouter } from "next/navigation";

interface UserWorkTableProps {
  userName?: string;
  projectId?: Id<"projects">;
}

const severityConfig: Record<string, { label: string; class: string }> = {
  critical: { label: "Critical", class: "text-red-400 bg-red-400/10" },
  medium: { label: "Medium", class: "text-yellow-400 bg-yellow-400/10" },
  low: { label: "Low", class: "text-emerald-400 bg-emerald-400/10" },
};

const issueStatusColors: Record<string, string> = {
  "not opened": "bg-slate-500/10 text-slate-500 border-slate-500/20",
  opened: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "in review": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  reopened: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  closed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

export const UserWorkTable = ({ userName, projectId }: UserWorkTableProps) => {
  const [activeTab, setActiveTab] = useState("tasks");
  const [taskCursor, setTaskCursor] = useState(0);
  const [issueCursor, setIssueCursor] = useState(0);
  const [allTasks, setAllTasks] = useState<MyTaskItem[]>([]);
  const [allIssues, setAllIssues] = useState<MyIssueItem[]>([]);
  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [hasMoreIssues, setHasMoreIssues] = useState(true);
  const taskScrollRef = useRef<HTMLDivElement>(null);
  const issueScrollRef = useRef<HTMLDivElement>(null);
  const { toggleKaya } = useKayaStore();
  const today = format(new Date(), "PPP");
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // ─── Queries ───
  const tasksResult = useQuery(
    api.workspace.getMyTasks,
    projectId ? { projectId, limit: 10, cursor: taskCursor } : "skip",
  );
  const issuesResult = useQuery(
    api.workspace.getMyIssues,
    projectId ? { projectId, limit: 10, cursor: issueCursor } : "skip",
  );

  // ─── Accumulate tasks across pages ───
  useEffect(() => {
    if (!tasksResult) return;
    const newItems = tasksResult.items as MyTaskItem[];
    setAllTasks((prev) => {
      const existingIds = new Set(prev.map((t) => t._id));
      const unique = newItems.filter((t) => !existingIds.has(t._id));
      return [...prev, ...unique];
    });
    setHasMoreTasks(tasksResult.nextCursor !== null);
  }, [tasksResult]);

  // ─── Accumulate issues across pages ───
  useEffect(() => {
    if (!issuesResult) return;
    const newItems = issuesResult.items as MyIssueItem[];
    setAllIssues((prev) => {
      const existingIds = new Set(prev.map((i) => i._id));
      const unique = newItems.filter((i) => !existingIds.has(i._id));
      return [...prev, ...unique];
    });
    setHasMoreIssues(issuesResult.nextCursor !== null);
  }, [issuesResult]);

  const tabs = [
    { id: "tasks", label: "Tasks", icon: ClipboardList },
    { id: "issues", label: "Issues", icon: Bug },
    { id: "sprints", label: "Sprints", icon: FastForward },
    { id: "tickets", label: "Tickets", icon: Ticket },
  ];

  // ─── Empty state (untouched from original) ───
  const renderEmptyState = (id: string) => {
    const config: Record<string, any> = {
      tasks: {
        icon: ClipboardList,
        title: "No tasks found for today",
        desc: "You're all caught up! Enjoy your day or check other tabs for pending work.",
      },
      issues: {
        icon: Bug,
        title: "No issues assigned",
        desc: "Great job! There are no critical bugs requiring your immediate attention.",
      },
      sprints: {
        icon: FastForward,
        title: "No active sprints",
        desc: "You are not part of any active sprints currently. Check with your team lead.",
      },
      tickets: {
        icon: Ticket,
        title: "No open tickets",
        desc: "Support queue is empty. No tickets are currently assigned to you.",
      },
    };

    const state = config[id];
    const Icon = state.icon;

    return (
      <div className=" flex flex-col items-center justify-center text-center p-12 mt-20 dark:bg-sidebar bg-accent/10 rounded-xl border border-dashed border-accent transition-all duration-300">
        <Icon className="w-10 h-10 text-primary opacity-50 mb-5" />

        <h3 className="text-sm font-semibold tracking-tight text-primary">
          {state.title}
        </h3>
        <p className="text-[11px] text-muted-foreground max-w-[240px] mt-2 font-medium leading-relaxed">
          {state.desc}
        </p>
      </div>
    );
  };

  // ─── Task list renderer ───
  const renderTasks = () => {
    if (!tasksResult && allTasks.length === 0) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (allTasks.length === 0) return renderEmptyState("tasks");

    return (
      <div className="flex flex-col h-full">
        <div
          ref={taskScrollRef}
          className="flex-1 overflow-y-auto space-y-2.5 pr-1"
        >
          {allTasks.map((task) => {
            const daysLeft = Math.ceil(
              (task.estimation.endDate - Date.now()) / (1000 * 60 * 60 * 24),
            );
            const isOverdue = daysLeft <= 0;

            return (
              <div
                key={task._id}
                onClick={() =>
                  router.push(
                    `/dashboard/my-projects/${slug}/workspace/tasks?task=${task._id}`,
                  )
                }
                className="bg-muted/30 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                {/* Row 1 — Title + Estimation */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm capitalize font-semibold text-primary truncate">
                      {task.title}
                    </span>
                    {task.isBlocked && (
                      <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0" />
                    )}
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[10px] flex items-center text-muted-foreground font-medium tabular-nums">
                      <Clock12 className="w-3 h-3 mr-2" />
                      {format(task.estimation.startDate, "MMM d")} –{" "}
                      {format(task.estimation.endDate, "MMM d")}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold tabular-nums mt-0.5",
                        isOverdue ? "text-red-400" : "text-muted-foreground",
                      )}
                    >
                      {isOverdue
                        ? `${Math.abs(daysLeft)}d overdue`
                        : `${daysLeft}d left`}
                    </span>
                  </div>
                </div>

                {/* Row 2 — Description */}
                <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-1 leading-relaxed">
                  {task.description || "No description provided"}
                </p>

                {/* Row 3 — Priority + Status */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    {priorityIcons[task.priority ?? "none"]}
                    <span className="text-[10px] text-muted-foreground font-medium capitalize">
                      {task.priority ?? "None"}
                    </span>
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-medium capitalize px-2 py-0.5 rounded-full border",
                      statusColors[task.status] ??
                        "bg-slate-500/10 text-muted-foreground border-slate-500/20",
                    )}
                  >
                    {task.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Always-visible bottom button */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          {hasMoreTasks ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTaskCursor((prev) => prev + 10)}
              className="text-[11px] text-muted-foreground hover:text-primary gap-1.5 cursor-pointer"
            >
              <ChevronDown className="w-3 h-3" />
              Load more
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground/50 font-medium">
              No more tasks
            </span>
          )}
        </div>
      </div>
    );
  };

  // ─── Issue list renderer ───
  const renderIssues = () => {
    if (!issuesResult && allIssues.length === 0) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (allIssues.length === 0) return renderEmptyState("issues");

    return (
      <div className="flex flex-col h-full">
        <div
          ref={issueScrollRef}
          className="flex-1 overflow-y-auto space-y-2.5 pr-1"
        >
          {allIssues.map((issue) => {
            const s = issue.severity ? severityConfig[issue.severity] : null;
            const dueLabel = issue.due_date
              ? (() => {
                  const d = Math.ceil(
                    (issue.due_date - Date.now()) / (1000 * 60 * 60 * 24),
                  );
                  return d > 0 ? `${d}d left` : `${Math.abs(d)}d overdue`;
                })()
              : null;
            const isOverdue = issue.due_date && issue.due_date < Date.now();

            return (
              <div
                key={issue._id}
                onClick={() =>
                  router.push(
                    `/dashboard/my-projects/${slug}?issue=${issue._id}`,
                  )
                }
                className="bg-muted rounded-lg p-3 cursor-pointer hover:bg-muted/80 transition-colors"
              >
                {/* Row 1 — Title + Due date */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Bug className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-[13px] font-semibold text-primary truncate">
                      {issue.title}
                    </span>
                    {issue.environment && (
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-accent px-1.5 py-0.5 rounded font-semibold shrink-0">
                        {issue.environment}
                      </span>
                    )}
                  </div>

                  {dueLabel && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold tabular-nums shrink-0",
                        isOverdue ? "text-red-400" : "text-muted-foreground",
                      )}
                    >
                      {dueLabel}
                    </span>
                  )}
                </div>

                {/* Row 2 — Description */}
                <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-1 leading-relaxed">
                  {issue.description || "No description provided"}
                </p>

                {/* Row 3 — Severity + Status */}
                <div className="flex items-center gap-3 mt-2">
                  {s && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        s.class,
                      )}
                    >
                      {s.label}
                    </span>
                  )}

                  <span
                    className={cn(
                      "text-[10px] font-medium capitalize px-2 py-0.5 rounded-full border",
                      issueStatusColors[issue.status] ??
                        "bg-slate-500/10 text-slate-500 border-slate-500/20",
                    )}
                  >
                    {issue.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Always-visible bottom button */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          {hasMoreIssues ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIssueCursor((prev) => prev + 10)}
              className="text-[11px] text-muted-foreground hover:text-primary gap-1.5 cursor-pointer"
            >
              <ChevronDown className="w-3 h-3" />
              Load more
            </Button>
          ) : (
            <span className="text-[11px] text-muted-foreground/50 font-medium">
              No more issues
            </span>
          )}
        </div>
      </div>
    );
  };

  // ─── Tab content router ───
  const renderTabContent = () => {
    switch (activeTab) {
      case "tasks":
        return renderTasks();
      case "issues":
        return renderIssues();
      default:
        return renderEmptyState(activeTab);
    }
  };

  return (
    <Card className="border border-accent shadow-none overflow-hidden dark:bg-sidebar bg-card h-[620px]">
      <CardHeader className="flex  items-center justify-between space-y-0 ">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold  text-primary flex items-center gap-2">
            <Layers2 className="w-5 h-5! text-primary" />
            Your work,
            <span className="text-primary font-bold text-xl capitalize">
              {userName}
            </span>
          </CardTitle>
        </div>
        <div className="flex items-center gap-1.5 text-xs tracking-tight font-medium text-muted-foreground">
          <CalendarDays className="w-3 h-3" />
          {today}
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        <div className="flex items-center justify-between border-b border-border mb-8">
          <div className="flex items-center gap-3">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 text-xs font-semibold px-4 transition-all relative cursor-pointer rounded-t-lg rounded-b-none border-b-2",
                  activeTab === tab.id
                    ? "border-b-primary text-primary bg-transparent"
                    : "border-b-transparent text-muted-foreground hover:text-foreground hover:bg-transparent",
                )}
              >
                <tab.icon
                  className={cn(
                    "w-3.5 h-3.5 mr-1",
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                {tab.label}
              </Button>
            ))}
          </div>

          <Button
            onClick={toggleKaya}
            variant="outline"
            size="sm"
            className="h-8 text-[10px] gap-2 rounded-md border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary transition-all cursor-pointer shadow-none"
          >
            <Image src="/kaya.svg" alt="kaya" width={20} height={20} />
            Ask for Standup
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-1 duration-500 overflow-y-auto max-h-[420px] scrollbar-thin">
          {renderTabContent()}
        </div>
      </CardContent>
    </Card>
  );
};
