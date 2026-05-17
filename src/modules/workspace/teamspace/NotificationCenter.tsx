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
  onSelectChannel?: (channelId: string, messageId?: string) => void;
}

export function NotificationCenter({ userId, onSelectChannel }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead } = useNotifications(userId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="focus:outline-none relative group active:scale-95 transition-transform duration-150">
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
        className="w-[365px] p-0 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-border/40 overflow-hidden bg-background/90 backdrop-blur-xl rounded-2xl animate-in fade-in-50 zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/40 bg-accent/20">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <div className="relative">
              <Bell className="h-4 w-4 text-blue-500 animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-blue-500 ring-1 ring-background animate-ping" />
              )}
            </div>
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Notifications
            </span>
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              className="h-7 text-[10px] font-medium text-blue-500/90 hover:text-blue-500 hover:bg-blue-500/10 transition-all rounded-md px-2.5 flex items-center gap-1 border border-blue-500/10 hover:border-blue-500/20 active:scale-95"
              onClick={() => markAsRead()}
            >
              <Check className="h-3 w-3" />
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
                    "p-4 border-b border-border/20 cursor-pointer transition-all duration-200 group relative",
                    n.is_read === 0 
                      ? "bg-gradient-to-r from-blue-500/[0.04] to-transparent hover:from-blue-500/[0.08]" 
                      : "hover:bg-accent/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
                    "hover:-translate-y-[1px] select-none"
                  )}
                  onClick={() => {
                    markAsRead(n.id);
                    if (onSelectChannel && n.channel_id) {
                      onSelectChannel(n.channel_id, n.message_id);
                    }
                  }}
                >
                  {/* Glowing vertical left bar for unreads */}
                  {n.is_read === 0 && (
                    <div className="absolute left-0 top-[15%] h-[70%] w-[3px] rounded-r-md bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                  )}
                  
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      <Avatar className={cn(
                        "h-9 w-9 border shrink-0 transition-transform duration-200 group-hover:scale-105",
                        n.is_read === 0 ? "border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.15)]" : "border-border/60"
                      )}>
                        <AvatarImage src={n.sender_image || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500/10 to-blue-500/20 text-blue-600 text-xs font-bold dark:text-blue-400">
                          {n.sender_name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {n.is_read === 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-background shadow-[0_0_6px_#3b82f6] animate-pulse" />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs text-foreground tracking-tight max-w-[130px] truncate">
                          {n.sender_name}
                        </span>
                        <span className="text-[11px] text-muted-foreground/90">
                          mentioned you in
                        </span>
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-500/8 dark:bg-blue-500/15 px-2 py-0.5 rounded-full border border-blue-500/20 transition-all hover:bg-blue-500/25">
                          #{n.channel_name || "channel"}
                        </span>
                      </div>
                      
                      {n.content && (
                        <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed bg-accent/25 dark:bg-accent/15 border-l-2 border-primary/20 pl-2.5 py-1.5 rounded-r-md italic mt-1 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.02)]">
                          "{n.content}"
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(n.created_at, {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <span className="text-[10px] text-blue-500/70 font-semibold flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                          <MessageSquare className="h-3 w-3" />
                          <span>Jump to message</span>
                          <span className="transform translate-x-0 group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {n.is_read === 0 && (
                    <div className="absolute top-4 right-4 flex items-center justify-center h-6 w-6 z-10">
                      {/* Check button appearing on hover */}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded-full absolute scale-0 group-hover:scale-100 hover:bg-blue-500/20 hover:text-blue-500 text-blue-500/70 transition-all duration-200 flex items-center justify-center border border-blue-500/10 bg-background/95 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:rotate-12"
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
        <div className="p-2 border-t border-border/40 bg-accent/5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-[11px] h-8 font-medium text-muted-foreground hover:text-foreground active:scale-98 transition-transform duration-100"
          >
            View all activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
