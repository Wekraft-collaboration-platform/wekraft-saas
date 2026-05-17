/**
 * MessageFeed.tsx
 *
 * The core messaging area for a channel. Displays a real-time list of messages,
 * handles scrolling, pagination, and various message actions.
 *
 * Features:
 * - Real-time message updates via Ably.
 * - Infinite scrolling (Load earlier messages).
 * - Automatic scrolling to bottom on new messages.
 * - Date dividers and message grouping for better readability.
 * - Pinned messages popover and navigation.
 * - Message composition with reply support.
 *
 * Integration:
 * - Uses `useMessages` hook for all real-time messaging logic.
 * - Integrates with `MessageItem` for individual message rendering.
 * - Integrates with `MessageComposer` for sending new messages.
 */
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
import {
  Hash,
  Megaphone,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  Lock,
  Search,
  Bell,
  Pin,
  Users,
  Inbox,
  HelpCircle,
  X,
  ArrowLeft,
  PinOff,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NotificationCenter } from "./NotificationCenter";
import { PollBlock } from "./PollBlock";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { Id } from "../../../../convex/_generated/dataModel";

interface Props {
  channel: Channel | null;
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
  projectId: string;
  projectSlug: string;
  onToggleMembers: () => void;
  onSelectChannelId?: (channelId: string, messageId?: string) => void;
  targetMessageId?: string | null;
  onClearTargetMessageId?: () => void;
}

function DateDivider({ timestamp }: { timestamp: number }) {
  const d = new Date(timestamp);
  const label = isToday(d)
    ? "Today"
    : isYesterday(d)
      ? "Yesterday"
      : format(d, "MMMM d, yyyy");
  return (
    <div className="flex items-center mt-4 mb-2 mx-4 relative group">
      <div className="flex-1 h-[1px] bg-border/80 group-hover:bg-border/90 transition-colors" />
      <span className="absolute left-1/2 -translate-x-1/2 bg-background px-2 text-[11px] font-semibold text-muted-foreground/80 capitalize">
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
  projectSlug,
  onToggleMembers,
  onSelectChannelId,
  targetMessageId,
  onClearTargetMessageId,
}: Props) {
  const { isOwner, isPower } = useProjectPermissions(
    projectId as Id<"projects">,
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);
  const [atBottom, setAtBottom] = useState(true);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);
  const {
    messages,
    loading,
    typingUsers,
    sendMessage,
    setTypingStatus,
    editMessage,
    editPoll,
    deleteMessage,
    togglePin,
    toggleReaction,
    togglePollVote,
    loadMore,
    hasMore,
  } = useMessages(
    channel?.id ?? null,
    projectId,
    currentUserId,
    currentUserName,
  )

  // Trigger jumpToMessage when navigated from a notification
  useEffect(() => {
    if (targetMessageId && !loading && messages.length > 0) {
      jumpToMessage(targetMessageId);
      if (onClearTargetMessageId) {
        onClearTargetMessageId();
      }
    }
  }, [targetMessageId, loading, messages.length, onClearTargetMessageId]);

  // --- WHATSAPP-STYLE SEARCH LOGIC ---
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const params = new URLSearchParams({
          projectId,
          q: searchQuery,
          channelId: channel?.id || "",
        });
        const res = await fetch(`/api/teamspace/search?${params}`);
        if (!res.ok) throw new Error("Search request failed");

        const data = await res.json();
        if (data.results) {
          const ids = data.results.map((r: any) => String(r.id || r._id));
          setSearchResults(ids);
          if (ids.length > 0) {
            // Start at the first result (index 0)
            setCurrentSearchIndex(0);
            jumpToMessage(ids[0]);
          }
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, projectId, channel?.id]);

  const jumpToMessage = (messageId: string) => {
    // Attempt multiple times to handle cases where the DOM might be updating
    const attemptScroll = (count = 0) => {
      const wordEl = document.getElementById(`search-match-${messageId}`);
      const messageEl = document.getElementById(`message-${messageId}`);
      const target = wordEl || messageEl;

      if (target) {
        // Clear previous highlights
        document.querySelectorAll(".premium-message-highlight").forEach((el) => {
          el.classList.remove("premium-message-highlight");
        });
        document.querySelectorAll(".search-highlight-pulse").forEach((el) => {
          el.classList.remove(
            "search-highlight-pulse",
            "ring-2",
            "ring-primary/40",
            "bg-primary/5",
          );
        });

        target.scrollIntoView({ behavior: "smooth", block: "center" });
        
        // Add a visual premium pulse to the message container
        const container =
          messageEl || (wordEl?.closest('[id^="message-"]') as HTMLElement);
        if (container) {
          container.classList.add("premium-message-highlight");
          setTimeout(() => {
            container.classList.remove("premium-message-highlight");
          }, 3500);
        }
      } else if (count < 5) {
        // If not found, try again in 150ms (useful if message was just loaded)
        setTimeout(() => attemptScroll(count + 1), 150);
      } else {
        console.warn(`Message ${messageId} not found in current view.`);
      }
    };

    attemptScroll();
  };

  const handleNextMatch = () => {
    if (searchResults.length === 0) return;
    // Go to NEWER message (decrement index towards 0 if 0 is newest, or cyclic)
    const nextIdx =
      (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    setCurrentSearchIndex(nextIdx);
    jumpToMessage(searchResults[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (searchResults.length === 0) return;
    // Go to OLDER message (increment index away from 0)
    const prevIdx = (currentSearchIndex + 1) % searchResults.length;
    setCurrentSearchIndex(prevIdx);
    jumpToMessage(searchResults[prevIdx]);
  };

  // Keyboard shortcuts for search
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchQuery("");
        return;
      }

      if (searchResults.length === 0) return;

      const isSearchInput =
        e.target instanceof HTMLInputElement &&
        e.target.placeholder === "Search chat";
      const isOtherInput =
        (e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement) &&
        !isSearchInput;

      if (isOtherInput) return;

      if (e.key === "Enter" && !e.shiftKey) {
        if (isSearchInput) {
          e.preventDefault();
          handlePrevMatch(); // ENTER usually goes to OLDER match (UP)
        }
      } else if (e.key === "Enter" && e.shiftKey) {
        if (isSearchInput) {
          e.preventDefault();
          handleNextMatch(); // SHIFT+ENTER goes to NEWER match (DOWN)
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevMatch();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNextMatch();
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [searchResults, currentSearchIndex]);

  const pinnedMessages = messages.filter((m) => m.is_pinned === 1);

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
    // Increased threshold so the button doesn't appear too early
    setAtBottom(distFromBottom < 1000);
  }, []);

  // Sync scroll state when content changes (e.g. after loading or channel switch)
  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const isScrollable = el.scrollHeight > el.clientHeight;
      const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

      // If not scrollable or near bottom, set atBottom to true
      setAtBottom(!isScrollable || distFromBottom < 1000);
    }
  }, [messages.length, loading, channel?.id]);

  // Initial scroll to bottom on first load of a channel
  const hasInitialScrolled = useRef(false);
  useEffect(() => {
    hasInitialScrolled.current = false;
  }, [channel?.id]);

  useEffect(() => {
    if (!loading && messages.length > 0 && !hasInitialScrolled.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
      setAtBottom(true);
      hasInitialScrolled.current = true;
    }
  }, [loading, messages.length]);

  const handleSend = async (content: string, poll?: any) => {
    await sendMessage(
      content,
      currentUserId,
      currentUserName,
      currentUserImage,
      replyingTo?.id,
      poll,
    );
    setReplyingTo(null);
  };

  const isAnnouncement = channel?.type === "announcement";
  const canSend = !isAnnouncement || isPower;

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
      <div className="flex items-center justify-between px-6 h-14 border-b border-border/80 flex-none bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="bg-primary/10 p-1.5 rounded-lg shrink-0 border border-primary/20">
            <ChannelIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xl leading-tight text-foreground truncate tracking-tight capitalize">
                {channel.name}
              </h2>
              {isAnnouncement && <Lock className="h-4 w-4 text-amber-500/70" />}
            </div>
            {channel.description && (
              <p className="text-[11px] text-muted-foreground/50 truncate leading-tight mt-0.5 font-medium first-letter:uppercase">
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
                  <NotificationCenter 
                    userId={currentUserId} 
                    onSelectChannel={onSelectChannelId}
                  />
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <button className="focus:outline-none relative group">
                        <Pin className="h-5 w-5 hover:text-foreground cursor-pointer transition-colors" />
                        {pinnedMessages.length > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500 text-[8px] font-bold text-white shadow-sm ring-1 ring-background">
                            {pinnedMessages.length}
                          </span>
                        )}
                      </button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Pinned Messages</TooltipContent>
                </Tooltip>
                <PopoverContent
                  className="w-80 p-0 shadow-2xl border-border/40 overflow-hidden bg-background/95 backdrop-blur-xl rounded-xl"
                  align="end"
                  sideOffset={12}
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500/10 to-transparent border-b border-border/50">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-blue-500/20 p-1 rounded-md">
                        <Pin className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-foreground/90">
                        Pins
                      </span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-accent/50 border border-border/40">
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {pinnedMessages.length} total
                      </span>
                    </div>
                  </div>
                  <ScrollArea className="h-[380px]">
                    {pinnedMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <div className="bg-accent/40 p-4 rounded-full mb-4 ring-8 ring-accent/10">
                          <Pin className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                        <p className="text-sm font-semibold text-foreground/80">
                          No pinned messages
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-1.5 leading-relaxed">
                          Pin important messages to find them easily later.
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 space-y-3">
                        {pinnedMessages
                          .slice()
                          .reverse()
                          .map((msg) => (
                            <div
                              key={msg.id}
                              className="group relative bg-accent/5 border border-border/20 rounded-xl p-3.5 hover:bg-accent/10 transition-all duration-200 cursor-pointer"
                              onClick={() => {
                                jumpToMessage(msg.id);
                              }}
                            >
                              <div className="flex gap-3">
                                <Avatar className="h-8 w-8 shrink-0">
                                  <AvatarImage
                                    src={msg.user_image ?? undefined}
                                  />
                                  <AvatarFallback className="text-[10px] bg-blue-500/10 text-blue-500 font-bold">
                                    {msg.user_name
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0 flex-1 pt-0.5">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[12px] font-bold text-foreground/90 leading-none">
                                      {msg.user_name}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground/40 font-medium">
                                      {format(
                                        new Date(msg.created_at),
                                        "MMM d",
                                      )}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-foreground/70 leading-relaxed antialiased line-clamp-3">
                                    {msg.content}
                                  </p>
                                </div>
                              </div>

                              <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePin(msg.id, false);
                                      }}
                                      className="absolute bottom-2 right-2 p-1.5 rounded-md bg-accent/20 border border-border/30 text-muted-foreground/40 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-sm"
                                    >
                                      <PinOff className="h-3 w-3" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="right"
                                    className="bg-white text-black text-[11px] font-bold px-2 py-1 border-none shadow-xl"
                                  >
                                    Unpin
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ))}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="px-4 py-2.5 bg-accent/30 border-t border-border/50 flex items-center justify-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-blue-500/50" />
                    <p className="text-[9px] font-semibold uppercase tracking-[0.05em] text-muted-foreground/60">
                      Pinned globally for all members
                    </p>
                  </div>
                </PopoverContent>
              </Popover>

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

          <div className="relative group flex items-center bg-accent/40 rounded-full border border-border/50 hover:bg-accent/60 transition-all overflow-hidden w-64 ring-primary/20 focus-within:ring-2">
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                placeholder="Search chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "bg-transparent text-[11px] px-3 py-1.5 w-full focus:outline-none placeholder:text-muted-foreground/50",
                  searchQuery ? "pr-[85px]" : "pr-8",
                )}
              />

              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                {searchQuery ? (
                  <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-border/60 shadow-lg animate-in fade-in zoom-in duration-300">
                    {searchResults.length > 0 && (
                      <span className="text-[11px] font-black text-primary/80 px-2 tabular-nums border-r border-border/50 mr-1.5">
                        {currentSearchIndex + 1}/{searchResults.length}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevMatch(); // UP -> Older
                      }}
                      title="Previous (ArrowUp)"
                      className="p-1.5 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-all active:scale-90 cursor-pointer"
                    >
                      <ChevronUp className="h-4.5 w-4.5 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextMatch(); // DOWN -> Newer
                      }}
                      title="Next (ArrowDown)"
                      className="p-1.5 hover:bg-primary/10 rounded-lg text-muted-foreground hover:text-primary transition-all active:scale-90 cursor-pointer"
                    >
                      <ChevronDown className="h-4.5 w-4.5 stroke-[2.5]" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery("");
                      }}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-all active:scale-90 cursor-pointer ml-1"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ) : (
                  <Search className="h-4 w-4 mr-3 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden py-4 bg-accent/5"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(0,0,0,0.02) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
        onScroll={handleScroll}
      >
        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center py-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadMore}
              className="text-xs h-7"
            >
              <ChevronUp className="h-3 w-3 mr-1" />
              Load earlier messages
            </Button>
          </div>
        )}

        {loading && messages.length === 0 ? (
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
              <p className="font-semibold text-sm">
                Welcome to #{channel.name}!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {channel.description ||
                  "This is the beginning of this channel."}
              </p>
            </div>
          </div>
        ) : (
          <div className="pb-2">
            {withDividers.map((item, i) => {
              if ("type" in item && item.type === "divider") {
                return (
                  <DateDivider
                    key={`divider-${item.date}`}
                    timestamp={item.date}
                  />
                );
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
                  isPinned={msg.is_pinned === 1}
                  canModerateAll={isPower}
                  onReply={(m) => {
                    setReplyingTo(m);
                  }}
                  onEdit={editMessage}
                  onDelete={deleteMessage}
                  onReact={toggleReaction}
                  onPin={togglePin}
                  onPollVote={togglePollVote}
                  onEditPoll={editPoll}
                  highlightTerm={searchQuery}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Typing indicator */}
      <div className="h-6 px-6 mb-1">
        <AnimatePresence>
          {typingUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <div className="flex gap-1">
                <span className="h-1 w-1 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1 w-1 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1 w-1 bg-muted-foreground/50 rounded-full animate-bounce" />
              </div>
              <span className="text-[11px] italic font-medium">
                {typingUsers.length <= 3
                  ? `${typingUsers.map((u) => u.userName).join(", ")} ${typingUsers.length === 1 ? "is" : "are"} typing...`
                  : "Several people are typing..."}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <MessageComposer
        channelName={channel.name}
        projectId={projectId}
        replyingTo={replyingTo}
        onClearReply={() => setReplyingTo(null)}
        onSend={handleSend}
        onTyping={setTypingStatus}
        disabled={!canSend}
        isAnnouncement={isAnnouncement}
        currentUserId={currentUserId}
        projectSlug={projectSlug}
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
              size="icon"
              className="shadow-xl h-10 w-10 rounded-full bg-background/80 backdrop-blur-xl border border-border/50 hover:bg-accent/80 hover:border-border/80 hover:text-foreground text-muted-foreground transition-all pointer-events-auto active:scale-95 group flex items-center justify-center"
              onClick={() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                setAtBottom(true);
              }}
              aria-label="Jump to bottom"
            >
              <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-0.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
