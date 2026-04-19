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
import { Hash, Megaphone, ChevronUp, ArrowDown, Lock, Search, Bell, Pin, Users, Inbox, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


interface Props {
  channel: Channel | null;
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
  projectId: string;
  isOwner: boolean;
  onToggleMembers: () => void;
}


function DateDivider({ timestamp }: { timestamp: number }) {
  const d = new Date(timestamp);
  const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMMM d, yyyy");
  return (
    <div className="flex items-center mt-4 mb-2 mx-4 relative group">
      <div className="flex-1 h-[1px] bg-border/40 group-hover:bg-border/60 transition-colors" />
      <span className="absolute left-1/2 -translate-x-1/2 bg-background px-2 text-[11px] font-semibold text-muted-foreground/80 lowercase">
        {label}
      </span>
    </div>
  );
}

export function MessageFeed({
  channel,
  currentUserId,
  currentUserName,
  currentUserImage,
  projectId,
  isOwner,
  onToggleMembers,
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
    await sendMessage(content, currentUserId, currentUserName, currentUserImage, replyingTo?.id);
    setReplyingTo(null);
  };

  const isAnnouncement = channel?.type === "announcement";
  const canSend = !isAnnouncement || isOwner;

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
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 flex-none bg-background/95 backdrop-blur shadow-sm z-10">
        <div className="flex items-center gap-2 min-w-0">
          <ChannelIcon className="h-5 w-5 text-muted-foreground shrink-0 opacity-70" />
          <h2 className="font-bold text-[15px] leading-none text-foreground truncate">{channel.name}</h2>
          {isAnnouncement && (
            <Lock className="h-3.5 w-3.5 text-amber-500/70 ml-1" />
          )}
          {channel.description && (
            <>
              <div className="h-4 w-[1px] bg-border/60 mx-2" />
              <p className="text-[13px] text-muted-foreground truncate">{channel.description}</p>
            </>
          )}
        </div>

        <div className="flex items-center gap-4 ml-4 shrink-0">
          <TooltipProvider delayDuration={400}>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Bell className="h-5 w-5 hover:text-foreground cursor-pointer transition-colors" />
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Pin className="h-5 w-5 hover:text-foreground cursor-pointer transition-colors" />
                </TooltipTrigger>
                <TooltipContent>Pinned Messages</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Users 
                    className="h-5 w-5 hover:text-foreground cursor-pointer transition-colors" 
                    onClick={onToggleMembers}
                  />
                </TooltipTrigger>
                <TooltipContent>Show Member List</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <div className="relative group">
            <input 
              type="text" 
              placeholder={`Search ${channel.name}`}
              className="bg-accent/40 w-36 group-hover:w-48 transition-all duration-200 text-xs px-2.5 py-1.5 pr-7 rounded-sm border-none focus:outline-none focus:ring-1 focus:ring-ring placeholder-muted-foreground/70"
            />
            <Search className="h-3.5 w-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
          </div>
        </div>

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
        disabled={!canSend}
        isAnnouncement={isAnnouncement}
      />
    </div>
  );
}
