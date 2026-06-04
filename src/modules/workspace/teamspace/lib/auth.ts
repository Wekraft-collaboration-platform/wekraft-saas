import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { turso } from "@/lib/turso";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export interface TeamspaceUser {
  id: Id<"users">;
  name: string;
  avatarUrl: string | null;
  clerkToken: string;
}

export async function verifyProjectAccess(clerkUserId: string, projectId: string) {
  try {
    // 1. Fetch user from Convex
    const user = await convex.query(api.user.getUserByClerkToken, { clerkToken: clerkUserId });
    if (!user) return { error: "User not found in Wekraft database", status: 404 };

    // 2. Fetch project membership/ownership using the fetched user's ID
    const permissions = await convex.query(api.project.getProjectPermissionsById, { 
      projectId: projectId as Id<"projects">,
      userId: user._id
    });

    if (!permissions || (!permissions.isOwner && !permissions.isAdmin && !permissions.isMember)) {
      return { error: "Forbidden: You are not a member of this project", status: 403 };
    }

    return { 
      user: {
        id: user._id,
        name: user.name ?? user.githubUsername ?? "Anonymous",
        avatarUrl: user.avatarUrl ?? null,
        clerkToken: user.clerkToken
      } as TeamspaceUser,
      permissions
    };
  } catch (error) {
    console.error("Project access verification failed:", error);
    return { error: "Internal Server Error during access check", status: 500 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Channel-level access guard for PRIVATE channels.
// MUST be called after verifyProjectAccess has already succeeded.
//
// Priority order:
//   1. Owner or admin          → always allowed
//   2. Channel is not private  → always allowed
//   3. Creator of the channel  → always allowed
//   4. In ts_private_channel_members → allowed
//   5. Everything else         → 403
// ─────────────────────────────────────────────────────────────────────────────
export type ChannelAccessResult =
  | { allowed: true }
  | { allowed: false; status: 403; code: "private_channel_restricted" };

export async function verifyChannelAccess(
  clerkUserId: string,
  channelId: string,
  permissions: { isOwner: boolean; isAdmin: boolean }
): Promise<ChannelAccessResult> {
  // Rule 1: owners and admins bypass all channel-level restrictions
  if (permissions.isOwner || permissions.isAdmin) return { allowed: true };

  // Rule 2: fetch channel type and creator
  let channelType: string;
  let createdBy: string;
  try {
    const ch = await turso.execute({
      sql: "SELECT type, created_by FROM ts_channels WHERE id = ? LIMIT 1",
      args: [channelId],
    });
    if (ch.rows.length === 0) {
      // Channel doesn't exist — treat as denied rather than 404 to avoid enumeration
      return { allowed: false, status: 403, code: "private_channel_restricted" };
    }
    channelType = ch.rows[0].type as string;
    createdBy = ch.rows[0].created_by as string;
  } catch {
    return { allowed: false, status: 403, code: "private_channel_restricted" };
  }

  // Rule 2: non-private channels are always accessible to project members
  if (channelType !== "private") return { allowed: true };

  // Rule 3: creator always has access
  if (createdBy === clerkUserId) return { allowed: true };

  // Rule 4: check explicit membership record
  try {
    const membership = await turso.execute({
      sql: "SELECT 1 FROM ts_private_channel_members WHERE channel_id = ? AND user_id = ? LIMIT 1",
      args: [channelId, clerkUserId],
    });
    if (membership.rows.length > 0) return { allowed: true };
  } catch {
    return { allowed: false, status: 403, code: "private_channel_restricted" };
  }

  return { allowed: false, status: 403, code: "private_channel_restricted" };
}
