"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { RefreshCw, Shield, Activity, BarChart2, PieChart, PlaySquare, Copy, Check, Mail, Send, X } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { Line, LineChart, Bar, BarChart, Area, AreaChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";
import { Skeleton } from "../../components/ui/skeleton";

const chartConfigTrend = {
  signups: {
    label: "New Signups",
    color: "#ffffff",
    icon: Activity,
  },
} satisfies ChartConfig;

const chartConfigCumulative = {
  cumulative: {
    label: "Total Users",
    color: "#ffffff",
  },
} satisfies ChartConfig;

const chartConfigComparison = {
  signups: {
    label: "New Signups",
    color: "#ffffff",
  },
  onboarded: {
    label: "Completed Onboarding",
    color: "#10b981",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const data = useQuery(api.admin.getAdminDashboardData);
  const [activeTab, setActiveTab] = useState<"overview" | "advanced">("overview");
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("7d");

  const handleRefresh = () => {
    window.location.reload();
  };

  const trendChartData = useMemo(() => {
    return data?.timeframeCharts?.[timeframe] ?? [];
  }, [data?.timeframeCharts, timeframe]);

  const dailyTimeframe = timeframe === "24h" ? "7d" : timeframe;

  const dailyChartData = useMemo(() => {
    return data?.timeframeCharts?.[dailyTimeframe] ?? [];
  }, [data?.timeframeCharts, dailyTimeframe]);

  // Email Copy & Send States
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailStatus, setEmailStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: boolean;
  }>({
    loading: false,
    error: null,
    success: false,
  });

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2000);
  };

  const handleOpenEmailModal = (email: string) => {
    setEmailTo(email);
    setEmailSubject("");
    setEmailBody("");
    setEmailStatus({ loading: false, error: null, success: false });
    setIsEmailModalOpen(true);
  };

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus({ loading: true, error: null, success: false });

    try {
      const response = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          htmlContent: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
              <h2 style="border-bottom: 1px solid #eaeaea; padding-bottom: 10px; color: #111;">WeKraft Team Message</h2>
              <div style="font-size: 14px; color: #333; line-height: 1.6; white-space: pre-wrap; margin-top: 15px;">
                ${emailBody}
              </div>
              <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 20px;" />
              <p style="font-size: 12px; color: #666;">This message was sent by the WeKraft Admin Console.</p>
            </div>
          `,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || "Failed to send email");
      }

      setEmailStatus({ loading: false, error: null, success: true });
      toast.success(resData.mock ? "Email simulated successfully!" : "Email sent successfully!");
      setTimeout(() => {
        setIsEmailModalOpen(false);
      }, 1500);
    } catch (err: any) {
      setEmailStatus({ loading: false, error: err.message, success: false });
      toast.error(err.message || "Failed to send email");
    }
  };

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

            {/* Charts Section Header with Unified Timeframe Toggle */}
            <div className="flex items-center justify-between border-b border-border/20 pb-3">
              <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono">Performance Analytics</div>
              <div className="flex bg-black p-0.5 rounded border border-border">
                {(["24h", "7d", "30d"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 rounded text-[9px] font-mono transition-all cursor-pointer ${
                      timeframe === t
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {t === "30d" ? "1M" : t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Growth & Trend Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 1: User Growth Trend (Spikes) */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4">
                <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono border-b border-border/40 pb-2">
                  User Growth Trend (Spikes - {timeframe.toUpperCase()})
                </div>
                {trendChartData.length === 0 ? (
                  <div className="h-[200px] sm:h-[240px] flex items-center justify-center text-xs text-zinc-600 font-light">No trend data available</div>
                ) : (
                  <ChartContainer config={chartConfigTrend} className="h-[200px] sm:h-[240px] w-full">
                    <AreaChart
                      accessibilityLayer
                      data={trendChartData}
                      margin={{
                        left: 12,
                        right: 12,
                        top: 10,
                      }}
                    >
                      <CartesianGrid vertical={false} stroke="#161618" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={9}
                        stroke="#52525b"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={9}
                        stroke="#52525b"
                        domain={["auto", "auto"]}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <defs>
                        <linearGradient id="fillSignups" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="signups"
                        type="monotone"
                        fill="url(#fillSignups)"
                        fillOpacity={1}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    </AreaChart>
                  </ChartContainer>
                )}
              </div>

              {/* Chart 2: Daily Cumulative Users (Bar Chart) */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4">
                <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono border-b border-border/40 pb-2">
                  Total Cumulative Users ({dailyTimeframe === "30d" ? "1M" : dailyTimeframe.toUpperCase()})
                </div>
                {dailyChartData.length === 0 ? (
                  <div className="h-[200px] sm:h-[240px] flex items-center justify-center text-xs text-zinc-600 font-light">No data available</div>
                ) : (
                  <ChartContainer config={chartConfigCumulative} className="h-[200px] sm:h-[240px] w-full">
                    <BarChart
                      accessibilityLayer
                      data={dailyChartData}
                      margin={{
                        top: 20,
                        left: 12,
                        right: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} stroke="#161618" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        tickMargin={8}
                        axisLine={false}
                        fontSize={9}
                        stroke="#52525b"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={9}
                        stroke="#52525b"
                        domain={["auto", "auto"]}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar dataKey="cumulative" fill="#f4f4f5" radius={[4, 4, 0, 0]}>
                        {dailyTimeframe !== "30d" && (
                          <LabelList
                            dataKey="cumulative"
                            position="top"
                            offset={8}
                            className="fill-zinc-400 font-mono"
                            fontSize={9}
                          />
                        )}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </div>

              {/* Chart 3: Signups vs Onboarding (Dual Area Chart) */}
              <div className="border border-border bg-sidebar p-4 sm:p-6 rounded-lg space-y-4">
                <div className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono border-b border-border/40 pb-2">
                  Signups vs Onboarding ({dailyTimeframe === "30d" ? "1M" : dailyTimeframe.toUpperCase()})
                </div>
                {dailyChartData.length === 0 ? (
                  <div className="h-[200px] sm:h-[240px] flex items-center justify-center text-xs text-zinc-600 font-light">No comparative data available</div>
                ) : (
                  <ChartContainer config={chartConfigComparison} className="h-[200px] sm:h-[240px] w-full">
                    <AreaChart
                      accessibilityLayer
                      data={dailyChartData}
                      margin={{
                        left: 12,
                        right: 12,
                        top: 10,
                      }}
                    >
                      <CartesianGrid vertical={false} stroke="#161618" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={9}
                        stroke="#52525b"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={9}
                        stroke="#52525b"
                        domain={["auto", "auto"]}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                      />
                      <defs>
                        <linearGradient id="fillSignupsCompare" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ffffff" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#ffffff" stopOpacity={0.01} />
                        </linearGradient>
                        <linearGradient id="fillOnboardedCompare" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <Area
                        dataKey="signups"
                        type="monotone"
                        fill="url(#fillSignupsCompare)"
                        fillOpacity={1}
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                      <Area
                        dataKey="onboarded"
                        type="monotone"
                        fill="url(#fillOnboardedCompare)"
                        fillOpacity={1}
                        stroke="#10b981"
                        strokeWidth={1.5}
                      />
                    </AreaChart>
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
                        <div className="text-zinc-400 flex items-center justify-between gap-3 w-full min-w-0" title={user.email}>
                          <span className="truncate">{user.email}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleCopyEmail(user.email)}
                              className="p-0.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Copy Email"
                            >
                              {copiedEmail === user.email ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEmailModal(user.email)}
                              className="p-0.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-5 h-5 rounded-md border border-border bg-black flex items-center justify-center overflow-hidden shrink-0">
                              {q.userAvatar ? (
                                <img src={q.userAvatar} alt={q.userName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[8px] text-zinc-500 font-mono">{q.userName.slice(0, 2).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[10px] text-zinc-400 font-light truncate">{q.userName}</span>
                              <span className="text-[8px] text-zinc-600 truncate">{q.userEmail}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleCopyEmail(q.userEmail)}
                              className="p-0.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Copy Email"
                            >
                              {copiedEmail === q.userEmail ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <button
                              onClick={() => handleOpenEmailModal(q.userEmail)}
                              className="p-0.5 hover:bg-zinc-800 rounded text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Send Email"
                            >
                              <Mail className="w-3 h-3" />
                            </button>
                          </div>
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

      {/* Send Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="border border-border bg-sidebar w-full max-w-md rounded-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-sm text-zinc-200 font-mono flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-500" /> Send Email
              </h3>
              <button
                onClick={handleCloseEmailModal}
                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 hover:bg-zinc-800 rounded cursor-pointer border-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-mono">Recipient</label>
                <input
                  type="email"
                  value={emailTo}
                  disabled
                  className="w-full bg-black border border-border/60 rounded px-3 py-2 text-xs text-zinc-400 font-mono focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-mono">Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full bg-black border border-border rounded px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-zinc-500 uppercase font-mono">Message Body</label>
                <textarea
                  required
                  rows={6}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-black border border-border rounded px-3 py-2 text-xs text-zinc-250 focus:outline-none focus:border-zinc-500 font-sans resize-none"
                />
              </div>

              {emailStatus.error && (
                <div className="text-[10px] text-rose-500 font-mono">{emailStatus.error}</div>
              )}
              {emailStatus.success && (
                <div className="text-[10px] text-emerald-500 font-mono">Email sent successfully!</div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseEmailModal}
                  className="px-3 py-1.5 rounded text-[10px] uppercase font-mono tracking-wider text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={emailStatus.loading}
                  className="px-4 py-1.5 rounded text-[10px] uppercase font-mono tracking-wider bg-zinc-200 hover:bg-white text-black transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed font-medium border-0"
                >
                  {emailStatus.loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Send
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
