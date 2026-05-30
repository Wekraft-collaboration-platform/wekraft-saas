import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

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
