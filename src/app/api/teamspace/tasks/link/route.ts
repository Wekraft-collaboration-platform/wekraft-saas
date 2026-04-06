import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { taskLinks } from "@/lib/turso/schema";
import { eq } from "drizzle-orm";

// Create a new task link
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { messageId, taskId } = body;

    if (!messageId || !taskId) {
      return new NextResponse("Missing messageId or taskId", { status: 400 });
    }

    const id = crypto.randomUUID();

    const newLink = {
      id,
      messageId,
      taskId,
      linkedBy: userId,
    };

    await db.insert(taskLinks).values(newLink);

    return NextResponse.json(newLink);
  } catch (error) {
    console.error("[TASK_LINKS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Get all tasks linked to a message
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const messageId = searchParams.get("messageId");

    if (!messageId) {
      return new NextResponse("Missing messageId", { status: 400 });
    }

    const links = await db.query.taskLinks.findMany({
      where: eq(taskLinks.messageId, messageId),
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("[TASK_LINKS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
