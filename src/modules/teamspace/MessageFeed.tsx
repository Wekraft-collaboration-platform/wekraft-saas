"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMessages } from "./hooks/useMessages";
import { MessageItem } from "./MessageItem";
import { MessageComposer } from "./MessageComposer";
import { Message } from "./hooks/useMessages";
import { Channel } from "./hooks/useChannels";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Hash, Megaphone, ChevronUp, ArrowDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  channel: Channel | null;
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
  projectId: string;
  onReply: (message: Message) => void;
}

function DateDivider({ timestamp }: { timestamp: number }) {
  const d = new Date(timestamp);
  const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMMM d, yyyy");
  return (
    <div className="flex items-center gap-3 px-4 my-3">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[11px] font-medium text-muted-foreground px-2">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

export function MessageFeed({
  channel,
  currentUserId,
  currentUserName,
  currentUserImage,
  projectId,
  onReply,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const {
    messages,
    loading,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    loadMore,
  } = useMessages(channel?.id ?? null, projectId);

  // Auto-scroll to bottom on new messages (only if already at bottom)
  useEffect(() => {
    if (atBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, atBottom]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setAtBottom(distFromBottom < 60);
  }, []);

  const handleSend = async (content: string) => {
    await sendMessage(content, currentUserName, currentUserImage, replyingTo?.id);
    setReplyingTo(null);
  };

  const isAnnouncement = channel?.type === "announcement";

  // Group messages by date for date dividers
  const withDividers: Array<Message | { type: "divider"; date: number }> = [];
  let lastDate: string | null = null;

  for (const msg of messages) {
    const dateKey = format(new Date(msg.created_at), "yyyy-MM-dd");
    if (dateKey !== lastDate) {
      withDividers.push({ type: "divider", date: msg.created_at });
      lastDate = dateKey;
    }
    withDividers.push(msg);
  }

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Select a channel to start chatting</p>
      </div>
    );
  }

  const ChannelIcon = channel.type === "announcement" ? Megaphone : Hash;

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden relative">
      {/* Channel header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0 bg-background/80 backdrop-blur-sm">
        <ChannelIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div>
          <h2 className="font-semibold text-sm leading-none">{channel.name}</h2>
          {channel.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{channel.description}</p>
          )}
        </div>
        {isAnnouncement && (
          <div className="ml-auto flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Lock className="h-3 w-3" />
            Announcements only
          </div>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-2"
        onScroll={handleScroll}
      >
        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <Button size="sm" variant="outline" onClick={loadMore} className="text-xs h-7">
              <ChevronUp className="h-3 w-3 mr-1" />
              Load earlier messages
            </Button>
          </div>
        )}

        {loading ? (
          <div className="px-4 space-y-4 py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-4 w-3/4" />
                  {i % 2 === 0 && <Skeleton className="h-4 w-1/2" />}
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center">
              <ChannelIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm">Welcome to #{channel.name}!</p>
              <p className="text-xs text-muted-foreground mt-1">
                {channel.description || "This is the beginning of this channel."}
              </p>
            </div>
          </div>
        ) : (
          <div className="pb-2">
            {withDividers.map((item, i) => {
              if ("type" in item && item.type === "divider") {
                return <DateDivider key={`divider-${item.date}`} timestamp={item.date} />;
              }
              const msg = item as Message;
              const prevMsg = i > 0 ? (withDividers[i - 1] as Message) : null;
              const isGrouped =
                prevMsg &&
                !("type" in prevMsg) &&
                prevMsg.user_id === msg.user_id &&
                msg.created_at - prevMsg.created_at < 5 * 60 * 1000;

              return (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  isGrouped={!!isGrouped}
                  currentUserId={currentUserId}
                  onReply={(m) => {
                    setReplyingTo(m);
                    onReply(m);
                  }}
                  onEdit={editMessage}
                  onDelete={deleteMessage}
                  onReact={toggleReaction}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Jump to bottom FAB */}
      <AnimatePresence>
        {!atBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 right-4"
          >
            <Button
              size="sm"
              variant="secondary"
              className="shadow-lg h-8 gap-1.5"
              onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
            >
              <ArrowDown className="h-3.5 w-3.5" />
              Jump to bottom
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Composer */}
      <MessageComposer
        channelName={channel.name}
        replyingTo={replyingTo}
        onClearReply={() => setReplyingTo(null)}
        onSend={handleSend}
        disabled={isAnnouncement}
      />
    </div>
  );
}
