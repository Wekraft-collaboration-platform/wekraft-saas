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

    case "member_joined":
    case "member_left":
    case "member_removed":
    case "request_accepted":
    case "request_rejected":
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
}: {
  notif: Doc<"notifications"> & { projectSlug?: string };
  onRead: (id: Id<"notifications">) => void;
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
        "group flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50",
        !notif.isRead && "bg-primary/5 border-l-2 border-l-primary",
      )}
    >
      {/* Avatar / emoji */}
      <div className="relative shrink-0 mt-0.5">
        {notif.senderAvatar ? (
          <Avatar className="h-8 w-8">
            <AvatarImage src={notif.senderAvatar} />
            <AvatarFallback className="text-[10px]">
              {notif.senderName?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-sm">
            {typeEmoji[notif.type] ?? "🔔"}
          </div>
        )}
        {/* Unread dot */}
        {!notif.isRead && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {renderBody(notif.body)}
        </p>
        {notif.entityTitle && (
          <p className="text-[10px] text-primary/70 mt-0.5 truncate">
            ↳ {notif.entityTitle}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground/60 mt-1">
          {timeAgo(notif.createdAt)}
        </p>
      </div>

      {/* Mark‐read hint */}
      {!notif.isRead && (
        <Check className="h-3 w-3 shrink-0 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
      )}
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
          className="relative"
          aria-label="Notifications"
        >
          {unreadCount > 0 ? (
            <BellRing className="h-4 w-4 text-primary animate-[wiggle_0.5s_ease-in-out]" />
          ) : (
            <Bell className="h-4 w-4" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center px-0.5 ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 p-0 rounded-xl shadow-2xl border border-border/80 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] font-medium bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="h-6 w-6"
                onClick={handleMarkAllRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
            {notifications && notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="h-6 w-6 hover:text-destructive"
                onClick={handleClearAll}
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* List */}
        <ScrollArea className="h-[420px]">
          {notifications === undefined ? (
            // Loading skeleton
            <div className="flex flex-col gap-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div className="h-8 w-8 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded animate-pulse w-full" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  No notifications yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/50">
              {notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notif={n}
                  onRead={(id) => markAsRead({ notificationId: id })}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications && notifications.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2 text-center">
              <p className="text-[10px] text-muted-foreground">
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
