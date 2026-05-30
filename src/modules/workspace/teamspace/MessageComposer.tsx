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
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  SmilePlus,
  Plus,
  X,
  SendHorizontal,
  BarChart2,
  Code,
  AtSign,
  Paperclip,
  Loader2,
  FileIcon,
  TicketSlash,
  Save,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getUserColor, getFileIconPath } from "./lib/utils";
import { Message } from "./hooks/useMessages";
import { CreatePollDialog } from "./CreatePollDialog";
import { GetRepoStructure } from "../GetRepoStructure";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EMOJI_GROUPS = [
  { label: "React", emojis: ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥"] },
  { label: "Work", emojis: ["✅", "❌", "⚠️", "💡", "🚀", "🐛", "📌", "💪"] },
  {
    label: "Symbols",
    emojis: ["👀", "🤔", "💯", "🔗", "📝", "🎯", "⚡", "🌟"],
  },
];

interface Props {
  channelName: string;
  projectId: string;
  replyingTo?: Message | null;
  onClearReply?: () => void;
  onSend: (content: string, poll?: any) => Promise<void>;
  onUploadMedia?: (file: File, caption: string) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  isAnnouncement?: boolean;
  currentUserId?: string;
  projectSlug?: string;
}

export function MessageComposer({
  channelName,
  projectId,
  replyingTo,
  onClearReply,
  onSend,
  onUploadMedia,
  onTyping,
  disabled,
  isAnnouncement,
  currentUserId,
  projectSlug,
}: Props) {
  const [content, setContent] = useState("");
  const [activeAgent, setActiveAgent] = useState<"kaya" | "harry">("kaya");
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Ticket creation state
  const [showTicketCreate, setShowTicketCreate] = useState(false);
  const [ticketBody, setTicketBody] = useState("");
  const [ticketAssigneeId, setTicketAssigneeId] = useState<string>("");
  const createTicketMutation = useMutation(api.workspace.createTicket);

  // Mention state
  const [mentionQuery, setMentionQuery] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);

  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [mediaCaption, setMediaCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB allowed.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedMediaFile(file);
    if (file.type.startsWith("image/")) {
      setMediaPreviewUrl(URL.createObjectURL(file));
    } else {
      setMediaPreviewUrl(null);
    }
    setMediaCaption("");
  };

  const uploadAndSendMedia = () => {
    if (!selectedMediaFile || !onUploadMedia) return;

    onUploadMedia(selectedMediaFile, mediaCaption);

    // Instantly close dialog
    setShowMentions(false);
    setSelectedMediaFile(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
    }
    setMediaCaption("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelMedia = () => {
    setShowMentions(false);
    setSelectedMediaFile(null);
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
      setMediaPreviewUrl(null);
    }
    setMediaCaption("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Code Linker state
  const [showCodeLinker, setShowCodeLinker] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const project = useQuery(
    api.project.getProjectBySlug,
    projectSlug ? { slug: projectSlug } : "skip",
  );
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);

  // Fetch project members for mentions
  const members = useQuery(
    api.project.getProjectMembers,
    projectId ? { projectId: projectId as Id<"projects"> } : "skip",
  );

  const selectedMember = members?.find((m) => m.userId === ticketAssigneeId);

  // AI agents shown at top of mention dropdown
  const agentEntries = [
    ...("kaya".includes(mentionQuery.toLowerCase())
      ? [{ _id: "kaya-bot", userName: "kaya", AccessRole: "AI PM Agent", userImage: "/kaya.svg", role: "ai" }]
      : []),
    ...("harry".includes(mentionQuery.toLowerCase())
      ? [{ _id: "harry-bot", userName: "harry", AccessRole: "AI Dev Agent", userImage: "/harry.svg", role: "ai" }]
      : []),
  ];

  const filteredMembers = [
    ...agentEntries,
    ...(mentionQuery.toLowerCase() === "e" ||
      mentionQuery.toLowerCase() === "ev" ||
      "everyone".includes(mentionQuery.toLowerCase())
      ? [
        {
          _id: "everyone",
          userName: "everyone",
          AccessRole: "Notify everyone in project",
          userImage: undefined,
          role: "system",
        },
      ]
      : []),
    ...(members?.filter(
      (m) =>
        m.userName?.toLowerCase().includes(mentionQuery.toLowerCase()) &&
        m.clerkUserId !== currentUserId, // Filter out current user
    ) || []),
  ];

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

  // Scroll active mention into view
  useEffect(() => {
    if (showMentions) {
      const activeEl = document.getElementById(`mention-item-${mentionIndex}`);
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [mentionIndex, showMentions]);

  const handleSend = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setContent("");
    setShowCodeLinker(false);
    setShowMentions(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }

    try {
      await onSend(trimmed);
    } catch (err) {
      console.error("Error in onSend:", err);
    }
  }, [content, onSend]);

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
          (prev) =>
            (prev - 1 + filteredMembers.length) % filteredMembers.length,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(
          filteredMembers[mentionIndex].userName || "unknown",
          false,
        );
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

  const insertMention = (name: string, isCaption: boolean = false) => {
    if (mentionStartIndex === -1) return;

    const currentText = isCaption ? mediaCaption : content;
    const ref = isCaption ? captionTextareaRef : textareaRef;

    const before = currentText.substring(0, mentionStartIndex);
    const after = currentText.substring(
      ref.current?.selectionStart || currentText.length,
    );
    const newContent = `${before}@${name} ${after}`;

    if (isCaption) {
      setMediaCaption(newContent);
    } else {
      setContent(newContent);
    }

    setShowMentions(false);
    setMentionStartIndex(-1);

    setTimeout(() => {
      if (ref.current) {
        ref.current.focus();
        const newPos = (before + "@" + name + " ").length;
        ref.current.setSelectionRange(newPos, newPos);
      }
    }, 10);
  };

  const insertEmoji = (emoji: string) => {
    setContent((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const placeholder =
    disabled && isAnnouncement
      ? "Only project owners and admins can send messages in this channel"
      : `Message #${channelName}`;

  return (
    <div className="px-4 pb-6 pt-0 shrink-0">
      {/* Reply context banner */}
      {replyingTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 rounded-md bg-accent/50 border text-xs text-muted-foreground">
          <span className="truncate flex-1">
            Replying to{" "}
            <strong style={{ color: getUserColor(replyingTo.user_name) }}>
              {replyingTo.user_name}
            </strong>
            :{" "}
            <span className="opacity-70">
              {replyingTo.content.slice(0, 60)}
              {replyingTo.content.length > 60 ? "…" : ""}
            </span>
          </span>
          <button
            onClick={onClearReply}
            className="hover:text-foreground transition-colors shrink-0 cursor-pointer p-0.5 rounded-sm hover:bg-foreground/10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input row */}
      <motion.div
        layout
        transition={{
          layout: { duration: 0.2, ease: "easeOut" },
        }}
        className={cn(
          "flex items-center gap-2 rounded-lg bg-accent/40 px-4 py-2 transition-all duration-200 relative",
          disabled && "opacity-70 bg-secondary/30",
        )}
      >
        {/* Code Linker Popover */}
        <Popover open={showCodeLinker} onOpenChange={setShowCodeLinker}>
          <PopoverTrigger asChild>
            <div className="absolute top-0 left-4 w-0 h-0 pointer-events-none" />
          </PopoverTrigger>
          <PopoverContent
            className="w-[340px] p-0 border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl rounded-xl overflow-hidden"
            side="top"
            align="start"
            sideOffset={10}
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <GetRepoStructure
              repoFullName={project?.repoFullName}
              ownerClerkId={project?.ownerClerkId}
              selectedPath={selectedPath}
              onClose={() => setShowCodeLinker(false)}
              onSelect={(path) => {
                if (path) {
                  const before = content.substring(
                    0,
                    content.lastIndexOf("\\"),
                  );
                  const after = content.substring(
                    content.lastIndexOf("\\") + 1,
                  );
                  const fileLink = `\`${path}\``;
                  setContent(before + fileLink + " " + after);
                  setShowCodeLinker(false);
                  textareaRef.current?.focus();
                }
              }}
            />
          </PopoverContent>
        </Popover>

        {/* Tickets Creation Popover */}
        <Popover open={showTicketCreate} onOpenChange={setShowTicketCreate}>
          <PopoverTrigger asChild>
            <div className="absolute top-0 left-4 w-0 h-0 pointer-events-none" />
          </PopoverTrigger>
          <PopoverContent
            className="w-[340px] p-4 border-border bg-background backdrop-blur-xl shadow-2xl rounded-xl space-y-4"
            side="top"
            align="start"
            sideOffset={10}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
                <TicketSlash className="h-4 w-4 text-primary" /> Create Ticket
              </h3>
              <button
                onClick={() => {
                  setShowTicketCreate(false);
                  setTicketBody("");
                  setTicketAssigneeId("");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Ticket Description
                </label>
                <Textarea
                  placeholder="What needs to be done?"
                  value={ticketBody}
                  onChange={(e) => setTicketBody(e.target.value)}
                  className="min-h-[70px] text-xs resize-none"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  Assignee
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between rounded-md border border-accent bg-transparent px-3 py-2 text-xs shadow-sm hover:bg-accent/30 transition-colors text-foreground text-left cursor-pointer"
                    >
                      {selectedMember ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={selectedMember.userImage} />
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                              {selectedMember.userName
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{selectedMember.userName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Select an assignee
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        ▼
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    side="right"
                    align="center"
                    sideOffset={20}
                    className="w-[320px] p-3 border border-border bg-background shadow-2xl rounded-xl z-[250]"
                  >
                    <h4 className="text-xs text-primary border-b pb-2 border-accent tracking-wider mb-2">
                      Assign Member
                    </h4>
                    <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1">
                      {members?.map((member) => (
                        <button
                          key={member._id}
                          type="button"
                          onClick={() => {
                            setTicketAssigneeId(member.userId);
                          }}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-2 rounded-lg border text-center transition-all duration-200 hover:bg-accent/40 hover:border-border/60 group cursor-pointer",
                            ticketAssigneeId === member.userId
                              ? "bg-primary/10 border-primary/15 text-primary"
                              : "border-transparent bg-muted/10 text-muted-foreground",
                          )}
                        >
                          <Avatar className="h-9 w-9 border border-border/30 group-hover:scale-105 transition-transform duration-200">
                            <AvatarImage src={member.userImage ?? undefined} />
                            <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-black">
                              {(member.userName || "??")
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 w-full">
                            <span className="text-[10px] font-bold truncate leading-tight w-full text-foreground">
                              {member.userName}
                            </span>
                            <span className="text-[9px] text-muted-foreground truncate w-full">
                              {member.AccessRole || "Member"}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => {
                  setShowTicketCreate(false);
                  setTicketBody("");
                  setTicketAssigneeId("");
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="text-xs h-7"
                disabled={!ticketBody.trim() || !ticketAssigneeId}
                onClick={async () => {
                  try {
                    await createTicketMutation({
                      projectId: projectId as Id<"projects">,
                      body: ticketBody.trim(),
                      assignedTo: ticketAssigneeId as Id<"users">,
                    });
                    toast.success("Ticket created successfully!");
                    setShowTicketCreate(false);
                    setTicketBody("");
                    setTicketAssigneeId("");
                  } catch (err) {
                    console.error("Failed to create ticket:", err);
                    toast.error("Failed to create ticket");
                  }
                }}
              >
                Save <Save />
              </Button>
            </div>
          </PopoverContent>
        </Popover>

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
                  {
                    label: "Codebase",
                    icon: Code,
                    color: "bg-foreground text-background",
                  },
                  {
                    label: "Poll",
                    icon: BarChart2,
                    color: "bg-foreground text-background",
                  },
                  {
                    label: "Media (Max 10MB)",
                    icon: uploadingMedia ? Loader2 : Paperclip,
                    color: "bg-foreground text-background",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    className="flex flex-col items-center gap-1.5 group outline-none"
                    onClick={() => {
                      if (item.label === "Poll") {
                        setIsPollDialogOpen(true);
                      } else if (item.label === "Codebase") {
                        setShowCodeLinker(true);
                      } else if (item.label === "Media (Max 10MB)") {
                        fileInputRef.current?.click();
                      } else {
                        console.log("Clicked", item.label);
                      }
                    }}
                    disabled={
                      uploadingMedia && item.label === "Media (Max 10MB)"
                    }
                  >
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-110 group-active:scale-95",
                        item.color,
                        uploadingMedia &&
                        item.label === "Media (Max 10MB)" &&
                        "opacity-70 cursor-not-allowed",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px]",
                          uploadingMedia &&
                          item.label === "Media (Max 10MB)" &&
                          "animate-spin",
                        )}
                      />
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
            <PopoverContent
              side="top"
              align="start"
              className="w-64 p-3 mb-2 bg-background/95 backdrop-blur-xl border-border/40 shadow-2xl rounded-xl"
            >
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

              if (val.trim() === "/") {
                setShowTicketCreate(true);
                setContent("");
                setShowMentions(false);
                setShowCodeLinker(false);
                return;
              }

              if (val.trim() === "#") {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
                setContent("");
                setShowMentions(false);
                setShowCodeLinker(false);
                return;
              }

              setContent(val);
              onTyping?.(val.length > 0);

              const cursorPosition = e.target.selectionStart ?? 0;
              const textBeforeCursor = val.substring(0, cursorPosition);

              // Handle mentions (@)
              const lastAtIndex = textBeforeCursor.lastIndexOf("@");
              // Handle code linker (\)
              const lastBackslashIndex = textBeforeCursor.lastIndexOf("\\");

              if (lastAtIndex !== -1 && lastAtIndex >= lastBackslashIndex) {
                const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
                const charBeforeAt =
                  lastAtIndex > 0
                    ? textBeforeCursor[lastAtIndex - 1]
                    : undefined;
                const validStart =
                  charBeforeAt === undefined ||
                  charBeforeAt === " " ||
                  charBeforeAt === "\n";

                // --- @kaya / @harry intercept — never show member dropdown ---
                const lowerAfterAt = textAfterAt.toLowerCase();
                if (validStart && lowerAfterAt === "kaya") {
                  setActiveAgent("kaya");
                  setShowMentions(false);
                  setMentionStartIndex(-1);
                  setShowCodeLinker(false);
                } else if (validStart && lowerAfterAt === "harry") {
                  setActiveAgent("harry");
                  toast.info("Harry is coming soon!", { duration: 3000 });
                  setShowMentions(false);
                  setMentionStartIndex(-1);
                  setShowCodeLinker(false);
                } else if (validStart && !textAfterAt.includes(" ")) {
                  setMentionQuery(textAfterAt);
                  setShowMentions(true);
                  setMentionIndex(0);
                  setMentionStartIndex(lastAtIndex);
                  setShowCodeLinker(false);
                } else {
                  setShowMentions(false);
                  setMentionStartIndex(-1);
                }
              } else if (lastBackslashIndex !== -1) {
                const charBeforeBackslash =
                  lastBackslashIndex > 0
                    ? textBeforeCursor[lastBackslashIndex - 1]
                    : undefined;
                const validStart =
                  charBeforeBackslash === undefined ||
                  charBeforeBackslash === " " ||
                  charBeforeBackslash === "\n";
                const textAfterBackslash = textBeforeCursor.substring(
                  lastBackslashIndex + 1,
                );

                if (validStart && !textAfterBackslash.includes(" ")) {
                  setShowCodeLinker(true);
                  setShowMentions(false);
                } else {
                  setShowCodeLinker(false);
                }
              } else {
                setShowMentions(false);
                setShowCodeLinker(false);
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
            {showMentions &&
              filteredMembers.length > 0 &&
              !selectedMediaFile && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute bottom-[calc(100%+8px)] left-0 w-64 bg-popover border border-border shadow-2xl rounded-xl overflow-hidden z-[200]"
                >
                  <div className="px-3 py-2 border-b border-border bg-muted/50 flex items-center gap-2">
                    <AtSign className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Mention someone
                    </span>
                  </div>
                  <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
                    <div className="py-1">
                      {filteredMembers.map((member, i) => (
                        <button
                          key={member._id}
                          id={`mention-item-${i}`}
                          onClick={() =>
                            insertMention(member.userName || "", false)
                          }
                          onMouseEnter={() => setMentionIndex(i)}
                          className={cn(
                            "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                            i === mentionIndex
                              ? "bg-primary/10"
                              : "hover:bg-accent/20",
                          )}
                        >
                          <Avatar className="h-8 w-8 border border-border/40 shrink-0">
                            <AvatarImage src={member.userImage ?? undefined} />
                            <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-bold">
                              {(member.userName || "??")
                                .substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span
                              className={cn(
                                "text-[13px] font-semibold truncate leading-tight",
                                (member as any).role === "ai" ? "text-white" : "",
                              )}
                              style={(member as any).role !== "ai" ? { color: getUserColor(member.userName || "") } : undefined}
                            >
                              {member.userName}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {member.AccessRole || "Member"}
                            </span>
                          </div>
                          {i === mentionIndex && (
                            <span className="ml-auto text-xs text-muted-foreground shrink-0">
                              ↵
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
          </AnimatePresence>
        </div>

        {/* AI Agent Selector — right side dropdown */}
        <Popover open={agentDropdownOpen} onOpenChange={setAgentDropdownOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-medium transition-all duration-200 border select-none shrink-0 text-foreground border-border bg-accent! hover:bg-muted/60",
                disabled && "opacity-40 cursor-not-allowed",
              )}
            >
              <Image
                src={activeAgent === "kaya" ? "/kaya.svg" : "/harry.svg"}
                alt={activeAgent === "kaya" ? "Kaya" : "Harry"}
                width={20}
                height={20}
                className="shrink-0"
              />
              <span className="capitalize">{activeAgent}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={8}
            className="w-44 p-1.5 bg-card backdrop-blur-xl border-border space-y-3 shadow-2xl rounded-xl"
          >
            <p className="text-sm text-center border-b border-accent mb-2 text-muted-foreground px-2 py-1">AI Assistant</p>
            {([
              { id: "kaya", label: "Kaya", svg: "/kaya.svg", desc: "AI PM Agent", color: "text-white" },
              { id: "harry", label: "Harry", svg: "/harry.svg", desc: "AI Dev Agent", color: "text-white" },
            ] as const).map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => {
                  setActiveAgent(agent.id);
                  setAgentDropdownOpen(false);
                  // Swap prefix in textarea
                  setContent((c) => {
                    const stripped = c.replace(/^@kaya\s*/i, "").replace(/^@harry\s*/i, "");
                    return `@${agent.id} ${stripped}`;
                  });
                  setTimeout(() => textareaRef.current?.focus(), 10);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-2 py-1 rounded-md text-left transition-colors hover:bg-accent/60",
                  activeAgent === agent.id && "bg-accent/50",
                )}
              >
                <Image src={agent.svg} alt={agent.label} width={16} height={16} className="shrink-0" />
                <div className="flex flex-col space-y-1">
                  <span className="text-[12px] font-medium leading-tight text-foreground">{agent.label}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{agent.desc}</span>
                </div>
                {activeAgent === agent.id && (
                  <span className="ml-auto text-[9px] text-muted-foreground">✓</span>
                )}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Send button */}
        <div className="flex items-center shrink-0 pr-1">
          <motion.button
            whileHover={content.trim() ? { scale: 1.1 } : {}}
            whileTap={content.trim() ? { scale: 0.9 } : {}}
            onClick={handleSend}
            disabled={disabled || !content.trim()}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200",
              content.trim()
                ? "text-primary hover:bg-primary/10"
                : "text-muted-foreground/40 cursor-not-allowed",
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
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleMediaSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp"
      />

      {/* File Preview Dialog */}
      <Dialog
        open={!!selectedMediaFile}
        onOpenChange={(open) => {
          if (!open) handleCancelMedia();
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={!uploadingMedia}
        >
          <DialogHeader>
            <DialogTitle>Send File</DialogTitle>
            <DialogDescription>
              Preview and add a caption before sending.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center space-y-4 my-2">
            {mediaPreviewUrl ? (
              <div className="relative w-full max-h-[40vh] rounded-md overflow-hidden flex items-center justify-center bg-muted/50 border border-border/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaPreviewUrl}
                  alt="Preview"
                  className="max-h-[40vh] object-contain"
                />
              </div>
            ) : selectedMediaFile ? (
              <div className="flex flex-col items-center justify-center p-8 bg-muted/30 w-full rounded-md border border-border/50">
                <img
                  src={getFileIconPath(selectedMediaFile.name)}
                  alt="File icon"
                  className="h-16 w-16 mb-4 object-contain"
                />
                <span className="text-sm font-medium text-center break-all">
                  {selectedMediaFile.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {(selectedMediaFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ) : null}

            <div className="relative w-full">
              <Textarea
                ref={captionTextareaRef}
                value={mediaCaption}
                onChange={(e) => {
                  const val = e.target.value;
                  setMediaCaption(val);

                  const cursorPosition = e.target.selectionStart ?? 0;
                  const textBeforeCursor = val.substring(0, cursorPosition);
                  const lastAtIndex = textBeforeCursor.lastIndexOf("@");

                  if (lastAtIndex !== -1) {
                    const textAfterAt = textBeforeCursor.substring(
                      lastAtIndex + 1,
                    );
                    const charBeforeAt =
                      lastAtIndex > 0
                        ? textBeforeCursor[lastAtIndex - 1]
                        : undefined;
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
                placeholder="Add a caption... (type @ to mention)"
                disabled={uploadingMedia}
                className="w-full resize-none min-h-[60px]"
                rows={2}
                onKeyDown={(e) => {
                  if (showMentions && filteredMembers.length > 0) {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      setMentionIndex(
                        (prev) => (prev + 1) % filteredMembers.length,
                      );
                      return;
                    }
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      setMentionIndex(
                        (prev) =>
                          (prev - 1 + filteredMembers.length) %
                          filteredMembers.length,
                      );
                      return;
                    }
                    if (e.key === "Enter" || e.key === "Tab") {
                      e.preventDefault();
                      insertMention(
                        filteredMembers[mentionIndex].userName || "unknown",
                        true,
                      );
                      return;
                    }
                    if (e.key === "Escape") {
                      setShowMentions(false);
                      return;
                    }
                  }

                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    uploadAndSendMedia();
                  }
                }}
              />
              <AnimatePresence>
                {showMentions &&
                  filteredMembers.length > 0 &&
                  !!selectedMediaFile && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-[calc(100%+8px)] left-0 w-64 bg-popover border border-border/50 shadow-2xl rounded-xl overflow-hidden z-[200]"
                    >
                      <div className="px-3 py-2 border-b border-border/40 bg-muted/50 flex items-center gap-2">
                        <AtSign className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Mention someone
                        </span>
                      </div>
                      <div className="max-h-[220px] overflow-y-auto scrollbar-thin">
                        <div className="py-1">
                          {filteredMembers.map((member, i) => (
                            <button
                              key={member._id}
                              id={`caption-mention-item-${i}`}
                              onClick={() =>
                                insertMention(member.userName || "", true)
                              }
                              onMouseEnter={() => setMentionIndex(i)}
                              className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                                i === mentionIndex
                                  ? "bg-primary/15"
                                  : "hover:bg-accent/40",
                              )}
                            >
                              <Avatar className="h-8 w-8 border border-border/40 shrink-0">
                                <AvatarImage
                                  src={member.userImage ?? undefined}
                                />
                                <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-bold">
                                  {(member.userName || "??")
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col min-w-0">
                                <span
                                  className="text-[13px] font-semibold truncate leading-tight"
                                  style={{
                                    color: getUserColor(member.userName || ""),
                                  }}
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
                      </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button
              variant="ghost"
              onClick={handleCancelMedia}
              disabled={uploadingMedia}
            >
              Cancel
            </Button>
            <Button onClick={uploadAndSendMedia} disabled={uploadingMedia}>
              {uploadingMedia ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <SendHorizontal className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
