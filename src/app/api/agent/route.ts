import { ConvexHttpClient } from "convex/browser";
import { type NextRequest, NextResponse } from "next/server";
import { ratelimit } from "@/lib/rate-limit";
import { redis } from "@/lib/redis";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL;
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function getCachedUser(userId: string) {
  const cacheKey = `user:${userId}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      if (cached === "__NULL__") return null;
      return JSON.parse(cached as string);
    }
  } catch (e) {
    console.error("Redis error in getCachedUser:", e);
  }

  const user = await convex.query(api.user.getUserById, { userId: userId as Id<"users"> });
  
  try {
    if (user) {
      await redis.set(cacheKey, JSON.stringify(user), { ex: 60 });
    } else {
      await redis.set(cacheKey, "__NULL__", { ex: 60 });
    }
  } catch (e) {
    console.error("Redis write error in getCachedUser:", e);
  }

  return user;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const userId = body.state?.user_id;

  // 1. Rate Limiting (Fastest check)
  // Identify anonymous users by IP to prevent global rate-limit starvation
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "anonymous";
  const identifier = userId || ip;
  
  const { success, limit, reset, remaining } =
    await ratelimit.limit(identifier);

  const rlHeaders = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
  };

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          ...rlHeaders,
          "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    );
  }

  try {
    // 2. Start the AI Request and the Pro Check in parallel
    const aiResponsePromise = fetch(`${AGENT_URL}/agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(body),
    });

    const proCheckPromise = userId
      ? getCachedUser(userId)
      : Promise.resolve(null); // No bypass fallback for missing userId

    // 3. Setup the stream and return IMMEDIATELY
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        // --- TRULY NON-BLOCKING CHECK ---
        const [user, response] = await Promise.all([
          proCheckPromise,
          aiResponsePromise,
        ]);

        if (!user || user.accountType !== "pro") {
          const errorData = JSON.stringify({
            error: "Upgrade to Pro to use Kaya AI",
          });
          await writer.write(
            new TextEncoder().encode(`event: error\ndata: ${errorData}\n\n`),
          );
          await writer.close();
          return;
        }

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to call agent");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No reader available");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Just forward the raw chunks
          await writer.write(value);

          // Optional: also log incomplete chunks for debugging
          // if (value) {
          //   const chunkText = new TextDecoder().decode(value);
          //   console.log("Received chunk:", chunkText);
          // }
        }
        await writer.close();
      } catch (error: any) {
        console.error("Stream processing error in /api/agent:", {
          message: error.message,
          stack: error.stack,
          cause: error.cause,
        });

        // Write an error message to the stream before closing
        const errorData = JSON.stringify({
          error: error.message || "Error in agent stream processing",
        });

        try {
          await writer.write(
            new TextEncoder().encode(`event: error\ndata: ${errorData}\n\n`),
          );
        } catch (writeError) {
          console.error("Failed to write error to stream:", writeError);
        } finally {
          await writer.close();
        }
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
        ...rlHeaders,
      },
    });
  } catch (error) {
    console.error("Error in agent route", error);
    return NextResponse.json(
      { error: "Failed to process /agent request" },
      { status: 500 },
    );
  }
}
