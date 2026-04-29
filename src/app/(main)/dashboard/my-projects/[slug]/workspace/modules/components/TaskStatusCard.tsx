"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, LayoutDashboard, MousePointer2 } from "lucide-react";

interface TaskStatusCardProps {
  tasks: any[];
}

const STATUS_COLORS: Record<string, string> = {
  "not started": "#808080", // grayish
  inprogress: "#f59e0b", // amber-500
  reviewing: "#3b82f6", // blue-500
  testing: "#6366f1", // indigo-500
  completed: "#10b981", // emerald-500
};

export const TaskStatusCard = ({ tasks }: TaskStatusCardProps) => {
  const totalTasks = tasks?.length || 0;

  const statusCounts =
    tasks?.reduce(
      (acc: Record<string, number>, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      },
      {
        "not started": 0,
        inprogress: 0,
        reviewing: 0,
        testing: 0,
        completed: 0,
      },
    ) || {};

  const chartData = Object.entries(statusCounts)
    .map(([status, count]) => ({
      name: status,
      value: count,
      fill: STATUS_COLORS[status] || "hsl(var(--muted))",
    }))
    .filter((item) => item.value > 0);

  const chartConfig = Object.fromEntries(
    Object.entries(STATUS_COLORS).map(([status, color]) => [
      status,
      { label: status.charAt(0).toUpperCase() + status.slice(1), color },
    ]),
  );

  return (
    <Card className="p-3! overflow-hidden shadow-sm bg-accent/30 flex flex-col h-full">
      <CardHeader className="px-0 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2 font-semibold tracking-tight">
          <LayoutDashboard className="w-5 h-5!" /> Task Distribution
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] cursor-pointer"
        >
          All Tasks <ClipboardList className="w-3 h-3 ml-1" />
        </Button>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col items-center justify-center -mt-2">
        {totalTasks === 0 ? (
          <div className="py-10 text-center text-muted-foreground text-xs italic">
            No tasks found
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        formatter={(value, name) => (
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">
                              {name}:
                            </span>
                            <span className="font-mono font-bold">{value}</span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        className="hover:opacity-80 transition-all duration-300 cursor-pointer"
                      />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold font-sans"
                              >
                                {totalTasks}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 18}
                                className="fill-muted-foreground text-[10px] tracking-tight font-medium uppercase"
                              >
                                Total Tasks
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-2 w-full px-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: STATUS_COLORS[status] }}
                    />
                    <span className="text-[10px] text-muted-foreground capitalize truncate group-hover:text-foreground transition-colors">
                      {status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold">
                    {count}
                  </span>
                </div>
              ))}
            </div> */}
          </>
        )}
      </CardContent>
    </Card>
  );
};
