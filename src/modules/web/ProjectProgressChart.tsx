"use client";

import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";

const baseData = [
  { sprint: "Week 1", velocity: 40, completed: 5 },
  { sprint: "Week 2", velocity: 58, completed: 11 },
  { sprint: "Week 3", velocity: 62, completed: 10 },
  { sprint: "Week 4", velocity: 74, completed: 18 },
  { sprint: "Week 5", velocity: 78, completed: 16 },
  { sprint: "Week 6", velocity: 87, completed: 26 },
  { sprint: "Week 7", velocity: 91, completed: 25 },
  { sprint: "Week 8", velocity: 96, completed: 33 },
];

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-neutral-950 border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl text-xs flex flex-col gap-1">
      <p className="text-neutral-500 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-white font-bold text-sm">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: i === 0 ? "#3b82f6" : "#ffffff" }}
          />
          {p.value}
        </div>
      ))}
    </div>
  );
};

export function ProjectProgressChart() {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setAnimKey((k) => k + 1), 7000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Area Chart */}
      <motion.div
        key={animKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full"
      >
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={baseData}
            margin={{ top: 12, right: 4, left: -28, bottom: 0 }}
          >
            <defs>
              {/* Blue gradient fill for velocity */}
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="75%" stopColor="#3b82f6" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              {/* White gradient fill for completed */}
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.03)"
              vertical={false}
            />
            <XAxis
              dataKey="sprint"
              tick={{ fill: "#fff", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#fff", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
            />

            {/* Velocity — blue */}
            <Area
              type="monotone"
              dataKey="velocity"
              name="Velocity"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#velocityGradient)"
              dot={false}
              activeDot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 1.5 }}
              isAnimationActive
              animationDuration={1400}
              animationEasing="ease-out"
            />

            {/* Completed — white */}
            <Area
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={1.5}
              fill="url(#completedGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#ffffff", stroke: "#3b82f6", strokeWidth: 1.5 }}
              isAnimationActive
              animationDuration={1600}
              animationEasing="ease-out"
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Minimal inline legend */}
      <div className="flex items-center gap-5 px-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 rounded-full bg-blue-500" />
          <span className="text-neutral-100 text-xs font-medium tracking-wide">Team Velocity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 rounded-full bg-white/50" />
          <span className="text-neutral-100 text-xs font-medium tracking-wide">Tasks Completed</span>
        </div>
      </div>
    </div>
  );
}
