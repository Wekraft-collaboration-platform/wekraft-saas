"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, LabelList } from "recharts";
import { LayoutDashboard, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EnvironmentalSeverityHeatmapProps {
  projectId: Id<"projects">;
  data?: {
    environment: string;
    critical: number;
    medium: number;
    low: number;
  }[];
}

const chartConfig = {
  issues: {
    label: "Issues",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const EnvironmentalSeverityHeatmap = ({ projectId, data: providedData }: EnvironmentalSeverityHeatmapProps) => {
  const queryData = useQuery(api.workspace.getEnvironmentalSeverityHeatmap, { projectId });
  const data = (providedData ?? queryData) as { environment: string; critical: number; medium: number; low: number; }[] | null | undefined;

  // Still loading
  if (data === undefined) {
    return (
      <Card className="border shadow-sm bg-accent/20 border-accent h-[340px]">
        <CardHeader>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32 mt-2" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <Activity className="w-8 h-8 animate-pulse text-muted-foreground/20" />
        </CardContent>
      </Card>
    );
  }

  // Loaded but no data
  if (!data || data.length === 0) {
    return (
      <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Environment Distribution
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Active issue counts across infrastructure layers
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[220px] text-center p-6">
          <Activity className="w-8 h-8 mb-2 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">No environment data yet</p>
          <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1">
            Create and track issues across environments to see distribution.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Flatten data for a clean bar chart like the reference image
  const processedData = data.map((item) => ({
    env: item.environment.substring(0, 4), // Shorten for labels
    issues: item.critical + item.medium + item.low,
  }));

  return (
    <Card className="border shadow-sm  dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-muted-foreground" /> Environment Distribution
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground">
            Active issue counts across infrastructure layers
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            data={processedData}
            margin={{ top: 25, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-primary/30! dark:stroke-muted!" />
            <XAxis 
              dataKey="env" 
              tickLine={false} 
              tickMargin={10} 
              axisLine={false}
              fontSize={12}
              fontWeight={500}
            />
            <YAxis hide />
            <ChartTooltip
              cursor={{ fill: "var(--accent)", opacity: 0.3 }}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="issues"
              fill="var(--chart-1)"
              radius={[6, 6, 0, 0]}
              animationDuration={1000}
            >
               <LabelList
                  dataKey="issues"
                  position="top"
                  offset={12}
                  className="fill-foreground font-bold"
                  fontSize={13}
                />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
