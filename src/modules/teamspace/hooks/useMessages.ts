"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Ably from "ably";
import { toast } from "sonner";

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface Message {
  id: string;
  channel_id: string;
  project_id: string;
  user_id: string;
  user_name: string;
  user_image: string | null;
  content: string;
  thread_parent_id: string | null;
  is_pinned?: number;
  edited_at: number | null;
  created_at: number;
  reactions: Reaction[];
  reply_count?: number;
  parent_user_name?: string | null;
  parent_user_image?: string | null;
  parent_content?: string | null;
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

// Global in-memory cache for ultra-fast prefetching and cross-component sync
const memoryCache: Record<string, { messages: Message[], nextCursor: string | null, timestamp: number }> = {};

/**
 * Prefetches messages for a channel and stores them in the memory cache.
 */
export async function prefetchMessages(channelId: string, threadParentId?: string) {
  if (!channelId) return;
  
  // Skip if already prefetched recently (last 30 seconds)
  const cached = memoryCache[channelId];
  if (cached && Date.now() - cached.timestamp < 30000) return;

  try {
    const params = new URLSearchParams({ channelId, limit: "50" });
    if (threadParentId) params.set("threadParentId", threadParentId);

    const res = await fetch(`/api/teamspace/messages?${params}`);
    const data = await res.json();

    memoryCache[channelId] = {
      messages: data.messages ?? [],
      nextCursor: data.nextCursor ?? null,
      timestamp: Date.now(),
    };
    
    // Also warm up localStorage
    localStorage.setItem(`chat_cache_${channelId}`, JSON.stringify(data.messages?.slice(0, 50) ?? []));
  } catch (e) {
    console.warn("Prefetch failed for", channelId, e);
  }
}

export function useMessages(channelId: string | null, projectId: string, currentUserId: string, threadParentId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const subscriptionRef = useRef<Ably.RealtimeChannel | null>(null);

  // Initial cache load (Synchronous)
  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    // 1. Check memory cache first (latest prefetched data)
    const mem = memoryCache[channelId];
    if (mem && Date.now() - mem.timestamp < 60000) {
      setMessages(mem.messages);
      setNextCursor(mem.nextCursor);
      setLoading(false);
      return;
    }

    // 2. Check localStorage (persisted data)
    try {
      const local = localStorage.getItem(`chat_cache_${channelId}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Local cache read error", e);
    }

    // 3. Fallback to loading state if no cache
    setLoading(true);
  }, [channelId]);

  // Fetch fresh data from server
  const fetchMessages = useCallback(
    async (cursor?: string) => {
      if (!channelId) return;
      
      // If we don't have a cursor (initial fetch), we might already have cached data
      // but we still want to fetch fresh data in the background.
      if (cursor) setLoading(true); 

      try {
        const params = new URLSearchParams({ channelId, limit: "50" });
        if (cursor) params.set("cursor", cursor);
        if (threadParentId) params.set("threadParentId", threadParentId);

        const res = await fetch(`/api/teamspace/messages?${params}`);
        const data = await res.json();

        const incoming: Message[] = data.messages ?? [];
        
        setMessages((prev) => {
          const combined = cursor ? [...incoming, ...prev] : incoming;
          // De-duplicate if needed (though API should be clean)
          return combined;
        });
        setNextCursor(data.nextCursor ?? null);

        // Update caches for initial load
        if (!cursor) {
          memoryCache[channelId] = {
            messages: incoming,
            nextCursor: data.nextCursor ?? null,
            timestamp: Date.now(),
          };
          localStorage.setItem(`chat_cache_${channelId}`, JSON.stringify(incoming.slice(0, 50)));
        }
      } catch (e) {
        console.error("Failed to fetch messages", e);
      } finally {
        setLoading(false);
      }
    },
    [channelId, threadParentId]
  );

  // Ably real-time subscription
  useEffect(() => {
    if (!channelId) return;

    const ably = getAblyClient();
    const ch = ably.channels.get(`teamspace:${channelId}`);
    subscriptionRef.current = ch;

    const onNewMsg = (msg: Ably.Message) => {
      const newMsg = msg.data as Message;
      const isThread = !!threadParentId;
      const belongsHere = isThread ? newMsg.thread_parent_id === threadParentId : true;

      if (belongsHere) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg.id)) return prev;
          const next = [...prev, newMsg];
          // Update memory cache on new message
          if (memoryCache[channelId]) memoryCache[channelId].messages = next;
          return next;
        });
      }

      if (!isThread && newMsg.thread_parent_id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === newMsg.thread_parent_id
              ? { ...m, reply_count: (m.reply_count ?? 0) + 1 }
              : m
          )
        );
      }
    };

    const onUpdatedMsg = (msg: Ably.Message) => {
      const { id, content, is_pinned, edited_at } = msg.data;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m;
          const next = { ...m };
          if (content !== undefined) next.content = content;
          if (is_pinned !== undefined) next.is_pinned = is_pinned ? 1 : 0;
          if (edited_at !== undefined) next.edited_at = edited_at;
          return next;
        })
      );
    };

    const onDeletedMsg = (msg: Ably.Message) => {
      const { id } = msg.data;
      setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    const onReactionUpdated = (msg: Ably.Message) => {
      const { messageId, userId, emoji, action } = msg.data;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          let reactions = [...m.reactions];
          if (action === "add") {
            reactions = reactions
              .map((r) => ({
                ...r,
                userIds: r.userIds.filter((id) => id !== userId),
              }))
              .filter((r) => r.userIds.length > 0);

            const existing = reactions.find((r) => r.emoji === emoji);
            if (existing) {
              reactions = reactions.map((r) =>
                r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r
              );
            } else {
              reactions.push({ emoji, userIds: [userId] });
            }
          } else {
            reactions = reactions
              .map((r) =>
                r.emoji === emoji ? { ...r, userIds: r.userIds.filter((u) => u !== userId) } : r
              )
              .filter((r) => r.userIds.length > 0);
          }
          return { ...m, reactions };
        })
      );
    };

    ch.subscribe("message.new", onNewMsg);
    ch.subscribe("message.updated", onUpdatedMsg);
    ch.subscribe("message.deleted", onDeletedMsg);
    ch.subscribe("reaction.updated", onReactionUpdated);

    fetchMessages();

    return () => {
      ch.unsubscribe("message.new", onNewMsg);
      ch.unsubscribe("message.updated", onUpdatedMsg);
      ch.unsubscribe("message.deleted", onDeletedMsg);
      ch.unsubscribe("reaction.updated", onReactionUpdated);
      subscriptionRef.current = null;
    };
  }, [channelId, threadParentId, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string, userId: string, userName: string, userImage: string | null, parentId?: string) => {
      if (!channelId || !content.trim()) return;

      const optimisticId = crypto.randomUUID();
      const tmpMsg: Message = {
        id: optimisticId,
        channel_id: channelId,
        project_id: projectId,
        user_id: userId,
        user_name: userName,
        user_image: userImage,
        content: content.trim(),
        thread_parent_id: parentId ?? null,
        created_at: Date.now(),
        edited_at: null,
        reactions: [],
      };
      setMessages((prev) => [...prev, tmpMsg]);

      try {
        const res = await fetch("/api/teamspace/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: optimisticId,
            channelId,
            projectId,
            content,
            userName,
            userImage,
            threadParentId: parentId ?? null,
          }),
        });
        const json = await res.json();
        if (json.message) {
          setMessages((prev) => prev.map((m) => (m.id === optimisticId ? json.message : m)));
        }
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
    },
    [channelId, projectId]
  );

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      const previousMessages = [...messages];
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: content.trim(), edited_at: Date.now() } : m))
      );

      try {
        const res = await fetch(`/api/teamspace/messages/${messageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error("Failed to edit message");
      } catch (err) {
        console.error("Edit message sync error:", err);
        setMessages(previousMessages);
        toast.error("Failed to edit message. Please try again.");
      }
    },
    [messages]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      const previousMessages = [...messages];
      setMessages((prev) => prev.filter((m) => m.id !== messageId));

      try {
        const res = await fetch(`/api/teamspace/messages/${messageId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete message");
      } catch (err) {
        console.error("Delete message sync error:", err);
        setMessages(previousMessages);
        toast.error("Failed to delete message. Please try again.");
      }
    },
    [messages]
  );

  const togglePin = useCallback(
    async (messageId: string, pin: boolean) => {
      const previousMessages = [...messages];
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, is_pinned: pin ? 1 : 0 } : m))
      );

      try {
        const res = await fetch(`/api/teamspace/messages/${messageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_pinned: pin }),
        });
        if (!res.ok) throw new Error("Failed to update pin");
      } catch (err) {
        console.error("Pin sync error:", err);
        setMessages(previousMessages);
        toast.error("Failed to update pin status.");
      }
    },
    [messages]
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string, hasReacted: boolean) => {
      const previousMessages = [...messages];
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          let reactions = [...m.reactions];
          reactions = reactions
            .map((r) => ({
              ...r,
              userIds: r.userIds.filter((u) => u !== currentUserId),
            }))
            .filter((r) => r.userIds.length > 0);

          if (!hasReacted) {
            const existingIdx = reactions.findIndex((r) => r.emoji === emoji);
            if (existingIdx > -1) {
              reactions[existingIdx] = {
                ...reactions[existingIdx],
                userIds: [...reactions[existingIdx].userIds, currentUserId],
              };
            } else {
              reactions.push({ emoji, userIds: [currentUserId] });
            }
          }
          return { ...m, reactions };
        })
      );

      try {
        const response = await fetch("/api/teamspace/reactions", {
          method: hasReacted ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId, emoji, channelId }),
        });
        if (!response.ok) throw new Error("Failed to update reaction on server");
      } catch (error) {
        console.error("Reaction sync error:", error);
        setMessages(previousMessages);
      }
    },
    [currentUserId, messages, channelId]
  );

  const loadMore = useCallback(() => {
    if (nextCursor) fetchMessages(nextCursor);
  }, [nextCursor, fetchMessages]);

  return {
    messages,
    loading,
    hasMore: !!nextCursor,
    sendMessage,
    editMessage,
    deleteMessage,
    togglePin,
    toggleReaction,
    loadMore,
  };
}
