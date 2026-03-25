"use server";

import { redis } from "@/lib/redis";
import { auth } from "@clerk/nextjs/server";
import { PLATFORM_REGISTRY, type PlatformStats, type StatItem } from "@/modules/profile/config/platforms";

export async function getServerStats(url: string): Promise<PlatformStats | null> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!url) return null;

  // Find the matching platform from the registry
  const lower = url.toLowerCase().trim();
  const platform = PLATFORM_REGISTRY.find((p) => lower.includes(p.urlMatch));
  if (!platform) return null;

  // Extract last path segment as username
  const username = url.replace(/\/$/, "").split("/").pop() ?? "";

  // Check cache first
  const cacheKey = `wekraft:stats:v1:${platform.id}:${username || url}`;
  const cached = await redis.get<StatItem[]>(cacheKey);
  if (cached) return { platform: platform.id, stats: cached };

  // No stats fetcher defined for this platform
  if (!platform.fetchStats) return null;

  // Fetch from platform API
  let stats: StatItem[] | null = null;
  try {
    stats = await platform.fetchStats(username, url);
  } catch (err) {
    console.error(`[getServerStats] Failed to fetch ${platform.id} stats:`, err);
    return null;
  }

  if (stats) {
    await redis.set(cacheKey, stats, { ex: 60 * 60 }); // 1 hour TTL
    return { platform: platform.id, stats };
  }

  return null;
}
