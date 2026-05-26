"use client";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock12,
  ClockAlert,
  Ellipsis,
  FastForward,
  Layers2,
  Loader2,
  Ticket,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { priorityIcons, statusColors, statusIconsNoColors } from "@/lib/static-store";
import { cn } from "@/lib/utils";
import { useKayaStore } from "@/store/useKayaStore";
import type { MyIssueItem, MyTaskItem } from "@/types/types";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

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

const issueStatusIconsNoColors: Record<string, React.ReactNode> = {
  "not opened": <AlertCircle className="w-3.5 h-3.5" />,
  opened: <AlertCircle className="w-3.5 h-3.5" />,
  "in review": <Clock12 className="w-3.5 h-3.5" />,
  reopened: <AlertCircle className="w-3.5 h-3.5" />,
  closed: <CheckCircle2 className="w-3.5 h-3.5" />,
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

  const [ticketCursor, setTicketCursor] = useState(0);
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [hasMoreTickets, setHasMoreTickets] = useState(true);
  const ticketScrollRef = useRef<HTMLDivElement>(null);

  const ticketsResult = useQuery(
    api.workspace.getMyTickets,
    projectId ? { projectId, limit: 10, cursor: ticketCursor } : "skip",
  );

  // ─── Accumulate tickets across pages ───
  useEffect(() => {
    if (!ticketsResult) return;
    const newItems = ticketsResult.items;
    setAllTickets((prev) => {
      const existingIds = new Set(prev.map((t) => t._id));
      const unique = newItems.filter((t: any) => !existingIds.has(t._id));
      return [...prev, ...unique];
    });
    setHasMoreTickets(ticketsResult.nextCursor !== null);
  }, [ticketsResult]);

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
    { id: "tickets", label: "Tickets", icon: Ticket },
  ];

  // ─── Empty state ───
  const renderEmptyState = (id: string) => {
    const config: Record<string, any> = {
      tasks: {
        image: "/emp.svg",
        title: "No tasks found for today",
        desc: "You're all caught up! Enjoy your day or check other tabs for pending work.",
      },
      issues: {
        image: "/isssue.svg",
        title: "No issues assigned",
        desc: "Great job! There are no critical bugs requiring your immediate attention.",
      },
      tickets: {
        image: "/ticket.svg",
        title: "No open tickets",
        desc: "Support queue is empty. No tickets are currently assigned to you.",
      },
    };

    const state = config[id];

    return (
      <div className=" flex flex-col items-center justify-center text-center p-12 mt-20 dark:bg-sidebar bg-accent/10 rounded-xl border border-dashed border-accent transition-all duration-300">
        <Image
          src={state.image}
          alt={state.title}
          width={220}
          height={220}
          className="-mb-3 opacity-90"
        />
        <h3 className="text-lg tracking-tight text-primary">
          {state.title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[240px] mt-2 font-medium leading-relaxed">
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
          className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto space-y-2.5 items-center"
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
                className="bg-muted border border-accent! px-2.5 py-3 rounded-lg"
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
                    <span className="text-xs flex items-center text-primary font-medium tabular-nums">
                      <Clock12 className="w-3 h-3 mr-2" />
                      {format(task.estimation.startDate, "MMM d")} –{" "}
                      {format(task.estimation.endDate, "MMM d")}
                    </span>
                    <span
                      className={cn(
                        "text-sm tabular-nums mt-0.5",
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
                    className="text-[10px] font-medium capitalize px-2.5 py-1 rounded-full border bg-neutral-900/90 border-neutral-800/80 text-primary/90 flex items-center gap-1.5 shrink-0"
                  >
                    {statusIconsNoColors[task.status] || <Ellipsis className="w-3.5 h-3.5" />}
                    {task.status}
                  </span>

                  {task.creator && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground font-medium">
                        Created by:
                      </span>
                      {/* Creator */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="w-6 h-6 border border-border shrink-0">
                              <AvatarImage
                                src={task.creator.avatarUrl}
                                alt={task.creator.name}
                              />
                              <AvatarFallback className="text-[12px] font-semibold">
                                {task.creator.name?.charAt(0).toUpperCase() ||
                                  "?"}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-[10px]">
                              {task.creator.name || "Unknown"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {task.assignees && task.assignees.length > 0 && (
                      <div className="flex items-center -space-x-1.5 ml-1">
                        <TooltipProvider>
                          {task.assignees.map((assignee) => (
                            <Tooltip key={assignee.userId}>
                              <TooltipTrigger asChild>
                                <Avatar className="w-6 h-6 border border-background shadow-xs hover:z-10 transition-transform duration-200 shrink-0">
                                  <AvatarImage
                                    src={assignee.avatarUrl}
                                    alt={assignee.name}
                                  />
                                  <AvatarFallback className="text-[11px] font-semibold">
                                    {assignee.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-[10px]">{assignee.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
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
            <div className="flex justify-center items-center my-6 text-center w-full">
              <span className="text-sm text-muted-foreground font-medium">
                No more tasks assigned to you.
              </span>
            </div>
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
          className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto space-y-2.5 items-center"
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
                    {/* {issue.environment && (
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground bg-accent px-1.5 py-0.5 rounded font-semibold shrink-0">
                        {issue.environment}
                      </span>
                    )} */}
                  </div>

                  {dueLabel && (
                    <span
                      className={cn(
                        "text-sm tabular-nums shrink-0",
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
                  {/* {s && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        s.class,
                      )}
                    >
                      {s.label}
                    </span>
                  )} */}

                  <span
                    className="text-[10px] font-medium capitalize px-2.5 py-1 rounded-full border bg-neutral-900/90 border-neutral-800/80 text-primary/90 flex items-center gap-1.5 shrink-0"
                  >
                    {issueStatusIconsNoColors[issue.status] || <AlertCircle className="w-3.5 h-3.5" />}
                    {issue.status}
                  </span>

                  {issue.creator && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground font-medium">
                        Created by:
                      </span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="w-6 h-6 border border-border shrink-0">

                              <AvatarImage
                                // @ts-ignore
                                src={issue.creator.avatar}
                                alt={issue.creator.name}
                              />
                              <AvatarFallback className="text-[11px] font-semibold">
                                {issue.creator.name?.charAt(0).toUpperCase() ||
                                  "?"}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-[10px]">
                              {issue.creator.name || "Unknown"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}

                  <div className="flex items-center gap-2 ml-auto">
                    {issue.assignees && issue.assignees.length > 0 && (
                      <div className="flex items-center -space-x-1.5 ml-1">
                        <TooltipProvider>
                          {issue.assignees.map((assignee) => (
                            <Tooltip key={assignee.userId}>
                              <TooltipTrigger asChild>
                                <Avatar className="w-6 h-6 border border-background shadow-xs hover:z-10 transition-transform duration-200 shrink-0">
                                  <AvatarImage
                                    // @ts-ignore
                                    src={assignee.avatar}
                                    alt={assignee.name}
                                  />
                                  <AvatarFallback className="text-[11px] font-semibold">
                                    {assignee.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-[10px]">{assignee.name}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
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
            <div className="flex justify-center items-center my-6 text-center w-full">
              <span className="text-sm text-muted-foreground font-medium">
                No more Issues assigned to you.
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ─── Ticket list renderer ───
  const renderTickets = () => {
    if (!ticketsResult && allTickets.length === 0) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (allTickets.length === 0) return renderEmptyState("tickets");

    return (
      <div className="flex flex-col h-full">
        <div
          ref={ticketScrollRef}
          className="grid grid-cols-2 gap-6 flex-1 overflow-y-auto space-y-2.5 items-center"
        >
          {allTickets.map((ticket) => {
            return (
              <div
                key={ticket._id}
                onClick={() =>
                  router.push(`/dashboard/my-projects/${slug}/workspace`)
                }
                className="bg-muted border border-accent/60 px-4 py-3 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer flex flex-col justify-between min-h-[110px]"
              >
                {/* Row 1 — Status + Creation date */}
                <div className="flex items-center justify-between gap-4">
                  <span className={cn(
                    "text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider",
                    ticket.status === "open" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-muted-foreground/15 text-muted-foreground border border-muted-foreground/20"
                  )}>
                    {ticket.status}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {format(new Date(ticket.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>

                {/* Row 2 — Description (line-clamp-2) */}
                <p className="text-[12px] text-foreground mt-2.5 line-clamp-2 leading-relaxed break-words">
                  {ticket.body}
                </p>

                {/* Row 3 — Avatars (assignee and creator) */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-border/20 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">Assignee:</span>
                    <div className="flex items-center gap-1">
                      <Avatar className="w-5 h-5 border border-border">
                        <AvatarImage src={ticket.assignee?.avatar} alt={ticket.assignee?.name} />
                        <AvatarFallback className="text-[9px] font-semibold">
                          {(ticket.assignee?.name || "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-foreground/90">{ticket.assignee?.name || "Unassigned"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground font-medium">Created by:</span>
                    <div className="flex items-center gap-1">
                      <Avatar className="w-5 h-5 border border-border">
                        <AvatarImage src={ticket.creator?.avatar} alt={ticket.creator?.name} />
                        <AvatarFallback className="text-[9px] font-semibold">
                          {(ticket.creator?.name || "?").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-foreground/90">{ticket.creator?.name || "Unknown"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load more button */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          {hasMoreTickets ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTicketCursor((prev) => prev + 10)}
              className="text-[11px] text-muted-foreground hover:text-primary gap-1.5 cursor-pointer"
            >
              <ChevronDown className="w-3 h-3" />
              Load more
            </Button>
          ) : (
            <div className="flex justify-center items-center my-6 text-center w-full">
              <span className="text-sm text-muted-foreground font-medium">
                No more tickets assigned to you.
              </span>
            </div>
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
      case "tickets":
        return renderTickets();
      default:
        return renderEmptyState(activeTab);
    }
  };

  return (
    <Card className="border border-accent shadow-none overflow-hidden dark:bg-sidebar bg-card h-[620px]">
      <CardHeader className="flex  items-center justify-between space-y-0 ">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold  text-primary flex items-center gap-2">
            <Layers2 className="w-5 h-5! text-primary" />
            Have a Look at your work,
            <span className="text-primary font-bold text-lg capitalize">
              {userName} !
            </span>
          </CardTitle>
        </div>
        <div className="flex items-center gap-1.5 text-xs tracking-tight font-medium text-primary">
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
                  "h-10 text-base px-4 transition-all relative cursor-pointer rounded-t-lg rounded-b-none border-b-2",
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
            className="h-8 text-xs bg-linear-to-br from-transparent to-indigo-500"
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
