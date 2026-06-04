/**
 * ChannelsSidebar.tsx
 *
 * Component for displaying and managing the list of channels in a project.
 *
 * Functions:
 * - Lists channels categorized by type (Announcements, Community Chat).
 * - Handles channel selection with prefetching of messages for performance.
 * - Provides administrative actions (Create, Edit, Delete) based on project permissions.
 * - Shows visual indicators for the active channel and permissions.
 *
 * Integration:
 * - Uses `useChannels` hook for data and mutations.
 * - Uses `useProjectPermissions` to determine user roles.
 * - Triggers message prefetching on hover via `prefetchMessages`.
 */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Channel } from "./hooks/useChannels";
import { prefetchMessages } from "./hooks/useMessages";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { EditChannelDialog } from "./EditChannelDialog";
import { DeleteChannelDialog } from "./DeleteChannelDialog";
import { useTeamspaceSettings } from "./hooks/useTeamspaceSettings";
import { TeamspaceSettingsDialog } from "./TeamspaceSettingsDialog";
import { cn } from "@/lib/utils";
import {
  Hash,
  Megaphone,
  Plus,
  Lock,
  ChevronDown,
  Settings,
  Edit2,
  Trash2,
  PlaneTakeoff,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { Id } from "../../../../convex/_generated/dataModel";

interface Props {
  projectId: string;
  channels: Channel[];
  loading: boolean;
  activeChannelId: string | null;
  currentUserId?: string;
  onSelect: (channel: Channel) => void;
  onCreate: (
    name: string,
    description: string,
    type: "text" | "announcement" | "private",
    memberIds?: string[],
  ) => Promise<Channel | undefined>;
  onUpdate: (
    channelId: string,
    name: string,
    description: string,
  ) => Promise<boolean>;
  onDelete: (channelId: string) => Promise<boolean>;
}

// const channelColors: Record<string, string> = {
//   general: "text-emerald-500",
//   "general-chat": "text-emerald-500",
//   announcements: "text-amber-500",
//   "general-announcement": "text-amber-500",
//   announcement: "text-amber-500",
// };

export function ChannelsSidebar({
  projectId,
  channels,
  loading,
  activeChannelId,
  currentUserId,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const { isOwner, isPower } = useProjectPermissions(
    projectId as Id<"projects">,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [targetChannel, setTargetChannel] = useState<Channel | null>(null);
  const [showHint, setShowHint] = useState(true);

  const { settings } = useTeamspaceSettings(projectId);
  const canCreate = isPower || settings?.members_can_create_channels === 1;
  const canEdit = isPower || settings?.members_can_edit_channels === 1;
  const canDelete = isPower || settings?.members_can_delete_channels === 1;

  const [announcementsExpanded, setAnnouncementsExpanded] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(true);

  const getChannelColor = (channel: Channel) => {
    if (channel.type === "announcement") {
      return "text-blue-400";
    }
    return "text-primary";
  };

  const announcementChannels = channels.filter(
    (c) => c.type === "announcement",
  );
  const privateChannels = channels.filter((c) => c.type === "private");
  const chatChannels = channels.filter((c) => c.type === "text");
  const [privateExpanded, setPrivateExpanded] = useState(true);

  const renderChannel = (channel: Channel) => {
    const isActive = channel.id === activeChannelId;
    const Icon = channel.type === "announcement" ? Megaphone : Hash;
    const color = getChannelColor(channel);

    // Cast counts strictly to numbers to prevent any Turso/Ably string comparison issues
    const unreadCount = Number(channel.unread_count ?? 0);
    const mentionCount = Number(channel.mention_count ?? 0);

    // Private channel: has_access=0 means locked for this user
    const isPrivate = channel.type === "private";
    const isAccessible = channel.has_access !== 0; // undefined = public channel, treat as accessible

    return (
      <li key={channel.id} className="relative group px-2">
        <div
          role="button"
          tabIndex={0}
          id={`channel-${channel.id}`}
          onClick={() => onSelect(channel)}
          // Skip prefetch for locked private channels — don't waste a request that will 403
          onMouseEnter={() =>
            isAccessible && prefetchMessages(projectId, channel.id)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(channel);
            }
          }}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[14px] font-medium transition-all duration-200 relative cursor-pointer",
            isActive
              ? "bg-accent/70 text-foreground shadow-sm"
              : isAccessible
                ? "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                : "text-muted-foreground/50 hover:bg-accent/20 hover:text-muted-foreground",
          )}
        >
          {/* Active indicator */}
          {isActive && (
            <motion.div
              layoutId="active-channel"
              className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          <Icon
            className={cn(
              "h-[18px] w-[18px] shrink-0 transition-colors duration-300",
              isActive
                ? color
                : "text-muted-foreground group-hover:text-foreground",
            )}
          />
          <span
            className={cn(
              "truncate leading-tight flex-1 min-w-0 max-w-[120px] capitalize transition-all",
              (unreadCount > 0 || mentionCount > 0) &&
                !isActive &&
                " text-foreground",
            )}
          >
            {channel.name}
          </span>

          {/* Live unread & mention counters */}
          {mentionCount > 0 && !isActive ? (
            <span className="inline-flex items-center justify-center shrink-0 min-w-[20px] h-[20px] rounded-full text-[10px] font-bold bg-rose-500 text-white px-1.5 shadow-sm ring-1 ring-rose-500/20 animate-pulse z-10 mr-1">
              @ +{Math.max(unreadCount, mentionCount)}
            </span>
          ) : unreadCount > 0 && !isActive ? (
            <span className="inline-flex items-center justify-center shrink-0 min-w-[20px] h-[20px] rounded-full text-[10px] bg-blue-500/20 text-primary dark:bg-blue-500/10 dark:text-primary border border-blue-500/50 px-2 shadow-sm z-10 mr-1">
              +{unreadCount}
            </span>
          ) : null}

          {/* Hover actions - 3 dot menu */}
          {(canEdit || (canDelete && !channel.is_default)) && (
            <div
              className={cn(
                "transition-opacity z-20 shrink-0",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="h-[18px] w-[18px] flex items-center justify-center hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  {canEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetChannel(channel);
                        setEditOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Channel
                    </DropdownMenuItem>
                  )}
                  {canDelete && !channel.is_default && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetChannel(channel);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Channel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Lock icon for private channels */}
          {isPrivate && !isAccessible && (
            <Lock className="h-3 w-3 ml-auto shrink-0 text-muted-foreground/40" />
          )}

          {/* Existing announcement lock (for non-power users) */}
          {channel.type === "announcement" && !isPower && (
            <Lock className="h-3 w-3 ml-auto shrink-0" />
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col h-full w-60 border-r border-border bg-background shrink-0">
      {/* Header Section */}
      <div className="bg-background border-b border-border shrink-0 h-14">
        {/* Server Header */}
        <div className="flex items-center justify-center px-4 h-full cursor-pointer hover:bg-accent/30 transition-colors">
          <h2 className="font-semibold text-xl leading-tight truncate px-0.5">
            <PlaneTakeoff className="h-6 w-6 -mt-0.5 mr-2 inline" /> Team space
          </h2>
        </div>
      </div>

      {/* Create Channel Action */}
      {canCreate && (
        <div className="px-3 pt-4 pb-0">
          <motion.button
            onClick={() => setCreateOpen(true)}
            className="w-full flex items-center justify-center gap-3 px-3 h-9 border border-primary/10 rounded-md bg-muted/80 cursor-pointer hover:bg-muted"
          >
            <span className="text-[13px] tracking-tight">Create Channel</span>
            <div className="bg-primary/5! border border-muted p-1 rounded">
              <Plus className="h-4 w-4 text-primary" />
            </div>
          </motion.button>
        </div>
      )}

      {/* Channel List */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="px-2 pt-4 pb-12 space-y-6">
          {loading ? (
            <div className="flex flex-col gap-1 px-1 mt-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-md" />
              ))}
            </div>
          ) : (
            <>
              {/* Announcements Section */}
              {announcementChannels.length > 0 && (
                <div>
                  <div
                    className="flex items-center justify-between px-2 pt-2 pb-1 group cursor-pointer hover:text-foreground transition-colors"
                    onClick={() =>
                      setAnnouncementsExpanded(!announcementsExpanded)
                    }
                  >
                    <div className="flex items-center gap-1 select-none">
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-300 text-muted-foreground group-hover:text-foreground",
                          !announcementsExpanded && "-rotate-90",
                        )}
                      />
                      <h3 className="text-sm text-muted-foreground tracking-wide group-hover:text-foreground">
                        Announcements
                      </h3>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {announcementsExpanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex flex-col gap-0.5 mt-1 overflow-hidden"
                      >
                        {announcementChannels.map(renderChannel)}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Community Chat Section */}
              <div>
                <div
                  className="flex items-center justify-between px-2 pt-2 pb-1 group cursor-pointer hover:text-foreground transition-colors"
                  onClick={() => setChatExpanded(!chatExpanded)}
                >
                  <div className="flex items-center gap-1 select-none">
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground group-hover:text-foreground",
                        !chatExpanded && "-rotate-90",
                      )}
                    />
                    <h3 className="text-sm text-muted-foreground group-hover:text-foreground">
                      Community Chat
                    </h3>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {chatExpanded && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="flex flex-col gap-0.5 mt-1 overflow-hidden"
                    >
                      {chatChannels.map(renderChannel)}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Private Channels Section */}
              {privateChannels.length > 0 && (
                <div>
                  <div
                    className="flex items-center justify-between px-2 pt-2 pb-1 group cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => setPrivateExpanded(!privateExpanded)}
                  >
                    <div className="flex items-center gap-1 select-none">
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 shrink-0 transition-transform duration-200 text-muted-foreground group-hover:text-foreground",
                          !privateExpanded && "-rotate-90",
                        )}
                      />
                      <h3 className="text-sm text-muted-foreground group-hover:text-foreground">
                        Private
                      </h3>
                    </div>
                  </div>
                  <AnimatePresence initial={false}>
                    {privateExpanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="flex flex-col gap-0.5 mt-1 overflow-hidden"
                      >
                        {privateChannels.map(renderChannel)}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {showHint && (
        <div className="px-3 pb-3 shrink-0">
          <div className="bg-muted/40 border border-accent rounded-lg relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="px-3 py-2 border-b border-border/50 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-foreground">
                Quick tip:
              </span>
              <button
                onClick={() => setShowHint(false)}
                className="p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-3 text-[13px] text-muted-foreground leading-tight">
              <ol className="list-decimal list-inside space-y-1 ml-0.5">
                <li>
                  <strong className="text-foreground">@</strong> for mentions
                </li>
                <li>
                  <strong className="text-foreground">/</strong> for ticket
                  creation
                </li>
                <li>
                  <strong className="text-foreground">\</strong> for code link
                </li>
                <li>
                  <strong className="text-foreground">#</strong> for file upload
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Setting Section */}
      <div className="bg-background border-t border-border shrink-0">
        <div className="p-3 relative z-10">
          <motion.button
            onClick={() => setSettingsOpen(true)}
            whileHover={{
              scale: 1.02,
              backgroundColor: "var(--color-accent)",
            }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer flex items-center justify-center gap-2.5 w-full py-2 rounded border border-border bg-accent/50 hover:bg-accent/40 hover:border-border hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-300 group relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Settings className="h-[18px] w-[18px] text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>

            <span className="text-sm tracking-wide text-primary/80 transition-colors">
              Setting
            </span>
          </motion.button>
        </div>
      </div>

      <CreateChannelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        currentUserId={currentUserId}
        onCreate={onCreate}
      />

      <EditChannelDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
        channel={targetChannel}
        projectId={projectId}
        currentUserId={currentUserId}
        isPower={isPower}
      />

      <DeleteChannelDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          if (targetChannel) {
            await onDelete(targetChannel.id);
          }
        }}
        channel={targetChannel}
      />

      <TeamspaceSettingsDialog
        projectId={projectId}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        isPower={isPower}
      />
    </div>
  );
}
