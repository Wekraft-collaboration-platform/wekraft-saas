"use client";

import { useState, useEffect, useCallback } from "react";
import Ably from "ably";

export interface TeamspaceSettings {
  project_id: string;
  members_can_create_channels: number;
  members_can_edit_channels: number;
  members_can_delete_channels: number;
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

export function useTeamspaceSettings(projectId: string) {
  const [settings, setSettings] = useState<TeamspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/teamspace/settings?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
      }
    } catch (e) {
      console.error("Failed to fetch teamspace settings", e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSettings();

    if (!projectId) return;

    const ably = getAblyClient();
    const ch = ably.channels.get(`project:settings:${projectId}`);

    const onSettingsUpdated = (msg: Ably.Message) => {
      const updates = msg.data;
      if (updates) {
        setSettings((prev) => (prev ? { ...prev, ...updates } : updates));
      }
    };

    ch.subscribe("settings.updated", onSettingsUpdated);

    return () => {
      ch.unsubscribe("settings.updated", onSettingsUpdated);
    };
  }, [fetchSettings, projectId]);

  const updateSettings = useCallback(
    async (updates: Partial<TeamspaceSettings>) => {
      const previousSettings = settings;
      // Optimistic update
      setSettings((prev) => (prev ? { ...prev, ...updates } : prev));

      try {
        const res = await fetch("/api/teamspace/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, ...updates }),
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
          
          // Broadcast update to other connected clients
          const ably = getAblyClient();
          const ch = ably.channels.get(`project:settings:${projectId}`);
          ch.publish("settings.updated", data.settings);

          return true;
        }
        setSettings(previousSettings);
        return false;
      } catch (e) {
        console.error("Failed to update teamspace settings", e);
        setSettings(previousSettings);
        return false;
      }
    },
    [projectId, settings]
  );

  return { settings, loading, updateSettings, refetch: fetchSettings };
}
