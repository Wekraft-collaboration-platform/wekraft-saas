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
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { Trophy, Crown } from "lucide-react";
import { useQuery } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamContributionRadarCardProps {
  projectId: Id<"projects">;
  data?: {
    userId: string;
    name: string;
    avatar: string;
    tasks: number;
    issues: number;
    speed: number;
    reliability: number;
  }[];
}

const chartConfig = {
  tasks: { label: "Tasks", color: "var(--chart-1)" },
  issues: { label: "Issues", color: "var(--chart-2)" },
  speed: { label: "Speed", color: "var(--chart-3)" },
  reliability: { label: "Reliability", color: "var(--chart-4)" },
} satisfies ChartConfig;

export const TeamContributionRadarCard = ({
  projectId,
  data: providedData,
}: TeamContributionRadarCardProps) => {
  const queryData = useQuery(api.workspace.getProjectContributions, {
    projectId,
  });
  const contributions = (providedData || queryData) as
    | {
        userId: string;
        name: string;
        avatar: string;
        tasks: number;
        issues: number;
        speed: number;
        reliability: number;
      }[]
    | undefined;

  const radarData = useMemo(() => {
    if (!contributions) return [];

    const axes = [
      { key: "tasks", label: "Tasks" },
      { key: "issues", label: "Issues" },
      { key: "speed", label: "Speed" },
      { key: "reliability", label: "Reliability" },
    ];

    return axes.map((axis) => {
      const dataPoint: any = { axis: axis.label };
      contributions.forEach((user: any) => {
        dataPoint[user.name] = user[axis.key as keyof typeof user];
      });
      return dataPoint;
    });
  }, [contributions]);

  if (contributions === undefined) {
    return (
      <Card className="p-4! overflow-hidden shadow-sm bg-accent/30 border-accent h-[320px]">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-[200px] w-full rounded-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0! overflow-hidden shadow-sm  dark:bg-accent/30 bg-card dark:border-accent border-accent/50 h-[340px]">
      <CardHeader className=" px-4! pt-3! flex flex-row items-center justify-between">
        <div className="space-y-0.5">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <Trophy className="w-5 h-5!" /> Team Performance Radar
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Activity metrics for top 3 members
          </CardDescription>
        </div>

        {/* TOP 3 names + avatar */}
        <div className="flex gap-3">
          {contributions.map((user: any, index: number) => (
            <div key={user.userId} className="flex flex-col items-center gap-1">
              <Avatar
                className="w-8 h-8 border"
                style={{ borderColor: `var(--chart-${(index % 5) + 1})` }}
              >
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-[9px]">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              <span className="text-[11px] capitalize font-medium text-muted-foreground truncate max-w-[45px]">
                {user.name.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className=" pb-2 pt-0 h-[300px] -mt-12">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-auto h-full"
        >
          <RadarChart
            data={radarData}
            margin={{ top: 10, right: 10, bottom: 15, left: 10 }}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarGrid
              className="stroke-muted-foreground/30"
              strokeWidth={1.5}
            />
            <PolarAngleAxis
              dataKey="axis"
              tick={{
                fill: "var(--muted-foreground)",
                fontSize: 10,
                fontWeight: 600,
              }}
            />
            {contributions.map((user: any, index: number) => (
              <Radar
                key={user.userId}
                name={user.name}
                dataKey={user.name}
                stroke={`var(--chart-${(index % 5) + 1})`}
                strokeWidth={2.5}
                fill={`var(--chart-${(index % 5) + 1})`}
                fillOpacity={0.4}
              />
            ))}
            <ChartLegend
              content={<ChartLegendContent />}
              className="mt-4 text-[10px]"
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
