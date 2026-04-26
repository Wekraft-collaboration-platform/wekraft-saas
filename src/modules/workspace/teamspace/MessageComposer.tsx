/**
 * MessageComposer.tsx
 * 
 * Rich text input component for sending messages in a channel or thread.
 * 
 * Features:
 * - Auto-expanding textarea for multi-line messages.
 * - Supports keyboard shortcuts (Enter to send, Shift+Enter for new line).
 * - Displays reply context when replying to a specific message.
 * - Integrated emoji picker and quick attachment placeholders.
 * - Permission-aware (disables input for announcement channels if not owner).
 * 
 * Integration:
 * - Triggers `onSend` callback with the message content.
 */
"use client";

import { useState, useRef, useCallback, KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SmilePlus, Plus, X, SendHorizontal, BarChart2, Code, AtSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getUserColor } from "./lib/utils";
import { Message } from "./hooks/useMessages";
import { CreatePollDialog } from "./CreatePollDialog";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EMOJI_GROUPS = [
  { label: "React", emojis: ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥"] },
  { label: "Work", emojis: ["✅", "❌", "⚠️", "💡", "🚀", "🐛", "📌", "💪"] },
  { label: "Symbols", emojis: ["👀", "🤔", "💯", "🔗", "📝", "🎯", "⚡", "🌟"] },
];

interface Props {
  channelName: string;
  projectId: string;
  replyingTo?: Message | null;
  onClearReply?: () => void;
  onSend: (content: string, poll?: any) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  isAnnouncement?: boolean;
}

export function MessageComposer({ channelName, projectId, replyingTo, onClearReply, onSend, onTyping, disabled, isAnnouncement }: Props) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention state
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);

  // Fetch project members for mentions
  const members = useQuery(api.project.getProjectMembers, {
    projectId: projectId as Id<"projects">,
  });

  const filteredMembers = members?.filter((m) =>
    m.userName?.toLowerCase().includes(mentionQuery.toLowerCase()),
  ) || [];
  
  // Auto-resize logic
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      const newHeight = Math.min(el.scrollHeight, 100); // Max height 100px
      el.style.height = `${newHeight}px`;
      el.style.overflowY = el.scrollHeight > 100 ? "auto" : "hidden";
    }
  }, [content]);

  // Auto-focus when replying
  useEffect(() => {
    if (replyingTo) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
    }
  }, [replyingTo]);

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setContent("");
      textareaRef.current?.focus();
    } finally {
      setSending(false);
    }
  }, [content, onSend, sending]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setMentionIndex((prev) => (prev + 1) % filteredMembers.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setMentionIndex(
          (prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(filteredMembers[mentionIndex].userName || "unknown");
        return;
      }
      if (e.key === "Escape") {
        setShowMentions(false);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertMention = (name: string) => {
    if (mentionStartIndex === -1) return;
    
    const before = content.substring(0, mentionStartIndex);
    const after = content.substring(textareaRef.current?.selectionStart || content.length);
    const newContent = `${before}@${name} ${after}`;
    
    setContent(newContent);
    setShowMentions(false);
    setMentionStartIndex(-1);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPos = (before + "@" + name + " ").length;
        textareaRef.current.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const placeholder = disabled && isAnnouncement
    ? "Only project owners can send messages in this channel"
    : `Message #${channelName}`;

  return (
    <div className="px-4 pb-6 pt-0 shrink-0">
      {/* Reply context banner */}
      {replyingTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-md bg-accent/50 border text-xs text-muted-foreground">
          <span className="truncate flex-1">
            Replying to <strong style={{ color: getUserColor(replyingTo.user_name) }}>{replyingTo.user_name}</strong>:{" "}
            <span className="opacity-70">{replyingTo.content.slice(0, 60)}{replyingTo.content.length > 60 ? "…" : ""}</span>
          </span>
          <button onClick={onClearReply} className="hover:text-foreground transition-colors shrink-0 cursor-pointer p-0.5 rounded-sm hover:bg-foreground/10">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input row */}
      <motion.div
        layout
        transition={{
          layout: { duration: 0.2, ease: "easeOut" }
        }}
        className={cn(
          "flex items-center gap-2 rounded-lg bg-accent/40 px-4 py-2 transition-all duration-200",
          disabled && "opacity-70 bg-secondary/30"
        )}
      >
        {/* Attachment menu */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                disabled={disabled}
                className="h-6 w-6 rounded-full bg-muted-foreground/30 flex items-center justify-center shrink-0 hover:bg-muted-foreground/50 transition-colors disabled:opacity-50"
              >
                <Plus className="h-4 w-4 text-foreground/80" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              align="start" 
              className="w-auto p-4 mb-2 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl rounded-2xl"
            >
              <div className="flex gap-6">
                {[
                  { label: "Codebase", icon: Code, color: "bg-foreground text-background" },
                  { label: "Poll", icon: BarChart2, color: "bg-foreground text-background" },
                ].map((item) => (
                  <button 
                    key={item.label}
                    className="flex flex-col items-center gap-1.5 group outline-none"
                    onClick={() => {
                      if (item.label === "Poll") {
                        setIsPollDialogOpen(true);
                      } else {
                        console.log("Clicked", item.label);
                      }
                    }}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-110 group-active:scale-95",
                      item.color
                    )}>
                      <item.icon className="h-[18px] w-[18px]" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={disabled} 
                className="h-6 w-6 flex items-center justify-center text-muted-foreground/80 hover:text-foreground transition-colors disabled:opacity-50"
              >
                <SmilePlus className="h-5 w-5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-64 p-3 mb-2 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl rounded-xl">
              {EMOJI_GROUPS.map((group) => (
                <div key={group.label} className="mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-8 gap-0.5">
                    {group.emojis.map((e) => (
                      <button
                        key={e}
                        onClick={() => insertEmoji(e)}
                        className="text-lg p-0.5 rounded hover:bg-accent hover:scale-110 transition-all"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {/* Text input — wrapper is `relative` so the mention dropdown anchors here */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              const val = e.target.value;
              setContent(val);
              onTyping?.(val.length > 0);

              const cursorPosition = e.target.selectionStart ?? 0;
              const textBeforeCursor = val.substring(0, cursorPosition);

              // Find the last "@" before the cursor
              const lastAtIndex = textBeforeCursor.lastIndexOf("@");

              if (lastAtIndex !== -1) {
                const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
                // Char immediately before @ (undefined when @ is first char)
                const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : undefined;

                // Trigger if @ is at the start OR preceded by whitespace, and no space typed yet
                const validStart =
                  charBeforeAt === undefined ||
                  charBeforeAt === " " ||
                  charBeforeAt === "\n";

                if (validStart && !textAfterAt.includes(" ")) {
                  setMentionQuery(textAfterAt);
                  setShowMentions(true);
                  setMentionIndex(0);
                  setMentionStartIndex(lastAtIndex);
                } else {
                  setShowMentions(false);
                  setMentionStartIndex(-1);
                }
              } else {
                setShowMentions(false);
                setMentionStartIndex(-1);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "@ to mention,  / for workflows"}
            disabled={disabled}
            className="w-full border-0 shadow-none focus-visible:ring-0 resize-none bg-transparent min-h-[24px] py-1 text-[15px] placeholder:text-muted-foreground/60 leading-normal scrollbar-hide disabled:cursor-not-allowed transition-[height] duration-200 ease-out"
            rows={1}
            style={{ height: "auto" }}
          />

          {/* Mentions Dropdown — anchored relative to the textarea wrapper */}
          <AnimatePresence>
            {showMentions && filteredMembers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute bottom-[calc(100%+8px)] left-0 w-64 bg-popover border border-border/50 shadow-2xl rounded-xl overflow-hidden z-[200]"
              >
                <div className="px-3 py-2 border-b border-border/40 bg-muted/50 flex items-center gap-2">
                  <AtSign className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Mention someone
                  </span>
                </div>
                <ScrollArea className="max-h-[220px]">
                  <div className="py-1">
                    {filteredMembers.map((member, i) => (
                      <button
                        key={member._id}
                        onClick={() => insertMention(member.userName || "")}
                        onMouseEnter={() => setMentionIndex(i)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                          i === mentionIndex
                            ? "bg-primary/15"
                            : "hover:bg-accent/60"
                        )}
                      >
                        <Avatar className="h-8 w-8 border border-border/40 shrink-0">
                          <AvatarImage src={member.userImage ?? undefined} />
                          <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-bold">
                            {(member.userName || "??").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span
                            className="text-[13px] font-semibold truncate leading-tight"
                            style={{ color: getUserColor(member.userName || "") }}
                          >
                            {member.userName}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate">
                            {member.AccessRole || "Member"}
                          </span>
                        </div>
                        {i === mentionIndex && (
                          <span className="ml-auto text-[9px] text-muted-foreground/60 shrink-0">
                            ↵
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>



        {/* Send button */}
        <div className="flex items-center shrink-0 pr-1">
          <motion.button 
            whileHover={content.trim() ? { scale: 1.1 } : {}}
            whileTap={content.trim() ? { scale: 0.9 } : {}}
            onClick={handleSend}
            disabled={disabled || sending || !content.trim()} 
            className={cn(
              "p-1.5 rounded-md transition-all duration-200",
              content.trim() 
                ? "text-primary hover:bg-primary/10" 
                : "text-muted-foreground/40 cursor-not-allowed"
            )}
          >
            <SendHorizontal className="h-5 w-5" />
          </motion.button>
        </div>
      </motion.div>

      <CreatePollDialog 
        open={isPollDialogOpen} 
        onOpenChange={setIsPollDialogOpen} 
        onSendPoll={async (poll) => {
          await onSend("", poll);
        }}
      />
    </div>
  );
}
