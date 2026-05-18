"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Bell, BellRing, Check, CheckCheck, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ─── Utility: human-readable relative time ─────────────────────────────────
function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

// ─── Per-notification icon mapping ─────────────────────────────────────────
const typeEmoji: Record<string, string> = {
  member_joined: "🎉",
  member_left: "👋",
  member_removed: "🚫",
  join_request: "📬",
  request_accepted: "✅",
  request_rejected: "❌",
  role_changed: "🔄",
  mentioned: "💬",
  task_assigned: "📋",
  issue_assigned: "🐛",
  task_completed: "✅",
  sprint_started: "🚀",
  sprint_completed: "🏁",
  critical_issue: "🔴",
};

// ─── Resolve redirect target URL ───────────────────────────────────────────
function getNotificationRedirectUrl(notif: {
  type: string;
  projectSlug?: string;
  body: string;
  entityId?: string;
  entityTitle?: string;
}): string {
  const slug = notif.projectSlug;
  if (!slug) return "/dashboard";

  if (notif.type === "join_request") {
    return `/dashboard/my-projects/${slug}?tab=requests`;
  }

  const workspaceBase = `/dashboard/my-projects/${slug}/workspace`;

  switch (notif.type) {
    case "task_assigned":
    case "task_completed":
      return `${workspaceBase}/tasks`;

    case "issue_assigned":
    case "critical_issue":
      return `${workspaceBase}/issues`;

    case "sprint_started":
    case "sprint_completed":
      return `${workspaceBase}/sprint`;

    case "mentioned":
      const bodyLower = notif.body.toLowerCase();
      if (
        bodyLower.includes("chat") ||
        bodyLower.includes("teamspace") ||
        bodyLower.includes("channel") ||
        bodyLower.includes("#") ||
        (notif.entityTitle && notif.entityTitle.startsWith("#"))
      ) {
        return notif.entityId
          ? `${workspaceBase}/teamspace?channelId=${notif.entityId}`
          : `${workspaceBase}/teamspace`;
      } else if (bodyLower.includes("issue")) {
        return `${workspaceBase}/issues`;
      } else {
        return `${workspaceBase}/tasks`;
      }

    case "request_accepted":
    case "member_joined":
      return workspaceBase;

    case "member_left":
    case "member_removed":
    case "role_changed":
      return `${workspaceBase}/team`;

    default:
      return workspaceBase;
  }
}

// ─── Bold‐markdown renderer (safe, no external deps) ───────────────────────
function renderBody(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <span>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

// ─── Single notification row ────────────────────────────────────────────────
function NotificationItem({
  notif,
  onRead,
  onDelete,
}: {
  notif: Doc<"notifications"> & { projectSlug?: string };
  onRead: (id: Id<"notifications">) => void;
  onDelete: (id: Id<"notifications">) => void;
}) {
  const router = useRouter();

  const handleClick = () => {
    // 1. Mark as read if not already read
    if (!notif.isRead) {
      onRead(notif._id);
    }

    // 2. Perform redirection
    const url = getNotificationRedirectUrl(notif);
    router.push(url);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex items-start gap-3.5 px-4 py-3.5 cursor-pointer transition-all duration-200",
        "border-b border-border/30 last:border-b-0",
        "hover:bg-accent/40 bg-background/5",
        !notif.isRead && "bg-primary/[0.02]"
      )}
    >
      {/* Pulse unread dot indicator (Vercel/Linear Style) */}
      {!notif.isRead && (
        <span className="absolute left-1.5 top-[22px] h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
      )}

      {/* Avatar / emoji */}
      <div className="relative shrink-0 mt-0.5">
        {notif.senderAvatar ? (
          <Avatar className="h-7 w-7 ring-1 ring-border/40 shadow-sm">
            <AvatarImage src={notif.senderAvatar} />
            <AvatarFallback className="text-[9px] font-semibold bg-accent">
              {notif.senderName?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-7 w-7 rounded-full bg-accent/30 border border-border/40 flex items-center justify-center text-xs shadow-sm">
            {typeEmoji[notif.type] ?? "🔔"}
          </div>
        )}
      </div>

      {/* Body & Metadata */}
      <div className="flex-1 min-w-0 pr-12">
        <p className="text-[12.5px] leading-relaxed text-foreground/80 font-normal">
          {renderBody(notif.body)}
        </p>
        {notif.entityTitle && (
          <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono flex items-center gap-1.5">
            <span className="text-[8px] opacity-40">↳</span>
            <span className="truncate bg-muted/65 px-1.5 py-0.5 rounded border border-border/20">
              {notif.entityTitle}
            </span>
          </p>
        )}
        <p className="text-[10px] text-muted-foreground/40 mt-1.5 font-medium">
          {timeAgo(notif.createdAt)}
        </p>
      </div>

      {/* Action panel (Floating on hover - Linear Style) */}
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {/* Mark read button on hover */}
        {!notif.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0 rounded-md border border-border/30 bg-background/80 backdrop-blur-sm text-muted-foreground/60 hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onRead(notif._id);
            }}
            title="Mark as read"
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
        {/* Single delete button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 rounded-md border border-border/30 bg-background/80 backdrop-blur-sm text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notif._id);
          }}
          title="Delete notification"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export function NotificationCenter() {
  const router = useRouter();
  const notifications = useQuery(api.notifications.getMyNotifications);
  const unreadCount = useQuery(api.notifications.getUnreadCount) ?? 0;

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const clearAll = useMutation(api.notifications.clearAll);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  // ── Toast for brand-new notifications ──────────────────────────────────
  const prevIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (!notifications) return;

    if (isInitialLoad.current) {
      // On initial load, just populate existing notification IDs without displaying toasts
      notifications.forEach((n) => {
        prevIds.current.add(n._id);
      });
      isInitialLoad.current = false;
      return;
    }

    // On subsequent updates, display toasts for any new notifications
    notifications.forEach((n) => {
      if (!prevIds.current.has(n._id)) {
        toast(
          <div
            onClick={() => {
              markAsRead({ notificationId: n._id });
              const url = getNotificationRedirectUrl(n);
              router.push(url);
            }}
            className="cursor-pointer w-full h-full"
          >
            {renderBody(n.body)}
          </div>,
          {
            icon: typeEmoji[n.type] ?? "🔔",
            duration: 4000,
          }
        );
        prevIds.current.add(n._id);
      }
    });
  }, [notifications]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="relative h-9 w-9 rounded-lg border-border/40 hover:bg-accent/40"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4 text-primary animate-[wiggle_0.5s_ease-in-out]" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center px-1 ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[360px] p-0 rounded-xl bg-background/95 backdrop-blur-xl border border-border/60 shadow-[0_20px_50px_rgba(0,0,0,0.35)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.65)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/15">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="text-[9px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/10">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
            {notifications && notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                onClick={handleClearAll}
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="h-[400px]">
          {notifications === undefined ? (
            // Loading skeleton (Linear Style)
            <div className="flex flex-col gap-0 divide-y divide-border/20">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3.5 px-4 py-4">
                  <div className="h-7 w-7 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-muted rounded animate-pulse w-full" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted/30 border border-border/20 flex items-center justify-center">
                <Bell className="h-4.5 w-4.5 text-muted-foreground/60" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground/80">All caught up!</p>
                <p className="text-[11px] text-muted-foreground/60">
                  No notifications yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notif={n}
                  onRead={(id) => markAsRead({ notificationId: id })}
                  onDelete={(id) => deleteNotification({ notificationId: id })}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications && notifications.length > 0 && (
          <>
            <Separator className="bg-border/40" />
            <div className="px-4 py-2 text-center bg-muted/5">
              <p className="text-[9px] font-medium tracking-wide text-muted-foreground/60 uppercase">
                Showing last {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""}
              </p>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
