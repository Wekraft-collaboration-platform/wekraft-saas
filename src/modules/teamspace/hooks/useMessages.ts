"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Ably from "ably";

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

export function useMessages(channelId: string | null, projectId: string, threadParentId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const subscriptionRef = useRef<Ably.RealtimeChannel | null>(null);

  // Fetch initial history
  const fetchMessages = useCallback(
    async (cursor?: string) => {
      if (!channelId) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ channelId, limit: "50" });
        if (cursor) params.set("cursor", cursor);
        if (threadParentId) params.set("threadParentId", threadParentId);

        const res = await fetch(`/api/teamspace/messages?${params}`);
        const data = await res.json();

        const incoming: Message[] = data.messages ?? [];
        setMessages((prev) => (cursor ? [...incoming, ...prev] : incoming));
        setNextCursor(data.nextCursor ?? null);
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
      // Only add if not already present and matches thread context
      const isThread = !!threadParentId;
      const belongsHere = isThread
        ? newMsg.thread_parent_id === threadParentId
        : true; // All messages (including replies) show in main feed

      if (belongsHere) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      }

      // Bump reply_count on parent if we're in main feed and a thread reply came in
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

    const onEditedMsg = (msg: Ably.Message) => {
      const { id, content, edited_at } = msg.data;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content, edited_at } : m))
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
          const existing = reactions.find((r) => r.emoji === emoji);
          if (action === "add") {
            if (existing) {
              if (!existing.userIds.includes(userId)) {
                reactions = reactions.map((r) =>
                  r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r
                );
              }
            } else {
              reactions = [...reactions, { emoji, userIds: [userId] }];
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
    ch.subscribe("message.edited", onEditedMsg);
    ch.subscribe("message.deleted", onDeletedMsg);
    ch.subscribe("reaction.updated", onReactionUpdated);

    fetchMessages();

    return () => {
      ch.unsubscribe("message.new", onNewMsg);
      ch.unsubscribe("message.edited", onEditedMsg);
      ch.unsubscribe("message.deleted", onDeletedMsg);
      ch.unsubscribe("reaction.updated", onReactionUpdated);
    };
  }, [channelId, threadParentId, fetchMessages]);

  const sendMessage = useCallback(
    async (content: string, userId: string, userName: string, userImage: string | null, parentId?: string) => {
      if (!channelId || !content.trim()) return;

      const optimisticId = crypto.randomUUID();
      
      // Optimistic update
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
        
        // If Ably already delivered it, the IDs will match and it will naturally merge or ignore duplicates.
        // We can just ensure the state has the final message Object.
        if (json.message) {
          setMessages((prev) => prev.map((m) => (m.id === optimisticId ? json.message : m)));
        }
      } catch (err) {
        // Remove optimistic if failed
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
      }
    },
    [channelId, projectId]
  );

  const editMessage = useCallback(async (messageId: string, content: string) => {
    await fetch(`/api/teamspace/messages/${messageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    await fetch(`/api/teamspace/messages/${messageId}`, {
      method: "DELETE",
    });
  }, []);

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string, hasReacted: boolean) => {
      await fetch("/api/teamspace/reactions", {
        method: hasReacted ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, emoji }),
      });
    },
    []
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
    toggleReaction,
    loadMore,
  };
}
