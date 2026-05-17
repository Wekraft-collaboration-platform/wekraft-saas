"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";
import { LayoutDashboard, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EnvironmentalSeverityHeatmapProps {
  projectId: Id<"projects">;
  data?: {
    environment: string;
    total: number;
    critical: number;
    medium: number;
    low: number;
  }[];
}

const COLORS = [
  "#2563eb", // blue-600
  "#3b82f6", // blue-500
  "#60a5fa", // blue-400
  "#93c5fd", // blue-300
  "#1d4ed8", // blue-700
];

const chartConfig = {
  issues: {
    label: "Issues",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const EnvironmentalSeverityHeatmap = ({ projectId, data: providedData }: EnvironmentalSeverityHeatmapProps) => {
  const queryData = useQuery(api.workspace.getEnvironmentalSeverityHeatmap, { projectId });
  const data = (providedData ?? queryData) as { environment: string; total: number; critical: number; medium: number; low: number; }[] | null | undefined;

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

  const totalIssues = data?.reduce((acc, curr) => acc + (curr.total ?? 0), 0) ?? 0;

  // Loaded but no data
  if (!data || data.length === 0 || totalIssues === 0) {
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

  // Process data for Pie Chart - Filter out zeros to avoid UI clutter
  const processedData = data
    .filter((item) => (item.total ?? 0) > 0)
    .map((item, index) => ({
      name: item.environment,
      value: item.total,
      fill: COLORS[index % COLORS.length],
    }));

  return (
    <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
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
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={processedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                label={({ value }) => `${value}`}
                labelLine={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, opacity: 0.5 }}
                animationDuration={1000}
                stroke="none"
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

