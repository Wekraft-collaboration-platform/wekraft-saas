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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useProjectPermissions } from "@/hooks/use-project-permissions";
import { Id } from "../../../../convex/_generated/dataModel";

interface Props {
  projectId: string;
  channels: Channel[];
  loading: boolean;
  activeChannelId: string | null;
  onSelect: (channel: Channel) => void;
  onCreate: (
    name: string,
    description: string,
    type: "text" | "announcement",
  ) => Promise<Channel | undefined>;
  onUpdate: (
    channelId: string,
    name: string,
    description: string,
  ) => Promise<boolean>;
  onDelete: (channelId: string) => Promise<boolean>;
}

const channelColors: Record<string, string> = {
  general: "text-emerald-500",
  announcements: "text-amber-500",
  announcement: "text-amber-500",
};

export function ChannelsSidebar({
  projectId,
  channels,
  loading,
  activeChannelId,
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
  const [targetChannel, setTargetChannel] = useState<Channel | null>(null);

  const [announcementsExpanded, setAnnouncementsExpanded] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(true);

  const getChannelColor = (name: string) => {
    return channelColors[name.toLowerCase()] ?? "text-blue-500";
  };

  const announcementChannels = channels.filter(
    (c) => c.type === "announcement",
  );
  const chatChannels = channels.filter((c) => c.type !== "announcement");

  const renderChannel = (channel: Channel) => {
    const isActive = channel.id === activeChannelId;
    const Icon = channel.type === "announcement" ? Megaphone : Hash;
    const color = getChannelColor(channel.name);

    return (
      <li key={channel.id} className="relative group/item px-2">
        <div
          role="button"
          tabIndex={0}
          id={`channel-${channel.id}`}
          onClick={() => onSelect(channel)}
          onMouseEnter={() => prefetchMessages(projectId, channel.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(channel);
            }
          }}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-300 relative overflow-hidden cursor-pointer",
            isActive
              ? "bg-accent/60 text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent/30 hover:text-foreground",
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
                : "text-muted-foreground/50 group-hover/item:" + color,
            )}
          />
          <span className="truncate leading-tight">{channel.name}</span>

          {/* Hover actions */}
          {isOwner && !channel.is_default && (
            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetChannel(channel);
                  setEditOpen(true);
                }}
                className="p-1 hover:bg-accent rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTargetChannel(channel);
                  setDeleteOpen(true);
                }}
                className="p-1 hover:bg-destructive/10 rounded-md text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {channel.type === "announcement" && !isOwner && (
            <Lock className="h-3 w-3 ml-auto shrink-0 opacity-40 group-hover/item:opacity-70 transition-opacity" />
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="flex flex-col h-full w-60 border-r border-border/80 bg-background shrink-0">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/80 shadow-sm">
        {/* Server Header */}
        <div className="flex items-center justify-center px-4 h-14 cursor-pointer hover:bg-accent/30 transition-colors">
          <h2 className="font-semibold text-xl leading-tight truncate px-0.5">
            <PlaneTakeoff className="h-6 w-6 -mt-0.5 mr-2 inline" /> Team space
          </h2>
        </div>

        {/* Create Channel Action */}
        <div className="px-3 pb-4">
          <motion.button
            onClick={() => setCreateOpen(true)}
            // whileHover={{ scale: 1, y: -1 }}
            disabled={!isPower}
            className="w-full flex items-center justify-center gap-3 px-3 h-9 bg-muted hover:bg-accent/30 border border-primary/20 hover:border-primary/40 text-foreground group transition-all duration-300 relative overflow-hidden rounded"
          >
            <div className="bg-primary/20 p-1 rounded group-hover:bg-primary/30">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs tracking-tight">Create Channel</span>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          </motion.button>
        </div>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="px-2 py-3 space-y-4">
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
                    onClick={() => setAnnouncementsExpanded(!announcementsExpanded)}
                  >
                    <div className="flex items-center gap-1 select-none">
                      <ChevronDown className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-300 text-muted-foreground/60 group-hover:text-foreground",
                        !announcementsExpanded && "-rotate-90"
                      )} />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 group-hover:text-foreground">
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
                    <ChevronDown className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-300 text-muted-foreground/60 group-hover:text-foreground",
                      !chatExpanded && "-rotate-90"
                    )} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 group-hover:text-foreground">
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
            </>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Setting Section */}
      <div className="sticky bottom-0 z-20 bg-background/95 backdrop-blur-md border-t border-border/60 shrink-0">
        <div className="p-3 relative z-10">
          <motion.button
            whileHover={{
              scale: 1.02,
              backgroundColor: "var(--color-accent-60)",
            }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2.5 w-full py-2 rounded border border-border/40 bg-accent/20 hover:bg-accent/40 hover:border-border/80 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-300 group relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Settings className="h-[18px] w-[18px] text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>

            <span className="text-sm tracking-wide text-muted-foreground transition-colors">
              Setting
            </span>
          </motion.button>
        </div>
      </div>

      <CreateChannelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={onCreate}
      />

      <EditChannelDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
        channel={targetChannel}
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
    </div>
  );
}
