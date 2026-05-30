"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, Zap, HelpCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WeeklyVelocityChartProps {
  projectId: Id<"projects">;
  data?: {
    day: string;
    tasks: number;
    issues: number;
  }[];
}

const chartConfig = {
  tasks: {
    label: "Tasks Done",
    color: "var(--chart-1)",
  },
  issues: {
    label: "Issues Resolved",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export const WeeklyVelocityChart = ({ projectId, data: providedData }: WeeklyVelocityChartProps) => {
  const queryData = useQuery(api.workspace.getWeeklyVelocity, { projectId });
  const data = (providedData || queryData) as { day: string; tasks: number; issues: number }[] | undefined;

  if (!data) {
    return (
      <Card className="border shadow-sm bg-accent/20 border-accent h-[340px]">
        <CardHeader>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32 mt-2" />
        </CardHeader>
        <CardContent className="h-[220px] flex items-center justify-center">
           <TrendingUp className="w-8 h-8 animate-pulse text-muted-foreground/20" />
        </CardContent>
      </Card>
    );
  }

  const totalThisWeek = data.reduce((acc, curr) => acc + curr.tasks + curr.issues, 0);

  if (totalThisWeek === 0) {
    return (
      <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <Zap className="w-4 h-4" /> Weekly Velocity Breakdown
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground">
            0 items completed this week (Mon - Sun)
          </CardDescription>
        </div>
        <div className="flex-none">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="group relative flex items-center h-6 rounded-full border border-border bg-accent/30 text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out w-7 hover:w-28 overflow-hidden text-[10px] font-medium flex-none">
                  <div className="absolute left-[4px] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out whitespace-nowrap">
                      Know more
                    </span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border p-2.5 max-w-[260px] rounded-md shadow-md text-[10px] z-50">
                <p className="font-semibold text-muted-foreground border-b border-border pb-1 mb-1">
                  Weekly Velocity Breakdown
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Tracks the number of completed tasks and closed issues on a daily basis (Monday to Sunday) during the current week to show team velocity trends.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[220px] text-center p-6">
          <TrendingUp className="w-8 h-8 mb-2 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">No velocity data yet</p>
          <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1">
            Complete tasks and resolve issues to see your weekly performance trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <Zap className="w-4 h-4" /> Weekly Velocity Breakdown
          </CardTitle>
          <CardDescription className="text-[10px] font-medium text-muted-foreground">
            {totalThisWeek} items completed this week (Mon - Sun)
          </CardDescription>
        </div>
        <div className="flex-none">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="group relative flex items-center h-6 rounded-full border border-border bg-accent/30 text-muted-foreground hover:text-foreground transition-all duration-300 ease-in-out w-7 hover:w-28 overflow-hidden text-[10px] font-medium flex-none">
                  <div className="absolute left-[4px] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out whitespace-nowrap">
                      Know more
                    </span>
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover text-popover-foreground border border-border p-2.5 max-w-[260px] rounded-md shadow-md text-[10px] z-50">
                <p className="font-semibold text-muted-foreground border-b border-border pb-1 mb-1">
                  Weekly Velocity Breakdown
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Tracks the number of completed tasks and closed issues on a daily basis (Monday to Sunday) during the current week to show team velocity trends.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-primary/30! dark:stroke-muted!" />
            <XAxis 
              dataKey="day" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
              fontSize={12}
              fontWeight={500}
            />
            <YAxis tickLine={false} axisLine={false} fontSize={12} />
            <ChartTooltip
              cursor={{ fill: "var(--accent)", opacity: 0.3 }}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="tasks"
              stackId="velocity"
              fill="var(--chart-1)"
              radius={[0, 0, 0, 0]}
              animationDuration={1000}
            />
            <Bar
              dataKey="issues"
              stackId="velocity"
              fill="var(--chart-2)"
              radius={[4, 4, 0, 0]}
              animationDuration={1200}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
