"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery as useReactQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Message = {
  id: string;
  senderId: string;
  senderName?: string;
  senderImage?: string;
  projectId: string;
  text: string;
  type: string;
  createdAt: number;
};

export function useTeamspaceChat(projectId: string | null) {
  const queryClient = useQueryClient();
  const historicalIdsRef = useRef<Set<string>>(new Set());

  // 1. Fetch History from Turso via React Query
  // This runs once when the project is opened to get the last 50 messages
  const { data: historicalMessages = [], isLoading, isFetching } = useReactQuery<Message[]>({
    queryKey: ["teamspace", "messages", projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await fetch(`/api/teamspace/messages?projectId=${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
    enabled: !!projectId,
    staleTime: Infinity, 
  });

  // Update ref when historicalMessages changes
  useEffect(() => {
    historicalIdsRef.current = new Set(historicalMessages.map((m) => m.id));
  }, [historicalMessages]);

  // 2. Subscribe to Real-Time Signals from Convex
  const signals = useConvexQuery(api.signals.watchProject, 
    projectId ? { projectId } : "skip"
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

  // Reset live messages when project changes
  useEffect(() => {
    setLiveMessages([]);
  }, [projectId]);

  // 4. Send Message Mutation
  const sendMessage = useMutation({
    mutationFn: async ({ text, type = "text" }: { text: string; type?: string }) => {
      if (!projectId) throw new Error("No project selected");
      const res = await fetch("/api/teamspace/messages", {
        method: "POST",
        body: JSON.stringify({ projectId, text, type }),
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
    // Only show loading when projectId exists AND fetch is in progress
    // Without this, disabled queries (enabled:false) falsely report isLoading=true in TanStack v5
    isLoadingHistory: !!projectId && (isLoading || isFetching),
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
  };
}
