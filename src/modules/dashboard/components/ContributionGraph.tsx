/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";
import { useTheme } from "next-themes";
import { format, parseISO } from "date-fns";

import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery as useConvexQuery } from "convex/react";
import { getContributionStats } from "../action/action";
import { api } from "../../../../convex/_generated/api";

import { Github } from "lucide-react";

const ContributionGraph = () => {
  const { theme } = useTheme();

  const user = useConvexQuery(api.user.getCurrentUser);

  const userName = user?.githubUsername;

  const { data, isLoading } = useQuery<{
    contributions: any[];
    totalContributions: number;
  }>({
    queryKey: ["contribution-graph"],
    queryFn: () => getContributionStats(userName || "") as any,
    enabled: !!userName, 
    staleTime: 60 * 60 * 6, 
    refetchOnWindowFocus: true,
  });

  console.log("contribution-data from Client:", data);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data || !data?.contributions?.length) {
    return (
      <div>
        <h1>No contribution data available</h1>
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
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex items-center gap-2 mb-1 px-3 py-1 bg-accent/30 rounded-full border border-border/40 shadow-xs">
        <Github className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[12px] font-semibold tracking-wide text-muted-foreground uppercase">
          Contribution Graph
        </span>
      </div>

      <div className="w-full">
        <div
          className="scrollbar-hide flex justify-center overflow-x-auto scale-100 2xl:scale-105 [&_rect]:cursor-pointer"
          style={{
            width: "100%",
            transformOrigin: "center",
          }}
        >
          <ActivityCalendar
            data={processedContributions}
            theme={{
              light: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
              dark: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
            }}
            colorScheme={theme === "dark" ? "dark" : "light"}
            blockSize={12}
            blockMargin={5}
            fontSize={14}
            showColorLegend
            showTotalCount
            showMonthLabels
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
                  } catch (e) {
                    // Fallback
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
