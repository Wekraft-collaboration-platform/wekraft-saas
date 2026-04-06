"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery as useReactQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Message = {
  id: string;
  senderId: string;
  channelId: string;
  text: string;
  type: string;
  createdAt: number;
};

export function useTeamspaceChat(channelId: string | null) {
  const queryClient = useQueryClient();
  const historicalIdsRef = useRef<Set<string>>(new Set());

  // 1. Fetch History from Turso via React Query
  // This runs once when the channel is opened to get the last 50 messages
  const { data: historicalMessages = [], isLoading, isFetching } = useReactQuery<Message[]>({
    queryKey: ["teamspace", "messages", channelId],
    queryFn: async () => {
      if (!channelId) return [];
      const res = await fetch(`/api/teamspace/messages?channelId=${channelId}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    enabled: !!channelId,
    staleTime: Infinity, 
  });

  // Update ref when historicalMessages changes
  useEffect(() => {
    historicalIdsRef.current = new Set(historicalMessages.map((m) => m.id));
  }, [historicalMessages]);

  // 2. Subscribe to Real-Time Signals from Convex
  const signals = useConvexQuery(api.signals.watchChannel, 
    channelId ? { channelId } : "skip"
  );

  // 3. Merge Strategy
  // We keep a local state of new messages received via signal to append to history
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!signals) return;
    
    // Filter signals to only show "new_message", and extract payload
    const incomingMessages = signals
      .filter((s) => s.type === "new_message")
      .map((s) => s.payload as Message)
      .reverse(); // Reverse if convex returns newest first

    // We only want messages that aren't already in historical data
    setLiveMessages((prev) => {
      // Find uniquely new messages
      const newM = incomingMessages.filter(
        (im) => !historicalIdsRef.current.has(im.id)
      );
      
      // Also dedupe against ourselves (prev)
      const trulyNew = newM.filter(
        (nm) => !prev.find((pm) => pm.id === nm.id)
      );

      if (trulyNew.length === 0) return prev;
      return [...prev, ...trulyNew];
    });
  }, [signals]);

  // Combine them into one unified list for the UI
  const mergedMessages = useMemo(() => {
    return [...historicalMessages, ...liveMessages].sort((a, b) => a.createdAt - b.createdAt);
  }, [historicalMessages, liveMessages]);

  // Reset live messages when channel changes
  useEffect(() => {
    setLiveMessages([]);
  }, [channelId]);

  // 4. Send Message Mutation
  const sendMessage = useMutation({
    mutationFn: async ({ text, type = "text" }: { text: string; type?: string }) => {
      if (!channelId) throw new Error("No channel selected");
      const res = await fetch("/api/teamspace/messages", {
        method: "POST",
        body: JSON.stringify({ channelId, text, type }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    // Optimistic Update can be added here
    onMutate: async (newMessage) => {
       // Append a temporary message to `liveMessages` if you want instant input response
    }
  });

  return {
    messages: mergedMessages,
    // Only show loading when channelId exists AND fetch is in progress
    // Without this, disabled queries (enabled:false) falsely report isLoading=true in TanStack v5
    isLoadingHistory: !!channelId && (isLoading || isFetching),
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
  };
}
