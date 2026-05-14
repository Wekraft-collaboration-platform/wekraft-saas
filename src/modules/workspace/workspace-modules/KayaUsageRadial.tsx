"use client";

import { BrainCircuit, Zap } from "lucide-react";
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface KayaUsageRadialProps {
  usage: number;
  threshold: number;
}

export function KayaUsageRadial({ usage = 0, threshold = 100 }: KayaUsageRadialProps) {
  // If usage is 0, we still want to show the empty track
  const chartData = [
    {
      name: "usage",
      used: usage,
      remaining: Math.max(0, threshold - usage),
    },
  ];

  const chartConfig = {
    used: {
      label: "Used Calls",
      color: "hsl(var(--primary))",
    },
    remaining: {
      label: "Remaining",
      color: "hsl(var(--muted))",
    },
  } satisfies ChartConfig;

  const total = threshold || 1;
  const percentage = Math.round((usage / total) * 100);

  return (
    <Card className="flex flex-col border-border bg-accent/20 shadow-none h-full">
      <CardHeader className="items-start ">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-foreground" /> Kaya AI Usage
        </CardTitle>
        <CardDescription className="text-[10px] uppercase tracking-widest font-medium opacity-60">
          Monthly Project Quota
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[200px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={70}
            outerRadius={100}
          >
            <RadialBar
              dataKey="used"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-used)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="remaining"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-remaining)"
              className="stroke-transparent stroke-2 opacity-10"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 15}
                          className="fill-foreground text-3xl font-semibold tabular-nums"
                        >
                          {usage.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 5}
                          className="fill-muted-foreground text-[10px] font-medium uppercase tracking-tight"
                        >
                          Calls Used
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-1.5 text-[11px] pb-6 px-6 items-center">
        <div className="flex items-center gap-2 leading-none font-semibold text-foreground">
          {percentage}% of monthly threshold reached
          <Zap className="h-3.5 w-3.5 text-foreground" />
        </div>
        <div className="leading-none text-muted-foreground font-medium opacity-70">
          Threshold: {threshold.toLocaleString()} calls per month
        </div>
      </CardFooter>
    </Card>
  );
}
