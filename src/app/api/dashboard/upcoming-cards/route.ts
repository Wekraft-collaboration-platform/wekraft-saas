import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { type NextRequest, NextResponse } from "next/server";
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
const CACHE_TTL = 45 * 60 * 1000; // 45 minutes

export async function GET(req: NextRequest) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check cache (skip if ?refresh=true is passed)
  const forceRefresh = req.nextUrl.searchParams.get("refresh") === "true";
  const cached = cache.get(userId);
  const isStaleCache = cached && cached.data.deadlines && cached.data.deadlines.length > 0 && !("role" in cached.data.deadlines[0]);
  if (!forceRefresh && cached && !isStaleCache && Date.now() - cached.timestamp < CACHE_TTL) {
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

    console.log(
      "==========Updated CACHE DATA FOR DASHBOARD CARDS===============",
      data,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching dashboard upcoming cards:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
