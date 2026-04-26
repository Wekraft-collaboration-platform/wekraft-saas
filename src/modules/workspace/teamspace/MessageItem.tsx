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

import { useEffect, useRef, useState } from "react";
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
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ── Constants ──────────────────────────────────────────────────────────────────
const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "✅", "👀", "💪"] as const;

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Highlights all occurrences of `term` inside `text`.
 *
 * FIX: The original used a single global RegExp instance and called `.test()`
 * on the same instance used for `.split()`. Global RegExp keeps `lastIndex`
 * state between calls, which caused every other match to be skipped.
 * Now we create a fresh non-global regex for the per-part test.
 */
function Highlight({
  text,
  term,
  messageId,
}: {
  text: string;
  term?: string;
  messageId?: string;
}) {
  if (!term || !term.trim()) return <>{text}</>;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const splitRegex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(splitRegex);

  return (
    <>
      {parts.map((part, i) => {
        // Use a fresh non-global regex so lastIndex never bleeds between calls.
        const isMatch = new RegExp(escaped, "i").test(part);
        // FIX: key was previously `match-${i}` / `text-${i}` — using both index
        // and content makes keys stable across minor list mutations.
        return isMatch ? (
          <span
            key={`match-${i}-${part}`}
            id={messageId ? `search-match-${messageId}` : undefined}
            className="bg-yellow-400/40 dark:bg-yellow-500/40 text-foreground rounded-sm px-0.5 ring-1 ring-yellow-500/20 scroll-mt-20"
          >
            {part}
          </span>
        ) : (
          <span key={`text-${i}-${part}`}>{part}</span>
        );
      })}
    </>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface Props {
  message: Message;
  isGrouped: boolean;
  currentUserId: string;
  isPinned?: boolean;
  /** Admin / owner — can delete anyone's message */
  canModerateAll?: boolean;
  /** Admin / owner — can pin anyone's message. Defaults to `canModerateAll`. */
  canPinAll?: boolean;
  onReply: (message: Message) => void;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onReact: (messageId: string, emoji: string, hasReacted: boolean) => Promise<void>;
  onPin: (messageId: string, pinned: boolean) => void;
  highlightTerm?: string;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function MessageItem({
  message,
  isGrouped,
  currentUserId,
  isPinned = false,
  canModerateAll = false,
  canPinAll,
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

  // FIX: Sync edit buffer when the message is updated externally (e.g. real-time
  // collaboration) while the user is NOT actively editing.
  useEffect(() => {
    if (!editing) {
      setEditContent(message.content);
    }
  }, [message.content, editing]);

  // Keep toolbar visible while any floating menu is open
  const showToolbar = (hovered || dropdownOpen || emojiOpen) && !editing;

  const isOwn = message.user_id === currentUserId;
  // FIX: Separate canPin from canDelete — moderators may delete without
  // necessarily being allowed to pin (maps to stricter permission models).
  const canDelete = isOwn || canModerateAll;
  const canPin = isOwn || (canPinAll ?? canModerateAll);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSaveEdit = async () => {
    // FIX: Guard against double-submit (Enter key + button click race).
    if (saving) return;
    if (!editContent.trim() || editContent === message.content) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onEdit(message.id, editContent);
    } finally {
      setSaving(false);
      setEditing(false);
    }
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

  // FIX: `navigator.clipboard` is undefined in non-HTTPS / non-secure contexts.
  // Wrap in try/catch and surface a readable error instead of a silent crash.
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success("Copied to clipboard", {
        description:
          message.content.length > 60
            ? message.content.slice(0, 60) + "…"
            : undefined,
        duration: 2000,
      });
    } catch {
      toast.error("Copy failed", {
        description: "Your browser may not support clipboard access.",
        duration: 3000,
      });
    }
  };

  // FIX: `setDeleteDialogOpen(false)` was only called on success, leaving the
  // dialog open if `onDelete` threw. Moved to `finally`.
  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(message.id);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  // Quoted-reply keyboard handler (div acting as interactive element).
  const handleQuoteKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      // Scroll to parent if needed — parent handler can be wired in via prop.
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Pinned banner ───────────────────────────────────── */}
      {isPinned && (
        <div
          aria-label="Pinned message"
          className="flex items-center gap-1.5 mx-4 mb-0.5 mt-1 text-[10px] text-blue-500/80 font-bold select-none uppercase tracking-wider"
        >
          <Pin className="h-2.5 w-2.5" aria-hidden="true" />
          pinned
        </div>
      )}

      <div
        id={`message-${message.id}`}
        className={cn(
          "group flex w-full gap-2 px-4 py-0.5 transition-colors relative overflow-visible",
          isOwn
            ? "flex-row-reverse justify-start pl-16 pr-4"
            : "flex-row justify-start pr-16",
          isGrouped ? "mt-0" : "mt-4",
          isPinned && "border-l-2 border-l-blue-500 rounded-l-none"
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Avatar / Spacer (only for others) */}
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
              <div className="w-9" aria-hidden="true" />
            )}
          </div>
        )}

        {/* Message Container (Bubble + Info) */}
        <div
          className={cn(
            "flex flex-col max-w-[85%] md:max-w-[65%] relative",
            isOwn ? "items-end" : "items-start"
          )}
        >
          {/* Header (only for others, not grouped) */}
          {!isOwn && !isGrouped && (
            <div className="flex items-baseline gap-2 mb-1 px-1">
              <span className="font-semibold text-xs text-blue-500 hover:underline cursor-pointer leading-tight">
                {message.user_name}
              </span>
            </div>
          )}

          {/* The Bubble */}
          <div
            className={cn(
              "relative px-3 py-1.5 transition-all duration-200 border backdrop-blur-[2px] min-w-[70px] max-w-full",
              isOwn
                ? cn(
                    "bg-primary/[0.03] border-primary/[0.08]",
                    isGrouped
                      ? "rounded-2xl"
                      : "rounded-2xl rounded-tr-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  )
                : cn(
                    "bg-muted/[0.05] border-border/40",
                    isGrouped
                      ? "rounded-2xl"
                      : "rounded-2xl rounded-tl-sm shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                  )
            )}
          >
            {/* WhatsApp-style tail for first message in group */}
            {!isGrouped &&
              (isOwn ? (
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
                    borderColor:
                      "transparent transparent transparent var(--bubble-own-bg, rgba(var(--primary-rgb,99,102,241),0.06))",
                    filter:
                      "drop-shadow(1px 0px 0px rgba(var(--primary-rgb,99,102,241),0.08))",
                  }}
                />
              ) : (
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
                    borderColor:
                      "transparent rgba(var(--muted-rgb,120,120,120),0.07) transparent transparent",
                    filter: "drop-shadow(-1px 0px 0px rgba(0,0,0,0.06))",
                  }}
                />
              ))}



            {/* Quoted reply block */}
            {message.thread_parent_id &&
              (message.parent_content || message.parent_user_name) && (
                // FIX: `div` was interactive but had no role/tabIndex/keyboard handler.
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={handleQuoteKeyDown}
                  className={cn(
                    "mb-1 rounded p-1.5 text-[12px] flex flex-col gap-0 shadow-sm select-none cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
                    isOwn ? "bg-black/10" : "bg-accent/40"
                  )}
                  aria-label={`Quoted reply from ${message.parent_user_name ?? "Unknown"}`}
                >
                  <div
                    className={cn(
                      "font-semibold text-[10px] leading-tight",
                      isOwn ? "text-primary" : "text-blue-500"
                    )}
                  >
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
                  aria-label="Edit message"
                />
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Button
                    size="sm"
                    className="h-6 text-[10px] px-2"
                    onClick={handleSaveEdit}
                    // FIX: also disabled while saving to prevent double-submit.
                    disabled={saving}
                    aria-busy={saving}
                  >
                    <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] px-2 text-inherit hover:bg-black/10"
                    onClick={() => {
                      setEditContent(message.content);
                      setEditing(false);
                    }}
                  >
                    <X className="h-3 w-3 mr-1" aria-hidden="true" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col">
                <p className="text-[14px] leading-snug break-all md:break-words whitespace-pre-wrap pr-1 text-foreground/80 font-normal">
                  <Highlight
                    text={message.content}
                    term={highlightTerm}
                    messageId={message.id}
                  />
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
                  {/* Removed double tick */}
                </div>
              </div>
            )}

            {/* Link Preview */}
            {message.link_preview && (
              <LinkPreview preview={message.link_preview} />
            )}

            {/* Reaction Toolbar (appears on hover, placed outside bubble visually but relative to it) */}
            {showToolbar && (
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 flex items-center gap-1 z-30",
                  isOwn ? "right-full mr-2" : "left-full ml-2"
                )}
              >
                <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Add reaction"
                      className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground/40 hover:text-muted-foreground"
                    >
                      <SmilePlus className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-2 rounded-2xl shadow-xl"
                    side="top"
                    align="center"
                  >
                    <div className="flex gap-1" role="toolbar" aria-label="Quick reactions">
                      {QUICK_EMOJIS.map((emoji) => {
                        const hasReacted =
                          message.reactions
                            .find((r) => r.emoji === emoji)
                            ?.userIds.includes(currentUserId) ?? false;
                        return (
                          <button
                            key={emoji}
                            onClick={() => onReact(message.id, emoji, hasReacted)}
                            aria-label={`React with ${emoji}`}
                            aria-pressed={hasReacted}
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

                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label="Message actions"
                      className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground/40 hover:text-muted-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-40 rounded-xl shadow-xl">
                    <DropdownMenuItem
                      onClick={() => onReply(message)}
                      className="rounded-lg"
                    >
                      <Reply className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
                      Reply
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopy} className="rounded-lg">
                      <Copy className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
                      Copy Text
                    </DropdownMenuItem>
                    {canPin && (
                      <DropdownMenuItem
                        onClick={() => onPin(message.id, !isPinned)}
                        className="rounded-lg"
                      >
                        <Pin className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
                        {isPinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>
                    )}
                    {isOwn && (
                      <DropdownMenuItem
                        onClick={() => setEditing(true)}
                        className="rounded-lg"
                      >
                        <Pencil className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div
              className={cn(
                "flex flex-wrap gap-1 mt-1",
                isOwn ? "justify-end" : "justify-start"
              )}
            >
              {message.reactions.map((r) => {
                const hasReacted = r.userIds.includes(currentUserId);
                return (
                  // FIX: Added aria-label and aria-pressed for screen reader support.
                  <button
                    key={r.emoji}
                    onClick={() => onReact(message.id, r.emoji, hasReacted)}
                    aria-label={`React with ${r.emoji}, ${r.userIds.length} reaction${r.userIds.length !== 1 ? "s" : ""}`}
                    aria-pressed={hasReacted}
                    className={cn(
                      "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-all active:scale-95",
                      hasReacted
                        ? "bg-blue-500/15 border-blue-500/50 text-blue-500 font-semibold"
                        : "bg-background border-border hover:bg-accent text-muted-foreground"
                    )}
                  >
                    <span aria-hidden="true">{r.emoji}</span>
                    <span className="tabular-nums">{r.userIds.length}</span>
                  </button>
                );
              })}
            </div>
          )}


        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The message will be permanently
              removed from the channel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleConfirmDelete}
              disabled={deleting}
              aria-busy={deleting}
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}