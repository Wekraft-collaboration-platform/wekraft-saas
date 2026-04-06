import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { messages } from "@/lib/turso/schema";
import { desc, eq } from "drizzle-orm";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { channelId, text, type = "text" } = body;

    if (!channelId || !text) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const messageId = crypto.randomUUID();

    const newMessage = {
      id: messageId,
      channelId,
      senderId: userId,
      text,
      type,
    };

    // 1. Insert into Turso
    await db.insert(messages).values(newMessage);

    // 2. Signal Convex (Run in background via Promise.catch so we don't block response)
    convex.mutation((api as any).signals.sendSignal, {
      type: "new_message",
      channelId,
      payload: newMessage,
    }).catch((err) => console.error("Convex Signal failed:", err));

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const channelId = searchParams.get("channelId");

    if (!channelId) {
      return new NextResponse("Missing channelId", { status: 400 });
    }

    // Fetch last 50 messages from Turso
    const channelMessages = await db.query.messages.findMany({
      where: eq(messages.channelId, channelId),
      orderBy: [desc(messages.createdAt)],
      limit: 50,
    });

    // Reverse so the client gets them chronological (oldest to newest)
    return NextResponse.json(channelMessages.reverse());
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
