"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarProps,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Doc } from "../../../../convex/_generated/dataModel";
import { format, subDays, isSameDay } from "date-fns";

interface SprintAnalyticsProps {
  tasks: Doc<"tasks">[];
}

const chartConfig = {
  backlog: {
    label: "Backlog",
    color: "#ef4444",
  },
  inprogress: {
    label: "In Progress",
    color: "#3b82f6",
  },
  completed: {
    label: "Completed",
    color: "#22c55e",
  },
  review: {
    label: "Reviewing",
    color: "#3b82f6",
  },
  testing: {
    label: "Testing",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export const SprintAnalytics = ({ tasks }: SprintAnalyticsProps) => {
  // --- FOCUS DATA (Pie Charts) ---
  const focusData = useMemo(() => {
    const backlog = tasks.filter((t) => t.status === "not started");
    const current = tasks.filter((t) => ["inprogress", "reviewing", "testing"].includes(t.status));
    const completed = tasks.filter((t) => t.status === "completed");

    const getPriorityDistribution = (taskList: Doc<"tasks">[]) => {
      const total = taskList.length;
      if (total === 0) {
        return [{ name: "No Data", value: 1, fill: "#334155", opacity: 0.4, stroke: "rgba(255,255,255,0.05)" }];
      }

      return [
        { name: "High", value: taskList.filter((t) => t.priority === "high").length, fill: "#ef4444" },   // Red
        { name: "Medium", value: taskList.filter((t) => t.priority === "medium").length, fill: "#22c55e" }, // Green
        { name: "Low", value: taskList.filter((t) => t.priority === "low").length, fill: "#eab308" },    // Yellow
        { name: "None", value: taskList.filter((t) => !t.priority).length, fill: "#64748b" },    // Slate
      ].filter(segment => segment.value > 0);
    };

    return {
      backlog: { total: backlog.length, data: getPriorityDistribution(backlog) },
      current: { total: current.length, data: getPriorityDistribution(current) },
      completed: { total: completed.length, data: getPriorityDistribution(completed) },
    };
  }, [tasks]);

  // --- CADENCE DATA (Bar Chart) ---
  const cadenceData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));
    
    return last7Days.map((date) => {
      const dayTasks = tasks.filter((t) => isSameDay(new Date(t.createdAt), date));
      return {
        date: format(date, "MM/dd"),
        backlog: dayTasks.filter((t) => t.status === "not started").length,
        current: dayTasks.filter((t) => ["inprogress", "reviewing", "testing"].includes(t.status)).length,
        completed: dayTasks.filter((t) => t.status === "completed").length,
      };
    });
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* TEAM FOCUS */}
      <div className="bg-card/50 rounded-2xl p-6 border border-border/40 shadow-sm backdrop-blur-xs flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold tracking-tight">Team Focus</h2>
          {/* Priority Legend */}
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase">High</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Med</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#eab308]" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase">Low</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#64748b]" />
                <span className="text-[10px] text-muted-foreground font-medium uppercase">None</span>
             </div>
          </div>
        </div>
        <div className="flex justify-around items-end gap-4 h-[220px] mt-auto">
          {/* Backlog Pie */}
          <FocusPie 
            title="Backlog" 
            total={focusData.backlog.total} 
            data={focusData.backlog.data} 
          />
          {/* Current Pie */}
          <FocusPie 
            title="Current" 
            total={focusData.current.total} 
            data={focusData.current.data} 
          />
          {/* Complete Pie */}
          <FocusPie 
            title="Complete" 
            total={focusData.completed.total} 
            data={focusData.completed.data} 
          />
        </div>
      </div>

      {/* TEAM CADENCE */}
      <div className="bg-card/50 rounded-2xl p-6 border border-border/40 shadow-sm backdrop-blur-xs flex flex-col">
        <h2 className="text-xl font-semibold tracking-tight mb-8">
          Team Inflection <span className="text-muted-foreground/60 font-normal ml-2 text-sm">(Complete)</span>
        </h2>
        <div className="h-[220px] w-full mt-auto">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart data={cadenceData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} 
                dy={10} 
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="completed" 
                stackId="a" 
                fill="#22c55e" 
                radius={[0, 0, 0, 0]} 
                barSize={40}
              />
              <Bar 
                dataKey="current" 
                stackId="a" 
                fill="#3b82f6" 
                barSize={40}
              />
              <Bar 
                dataKey="backlog" 
                stackId="a" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

const FocusPie = ({ title, total, data }: { title: string; total: number; data: any[] }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="px-3 py-0.5 rounded-full border bg-muted/30 text-[10px] font-semibold text-muted-foreground mb-1 shadow-sm">
        {total}
      </div>
      <div className="w-32 h-32 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={35}
              outerRadius={55}
              paddingAngle={data[0]?.name === "No Data" ? 0 : 2}
              dataKey="value"
              stroke="none"
              animationDuration={1000}
              animationBegin={200}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  fillOpacity={entry.opacity ?? 1} 
                  stroke={entry.stroke ?? "none"}
                  strokeWidth={1}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <span className="text-sm font-medium text-muted-foreground mt-2">{title}</span>
    </div>
  );
};
