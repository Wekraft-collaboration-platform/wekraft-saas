import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/turso/turso";
import { taskLinks } from "@/lib/turso/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const linkId = params.id;
    if (!linkId) {
      return new NextResponse("Missing link ID", { status: 400 });
    }

    // 1. Delete from Turso
    const deleted = await db.delete(taskLinks)
      .where(and(eq(taskLinks.id, linkId), eq(taskLinks.linkedBy, userId)))
      .returning();

    if (!deleted.length) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    return NextResponse.json(deleted[0]);
  } catch (error) {
    console.error("[TASK_LINKS_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
