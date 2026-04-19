"use client";

import { useState } from "react";
import { Channel } from "./hooks/useChannels";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { cn } from "@/lib/utils";
import { Hash, Megaphone, Plus, Lock, ChevronDown, MicOff, Headphones, Settings } from "lucide-react";
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
  currentUserId: string;
  currentUserName: string;
  currentUserImage: string | null;
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
  currentUserId,
  currentUserName,
  currentUserImage
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
      <li key={channel.id}>
        <button
          id={`channel-${channel.id}`}
          onClick={() => onSelect(channel)}
          className={cn(
            "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[15px] font-medium transition-all duration-150 group",
            isActive
              ? "bg-accent/60 text-foreground"
              : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5 shrink-0 opacity-70",
              isActive ? color : "group-hover:" + color
            )}
          />
          <span className="truncate leading-tight pl-0.5">{channel.name}</span>
          {channel.type === "announcement" && (
            <Lock className="h-3 w-3 ml-auto shrink-0 opacity-50" />
          )}
        </button>
      </li>
    );
  };

  return (
    <div className="flex flex-col h-full w-60 border-r bg-sidebar shrink-0">
      {/* Server Header */}
      <div className="flex items-center justify-center px-4 py-3.5 border-b border-border/50 shadow-sm cursor-pointer hover:bg-accent/30 transition-colors">
        <h2 className="font-bold text-xl leading-tight truncate px-0.5">Team space</h2>
      </div>

      {/* Create Channel Action */}
      <div className="px-2 pt-4 pb-2">
        <Button
          onClick={() => setCreateOpen(true)}
          variant="outline"
          className="w-full flex items-center justify-center gap-3 px-3 h-10 bg-accent/20 hover:bg-accent/40 border-border/40 text-foreground group transition-all duration-200 relative overflow-hidden shadow-sm"
        >
          <div className="bg-accent/50 p-1 rounded-md group-hover:bg-accent group-hover:scale-105 transition-all">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Create Channel</span>
          <span className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent pointer-events-none" />
        </Button>
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

      {/* Bottom Profile Section */}
      <div className="flex items-center gap-2 p-2 bg-accent/20 border-t shrink-0">
        <button className="flex items-center gap-2 flex-1 min-w-0 hover:bg-accent/40 rounded-md p-1 -ml-1 transition-colors">
          <div className="h-8 w-8 rounded-full bg-accent/50 overflow-hidden shrink-0 flex items-center justify-center">
            {currentUserImage ? (
              <img src={currentUserImage} alt={currentUserName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] uppercase font-bold">{currentUserName.substring(0,2)}</span>
            )}
          </div>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-semibold truncate leading-none mb-1">{currentUserName}</span>
            <span className="text-[10px] text-muted-foreground truncate leading-none">Online</span>
          </div>
        </button>
        <div className="flex items-center shrink-0">
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-md transition-colors">
            <MicOff className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-md transition-colors">
            <Headphones className="h-4 w-4" />
          </button>
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/40 rounded-md transition-colors">
            <Settings className="h-4 w-4" />
          </button>
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
