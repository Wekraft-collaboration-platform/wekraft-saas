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
            key={`match-${i}`} 
            id={messageId ? `search-match-${messageId}` : undefined}
            className="bg-yellow-400/40 dark:bg-yellow-500/40 text-foreground rounded-sm px-0.5 ring-1 ring-yellow-500/20 scroll-mt-20"
          >
            {part}
          </span>
        ) : (
          <span key={`text-${i}`}>{part}</span>
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
          "group flex w-full gap-2 px-4 py-0.5 transition-colors relative overflow-visible",
          isOwn ? "flex-row-reverse justify-start pl-16 pr-4" : "flex-row justify-start pr-16",
          isGrouped ? "mt-0" : "mt-4",
          isPinned && "border-l-2 border-l-blue-500 rounded-l-none"
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Avatar / Spacer (Only for others) */}
        {!isOwn && (
          <div className="w-9 shrink-0 mt-0.5">
            {!isGrouped ? (
              <Avatar className="h-9 w-9 cursor-pointer hover:opacity-90 transition-opacity shadow-sm">
                <AvatarImage src={message.user_image ?? undefined} />
                <AvatarFallback className="text-xs bg-muted border">
                  {message.user_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-9" />
            )}
          </div>
        )}

        {/* Message Container (Bubble + Info) */}
        <div className={cn(
          "flex flex-col max-w-[85%] md:max-w-[65%] relative",
          isOwn ? "items-end" : "items-start"
        )}>
          {/* Header (Only for others, not grouped) */}
          {!isOwn && !isGrouped && (
            <div className="flex items-baseline gap-2 mb-1 px-1">
              <span className="font-semibold text-xs text-blue-500 hover:underline cursor-pointer leading-tight">
                {message.user_name}
              </span>
            </div>
          )}

          {/* The Bubble */}
          <div className={cn(
            "relative px-3 py-1.5 transition-all duration-200 border backdrop-blur-[2px] min-w-[70px]",
            isOwn 
              ? cn(
                  "bg-primary/[0.03] border-primary/[0.08]", 
                  isGrouped ? "rounded-2xl" : "rounded-2xl rounded-tr-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                ) 
              : cn(
                  "bg-muted/[0.05] border-border/40", 
                  isGrouped ? "rounded-2xl" : "rounded-2xl rounded-tl-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                )
          )}>
            {/* WhatsApp-style tail for first message in group */}
            {!isGrouped && (
              isOwn ? (
                // Tail on top-right for own messages
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: -8,
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderWidth: "0 0 10px 9px",
                    borderColor: "transparent transparent transparent var(--bubble-own-bg, rgba(var(--primary-rgb,99,102,241),0.06))",
                    filter: "drop-shadow(1px 0px 0px rgba(var(--primary-rgb,99,102,241),0.08))",
                  }}
                />
              ) : (
                // Tail on top-left for others' messages
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: -8,
                    width: 0,
                    height: 0,
                    borderStyle: "solid",
                    borderWidth: "0 9px 10px 0",
                    borderColor: "transparent rgba(var(--muted-rgb,120,120,120),0.07) transparent transparent",
                    filter: "drop-shadow(-1px 0px 0px rgba(0,0,0,0.06))",
                  }}
                />
              )
            )}
            {/* More Actions Chevron (Inside Bubble) */}
            {hovered && !editing && (
              <div className="absolute top-1 right-1 z-30 animate-in fade-in zoom-in duration-150">
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground/60" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl">
                    <DropdownMenuItem onClick={() => onReply(message)} className="rounded-lg">
                      <Reply className="h-4 w-4 mr-2 text-muted-foreground" />
                      Reply
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopy} className="rounded-lg">
                      <Copy className="h-4 w-4 mr-2 text-muted-foreground" />
                      Copy Text
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onPin(message.id, !isPinned)} className="rounded-lg">
                      <Pin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {isPinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    {isOwn && (
                      <DropdownMenuItem onClick={() => setEditing(true)} className="rounded-lg">
                        <Pencil className="h-4 w-4 mr-2 text-muted-foreground" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            {/* Quoted reply block */}
            {message.thread_parent_id && (message.parent_content || message.parent_user_name) && (
              <div className={cn(
                "mb-1 rounded p-1.5 text-[12px] flex flex-col gap-0 shadow-sm select-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                isOwn ? "bg-black/10" : "bg-accent/40"
              )}>
                <div className={cn("font-semibold text-[10px] leading-tight", isOwn ? "text-primary" : "text-blue-500")}>
                  {message.parent_user_name ?? "Unknown"}
                </div>
                <div className="text-muted-foreground/80 line-clamp-2 leading-snug overflow-hidden text-ellipsis">
                  {message.parent_content ?? "Message not found"}
                </div>
              </div>
            )}

            {/* Message content / edit box */}
            {editing ? (
              <div className="min-w-[200px]">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-[14px] min-h-[60px] resize-none bg-transparent border-none focus-visible:ring-0 p-0 text-inherit"
                  autoFocus
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Button size="sm" className="h-6 text-[10px] px-2" onClick={handleSaveEdit} disabled={saving}>
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-2 text-inherit hover:bg-black/10"
                    onClick={() => { setEditContent(message.content); setEditing(false); }}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="text-[14px] leading-snug break-all md:break-words whitespace-pre-wrap pr-1 text-foreground/80 font-normal">
                  <Highlight text={message.content} term={highlightTerm} messageId={message.id} />
                  {message.edited_at && (
                    <span className="text-[8px] ml-1.5 select-none opacity-40 italic">
                      (edited)
                    </span>
                  )}
                </p>
                <div className="flex items-center self-end gap-1 mt-0.5 ml-4">
                  <span className="text-[9px] select-none text-muted-foreground/40 font-medium uppercase">
                    {format(new Date(message.created_at), "h:mm a")}
                  </span>
                  {isOwn && (
                    <div className="flex items-center text-blue-500/60">
                      <Check className="h-2.5 w-2.5 -mr-1" />
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Link Preview */}
            {message.link_preview && <LinkPreview preview={message.link_preview} />}
          </div>

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className={cn("flex flex-wrap gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
              {message.reactions.map((r) => {
                const hasReacted = r.userIds.includes(currentUserId);
                return (
                  <button
                    key={r.emoji}
                    onClick={() => onReact(message.id, r.emoji, hasReacted)}
                    className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-all active:scale-95",
                      hasReacted
                        ? "bg-blue-500/15 border-blue-500/50 text-blue-500 font-semibold"
                        : "bg-background border-border hover:bg-accent text-muted-foreground"
                    )}
                  >
                    <span>{r.emoji}</span>
                    <span className="tabular-nums">{r.userIds.length}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Reaction Tool (appears on hover outside bubble) ── */}
          {showToolbar && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 flex items-center",
              isOwn ? "right-full mr-2" : "left-full ml-2"
            )}>
              <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground/40 hover:text-muted-foreground">
                    <SmilePlus className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2 rounded-2xl shadow-xl" side="top" align="center">
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
                            "text-xl p-1.5 rounded-xl transition-all hover:scale-125 active:scale-90",
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
            </div>
          )}
        </div>
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
