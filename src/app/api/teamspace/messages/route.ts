import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { messages } from "@/lib/turso/schema";
import { desc, eq, inArray } from "drizzle-orm";
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

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const body = await req.json();
    const { projectId, text, type = "text" } = body;

    if (!projectId || !text) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    // 1. Verify membership
    const isMember = await verifyMembership(projectId);
    if (!isMember) return new NextResponse("Forbidden: Not a project member", { status: 403 });

    const messageId = crypto.randomUUID();
    const createdAt = Math.floor(Date.now() / 1000);
    const newMessage = {
      id: messageId,
      projectId,
      senderId: userId,
      senderName: `${user.firstName} ${user.lastName}`.trim() || user.username || "User",
      senderImage: user.imageUrl,
      text,
      type,
      createdAt,
    };

    // 2. Insert into Turso
    await db.insert(messages).values({
      id: newMessage.id,
      projectId: newMessage.projectId,
      senderId: newMessage.senderId,
      text: newMessage.text,
      type: newMessage.type,
      createdAt: newMessage.createdAt,
    });

    // 3. Signal Convex
    convex.mutation(api.signals.sendSignal, {
      type: "new_message",
      projectId,
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
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return new NextResponse("Missing projectId", { status: 400 });
    }

    // 1. Verify membership
    const isMember = await verifyMembership(projectId);
    if (!isMember) return new NextResponse("Forbidden: Not a project member", { status: 403 });

    // 2. Fetch last 50 messages from Turso
    const channelMessages = await db.query.messages.findMany({
      where: eq(messages.projectId, projectId),
      orderBy: [desc(messages.createdAt)],
      limit: 50,
    });

    if (channelMessages.length === 0) return NextResponse.json([]);

    // 3. Fetch sender details from Clerk
    const senderIds = Array.from(new Set(channelMessages.map(m => m.senderId)));
    const client = await clerkClient();
    const users = await client.users.getUserList({ userId: senderIds });
    
    const userMap = new Map(users.data.map(u => [u.id, {
      name: `${u.firstName} ${u.lastName}`.trim() || u.username || "User",
      image: u.imageUrl
    }]));

    const enrichedMessages = channelMessages.map(m => ({
      ...m,
      senderName: userMap.get(m.senderId)?.name || "User",
      senderImage: userMap.get(m.senderId)?.image
    }));

    return NextResponse.json(enrichedMessages.reverse());
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
