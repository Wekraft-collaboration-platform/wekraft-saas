"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Users, LayoutPanelLeft, Users2 } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";

interface MemberWorkloadCardProps {
  projectId: Id<"projects">;
  data?: {
    userId: string;
    name: string;
    avatar: string;
    high: number;
    medium: number;
    low: number;
    total: number;
  }[];
}

const chartConfig = {
  high: {
    label: "High Priority",
    color: "#ef4444", // Red-500
  },
  medium: {
    label: "Medium Priority",
    color: "#f97316", // Orange-500
  },
  low: {
    label: "Low Priority",
    color: "#3b82f6", // Blue-500
  },
} satisfies ChartConfig;

export const MemberWorkloadCard = ({
  projectId,
  data: providedData,
}: MemberWorkloadCardProps) => {
  const queryData = useQuery(api.workspace.getMemberWorkload, { projectId });
  const workload = providedData || queryData;

  if (workload === undefined) {
    return (
      <Card className="border shadow-sm bg-accent/20 border-accent h-[340px]">
        <CardHeader>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32 mt-2" />
        </CardHeader>
        <CardContent className="h-[220px] flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    );
  }

  const hasData = workload.length > 0 && workload.some(w => w.total > 0);

  if (!hasData) {
    return (
      <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <LayoutPanelLeft className="w-4 h-4" /> Member Workload Balance
            </CardTitle>
            <CardDescription className="text-[10px] font-medium text-muted-foreground">
              Active task density per team member
            </CardDescription>
          </div>
          <Users className="w-4 h-4 text-muted-foreground opacity-50" />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[220px] text-center p-6">
          <Users className="w-8 h-8 mb-2 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">No active workload</p>
          <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1">
            Assign tasks to team members to see the distribution of work and priority levels.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Formatting name for Y-Axis
  const chartData = workload.map(w => ({
    ...w,
    shortName: w.name.split(' ')[0]
  }));


  const dynamicHeight = Math.max(220, chartData.length * 40);

  return (
    <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <Users2 className="w-4 h-4" /> Member Workload Balance
          </CardTitle>
          <CardDescription className="text-[10px] font-medium text-muted-foreground">
            Current active tasks by priority levels.  Resource Leveling.
          </CardDescription>
        </div>
        <Users className="w-4 h-4 text-muted-foreground opacity-50" />
      </CardHeader>
      <CardContent className="pt-0 -mt-6 h-[240px] overflow-y-auto custom-scrollbar">
        <ChartContainer config={chartConfig} style={{ height: `${dynamicHeight}px` }} className="w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            barSize={20}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" className="dark:stroke-neutral-800! stroke-neutral-400!" />
            <XAxis type="number" hide />
            <YAxis
              dataKey="shortName"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              fontSize={11}
              fontWeight={500}
              width={60}
            />
            <ChartTooltip
              cursor={{ fill: "var(--accent)", opacity: 0.2 }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <ChartLegend content={<ChartLegendContent />} className="mt-4" />
            <Bar
              dataKey="high"
              stackId="workload"
              fill={chartConfig.high.color}
              radius={[0, 0, 0, 0]}
              animationDuration={1000}
            />
            <Bar
              dataKey="medium"
              stackId="workload"
              fill={chartConfig.medium.color}
              radius={[0, 0, 0, 0]}
              animationDuration={1200}
            />
            <Bar
              dataKey="low"
              stackId="workload"
              fill={chartConfig.low.color}
              radius={[0, 4, 4, 0]}
              animationDuration={1400}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
