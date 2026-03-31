import { useState, useMemo, useEffect } from "react";
import {
  addDays,
  differenceInDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
  format,
  getDay,
  isToday,
  isSameDay,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChartNoAxesGantt,
  ChevronDown,
  ClipboardList,
  Clock,
  Filter,
  Layers,
  Layers2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statusIcons, priorityIcons } from "@/lib/static-store";
import { Task } from "@/types/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, User } from "lucide-react";
import { Layer } from "recharts";

/** Major tick + label every N days (all slabs, day view). */
export const TIMELINE_DAY_TICK_INTERVAL = 3;

export type TimelineView = "day" | "week" | "month";

export interface TimelineConfig {
  startDate: Date;
  endDate: Date;
  /** Calendar day of the delivery deadline (for markers). */
  deadlineDate: Date;
  totalDays: number;
  slab: 1 | 2 | 3;
  defaultView: TimelineView;
  availableViews: TimelineView[];
  tickDays: number;
}

/** Slab from creation→deadline; visible range ends 3 days after deadline for layout breathing room. */
export const useTimelineConfig = (
  projectCreatedAt: string | number | Date | undefined,
  projectDeadline: string | number | Date | undefined,
): TimelineConfig | null => {
  return useMemo(() => {
    if (projectCreatedAt == null || !projectDeadline) return null;

    const startDate = startOfDay(new Date(projectCreatedAt));
    const deadline = new Date(projectDeadline);
    const deadlineDate = startOfDay(deadline);
    const deadlineEnd = endOfDay(deadline);
    const endDate = endOfDay(addDays(deadline, 5));

    const slabSpanDays = Math.max(1, differenceInDays(deadlineEnd, startDate));
    const totalDays = Math.max(1, differenceInDays(endDate, startDate));

    let slab: 1 | 2 | 3 = 1;
    let defaultView: TimelineView = "day";
    let availableViews: TimelineView[] = ["day"];

    if (slabSpanDays < 90) {
      slab = 1;
      defaultView = "day";
      availableViews = ["day", "week"];
    } else if (slabSpanDays < 180) {
      slab = 2;
      defaultView = "day";
      availableViews = ["day", "week"];
    } else {
      slab = 3;
      defaultView = "week";
      availableViews = ["week", "month"];
    }

    return {
      startDate,
      endDate,
      deadlineDate,
      totalDays,
      slab,
      defaultView,
      availableViews,
      // For tight timelines, show denser tick labels.
      tickDays: slabSpanDays < 45 ? 2 : TIMELINE_DAY_TICK_INTERVAL,
    };
  }, [projectCreatedAt, projectDeadline]);
};

interface ProjectTimelineProps {
  tasks?: Task[] | undefined;
  projectCreatedAt: string | number | Date | undefined;
  projectDeadline: string | number | Date | undefined;
}

const DAY_COL_MIN_PX = 14;
const TRACK_MIN_PX = 900;
const WEEK_COL_MIN_PX = 92;

// WEEKLY FUNCTION
function TimelineWeekAxis({
  config,
  tasks,
  statusFilter,
}: {
  config: TimelineConfig;
  tasks?: Task[];
  statusFilter: string;
}) {
  const weekStartsOnMonday = 1;

  const weeks = useMemo(() => {
    const start = startOfWeek(startOfDay(config.startDate), {
      weekStartsOn: weekStartsOnMonday,
    });
    const end = startOfWeek(startOfDay(config.endDate), {
      weekStartsOn: weekStartsOnMonday,
    });
    return eachWeekOfInterval({ start, end });
  }, [config.startDate, config.endDate]);

  const naturalWidth = weeks.length * WEEK_COL_MIN_PX;
  const trackWidth = Math.max(TRACK_MIN_PX, naturalWidth);
  const columnWidth = trackWidth / Math.max(1, weeks.length);

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <div
        className="relative flex h-full min-h-[360px] max-h-[400px]  w-full min-w-[900px] max-w-[900px]"
        style={{ width: trackWidth }}
        aria-label="Timeline weeks"
      >
        {weeks.map((weekStart, i) => {
          const weekEnd = endOfWeek(weekStart, {
            weekStartsOn: weekStartsOnMonday,
          });
          const weekend = false; // keep week columns visually neutral

          const prevWeek = i > 0 ? weeks[i - 1] : undefined;
          const showMonthLabel =
            i === 0 ||
            !prevWeek ||
            weekStart.getMonth() !== prevWeek.getMonth() ||
            weekStart.getFullYear() !== prevWeek.getFullYear();

          const today = new Date();
          const todayStart = startOfDay(today);
          const containsToday =
            todayStart >= weekStart && todayStart <= weekEnd;

          const containsDeadline =
            config.deadlineDate >= weekStart && config.deadlineDate <= weekEnd;

          return (
            <div
              key={weekStart.toISOString()}
              style={{ width: columnWidth }}
              className={cn(
                "relative shrink-0 border-l border-border/40 first:border-l-0",
                weekend && "bg-muted/10",
              )}
            >
              {/* TODAY */}
              {containsToday && (
                <div
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-[50] w-[2px] -translate-x-1/2 bg-primary/95 ring-1 ring-primary/30 shadow-[0_0_14px_hsl(var(--primary)/0.45)]"
                  aria-hidden
                />
              )}

              {/* DEADLINE */}
              {containsDeadline && (
                <div
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-[50] w-[2px] -translate-x-1/2 bg-red-500/95 ring-1 ring-red-500/30 shadow-[0_0_12px_rgba(245,158,11,0.45)]"
                  aria-hidden
                />
              )}

              <div className="flex h-full min-h-[200px] flex-col">
                <div className="relative flex shrink-0 flex-col items-center border-b border-border/40 bg-muted/5 pb-2 pt-1">
                  {containsDeadline && (
                    <span className="mb-1 rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 ring-1 ring-red-500/15">
                      Deadline
                    </span>
                  )}

                  {/* Week label */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-px rounded-full bg-accent",
                        showMonthLabel ? "h-6 bg-blue-600" : "h-4",
                      )}
                    />
                    <span
                      className={cn(
                        "mt-1.5 text-center text-[10px] font-medium leading-none text-muted-foreground tabular-nums",
                        showMonthLabel && "text-foreground/80",
                        containsDeadline &&
                          "font-semibold text-amber-700 dark:text-amber-300",
                      )}
                    >
                      {showMonthLabel
                        ? format(weekStart, "MMM d")
                        : format(weekStart, "d")}
                    </span>
                  </div>
                </div>

                <div className="min-h-[72px] flex-1" />
              </div>
            </div>
          );
        })}

        {/* Task Slabs */}
        <div className="absolute top-[86px] left-0 right-0 z-50 flex flex-col gap-2.5 p-2 px-1 pointer-events-none">
          {tasks?.map((task) => {
            const start = startOfDay(new Date(task.estimation.startDate));
            const end = startOfDay(new Date(task.estimation.endDate));

            // Grid start date for offset calculation
            const gridStart = startOfWeek(startOfDay(config.startDate), {
              weekStartsOn: weekStartsOnMonday,
            });
            const gridEnd = endOfWeek(startOfDay(config.endDate), {
              weekStartsOn: weekStartsOnMonday,
            });

            if (end < gridStart || start > gridEnd) return null;

            const displayStart = start < gridStart ? gridStart : start;
            const displayEnd = end > gridEnd ? gridEnd : end;

            // Positioning is based on weeks (7 days per column)
            const startOffsetDays = differenceInDays(displayStart, gridStart);
            const durationDays = differenceInDays(displayEnd, displayStart) + 1;
            const actualDurationDays = differenceInDays(end, start) + 1;

            const left = (startOffsetDays / 7) * columnWidth;
            const width = (durationDays / 7) * columnWidth + 30;

            // Width thresholds for UI
            const isWide = width >= 180;
            const isMed = width >= 80;

            const assignees = task.assignedTo ?? [];

            const getTaskColor = (t: Task) => {
              const today = startOfDay(new Date());
              const endTask = startOfDay(new Date(t.estimation.endDate));
              const daysLeft = differenceInDays(endTask, today);
              if (daysLeft < 0)
                return "bg-red-500 border-primary/70 text-white";
              if (daysLeft <= 3)
                return "bg-orange-500 border-primary/70 text-white";
              return "bg-primary border-primary/50 text-primary-foreground";
            };

            const colorClasses = getTaskColor(task);

            return (
              <div
                key={task._id}
                className="relative h-7 pointer-events-auto flex items-center"
              >
                <div
                  className={cn(
                    "absolute h-full rounded border flex items-center px-2.5 shadow-md group transition-colors",
                    colorClasses,
                  )}
                  style={{ left, width }}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden w-full">
                    {isWide && <ClipboardList size={12} className="shrink-0" />}
                    <span className="text-[11px] font-medium capitalize truncate leading-none flex-1">
                      {task.title}
                    </span>
                    {isMed && (
                      <span className="text-[10px] opacity-90 font-mono shrink-0">
                        {actualDurationDays}d
                      </span>
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-0 mb-2 z-50 hidden group-hover:flex flex-col gap-1.5 bg-popover border border-border rounded-lg shadow-xl p-2.5 pointer-events-none min-w-[180px]">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Layers2 size={11} className="shrink-0" />
                      <span className="text-[11px] font-semibold">
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-primary">
                      <Clock className="w-3 h-3" />
                      <span>
                        {format(task.estimation.startDate, "MMM d")} -{" "}
                        {format(task.estimation.endDate, "MMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap pt-0.5 border-t border-border/50">
                      {assignees.length === 0 ? (
                        <span className="text-[10px] text-muted-foreground/50">
                          No assignees
                        </span>
                      ) : (
                        assignees.map((a, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="h-3.5 w-3.5 rounded-full bg-muted overflow-hidden border border-border">
                              {a.avatar ? (
                                <img
                                  src={a.avatar}
                                  alt={a.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-accent text-[7px] font-bold uppercase">
                                  {a.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {a.name}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// DAILY FUNCTION
function TimelineDayAxis({
  config,
  tasks,
  statusFilter,
  dayInterval,
}: {
  config: TimelineConfig;
  tasks?: Task[];
  statusFilter: string;
  dayInterval: number;
}) {
  const tick = dayInterval;

  const days = useMemo(() => {
    const start = startOfDay(config.startDate);
    const end = startOfDay(config.endDate);
    return eachDayOfInterval({ start, end });
  }, [config.startDate, config.endDate]);

  // Adjust column width based on the interval for "stretching"
  const colMinWidth = dayInterval === 2 ? 22 : dayInterval === 3 ? 18 : 14;
  const naturalWidth = days.length * colMinWidth;
  const trackWidth = Math.max(TRACK_MIN_PX, naturalWidth);
  const columnWidth = trackWidth / days.length;

  return (
    <div className="w-full min-w-0 overflow-x-auto dark:bg-card">
      <div
        className="relative flex h-full min-h-[360px] max-h-[400px]  w-full min-w-[900px] max-w-[900px]"
        style={{ width: trackWidth }}
        aria-label={`Timeline from ${format(days[0]!, "PPP")} to ${format(days[days.length - 1]!, "PPP")}, one column per day`}
      >
        {days.map((day, i) => {
          const dow = getDay(day);
          const weekend = dow === 0 || dow === 6;
          const isMajorTick = i % tick === 0;
          const prevMajor = i >= tick ? days[i - tick] : undefined;
          const showMonth =
            isMajorTick &&
            (i === 0 ||
              !prevMajor ||
              day.getMonth() !== prevMajor.getMonth() ||
              day.getFullYear() !== prevMajor.getFullYear());
          const isDeadline = isSameDay(day, config.deadlineDate);

          return (
            <div
              key={day.toISOString()}
              style={{ width: columnWidth }}
              className={cn(
                "relative shrink-0 border-l border-border/40 first:border-l-0",
                weekend && "bg-muted/10",
              )}
            >
              {/* TODAY  */}
              {isToday(day) && (
                <div
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-primary/60 shadow-[0_0_12px_hsl(var(--primary)/0.35)]"
                  aria-hidden
                />
              )}
              {/* DEADLINE  */}
              {isDeadline && (
                <div
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-px -translate-x-1/2 bg-red-500 shadow-[0_0_10px_rgba(245,158,11,0.45)]"
                  aria-hidden
                />
              )}
              <div className="flex h-full min-h-[200px] flex-col">
                <div className="relative flex shrink-0 flex-col items-center border-b border-border/40 bg-muted/5 pb-2 pt-1">
                  {isDeadline && (
                    <span className="mb-1 rounded bg-red-500/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
                      Deadline
                    </span>
                  )}
                  {isMajorTick && (
                    <>
                      <div
                        className={cn(
                          "w-px rounded-full bg-accent",
                          showMonth ? "h-6 bg-blue-600" : "h-4",
                        )}
                      />
                      <span
                        className={cn(
                          "mt-1.5 text-center text-[10px] font-medium leading-none text-muted-foreground tabular-nums",
                          showMonth && "text-foreground/80",
                          isDeadline && "font-semibold text-amber-700",
                        )}
                      >
                        {showMonth ? format(day, "MMM d") : format(day, "d")}
                      </span>
                    </>
                  )}
                </div>
                <div className="min-h-[72px] flex-1" />
              </div>
            </div>
          );
        })}

        {/* Task Slabs */}
        <div className="absolute top-[70px] left-0 right-0 z-50 flex flex-col gap-2.5 p-2 px-1 pointer-events-none">
          {tasks?.map((task) => {
            const start = startOfDay(new Date(task.estimation.startDate));
            const end = startOfDay(new Date(task.estimation.endDate));

            if (end < config.startDate || start > config.endDate) return null;

            const displayStart =
              start < config.startDate ? config.startDate : start;
            const displayEnd = end > config.endDate ? config.endDate : end;

            const startOffsetDays = Math.max(
              0,
              differenceInDays(displayStart, config.startDate),
            );
            const durationDays = Math.max(
              1,
              differenceInDays(displayEnd, displayStart) + 1,
            );
            const actualDurationDays = differenceInDays(end, start) + 1;

            const left = startOffsetDays * columnWidth;
            const width = Math.max(durationDays * columnWidth, 90);

            // Width thresholds
            const isWide = width >= 180; // show icon + avatars + title + duration
            const isMed = width >= 90; // show title + duration only

            const assignees = task.assignedTo ?? [];

            const getTaskColor = (t: Task) => {
              const today = startOfDay(new Date());
              const endTask = startOfDay(new Date(t.estimation.endDate));
              const daysLeft = differenceInDays(endTask, today);
              if (daysLeft < 0)
                return "bg-red-500 border-primary/70 text-white";
              if (daysLeft <= 2)
                return "bg-orange-500 border-primary/70 text-white";
              return "bg-primary border-primary/50 text-primary-foreground ";
            };

            const colorClasses = getTaskColor(task);

            return (
              <div
                key={task._id}
                className="relative h-7 pointer-events-auto flex items-center"
              >
                {/* Bar — group is ON the bar itself, not the outer wrapper */}
                <div
                  className={cn(
                    "absolute h-full rounded border flex items-center px-2.5 shadow-md group transition-colors",
                    colorClasses,
                  )}
                  style={{ left, width }}
                >
                  <div className="flex items-center gap-1.5 overflow-hidden w-full">
                    {/* Icon — only when wide */}
                    {isWide && <ClipboardList size={12} className="shrink-0" />}

                    {/* Title */}
                    <span className="text-[11px] font-medium capitalize truncate leading-none flex-1">
                      {task.title}
                    </span>

                    {/* Duration */}
                    {isMed && (
                      <span className="text-[10px] opacity-90 font-mono shrink-0">
                        {actualDurationDays}d
                      </span>
                    )}

                    {/* Stacked Avatars — only when wide */}
                    {isWide && (
                      <div className="flex items-center shrink-0 -space-x-1.5">
                        {assignees.length === 0 ? (
                          <span className="text-[10px] opacity-40 font-mono">
                            —
                          </span>
                        ) : (
                          assignees.slice(0, 3).map((a, i) => (
                            <div
                              key={i}
                              className="h-4 w-4 rounded-full border border-current bg-muted overflow-hidden shrink-0"
                              style={{ zIndex: 10 - i }}
                            >
                              {a.avatar ? (
                                <img
                                  src={a.avatar}
                                  alt={a.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-accent text-[8px] font-bold text-foreground uppercase">
                                  {a.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tooltip — group is on bar */}
                  <div className="absolute bottom-full left-0 mb-2 z-50 hidden group-hover:flex flex-col gap-1.5 bg-popover border border-border rounded-lg shadow-xl p-2.5 pointer-events-none min-w-[220px]">
                    <div className="flex items-center gap-1.5 text-primary">
                      <Layers2 size={11} className=" shrink-0" />
                      <span className="text-[11px] font-semibold ">
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-primary">
                      <Clock className="w-3 h-3" />
                      {task.estimation ? (
                        <span>
                          {format(task.estimation.startDate, "MMM d")} -{" "}
                          {format(task.estimation.endDate, "MMM d")}
                        </span>
                      ) : (
                        "No date"
                      )}
                    </div>

                    {/* Assignees in tooltip */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5 border-t border-border/50">
                      {assignees.length === 0 ? (
                        <span className="text-[10px] text-muted-foreground/50">
                          No assignees
                        </span>
                      ) : (
                        assignees.map((a, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div className="h-3.5 w-3.5 rounded-full bg-muted overflow-hidden border border-border">
                              {a.avatar ? (
                                <img
                                  src={a.avatar}
                                  alt={a.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-accent text-[7px] font-bold uppercase">
                                  {a.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {a.name}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const ProjectTimeline = ({
  tasks,
  projectCreatedAt,
  projectDeadline,
}: ProjectTimelineProps) => {
  const config = useTimelineConfig(projectCreatedAt, projectDeadline);
  const [userView, setUserView] = useState<TimelineView | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("not started");
  const [dayInterval, setDayInterval] = useState<number>(3);

  useEffect(() => {
    setUserView(null);
  }, [projectCreatedAt, projectDeadline]);

  if (!config) return null;

  const activeView = userView ?? config.defaultView;

  // Simple normalization for comparing statuses
  const normalizeStatus = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "");

  const filteredTasks = (tasks ?? []).filter((task) => {
    const taskStatus = normalizeStatus(task.status ?? "");
    const currentFilter = normalizeStatus(statusFilter);
    return taskStatus === currentFilter;
  });

  return (
    <div className="w-full bg-sidebar border rounded-lg overflow-hidden shadow-sm ">
      {config.availableViews.length > 0 && (
        <div className="flex items-center justify-between p-2.5 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary border rounded-md">
              <ChartNoAxesGantt className="w-4 h-4 text-primary-foreground" />
            </div>
            <h3 className="text-sm font-medium">Project Time Logs</h3>
            <span className="ml-2 rounded-full bg-muted border px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              Task Count: {filteredTasks.length}
            </span>
          </div>
          {/* EXTRA SETTINGS */}

          <div className="flex items-center gap-4">
            {/* Red — hard overdue (end date already passed) */}
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
              <span className="text-xs font-light">Overdue</span>
            </div>

            {/* Amber — at risk (ending within next 1 days) */}
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
              <span className="text-xs font-light">At Risk</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="xs"
                  className="h-7 gap-2 px-2 text-[10px] font-medium capitalize"
                >
                  {statusIcons[statusFilter] || (
                    <Filter className="w-3 h-3 text-muted-foreground" />
                  )}
                  <span>
                    {statusFilter === "inprogress"
                      ? "In Progress"
                      : statusFilter}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Filter by Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(statusIcons)
                  .filter(([status]) =>
                    [
                      "not started",
                      "inprogress",
                      "reviewing",
                      "testing",
                    ].includes(status),
                  )
                  .map(([status, icon]) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className="text-xs gap-2"
                    >
                      {icon}
                      <span className="capitalize">
                        {status === "inprogress" ? "In Progress" : status}
                      </span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex bg-muted border p-1 rounded-md">
              {config.availableViews.map((view) => (
                <Button
                  key={view}
                  onClick={() => setUserView(view)}
                  variant={activeView === view ? "default" : "ghost"}
                  size="xs"
                  className={cn(
                    "px-4 capitalize text-[10px]",
                    activeView === view && "",
                  )}
                >
                  {view === "day" ? "Days" : view}
                </Button>
              ))}
            </div>

            {activeView === "day" ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-7 gap-2 px-2 text-[10px] font-medium"
                  >
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{dayInterval}d Tick</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[120px]">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Grid Interval
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[2, 3, 5].map((val) => (
                    <DropdownMenuItem
                      key={val}
                      onClick={() => setDayInterval(val)}
                      className="text-xs gap-2"
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          dayInterval === val ? "bg-primary" : "bg-transparent",
                        )}
                      />
                      <span>{val} Days</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="xs"
                    className="h-7 gap-2 px-2 text-[10px] font-medium pointer-events-none opacity-30"
                  >
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span>{dayInterval}d Tick</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[120px]">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Grid Interval
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {[2, 3, 5].map((val) => (
                    <DropdownMenuItem
                      key={val}
                      onClick={() => setDayInterval(val)}
                      className="text-xs gap-2"
                    >
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          dayInterval === val ? "bg-primary" : "bg-transparent",
                        )}
                      />
                      <span>{val} Days</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      <div className=" p-4">
        {activeView === "day" ? (
          <TimelineDayAxis
            config={config}
            tasks={filteredTasks}
            statusFilter={statusFilter}
            dayInterval={dayInterval}
          />
        ) : activeView === "week" ? (
          <TimelineWeekAxis
            config={config}
            tasks={filteredTasks}
            statusFilter={statusFilter}
          />
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 text-sm text-muted-foreground">
            {activeView} view — coming soon
          </div>
        )}
      </div>
    </div>
  );
};
