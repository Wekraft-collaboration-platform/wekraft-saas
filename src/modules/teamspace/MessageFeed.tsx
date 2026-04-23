"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMessages } from "./hooks/useMessages";
import { toast } from "sonner";
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


import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { Id } from "../../../convex/_generated/dataModel";


interface Props {
  channel: Channel | null;
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
  projectId: string;
  onToggleMembers: () => void;
}


function DateDivider({ timestamp }: { timestamp: number }) {
  const d = new Date(timestamp);
  const label = isToday(d) ? "Today" : isYesterday(d) ? "Yesterday" : format(d, "MMMM d, yyyy");
  return (
    <div className="flex items-center mt-4 mb-2 mx-4 relative group">
      <div className="flex-1 h-[1px] bg-border/80 group-hover:bg-border/90 transition-colors" />
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
  onToggleMembers,
}: Props) {
  const { isOwner, isPower } = useProjectPermissions(projectId as Id<"projects">);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);
  const [atBottom, setAtBottom] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(new Set());

  const handlePin = useCallback((messageId: string, pin: boolean) => {
    // toast MUST be outside the setState updater — React Strict Mode
    // double-invokes updaters in dev, which would fire the toast twice.
    setPinnedMessageIds((prev) => {
      const next = new Set(prev);
      if (pin) next.add(messageId);
      else next.delete(messageId);
      return next;
    });
    if (pin) {
      toast.success("Message pinned", { duration: 2000 });
    } else {
      toast("Message unpinned", { duration: 2000 });
    }
  }, []);

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
    if (atBottom && messages.length > 0) {
      isAutoScrolling.current = true;
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      
      // Reset auto-scrolling flag after a delay to allow the smooth scroll to complete
      const timer = setTimeout(() => {
        isAutoScrolling.current = false;
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [messages.length]); // Only depend on message length changes

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isAutoScrolling.current) return;
    
    const el = e.currentTarget;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Using a slightly more strict threshold and ensuring we don't flicker
    setAtBottom(distFromBottom < 20);
  }, []);

  // Sync scroll state when content changes (e.g. after loading or channel switch)
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const isScrollable = el.scrollHeight > el.clientHeight;
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      
      // If not scrollable or near bottom, set atBottom to true
      setAtBottom(!isScrollable || distFromBottom < 20);
    }
  }, [messages.length, loading, channel?.id]);

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
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/80 flex-none bg-background/95 backdrop-blur shadow-sm z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-accent/40 p-1.5 rounded-md shrink-0">
            <ChannelIcon className="h-4 w-4 text-muted-foreground opacity-80" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-[15px] leading-tight text-foreground truncate">{channel.name}</h2>
              {isAnnouncement && (
                <Lock className="h-3.5 w-3.5 text-amber-500/70" />
              )}
            </div>
            {channel.description && (
              <p className="text-[11px] text-muted-foreground/70 truncate leading-tight mt-0.5">
                {channel.description}
              </p>
            )}
          </div>
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

          <div className="relative">
            <input 
              type="text" 
              placeholder={`Search chat`}
              className="bg-black w-48 text-xs px-2.5 py-1.5 pr-7 rounded-sm border focus:outline-none focus:ring-1 focus:ring-ring placeholder-muted-foreground/70"
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
                  isPinned={pinnedMessageIds.has(msg.id)}
                  canModerateAll={isPower}
                  onReply={(m) => {
                    setReplyingTo(m);
                  }}
                  onEdit={editMessage}
                  onDelete={deleteMessage}
                  onReact={toggleReaction}
                  onPin={handlePin}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <MessageComposer
        channelName={channel.name}
        replyingTo={replyingTo}
        onClearReply={() => setReplyingTo(null)}
        onSend={handleSend}
        disabled={!canSend}
        isAnnouncement={isAnnouncement}
      />

      {/* Jump to bottom FAB */}
      <AnimatePresence>
        {!atBottom && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-[110px] right-6 z-50 pointer-events-none"
          >
            <Button
              size="sm"
              variant="secondary"
              className="shadow-2xl h-10 rounded-full px-5 gap-2.5 bg-background/95 backdrop-blur-md border border-border/80 hover:bg-accent hover:border-border transition-all pointer-events-auto active:scale-95 group"
              onClick={() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                setAtBottom(true);
              }}
            >
              <div className="bg-primary/20 p-1 rounded-full group-hover:bg-primary/30 transition-colors">
                <ArrowDown className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[13px] font-medium tracking-tight">Jump to bottom</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
