import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Ably from "ably";

// GET /api/teamspace/ably-token
// Returns a short-lived Ably capability token scoped to teamspace:*
// The raw ABLY_API_KEY never reaches the browser.
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await currentUser();

  const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

  const tokenRequest = await ably.auth.createTokenRequest({
    clientId: userId,
    capability: {
      "teamspace:*": ["subscribe", "publish", "presence"],
    },
    ttl: 3600 * 1000, // 1 hour in ms
  });

  return NextResponse.json(tokenRequest);
}
