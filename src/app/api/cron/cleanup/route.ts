import { db } from "@/lib/turso/turso";
import { messages, reactions, mentions, media, threads } from "@/lib/turso/schema";
import { lt } from "drizzle-orm";

export async function GET(req: Request) {
  // Verify cron secret so only Vercel can call this
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = Math.floor(Date.now() / 1000) - 60 * 24 * 60 * 60; // 60 days

  try {
    // Delete old messages and all related data
    await db.delete(reactions).where(lt(reactions.createdAt, cutoff));
    await db.delete(mentions).where(lt(mentions.createdAt, cutoff));
    await db.delete(media).where(lt(media.createdAt, cutoff));
    await db.delete(threads).where(lt(threads.createdAt, cutoff));
    await db.delete(messages).where(lt(messages.createdAt, cutoff));

    return Response.json({ success: true, cutoff });
  } catch (error) {
    console.error("Cleanup cron failed:", error);
    return Response.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
