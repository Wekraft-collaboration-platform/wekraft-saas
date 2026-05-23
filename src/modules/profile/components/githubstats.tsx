"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQuery as useConvexQuery } from "convex/react";
import {
  Github,
  Layers2,
  Loader2,
  LucideGitCommit,
  LucideGitPullRequest,
  Waypoints,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats } from "@/modules/dashboard/action/action";
import ContributionGraph from "@/modules/dashboard/components/ContributionGraph";
import {
  PieChartVariant1,
  ScoreDetailsDialog,
} from "@/modules/dashboard/components/PieChart";

export function GithubStats() {
  const user = useConvexQuery(api.user.getCurrentUser);
  const { user: clerkUser } = useUser();
  const updateGithubUsername = useMutation(api.user.updateGithubUsername);
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
      toast.error(
        error?.errors?.[0]?.message ||
        "Something went wrong while connecting GitHub",
      );
    }
  };

  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["dashboardStats", user?.githubUsername],
    queryFn: () => getDashboardStats(user?.githubUsername || ""),
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!user?.githubUsername,
  });

  return (
    <div className="w-full space-y-6">
      {/* GitHub connection banner */}
      <div className="px-4 flex items-center gap-8">
        {user && !user.githubUsername && (
          <>
            <h1 className="text-sm tracking-tight text-muted-foreground">
              It seems you haven't connected your GitHub account yet?
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

      {/* Grid: Left side Impact Score, Right side 4 Boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 px-4">
        {/* Left Column: Impact Score */}
        <Card className="bg-sidebar border border-border shadow-md flex flex-col justify-between p-4">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Impact Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col items-center justify-center flex-1 py-2">
            {!user?.githubUsername ? (
              <div className="flex flex-col items-center gap-2 text-center py-8">
                <Github className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-destructive/80">
                  GitHub not connected
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-48">
                <Loader2 className="animate-spin text-primary h-8 w-8" />
              </div>
            ) : dashboardStats ? (
              <div className="w-full flex flex-col items-center">
                <PieChartVariant1 stats={dashboardStats} />
                <div className="mt-4 w-full flex justify-center">
                  <ScoreDetailsDialog stats={dashboardStats}>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5 shadow-sm hover:bg-accent">
                      View Stats <Waypoints className="h-3 w-3" />
                    </Button>
                  </ScoreDetailsDialog>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48">
                <p className="text-sm text-muted-foreground">Unable to fetch score</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: 4 KPI Boxes in 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Commits Box */}
          <Card className="bg-sidebar border border-border shadow-sm hover:shadow-md transition-shadow p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-1.5">
              <CardTitle className="text-xs font-medium text-muted-foreground">Commits</CardTitle>
              <LucideGitCommit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-1">
              {!user?.githubUsername ? (
                <div className="text-xs font-medium text-destructive/80 py-1">Not connected</div>
              ) : isLoading ? (
                <Skeleton className="h-6 w-16 mt-1" />
              ) : (
                <div className="flex flex-col">
                  <span className="text-xl font-bold font-sans tracking-tight text-foreground">{dashboardStats?.totalCommits ?? 0}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Last Year commits</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pull Requests (PR / Merged) Box */}
          <Card className="bg-sidebar border border-border shadow-sm hover:shadow-md transition-shadow p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-1.5">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pull Requests</CardTitle>
              <LucideGitPullRequest className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-1">
              {!user?.githubUsername ? (
                <div className="text-xs font-medium text-destructive/80 py-1">Not connected</div>
              ) : isLoading ? (
                <Skeleton className="h-6 w-24 mt-1" />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold font-sans tracking-tight text-foreground">{dashboardStats?.totalPRs ?? 0}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">Total PRs</span>
                  </div>
                  <div className="text-muted-foreground/20 font-light select-none text-lg">|</div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold font-sans tracking-tight text-foreground">{dashboardStats?.totalMergedPRs ?? 0}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">Merged</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Issues Box */}
          <Card className="bg-sidebar border border-border shadow-sm hover:shadow-md transition-shadow p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-1.5">
              <CardTitle className="text-xs font-medium text-muted-foreground">Issues</CardTitle>
              <Waypoints className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-1">
              {!user?.githubUsername ? (
                <div className="text-xs font-medium text-destructive/80 py-1">Not connected</div>
              ) : isLoading ? (
                <Skeleton className="h-6 w-24 mt-1" />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold font-sans tracking-tight text-foreground">{dashboardStats?.totalOpenIssues ?? 0}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">Open</span>
                  </div>
                  <div className="text-muted-foreground/20 font-light select-none text-lg">|</div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold font-sans tracking-tight text-foreground">{dashboardStats?.totalIssuesClosed ?? 0}</span>
                    <span className="text-[11px] text-muted-foreground mt-0.5">Closed</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Box */}
          <Card className="bg-sidebar border border-border shadow-sm hover:shadow-md transition-shadow p-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-1.5">
              <CardTitle className="text-xs font-medium text-muted-foreground">Reviews</CardTitle>
              <Layers2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-1">
              {!user?.githubUsername ? (
                <div className="text-xs font-medium text-destructive/80 py-1">Not connected</div>
              ) : isLoading ? (
                <Skeleton className="h-6 w-20 mt-1" />
              ) : (
                <div className="flex flex-col">
                  <span className="text-xl font-bold font-sans tracking-tight text-foreground">{dashboardStats?.totalReviews ?? 0}</span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">Total reviews</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full-width Contribution Graph card below */}
      <div className="px-4 pt-2 pb-8">
        <Card className="p-6 bg-sidebar border border-border shadow-md">
          <CardContent className="p-0 flex items-center justify-center min-h-[220px]">
            {!user?.githubUsername ? (
              <div className="flex flex-col items-center gap-2 text-center py-8">
                <Github className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-destructive/80">
                  No contribution data available
                </p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center w-full h-full min-h-[200px]">
                <Loader2 className="animate-spin text-primary" />
              </div>
            ) : (
              <div className="w-full">
                <ContributionGraph />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
