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
  Gem,
  Layers,
  ArrowUpRight,
  GitMerge,
  MoreVertical,
  Plus,
  Globe,
  Lock,
  ExternalLink,
  Settings2,
  LucideGitCommitHorizontal,
  LucideLayersPlus,
  GitGraph,
  Github,
  DraftingCompass,
  Bot,
  Download,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
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
import CreateProjectDialog from "@/modules/project/CreateProjectDialog";
import { DashboardProjects } from "./DashboardProjects";
import RightSidebar from "./RightSidebar";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { CommunitySearchBar } from "@/modules/dashboard/components/SearchBar";
import Image from "next/image";
import { GettingStartedChecklist } from "@/modules/dashboard/components/GettingStartedChecklist";
import { WelcomeDialog } from "@/modules/dashboard/components/WelcomeDialog";
import { GettingStartedCompleteDialog } from "@/modules/dashboard/components/GettingStartedCompleteDialog";

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

export default function DashboardPage() {
  const router = useRouter();
  const { open: isSidebarOpen } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const { user: clerkUser } = useUser();
  const searchParams = useSearchParams();



  const [activeTab, setActiveTab] = useState<"stats" | "projects" | "discover">("stats");
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);





  const [deadlines, setDeadlines] = useState<any[] | null>(null);
  const [events, setEvents] = useState<any[] | null>(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsRefreshing, setCardsRefreshing] = useState(false);

  const fetchCardsData = async (refresh = false) => {
    if (refresh) {
      setCardsRefreshing(true);
    } else {
      setCardsLoading(true);
    }
    try {
      const url = refresh
        ? "/api/dashboard/upcoming-cards?refresh=true"
        : "/api/dashboard/upcoming-cards";
      const res = await fetch(url, { cache: "no-store" });
      const d = await res.json();
      setDeadlines(d.deadlines || []);
      setEvents(d.events || []);
    } catch (err) {
      console.error("Error fetching card data:", err);
    } finally {
      setCardsLoading(false);
      setCardsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCardsData();
  }, []);

  // Queries & Mutations for notifications
  const notifications = useQuery(api.notifications.getMyNotifications);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const progressData = useQuery(api.user.getOnboardingProgress);

  const [extensionInstalled, setExtensionInstalled] = useState(false);

  useEffect(() => {
    const handleExtensionInstalledEvent = () => {
      setExtensionInstalled(true);
    };
    window.addEventListener('mark-extension-installed', handleExtensionInstalledEvent);
    return () => window.removeEventListener('mark-extension-installed', handleExtensionInstalledEvent);
  }, []);

  const completedIds = useMemo(() => [
    ...(progressData?.completedSteps ?? []),
    ...(extensionInstalled ? [7] : [])
  ], [progressData?.completedSteps, extensionInstalled]);

  useEffect(() => {
    if (searchParams.get("tour") === "resume") {
      const stepStr = searchParams.get("step");
      const resumeAfterStr = searchParams.get("resumeAfter");
      const timer = setTimeout(() => {
        if (stepStr) {
          window.dispatchEvent(new CustomEvent("start-quick-tour", { detail: { step: parseInt(stepStr) } }));
        } else if (resumeAfterStr) {
          window.dispatchEvent(new CustomEvent("start-quick-tour", { detail: { resumeAfter: parseInt(resumeAfterStr) } }));
        } else {
          window.dispatchEvent(new CustomEvent("start-quick-tour"));
        }
        window.history.replaceState(null, "", "/dashboard");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Fetch current user details (for GitHub username & account type limits)
  const currentUser = useQuery(api.user.getCurrentUser);
  const isGettingStartedCompleted = currentUser?.gettingstartedcompleted ?? false;
  const githubUsername = currentUser?.githubUsername;
  const updateGithubUsername = useMutation(api.user.updateGithubUsername);
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


  // ------------GITHUB CONNECTION------------------------
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentUser === undefined || clerkUser === undefined) return;
    if (!currentUser || !clerkUser) return;
    if (currentUser.githubUsername) return;

    const syncGithub = async () => {
      await clerkUser.reload();
      const githubAccount = clerkUser.externalAccounts.find(
        (acc) => acc.provider === "github",
      );
      if (
        githubAccount?.username &&
        githubAccount?.verification?.status === "verified"
      ) {
        try {
          await updateGithubUsername({ githubUsername: githubAccount.username });
        } catch (err) {
          console.error("Failed to update GitHub username in Convex:", err);
        }
      }
    };
    syncGithub();
  }, [currentUser, clerkUser, updateGithubUsername]);

  const handleConnectGithub = async () => {
    try {
      const existingGithub = clerkUser?.externalAccounts.find(
        // @ts-ignore
        (acc) => acc.provider === "github",
      );

      if (
        existingGithub &&
        existingGithub.verification?.status !== "verified" &&
        existingGithub.verification?.externalVerificationRedirectURL
      ) {
        window.location.href =
          existingGithub.verification.externalVerificationRedirectURL.toString();
        return;
      }

      const res = await clerkUser?.createExternalAccount({
        strategy: "oauth_github",
        redirectUrl: window.location.href,
      });

      if (res?.verification?.externalVerificationRedirectURL) {
        window.location.href =
          res.verification.externalVerificationRedirectURL.toString();
      }
    } catch (error: any) {
      console.error("❌ Failed to connect GitHub:", error);
      toast.error(
        error?.errors?.[0]?.message ||
        "Something went wrong while connecting GitHub",
      );
    }
  };

  // Combine and sort projects
  const allProjects = [
    ...(ownerProjects?.map((p) => ({ ...p, role: "owned" as const })) ?? []),
    ...(teamProjects?.map((p) => ({ ...p, role: "joined" as const })) ?? []),
  ];

  const sortedProjects = ownerProjects === undefined || teamProjects === undefined
    ? undefined
    : allProjects.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return (
    <div className="w-full bg-background min-h-full text-foreground">
      <WelcomeDialog />
      <GettingStartedCompleteDialog />

      {/* Parent Divided */}
      <main className="flex flex-col w-full">
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          {/* Left Side */}
          <div className="flex-1 min-w-0 flex flex-col gap-6 py-8 pl-8">
            {/* Connect Github */}


            {/* 3 Metric Cards */}
            <div id="tour-metrics" className={cn("grid grid-cols-3 gap-8", isSidebarOpen && "gap-5")}>
              {/* Total Commits Card */}
              <div className="dark:bg-sidebar bg-card border border-border rounded-xl p-4 shadow-md flex items-center justify-between group h-[126px]">
                <div className="flex flex-col justify-between h-full w-full">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm tracking-wide text-primary flex items-center gap-1">
                      Commits
                      <span className=" tracking-tighter"><LucideGitCommitHorizontal /></span>
                    </span>
                  </div>
                  <div className="text-3xl tracking-tight text-foreground mt-1">
                    {currentUser === undefined || isStatsLoading ? (
                      <span className="inline-block h-9 w-20 bg-muted animate-pulse rounded" />
                    ) : !githubUsername ? (
                      <Button id="connect-github-btn" variant='outline' onClick={handleConnectGithub} className="text-xs h-7! px-3! font-medium text-muted-foreground cursor-pointer hover:text-primary transition-all">Connect Now</Button>
                    ) : (
                      <span>{dashboardStats?.totalCommits ?? 0}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground ">
                    Last Year commits
                  </span>
                </div>
                <div className="relative flex items-center justify-center w-16 h-full shrink-0">
                  <LucideGitCommitHorizontal className="" />
                </div>
              </div>

              {/* Merged PR / PR Card */}
              <div className="dark:bg-sidebar bg-card border border-border rounded-xl p-4 shadow-md flex items-center justify-between group h-[126px]">
                <div className="grid grid-cols-2 w-full h-full divide-x divide-accent! ">
                  {/* Left: Pull Request */}
                  <div className="flex flex-col justify-between h-full pr-4">
                    <span className="text-sm text-primary flex items-center gap-1.5">
                      Pull Request
                      <GitPullRequest className="h-3.5 w-3.5" />
                    </span>
                    <div className="text-3xl tracking-tight text-foreground font-sans my-1">
                      {currentUser === undefined || isStatsLoading ? (
                        <span className="inline-block h-9 w-12 bg-muted animate-pulse rounded" />
                      ) : !githubUsername ? (
                        <span className="text-lg font-medium text-muted-foreground">....</span>
                      ) : (
                        <span>{dashboardStats?.totalPRs ?? 0}</span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Total
                    </span>
                  </div>

                  {/* Right: Merged PRs */}
                  <div className="flex flex-col justify-between h-full pl-6">
                    <span className="text-sm  tracking-wide  flex items-center gap-1.5">
                      Merged PRs
                      <GitMerge className="h-3.5 w-3.5" />
                    </span>
                    <div className="text-3xl tracking-tight text-foreground font-sans my-1">
                      {currentUser === undefined || isStatsLoading ? (
                        <span className="inline-block h-9 w-12 bg-muted animate-pulse rounded" />
                      ) : !githubUsername ? (
                        <span className="text-lg font-medium text-muted-foreground">....</span>
                      ) : (
                        <span>{dashboardStats?.totalMergedPRs ?? 0}</span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Merged
                    </span>
                  </div>
                </div>
              </div>

              {/* Projects Joined / Created Card */}
              <div className="dark:bg-sidebar bg-card border border-border rounded-xl p-4 shadow-md flex items-center justify-between group h-[126px] relative">
                {currentUser !== undefined && userPlan !== "pro" && (
                  <div className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-blue-600 dark:bg-blue-500 text-white rounded-full text-xs shadow-sm flex items-center gap-1 border border-blue-400/20 z-10">
                    Unlock Pro Limits
                    <Gem className="size-2.5 fill-white/20" />
                  </div>
                )}

                <div className="grid grid-cols-2 w-full h-full divide-x divide-accent!">
                  {/* Left: Projects Created */}
                  <div className="flex flex-col justify-between h-full pr-4">
                    <span className="text-sm flex items-center gap-1.5">
                      Projects Created
                      <Layers className="h-3.5 w-3.5 " />
                    </span>
                    <div className="text-3xl tracking-tight text-foreground font-sans my-1 flex items-baseline">
                      {ownerProjects === undefined ? (
                        <span className="inline-block h-9 w-12 bg-muted animate-pulse rounded" />
                      ) : (
                        <>
                          <span>{ownerProjects.length}</span>
                          <span className="text-muted-foreground text-lg font-light ml-1.5">/{createLimit}</span>
                        </>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Created
                    </span>
                  </div>

                  {/* Right: Joined */}
                  <div className="flex flex-col justify-between h-full pl-6">
                    <span className="text-sm flex items-center gap-1.5">
                      Joined
                      <ArrowUpRight className="h-3.5 w-3.5 " />
                    </span>
                    <div className="text-3xl tracking-tight text-foreground font-sans my-1 flex items-baseline">
                      {teamProjects === undefined ? (
                        <span className="inline-block h-9 w-12 bg-muted animate-pulse rounded" />
                      ) : (
                        <>
                          <span>{teamProjects.length}</span>
                          <span className="text-muted-foreground text-lg font-light ml-1.5">/{joinLimit}</span>
                        </>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground/60">
                      Joined
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div id="tour-tabs" className="flex items-center gap-2 border-b border-accent pb-px mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("stats")}
                className={cn(
                  "px-4 py-2 text-sm tracking-wide border rounded-t-xl  -mb-px transition-all duration-200  outline-none cursor-pointer",
                  activeTab === "stats"
                    ? "border-b-primary text-foreground bg-muted/80"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                Stats <GitGraph className="inline ml-1 w-4 h-4" />
              </button>
              <button
                id="tour-projects-tab"
                type="button"
                onClick={() => setActiveTab("projects")}
                className={cn(
                  "px-4 py-2 text-sm tracking-wide border rounded-t-xl  -mb-px transition-all duration-200  outline-none cursor-pointer",
                  activeTab === "projects"
                    ? "border-b-primary text-foreground bg-muted/80"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                Projects <LucideLayersPlus className="inline ml-1 w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("discover")}
                className={cn(
                  "px-4 py-2 text-sm tracking-wide border rounded-t-xl  -mb-px transition-all duration-200  outline-none cursor-pointer",
                  activeTab === "discover"
                    ? "border-b-primary text-foreground bg-muted/80"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                Discover <DraftingCompass className="inline ml-1 w-4 h-4" />
              </button>
            </div>

            {/* Tab Content */}
            {/* Stats Tab */}
            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in-50 duration-300", activeTab !== "stats" && "hidden")}>
              {/* Left Side Column: Notifications Card */}
              <div id="tour-getting-started" className="flex flex-col rounded-lg border border-border bg-sidebar shadow-md h-150 overflow-hidden">
                {/* Onboarding Guide Top Section */}
                <GettingStartedChecklist />

                {isGettingStartedCompleted && (
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:bg-muted bg-accent/80 shrink-0">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-primary">Notifications</span>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/10">
                      Total: {notifications?.length ?? 0}
                    </span>
                  </div>
                )}

                {/* Announcements / Notifications List */}
                <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-border custom-scrollbar scrollbar-hide">
                  {notifications === undefined ? (
                    <div className="flex flex-col divide-y divide-border/10">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                          <div className="h-7 w-7 rounded-full bg-muted/40 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 bg-muted/40 rounded w-3/4" />
                            <div className="h-2.5 bg-muted/20 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center gap-3">
                      <Bell className="h-6 w-6 text-muted-foreground/40" />
                      <div>
                        <p className="text-sm font-medium">All caught up!</p>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-[200px]">
                          No new notifications or action items.
                        </p>
                      </div>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const redirectUrl = getNotificationRedirectUrl(notif);
                      return (
                        <div
                          key={notif._id}
                          onClick={() => redirectUrl && router.push(redirectUrl)}
                          className={cn(
                            "group relative flex items-start gap-3 px-4 py-3 transition-colors duration-150 text-left outline-none",
                            notif.isRead
                              ? "hover:bg-accent/15"
                              : "bg-primary/5 hover:bg-primary/10",
                            redirectUrl && "cursor-pointer"
                          )}
                        >
                          {/* Left part: Avatar / Type Icon */}
                          <div className="shrink-0 mt-0.5">
                            {notif.senderAvatar ? (
                              <Avatar className="h-7 w-7 border border-border/20 shadow-sm">
                                <AvatarImage src={notif.senderAvatar} />
                                <AvatarFallback className="text-[10px]">
                                  {notif.senderName?.substring(0, 1).toUpperCase()}
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
                <UpcomingDeadlines
                  deadlines={deadlines}
                  loading={cardsLoading}
                  refreshing={cardsRefreshing}
                  onRefresh={() => fetchCardsData(true)}
                />
                <UpcomingEvents
                  events={events}
                  loading={cardsLoading}
                  refreshing={cardsRefreshing}
                  onRefresh={() => fetchCardsData(true)}
                />
              </div>
            </div>

            {/* Projects Tab */}
            <div className={cn("w-full", activeTab !== "projects" && "hidden")}>
              <DashboardProjects
                projects={sortedProjects}
                isRightSidebarExpanded={isRightSidebarExpanded}
              />
            </div>

            {/* Discover Tab */}
            <div className={cn("w-full space-y-8 animate-in fade-in-50 duration-300", activeTab !== "discover" && "hidden")}>
              <div className="text-center py-6 max-w-2xl mx-auto space-y-3">
                <Image
                  src='/pat106.svg'
                  height="100"
                  width='100'
                  className="flex items-center justify-center mx-auto dark:invert-0 invert"
                  alt="Discover" />
                <h3 className="text-xl font-bold tracking-tight text-foreground/90">
                  Explore Community Creations
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Coming Soon. Build in public and collaborate with others worldwide.
                </p>
                {/* <div className="pt-4">
                  <CommunitySearchBar />
                </div> */}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <RightSidebar
            isRightSidebarExpanded={isRightSidebarExpanded}
            setIsRightSidebarExpanded={setIsRightSidebarExpanded}
          />
        </div>
      </main>
    </div>
  );
}
