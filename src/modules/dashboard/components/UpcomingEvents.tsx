"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown, FolderKanban, RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatDay(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { weekday: "short" });
}

function formatDateNum(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", { day: "2-digit" });
}

function formatTime(ts: number, allDay: boolean): string {
  if (allDay) return "All Day";
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysUntil(ts: number): number {
  return Math.ceil((ts - Date.now()) / (1000 * 60 * 60 * 24));
}

async function fetchEvents(refresh = false) {
  const url = refresh
    ? "/api/dashboard/upcoming-cards?refresh=true"
    : "/api/dashboard/upcoming-cards";
  const res = await fetch(url, { cache: "no-store" });
  const d = await res.json();
  return d.events || [];
}

export interface UpcomingEventsProps {
  events: any[] | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function UpcomingEvents({
  events,
  loading,
  refreshing,
  onRefresh,
}: UpcomingEventsProps) {
  const router = useRouter();
  const [selectedWeeks, setSelectedWeeks] = useState(1);

  const now = Date.now();
  const threshold = now + selectedWeeks * 7 * 24 * 60 * 60 * 1000;
  const filteredEvents = events
    ? events.filter((e) => e.start >= now && e.start <= threshold)
    : [];

  return (
    <div className="flex-1 flex flex-col rounded-lg border border-border bg-card dark:bg-sidebar shadow-md overflow-hidden h-1/2 min-h-0">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border bg-muted shrink-0 flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5 w-full justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium ">
              Upcoming Events
            </h3>
          </div>
          <div className="flex items-center gap-2.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="text-[10px] h-6 font-medium text-primary bg-accent! px-2.5 py-0.5 rounded-md cursor-pointer transition-colors shadow-none flex items-center gap-1"
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
              title="Refresh events"
              className="bg-accent!"
            >
              <RefreshCwIcon
                className={cn(
                  "h-3 w-3",
                  refreshing && "animate-spin"
                )}
              />
            </Button>
          </div>

        </div>


      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar divide-y divide-border">
        {loading ? (
          <div className="flex flex-col divide-y divide-border/10">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-2.5 animate-pulse">
                {/* Date skeleton */}
                <div className="flex flex-col items-center shrink-0 w-8 gap-1 mt-0.5">
                  <div className="h-4 w-6 bg-muted/40 rounded" />
                  <div className="h-2.5 w-5 bg-muted/20 rounded" />
                </div>
                {/* Divider skeleton */}
                <div className="w-px self-stretch bg-border/30 mx-1 shrink-0" />
                {/* Content skeleton */}
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted/40 rounded w-3/4" />
                  <div className="h-2.5 bg-muted/20 rounded w-full" />
                  <div className="h-2.5 bg-muted/20 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !events || filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-6 px-6 text-center gap-2">
            <Calendar className="h-7 w-7 text-muted-foreground" />
            <div>
              <p className="text-base font-medium">No events soon</p>
              <p className="text-sm text-muted-foreground mt-0.5 max-w-[240px]">
                No upcoming events or meetings in the next {selectedWeeks * 7} days.
              </p>
            </div>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const days = daysUntil(event.start);
            const isToday = days <= 0;

            return (
              <button
                key={event._id}
                onClick={() => router.push(`/dashboard/my-projects/${event.projectSlug}/workspace/calendar`)}
                className="w-full flex items-start gap-0 px-4 py-2 text-left hover:bg-accent/30 cursor-pointer transition-colors duration-150 group outline-none"
              >
                {/* Left: Date block */}
                <div className="flex flex-col items-center shrink-0 w-9 mr-3 mt-0.5">
                  <span
                    className={cn(
                      "text-[15px] font-bold leading-none",
                      isToday ? "text-primary" : "text-foreground/80"
                    )}
                  >
                    {formatDateNum(event.start)}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] font-semibold uppercase tracking-wider mt-0.5",
                      isToday ? "text-primary/70" : "text-muted-foreground/60"
                    )}
                  >
                    {isToday ? "TODAY" : formatDay(event.start)}
                  </span>
                </div>

                {/* Vertical divider */}
                <div
                  className="w-px self-stretch mr-3 shrink-0 rounded-full"
                  style={
                    event.color
                      ? { backgroundColor: event.color, opacity: 1 }
                      : undefined
                  }
                >
                  {!event.color && (
                    <div
                      className={cn(
                        "w-full h-full rounded-full",
                        isToday ? "bg-primary/60" : "bg-border/50"
                      )}
                    />
                  )}
                </div>

                {/* Right: Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <p className="text-[12.5px] font-medium text-foreground/85 truncate group-hover:text-foreground transition-colors">
                    {event.title}
                  </p>
                  {/* Bottom row: time + project */}
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] text-muted-foreground/50">
                      {formatTime(event.start, event.allDay)}
                    </span>

                    {/* Project badge */}
                    <span className="inline-flex items-center gap-1 text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border/40 max-w-[120px] truncate">
                      <FolderKanban className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{event.projectName}</span>
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
