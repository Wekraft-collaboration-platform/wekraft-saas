"use client";

import { useQuery as useReactQuery } from "@tanstack/react-query";
import { useMutation, useQuery } from "convex/react";
import {
  Bell,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Compass,
  FolderCode,
  FolderKanban,
  GitCommit,
  GitPullRequest,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getNotificationRedirectUrl,
  NOTIFICATION_ICONS,
  renderNotificationBody,
} from "@/lib/static-store";
import { cn } from "@/lib/utils";
import { getDashboardStats } from "@/modules/dashboard/action/action";
import { UpcomingDeadlines } from "@/modules/dashboard/components/UpcomingDeadlines";
import { UpcomingEvents } from "@/modules/dashboard/components/UpcomingEvents";
import { api } from "../../../../convex/_generated/api";
import { useSidebar } from "@/components/ui/sidebar";

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

// Onboarding Steps Checklist Data
interface Step {
  id: number;
  text: string;
}

const STATIC_STEPS: Step[] = [
  { id: 1, text: "Connect GitHub if not!" },
  { id: 2, text: "Connect repo to your project" },
  { id: 3, text: "Invite teammates" },
  { id: 4, text: "Make a project deadline" },
  { id: 5, text: "Create first task!" },
  { id: 6, text: "Download extension" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { open: isSidebarOpen } = useSidebar();

  const [activeTab, setActiveTab] = useState<"stats" | "projects">("stats");
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);

  // Queries & Mutations for notifications
  const notifications = useQuery(api.notifications.getMyNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  // Fetch current user details (for GitHub username & account type limits)
  const currentUser = useQuery(api.user.getCurrentUser);
  const githubUsername = currentUser?.githubUsername;
  const userPlan = currentUser?.accountType || "free";
  const createLimit = userPlan === "pro" ? 20 : userPlan === "plus" ? 10 : 2;
  const joinLimit = userPlan === "pro" ? 20 : userPlan === "plus" ? 10 : 2;

  // React query for git stats
  const { data: dashboardStats, isLoading: isStatsLoading } = useReactQuery({
    queryKey: ["dashboardStats", githubUsername],
    queryFn: () => getDashboardStats(githubUsername || ""),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!githubUsername,
  });

  // Fetch projects counts
  const ownerProjects = useQuery(api.project.getUserProjects);
  const teamProjects = useQuery(api.project.getJoinedProjects);

  // Dynamic interactive checklist state (starts with first two items completed)
  const [completedSteps, setCompletedSteps] = useState<number[]>([1, 2]);

  const toggleStep = (id: number) => {
    setCompletedSteps((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const activeCount = completedSteps.length;
  const progressPercent = Math.round((activeCount / STATIC_STEPS.length) * 100);

  return (
    <div className="w-full bg-background min-h-full text-foreground">
      {/* Parent Divided */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Left Side */}
        <div className="flex-1 min-w-0 flex flex-col gap-6 py-6 pl-6">
          {/* 3 Metric Cards */}
          <div className={cn("grid grid-cols-3 gap-8", isSidebarOpen && "gap-5")}>
            {/* Total Commits Card */}
            <div className="dark:bg-sidebar bg-card border border-border rounded-xl p-4 shadow-md flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground ">
                  Total Commits
                </span>
                <div className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5 font-sans">
                  {currentUser === undefined || isStatsLoading ? (
                    <span className="h-6 w-12 bg-muted animate-pulse rounded" />
                  ) : !githubUsername ? (
                    <span className="text-xs font-medium text-muted-foreground/60">
                      Not Connected
                    </span>
                  ) : (
                    <span>{dashboardStats?.totalCommits ?? 0}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground block">
                  Synced contributions
                </span>
              </div>
              <div className="h-9 w-9 rounded-md bg-primary/5 border border-primary/10 flex items-center justify-center text-primary ">
                <GitCommit className="h-5 w-5" />
              </div>
            </div>

            {/* Merged PR / PR Card */}
            <div className="bg-sidebar border border-border/80 rounded-xl p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md flex items-center justify-between group">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/85">
                  Merged PR / PR
                </span>
                <div className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5 font-sans">
                  {currentUser === undefined || isStatsLoading ? (
                    <span className="h-6 w-16 bg-muted animate-pulse rounded" />
                  ) : !githubUsername ? (
                    <span className="text-xs font-medium text-muted-foreground/60">
                      Not Connected
                    </span>
                  ) : (
                    <span>
                      {dashboardStats?.totalMergedPRs ?? 0}
                      <span className="text-muted-foreground/40 font-light mx-1">
                        /
                      </span>
                      {dashboardStats?.totalPRs ?? 0}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground/60 block">
                  Pull request statistics
                </span>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <GitPullRequest className="h-5 w-5" />
              </div>
            </div>

            {/* Projects Joined / Created Card */}
            <div className="bg-sidebar border border-border/80 rounded-xl p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md flex items-center justify-between group">
              <div className="space-y-2 flex-1 pr-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/85 block">
                  Projects (Joined / Created)
                </span>

                <div className="flex items-center gap-4">
                  {/* Joined column */}
                  <div>
                    <div className="text-xl font-bold tracking-tight text-foreground font-sans">
                      {teamProjects === undefined ? (
                        <span className="inline-block h-6 w-8 bg-muted animate-pulse rounded" />
                      ) : (
                        <span>
                          {teamProjects.length}
                          <span className="text-xs text-muted-foreground/50 font-normal ml-0.5">
                            /{joinLimit}
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 block">
                      Joined
                    </span>
                  </div>

                  {/* Divider line */}
                  <div className="h-6 w-px bg-border/60 self-center" />

                  {/* Created column */}
                  <div>
                    <div className="text-xl font-bold tracking-tight text-foreground font-sans">
                      {ownerProjects === undefined ? (
                        <span className="inline-block h-6 w-8 bg-muted animate-pulse rounded" />
                      ) : (
                        <span>
                          {ownerProjects.length}
                          <span className="text-xs text-muted-foreground/50 font-normal ml-0.5">
                            /{createLimit}
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 block">
                      Created
                    </span>
                  </div>
                </div>

                {/* <span className="text-[9px] text-muted-foreground/50 uppercase font-semibold tracking-wider block">
                  Plan:{" "}
                  <span className="text-primary font-bold">{userPlan}</span>
                </span> */}
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shrink-0 self-center">
                <FolderCode className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-2 border-b border-border pb-px">
            <button
              type="button"
              onClick={() => setActiveTab("stats")}
              className={cn(
                "px-4 py-2 text-xs font-semibold tracking-wide border-b-2 -mb-px transition-all duration-200 uppercase outline-none",
                activeTab === "stats"
                  ? "border-primary text-foreground font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Stats
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("projects")}
              className={cn(
                "px-4 py-2 text-xs font-semibold tracking-wide border-b-2 -mb-px transition-all duration-200 uppercase outline-none",
                activeTab === "projects"
                  ? "border-primary text-foreground font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Projects
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "stats" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Side Column: Notifications Card */}
              <div className="flex flex-col rounded-lg border border-border bg-sidebar shadow-md h-150 overflow-hidden">
                {/* Onboarding Guide Top Section */}
                <div className="p-5 border-b border-border/40 bg-muted/10 shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-medium text-muted-foreground flex items-center gap-1.5">
                      <Compass className="h-4 w-4 text-primary" />
                      Getting Started
                    </h3>
                    <span className="text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {activeCount} of {STATIC_STEPS.length} completed
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-muted/50 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-linear-to-r from-primary to-blue-500 transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {/* Checklist Items */}
                  <div className="grid grid-cols-1 gap-2.5">
                    {STATIC_STEPS.map((step) => {
                      const isCompleted = completedSteps.includes(step.id);
                      return (
                        <button
                          key={step.id}
                          type="button"
                          onClick={() => toggleStep(step.id)}
                          className="flex items-center gap-3 text-left w-full group py-0.5 outline-none"
                        >
                          <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">
                            {isCompleted ? (
                              <CheckCircle2 className="h-4.5 w-4.5 text-primary fill-primary/10" />
                            ) : (
                              <Circle className="h-4.5 w-4.5 text-muted-foreground/45 group-hover:text-muted-foreground/75" />
                            )}
                          </span>
                          <span
                            className={cn(
                              "text-[12.5px] transition-all duration-200 tracking-wide font-normal",
                              isCompleted
                                ? "text-muted-foreground/70 line-through decoration-muted-foreground/60"
                                : "text-foreground group-hover:text-foreground",
                            )}
                          >
                            {step.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notifications Feed Header */}
                <div className="px-4 py-2.5 border-b border-border bg-muted shrink-0 flex items-center justify-between">
                  <h3 className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Bell className="h-3.5 w-3.5 text-primary" />
                    Recent Notifications
                  </h3>
                  {notifications &&
                    notifications.filter((n) => !n.isRead).length > 0 && (
                      <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/10">
                        {notifications.filter((n) => !n.isRead).length} Unread
                      </span>
                    )}
                </div>

                {/* Scrollable Notifications list */}
                <div className="flex-1 overflow-y-auto divide-y divide-border/20 custom-scrollbar">
                  {notifications === undefined ? (
                    // Loading Skeleton
                    <div className="flex flex-col divide-y divide-border/10">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 px-4 py-2.5 animate-pulse"
                        >
                          <div className="h-7 w-7 rounded-full bg-muted/40 shrink-0" />
                          <div className="flex-1 space-y-2.5">
                            <div className="h-3 bg-muted/40 rounded w-full" />
                            <div className="h-2.5 bg-muted/20 rounded w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
                      <div className="h-10 w-10 rounded-full bg-muted/20 border border-border/25 flex items-center justify-center mb-3">
                        <Bell className="h-5 w-5 text-muted-foreground/45" />
                      </div>
                      <p className="text-xs font-medium text-foreground/75">
                        All caught up!
                      </p>
                      <p className="text-[11px] text-muted-foreground/60 mt-1 max-w-50">
                        You have no recent notifications or announcements.
                      </p>
                    </div>
                  ) : (
                    // Notifications items (Linear Style, Minimal light texts)
                    notifications.map((notif) => {
                      const redirectUrl = getNotificationRedirectUrl(notif);
                      return (
                        <div
                          key={notif._id}
                          onClick={() => {
                            if (!notif.isRead) {
                              markAsRead({ notificationId: notif._id });
                            }
                            router.push(redirectUrl);
                          }}
                          className={cn(
                            "group relative flex items-start gap-3 px-4 py-2 cursor-pointer transition-all duration-200",
                            "hover:bg-accent/30",
                            !notif.isRead && "bg-primary/[0.015]",
                          )}
                        >
                          {/* Avatar or Event Emoji */}
                          <div className="relative shrink-0 mt-0.5">
                            {notif.senderAvatar ? (
                              <Avatar className="h-7 w-7 ring-1 ring-border/20 shadow-sm">
                                <AvatarImage src={notif.senderAvatar} />
                                <AvatarFallback className="text-[9px] font-semibold bg-accent text-accent-foreground">
                                  {notif.senderName?.[0]?.toUpperCase() ?? "?"}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-7 w-7 rounded-full bg-accent/20 border border-border/20 flex items-center justify-center text-xs shadow-sm">
                                {(() => {
                                  const IconComponent =
                                    NOTIFICATION_ICONS[notif.type] ?? Bell;
                                  return (
                                    <IconComponent className="h-3.5 w-3.5 text-muted-foreground/80" />
                                  );
                                })()}
                              </div>
                            )}
                          </div>

                          {/* Content details */}
                          <div className="flex-1 min-w-0 pr-12">
                            <div className="flex items-center justify-between">
                              {notif.projectName && (
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-primary/80 bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 tracking-wide">
                                    <FolderKanban className="h-2.5 w-2.5 shrink-0" />
                                    <span className="truncate max-w-[150px]">
                                      {notif.projectName}
                                    </span>
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <Clock className="h-3 w-3 shrink-0" />
                                <span>{timeAgo(notif.createdAt)}</span>
                              </div>
                            </div>

                            <p className="text-[12px] leading-relaxed text-muted-foreground/90 font-normal">
                              {renderNotificationBody(notif.body)}
                            </p>
                          </div>

                          {/* Floating actions */}
                          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150">
                            {!notif.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6.5 w-6.5 p-0 rounded-md border border-border/30 bg-background text-muted-foreground/60 hover:text-primary hover:bg-primary/10 hover:border-primary/20 shadow-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead({ notificationId: notif._id });
                                }}
                                title="Mark as read"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6.5 w-6.5 p-0 rounded-md border border-border/30 bg-background text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20 shadow-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification({
                                  notificationId: notif._id,
                                });
                              }}
                              title="Delete notification"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Middle Column: Upcoming Deadlines & Upcoming Events */}
              <div className="flex flex-col gap-6 h-150">
                <UpcomingDeadlines />
                <UpcomingEvents />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border border-border border-dashed rounded-xl bg-sidebar text-center h-[350px] transition-all">
              <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 animate-bounce">
                <FolderCode className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-foreground tracking-tight">
                Projects Workspace
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
                This tab is dedicated to managing and exploring your projects.
                Detailed features will be implemented here soon.
              </p>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div
          className={cn(
            "relative transition-all duration-300 ease-in-out shrink-0 w-full lg:self-stretch lg:min-h-screen",
            isRightSidebarExpanded ? "lg:w-80" : "lg:w-14",
          )}
        >
          <button
            type="button"
            onClick={() => setIsRightSidebarExpanded(!isRightSidebarExpanded)}
            className="w-5 h-14 bg-primary hover:bg-primary/95 text-primary-foreground absolute top-[44%] -left-2.5 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-all duration-200 z-20 focus:outline-none focus:ring-1 focus:ring-primary/50"
            aria-label={
              isRightSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
            }
          >
            {isRightSidebarExpanded ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>

          <div
            className={cn(
              "flex flex-col h-full min-h-screen items-center justify-center border border-border bg-card dark:bg-sidebar rounded text-center text-muted-foreground/50 text-xs transition-all duration-300",
              isRightSidebarExpanded ? "p-4" : "p-1",
            )}
          >
            {isRightSidebarExpanded && (
              <span className="px-2 transition-opacity duration-300">
                user account, cloud storage &amp; usage: this will come here
                future todo
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
