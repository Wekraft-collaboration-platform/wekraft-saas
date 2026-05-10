import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { redis } from "@/lib/redis";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

export interface DashboardAnalyticsData {
  contributions: {
    userId: string;
    name: string;
    avatar: string;
    tasks: number;
    issues: number;
    speed: number;
    reliability: number;
  }[];
  sprints: any[];
  heatmap: {
    environment: string;
    total: number;
  }[];
  velocity: {
    day: string;
    tasks: number;
    issues: number;
  }[];
  lastUpdated: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId") as Id<"projects"> | null;
  const forceRefresh = searchParams.get("forceRefresh") === "true";

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const cacheKey = `dashboard_analytics:${projectId}`;

  // 1. Try cache first (unless forceRefresh)
  if (!forceRefresh) {
    try {
      const cached = await redis.get<DashboardAnalyticsData>(cacheKey);
      if (cached) {
        console.log("CACHED DATA -> CHARTS RETURNED FROM CACHE !!!")
        return NextResponse.json(cached);
      }
    } catch (e) {
      console.error("[Analytics] Redis get error:", e);
      // fallthrough to fresh fetch
    }
  }

  // 2. Cache miss or force refresh — fetch from Convex
  try {
    const [contributions, sprints, heatmap, velocity] = await Promise.all([
      fetchQuery(api.workspace.getProjectContributions, { projectId }),
      fetchQuery(api.sprint.getSprintsByProject, { projectId }),
      fetchQuery(api.workspace.getEnvironmentalSeverityHeatmap, { projectId }),
      fetchQuery(api.workspace.getWeeklyVelocity, { projectId }),
    ]);

    const data: DashboardAnalyticsData = {
      contributions: contributions as any,
      sprints: sprints as any,
      heatmap: heatmap as any,
      velocity: velocity as any,
      lastUpdated: Date.now(),
    };

    // 3. Store in Redis for 1 hour
    try {
      await redis.set(cacheKey, data, { ex: 3600 });
      console.log("CHARTS DATA STORED IN CACHE FOR 1 HOUR !!!")
    } catch (e) {
      console.error("[Analytics] Redis set error:", e);
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("[Analytics] Convex fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
