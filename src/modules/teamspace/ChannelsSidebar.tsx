"use client";

import { useState } from "react";
import { Channel } from "./hooks/useChannels";
import { CreateChannelDialog } from "./CreateChannelDialog";
import { cn } from "@/lib/utils";
import { Hash, Megaphone, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Props {
  channels: Channel[];
  loading: boolean;
  activeChannelId: string | null;
  onSelect: (channel: Channel) => void;
  onCreate: (name: string, description: string, type: "text" | "announcement") => Promise<Channel | undefined>;
}

const channelColors: Record<string, string> = {
  general: "text-emerald-500",
  announcements: "text-amber-500",
  announcement: "text-amber-500",
};

export function ChannelsSidebar({ channels, loading, activeChannelId, onSelect, onCreate }: Props) {
  const [createOpen, setCreateOpen] = useState(false);

  const getChannelColor = (name: string) => {
    return channelColors[name.toLowerCase()] ?? "text-blue-500";
  };

  return (
    <div className="flex flex-col h-full w-56 border-r bg-sidebar shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Channels
        </h3>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => setCreateOpen(true)}
          title="Create channel"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1 px-2 py-2">
        {loading ? (
          <div className="flex flex-col gap-1 px-1">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {channels.map((channel) => {
              const isActive = channel.id === activeChannelId;
              const Icon = channel.type === "announcement" ? Megaphone : Hash;
              const color = getChannelColor(channel.name);

              return (
                <li key={channel.id}>
                  <button
                    id={`channel-${channel.id}`}
                    onClick={() => onSelect(channel)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all duration-150 group",
                      isActive
                        ? "bg-accent text-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-colors",
                        isActive ? color : "text-muted-foreground group-hover:" + color
                      )}
                    />
                    <span className="truncate">{channel.name}</span>
                    {channel.type === "announcement" && (
                      <Lock className="h-2.5 w-2.5 ml-auto shrink-0 opacity-50" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>

      <CreateChannelDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={onCreate}
      />
    </div>
  );
}
