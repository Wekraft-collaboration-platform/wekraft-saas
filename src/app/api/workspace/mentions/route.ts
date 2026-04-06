import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { mentions } from "@/lib/turso/schema";
import { eq } from "drizzle-orm";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../../../../../convex/_generated/api";

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { messageId, mentionedId } = body;

    if (!messageId || !mentionedId) return new NextResponse("Missing fields", { status: 400 });

    const id = crypto.randomUUID();
    const newMention = {
      id,
      messageId,
      mentionedId,
      mentionedBy: userId,
    };

    await db.insert(mentions).values(newMention);

    // signal down...
    return NextResponse.json(newMention);
  } catch (error) {
    console.error("[MENTIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Users usually only fetch THEIR mentions
    const userMentions = await db.query.mentions.findMany({
      where: eq(mentions.mentionedId, userId),
    });

    return NextResponse.json(userMentions);
  } catch (error) {
    console.error("[MENTIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
