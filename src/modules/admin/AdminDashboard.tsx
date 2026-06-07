"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { RefreshCw, Shield, Activity, BarChart2, PieChart, PlaySquare } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { Line, LineChart, Bar, BarChart, Area, AreaChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { Skeleton } from "../../components/ui/skeleton";

const chartConfig = {
  count: {
    label: "Total Users",
    color: "var(--zinc-100)",
    icon: Activity,
  },
} satisfies ChartConfig;

const chartConfigWeekly = {
  count: {
    label: "New Registrations",
    color: "var(--zinc-100)",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const data = useQuery(api.admin.getAdminDashboardData);
  const [activeTab, setActiveTab] = useState<"overview" | "advanced">("overview");
  const [growthChartType, setGrowthChartType] = useState<"bar" | "area">("bar");
  const [trendRange, setTrendRange] = useState<"7d" | "30d" | "60d">("30d");

  const handleRefresh = () => {
    window.location.reload();
  };

  const filteredTrend = useMemo(() => {
    if (!data?.trend) return [];
    if (trendRange === "7d") return data.trend.slice(-7);
    if (trendRange === "60d") return data.trend.slice(-60);
    return data.trend.slice(-30); // Default to 1 month (30 days)
  }, [data?.trend, trendRange]);

  // Loading skeleton dashboard matching layout
  if (data === undefined) {
    return (
      <div className="min-h-screen bg-black text-zinc-400 font-sans p-4 sm:p-8 selection:bg-zinc-800">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3 sm:gap-0">
            <div className="space-y-1">
              <Skeleton className="h-6 w-40 bg-zinc-900" />
              <Skeleton className="h-4 w-60 bg-zinc-900" />
            </div>
            <Skeleton className="h-8 w-20 bg-zinc-900" />
          </header>

          <div className="flex border-b border-border/40 gap-4 mb-6">
            <Skeleton className="h-5 w-20 bg-zinc-900" />
            <Skeleton className="h-5 w-28 bg-zinc-900" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-3">
                <Skeleton className="h-4 w-24 bg-zinc-900" />
                <Skeleton className="h-8 w-16 bg-zinc-900" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4">
                <Skeleton className="h-4 w-32 bg-zinc-900" />
                <Skeleton className="h-60 w-full bg-zinc-900" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-400 font-sans p-4 sm:p-8 selection:bg-zinc-800">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3 sm:gap-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-500" />
              <h1 className="text-xl text-zinc-100 font-light tracking-tight">Admin Console</h1>
            </div>
            <p className="text-xs text-zinc-650 font-light">
              Overviewing system metrics, user growth, and active customer queries.
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-xs text-zinc-500 hover:text-zinc-300 font-mono flex items-center gap-1.5 cursor-pointer transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </header>

        {/* Tab Selection */}
        <div className="flex border-b border-border/20 gap-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2 text-[10px] font-mono tracking-wider transition-colors cursor-pointer border-b ${
              activeTab === "overview"
                ? "border-zinc-150 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`pb-2 text-[10px] font-mono tracking-wider transition-colors cursor-pointer border-b ${
              activeTab === "advanced"
                ? "border-zinc-150 text-zinc-100"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            ADVANCED VIEW
          </button>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* 4 Stat Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Total Users */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-2">
                <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono">Total Users</div>
                <div className="text-3xl text-zinc-100 font-light tracking-tight">{data.stats.totalUsers}</div>
              </div>

              {/* Plan Distribution */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-3">
                <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono">Plans Breakdown</div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-light">Free</span>
                  <span className="text-zinc-200 font-mono">{data.stats.freeUsers}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-border/40 pt-2">
                  <span className="text-zinc-500 font-light">Plus</span>
                  <span className="text-zinc-200 font-mono">{data.stats.plusUsers}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-border/40 pt-2">
                  <span className="text-zinc-500 font-light">Pro</span>
                  <span className="text-zinc-200 font-mono">{data.stats.proUsers}</span>
                </div>
              </div>

              {/* Onboarding milestone completions */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-3">
                <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono">Onboarding Check</div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-light">Getting Started</span>
                  <span className="text-zinc-200 font-mono">{data.stats.completedGettingStarted}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-border/40 pt-2">
                  <span className="text-zinc-500 font-light">Completed Onboarding</span>
                  <span className="text-zinc-200 font-mono">{data.stats.completedOnboarding}</span>
                </div>
              </div>

              {/* Support Queries Count */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-2">
                <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono">Support Queries</div>
                <div className="text-3xl text-zinc-100 font-light tracking-tight">{data.stats.totalQueries}</div>
              </div>
            </div>

            {/* Growth & Trend Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Trend Chart (Step Area Chart) */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono">User Growth Trend</div>
                  <div className="flex bg-black p-0.5 rounded border border-border">
                    {(["7d", "30d", "60d"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setTrendRange(r)}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                          trendRange === r
                            ? "bg-zinc-800 text-zinc-100"
                            : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {r.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredTrend.length === 0 ? (
                  <div className="h-[200px] sm:h-[240px] flex items-center justify-center text-xs text-zinc-600 font-light">No trend data available</div>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[200px] sm:h-[240px] w-full">
                    <AreaChart
                      accessibilityLayer
                      data={filteredTrend}
                      margin={{
                        left: 12,
                        right: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} stroke="#161618" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={10}
                        stroke="#52525b"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={10}
                        stroke="#52525b"
                        domain={["auto", "auto"]}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <defs>
                        <linearGradient id="fillTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e4e4e7" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#e4e4e7" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="count"
                        type="step"
                        fill="url(#fillTrend)"
                        fillOpacity={1}
                        stroke="#e4e4e7"
                        strokeWidth={1}
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </div>

              {/* Growth per Week Chart (Bar / Area toggleable) */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono">Growth per Week</div>
                  <div className="flex bg-black p-0.5 rounded border border-border">
                    <button
                      onClick={() => setGrowthChartType("bar")}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                        growthChartType === "bar"
                          ? "bg-zinc-800 text-zinc-100"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      BAR
                    </button>
                    <button
                      onClick={() => setGrowthChartType("area")}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all cursor-pointer ${
                        growthChartType === "area"
                          ? "bg-zinc-800 text-zinc-100"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      AREA
                    </button>
                  </div>
                </div>

                {data.weeklyGrowth.length === 0 ? (
                  <div className="h-[200px] sm:h-[240px] flex items-center justify-center text-xs text-zinc-600 font-light">No weekly data available</div>
                ) : (
                  <ChartContainer config={chartConfigWeekly} className="h-[200px] sm:h-[240px] w-full">
                    {growthChartType === "bar" ? (
                      <BarChart
                        accessibilityLayer
                        data={data.weeklyGrowth}
                        margin={{
                          top: 20,
                        }}
                      >
                        <CartesianGrid vertical={false} stroke="#161618" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="week"
                          tickLine={false}
                          tickMargin={10}
                          axisLine={false}
                          fontSize={10}
                          stroke="#52525b"
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={10}
                          stroke="#52525b"
                          domain={["auto", "auto"]}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="count" fill="#f4f4f5" radius={8}>
                          <LabelList
                            dataKey="count"
                            position="top"
                            offset={12}
                            className="fill-zinc-400 font-mono"
                            fontSize={10}
                          />
                        </Bar>
                      </BarChart>
                    ) : (
                      <AreaChart
                        accessibilityLayer
                        data={data.weeklyGrowth}
                        margin={{
                          top: 10,
                          right: 10,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid vertical={false} stroke="#161618" strokeDasharray="3 3" />
                        <XAxis
                          dataKey="week"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={10}
                          stroke="#52525b"
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          fontSize={10}
                          stroke="#52525b"
                          domain={["auto", "auto"]}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <defs>
                          <linearGradient id="fillWeekly" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e4e4e7" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#e4e4e7" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#e4e4e7"
                          strokeWidth={1}
                          fill="url(#fillWeekly)"
                        />
                      </AreaChart>
                    )}
                  </ChartContainer>
                )}
              </div>
            </div>

            {/* Dual Column list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Recent Users (2/3 width) */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4 lg:col-span-2 overflow-x-auto">
                <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono border-b border-border/40 pb-3">Recent Users</div>
                
                {/* Table Heading */}
                <div className="grid grid-cols-[1.2fr_1.5fr_1.3fr_0.8fr_0.7fr] gap-4 text-[9px] text-zinc-500 uppercase font-mono border-b border-border/40 pb-2 font-light min-w-[600px]">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Joined At</div>
                  <div>Onboarded</div>
                  <div className="text-right">Plan</div>
                </div>

                <div className="divide-y divide-zinc-900/40 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar min-w-[600px]">
                  {data.recentUsers.length === 0 ? (
                    <div className="py-8 text-center text-zinc-650 text-xs font-light">No users found</div>
                  ) : (
                    data.recentUsers.map((user) => (
                      <div key={user._id} className="grid grid-cols-[1.2fr_1.5fr_1.3fr_0.8fr_0.7fr] gap-4 items-center text-xs py-3 border-b border-border/40 last:border-0 last:pb-0">
                        {/* Name */}
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-6 h-6 rounded-md border border-border bg-black flex items-center justify-center overflow-hidden shrink-0">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[8px] text-zinc-500 font-mono">{user.name.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="text-zinc-200 font-light truncate">{user.name}</span>
                        </div>

                        {/* Email */}
                        <div className="text-zinc-400 truncate" title={user.email}>
                          {user.email}
                        </div>

                        {/* Joined At (Date, Month, and exact time) */}
                        <div className="text-zinc-400 font-mono text-[10px]">
                          {new Date(user.createdAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true
                          })}
                        </div>

                        {/* Onboarded */}
                        <div className="text-zinc-455 font-light">
                          <span className={user.hasCompletedOnboarding ? "text-zinc-400" : "text-zinc-600"}>
                            {user.hasCompletedOnboarding ? "Yes" : "No"}
                          </span>
                        </div>

                        {/* Plan */}
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-[4px] text-[9px] uppercase font-mono tracking-wider border border-border text-zinc-400 bg-black">
                            {user.accountType}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Support Queries (1/3 width) */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4 lg:col-span-1">
                <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono border-b border-border/40 pb-3">Support Queries</div>
                <div className="divide-y divide-zinc-900/40 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {data.queries.length === 0 ? (
                    <div className="py-8 text-center text-zinc-650 text-xs font-light">No support queries found</div>
                  ) : (
                    data.queries.map((q) => (
                      <div key={q._id} className="py-4 space-y-2 first:pt-0 border-b border-border/40 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-zinc-200 text-xs font-light leading-snug">{q.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-1.5 py-0.5 rounded-[4px] text-[8px] font-mono tracking-wider border border-border text-zinc-500 bg-black">
                                {q.reason}
                              </span>
                              <span className="text-zinc-650 text-[9px] font-mono">
                                {new Date(q.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-500 leading-relaxed font-light break-words">{q.description}</p>

                        <div className="flex items-center gap-2 pt-1">
                          <div className="w-5 h-5 rounded-md border border-border bg-black flex items-center justify-center overflow-hidden">
                            {q.userAvatar ? (
                              <img src={q.userAvatar} alt={q.userName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[8px] text-zinc-500 font-mono">{q.userName.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500 font-light truncate">{q.userName}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Advanced View Tab */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Acquisition Channels Card */}
            <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4">
              <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono border-b border-border/40 pb-3 flex items-center gap-2">
                <BarChart2 className="w-3.5 h-3.5 text-zinc-500" />
                Acquisition Channels (Heard From)
              </div>
              <div className="space-y-4">
                {data.advanced.heardFrom.length === 0 ? (
                  <div className="py-8 text-center text-zinc-650 text-xs font-light">No source data recorded</div>
                ) : (
                  data.advanced.heardFrom.map((item) => (
                    <div key={item.source} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-300 font-light">{item.source}</span>
                        <span className="text-zinc-100 font-mono">{item.count}</span>
                      </div>
                      <div className="w-full h-1 bg-zinc-950 rounded border border-border/10 overflow-hidden">
                        <div 
                          className="h-full bg-zinc-400" 
                          style={{ width: `${(item.count / Math.max(1, data.stats.totalUsers)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Free Trial Usage Card */}
            <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4">
              <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono border-b border-border/40 pb-3 flex items-center gap-2">
                <PieChart className="w-3.5 h-3.5 text-zinc-500" />
                Free Trial Usage
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 font-light">Claimed Trials</span>
                    <span className="text-zinc-100 font-mono">{data.advanced.freeTrial.used}</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-950 rounded border border-border/10 overflow-hidden">
                    <div 
                      className="h-full bg-zinc-450" 
                      style={{ width: `${(data.advanced.freeTrial.used / Math.max(1, data.stats.totalUsers)) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 font-light">Unclaimed Trials</span>
                    <span className="text-zinc-100 font-mono">{data.advanced.freeTrial.unused}</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-950 rounded border border-border/10 overflow-hidden">
                    <div 
                      className="h-full bg-zinc-700" 
                      style={{ width: `${(data.advanced.freeTrial.unused / Math.max(1, data.stats.totalUsers)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Conversions Card */}
            <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4">
              <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono border-b border-border/40 pb-3">
                Referral Conversions
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-350 font-light">Referred Users</span>
                  <span className="text-zinc-100 font-mono text-lg">{data.advanced.referrals.totalUsed}</span>
                </div>
              </div>
            </div>

            {/* Tutorial Views Card */}
            <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4">
              <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono border-b border-border/40 pb-3 flex items-center gap-2">
                <PlaySquare className="w-3.5 h-3.5 text-zinc-500" />
                Tutorial Views
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-350 font-light">Task Tutorial</span>
                  <span className="text-zinc-100 font-mono">{data.advanced.tutorials.task}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-border/20 pt-2">
                  <span className="text-zinc-350 font-light">Issue Tutorial</span>
                  <span className="text-zinc-100 font-mono">{data.advanced.tutorials.issue}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-border/20 pt-2">
                  <span className="text-zinc-350 font-light">Sprint Tutorial</span>
                  <span className="text-zinc-100 font-mono">{data.advanced.tutorials.sprint}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-border/20 pt-2">
                  <span className="text-zinc-350 font-light">Time Logs Tutorial</span>
                  <span className="text-zinc-100 font-mono">{data.advanced.tutorials.timeLogs}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
