"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Info, Waypoints } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Label as LabelUI } from "@/components/ui/label";
import { calculateImpactScore } from "./impactScore";
import { GitHubStats } from "./StaticContent";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface ImpactScoreDisplayProps {
  stats: GitHubStats;
}

export function PieChartVariant1({ stats }: ImpactScoreDisplayProps) {
  const data = calculateImpactScore(stats);
  const chartData = [
    {
      name: "Commits",
      value: data.breakdown.commits,
      raw: stats.totalCommits,
      fill: COLORS[0],
    },
    {
      name: "PRs",
      value: data.breakdown.prs,
      raw: stats.totalPRs,
      fill: COLORS[1],
    },
    {
      name: "Merged PRs",
      value: data.breakdown.mergedPrs,
      raw: stats.totalMergedPRs,
      fill: COLORS[4],
    },
    {
      name: "Issues",
      value: data.breakdown.issues,
      raw: stats.totalIssuesClosed,
      fill: COLORS[2],
    },
    {
      name: "Reviews",
      value: data.breakdown.reviews,
      raw: stats.totalReviews,
      fill: COLORS[3],
    },
  ];

  const chartConfig = {
    Commits: { label: "Commits", color: "hsl(var(--chart-1))" },
    PRs: { label: "PRs", color: "hsl(var(--chart-2))" },
    "Merged PRs": { label: "Merged PRs", color: "hsl(var(--chart-5))" },
    Issues: { label: "Issues", color: "hsl(var(--chart-3))" },
    Reviews: { label: "Reviews", color: "hsl(var(--chart-4))" },
  };

  return (
    <>
      <h1 className="text-center text-xs font-semibold tracking-widest text-primary mb-1.5">
        {data.tier}
      </h1>
      <ChartContainer config={chartConfig} className="h-[190px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{name}:</span>
                      <span className="font-mono font-bold">
                        {item.payload.raw}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  className="hover:opacity-80 transition-opacity"
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
                          className="fill-foreground text-3xl font-bold font-sans"
                        >
                          {data.displayScore}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-sm tracking-tight font-medium"
                        >
                          IMPACT SCORE
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
    </>
  );
}

export function ScoreDetailsDialog({
  stats,
  children,
}: ImpactScoreDisplayProps & { children?: React.ReactNode }) {
  const data = calculateImpactScore(stats);
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground text-xs cursor-pointer"
          >
            <Info className="h-5 w-5 mr-2" />
            <p>View Details</p>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] border-border bg-card ">
        <DialogHeader>
          <div className="flex items-center justify-between py-4 mt-2">
            <DialogTitle className="text-2xl font-bold">
              Impact Breakdown
            </DialogTitle>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-xs h-8"
            >
              {data.tier}
            </Badge>
          </div>
          <DialogDescription>
            Detailed analysis of your GitHub activity scores and bonuses.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4 px-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <LabelUI className="text-xs text-muted-foreground uppercase tracking-wider">
                Raw Activity Score
              </LabelUI>
              <p className="text-xl font-semibold">
                {Math.round(data.weightedActivity)}
              </p>
            </div>
            <div className="space-y-1">
              <LabelUI className="text-xs text-muted-foreground uppercase tracking-wider">
                Consistency Multiplier
              </LabelUI>
              <p className="text-xl font-semibold text-emerald-500">
                x{data.consistencyBonus}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <LabelUI className="text-sm font-medium">Profile Summary</LabelUI>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col p-2 rounded-lg bg-accent/20 border border-border/30">
                <span className="text-[10px] text-muted-foreground uppercase">
                  Commits
                </span>
                <span className="text-sm font-bold font-mono">
                  {stats.totalCommits}
                </span>
              </div>
              <div className="flex flex-col p-2 rounded-lg bg-accent/20 border border-border/30">
                <span className="text-[10px] text-muted-foreground uppercase">
                  PRs (Merged)
                </span>
                <span className="text-sm font-bold font-mono">
                  {stats.totalPRs} ({stats.totalMergedPRs})
                </span>
              </div>
              <div className="flex flex-col p-2 rounded-lg bg-accent/20 border border-border/30">
                <span className="text-[10px] text-muted-foreground uppercase">
                  Merged PRs
                </span>
                <span className="text-sm font-bold font-mono">
                  {stats.totalMergedPRs}
                </span>
              </div>
              <div className="flex flex-col p-2 rounded-lg bg-accent/20 border border-border/30">
                <span className="text-[10px] text-muted-foreground uppercase">
                  Reviews
                </span>
                <span className="text-sm font-bold font-mono">
                  {stats.totalReviews}
                </span>
              </div>
              <div className="flex flex-col p-2 rounded-lg bg-accent/20 border border-border/30">
                <span className="text-[10px] text-muted-foreground uppercase">
                  Issues
                </span>
                <span className="text-sm font-bold font-mono">
                  {stats.totalIssuesClosed}
                </span>
              </div>
              <div className="flex flex-col p-2 rounded-lg bg-accent/20 border border-border/30">
                <span className="text-[10px] text-muted-foreground uppercase">
                  Archetype
                </span>
                <span className="text-[10px] font-bold line-clamp-1 truncate">
                  {data.archetype}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {data.penalties.length > 0 && (
            <div className="space-y-3">
              <LabelUI className="text-sm font-medium text-destructive">
                Active Penalties
              </LabelUI>
              <div className="grid grid-cols-1 gap-2">
                {data.penalties.map((penalty, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-2.5 rounded-md bg-destructive/5 border border-destructive/10"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                      <span className="text-xs font-semibold text-destructive uppercase">
                        {penalty.label}
                      </span>
                    </div>
                    {penalty.roastLine && (
                      <p className="text-[11px] text-muted-foreground mt-1 leading-tight italic">
                        "{penalty.roastLine}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.bonuses.length > 0 && (
            <div className="space-y-3">
              <LabelUI className="text-sm font-medium text-emerald-500">
                Active Bonuses
              </LabelUI>
              <div className="grid grid-cols-1 gap-2">
                {data.bonuses.map((bonus, i) => (
                  <div
                    key={i}
                    className="flex flex-col p-2.5 rounded-md bg-emerald-500/5 border border-emerald-500/10"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-xs font-semibold text-emerald-500 uppercase">
                        {bonus.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.eliteBadge && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/10 flex items-center justify-center">
              <p className="text-sm font-medium bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                ✨ {data.eliteBadge}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
