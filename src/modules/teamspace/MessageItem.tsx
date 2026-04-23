/**
 * MessageItem.tsx
 * 
 * Component for rendering individual messages in a feed or thread.
 * 
 * Features:
 * - Displays user info, content, and timestamp.
 * - Supports message grouping (collapsed view for consecutive messages from the same user).
 * - Real-time reactions (add/remove).
 * - Inline message editing and deletion.
 * - Quoted reply blocks for context.
 * - Pinned message indicators.
 * - Interaction toolbar for quick actions (React, Reply, Edit, Pin, Delete, Copy).
 * 
 * Integration:
 * - Communicates actions back to parent components via callbacks (`onReact`, `onReply`, etc.).
 */
"use client";

import { useState } from "react";
import { LinkPreview } from "./LinkPreview";
import { Message } from "./hooks/useMessages";
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
  Copy,
  Pin,
  PinOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format, isToday, isYesterday } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "✅", "👀", "💪"];

function formatTime(ts: number) {
  const d = new Date(ts);
  if (isToday(d)) return format(d, "h:mm a");
  if (isYesterday(d)) return `Yesterday ${format(d, "h:mm a")}`;
  return format(d, "MMM d, h:mm a");
}

function Highlight({ text, term, messageId }: { text: string; term?: string; messageId?: string }) {
  if (!term || !term.trim()) return <>{text}</>;
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span 
            key={i} 
            id={messageId ? `search-match-${messageId}` : undefined}
            className="bg-yellow-400/40 dark:bg-yellow-500/40 text-foreground rounded-sm px-0.5 ring-1 ring-yellow-500/20 scroll-mt-20"
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

interface Props {
  message: Message;
  isGrouped: boolean;
  currentUserId: string;
  isPinned?: boolean;
  canModerateAll?: boolean; // admin / owner — can delete anyone's message
  onReply: (message: Message) => void;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onReact: (messageId: string, emoji: string, hasReacted: boolean) => Promise<void>;
  onPin: (messageId: string, pinned: boolean) => void;
  highlightTerm?: string;
}

export function MessageItem({
  message,
  isGrouped,
  currentUserId,
  isPinned = false,
  canModerateAll = false,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  highlightTerm,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Keep toolbar visible while any floating menu is open
  const showToolbar = (hovered || dropdownOpen || emojiOpen) && !editing;
  const isOwn = message.user_id === currentUserId;
  // Can delete = own message OR admin/owner moderating
  const canDelete = isOwn || canModerateAll;

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

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      toast.success("Copied to clipboard", {
        description: message.content.length > 60
          ? message.content.slice(0, 60) + "…"
          : undefined,
        duration: 2000,
      });
    });
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    await onDelete(message.id);
    setDeleting(false);
    setDeleteDialogOpen(false);
  };

  return (
    <>
      {/* ── Pinned banner ─────────────────────────────────── */}
      {isPinned && (
        <div className="flex items-center gap-1.5 mx-4 mb-0.5 mt-1 text-[10px] text-blue-500/80 font-bold select-none uppercase tracking-wider">
          <Pin className="h-2.5 w-2.5" />
          pinned
        </div>
      )}

      <div
        id={`message-${message.id}`}
        className={cn(
          "group flex gap-3 px-4 py-0.5 hover:bg-accent/30 rounded-md transition-colors relative",
          isGrouped ? "mt-0" : "mt-3",
          isPinned && "border-l-2 border-l-blue-500 rounded-l-none"
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Avatar / Spacer */}
        <div className="w-10 shrink-0 mt-0.5">
          {!isGrouped ? (
            <Avatar className="h-10 w-10 cursor-pointer hover:opacity-90 transition-opacity">
              <AvatarImage src={message.user_image ?? undefined} />
              <AvatarFallback className="text-sm">
                {message.user_name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <span className="opacity-0 group-hover:opacity-100 text-[11px] text-muted-foreground select-none pt-1.5 block text-center w-full">
              {format(new Date(message.created_at), "h:mm")}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          {!isGrouped && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-[15px] hover:underline cursor-pointer leading-tight">
                {message.user_name}
              </span>
              <span className="text-[11px] text-muted-foreground">{formatTime(message.created_at)}</span>
            </div>
          )}

          {/* Quoted reply block */}
          {message.thread_parent_id && (message.parent_content || message.parent_user_name) && (
            <div className="mb-1 rounded p-2 bg-accent/20 border-l-4 border-l-blue-500/80 text-xs flex items-center gap-1.5 w-max max-w-full">
              {message.parent_user_image && (
                <img src={message.parent_user_image} alt="" className="w-4 h-4 rounded-full object-cover shrink-0" />
              )}
              <div className="font-semibold opacity-80 shrink-0">@{message.parent_user_name ?? "Unknown"}</div>
              <div className="text-muted-foreground truncate max-w-[300px]">
                {message.parent_content ?? "Message not found"}
              </div>
            </div>
          )}

          {/* Message content / edit box */}
          {editing ? (
            <div className="mt-1">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-[15px] min-h-[60px] resize-none"
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
            <p className="text-[15px] leading-[1.375rem] text-foreground/90 break-words whitespace-pre-wrap">
              <Highlight text={message.content} term={highlightTerm} messageId={message.id} />
              {message.edited_at && (
                <span className="text-[10px] text-muted-foreground ml-1.5 select-none">(edited)</span>
              )}
            </p>
          )}

          {/* Link Preview */}
          {message.link_preview && <LinkPreview preview={message.link_preview} />}

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
                      "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all active:scale-95",
                      hasReacted
                        ? "bg-blue-500/15 border-blue-500/50 text-blue-500 font-semibold shadow-sm shadow-blue-500/10"
                        : "bg-accent/50 border-border hover:bg-accent/80 hover:border-border/80 text-muted-foreground"
                    )}
                    title={r.userIds.length > 0 ? `${r.userIds.length} reaction${r.userIds.length > 1 ? "s" : ""}` : undefined}
                  >
                    <span className={cn(hasReacted ? "scale-110" : "scale-100", "transition-transform")}>
                      {r.emoji}
                    </span>
                    <span className="tabular-nums">{r.userIds.length}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Action toolbar (appears on hover) ────────────── */}
        {showToolbar && (
          <div className="absolute right-3 top-0 -translate-y-1/2 flex items-center gap-0.5 bg-popover border rounded-md shadow-md p-0.5 z-10">
            {/* Quick emoji */}
            <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
              <PopoverTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <SmilePlus className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="top" align="center">
                <div className="flex gap-1">
                  {QUICK_EMOJIS.map((emoji) => {
                    const hasReacted = message.reactions
                      .find((r) => r.emoji === emoji)
                      ?.userIds.includes(currentUserId) ?? false;
                    return (
                      <button
                        key={emoji}
                        onClick={() => onReact(message.id, emoji, hasReacted)}
                        className={cn(
                          "text-lg p-1.5 rounded-md transition-all hover:scale-125 active:scale-90",
                          hasReacted 
                            ? "bg-blue-500/20 ring-1 ring-blue-500/30" 
                            : "hover:bg-accent"
                        )}
                      >
                        {emoji}
                      </button>
                    );
                  })}
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

            {/* ── 3-dot More Actions dropdown ─────────────── */}
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">

                {/* Copy */}
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  Copy Text
                </DropdownMenuItem>

                {/* Pin / Unpin — available to all */}
                <DropdownMenuItem onClick={() => onPin(message.id, !isPinned)}>
                  {isPinned ? (
                    <>
                      <PinOff className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      Unpin Message
                    </>
                  ) : (
                    <>
                      <Pin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      Pin Message
                    </>
                  )}
                </DropdownMenuItem>

                {/* Owner-only actions */}
                {isOwn && (
                  <>
                    <DropdownMenuSeparator />

                    {/* Edit — only own messages */}
                    <DropdownMenuItem onClick={() => setEditing(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      Edit Message
                    </DropdownMenuItem>
                  </>
                )}

                {/* Delete — own message OR admin/owner moderating others */}
                {canDelete && (
                  <>
                    {/* Separator only if edit section wasn't shown (i.e. moderating someone else's msg) */}
                    {!isOwn && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      {isOwn ? "Delete Message" : "Delete for Everyone"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Dialog ──────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The message will be permanently removed from the channel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
