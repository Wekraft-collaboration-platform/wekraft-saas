/**
 * useMessages.ts
 * 
 * The primary engine for real-time messaging in the Teamspace module.
 * 
 * Architecture:
 * - Real-time: Powered by Ably (Pub/Sub + Presence).
 * - Caching: Multi-layered (In-memory cache -> IndexedDB -> Server).
 * - Prefetching: Messages are prefetched on channel hover for near-instant load.
 * - Optimistic Updates: Local state is updated immediately before server confirmation.
 * 
 * Features:
 * - Real-time message reception (new, updated, deleted).
 * - Typing indicators and member presence tracking.
 * - Reaction synchronization.
 * - Threading support (via `threadParentId`).
 * - Infinite scrolling with cursor-based pagination.
 * - Offline support (persisted via IndexedDB).
 */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Ably from "ably";
import { toast } from "sonner";
import { chatDb } from "@/lib/db";

export interface Reaction {
  emoji: string;
  userIds: string[];
}

export interface PollVote {
  option_id: string;
  user_id: string;
  user_name: string;
  user_image: string | null;
}

export interface Poll {
  question: string;
  options: { id: string; text: string }[];
  allowMultiple: boolean;
  votes: PollVote[];
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
  link_preview?: {
    url: string;
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  } | null;
  poll?: Poll | null;
  reactions: Reaction[];
  reply_count?: number;
  parent_user_name?: string | null;
  parent_user_image?: string | null;
  parent_content?: string | null;
}

export interface TypingUser {
  userId: string;
  userName: string;
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
 * Prefetches messages for a channel and stores them in the memory cache and IndexedDB.
 */
export async function prefetchMessages(projectId: string, channelId: string, threadParentId?: string) {
  if (!channelId || !projectId) return;
  
  // Skip if already prefetched recently (last 30 seconds)
  const cached = memoryCache[channelId];
  if (cached && Date.now() - cached.timestamp < 30000) return;

  try {
    const params = new URLSearchParams({ projectId, channelId, limit: "50" });
    if (threadParentId) params.set("threadParentId", threadParentId);

    const res = await fetch(`/api/teamspace/messages?${params}`);
    const data = await res.json();

    const incoming = data.messages ?? [];
    const cursor = data.nextCursor ?? null;

    memoryCache[channelId] = {
      messages: incoming,
      nextCursor: cursor,
      timestamp: Date.now(),
    };
    
    // Warm up IndexedDB
    chatDb.set(channelId, incoming, cursor);
  } catch (e) {
    console.warn("Prefetch failed for", channelId, e);
  }
}

export function useMessages(channelId: string | null, projectId: string, currentUserId: string, currentUserName?: string, threadParentId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  
  const subscriptionRef = useRef<Ably.RealtimeChannel | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial cache load
  useEffect(() => {
    if (!channelId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const mem = memoryCache[channelId];
    if (mem && Date.now() - mem.timestamp < 60000) {
      setMessages(mem.messages);
      setNextCursor(mem.nextCursor);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const loadFromDb = async () => {
      try {
        const cached = await chatDb.get(channelId);
        if (isMounted && cached && cached.messages.length > 0) {
          setMessages((prev) => prev.length === 0 ? cached.messages : prev);
          setNextCursor((prev) => prev === null ? cached.nextCursor : prev);
          setLoading(false);
        }
      } catch (e) {
        console.error("IndexedDB read error", e);
      }
    };

    loadFromDb();
    
    return () => { isMounted = false; };
  }, [channelId]);

  // Fetch fresh data from server
  const fetchMessages = useCallback(
    async (cursor?: string) => {
      if (!channelId || !projectId) return;
      
      if (cursor) setLoading(true); 

      try {
        const params = new URLSearchParams({ projectId, channelId, limit: "50" });
        if (cursor) params.set("cursor", cursor);
        if (threadParentId) params.set("threadParentId", threadParentId);

        const res = await fetch(`/api/teamspace/messages?${params}`);
        const data = await res.json();

        if (data.error) throw new Error(data.error);

        const incoming: Message[] = data.messages ?? [];
        const nextC = data.nextCursor ?? null;
        
        setMessages((prev) => {
          const combined = cursor ? [...incoming, ...prev] : incoming;
          return combined;
        });
        setNextCursor(nextC);

        if (!cursor) {
          memoryCache[channelId] = {
            messages: incoming,
            nextCursor: nextC,
            timestamp: Date.now(),
          };
          chatDb.set(channelId, incoming, nextC);
        }
      } catch (e) {
        console.error("Failed to fetch messages", e);
        if (e instanceof Error && e.message.includes("Forbidden")) {
          toast.error("Access denied to this project's messages");
        }
      } finally {
        setLoading(false);
      }
    },
    [channelId, projectId, threadParentId]
  );

  // Ably real-time subscription & presence
  useEffect(() => {
    if (!channelId) return;

    const ably = getAblyClient();
    const ch = ably.channels.get(`teamspace:${channelId}`);
    subscriptionRef.current = ch;

    // Presence & Typing logic
    ch.presence.enter({ userId: currentUserId, userName: currentUserName });
    
    const updatePresence = () => {
      ch.presence.get().then((members) => {
        setOnlineIds(new Set(members.map((m) => m.clientId)));
      }).catch(console.error);
    };

    ch.presence.subscribe("enter", updatePresence);
    ch.presence.subscribe("leave", updatePresence);
    updatePresence();

    const onNewMsg = (msg: Ably.Message) => {
      const newMsg = msg.data as Message;
      const isThread = !!threadParentId;
      const belongsHere = isThread ? newMsg.thread_parent_id === threadParentId : true;

      if (belongsHere) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === newMsg.id)) return prev;
          const next = [...prev, newMsg];
          if (memoryCache[channelId]) memoryCache[channelId].messages = next;
          return next;
        });
        // Remove typing indicator if it was from this user
        setTypingUsers(prev => prev.filter(u => u.userId !== newMsg.user_id));
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

    const onDeletedMsg = (msg: Ably.Message) => {
      const { id } = msg.data;
      setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    const onTyping = (msg: Ably.Message) => {
      const { userId, userName, isTyping } = msg.data;
      if (userId === currentUserId) return;

      setTypingUsers(prev => {
        if (isTyping) {
          if (prev.find(u => u.userId === userId)) return prev;
          return [...prev, { userId, userName }];
        } else {
          return prev.filter(u => u.userId !== userId);
        }
      });
    };

    const onPollVoted = (msg: Ably.Message) => {
      const { messageId, optionId, userId, userName, userImage, action, allowMultiple } = msg.data;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId || !m.poll) return m;
          let votes = [...m.poll.votes];
          
          if (action === "add") {
            if (!allowMultiple) {
              votes = votes.filter(v => v.user_id !== userId);
            }
            votes.push({ option_id: optionId, user_id: userId, user_name: userName, user_image: userImage });
          } else {
            votes = votes.filter(v => !(v.option_id === optionId && v.user_id === userId));
          }
          
          return { ...m, poll: { ...m.poll, votes } };
        })
      );
    };

    ch.subscribe("message.new", onNewMsg);
    ch.subscribe("message.updated", onUpdatedMsg);
    ch.subscribe("message.deleted", onDeletedMsg);
    ch.subscribe("reaction.updated", onReactionUpdated);
    ch.subscribe("typing", onTyping);
    ch.subscribe("poll.voted", onPollVoted);

    fetchMessages();

    return () => {
      ch.presence.leave();
      ch.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [channelId, threadParentId, fetchMessages, currentUserId, currentUserName]);

  const sendMessage = useCallback(
    async (content: string, userId: string, userName: string, userImage: string | null, parentId?: string, poll?: any) => {
      if (!channelId || (!content.trim() && !poll)) return;

      const optimisticId = crypto.randomUUID();
      const tmpMsg: Message = {
        id: optimisticId,
        channel_id: channelId,
        project_id: projectId,
        user_id: userId,
        user_name: userName,
        user_image: userImage,
        content: content.trim(),
        poll: poll ? { ...poll, votes: [] } : null,
        thread_parent_id: parentId ?? null,
        created_at: Date.now(),
        edited_at: null,
        reactions: [],
      };
      setMessages((prev) => [...prev, tmpMsg]);

      // Stop typing on send
      if (subscriptionRef.current) {
        subscriptionRef.current.publish("typing", { userId, userName, isTyping: false });
      }

      try {
        const res = await fetch("/api/teamspace/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: optimisticId,
            channelId,
            projectId,
            content,
            threadParentId: parentId ?? null,
            poll,
          }),
        });
        const json = await res.json();
        if (json.message) {
          setMessages((prev) => prev.map((m) => (m.id === optimisticId ? json.message : m)));
        } else if (json.error) {
          throw new Error(json.error);
        }
      } catch (err) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
        toast.error(err instanceof Error ? err.message : "Failed to send message");
      }
    },
    [channelId, projectId]
  );

  const setTypingStatus = useCallback((isTyping: boolean) => {
    if (!subscriptionRef.current || !channelId) return;

    // Clear existing timer
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    subscriptionRef.current.publish("typing", { 
      userId: currentUserId, 
      userName: currentUserName, 
      isTyping 
    });

    if (isTyping) {
      // Auto-clear typing after 5 seconds of inactivity
      typingTimerRef.current = setTimeout(() => {
        subscriptionRef.current?.publish("typing", { 
          userId: currentUserId, 
          userName: currentUserName, 
          isTyping: false 
        });
      }, 5000);
    }
  }, [channelId, currentUserId, currentUserName]);

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
          body: JSON.stringify({ projectId, content }),
        });
        if (!res.ok) throw new Error("Failed to edit message");
      } catch (err) {
        console.error("Edit message sync error:", err);
        setMessages(previousMessages);
        toast.error("Failed to edit message. Please try again.");
      }
    },
    [messages, projectId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      const previousMessages = [...messages];
      setMessages((prev) => prev.filter((m) => m.id !== messageId));

      try {
        const res = await fetch(`/api/teamspace/messages/${messageId}?projectId=${projectId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete message");
      } catch (err) {
        console.error("Delete message sync error:", err);
        setMessages(previousMessages);
        toast.error("Failed to delete message. Please try again.");
      }
    },
    [messages, projectId]
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
          body: JSON.stringify({ projectId, is_pinned: pin }),
        });
        if (!res.ok) throw new Error("Failed to update pin");
      } catch (err) {
        console.error("Pin sync error:", err);
        setMessages(previousMessages);
        toast.error("Failed to update pin status.");
      }
    },
    [messages, projectId]
  );

  const toggleReaction = useCallback(
    async (messageId: string, emoji: string, hasReacted: boolean) => {
      if (!channelId || !projectId) return;

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
          body: JSON.stringify({ projectId, messageId, emoji, channelId }),
        });
        if (!response.ok) throw new Error("Failed to update reaction on server");
      } catch (error) {
        console.error("Reaction sync error:", error);
        setMessages(previousMessages);
      }
    },
    [currentUserId, messages, channelId, projectId]
  );

  const togglePollVote = useCallback(
    async (messageId: string, optionId: string) => {
      if (!channelId || !projectId) return;

      const msg = messages.find(m => m.id === messageId);
      if (!msg || !msg.poll) return;

      const previousMessages = [...messages];
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId || !m.poll) return m;
          let votes = [...m.poll.votes];
          const existing = votes.find(v => v.option_id === optionId && v.user_id === currentUserId);
          
          if (existing) {
            votes = votes.filter(v => !(v.option_id === optionId && v.user_id === currentUserId));
          } else {
            if (!m.poll.allowMultiple) {
              votes = votes.filter(v => v.user_id !== currentUserId);
            }
            votes.push({ option_id: optionId, user_id: currentUserId, user_name: currentUserName || "User", user_image: null });
          }
          
          return { ...m, poll: { ...m.poll, votes } };
        })
      );

      try {
        const response = await fetch("/api/teamspace/polls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, messageId, optionId, channelId }),
        });
        if (!response.ok) throw new Error("Failed to vote on poll");
      } catch (error) {
        console.error("Poll vote sync error:", error);
        setMessages(previousMessages);
      }
    },
    [currentUserId, currentUserName, messages, channelId, projectId]
  );

  const loadMore = useCallback(() => {
    if (nextCursor) fetchMessages(nextCursor);
  }, [nextCursor, fetchMessages]);

  return {
    messages,
    loading,
    hasMore: !!nextCursor,
    typingUsers,
    onlineIds,
    sendMessage,
    setTypingStatus,
    editMessage,
    deleteMessage,
    togglePin,
    toggleReaction,
    togglePollVote,
    loadMore,
  };
}


