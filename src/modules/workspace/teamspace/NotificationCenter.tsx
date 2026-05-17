"use client";

import { Bell, Check, MessageSquare, AtSign, Clock } from "lucide-react";
import { useNotifications } from "./hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
  userId: string;
  onSelectChannel?: (channelId: string) => void;
}

export function NotificationCenter({ userId, onSelectChannel }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead } = useNotifications(userId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="focus:outline-none relative group">
          <Bell className="h-5 w-5 hover:text-foreground cursor-pointer transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in duration-300">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 shadow-2xl border-border/40 overflow-hidden bg-background/95 backdrop-blur-xl rounded-xl"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-accent/30">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-500" />
            Notifications
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="h-7 text-[10px] hover:bg-blue-500/10 hover:text-blue-500 transition-colors"
              onClick={() => markAsRead()}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-accent/50 flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                All caught up!
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                You'll see mentions and activity here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "p-4 border-b border-border/30 hover:bg-accent/40 cursor-pointer transition-colors group relative",
                    n.is_read === 0 && "bg-blue-500/5",
                  )}
                  onClick={() => {
                    markAsRead(n.id);
                    if (onSelectChannel && n.channel_id) {
                      onSelectChannel(n.channel_id);
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9 border border-border/50 shrink-0">
                      <AvatarImage src={n.sender_image || undefined} />
                      <AvatarFallback className="bg-blue-500/10 text-blue-500 text-xs font-bold">
                        {n.sender_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-foreground truncate max-w-[120px]">
                          {n.sender_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          mentioned you in
                        </span>
                        <span className="text-[10px] font-semibold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-md hover:bg-blue-500/20 transition-colors">
                          #{n.channel_name || "channel"}
                        </span>
                      </div>
                      {n.content && (
                        <p className="text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed bg-accent/20 p-2 rounded-md italic">
                          "{n.content}"
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(n.created_at, {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="text-[10px] text-blue-500/70 font-medium flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Chat
                        </span>
                      </div>
                    </div>
                  </div>
                  {n.is_read === 0 && (
                    <div className="absolute top-4 right-4 flex items-center justify-center h-6 w-6">
                      {/* Default blue dot, hidden when check button is hovered */}
                      <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:scale-0 transition-transform duration-200" />
                      
                      {/* Check button appearing on hover */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded-full absolute scale-0 group-hover:scale-100 hover:bg-blue-500/20 hover:text-blue-500 text-blue-500/70 transition-all duration-200 flex items-center justify-center border border-blue-500/10 bg-background/95 backdrop-blur-md shadow-sm"
                        title="Mark as read"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border/50 bg-accent/10">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[11px] h-8 font-medium text-muted-foreground hover:text-foreground"
          >
            View all activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
