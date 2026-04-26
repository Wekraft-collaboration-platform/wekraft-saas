import { NextRequest, NextResponse } from "next/server";
import { ratelimit } from "@/lib/rate-limit";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL;
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  const body = await request.json();
  const userId = body.state?.user_id;

  // 1. Rate Limiting (Fastest check)
  const identifier =
    userId || request.headers.get("x-forwarded-for") || "anonymous";
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
      ? convex.query(api.user.getUserById, { userId })
      : Promise.resolve({ accountType: "pro" }); // Fallback

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

        if (userId && (!user || user.accountType !== "pro")) {
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
        }
        await writer.close();
      } catch (error) {
        console.error("Stream processing error:", error);

        // Write an error message to the stream before closing
        const errorData = JSON.stringify({ error: "Error in agent" });
        await writer.write(
          new TextEncoder().encode(`event: error\ndata: ${errorData}\n\n`),
        );
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
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
