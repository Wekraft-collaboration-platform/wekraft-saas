import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { reactions } from "@/lib/turso/schema";
import { eq, and } from "drizzle-orm";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../../../../../convex/_generated/api";

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Fetch reactions for a message
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const messageId = searchParams.get("messageId");

    if (!messageId) return new NextResponse("Missing messageId", { status: 400 });

    const msgReactions = await db.query.reactions.findMany({
      where: eq(reactions.messageId, messageId),
    });

    return NextResponse.json(msgReactions);
  } catch (error) {
    console.error("[REACTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Add a reaction
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { messageId, emoji } = body;

    if (!messageId || !emoji) return new NextResponse("Missing fields", { status: 400 });

    // Check if user already reacted with this emoji on this message
    const existing = await db.query.reactions.findFirst({
      where: and(
        eq(reactions.messageId, messageId),
        eq(reactions.userId, userId),
        eq(reactions.emoji, emoji)
      )
    });

    if (existing) {
      return NextResponse.json(existing); // or return 400
    }

    const id = crypto.randomUUID();
    const newReaction = { id, messageId, userId, emoji };

    await db.insert(reactions).values(newReaction);

    // signal down...
    return NextResponse.json(newReaction);
  } catch (error) {
    console.error("[REACTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
