"use client";

import * as React from "react";
import { useQuery } from "convex/react";
import { ChevronLeft, ChevronRight, Gem } from "lucide-react";
import { PieChart, Pie, Label } from "recharts";
import { api } from "../../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  ChartContainer,
  type ChartConfig,
} from "@/components/ui/chart";

interface RightSidebarProps {
  isRightSidebarExpanded: boolean;
  setIsRightSidebarExpanded: (expanded: boolean) => void;
}

// Helper to format bytes into human readable format
const formatBytes = (bytes: number, decimals = 1) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export default function RightSidebar({
  isRightSidebarExpanded,
  setIsRightSidebarExpanded,
}: RightSidebarProps) {
  const [mounted, setMounted] = React.useState(false);
  const currentUser = useQuery(api.user.getCurrentUser);
  const userLimits = useQuery(api.user.getUserLimits);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Compute Cloud Storage usage and limits
  const cloudStorageLimit = userLimits?.cloud_storage ?? 2 * 1024 * 1024 * 1024;
  const cloudStorageUsage = currentUser?.cloudStorageUsage ?? 0;
  const rawStoragePercentage = (cloudStorageUsage / cloudStorageLimit) * 100;

  // Format percentage to a clean decimal if small but > 0
  const storagePercentageString = rawStoragePercentage > 0 && rawStoragePercentage < 1
    ? rawStoragePercentage.toFixed(2)
    : Math.round(rawStoragePercentage).toString();

  const storagePercentage = Math.min(100, Math.max(0.1, rawStoragePercentage));
  const cloudStorageLeft = Math.max(0, cloudStorageLimit - cloudStorageUsage);

  // Compute Kaya AI Usage based on constant 360 calls limit
  const kayaUsage = currentUser?.kayaUsage ?? 0;
  const rawKayaPercentage = (kayaUsage / 360) * 100;

  // Format percentage to a clean decimal if small but > 0
  const kayaPercentageString = rawKayaPercentage > 0 && rawKayaPercentage < 1
    ? rawKayaPercentage.toFixed(2)
    : Math.round(rawKayaPercentage).toString();

  const kayaPercentage = Math.min(100, Math.max(0.1, rawKayaPercentage));
  const rawKayaRemaining = Math.max(0, 100 - rawKayaPercentage);
  const kayaRemainingString = rawKayaRemaining > 99 && rawKayaRemaining < 100
    ? rawKayaRemaining.toFixed(2)
    : Math.round(rawKayaRemaining).toString();

  // Kaya Chart Data (Used vs Remaining)
  const kayaChartData = React.useMemo(() => {
    return [
      { name: "Used", value: kayaPercentage, fill: "var(--chart-1)" },
      { name: "Remaining", value: 100 - kayaPercentage, fill: "rgba(255,255,255,0.06)" },
    ];
  }, [kayaPercentage]);

  const kayaChartConfig = {
    value: {
      label: "Used",
    },
  } satisfies ChartConfig;

  // Storage Chart Data (Used vs Remaining)
  const storageChartData = React.useMemo(() => {
    return [
      { name: "Used", value: storagePercentage, fill: "var(--chart-2)" },
      { name: "Remaining", value: 100 - storagePercentage, fill: "rgba(255,255,255,0.06)" },
    ];
  }, [storagePercentage]);

  const storageChartConfig = {
    value: {
      label: "Used",
    },
  } satisfies ChartConfig;

  const accountType = currentUser?.accountType || "free";

  const promoContent = React.useMemo(() => {
    if (accountType === "pro") {
      return {
        title: "Pro Plan Active",
        description: "You have unlocked all elite features:",
        features: [
          "Unlimited cloud storage",
          "AI agents and automations",
          "Priority 24/7 support",
          "Full enterprise suite"
        ]
      };
    }
    if (accountType === "plus") {
      return {
        title: "Upgrade to Pro",
        description: "Get elite features to scale your projects:",
        features: [
          "Higher limits on cloud storage",
          "AI agents and automations",
          "Priority support"
        ]
      };
    }
    return {
      title: "Upgrade to Plus",
      description: "Get premium features to boost collaboration:",
      features: [
        "Higher cloud storage",
        "Higher member seat per project",
        "Advance project analysis",
        "And much more..."
      ]
    };
  }, [accountType]);

  return (
    <div
      id="tour-right-sidebar"
      className={cn(
        "relative transition-all duration-200 ease-in-out shrink-0 w-full lg:self-stretch min-h-screen",
        isRightSidebarExpanded ? "w-80" : "w-14"
      )}
    >
      {/* Expand/Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setIsRightSidebarExpanded(!isRightSidebarExpanded)}
        className="w-5 h-14 bg-primary hover:bg-primary/95 text-primary-foreground absolute top-[45%] -left-2.5 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all duration-200 z-20 focus:outline-none focus:ring-1 focus:ring-primary/50"
        aria-label={isRightSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isRightSidebarExpanded ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Sidebar Content Container */}
      <div
        className={cn(
          "flex flex-col h-full min-h-screen items-center justify-start border border-border bg-card dark:bg-sidebar rounded text-center text-muted-foreground/50 text-xs transition-all duration-300 py-6",
          isRightSidebarExpanded ? "px-4" : "px-1"
        )}
      >
        {isRightSidebarExpanded && (
          <div className="flex flex-col gap-6 w-full h-[calc(100vh-80px)]">

            {/* Card 1: Upgrade Promotion / Plan Details */}
            <div className="relative overflow-hidden bg-linear-to-br dark:from-black/75 from-white to-blue-700/60  border-accent rounded-xl p-4.5 flex flex-col justify-between shadow-lg flex-1 min-h-0 text-left">
              <div className="space-y-3.5 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80 bg-white/20 px-2 py-0.5 rounded-full capitalize">
                    Current Plan: {accountType}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-tight">{promoContent.title}</h4>
                  <p className="text-[10px] text-blue-100/80 leading-normal font-medium">{promoContent.description}</p>
                </div>

                <ul className="space-y-1.5 text-[10px] text-blue-50/90 font-semibold">
                  {promoContent.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom right background illustration */}
              <img
                src="/22.svg"
                alt="Upgrade illustration"
                className="absolute -bottom-2 -right-2 w-24 h-24  object-cover pointer-events-none select-none z-0"
              />
            </div>

            {/* Card 2: AI Usage */}
            <div className="bg-sidebar border border-accent rounded-md p-3.5 flex flex-col items-center justify-between text-center shadow-sm flex-1 min-h-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0 mb-1">
                AI Usage
              </div>

              {mounted ? (
                <div className="flex-1 flex items-center justify-center min-h-0 w-full relative">
                  <ChartContainer config={kayaChartConfig} className="w-[120px] h-[120px] aspect-square shrink-0">
                    <PieChart>
                      <Pie
                        data={kayaChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={36}
                        outerRadius={50}
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-sm font-bold">
                                    {kayaPercentageString}%
                                  </tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 12} className="fill-muted-foreground text-[8px] tracking-wide">
                                    Used
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground/40">Loading Chart...</span>
                </div>
              )}

              <div className="text-[10px] text-muted-foreground shrink-0 mt-2 space-y-0.5 w-full">
                <div>Used: <span className="font-semibold text-foreground">{kayaPercentageString}%</span></div>
                <div className="text-muted-foreground/80 font-semibold">{kayaRemainingString}% left</div>
              </div>
            </div>

            {/* Card 3: Cloud Storage */}
            <div className="bg-sidebar border border-accent rounded-md p-3.5 flex flex-col items-center justify-between text-center shadow-sm flex-1 min-h-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 shrink-0 mb-1">
                Cloud Storage
              </div>

              {mounted ? (
                <div className="flex-1 flex items-center justify-center min-h-0 w-full relative">
                  <ChartContainer config={storageChartConfig} className="w-[120px] h-[120px] aspect-square shrink-0">
                    <PieChart>
                      <Pie
                        data={storageChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={36}
                        outerRadius={50}
                        startAngle={90}
                        endAngle={-270}
                        strokeWidth={0}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-sm font-bold">
                                    {storagePercentageString}%
                                  </tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 12} className="fill-muted-foreground text-[8px] tracking-wide">
                                    Used
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground/40">Loading Chart...</span>
                </div>
              )}

              <div className="text-[10px] text-muted-foreground shrink-0 mt-2 space-y-0.5 w-full">
                <div>Used: <span className="font-semibold text-foreground">{formatBytes(cloudStorageUsage)}</span> / {formatBytes(cloudStorageLimit)}</div>
                <div className="text-muted-foreground/80 font-semibold">{formatBytes(cloudStorageLeft)} left</div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
