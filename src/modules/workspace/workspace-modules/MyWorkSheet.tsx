"use client";

import { useQuery } from "convex/react";
import { format } from "date-fns";
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock12,
  Ellipsis,
  Loader2,
  Ticket,
  BriefcaseBusiness,
  CircleCheckBig,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { priorityIcons, statusIconsNoColors } from "@/lib/static-store";
import { cn } from "@/lib/utils";
import { useKayaStore } from "@/store/useKayaStore";
import { useMyWorkStore } from "@/store/useMyWorkStore";
import type { MyIssueItem, MyTaskItem } from "@/types/types";
import { api } from "../../../../convex/_generated/api";

const severityConfig: Record<string, { label: string; class: string }> = {
  critical: { label: "Critical", class: "text-red-400 bg-red-400/10" },
  medium: { label: "Medium", class: "text-yellow-400 bg-yellow-400/10" },
  low: { label: "Low", class: "text-emerald-400 bg-emerald-400/10" },
};

const issueStatusIconsNoColors: Record<string, React.ReactNode> = {
  "not opened": <AlertCircle className="w-3.5 h-3.5" />,
  opened: <AlertCircle className="w-3.5 h-3.5" />,
  "in review": <Clock12 className="w-3.5 h-3.5" />,
  reopened: <AlertCircle className="w-3.5 h-3.5" />,
  closed: <CircleCheckBig className="w-3.5 h-3.5" />,
};

// border-l-4 border mapping based on status
const taskBorderColors: Record<string, string> = {
  "not started": "border-l-slate-500",
  inprogress: "border-l-yellow-500",
  reviewing: "border-l-blue-500",
  testing: "border-l-indigo-500",
};

const issueBorderColors: Record<string, string> = {
  "not opened": "border-l-slate-500",
  opened: "border-l-blue-500",
  "in review": "border-l-indigo-500",
  reopened: "border-l-orange-500",
};

export const MyWorkSheet = () => {
  const { isOpen, setIsOpen, activeTab, setActiveTab } = useMyWorkStore();
  const [formattedDateTime, setFormattedDateTime] = useState("");

  const [taskCursor, setTaskCursor] = useState(0);
  const [issueCursor, setIssueCursor] = useState(0);
  const [ticketCursor, setTicketCursor] = useState(0);

  const [allTasks, setAllTasks] = useState<MyTaskItem[]>([]);
  const [allIssues, setAllIssues] = useState<MyIssueItem[]>([]);
  const [allTickets, setAllTickets] = useState<any[]>([]);

  const [hasMoreTasks, setHasMoreTasks] = useState(true);
  const [hasMoreIssues, setHasMoreIssues] = useState(true);
  const [hasMoreTickets, setHasMoreTickets] = useState(true);

  // Filters and search states
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatusFilter, setTaskStatusFilter] = useState("all");
  const [taskSortOrder, setTaskSortOrder] = useState<"none" | "asc" | "desc">("none");

  const [issueSearch, setIssueSearch] = useState("");
  const [issueStatusFilter, setIssueStatusFilter] = useState("all");
  const [issueSortOrder, setIssueSortOrder] = useState<"none" | "asc" | "desc">("none");

  const taskScrollRef = useRef<HTMLDivElement>(null);
  const issueScrollRef = useRef<HTMLDivElement>(null);
  const ticketScrollRef = useRef<HTMLDivElement>(null);

  const { toggleKaya } = useKayaStore();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, slug ? { slug } : "skip");
  const user = useQuery(api.user.getCurrentUser);
  const projectId = project?._id;
  const userName = user?.name;

  // Update dynamic time on mount and every minute
  useEffect(() => {
    setFormattedDateTime(format(new Date(), "PPP"));
    const interval = setInterval(() => {
      setFormattedDateTime(format(new Date(), "PPP"));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // ─── Queries ───
  const tasksResult = useQuery(
    api.workspace.getMyTasks,
    projectId ? { projectId, limit: 10, cursor: taskCursor } : "skip",
  );
  const issuesResult = useQuery(
    api.workspace.getMyIssues,
    projectId ? { projectId, limit: 10, cursor: issueCursor } : "skip",
  );
  const ticketsResult = useQuery(
    api.workspace.getMyTickets,
    projectId ? { projectId, limit: 10, cursor: ticketCursor } : "skip",
  );

  // Reset collections and filters when project changes
  useEffect(() => {
    setAllTasks([]);
    setAllIssues([]);
    setAllTickets([]);
    setTaskCursor(0);
    setIssueCursor(0);
    setTicketCursor(0);
    setTaskSearch("");
    setTaskStatusFilter("all");
    setTaskSortOrder("none");
    setIssueSearch("");
    setIssueStatusFilter("all");
    setIssueSortOrder("none");
  }, [projectId]);

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

  // In-memory filters to ensure completed/closed items are never shown
  const activeTasks = allTasks.filter((t) => t.status !== "completed");
  const activeIssues = allIssues.filter((i) => i.status !== "closed");
  const activeTickets = allTickets.filter((t) => t.status !== "closed");

  // ─── Empty state ───
  const renderEmptyState = (id: string) => {
    const config: Record<string, any> = {
      tasks: {
        image: "/emp.svg",
        title: "No active tasks found",
        desc: "You're all caught up! Enjoy your day or check other tabs for pending work.",
      },
      issues: {
        image: "/isssue.svg",
        title: "No active issues assigned",
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
      <div className="flex flex-col items-center justify-center text-center p-8 mt-12 bg-accent/5 rounded-xl border border-dashed border-accent transition-all duration-300">
        <Image
          src={state.image}
          alt={state.title}
          width={160}
          height={160}
          className="opacity-85 mb-2"
        />
        <h3 className="text-sm font-semibold tracking-tight text-foreground">
          {state.title}
        </h3>
        <p className="text-xs text-muted-foreground max-w-[200px] mt-1 font-medium leading-normal">
          {state.desc}
        </p>
      </div>
    );
  };

  // ─── Task list renderer ───
  const renderTasks = () => {
    if (!tasksResult && activeTasks.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (activeTasks.length === 0) return renderEmptyState("tasks");

    const filteredTasks = activeTasks.filter((task) => {
      if (taskSearch.trim() !== "") {
        const query = taskSearch.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (taskStatusFilter !== "all" && task.status !== taskStatusFilter) {
        return false;
      }
      return true;
    });

    if (taskSortOrder === "asc") {
      filteredTasks.sort((a, b) => a.estimation.endDate - b.estimation.endDate);
    } else if (taskSortOrder === "desc") {
      filteredTasks.sort((a, b) => b.estimation.endDate - a.estimation.endDate);
    }

    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Search & Filters */}
        <div className="flex gap-2 shrink-0 pb-1">
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="w-full bg-muted border border-accent text-xs pl-8 pr-3 h-8 rounded-md outline-hidden focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground transition-all"
            />
          </div>
          <Select value={taskStatusFilter} onValueChange={setTaskStatusFilter}>
            <SelectTrigger size="sm" className="h-8 w-24 bg-muted border-accent text-[10px] capitalize text-left flex justify-between items-center cursor-pointer shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border border-accent bg-popover text-foreground! truncate text-[10px]!">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not started">Not Started</SelectItem>
              <SelectItem value="inprogress">In Progress</SelectItem>
              <SelectItem value="reviewing">Reviewing</SelectItem>
              <SelectItem value="testing">Testing</SelectItem>
            </SelectContent>
          </Select>

          <Select value={taskSortOrder} onValueChange={(val: any) => setTaskSortOrder(val)}>
            <SelectTrigger size="sm" className="h-8 w-26 bg-muted border-accent text-[10px] text-left flex justify-between items-center cursor-pointer shrink-0">
              <div className="flex items-center gap-1 min-w-0">
                <ArrowUpDown className="h-3.5 w-3.5 text-white/80 shrink-0" />
                <SelectValue placeholder="Sort" />
              </div>
            </SelectTrigger>
            <SelectContent className="border border-accent bg-popover text-foreground! text-[10px]!">
              <SelectItem value="none">Default </SelectItem>
              <SelectItem value="asc">
                <span className="flex items-center gap-1">
                  {/* <ArrowUp className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> */}
                  Low to High
                </span>
              </SelectItem>
              <SelectItem value="desc">
                <span className="flex items-center gap-1">
                  {/* <ArrowDown className="h-3.5 w-3.5 text-red-400 shrink-0" /> */}
                  High to Low
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground italic">
            No matching tasks found.
          </div>
        ) : (
          <div
            ref={taskScrollRef}
            className="grid grid-cols-1 gap-3 overflow-y-auto"
          >
            {filteredTasks.map((task) => {
              return (
                <div
                  key={task._id}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(
                      `/dashboard/my-projects/${slug}/workspace/tasks?task=${task._id}`,
                    );
                  }}
                  className={cn(
                    "bg-muted/40 hover:bg-muted/90 border border-accent border-l-4 p-4 rounded-md transition-colors cursor-pointer space-y-3",
                    taskBorderColors[task.status] || "border-l-slate-500"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs text-foreground truncate capitalize">
                        {task.title}
                      </span>
                      {/* {task.isBlocked && (
                        <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                      )} */}
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] text-white whitespace-nowrap">
                        {format(task.estimation.startDate, "MMM d")} - {format(task.estimation.endDate, "MMM d")}
                      </span>
                      {task.isBlocked ? (
                        <Bug className="w-3.5 h-3.5 text-red-500 mt-0.5" />
                      ) : (() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const endDate = new Date(task.estimation.endDate);
                        endDate.setHours(0, 0, 0, 0);
                        const diffTime = endDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays < 0) {
                          return (
                            <span className="text-[9px] font-medium text-red-400 mt-0.5">
                              Overdue by {Math.abs(diffDays)} {Math.abs(diffDays) === 1 ? "day" : "days"}
                            </span>
                          );
                        } else if (diffDays === 0) {
                          return (
                            <span className="text-[9px] font-medium text-yellow-400 mt-0.5">
                              Due today
                            </span>
                          );
                        } else {
                          return (
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              {diffDays} {diffDays === 1 ? "day" : "days"} left
                            </span>
                          );
                        }
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium capitalize px-2 py-1 rounded-md border border-accent bg-card/10! text-white/90 flex items-center gap-1.5">
                        {statusIconsNoColors[task.status] || <Ellipsis className="w-3.5 h-3.5" />}
                        {task.status}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground capitalize">
                        {priorityIcons[task.priority ?? "none"]}
                        {task.priority ?? "None"}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      {task.creator && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span>Created by:</span>
                          <Avatar className="w-5 h-5 border border-border">
                            {/* @ts-ignore */}
                            <AvatarImage src={task.creator.avatar} />
                            <AvatarFallback className="text-[9px]">
                              {task.creator.name?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      {task.assignees && task.assignees.length > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span>Assignee:</span>
                          <div className="flex items-center -space-x-1">
                            {task.assignees.map((assignee) => (
                              <Avatar key={assignee.userId} className="w-5 h-5 border border-background shadow-xs">
                                {/* @ts-ignore */}
                                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                <AvatarFallback className="text-[9px] font-semibold">
                                  {assignee.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center pt-1 pb-1 shrink-0">
          {hasMoreTasks ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTaskCursor((prev) => prev + 10)}
              className="text-[10px] text-muted-foreground hover:text-primary gap-1"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Load more
            </Button>
          ) : (
            <span className="text-[10px] text-muted-foreground font-medium italic">
              No more active tasks.
            </span>
          )}
        </div>
      </div>
    );
  };

  // ─── Issue list renderer ───
  const renderIssues = () => {
    if (!issuesResult && activeIssues.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (activeIssues.length === 0) return renderEmptyState("issues");

    const filteredIssues = activeIssues.filter((issue) => {
      if (issueSearch.trim() !== "") {
        const query = issueSearch.toLowerCase();
        const matchesTitle = issue.title?.toLowerCase().includes(query);
        const matchesDesc = issue.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      if (issueStatusFilter !== "all" && issue.status !== issueStatusFilter) {
        return false;
      }
      return true;
    });

    if (issueSortOrder === "asc") {
      filteredIssues.sort((a, b) => {
        const valA = a.due_date ?? Infinity;
        const valB = b.due_date ?? Infinity;
        return valA - valB;
      });
    } else if (issueSortOrder === "desc") {
      filteredIssues.sort((a, b) => {
        const valA = a.due_date ?? -Infinity;
        const valB = b.due_date ?? -Infinity;
        return valB - valA;
      });
    }

    return (
      <div className="flex flex-col h-full space-y-4">
        {/* Search & Filters */}
        <div className="flex gap-2 shrink-0 pb-1">
          <div className="relative flex items-center flex-1">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search issues..."
              value={issueSearch}
              onChange={(e) => setIssueSearch(e.target.value)}
              className="w-full bg-muted border border-accent text-xs pl-8 pr-3 h-8 rounded-md outline-hidden focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground/50 transition-all"
            />
          </div>
          <Select value={issueStatusFilter} onValueChange={setIssueStatusFilter}>
            <SelectTrigger size="sm" className="h-8 w-24 bg-muted border-accent text-[10px] capitalize text-left flex justify-between items-center cursor-pointer shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border border-accent bg-popover text-foreground! truncate text-[10px]!">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not opened">Not Opened</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="in review">In Review</SelectItem>
              <SelectItem value="reopened">Reopened</SelectItem>
            </SelectContent>
          </Select>

          <Select value={issueSortOrder} onValueChange={(val: any) => setIssueSortOrder(val)}>
            <SelectTrigger size="sm" className="h-8 w-24 bg-muted border-accent text-[10px] text-left flex justify-between items-center cursor-pointer shrink-0">
              <div className="flex items-center gap-1 min-w-0">
                <ArrowUpDown className="h-3.5 w-3.5 text-white/80 shrink-0" />
                <SelectValue placeholder="Sort" />
              </div>
            </SelectTrigger>
            <SelectContent className="border border-accent bg-popover text-foreground! text-[10px]!">
              <SelectItem value="none">Default</SelectItem>
              <SelectItem value="asc">
                <span className="flex items-center gap-1">
                  Low to High
                </span>
              </SelectItem>
              <SelectItem value="desc">
                <span className="flex items-center gap-1">
                  High to Low
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground italic">
            No matching issues found.
          </div>
        ) : (
          <div
            ref={issueScrollRef}
            className="grid grid-cols-1 gap-3 overflow-y-auto"
          >
            {filteredIssues.map((issue) => {
              return (
                <div
                  key={issue._id}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(
                      `/dashboard/my-projects/${slug}?issue=${issue._id}`,
                    );
                  }}
                  className="bg-muted/80 hover:bg-muted/90 border border-accent p-4 rounded-md transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Bug className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-semibold text-foreground truncate capitalize">
                        {issue.title}
                      </span>
                    </div>
                    {issue.due_date && (
                      <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                        Due: {format(issue.due_date, "MMM d")}
                      </span>
                    )}
                  </div>


                  <div className="flex items-center justify-between gap-2 pt-1 ">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium capitalize px-2 py-0.5 rounded-md border border-accent! bg-card/5 text-white/90 flex items-center gap-1.5">
                        {issueStatusIconsNoColors[issue.status] || <AlertCircle className="w-3.5 h-3.5" />}
                        {issue.status}
                      </span>
                      {issue.severity && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded ",
                          issue.severity === "low" && "bg-blue-600/20 text-white",
                          issue.severity === "medium" && "bg-yellow-600/20 text-white",
                          // @ts-ignore
                          (issue.severity === "critical" || issue.severity === "high") && "bg-red-600/20 text-white"
                        )}>
                          severity: {issue.severity}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                      {issue.creator && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span>Created by:</span>
                          <Avatar className="w-5 h-5 border border-border">
                            {/* @ts-ignore */}
                            <AvatarImage src={issue.creator.avatar} />
                            <AvatarFallback className="text-[9px]">
                              {issue.creator.name?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      {issue.assignees && issue.assignees.length > 0 && (
                        <div className="flex items-center gap-1 shrink-0">
                          <span>Assignee:</span>
                          <div className="flex items-center -space-x-1">
                            {issue.assignees.map((assignee) => (
                              <Avatar key={assignee.userId} className="w-5 h-5 border border-background shadow-xs">
                                {/* @ts-ignore */}
                                <AvatarImage src={assignee.avatar} alt={assignee.name} />
                                <AvatarFallback className="text-[9px] font-semibold">
                                  {assignee.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center pt-1 pb-1 shrink-0">
          {hasMoreIssues ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIssueCursor((prev) => prev + 10)}
              className="text-[10px] text-muted-foreground hover:text-primary gap-1"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Load more
            </Button>
          ) : (
            <span className="text-[10px] text-muted-foreground font-medium italic">
              No more active issues.
            </span>
          )}
        </div>
      </div>
    );
  };

  // ─── Ticket list renderer ───
  const renderTickets = () => {
    if (!ticketsResult && activeTickets.length === 0) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (activeTickets.length === 0) return renderEmptyState("tickets");

    return (
      <div className="flex flex-col h-full space-y-4">
        <div
          ref={ticketScrollRef}
          className="grid grid-cols-1 gap-3 overflow-y-auto"
        >
          {activeTickets.map((ticket) => {
            return (
              <div
                key={ticket._id}
                onClick={() => {
                  setIsOpen(false);
                  router.push(`/dashboard/my-projects/${slug}/workspace`);
                }}
                className="bg-muted/80 hover:bg-muted/90 border border-accent p-4 rounded-md transition-colors cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed break-words flex-1">
                    {ticket.body}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">
                    {format(new Date(ticket.createdAt), "MMM d, h:mm a")}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-accent/20">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {ticket.status}
                  </span>

                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {ticket.assignee && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span>Assignee:</span>
                        <Avatar className="w-4 h-4 border border-border">
                          <AvatarImage src={ticket.assignee.avatar} />
                          <AvatarFallback className="text-[7px]">
                            {ticket.assignee.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                    {ticket.creator && (
                      <div className="flex items-center gap-1 shrink-0">
                        <span>Creator:</span>
                        <Avatar className="w-4 h-4 border border-border">
                          <AvatarImage src={ticket.creator.avatar} />
                          <AvatarFallback className="text-[7px]">
                            {ticket.creator.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-1 pb-1 shrink-0">
          {hasMoreTickets ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTicketCursor((prev) => prev + 10)}
              className="text-[10px] text-muted-foreground hover:text-primary gap-1"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              Load more
            </Button>
          ) : (
            <span className="text-[10px] text-muted-foreground font-medium italic">
              No more open tickets.
            </span>
          )}
        </div>
      </div>
    );
  };

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg border-l border-accent dark:bg-sidebar bg-sidebar text-foreground p-0 flex flex-col h-full"
      >
        {/* Header Section */}
        <div className="p-6 border-b border-accent/60 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
              <BriefcaseBusiness className="w-5 h-5 text-primary" />
              Have a Look at your work, <span className="text-primary truncate capitalize">{userName}</span> !
            </h2>
            <p className="text-base text-muted-foreground leading-normal">
              Manage all your work from here...
            </p>
          </div>

          <div className="flex items-center justify-between w-full mt-2">
            {formattedDateTime && (
              <p className="text-sm text-primary flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                <CalendarDays className="w-4 h-4" />
                {formattedDateTime}
              </p>
            )}
            <Button
              onClick={toggleKaya}
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-linear-to-br from-transparent to-indigo-500 border-accent! font-sans font-medium shrink-0"
            >
              <Image src="/kaya.svg" alt="kaya" width={16} height={16} className="mr-1.5 shrink-0" />
              Ask for Standup
            </Button>
          </div>

          {/* Tabs List covering full space below the button */}
          <div className="grid grid-cols-3 mt-4 gap-1 border border-accent bg-muted p-0.5 rounded-sm w-full">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-1 text-[11px] py-1.5 rounded font-medium transition-all duration-200 cursor-pointer w-full",
                  activeTab === tab.id
                    ? "bg-sidebar text-primary "
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable List Container */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
            {renderTabContent()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
