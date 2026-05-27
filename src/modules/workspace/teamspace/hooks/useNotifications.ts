"use client";

import React, { useState, useEffect, useCallback } from "react";
import Ably from "ably";
import { toast } from "sonner";
import { formatNotificationContent } from "../lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  sender_id: string;
  sender_name: string;
  sender_image: string | null;
  project_id: string;
  channel_id?: string;
  channel_name?: string;
  message_id?: string;
  content?: string;
  is_read: number;
  created_at: number;
}

let ablyClient: Ably.Realtime | null = null;

function getAblyClient(): Ably.Realtime {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      authUrl: "/api/teamspace/ably-token",
      authMethod: "GET",
    });
  }
  return ablyClient;
}

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/teamspace/notifications");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const ably = getAblyClient();
    const channel = ably.channels.get(`user:notifications:${userId}`);

    const onNewNotification = (msg: Ably.Message) => {
      const notification = msg.data as Notification;
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);

      const getToastIcon = (avatarUrl: string | null, name: string) => {
        if (avatarUrl) {
          return React.createElement(
            Avatar,
            { className: "h-6 w-6 border border-neutral-200 shadow-sm shrink-0" },
            React.createElement(AvatarImage, { src: avatarUrl }),
            React.createElement(
              AvatarFallback,
              { className: "text-[10px] font-bold bg-neutral-100 text-neutral-900" },
              name[0].toUpperCase()
            )
          );
        }
        return React.createElement(
          "div",
          { className: "h-6 w-6 rounded-full bg-neutral-100 text-neutral-900 text-[10px] font-bold border border-neutral-200 flex items-center justify-center shadow-sm shrink-0 mt-0.5" },
          name[0].toUpperCase()
        );
      };

      if (notification.type === "mention") {
        const formattedContent = formatNotificationContent(notification.content);
        toast(`✨ Mentioned in #${notification.channel_name || "channel"}`, {
          description: `${notification.sender_name}: "${formattedContent || "Mentioned you in a message."}"`,
          icon: getToastIcon(notification.sender_image, notification.sender_name),
          duration: 5000,
        });
      } else if (notification.type === "join") {
        toast(`👥 Joined Project`, {
          description: notification.content || `${notification.sender_name} joined the project.`,
          icon: getToastIcon(notification.sender_image, notification.sender_name),
          duration: 5000,
        });
      } else if (notification.type === "leave") {
        toast(`🚪 Left Project`, {
          description: notification.content || `${notification.sender_name} left the project.`,
          icon: getToastIcon(notification.sender_image, notification.sender_name),
          duration: 5000,
        });
      } else if (notification.type === "remove") {
        toast(`❌ Removed from Project`, {
          description: notification.content || `${notification.sender_name} was removed from the project.`,
          icon: getToastIcon(notification.sender_image, notification.sender_name),
          duration: 5000,
        });
      } else if (notification.type === "join_request") {
        toast(`⏳ Join Request`, {
          description: notification.content || `${notification.sender_name} requested to join the project.`,
          icon: getToastIcon(notification.sender_image, notification.sender_name),
          duration: 5000,
        });
      } else if (notification.type === "request_accepted") {
        toast(`🎉 Request Accepted`, {
          description: notification.content || "Welcome to the team!",
          icon: getToastIcon(notification.sender_image, notification.sender_name),
          duration: 5000,
        });
      }
    };

    channel.subscribe("notification.new", onNewNotification);

    return () => {
      channel.unsubscribe();
    };
  }, [userId, fetchNotifications]);

  const markAsRead = async (id?: string) => {
    try {
      const url = id
        ? `/api/teamspace/notifications?id=${id}`
        : "/api/teamspace/notifications";
      await fetch(url, { method: "PATCH" });

      if (id) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } else {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    refresh: fetchNotifications,
  };
}
