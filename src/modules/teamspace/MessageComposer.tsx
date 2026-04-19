"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SmilePlus, Plus, Gift, FileImage, Sticker, X } from "lucide-react";
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
  disabled?: boolean;
  isAnnouncement?: boolean;
}

export function MessageComposer({ channelName, replyingTo, onClearReply, onSend, disabled, isAnnouncement }: Props) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
          <button onClick={onClearReply} className="hover:text-foreground transition-colors shrink-0">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input row */}
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg bg-accent/40 px-4 py-2 transition-all duration-200",
          disabled && "opacity-70 bg-secondary/30"
        )}
      >
        {/* Plus attachment icon */}
        <button
          type="button"
          disabled={disabled}
          className="h-6 w-6 rounded-full bg-muted-foreground/30 flex items-center justify-center shrink-0 hover:bg-muted-foreground/50 transition-colors disabled:opacity-50"
        >
          <Plus className="h-4 w-4 text-foreground/80" />
        </button>

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 border-0 shadow-none focus-visible:ring-0 resize-none bg-transparent min-h-[24px] max-h-[50vh] py-1 text-[15px] placeholder:text-muted-foreground/60 leading-normal scrollbar-hide disabled:cursor-not-allowed"
          rows={1}
          style={{ height: "auto" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, window.innerHeight * 0.5)}px`;
          }}
        />

        {/* Right utility icons */}
        <div className="flex items-center gap-2.5 shrink-0 pr-1">
          <button disabled={disabled} className="text-muted-foreground/80 hover:text-foreground transition-colors disabled:opacity-50">
            <Gift className="h-[18px] w-[18px]" />
          </button>
          <button disabled={disabled} className="text-muted-foreground/80 hover:text-foreground transition-colors disabled:opacity-50">
            <FileImage className="h-[18px] w-[18px]" />
          </button>
          <button disabled={disabled} className="text-muted-foreground/80 hover:text-foreground transition-colors disabled:opacity-50">
            <Sticker className="h-[18px] w-[18px]" />
          </button>
          
          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button disabled={disabled} className="text-muted-foreground/80 hover:text-foreground transition-colors disabled:opacity-50">
                <SmilePlus className="h-[18px] w-[18px]" />
              </button>
            </PopoverTrigger>
            <PopoverContent side="top" align="end" className="w-64 p-3 mb-2">
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
      </div>
    </div>
  );
}
