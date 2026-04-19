"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SmilePlus, Send, X } from "lucide-react";
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
}

export function MessageComposer({ channelName, replyingTo, onClearReply, onSend, disabled }: Props) {
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

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
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
          "flex items-end gap-2 rounded-lg border bg-input px-3 py-2 focus-within:ring-1 focus-within:ring-ring transition-shadow",
          disabled && "opacity-50 pointer-events-none"
        )}
      >
        {/* Emoji picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground mb-0.5"
            >
              <SmilePlus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-64 p-3">
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

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          className="flex-1 border-0 shadow-none focus-visible:ring-0 resize-none bg-transparent min-h-[36px] max-h-[200px] py-1.5 text-sm"
          rows={1}
          style={{ height: "auto" }}
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
          }}
        />

        {/* Send button */}
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={!content.trim() || sending}
          className={cn(
            "h-7 w-7 shrink-0 mb-0.5 transition-all",
            content.trim() ? "opacity-100" : "opacity-40"
          )}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground mt-1 px-1">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
