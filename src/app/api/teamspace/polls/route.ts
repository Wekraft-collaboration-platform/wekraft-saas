import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import Ably from "ably";
import { randomUUID } from "crypto";
import { verifyProjectAccess } from "@/modules/workspace/teamspace/lib/auth";

const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, messageId, optionId, channelId } = await req.json();

  if (!projectId || !messageId || !optionId || !channelId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // --- ACCESS CHECK ---
  const access = await verifyProjectAccess(userId, projectId);
  if ("error" in access) return NextResponse.json({ error: access.error }, { status: access.status });

  const { user } = access;

  await initTeamspaceDB();

  // Fetch the message to check if it's a poll and if it allows multiple answers
  const msgRes = await turso.execute({
    sql: `SELECT poll FROM ts_messages WHERE id = ?`,
    args: [messageId],
  });

  if (msgRes.rows.length === 0 || !msgRes.rows[0].poll) {
    return NextResponse.json({ error: "Poll not found" }, { status: 404 });
  }

  const poll = JSON.parse(msgRes.rows[0].poll as string);
  const allowMultiple = poll.allowMultiple === true;

  // Check if vote exists
  const existingVote = await turso.execute({
    sql: `SELECT id FROM ts_poll_votes WHERE message_id = ? AND option_id = ? AND user_id = ?`,
    args: [messageId, optionId, userId],
  });

  let action = "add";

  if (existingVote.rows.length > 0) {
    // Vote exists, so toggle it off
    await turso.execute({
      sql: `DELETE FROM ts_poll_votes WHERE id = ?`,
      args: [existingVote.rows[0].id],
    });
    action = "remove";
  } else {
    // Vote does not exist, add it
    if (!allowMultiple) {
      // Delete any other votes by this user for this poll
      await turso.execute({
        sql: `DELETE FROM ts_poll_votes WHERE message_id = ? AND user_id = ?`,
        args: [messageId, userId],
      });
    }

    await turso.execute({
      sql: `INSERT INTO ts_poll_votes (id, message_id, option_id, user_id, user_name, user_image, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [randomUUID(), messageId, optionId, userId, user.name, user.avatarUrl ?? null, Date.now()],
    });
  }

  // Publish to Ably
  const ablyChannel = ably.channels.get(`teamspace:${channelId}`);
  await ablyChannel.publish("poll.voted", {
    messageId,
    optionId,
    userId,
    userName: user.name,
    userImage: user.avatarUrl ?? null,
    action,
    allowMultiple
  });

  return NextResponse.json({ success: true, action });
}
