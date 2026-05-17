/**
 * useChannels.ts
 * 
 * Custom hook for managing channels within a teamspace.
 * 
 * Functions:
 * - `fetchChannels`: Retrieves all channels for a project.
 * - `createChannel`: Creates a new channel via API.
 * - `updateChannel`: Updates channel name/description.
 * - `deleteChannel`: Removes a channel.
 * 
 * Flow:
 * - Uses standard fetch API to communicate with `/api/teamspace/channels`.
 * - Manages local state for immediate UI updates (Optimistic-like updates).
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Ably from "ably";

export interface Channel {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  type: "text" | "announcement";
  is_default: number;
  created_by: string;
  created_at: number;
  updated_at: number;
  unread_count?: number;
  mention_count?: number;
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

export function useChannels(
  projectId: string,
  currentUserId?: string | null,
  activeChannelId?: string | null
) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  // Keep track of resolved active channel ID without triggering resubscriptions
  const resolvedActiveIdRef = useRef<string | null>(null);
  resolvedActiveIdRef.current = activeChannelId ?? channels.find(c => c.is_default === 1)?.id ?? channels[0]?.id ?? null;

  const fetchChannels = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/teamspace/channels?projectId=${projectId}`);
      const data = await res.json();
      
      // Deduplicate channels by id to prevent React key warnings
      const uniqueChannels = (data.channels ?? []).filter(
        (channel: Channel, index: number, self: Channel[]) =>
          index === self.findIndex((c) => c.id === channel.id)
      );
      
      setChannels(uniqueChannels);
    } catch (e) {
      console.error("Failed to fetch channels", e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  useEffect(() => {
    if (!projectId) return;

    const ably = getAblyClient();
    
    // 1. Channel CRUD events
    const ch = ably.channels.get(`project:${projectId}:channels`);

    const onChannelCreated = (msg: Ably.Message) => {
      const newChannel = msg.data as Channel;
      setChannels((prev) => {
        if (prev.find((c) => c.id === newChannel.id)) return prev;
        return [...prev, { ...newChannel, unread_count: 0, mention_count: 0 }];
      });
    };

    const onChannelUpdated = (msg: Ably.Message) => {
      const { id, name, description } = msg.data;
      setChannels((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: name ?? c.name, description: description ?? c.description } : c))
      );
    };

    const onChannelDeleted = (msg: Ably.Message) => {
      const { id } = msg.data;
      setChannels((prev) => prev.filter((c) => c.id !== id));
    };

    ch.subscribe("channel.created", onChannelCreated);
    ch.subscribe("channel.updated", onChannelUpdated);
    ch.subscribe("channel.deleted", onChannelDeleted);

    // 2. Real-time project-wide messages for unread count increments
    const msgsCh = ably.channels.get(`project:${projectId}:messages`);
    const onMessageNew = (msg: Ably.Message) => {
      const data = msg.data as { id: string; channel_id: string; user_id: string; created_at: number };
      if (data.user_id !== currentUserId && data.channel_id !== resolvedActiveIdRef.current) {
        setChannels((prev) =>
          prev.map((c) =>
            c.id === data.channel_id
              ? { ...c, unread_count: (c.unread_count ?? 0) + 1 }
              : c
          )
        );
      }
    };
    msgsCh.subscribe("message.new", onMessageNew);

    // 3. Real-time mentions for user pulsing badges
    let notifyCh: Ably.RealtimeChannel | null = null;
    const onNotificationNew = (msg: Ably.Message) => {
      const data = msg.data as { channel_id?: string; type: string };
      if (data.type === "mention" && data.channel_id && data.channel_id !== resolvedActiveIdRef.current) {
        setChannels((prev) =>
          prev.map((c) =>
            c.id === data.channel_id
              ? {
                  ...c,
                  mention_count: (c.mention_count ?? 0) + 1,
                }
              : c
          )
        );
      }
    };

    if (currentUserId) {
      notifyCh = ably.channels.get(`user:notifications:${currentUserId}`);
      notifyCh.subscribe("notification.new", onNotificationNew);
    }

    return () => {
      ch.unsubscribe();
      msgsCh.unsubscribe();
      if (notifyCh) {
        notifyCh.unsubscribe();
      }
    };
  }, [projectId, currentUserId]);

  const markChannelAsRead = useCallback(
    async (channelId: string) => {
      if (!channelId) return;

      // Optimistically clear counts locally
      setChannels((prev) =>
        prev.map((c) =>
          c.id === channelId
            ? { ...c, unread_count: 0, mention_count: 0 }
            : c
        )
      );

      // Call read endpoint in background
      try {
        await fetch(`/api/teamspace/channels/${channelId}/read`, {
          method: "POST",
        });
      } catch (e) {
        console.error("Failed to mark channel as read", e);
      }
    },
    []
  );

  const createChannel = useCallback(
    async (name: string, description: string, type: "text" | "announcement" = "text") => {
      const res = await fetch("/api/teamspace/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, name, description, type }),
      });
      const data = await res.json();
      if (data.channel) {
        setChannels((prev) => {
          if (prev.some(c => c.id === data.channel.id)) return prev;
          return [...prev, data.channel];
        });
        return data.channel as Channel;
      }
    },
    [projectId]
  );

  const updateChannel = useCallback(
    async (channelId: string, name: string, description: string) => {
      const res = await fetch(`/api/teamspace/channels/${channelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (res.ok) {
        setChannels((prev) =>
          prev.map((c) => (c.id === channelId ? { ...c, name, description } : c))
        );
        return true;
      }
      return false;
    },
    []
  );

  const deleteChannel = useCallback(
    async (channelId: string) => {
      const res = await fetch(`/api/teamspace/channels/${channelId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setChannels((prev) => prev.filter((c) => c.id !== channelId));
        return true;
      }
      return false;
    },
    []
  );

  return { 
    channels, 
    loading, 
    createChannel, 
    updateChannel, 
    deleteChannel, 
    markChannelAsRead,
    refetch: fetchChannels 
  };
}
