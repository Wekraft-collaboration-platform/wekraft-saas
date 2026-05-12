"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useQuery as useConvexQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSidebar } from "@/components/ui/sidebar";
import { getDashboardStats } from "@/modules/dashboard/action/action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ChartNoAxesColumn,
  FolderSearch,
  Plus,
  Layers2,
  LucideGem,
  LucideGitCommit,
  LucideGitPullRequest,
  LucideGitPullRequestArrow,
  LucideLayers2,
  Merge,
  Waypoints,
  SlidersHorizontal,
  Layers3,
  Github,
  Loader2,
} from "lucide-react";
import { ProjectCards } from "./ProjectCards";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveUserPlan, getPlanLimits } from "../../../../convex/pricing";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ContributionGraph from "@/modules/dashboard/components/ContributionGraph";
import {
  PieChartVariant1,
  ScoreDetailsDialog,
} from "@/modules/dashboard/components/PieChart";
import { GitHubStats } from "@/modules/dashboard/components/StaticContent";
import CreateProjectDialog from "@/modules/project/CreateProjectDialog";

export default function DashboardPage() {
  const user = useConvexQuery(api.user.getCurrentUser);
  const userProjects = useConvexQuery(api.project.getUserProjects);
  const { user: clerkUser } = useUser();
  const updateGithubUsername = useMutation(api.user.updateGithubUsername);
  const { open: sidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState("stats");
  const hasCheckedGithub = useRef(false);

  useEffect(() => {
    if (!user || !clerkUser) return;
    if (user.githubUsername) return;
    if (hasCheckedGithub.current) return;
    hasCheckedGithub.current = true;

    const reloadAndCheck = async () => {
      await clerkUser.reload();

      const githubAccount = clerkUser.externalAccounts.find(
        (acc) => acc.provider === "github",
      );

      // Show error if verification failed
      if (githubAccount?.verification?.status === "failed") {
        toast.error(
          (githubAccount.verification as any)?.error?.longMessage ||
            "This GitHub account is already linked to another user.",
        );
        return;
      }

      if (
        githubAccount?.username &&
        githubAccount?.verification?.status === "verified"
      ) {
        console.log("🚀 Calling mutation with:", githubAccount.username);
        updateGithubUsername({ githubUsername: githubAccount.username });
      }
    };

    reloadAndCheck();
  }, [user, clerkUser, updateGithubUsername]);

  const handleConnectGithub = async () => {
    try {
      const existingGithub = clerkUser?.externalAccounts.find(
        (acc) => acc.provider === "github",
      );

      if (
        existingGithub &&
        existingGithub.verification?.status !== "verified" &&
        existingGithub.verification?.externalVerificationRedirectURL
      ) {
        console.log("Account unverified, redirecting to finish OAuth...");
        window.location.href =
          existingGithub.verification.externalVerificationRedirectURL.toString();
        return;
      }

      // No github account yet — create one
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

  const activePlan = user ? getActiveUserPlan(user as any) : "free";
  const limits = user ? getPlanLimits(user as any) : null;
  const showUpgrade =
    !!user && (activePlan === "free" || activePlan === "plus");

  // Query 1 : dashboardStats
  const {
    data: dashboardStats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardStats", user?.githubUsername],
    queryFn: () => getDashboardStats(user?.githubUsername || ""),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!user?.githubUsername,
  });

  return (
    <div className="w-full h-full p-6 2xl:py-7 2xl:px-10">
      <div className="px-4 flex items-center gap-8">
        {user && !user.githubUsername && (
          <>
            <h1 className="text-sm tracking-tight ">
              It seems you havent connected your github account yet?
            </h1>
            <Button
              onClick={handleConnectGithub}
              size="sm"
              variant="default"
              className="gap-2"
            >
              <Github className="h-4 w-4" /> Connect GitHub
            </Button>
          </>
        )}
      </div>

      {/* =========CARDS============ */}
      <div className="grid grid-cols-3 gap-10 w-full my-5 px-8 font-sans">
        {/* COMMIT */}
        <Card className="bg-linear-to-br from-accent/90 to-transparent dark:to-black  min-w-[260px] ">
          <CardHeader>
            <CardTitle className="font-medium ">
              Commits <LucideGitCommit className="h-5 w-5 inline ml-1" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between -mt-1">
              {!user?.githubUsername ? (
                <div className="w-full text-center">
                  <span className="text-sm font-medium text-destructive/80">
                    GitHub not connected!
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col">
                    <div className="text-2xl font-semibold">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        (dashboardStats?.totalCommits ?? 0)
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last Year commits
                    </p>
                  </div>
                  <Separator orientation="vertical" className="mx-2" />
                  <LucideGitCommit className="h-10 w-10" />
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TOTAL PR*/}
        <Card className="bg-linear-to-br from-accent/90 to-transparent dark:to-black  min-w-[260px]">
          <CardHeader>
            <CardTitle className="flex items-center font-medium justify-between">
              <p>
                Pull Request{" "}
                <LucideGitPullRequest className="h-5 w-5 inline ml-1" />
              </p>
              <p>
                Merged PRs{" "}
                <LucideGitPullRequestArrow className="h-5 w-5 inline ml-1" />
              </p>{" "}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between -mt-1">
              {!user?.githubUsername ? (
                <div className="w-full text-center">
                  <span className="text-sm font-medium text-destructive/80">
                    GitHub not connected!
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col">
                    <div className="text-2xl font-semibold">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        (dashboardStats?.totalPRs ?? 0)
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Total PRs</p>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="mx-2 h-10! bg-accent"
                  />
                  <div className="flex flex-col">
                    <div className="text-2xl font-semibold">
                      {isLoading ? (
                        <Skeleton className="h-8 w-16" />
                      ) : (
                        (dashboardStats?.totalMergedPRs ?? 0)
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">Merged PRs</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="relative  min-w-[260px] bg-linear-to-br from-accent/90 to-transparent dark:to-black">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <p>
                Projects Created{" "}
                <LucideLayers2 className="h-5 w-5 inline ml-1" />
              </p>
              <p>
                Joined <Merge className="h-5 w-5 inline ml-1" />
              </p>{" "}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-4 -mt-2">
              <div className="flex items-center justify-between px-4">
                <div className="flex flex-col space-y-1">
                  <div className="text-3xl font-semibold flex items-baseline gap-1">
                    {isLoading ? (
                      <Skeleton className="h-9 w-16" />
                    ) : (
                      <>
                        1
                        <span className="text-sm font-medium text-muted-foreground/60">
                          / {limits?.project_creation_limit || 2}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <Separator
                  orientation="vertical"
                  className="mx-2 h-10! bg-accent"
                />

                <div className="flex flex-col space-y-1 text-right">
                  <div className="text-3xl font-semibold flex items-baseline justify-end gap-1">
                    {isLoading ? (
                      <Skeleton className="h-9 w-16" />
                    ) : (
                      <>
                        1
                        <span className="text-sm font-medium text-muted-foreground/60">
                          / {limits?.project_joining_limit || 2}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {showUpgrade && (
              <div className="absolute -top-4 left-0 bg-blue-500/70 py-0.5 px-2 rounded-full border">
                <p className="text-[13px] text-neutral-200">
                  Unlock Pro Limits
                  <LucideGem className="h-4 w-4 inline ml-1" />
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ============TABS========= */}
      <div className="my-10 flex flex-col">
        <div className="flex gap-6 px-10">
          <Button
            size="sm"
            className="px-10"
            variant={activeTab === "stats" ? "default" : "outline"}
            onClick={() => setActiveTab("stats")}
          >
            Stats <ChartNoAxesColumn className="h-5 w-5 inline ml-1" />
          </Button>
          {/* Community feature disabled for now */}
          {/* <Button
            size="sm"
            className="px-10"
            variant={activeTab === "discover" ? "default" : "outline"}
            onClick={() => setActiveTab("discover")}
          >
            Discover <FolderSearch className="h-5 w-5 inline ml-1" />
          </Button> */}
          <Button
            size="sm"
            variant={activeTab === "projects" ? "default" : "outline"}
            onClick={() => setActiveTab("projects")}
          >
            Projects <Layers2 className="h-5 w-5 inline ml-1" />
          </Button>
        </div>
        <Separator className="max-w-[80%] mx-auto my-5" />
        <div>
          {activeTab === "stats" && (
            <div className="space-y-10">
              <div
                className={cn(
                  "grid transition-all duration-150 ",
                  sidebarOpen
                    ? "grid-cols-[minmax(0,1fr)_320px] gap-5 2xl:gap-10"
                    : "grid-cols-[minmax(0,1fr)_360px] gap-10 2xl:gap-14",
                )}
              >
                {/* Left */}
                <Card className="p-4 bg-linear-to-b from-accent/5 to-transparent dark:to-black">
                  <CardContent className="pt-6 h-full flex items-center justify-center min-h-[200px]">
                    {!user?.githubUsername ? (
                      <div className="flex flex-col items-center gap-2">
                        <Github className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                          No contribution data available
                        </p>
                      </div>
                    ) : isLoading ? (
                      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
                        <Loader2 className="animate-spin" />
                      </div>
                    ) : (
                      <ContributionGraph />
                    )}
                  </CardContent>
                </Card>

                {/* Right */}
                <div className="w-full">
                  {user?.githubUsername ? (
                    dashboardStats ? (
                      <Card className="p-2 bg-linear-to-b from-accent/5 to-transparent dark:to-black">
                        <CardContent>
                          <PieChartVariant1 stats={dashboardStats} />
                          <ScoreDetailsDialog stats={dashboardStats}>
                            <p className="text-center text-[11px] mt-1.5 border py-1.5 px-4 rounded-md mx-auto w-fit text-muted-foreground hover:bg-accent cursor-pointer transition-colors">
                              View Stats{" "}
                              <Waypoints className="h-3 w-3 inline ml-1" />
                            </p>
                          </ScoreDetailsDialog>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="w-full border rounded-xl h-66 flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin" />
                      </div>
                    )
                  ) : (
                    <Card className="p-2 bg-linear-to-b from-accent/5 to-transparent dark:to-black h-full flex items-center justify-center min-h-[260px]">
                      <CardContent className="flex flex-col items-center gap-2">
                        <div className="flex flex-col items-center gap-2">
                          <Github className="h-8 w-8 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">
                            Github not Connected
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Notification */}
              {/* Recent activity + changelog + limits and to upgrade */}
              {/* New comer ->
              1. discover community and join any project
              2. complete your user profile
              3. invite your teamate to your project.
              4. make your first todo.
              5. install extension in your ide
               */}
              <div className="w-full max-w-[90%] mx-auto">
                <Card>
                  <CardHeader className="flex justify-between px-6">
                    <CardTitle>Recent Activity</CardTitle>
                    <CardTitle>Usage & Limits</CardTitle>
                  </CardHeader>
                  <CardContent></CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "projects" && (
            <div className="px-6 pb-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    My Projects <Layers2 className="h-6 w-6 text-primary" />
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage and overview your active development workspaces.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant={"outline"}
                    className="gap-2 text-xs"
                  >
                    <Layers3 className="h-4 w-4" /> View All Projects
                  </Button>

                  <CreateProjectDialog
                    trigger={
                      <Button size="sm" className="gap-2 text-xs">
                        <Plus className="h-4 w-4" /> New Project
                      </Button>
                    }
                  />
                </div>
              </div>
              <ProjectCards projects={userProjects} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
