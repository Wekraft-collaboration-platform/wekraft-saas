import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { redis } from "@/lib/redis";
import { api } from "../../../../../convex/_generated/api";
import {
  getProjectLanguages,
  getProjectHealthData,
} from "@/modules/github/actions/action";

const CACHE_TTL = 60 * 30; // 30 minutes

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  const cacheKey = `public_project:${slug}`;

  // 1. Try cache first
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`=================[PublicProject] Cache hit for slug: ${slug}======================`);
      return NextResponse.json(cached);
    }
  } catch (e) {
    console.error("[PublicProject] Redis get error:", e);
  }

  // 2. Fetch project profile from Convex
  let profile: any;
  try {
    profile = await fetchQuery(api.project.getPublicProjectProfile, { slug });
  } catch (e) {
    console.error("[PublicProject] Convex fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }

  if (!profile) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (profile.isPrivate) {
    const data = { profile, languages: null, health: null };
    try {
      await redis.set(cacheKey, data, { ex: CACHE_TTL });
    } catch (e) {
      console.error("[PublicProject] Redis set error:", e);
    }
    return NextResponse.json(data);
  }

  const owner = profile.repo?.repoOwner ?? null;
  const repo = profile.repo?.repoName ?? null;

  let languages = null;
  let health = null;

  if (owner && repo) {
    const [langResult, healthResult] = await Promise.allSettled([
      getProjectLanguages(owner, repo),
      getProjectHealthData(owner, repo),
    ]);

    if (langResult.status === "fulfilled") languages = langResult.value;
    else console.error("[PublicProject] Languages error:", langResult.reason);

    if (healthResult.status === "fulfilled") health = healthResult.value;
    else console.error("[PublicProject] Health error:", healthResult.reason);
  }

  const data = { profile, languages, health };

  // 5. Store in Redis for 30 min
  try {
    await redis.set(cacheKey, data, { ex: CACHE_TTL });
    console.log(`=================[PublicProject] Cached for slug: ${slug}======================`);
  } catch (e) {
    console.error("[PublicProject] Redis set error:", e);
  }

  return NextResponse.json(data);
}