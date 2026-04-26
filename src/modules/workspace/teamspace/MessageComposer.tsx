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
import { SmilePlus, Plus, X, SendHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Message } from "./hooks/useMessages";

const EMOJI_GROUPS = [
  { label: "React", emojis: ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥"] },
  { label: "Work", emojis: ["✅", "❌", "⚠️", "💡", "🚀", "🐛", "📌", "💪"] },
  { label: "Symbols", emojis: ["👀", "🤔", "💯", "🔗", "📝", "🎯", "⚡", "🌟"] },
];

interface Props {
  channelName: string;
  replyingTo?: Message | null;
  onClearReply?: () => void;
  onSend: (content: string) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  isAnnouncement?: boolean;
}

export function MessageComposer({ channelName, replyingTo, onClearReply, onSend, onTyping, disabled, isAnnouncement }: Props) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
            Replying to <strong className="text-foreground">{replyingTo.user_name}</strong>:{" "}
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
        {/* Plus attachment icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            disabled={disabled}
            className="h-6 w-6 rounded-full bg-muted-foreground/30 flex items-center justify-center shrink-0 hover:bg-muted-foreground/50 transition-colors disabled:opacity-50"
          >
            <Plus className="h-4 w-4 text-foreground/80" />
          </motion.button>

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

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            onTyping?.(e.target.value.length > 0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 border-0 shadow-none focus-visible:ring-0 resize-none bg-transparent min-h-[24px] py-1 text-[15px] placeholder:text-muted-foreground/60 leading-normal scrollbar-hide disabled:cursor-not-allowed transition-[height] duration-200 ease-out"
          rows={1}
          style={{ height: "auto" }}
        />

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
    </div>
  );
}
