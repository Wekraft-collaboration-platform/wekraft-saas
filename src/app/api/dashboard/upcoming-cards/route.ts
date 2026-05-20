import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface CacheData {
  deadlines: any[];
  events: any[];
}

interface CacheEntry {
  data: CacheData;
  timestamp: number;
}

// In-memory cache keyed by Clerk userId
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function GET(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check cache
  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log("==========CACHED HIT FOR DASHBOARD CARDS===============");
    return NextResponse.json(cached.data);
  }

  try {
    const token = await getToken({ template: "convex" });
    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    if (token) {
      client.setAuth(token);
    }

    // Run queries in parallel
    const [deadlines, events] = await Promise.all([
      client.query(api.project.getUpcomingDeadlines),
      client.query(api.calendar.getUpcomingEvents),
    ]);

    const data: CacheData = { deadlines, events };

    // Update cache
    cache.set(userId, {
      data,
      timestamp: Date.now(),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dashboard upcoming cards:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
