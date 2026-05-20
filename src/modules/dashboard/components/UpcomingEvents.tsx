"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";

function daysUntil(ts: number): number {
  return Math.ceil((ts - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatEventTime(start: number, end: number, allDay: boolean): string {
  const startDate = new Date(start);
  const dateStr = startDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  if (allDay) {
    return `${dateStr} (All Day)`;
  }
  const timeStr = startDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} at ${timeStr}`;
}

export function UpcomingEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/upcoming-cards")
      .then((res) => res.json())
      .then((d) => {
        setEvents(d.events || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 flex flex-col rounded-lg border border-border bg-card dark:bg-sidebar shadow-md overflow-hidden h-1/2 min-h-0">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border bg-muted shrink-0 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-primary" />
          Upcoming Events
        </h3>
        <span className="text-[11px] font-medium text-muted-foreground">
          next 7 days
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-border/20">
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
              </div>
            ))}
          </div>
        ) : !events || events.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full py-6 px-6 text-center gap-2">
            <Calendar className="h-4.5 w-4.5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium ">No events soon</p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-45">
                No upcoming events or meetings this week.
              </p>
            </div>
          </div>
        ) : (
          events.map((event) => {
            const days = daysUntil(event.start);
            const isToday = days <= 0;

            return (
              <button
                key={event._id}
                onClick={() => router.push(`/projects/${event.projectSlug}`)}
                className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-accent/30 transition-colors duration-150 group outline-none"
              >
                {/* Event Color Dot */}
                <div
                  className={cn(
                    "h-2 w-2 rounded-full mt-1.5 shrink-0",
                    isToday ? "bg-destructive animate-pulse" : "bg-primary"
                  )}
                  style={event.color ? { backgroundColor: event.color } : undefined}
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-medium text-foreground/85 truncate group-hover:text-foreground transition-colors">
                    {event.title}
                  </p>

                  {/* Project Name Badge */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border/40 max-w-full truncate">
                      <FolderKanban className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{event.projectName}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1 text-muted-foreground/55">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="text-[10px]">
                      {formatEventTime(event.start, event.end, event.allDay)}
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
