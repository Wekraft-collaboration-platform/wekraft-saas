"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ChevronDown, Clock, FolderKanban, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

async function fetchDeadlines(refresh = false) {
  const url = refresh
    ? "/api/dashboard/upcoming-cards?refresh=true"
    : "/api/dashboard/upcoming-cards";
  const res = await fetch(url, { cache: "no-store" });
  const d = await res.json();
  return d.deadlines || [];
}

function daysUntil(ts: number): number {
  return Math.ceil((ts - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Sparkline({ id, daysLeft }: { id: string; daysLeft: number }) {
  // Generate a deterministic wave path
  const numPoints = 12;
  const width = 60;
  const height = 18;
  const points = [];

  // Hash function to make waves look different per project
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (let i = 0; i < numPoints; i++) {
    const x = (i / (numPoints - 1)) * width;
    // Generate some fluctuation
    const noise = Math.sin(i * 1.5 + Math.abs((hash >> i) % 10)) * 4;
    // Make line end higher or lower based on urgency
    const trend = (i / (numPoints - 1)) * (daysLeft * 1.5 - 5);
    const y = height / 2 + noise + trend;
    const clampedY = Math.max(2, Math.min(height - 2, y));
    points.push(`${x.toFixed(1)},${clampedY.toFixed(1)}`);
  }

  const d = `M ${points.join(" L ")}`;

  // Color of the line based on urgency
  const isUrgent = daysLeft <= 2;
  const isWarning = daysLeft <= 4;

  // Tailwind color classes for stroke
  const strokeColor = isUrgent
    ? "stroke-rose-500"
    : isWarning
      ? "stroke-amber-500"
      : "stroke-blue-500 dark:stroke-blue-400";

  return (
    <svg width={width} height={height} className="shrink-0">
      <path
        d={d}
        fill="none"
        className={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface UpcomingDeadlinesProps {
  deadlines: any[] | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function UpcomingDeadlines({
  deadlines,
  loading,
  refreshing,
  onRefresh,
}: UpcomingDeadlinesProps) {
  const router = useRouter();
  const [selectedWeeks, setSelectedWeeks] = useState(1);
  const now = Date.now();
  const threshold = now + selectedWeeks * 7 * 24 * 60 * 60 * 1000;
  const filteredDeadlines = deadlines
    ? deadlines.filter((p) => p.targetDate >= now && p.targetDate <= threshold)
    : [];

  return (
    <div className="flex-1 flex flex-col rounded-lg border border-border bg-card dark:bg-sidebar shadow-sm overflow-hidden h-1/2 min-h-0">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border bg-muted shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalendarClock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium ">
            Upcoming Deadlines
          </h3>
        </div>

        <div className="flex items-center gap-2.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="text-[10px]  h-6 font-medium text-primary bg-accent! hover:bg-sidebar px-2.5 py-0.5 rounded-md cursor-pointer transition-colors shadow-none flex items-center gap-1"
              >
                <span>{selectedWeeks === 1 ? "1 Week" : `${selectedWeeks} Weeks`}</span>
                <ChevronDown className="h-3 w-3 opacity-80 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-popover border border-border text-foreground">
              <DropdownMenuItem onClick={() => setSelectedWeeks(1)} className="cursor-pointer text-xs">
                1 Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedWeeks(2)} className="cursor-pointer text-xs">
                2 Weeks
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedWeeks(3)} className="cursor-pointer text-xs">
                3 Weeks
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="icon-xs"
            variant="outline"
            onClick={onRefresh}
            disabled={refreshing}
            className="bg-accent!"
            title="Refresh deadlines"
          >
            <RefreshCwIcon
              className={cn(
                "h-3 w-3 ",
                refreshing && "animate-spin"
              )}
            />
          </Button>
        </div>

      </div>

      {/* Body - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-border">
        {loading ? (
          // Loading skeleton
          <div className="flex flex-col divide-y divide-border/10">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 animate-pulse">
                <div className="h-7 w-7 rounded-lg bg-muted/40 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted/40 rounded w-3/4" />
                  <div className="h-2.5 bg-muted/20 rounded w-1/2" />
                </div>
                <div className="h-5 w-12 bg-muted/30 rounded-full" />
              </div>
            ))}
          </div>
        ) : !deadlines || filteredDeadlines.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full py-6 px-6 text-center gap-2">
            <CalendarClock className="h-7 w-7 text-muted-foreground" />
            <div>
              <p className="text-base font-medium text-foreground">No deadlines soon</p>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-[240px]">
                No projects have deadlines in the next {selectedWeeks * 7} days.
              </p>
            </div>
          </div>
        ) : (
          filteredDeadlines.map((project) => {
            const days = daysUntil(project.targetDate);
            const isUrgent = days <= 2;
            const isWarning = days <= 4;

            return (
              <button
                key={project._id}
                onClick={() => router.push(`/dashboard/my-projects/${project.slug}/workspace`)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-accent/30 cursor-pointer transition-colors duration-150 group outline-none"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "h-7 w-7 rounded-md flex items-center justify-center shrink-0 border",
                    isUrgent
                      ? "bg-destructive/10 border-destructive/20 text-destructive"
                      : isWarning
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        : "bg-primary/5 border-primary/20 text-primary",
                  )}
                >
                  <FolderKanban className="h-4 w-4" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground/85 truncate group-hover:text-foreground transition-colors">
                    {project.projectName}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(project.targetDate)}
                      </span>
                    </div>
                    {project.role && (
                      <span
                        className={cn(
                          "text-[10px] rounded-sm border bg-muted px-2 py-0.6 shrink-0 ml-4",
                          project.role === "owned"
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-background/20  px-3! py-0.5"
                        )}
                      >
                        {project.role}
                      </span>
                    )}
                  </div>
                </div>

                {/* SVG render (Sparkline) */}
                <div className="flex items-center justify-center px-1">
                  <Sparkline id={project._id} daysLeft={days} />
                </div>

                {/* Days badge */}
                <span
                  className={cn(
                    "shrink-0 text-[10px] px-2 py-0.5 rounded-full border",
                    isUrgent
                      ? "bg-destructive/10 text-destructive border-destructive/20"
                      : isWarning
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-primary/5 text-muted-foreground border-primary/20",
                  )}
                >
                  {days <= 0 ? "Today" : `${days}d left`}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
