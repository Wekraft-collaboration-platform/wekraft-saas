import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { messages } from "@/lib/turso/schema";
import { desc, eq } from "drizzle-orm";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Helper to verify membership via Convex
async function verifyMembership(projectId: string) {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  
  if (!token) return false;
  
  convex.setAuth(token);
  return await convex.query(api.project.isProjectMember, { 
    projectId: projectId as Id<"projects"> 
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { channelId: projectId, text, type = "text" } = body;

    if (!projectId || !text) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // 1. Verify membership
    const isMember = await verifyMembership(projectId);
    if (!isMember) return new NextResponse("Forbidden: Not a project member", { status: 403 });

    const messageId = crypto.randomUUID();
    const newMessage = {
      id: messageId,
      channelId: projectId, // This is now the Convex Project ID
      senderId: userId,
      text,
      type,
    };

    // 2. Insert into Turso
    await db.insert(messages).values(newMessage);

    // 3. Signal Convex
    convex.mutation(api.signals.sendSignal, {
      type: "new_message",
      channelId: projectId,
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
    const projectId = searchParams.get("channelId");

    if (!projectId) {
      return new NextResponse("Missing channelId", { status: 400 });
    }

    // 1. Verify membership
    const isMember = await verifyMembership(projectId);
    if (!isMember) return new NextResponse("Forbidden: Not a project member", { status: 403 });

    // Fetch last 50 messages from Turso
    const channelMessages = await db.query.messages.findMany({
      where: eq(messages.channelId, projectId),
      orderBy: [desc(messages.createdAt)],
      limit: 50,
    });

    return NextResponse.json(channelMessages.reverse());
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
