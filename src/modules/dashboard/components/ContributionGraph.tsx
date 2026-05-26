/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";
import { useTheme } from "next-themes";
import { format, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery as useConvexQuery } from "convex/react";
import { getContributionStats } from "../action/action";
import { api } from "../../../../convex/_generated/api";
import { AlertCircle } from "lucide-react";

/** Clamp a value to a [min, max] range */
const clamp = (val: number, min: number, max: number) =>
  Math.max(min, Math.min(max, val));

/**
 * Derive block size + margin so the calendar fills the container width
 * without overflowing on any screen size.
 *
 * ActivityCalendar renders 53 weeks columns × (blockSize + blockMargin)
 * plus ~35 px for the day-of-week labels on the left.
 */
function deriveCalendarDimensions(containerWidth: number) {
  const WEEKS = 53;
  const LEFT_LABELS = 28; // approx px reserved for day labels
  const available = containerWidth - LEFT_LABELS;

  // We want blockSize and blockMargin such that:
  //   WEEKS * (blockSize + blockMargin) ≤ available
  // We fix the ratio blockMargin ≈ blockSize * 0.4 (feels natural)
  // => WEEKS * blockSize * 1.4 ≤ available
  // => blockSize ≤ available / (WEEKS * 1.4)
  const rawBlock = available / (WEEKS * 1.4);
  const blockSize = clamp(Math.floor(rawBlock), 8, 14);
  const blockMargin = clamp(Math.ceil(blockSize * 0.4), 3, 6);
  const fontSize = containerWidth < 480 ? 10 : 12;

  return { blockSize, blockMargin, fontSize };
}

const ContributionGraph = () => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ blockSize: 11, blockMargin: 4, fontSize: 12 });

  const user = useConvexQuery(api.user.getCurrentUser);
  const userName = user?.githubUsername;

  const { data, isLoading } = useQuery<{
    contributions: any[];
    totalContributions: number;
  }>({
    queryKey: ["contribution-graph", userName],
    queryFn: () => getContributionStats(userName || "") as any,
    enabled: !!userName,
    staleTime: 60 * 60 * 6 * 1000,
    refetchOnWindowFocus: false,
  });

  /* ── Responsive block-size observer ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setDims(deriveCalendarDimensions(el.clientWidth));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full space-y-3 py-2" aria-label="Loading contribution graph">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-28 w-full rounded-lg" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
    );
  }

  if (!data || !data?.contributions?.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <AlertCircle className="h-6 w-6 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No contribution data available</p>
      </div>
    );
  }

  // Ensure that even 1 commit has a visible level (level >= 1)
  const processedContributions = data.contributions.map((day: any) => {
    const count = day.count ?? 0;
    return {
      ...day,
      level: count === 0 ? 0 : Math.min(4, Math.floor((count - 1) / 3) + 1),
    };
  });

  return (
    <div className="w-full overflow-hidden" ref={containerRef}>
      <div className="w-full overflow-x-auto pb-2 flex justify-center">
        <div className="min-w-max p-1">
          <ActivityCalendar
            data={processedContributions}
            theme={{
              light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
              dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
            }}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={dims.blockSize}
            blockMargin={dims.blockMargin}
            fontSize={dims.fontSize}
            showColorLegend
            showTotalCount
            showMonthLabels
            showWeekdayLabels
            labels={{
              totalCount: "{{count}} contributions in the last year",
            }}
            tooltips={{
              activity: {
                text: (activity) => {
                  const countStr = activity.count === 0 ? "No" : activity.count;
                  const suffixStr = activity.count === 1 ? "commit" : "commits";
                  let dateStr = activity.date;
                  try {
                    dateStr = format(parseISO(activity.date), "MMMM d, yyyy");
                  } catch (_) {
                    /* Fallback */
                  }
                  return `${countStr} ${suffixStr} on ${dateStr}`;
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;
