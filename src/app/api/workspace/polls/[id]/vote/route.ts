import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { pollVotes } from "@/lib/turso/schema";
import { eq, and } from "drizzle-orm";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../../../../../../convex/_generated/api";

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const pollId = params.id;
    const body = await req.json();
    const { optionId } = body;

    if (!optionId || !pollId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // See if user already voted. If they did, we can either prevent it or delete old vote and add new one.
    // For simplicity, let's just reject duplicate votes. (or we can just let UI handle it)
    const existingVote = await db.query.pollVotes.findFirst({
      where: and(
        eq(pollVotes.pollId, pollId),
        eq(pollVotes.userId, userId)
      )
    });

    if (existingVote) {
      return new NextResponse("User already voted", { status: 400 });
    }

    const voteId = crypto.randomUUID();
    const newVote = {
      id: voteId,
      pollId,
      optionId,
      userId,
    };

    await db.insert(pollVotes).values(newVote);

    // convex.mutation((api as any).signals.sendSignal, { type: "poll_vote", channelId: "...", payload: newVote }).catch(console.error);

    return NextResponse.json(newVote);
  } catch (error) {
    console.error("[POLL_VOTE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
