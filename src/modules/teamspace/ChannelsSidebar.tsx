"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Channel } from "./hooks/useChannels";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { cn } from "@/lib/utils";
import { Hash, Megaphone, Plus, Lock, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  channels: Channel[];
  loading: boolean;
  activeChannelId: string | null;
  isOwner: boolean;
  onSelect: (channel: Channel) => void;
  onCreate: (name: string, description: string, type: "text" | "announcement") => Promise<Channel | undefined>;
}

const channelColors: Record<string, string> = {
  general: "text-emerald-500",
  announcements: "text-amber-500",
  announcement: "text-amber-500",
};

export function ChannelsSidebar({ 
  channels, 
  loading, 
  activeChannelId, 
  isOwner,
  onSelect, 
  onCreate,
}: Props) {
  const [createOpen, setCreateOpen] = useState(false);

  const getChannelColor = (name: string) => {
    return channelColors[name.toLowerCase()] ?? "text-blue-500";
  };

  const announcementChannels = channels.filter(c => c.type === "announcement");
  const chatChannels = channels.filter(c => c.type !== "announcement");

  const renderChannel = (channel: Channel) => {
    const isActive = channel.id === activeChannelId;
    const Icon = channel.type === "announcement" ? Megaphone : Hash;
    const color = getChannelColor(channel.name);

    return (
      <li key={channel.id} className="relative group/item px-2">
        <button
          id={`channel-${channel.id}`}
          onClick={() => onSelect(channel)}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[14px] font-medium transition-all duration-300 relative overflow-hidden",
            isActive
              ? "bg-accent/60 text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
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
              isActive ? color : "text-muted-foreground/50 group-hover/item:" + color
            )}
          />
          <span className="truncate leading-tight">{channel.name}</span>
          
          {channel.type === "announcement" && (
            <Lock className="h-3 w-3 ml-auto shrink-0 opacity-40 group-hover/item:opacity-70 transition-opacity" />
          )}
          
          {/* Hover highlight */}
          {!isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500" />
          )}
        </button>
      </li>
    );
  };

  return (
    <div className="flex flex-col h-full w-60 border-r border-border/80 bg-background shrink-0">
      {/* Server Header */}
      <div className="flex items-center justify-center px-4 py-3.5 border-b border-border/80 shadow-sm cursor-pointer hover:bg-accent/30 transition-colors">
        <h2 className="font-bold text-xl leading-tight truncate px-0.5">Team space</h2>
      </div>

      {/* Create Channel Action */}
      <div className="px-3 pt-4 pb-2">
        <motion.button
          onClick={() => setCreateOpen(true)}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 px-3 h-11 bg-primary/10 hover:bg-primary/15 border border-primary/20 hover:border-primary/40 text-foreground group transition-all duration-300 relative overflow-hidden rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)]"
        >
          <div className="bg-primary/20 p-1.5 rounded-lg group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Create Channel</span>
          
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.button>
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
                  <div className="flex items-center justify-between px-2 pt-2 pb-1 group">
                    <div className="flex items-center gap-1 cursor-pointer">
                      <ChevronDown className="h-3 w-3 text-muted-foreground/80 shrink-0" />
                      <h3 className="text-xs font-semibold text-muted-foreground/80 hover:text-foreground uppercase tracking-wider select-none">
                        Announcements
                      </h3>
                    </div>
                  </div>
                  <ul className="flex flex-col gap-0.5 mt-1">
                    {announcementChannels.map(renderChannel)}
                  </ul>
                </div>
              )}

              {/* Community Chat Section */}
              <div>
                <div className="flex items-center justify-between px-2 pt-2 pb-1 group">
                  <div className="flex items-center gap-1 cursor-pointer">
                    <ChevronDown className="h-3 w-3 text-muted-foreground/80 shrink-0" />
                    <h3 className="text-xs font-semibold text-muted-foreground/80 hover:text-foreground uppercase tracking-wider select-none">
                      Community Chat
                    </h3>
                  </div>
                </div>
                <ul className="flex flex-col gap-0.5 mt-1">
                  {chatChannels.map(renderChannel)}
                </ul>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Bottom Setting Section */}
      <div className="relative overflow-hidden bg-sidebar/60 border-t border-border/60 shrink-0">
        <div className="noise-bg opacity-[0.02]" />
        <div className="p-3 relative z-10">
          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "var(--color-accent-60)" }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-xl border border-border/40 bg-accent/20 hover:bg-accent/40 hover:border-border/80 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all duration-300 group relative overflow-hidden"
          >
            {/* Glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <motion.div 
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 90 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Settings className="h-[18px] w-[18px] text-muted-foreground group-hover:text-foreground transition-colors" />
            </motion.div>
            
            <span className="text-sm font-semibold tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
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
    </div>
  );
}
