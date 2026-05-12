"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
        <TrendingUp className="w-4 h-4 text-muted-foreground opacity-50" />
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
