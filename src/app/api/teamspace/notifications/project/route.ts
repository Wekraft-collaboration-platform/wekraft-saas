import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { turso, initTeamspaceDB } from "@/lib/turso";
import Ably from "ably";
import { randomUUID } from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const ably = new Ably.Rest(process.env.ABLY_API_KEY!);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    type,
    projectId,
    targetUserId,
    targetUserName,
    targetUserImage,
    projectName,
  } = body;

  if (!type || !projectId) {
    return NextResponse.json(
      { error: "type and projectId required" },
      { status: 400 },
    );
  }

  // Get current user details from Convex
  const currentUser = await convex.query(api.user.getUserByClerkToken as any, {
    clerkToken: userId,
  });

  const senderName = currentUser?.name || "Someone";
  const senderImage = currentUser?.avatarUrl || null;
  const now = Date.now();

  await initTeamspaceDB();

  // Fetch project members to find owners and admins
  const projectMembers = await convex.query(api.project.getProjectMembers as any, {
    projectId: projectId as Id<"projects">,
  });

  const powerUsers = projectMembers.filter(
    (m: any) => m.AccessRole === "owner" || m.AccessRole === "admin"
  );

  const notificationsToInsert: any[] = [];

  const addNotification = (
    receiverId: string,
    notifType: string,
    content: string,
    senderIdOverride: string = userId,
    senderNameOverride: string = senderName,
    senderImageOverride: string | null = senderImage
  ) => {
    notificationsToInsert.push({
      id: randomUUID(),
      user_id: receiverId,
      type: notifType,
      sender_id: senderIdOverride,
      sender_name: senderNameOverride,
      sender_image: senderImageOverride,
      project_id: projectId,
      channel_id: null,
      message_id: null,
      content,
      is_read: 0,
      created_at: now,
    });
  };

  switch (type) {
    case "join":
      // Member notification
      if (targetUserId) {
        addNotification(
          targetUserId,
          "request_accepted",
          `Your request to join ${projectName || "the project"} has been accepted. Welcome to the team!`,
          userId,
          senderName,
          senderImage
        );
      }
      // Power users notification
      powerUsers.forEach((admin: any) => {
        if (admin.clerkUserId && admin.clerkUserId !== userId) {
          addNotification(
            admin.clerkUserId,
            "join",
            `${targetUserName || "A user"} joined the project.`,
            targetUserId || userId,
            targetUserName || "User",
            targetUserImage || null
          );
        }
      });
      break;

    case "leave":
      // Member notification
      addNotification(
        userId,
        "leave",
        `You left ${projectName || "the project"} successfully.`,
        userId,
        senderName,
        senderImage
      );
      // Power users notification
      powerUsers.forEach((admin: any) => {
        if (admin.clerkUserId && admin.clerkUserId !== userId) {
          addNotification(
            admin.clerkUserId,
            "leave",
            `${senderName} left the project.`,
            userId,
            senderName,
            senderImage
          );
        }
      });
      break;

    case "remove":
      // Member notification
      if (targetUserId) {
        addNotification(
          targetUserId,
          "remove",
          `You have been removed from ${projectName || "the project"} by an admin.`,
          userId,
          senderName,
          senderImage
        );
      }
      // Power users notification
      powerUsers.forEach((admin: any) => {
        if (admin.clerkUserId && admin.clerkUserId !== userId) {
          addNotification(
            admin.clerkUserId,
            "remove",
            `${targetUserName || "A user"} was removed from the project.`,
            userId,
            senderName,
            senderImage
          );
        }
      });
      break;

    case "join_request":
      // Power users notification
      powerUsers.forEach((admin: any) => {
        if (admin.clerkUserId && admin.clerkUserId !== userId) {
          addNotification(
            admin.clerkUserId,
            "join_request",
            `${senderName} sent a request to join the project.`,
            userId,
            senderName,
            senderImage
          );
        }
      });
      break;
  }

  // Insert into Turso and Publish to Ably
  try {
    const notificationPromises = notificationsToInsert.map(async (notification) => {
      await turso.execute({
        sql: `INSERT INTO ts_notifications (id, user_id, type, sender_id, sender_name, sender_image, project_id, channel_id, message_id, content, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          notification.id,
          notification.user_id,
          notification.type,
          notification.sender_id,
          notification.sender_name,
          notification.sender_image,
          notification.project_id,
          notification.channel_id,
          notification.message_id,
          notification.content,
          notification.created_at,
        ],
      });

      const userNotifyChannel = ably.channels.get(
        `user:notifications:${notification.user_id}`
      );
      await userNotifyChannel.publish("notification.new", notification);
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error("Failed to insert project notifications:", error);
    return NextResponse.json(
      { error: "Failed to process notifications" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
