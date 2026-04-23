/**
 * ThreadPanel.tsx
 * 
 * Side panel for viewing and interacting with message threads.
 * 
 * Features:
 * - Displays a parent message and all its replies.
 * - Real-time synchronization for thread messages.
 * - Same interactive features as the main feed (Reactions, Edit, Delete).
 * - Smooth transition and layout integration with the main feed.
 * 
 * Integration:
 * - Opened from a `MessageItem` to focus on a specific conversation branch.
 * - Uses `useMessages` hook with a `threadParentId` to filter for replies.
 */
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Reply, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "./hooks/useMessages";
import { useMessages } from "./hooks/useMessages";
import { MessageItem } from "./MessageItem";
import { MessageComposer } from "./MessageComposer";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  parentMessage: Message | null;
  channelId: string | null;
  channelName: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
  onClose: () => void;
  projectId: string;
}

export function ThreadPanel({
  parentMessage,
  channelId,
  channelName,
  currentUserId,
  currentUserName,
  currentUserImage,
  onClose,
  projectId,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    loading,
    sendMessage,
    editMessage,
    deleteMessage,
    togglePin,
    toggleReaction,
  } = useMessages(channelId, projectId, currentUserId, parentMessage?.id);

  const handleSend = async (content: string) => {
    await sendMessage(content, currentUserId, currentUserName, currentUserImage, parentMessage?.id);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <AnimatePresence>
      {parentMessage && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="flex flex-col h-full w-80 border-l bg-background shrink-0"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Thread</span>
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Hash className="h-3 w-3" />{channelName}
              </span>
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Parent message */}
          <div className="px-4 py-3 border-b bg-accent/20 shrink-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xs font-semibold">{parentMessage.user_name}</span>
              <span className="text-[10px] text-muted-foreground">Original</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{parentMessage.content}</p>
          </div>

          <Separator className="text-muted-foreground/30">
            <span className="text-[10px] px-2 text-muted-foreground">
              {messages.length} {messages.length === 1 ? "reply" : "replies"}
            </span>
          </Separator>

          {/* Thread messages */}
          <ScrollArea className="flex-1 py-2">
            {loading ? (
              <div className="px-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {messages.map((msg, i) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isGrouped={
                      i > 0 &&
                      messages[i - 1].user_id === msg.user_id &&
                      msg.created_at - messages[i - 1].created_at < 5 * 60 * 1000
                    }
                    currentUserId={currentUserId}
                    onReply={() => {}} // no nested threads
                    onEdit={editMessage}
                    onDelete={deleteMessage}
                    onReact={toggleReaction}
                    onPin={togglePin}
                  />
                ))}
                <div ref={bottomRef} />
              </div>
            )}
          </ScrollArea>

          {/* Composer */}
          <MessageComposer
            channelName={channelName}
            onSend={handleSend}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
