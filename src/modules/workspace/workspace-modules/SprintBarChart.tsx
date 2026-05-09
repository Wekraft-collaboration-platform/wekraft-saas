"use client";

import { useQuery } from "convex/react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface SprintBarChartProps {
  projectId: Id<"projects">;
  data?: any[];
}

export const SprintBarChart = ({
  projectId,
  data: providedData,
}: SprintBarChartProps) => {
  const queryData = useQuery(api.sprint.getSprintsByProject, { projectId });
  const sprints = providedData || queryData;
  const [startIndex, setStartIndex] = useState(0);

  if (!sprints) return null;

  // Process and sort sprints by start date ascending
  const sortedSprints = [...sprints].sort(
    (a, b) => a.duration.startDate - b.duration.startDate,
  );

  const totalSprintsCount = sortedSprints.length;

  if (totalSprintsCount === 0) {
    return (
      <Card className="border shadow-none bg-accent/30 border-accent overflow-hidden h-[340px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <BarChart3 className="w-5 h-5!" /> Sprint Performance Metrics
            </CardTitle>
            <p className="text-[10px] text-muted-foreground font-medium">
              Sprint duration vs task completion
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[260px] text-center p-6">
          <History className="w-8 h-8 mb-2 text-muted-foreground" />

          <p className="text-base font-medium text-muted-foreground">
            No sprint data available
          </p>
          <p className="text-[10px] text-muted-foreground max-w-[200px] mt-1">
            Start your first sprint to see performance metrics and velocity
            trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Frame logic: show 4 sprints, default to latest 4
  const displaySprints = sortedSprints.slice(
    Math.max(0, totalSprintsCount - 4 - startIndex),
    Math.max(0, totalSprintsCount - startIndex),
  );

  // Calculate height scale
  const durations = sortedSprints.map(
    (s) => (s.duration.endDate - s.duration.startDate) / (1000 * 60 * 60 * 24),
  );
  const maxDuration = Math.max(...durations, 1);
  const minDuration = Math.min(...durations, 1);

  const getHeight = (duration: number) => {
    const minHeight = 60; // px
    const maxHeight = 160; // px
    if (maxDuration === minDuration) return maxHeight;

    // Use a power scale to dampen difference between short and long sprints
    const normalized = (duration - minDuration) / (maxDuration - minDuration);
    return minHeight + Math.pow(normalized, 0.5) * (maxHeight - minHeight);
  };

  return (
    <Card className="border shadow-none bg-accent/30 border-accent overflow-hidden h-[340px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <div className="space-y-1">
          <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
            <BarChart3 className="w-5 h-5!" /> Sprint Performance Metrics
          </CardTitle>
          <p className="text-[10px] text-muted-foreground font-medium">
            Sprint duration vs task completion
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
            disabled={totalSprintsCount <= 4 + startIndex}
            onClick={() => setStartIndex((prev) => prev + 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md hover:bg-primary/5 hover:text-primary transition-colors cursor-pointer"
            disabled={startIndex === 0}
            onClick={() => setStartIndex((prev) => prev - 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="w-full p-3! -mt-2">
        <div className="mt-2 flex flex-col relative">
          {/* Main Chart Section with balanced padding for centering */}
          <div className="relative w-full px-5">
            {/* Y-Axis Labels & Line (Absolutely positioned to stay in the left padding) */}
            <div className="absolute left-0 top-0 h-[180px] w-5 flex flex-col justify-between text-[10px] font-bold text-muted-foreground pr-3 border-r-2 border-accent text-right">
              <span>{Math.round(maxDuration)}d</span>
              <span>{Math.round(maxDuration / 2)}d</span>
              <span>0d</span>
            </div>

            {/* Chart Area */}
            <div className="relative h-[180px] w-full flex items-end justify-around border-b-2 border-accent">
              {/* Grid Lines */}
              <div className="absolute inset-0 z-0">
                <div className="absolute top-0 w-full border-t border-dashed border-accent" />
                <div className="absolute top-1/2 w-full border-t border-dashed border-accent" />
              </div>

              {displaySprints.map((sprint) => {
                const duration =
                  (sprint.duration.endDate - sprint.duration.startDate) /
                  (1000 * 60 * 60 * 24);
                const totalItems =
                  (sprint as any).totalTasks + (sprint as any).totalIssues;
                const completedItems =
                  (sprint as any).completedTasks + (sprint as any).closedIssues;
                const percent =
                  totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
                const barHeight = getHeight(duration);

                return (
                  <div
                    key={sprint._id}
                    className="group relative flex flex-col items-center z-10 w-full max-w-[50px]"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-[calc(100%+10px)] opacity-0 group-hover:opacity-100 transition-all duration-300 bg-zinc-900 text-white text-[10px] p-2.5 rounded-lg z-20 pointer-events-none shadow-2xl border border-white/10 w-32 backdrop-blur-md">
                      <p className="font-bold border-b border-white/10 pb-1 mb-1">
                        {sprint.sprintName}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-white/60">Duration:</span>
                        <span>{duration} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Progress:</span>
                        <span className="text-blue-400 font-bold">
                          {Math.round(percent)}%
                        </span>
                      </div>
                    </div>

                    {/* The Bar */}
                    <div
                      className="w-10 rounded-t-md relative overflow-hidden bg-muted shadow-xs border border-border group-hover:border-primary/10 transition-all duration-300"
                      style={{ height: `${barHeight}px` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 w-full bg-linear-to-t from-blue-600/90 to-blue-400/90 group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-700 ease-out"
                        style={{ height: `${percent}%` }}
                      >
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-20" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels Row: Stays aligned with bars because it shares the px-12 context */}
            <div className="flex justify-around items-start w-full">
              {displaySprints.map((sprint) => {
                const duration =
                  (sprint.duration.endDate - sprint.duration.startDate) /
                  (1000 * 60 * 60 * 24);
                return (
                  <div
                    key={`label-${sprint._id}`}
                    className="flex flex-col items-center py-3 w-full max-w-[40px] gap-1"
                  >
                    <p className="text-[10px] font-medium text-muted-foreground">
                      {duration}d
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
