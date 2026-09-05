"use client";

import { useMemo } from "react";
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
import { Users, LayoutPanelLeft, Users2, HelpCircle } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

  const hasData = useMemo(() => workload !== undefined && workload.length > 0 && workload.some(w => w.total > 0), [workload]);

  const chartData = useMemo(() => {
    if (!workload) return [];
    return workload.map(w => ({
      ...w,
      shortName: w.name.split(' ')[0]
    }));
  }, [workload]);

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

  if (!hasData) {
    return (
      <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <LayoutPanelLeft className="w-4 h-4" /> Member Workload Balance
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Active task density per team member
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
                    Member Workload Balance
                  </p>
                  <p className="leading-relaxed text-muted-foreground">
                    Displays active tasks (High, Medium, Low priority) assigned per member. Helps balance work distribution and optimize resource allocation.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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

  const dynamicHeight = Math.max(180, chartData.length * 48);

  return (
    <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <Users2 className="w-4 h-4" /> Member Workload Balance
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground">
            Current active tasks by priority levels.  Resource Leveling.
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
                  Member Workload Balance
                </p>
                <p className="leading-relaxed text-muted-foreground">
                  Displays active tasks (High, Medium, Low priority) assigned per member. Helps balance work distribution and optimize resource allocation.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="pt-0 -mt-6 h-[240px] flex flex-col justify-between">
        {/* Scrollable Chart Area */}
        <div className="overflow-y-auto custom-scrollbar pr-1 max-h-[180px] flex-1">
          <ChartContainer config={chartConfig} style={{ height: `${dynamicHeight}px` }} className="w-full">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              barSize={16}
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
        </div>

        {/* Fixed Non-Scrolling Legend at Bottom */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-medium text-muted-foreground pt-3 border-t border-accent/20 flex-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Low Priority</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
