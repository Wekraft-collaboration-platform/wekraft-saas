/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery as useConvexQuery } from "convex/react";
import { getContributionStats } from "../action/action";
import { api } from "../../../../convex/_generated/api";
import { GitCommitHorizontal, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Constants ──────────────────────────────────────────────────────────────
const CELL = 11;
const GAP  = 3;
const STEP = CELL + GAP;
const ROWS = 7;

const LIGHT_PALETTE = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
const DARK_PALETTE  = ["#161b22", "#10442aff", "#006d32", "#26a641", "#39d353"];

// Helper to get YYYY-MM-DD in local time
function formatDateLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Grid builder (full calendar year Jan 1 → Dec 31) ────────────────────────
function buildYearGrid(
  contributions: { date: string; count: number; level: number }[],
  year: number,
) {
  const map: Record<string, { count: number; level: number }> = {};
  contributions.forEach((c) => { map[c.date] = c; });

  // Start from the Sunday on or before Jan 1
  const jan1 = new Date(year, 0, 1);
  const start = new Date(jan1);
  start.setDate(jan1.getDate() - jan1.getDay());

  // End at the Saturday on or after Dec 31
  const dec31 = new Date(year, 11, 31);
  const end = new Date(dec31);
  end.setDate(dec31.getDate() + (6 - dec31.getDay()));

  const totalWeeks = Math.ceil(
    ((end.getTime() - start.getTime()) / 86400000 + 1) / 7,
  );

  type Cell = { date: string; count: number; level: number; col: number; row: number; outside: boolean };
  const cells: Cell[] = [];
  const monthLabels: { month: string; col: number }[] = [];
  let lastMonth = -1;

  for (let w = 0; w < totalWeeks; w++) {
    for (let d = 0; d < ROWS; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const dateStr = formatDateLocal(date);
      const inYear = date.getFullYear() === year;
      const contrib = map[dateStr];
      const count = contrib?.count ?? 0;
      cells.push({
        date: dateStr,
        count: count,
        level: inYear ? (contrib?.level || (count > 0 ? 1 : 0)) : 0,
        col: w,
        row: d,
        outside: !inYear,
      });
      if (d === 0 && inYear && date.getMonth() !== lastMonth) {
        lastMonth = date.getMonth();
        monthLabels.push({
          month: date.toLocaleString("default", { month: "short" }),
          col: w,
        });
      }
    }
  }

  const totalContributions = contributions
    .filter((c) => c.date.startsWith(String(year)))
    .reduce((sum, c) => sum + c.count, 0);

  return { cells, monthLabels, totalWeeks, totalContributions };
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
interface TipState { x: number; y: number; date: string; count: number; visible: boolean }

function Tooltip({ tip }: { tip: TipState }) {
  if (!tip.visible) return null;
  const formatted = new Date(tip.date + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md border border-border/60 bg-popover px-2.5 py-1.5 shadow-lg text-xs text-popover-foreground"
      style={{ left: tip.x, top: tip.y, transform: "translate(-50%, -120%)", whiteSpace: "nowrap" }}
    >
      <span className="font-semibold">{tip.count} contribution{tip.count !== 1 ? "s" : ""}</span>{" "}
      <span className="text-muted-foreground">on {formatted}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const ContributionGraph = () => {
  const { theme } = useTheme();

  const user = useConvexQuery(api.user.getCurrentUser);

  const userName = user?.githubUsername;

  const { data, isLoading } = useQuery<{
    contributions: any[];
    totalContributions: number;
  }>({
    queryKey: ["contribution-graph", userName],
    queryFn: () => getContributionStats(userName || "") as any,
    enabled: !!userName,
    staleTime: 60 * 60 * 6,
    refetchOnWindowFocus: false,
  });

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const isDark = theme === "dark";
  const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;

  const [tip, setTip] = useState<TipState>({ x: 0, y: 0, date: "", count: 0, visible: false });

  // Derive available years from contributions
  const availableYears = useMemo(() => {
    if (!data?.contributions?.length) return [currentYear];
    const years = Array.from(
      new Set(data.contributions.map((c: any) => Number(c.date.split("-")[0])))
    ).sort((a, b) => b - a);
    return years.length ? years : [currentYear];
  }, [data?.contributions, currentYear]);

  const { cells, monthLabels, totalWeeks, totalContributions } = useMemo(
    () => buildYearGrid(data?.contributions ?? [], selectedYear),
    [data?.contributions, selectedYear],
  );

  const MONTH_ROW_H = 18;
  const svgWidth  = totalWeeks * STEP;
  const svgHeight = ROWS * STEP + CELL;

  // ── Loading skeleton ──
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 w-full p-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-6 w-20 rounded-md" />
        </div>
        <Skeleton className="h-[150px] w-full rounded-lg" />
      </div>
    );
  }

  // ── Empty state ──
  if (!data || !data?.contributions?.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <GitCommitHorizontal className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No contribution data available</p>
        <p className="text-xs text-muted-foreground/60">
          Connect your GitHub account to see your activity
        </p>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex w-full flex-col gap-3">
      {/* ── Header: title left, year picker right ── */}
      <div className="relative flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <GitCommitHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Contributions</span>
        </div>

        {/* Lifetime contributions centered */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[9px] font-semibold text-muted-foreground/70 uppercase tracking-tight">Total Contributions</span>
          <span className="text-xs font-bold text-foreground tabular-nums">
            {data.totalContributions.toLocaleString()}
          </span>
        </div>

        {/* Year dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1 text-xs border border-border/60 bg-accent/40 hover:bg-accent/70 transition-colors rounded-md px-2.5 py-1 text-foreground font-medium">
              {selectedYear}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[80px]">
            {availableYears.map((yr) => (
              <DropdownMenuItem
                key={yr}
                onSelect={() => setSelectedYear(yr)}
                className={`text-xs justify-center ${yr === selectedYear ? "font-semibold text-primary" : ""}`}
              >
                {yr}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Graph ── */}
      <div className="w-full overflow-x-auto" style={{ scrollbarWidth: "none" }}>
        <div className="min-w-max">
          <svg
            width={svgWidth + CELL}
            height={svgHeight + MONTH_ROW_H}
            style={{ display: "block", overflow: "visible" }}
          >
            {/* Month labels */}
            {monthLabels.map(({ month, col }) => (
              <text
                key={`${month}-${col}`}
                x={col * STEP}
                y={MONTH_ROW_H - 4}
                fill="currentColor"
                className="fill-muted-foreground"
                fontSize={11}
                fontFamily="inherit"
              >
                {month}
              </text>
            ))}

            {/* Cells */}
            {cells.map(({ date, count, level, col, row, outside }) => {
              const hide = outside;
              return (
                <rect
                  key={`${date}-${row}`}
                  x={col * STEP}
                  y={MONTH_ROW_H + row * STEP}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  ry={2}
                  fill={hide ? "transparent" : palette[level]}
                  style={{ cursor: hide ? "default" : "pointer" }}
                  onMouseEnter={(e) => {
                    if (hide) return;
                    const r = (e.target as SVGRectElement).getBoundingClientRect();
                    setTip({ x: r.left + r.width / 2, y: r.top, date, count, visible: true });
                  }}
                  onMouseLeave={() => setTip((t) => ({ ...t, visible: false }))}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── Footer: total contributions left, legend right ── */}
      <div className="flex items-center justify-between px-1 mt-0.5">
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {totalContributions.toLocaleString()}
          </span>{" "}
          contributions in {selectedYear}
        </span>

        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground/70">Less</span>
          {palette.map((color, i) => (
            <div
              key={i}
              className="rounded-[2px]"
              style={{ width: CELL, height: CELL, backgroundColor: color }}
            />
          ))}
          <span className="text-[11px] text-muted-foreground/70">More</span>
        </div>
      </div>

      {/* Floating tooltip */}
      <Tooltip tip={tip} />
    </div>
  );
};

export default ContributionGraph;
