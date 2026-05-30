/**
 * usePresence.ts
 * 
 * Shared hook to track project-wide or channel-specific presence.
 * Centralizes Ably presence logic to avoid redundant connections.
 */
"use client";

import { useState, useEffect } from "react";
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

export function usePresence(projectId: string | null, currentUserId: string, currentUserName?: string) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!projectId) return;

    const ably = getAblyClient();
    const ch = ably.channels.get(`teamspace:presence:${projectId}`);

    ch.presence.enter({ userId: currentUserId, userName: currentUserName });
    
    const updatePresence = () => {
      ch.presence.get().then((members) => {
        setOnlineIds(new Set(members.map((m) => m.clientId)));
      }).catch(console.error);
    };

    ch.presence.subscribe("enter", updatePresence);
    ch.presence.subscribe("leave", updatePresence);
    ch.presence.subscribe("update", updatePresence);
    updatePresence();

    return () => {
      ch.presence.leave();
      ch.presence.unsubscribe();
    };
  }, [projectId, currentUserId, currentUserName]);

  return { onlineIds };
}
