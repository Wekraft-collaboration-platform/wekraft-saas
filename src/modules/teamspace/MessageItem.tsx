"use client";

import { useState, useRef, useCallback } from "react";
import { Message, Reaction } from "./hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SmilePlus,
  MoreHorizontal,
  Reply,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, isToday, isYesterday } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "✅", "👀", "💪"];

function formatTime(ts: number) {
  const d = new Date(ts);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return `Yesterday ${format(d, "h:mm a")}`;
  return format(d, "MMM d, h:mm a");
}

interface Props {
  message: Message;
  isGrouped: boolean; // true = same author as previous message (compact display)
  currentUserId: string;
  onReply: (message: Message) => void;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onReact: (messageId: string, emoji: string, hasReacted: boolean) => Promise<void>;
}

export function MessageItem({
  message,
  isGrouped,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [saving, setSaving] = useState(false);
  const isOwn = message.user_id === currentUserId;

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent === message.content) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onEdit(message.id, editContent);
    setSaving(false);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === "Escape") {
      setEditContent(message.content);
      setEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "group flex gap-3 px-4 py-0.5 hover:bg-accent/30 rounded-md transition-colors relative",
        isGrouped ? "mt-0" : "mt-3"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar / Spacer */}
      <div className="w-8 shrink-0 mt-0.5">
        {!isGrouped ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.user_image ?? undefined} />
            <AvatarFallback className="text-xs">
              {message.user_name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <span className="opacity-0 group-hover:opacity-60 text-[10px] text-muted-foreground select-none leading-none pt-1 block text-right">
            {format(new Date(message.created_at), "h:mm")}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header (only when not grouped) */}
        {!isGrouped && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-semibold leading-none">{message.user_name}</span>
            <span className="text-[10px] text-muted-foreground">{formatTime(message.created_at)}</span>
          </div>
        )}

        {/* Message content / edit box */}
        {editing ? (
          <div className="mt-1">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm min-h-[60px] resize-none"
              autoFocus
            />
            <div className="flex items-center gap-1.5 mt-1.5">
              <Button size="sm" className="h-7 text-xs" onClick={handleSaveEdit} disabled={saving}>
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => { setEditContent(message.content); setEditing(false); }}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <span className="text-[10px] text-muted-foreground ml-1">esc to cancel • enter to save</span>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
            {message.edited_at && (
              <span className="text-[10px] text-muted-foreground ml-1">(edited)</span>
            )}
          </p>
        )}

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {message.reactions.map((r) => {
              const hasReacted = r.userIds.includes(currentUserId);
              return (
                <button
                  key={r.emoji}
                  onClick={() => onReact(message.id, r.emoji, hasReacted)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                    hasReacted
                      ? "bg-blue-600/20 border-blue-600/40 text-foreground"
                      : "bg-accent/50 border-border hover:bg-accent"
                  )}
                >
                  {r.emoji}
                  <span className="font-medium">{r.userIds.length}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Thread reply count */}
        {(message.reply_count ?? 0) > 0 && (
          <button
            onClick={() => onReply(message)}
            className="mt-1 flex items-center gap-1 text-xs text-blue-500 hover:underline"
          >
            <Reply className="h-3 w-3" />
            {message.reply_count} {message.reply_count === 1 ? "reply" : "replies"}
          </button>
        )}
      </div>

      {/* Action toolbar (appears on hover) */}
      {hovered && !editing && (
        <div className="absolute right-3 top-0 -translate-y-1/2 flex items-center gap-0.5 bg-popover border rounded-md shadow-md p-0.5 z-10">
          {/* Quick emoji */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="icon" variant="ghost" className="h-6 w-6">
                <SmilePlus className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" side="top">
              <div className="flex gap-1">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      const hasReacted = message.reactions
                        .find((r) => r.emoji === emoji)
                        ?.userIds.includes(currentUserId) ?? false;
                      onReact(message.id, emoji, hasReacted);
                    }}
                    className="text-lg hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Reply */}
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => onReply(message)}
          >
            <Reply className="h-3.5 w-3.5" />
          </Button>

          {/* More (own messages) */}
          {isOwn && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(message.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}
