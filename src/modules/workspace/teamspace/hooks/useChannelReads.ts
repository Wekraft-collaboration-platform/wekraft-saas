"use client";

import { useState, useEffect, useCallback } from "react";
import Ably from "ably";

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

export function useChannelReads(projectId: string, channelId?: string | null) {
  const [reads, setReads] = useState<Record<string, number>>({});

  const fetchReads = useCallback(async () => {
    if (!channelId) return;
    try {
      const res = await fetch(`/api/teamspace/channels/${channelId}/read`);
      if (!res.ok) return;
      const data = await res.json();
      
      const newReads: Record<string, number> = {};
      for (const r of data.reads || []) {
        newReads[r.userId] = r.lastReadAt;
      }
      setReads(newReads);
    } catch (e) {
      console.error("Failed to fetch channel reads", e);
    }
  }, [channelId]);

  useEffect(() => {
    fetchReads();
  }, [fetchReads]);

  useEffect(() => {
    if (!projectId || !channelId) return;

    const ably = getAblyClient();
    const ch = ably.channels.get(`project:${projectId}:reads`);

    const onChannelRead = (msg: Ably.Message) => {
      const data = msg.data as { userId: string; channelId: string; lastReadAt: number };
      if (data.channelId === channelId) {
        setReads((prev) => ({
          ...prev,
          [data.userId]: data.lastReadAt,
        }));
      }
    };

    ch.subscribe("channel.read", onChannelRead);

    return () => {
      ch.unsubscribe("channel.read", onChannelRead);
    };
  }, [projectId, channelId]);

  return { reads };
}
