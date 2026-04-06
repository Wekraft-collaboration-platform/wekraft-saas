import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { messages } from "@/lib/turso/schema";
import { eq, and } from "drizzle-orm";
// import { ConvexHttpClient } from "convex/browser";
// import { api } from "../../../../../../convex/_generated/api";

// const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const messageId = params.id;
    if (!messageId) {
      return new NextResponse("Missing message ID", { status: 400 });
    }

    // Optional: Fetch message to verify sender or authorization
    // await db.query.messages.findFirst({ where: eq(messages.id, messageId) })
    
    // 1. Delete from Turso
    // Also delete threads/reactions/etc if cascade is needed or handled by logic
    const deleted = await db.delete(messages)
      .where(and(eq(messages.id, messageId), eq(messages.senderId, userId)))
      .returning();

    if (!deleted.length) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    // 2. Signal Convex about deletion (omitting channelId lookup for simplicity, but could be added)
    // convex.mutation(api.signals.sendSignal, { type: "message_deleted", channelId: deleted[0].channelId, payload: { messageId } })
    
    return NextResponse.json(deleted[0]);
  } catch (error) {
    console.error("[MESSAGES_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
