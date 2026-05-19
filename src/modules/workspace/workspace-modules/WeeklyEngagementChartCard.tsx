"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarRange, HelpCircle, Activity } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WeeklyEngagementChartCardProps {
  projectId: Id<"projects">;
  data?: {
    days: string[];
    members: {
      userId: string;
      name: string;
      avatar: string;
      initials: string;
      dailyActivity: {
        tasks: number;
        issues: number;
        total: number;
      }[];
    }[];
  };
}

export const WeeklyEngagementChartCard = ({
  projectId,
  data: providedData,
}: WeeklyEngagementChartCardProps) => {
  const queryData = useQuery(api.workspace.getWeeklyEngagement, { projectId });
  const engagement = providedData || queryData;

  if (engagement === undefined) {
    return (
      <Card className="border shadow-sm bg-accent/20 border-accent h-[340px]">
        <CardHeader>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32 mt-2" />
        </CardHeader>
        <CardContent className="h-[220px] flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const { days = [], members = [] } = engagement;

  if (members.length === 0) {
    return (
      <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <CalendarRange className="w-4 h-4 text-muted-foreground" /> Weekly Engagement
            </CardTitle>
            <CardDescription className="text-xs font-medium text-muted-foreground">
              Daily completed tasks and resolved issues per member
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[220px] text-center p-6">
          <Activity className="w-8 h-8 mb-2 text-muted-foreground/40" />
          <p className="text-base font-medium text-muted-foreground">No member activity</p>
          <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
            Complete tasks or close issues to track team daily momentum.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get cell color intensity based on contribution total
  const getCellColor = (total: number) => {
    if (total === 0) return "bg-neutral-800/40 border border-neutral-700/10 hover:bg-neutral-700/20";
    if (total === 1) return "bg-blue-950/70 border border-blue-900/30 hover:bg-blue-900/50";
    if (total === 2) return "bg-blue-800 hover:bg-blue-700 shadow-xs shadow-blue-800/10";
    return "bg-blue-500 hover:bg-blue-400 shadow-sm shadow-blue-500/20";
  };

  return (
    <Card className="border shadow-sm dark:bg-accent/20 bg-card dark:border-accent border-accent/50 overflow-hidden h-[340px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-muted-foreground" /> Weekly Engagement
          </CardTitle>
          <CardDescription className="text-xs font-medium text-muted-foreground">
            Activity tracking over last 12 days
          </CardDescription>
        </div>
        
        {/* Color Legend */}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-neutral-800 border border-neutral-700/10" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-blue-950/70 border border-blue-900/30" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-blue-800" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-blue-500" />
            <span>High</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 h-[240px] flex flex-col justify-between">
        <TooltipProvider>
          <div className="space-y-2.5 overflow-y-auto pr-1 custom-scrollbar max-h-[175px] flex-1">
            {members.map((member) => (
              <div key={member.userId} className="flex items-center gap-3">
                {/* Y-Axis Avatar Label */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-6 shrink-0 cursor-help flex items-center justify-center">
                      <Avatar className="w-6 h-6 border border-border">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="text-[10px] font-bold">
                          {member.initials.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground border border-border px-2.5 py-1 text-xs rounded-md shadow-md">
                    {member.name}
                  </TooltipContent>
                </Tooltip>

                {/* Heat Cells */}
                <div className="flex-1 grid grid-cols-12 gap-1.5">
                  {member.dailyActivity.map((activity, idx) => {
                    const dateStr = days[idx] || "";
                    return (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-6 rounded-sm transition-all duration-200 cursor-pointer ${getCellColor(
                              activity.total
                            )}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-popover text-popover-foreground border border-border p-2 rounded-md shadow-md text-xs">
                          <p className="font-semibold text-[10px] text-muted-foreground border-b border-border pb-1 mb-1">
                            Day {dateStr}
                          </p>
                          <div className="space-y-0.5">
                            <p>🔧 Tasks Completed: <span className="font-bold">{activity.tasks}</span></p>
                            <p>🐛 Issues Resolved: <span className="font-bold">{activity.issues}</span></p>
                            <p className="font-bold border-t border-border/50 pt-0.5 mt-0.5">
                              Total: {activity.total} items
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* X-Axis Labels (Days) */}
          <div className="flex items-center gap-3 border-t border-accent/20 pt-2.5 mt-2 flex-none">
            {/* spacer matching the avatar column width */}
            <div className="w-6" />
            <div className="flex-1 grid grid-cols-12 gap-1.5 text-center">
              {days.map((day, idx) => (
                <span key={idx} className="text-[10px] font-medium text-muted-foreground">
                  {day}
                </span>
              ))}
            </div>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
