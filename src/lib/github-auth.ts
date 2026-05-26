import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

// ========================================
// GETTING GITHUB ACCESS TOKEN FROM CLERK
// ========================================
export async function getGithubAccessToken(userId?: string) {
  let targetUserId = userId;

  if (!targetUserId) {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    targetUserId = currentUserId;
  }

  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(
    targetUserId,
    "github",
  );
  const accessToken = tokens.data[0]?.token;

  return accessToken;
}
