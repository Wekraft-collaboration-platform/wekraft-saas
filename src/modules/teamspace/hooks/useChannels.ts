"use client";

import { useState, useEffect, useCallback } from "react";

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

  return { channels, loading, createChannel, refetch: fetchChannels };
}
