"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, Clock, FolderKanban, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

async function fetchDeadlines(refresh = false) {
  const url = refresh
    ? "/api/dashboard/upcoming-cards?refresh=true"
    : "/api/dashboard/upcoming-cards";
  const res = await fetch(url);
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
      : "stroke-lime-500 dark:stroke-lime-400"; // Using lime green just like the user's reference

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

export function UpcomingDeadlines() {
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDeadlines()
      .then(setDeadlines)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await fetchDeadlines(true);
      setDeadlines(fresh);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col rounded-lg border border-border bg-card dark:bg-sidebar shadow-sm overflow-hidden h-1/2 min-h-0">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border bg-muted shrink-0 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <CalendarClock className="h-4 w-4 text-primary" />
          Upcoming Deadlines
        </h3>
        <span className="text-[11px] font-medium text-muted-foreground">
          in 1 Week
        </span>
        <Button
          size="icon-xs"
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh deadlines"
        >
          <RefreshCwIcon
            className={cn(
              "h-3 w-3 text-muted-foreground",
              refreshing && "animate-spin"
            )}
          />
        </Button>
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
        ) : !deadlines || deadlines.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full py-6 px-6 text-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted/20 border border-border/25 flex items-center justify-center">
              <CalendarClock className="h-4.5 w-4.5 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/75">No deadlines soon</p>
              <p className="text-[10px] text-muted-foreground/55 mt-0.5 max-w-[180px]">
                No projects have deadlines in the next 7 days.
              </p>
            </div>
          </div>
        ) : (
          deadlines.map((project) => {
            const days = daysUntil(project.targetDate);
            const isUrgent = days <= 2;
            const isWarning = days <= 4;

            return (
              <button
                key={project._id}
                onClick={() => router.push(`/dashboard/my-projects/${project.slug}/workspace`)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-accent/30 cursor-pointer transition-colors duration-150 group outline-none"
              >
                {/* Icon */}
                <div
                  className={cn(
                    "h-6 w-6 rounded-md flex items-center justify-center shrink-0 border",
                    isUrgent
                      ? "bg-destructive/10 border-destructive/20 text-destructive"
                      : isWarning
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        : "bg-primary/10 border-primary/20 text-primary",
                  )}
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-medium text-foreground/85 truncate group-hover:text-foreground transition-colors">
                    {project.projectName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="text-[10.5px] text-muted-foreground">
                      {formatDate(project.targetDate)}
                    </span>
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
