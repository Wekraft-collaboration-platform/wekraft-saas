/**
 * ably.ts
 *
 * Single shared Ably Realtime client for the entire app.
 *
 * WHY: Each Ably.Realtime instance opens its own WebSocket connection.
 * Previously, 6 hooks each created their own client — resulting in 6×
 * the connections, 6× the message fan-out, and ~6× the billable usage:
 *   useMessages, usePresence, useNotifications,
 *   useTeamspaceSettings, useChannels, useChannelReads
 *
 * Now all hooks share this one instance, reducing connections to 1 per tab.
 */

import Ably from "ably";

let _ablyClient: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (!_ablyClient) {
    _ablyClient = new Ably.Realtime({
      authUrl: "/api/teamspace/ably-token",
      authMethod: "GET",
    });
  }
  return _ablyClient;
}