"use client";

import { useState, useEffect, useCallback } from "react";
import Ably from "ably";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  sender_id: string;
  sender_name: string;
  sender_image: string | null;
  project_id: string;
  channel_id?: string;
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

      if (notification.type === "mention") {
        toast(`✨ New Mention by ${notification.sender_name}`, {
          description: notification.content || "Mentioned you in a message.",
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
