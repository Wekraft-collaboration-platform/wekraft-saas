import { useState, useMemo, useEffect } from "react";
import {
  addDays,
  differenceInDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
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
  AlertCircle,
  AlertTriangle,
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
import { ViewTransition } from "react";

/** Major tick + label every N days (all slabs, day view). */
export const TIMELINE_DAY_TICK_INTERVAL = 3;

export interface TimelineConfig {
  startDate: Date;
  endDate: Date;
  /** Calendar day of the delivery deadline (for markers). */
  deadlineDate: Date;
  totalDays: number;
  slab: 1 | 2 | 3;
  allowedTicks: number[];
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
    let allowedTicks: number[] = [2, 3, 5];

    if (slabSpanDays <= 90) {
      // 3 months or less
      slab = 1;
      allowedTicks = [2, 3, 5];
    } else if (slabSpanDays <= 180) {
      // more than 3 months but <= 6 months
      slab = 2;
      allowedTicks = [3, 5, 10];
    } else {
      // more than 6 months
      slab = 3;
      allowedTicks = [5, 10];
    }

    return {
      startDate,
      endDate,
      deadlineDate,
      totalDays,
      slab,
      allowedTicks,
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



// -------------------DAILY FUNCTION--------------------------
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
  const columnWidthPercentage = 100 / days.length;

  return (
    <div className="w-full min-w-0 overflow-x-auto dark:bg-card">
      <div
        className="relative flex h-full min-h-[440px] max-h-[500px] w-full pl-0.5"
        style={{ width: `max(${trackWidth}px, 100%)` }}
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
              style={{ width: `${columnWidthPercentage}%` }}
              className={cn(
                "relative shrink-0 border-l dark:border-border/70 border-border first:border-l-0",
                weekend && "dark:bg-muted/35 bg-accent/50",
              )}
            >
              {/* TODAY  */}
              {isToday(day) && (
                <div
                  className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-primary/70 shadow-[0_0_12px_hsl(var(--primary)/0.45)]"
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
                          "mt-1.5 text-center text-[10px] font-medium leading-none text-primary/80 tabular-nums",
                          showMonth && "text-primary",
                          isDeadline && "font-semibold text-rose-600",
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
        <div className="absolute top-[75px] left-1 right-0 z-50 flex flex-col gap-2.5 p-2 px-1 pointer-events-none">
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

            const left = `${(startOffsetDays / days.length) * 100}%`;
            const width = `max(${(durationDays / days.length) * 100}%, 140px)`;

            const baseWidth = (durationDays / days.length) * trackWidth;

            const assignees = task.assignees ?? [];

            const getTaskUI = (t: Task) => {
              const today = startOfDay(new Date());
              const endTask = startOfDay(new Date(t.estimation.endDate));
              const daysLeft = differenceInDays(endTask, today);

              if (daysLeft < 0) {
                return {
                  barClass:
                    "dark:bg-accent bg-neutral-800 border border-primary/10 text-white  shadow-[0_2px_10px_-3px_rgba(239,68,68,0.2)]",
                  icon: <AlertTriangle size={14} className="" />,
                  iconBg: "bg-red-500",
                };
              }
              if (daysLeft <= 2) {
                return {
                  barClass:
                    "dark:bg-accent bg-neutral-800  border border-primary/10  text-white dark:text-primary shadow-[0_2px_10px_-3px_rgba(234,179,8,0.2)]",
                  icon: <AlertCircle size={14} className="text-white" />,
                  iconBg: "bg-amber-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]",
                };
              }
              return {
                barClass:
                  "dark:bg-accent bg-neutral-800  border border-primary/10  text-white dark:text-zinc-200 shadow-sm",
                icon: <ClipboardList size={14} className="text-black" />,
                iconBg: "dark:bg-primary bg-white",
              };
            };

            const taskUI = getTaskUI(task);

            // Use rendered width for visibility checks
            const renderedWidth = Math.max(baseWidth, 140);
            const isWide = renderedWidth >= 180;
            const isMed = renderedWidth >= 100;

            return (
              <div
                key={task._id}
                className="relative h-8 pointer-events-auto flex items-center"
              >
                {/* Bar — group is ON the bar itself, not the outer wrapper */}
                <div
                  className={cn(
                    "absolute h-8 rounded-full border flex items-center pl-1 pr-3 shadow-sm group transition-all hover:shadow-md hover:scale-[1.01] backdrop-blur-sm",
                    taskUI.barClass,
                  )}
                  style={{ left, width }}
                >
                  <div className="flex items-center gap-2 overflow-hidden w-full">
                    {/* Circular Icon at Start */}
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                        taskUI.iconBg,
                      )}
                    >
                      {taskUI.icon}
                    </div>

                    {/* Title */}
                    <span className="text-[11px] font-inter capitalize truncate leading-none flex-1">
                      {task.title}
                    </span>

                    {/* Duration */}
                    {isMed && (
                      <span className="text-[10px] font-bold text-black dark:text-white  bg-muted px-1.5 py-0.5 rounded-full shrink-0 tabular-nums">
                        {actualDurationDays}d
                      </span>
                    )}

                    {/* Stacked Avatars */}
                    {isWide && (
                      <div className="flex items-center shrink-0 -space-x-1.5 ml-1">
                        {assignees.length === 0 ? (
                          <span className="text-[10px] opacity-40 font-mono">
                            —
                          </span>
                        ) : (
                          assignees.slice(0, 3).map((a, i) => (
                            <div
                              key={i}
                              className="h-6 w-6 rounded-full border-2 border-background bg-muted overflow-hidden shrink-0 shadow-sm"
                              style={{ zIndex: 10 - i }}
                            >
                              {a.avatar ? (
                                <img
                                  src={a.avatar}
                                  alt={a.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-accent text-[7px] font-bold text-foreground uppercase">
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
  const [statusFilter, setStatusFilter] = useState<string>("not started");
  const [dayInterval, setDayInterval] = useState<number>(3);

  useEffect(() => {
    if (config && !config.allowedTicks.includes(dayInterval)) {
      setDayInterval(config.allowedTicks[0]);
    }
  }, [config, dayInterval]);

  if (!config) return null;



  // Simple normalization for comparing statuses
  const normalizeStatus = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "");

  const filteredTasks = (tasks ?? []).filter((task) => {
    const taskStatus = normalizeStatus(task.status ?? "");
    const currentFilter = normalizeStatus(statusFilter);
    return taskStatus === currentFilter;
  });

  // MAIN TIMELINE COMPONENT
  return (
    <div className="w-full bg-sidebar border rounded-lg overflow-hidden shadow-sm ">
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
                  {statusFilter === "inprogress" ? "In Progress" : statusFilter}
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
                  ["not started", "inprogress", "reviewing", "testing"].includes(
                    status,
                  ),
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
              {config.allowedTicks.map((val) => (
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
        </div>
      </div>

      <div className="p-4">
        <TimelineDayAxis
          config={config}
          tasks={filteredTasks}
          statusFilter={statusFilter}
          dayInterval={dayInterval}
        />
      </div>

      {/* FOOTER - BOUNDARY INFO */}
      <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/10 text-[11px] font-medium text-muted-foreground/80">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground -mt-0.5" />
          <span className="font-medium tracking-wider">Project Start:</span>
          <span className="text-foreground">
            {format(config.startDate, "MMM d, yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
          <span className="font-medium tracking-wider">Deadline:</span>
          <span className="text-foreground">
            {format(config.deadlineDate, "MMM d, yyyy")}
          </span>
        </div>
      </div>
    </div>
  );
};
