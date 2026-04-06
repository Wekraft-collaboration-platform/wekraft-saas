import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { polls, pollOptions, messages, pollVotes } from "@/lib/turso/schema";
import { eq, desc } from "drizzle-orm";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../../../../../convex/_generated/api";

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { channelId, question, options, expiresAt } = body;
    // options should be an array of strings

    if (!channelId || !question || !options || options.length < 2) {
      return new NextResponse("Invalid poll data", { status: 400 });
    }

    const messageId = crypto.randomUUID();
    const pollId = crypto.randomUUID();

    // 1. Create the parent message to hold the poll in the chat stream
    const newMessage = {
      id: messageId,
      channelId,
      senderId: userId,
      type: "poll",
      text: "Created a poll", // fallback text
    };
    await db.insert(messages).values(newMessage);

    // 2. Create the poll metadata
    const newPoll = {
      id: pollId,
      channelId,
      messageId,
      question,
      createdBy: userId,
      expiresAt: expiresAt || null,
    };
    await db.insert(polls).values(newPoll);

    // 3. Create options
    const optionsToInsert = options.map((text: string, index: number) => ({
      id: crypto.randomUUID(),
      pollId,
      text,
      order: index,
    }));
    await db.insert(pollOptions).values(optionsToInsert);

    // 4. Signal down
    // convex.mutation((api as any).signals.sendSignal, { type: "new_poll", channelId, payload: { ...newPoll, options: optionsToInsert } }).catch(console.error);

    return NextResponse.json({ message: newMessage, poll: newPoll, options: optionsToInsert });
  } catch (error) {
    console.error("[POLLS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const channelId = searchParams.get("channelId");

    if (!channelId) return new NextResponse("Missing channelId", { status: 400 });

    // Fetch active polls for channel
    const activePolls = await db.query.polls.findMany({
      where: eq(polls.channelId, channelId),
      orderBy: [desc(polls.createdAt)],
    });

    return NextResponse.json(activePolls);
  } catch (error) {
    console.error("[POLLS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
