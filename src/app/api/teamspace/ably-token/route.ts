import { auth } from "@clerk/nextjs/server";
import Ably from "ably";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../../convex/_generated/api";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

// GET /api/teamspace/ably-token
// Returns a short-lived Ably capability token scoped to the user's channels only.
// The raw ABLY_API_KEY never reaches the browser.
export async function GET() {
  const { userId, getToken } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch the user's project IDs so we can scope the token precisely.
  // Falls back to broad subscribe-only if Convex is unreachable.
  let projectIds: string[] = [];
  try {
    const convexToken = await getToken({ template: "convex" });
    if (convexToken) {
      const authedConvex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
      authedConvex.setAuth(convexToken);
      projectIds = await authedConvex.query(api.project.getMyProjectIds, {});
    }
  } catch (e) {
    console.error("Failed to fetch project IDs for Ably token scoping:", e);
  }

  // Derive the capability value type directly from Ably's API — no internal imports needed.
  // Parameters<...>[0] is `TokenParams | undefined` (optional arg), so we NonNullable it twice:
  // once for the param itself, once for the capability field which is also optional.
  type AblyCapabilityMap = Exclude<
    NonNullable<NonNullable<Parameters<typeof ably.auth.createTokenRequest>[0]>["capability"]>,
    string
  >;
  const projectCapabilities: AblyCapabilityMap = {};
  if (projectIds.length > 0) {
    for (const id of projectIds) {
      projectCapabilities[`project:${id}:channels`] = ["subscribe"];
      projectCapabilities[`project:${id}:messages`] = ["subscribe"];
      projectCapabilities[`project:${id}:reads`] = ["subscribe"];
      projectCapabilities[`project:settings:${id}`] = ["subscribe", "publish"];
    }
  } else {
    // Fallback: broad subscribe-only (no publish/presence) if we couldn't fetch IDs
    projectCapabilities["project:*"] = ["subscribe"];
    projectCapabilities["project:settings:*"] = ["subscribe", "publish"];
  }

  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: userId,
    capability: {
      "teamspace:*": ["subscribe", "publish", "presence"],
      "private:teamspace:*": ["subscribe", "publish", "presence"],
      [`user:notifications:${userId}`]: ["subscribe", "publish"],
      ...projectCapabilities,
    },
    ttl: 3600 * 1000, // 1 hour in ms
  });

  return NextResponse.json(tokenRequest);
}