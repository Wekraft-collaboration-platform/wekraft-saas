"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Layers3, ClipboardList, Bug, TicketPlus, Zap } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  subMonths,
  endOfMonth,
  format,
  startOfDay,
  subDays,
  eachDayOfInterval,
  subHours,
  eachHourOfInterval,
  isWithinInterval,
  startOfHour,
  endOfHour,
  startOfMonth,
  eachMonthOfInterval,
} from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ActivityOverviewCardProps {
  slug: string;
  tasks?: any[];
  issues?: any[];
  projectCreatedAt?: number;
}

const chartConfig = {
  tasks: {
    label: "Active Tasks",
    color: "var(--chart-1)",
  },
  issues: {
    label: "Unresolved Issues",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const ActivityOverviewCard = ({
  slug,
  tasks,
  issues,
  projectCreatedAt,
}: ActivityOverviewCardProps) => {
  const [range, setRange] = useState<"24h" | "7d" | "30d" | "all">("all");

  const chartData = useMemo(() => {
    if (!tasks || !issues) return [];

    const now = new Date();
    let startDate: Date;
    let intervals: Date[] = [];
    let labelFormat = "MMM dd";

    if (range === "24h") {
      startDate = subHours(now, 23);
      intervals = eachHourOfInterval({ start: startDate, end: now });
      labelFormat = "HH:mm";
    } else if (range === "7d") {
      startDate = subDays(now, 6);
      intervals = eachDayOfInterval({ start: startOfDay(startDate), end: now });
      labelFormat = "EEE";
    } else if (range === "30d") {
      startDate = subDays(now, 29);
      intervals = eachDayOfInterval({ start: startOfDay(startDate), end: now });
      labelFormat = "MMM dd";
    } else {
      // "all" - start from project inception
      startDate = projectCreatedAt
        ? new Date(projectCreatedAt)
        : subMonths(now, 5);

      // If project is less than 2 months old, show daily points for better "pulse"
      const daysDiff = Math.ceil(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff <= 60) {
        intervals = eachDayOfInterval({
          start: startOfDay(startDate),
          end: now,
        });
        labelFormat = "MMM dd";
      } else {
        intervals = eachMonthOfInterval({
          start: startOfMonth(startDate),
          end: now,
        });
        labelFormat = "MMM";
      }
    }

    return intervals.map((date) => {
      let intervalStart: number;
      let intervalEnd: number;

      if (range === "24h") {
        intervalStart = startOfHour(date).getTime();
        intervalEnd = endOfHour(date).getTime();
      } else if (range === "all" && intervals.length > 60) {
        // Monthly
        intervalStart = startOfMonth(date).getTime();
        intervalEnd = endOfMonth(date).getTime();
      } else {
        // Daily
        intervalStart = startOfDay(date).getTime();
        intervalEnd = new Date(
          date.getTime() + 24 * 60 * 60 * 1000 - 1,
        ).getTime();
      }

      const activeTasks = tasks.filter((t) => {
        const created = t.createdAt ?? t._creationTime;
        const completed = t.finalCompletedAt;
        // Task was alive if it was created before intervalEnd and (not completed or completed after intervalStart)
        return (
          created <= intervalEnd && (!completed || completed > intervalStart)
        );
      }).length;

      const activeIssues = issues.filter((is) => {
        const created = is.createdAt ?? is._creationTime;
        const closed = is.finalCompletedAt;
        return created <= intervalEnd && (!closed || closed > intervalStart);
      }).length;

      return {
        date: format(date, labelFormat),
        tasks: activeTasks,
        issues: activeIssues,
      };
    });
  }, [tasks, issues, projectCreatedAt, range]);

  if (!tasks || !issues) {
    return (
      <Card className="p-4! overflow-hidden shadow-sm bg-accent/30 border-accent">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-44 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4! overflow-hidden shadow-sm bg-accent/30 border-accent">
      <CardHeader className="pb-0 px-0! flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <Layers3 className="w-5 h-5!" /> Activity Pulse
          </CardTitle>
          <CardDescription className="text-[10px]">
            Project Growth •{" "}
            {chartData.length > 0
              ? `${chartData[0].date} - ${chartData[chartData.length - 1].date}`
              : "Pulse Overview"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-muted p-0.5 rounded-md border border-border">
            {(["24h", "7d", "30d", "all"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-2 py-1 rounded text-[10px] font-medium transition-all cursor-pointer",
                  range === r
                    ? "bg-background text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0 pt-4">
        <ChartContainer config={chartConfig} className="h-[180px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={10}
              minTickGap={32}
              hide={range === "24h"}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <defs>
              <linearGradient id="fillTasks" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-tasks)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-tasks)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillIssues" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-issues)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-issues)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="issues"
              type="monotone"
              fill="url(#fillIssues)"
              fillOpacity={0.4}
              stroke="var(--color-issues)"
            />
            <Area
              dataKey="tasks"
              type="monotone"
              fill="url(#fillTasks)"
              fillOpacity={0.4}
              stroke="var(--color-tasks)"
            />
            <ChartLegend content={<ChartLegendContent />} className="mt-4" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
