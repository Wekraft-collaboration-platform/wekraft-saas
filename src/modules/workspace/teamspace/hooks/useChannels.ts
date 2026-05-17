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

import { useState, useEffect, useCallback } from "react";
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

export function useChannels(projectId: string) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/teamspace/channels?projectId=${projectId}`);
      const data = await res.json();
      setChannels(data.channels ?? []);
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
    const ch = ably.channels.get(`project:${projectId}:channels`);

    const onChannelCreated = (msg: Ably.Message) => {
      const newChannel = msg.data as Channel;
      setChannels((prev) => {
        if (prev.find((c) => c.id === newChannel.id)) return prev;
        return [...prev, newChannel];
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

    return () => {
      ch.unsubscribe();
    };
  }, [projectId]);

  const createChannel = useCallback(
    async (name: string, description: string, type: "text" | "announcement" = "text") => {
      const res = await fetch("/api/teamspace/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, name, description, type }),
      });
      const data = await res.json();
      if (data.channel) {
        setChannels((prev) => [...prev, data.channel]);
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
    refetch: fetchChannels 
  };
}
