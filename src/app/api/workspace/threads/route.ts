import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { threads } from "@/lib/turso/schema";
import { desc, eq } from "drizzle-orm";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../../../../../convex/_generated/api";

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Fetch threads for a specific message
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const messageId = searchParams.get("messageId");

    if (!messageId) return new NextResponse("Missing messageId", { status: 400 });

    const messageThreads = await db.query.threads.findMany({
      where: eq(threads.messageId, messageId),
      orderBy: [desc(threads.createdAt)],
    });

    return NextResponse.json(messageThreads.reverse());
  } catch (error) {
    console.error("[THREADS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Add a thread/reply to a message
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { messageId, text } = body;

    if (!messageId || !text) return new NextResponse("Missing fields", { status: 400 });

    const id = crypto.randomUUID();

    const newThread = {
      id,
      messageId,
      senderId: userId,
      text,
    };

    await db.insert(threads).values(newThread);
    
    // convex.mutation(api.signals.sendSignal, { type: "new_thread", channelId: "...need to pass this...", payload: newThread }).catch(console.error);

    return NextResponse.json(newThread);
  } catch (error) {
    console.error("[THREADS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
