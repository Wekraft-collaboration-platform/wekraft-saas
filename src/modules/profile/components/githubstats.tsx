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
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboardStats } from "@/modules/dashboard/action/action";
import ContributionGraph from "@/modules/dashboard/components/ContributionGraph";
import {
  PieChartVariant1,
  ScoreDetailsDialog,
} from "@/modules/dashboard/components/PieChart";
import { cn } from "@/lib/utils";

/* ─────────────────────────── KPI Card ─────────────────────────── */
interface KpiCardProps {
  title: string;
  icon: React.ElementType;
  isConnected: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}

function KpiCard({ title, icon: Icon, isConnected, isLoading, children }: KpiCardProps) {
  return (
    <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-3 pt-3 pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200 shrink-0" />
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-2 flex-1 flex flex-col justify-end">
        {!isConnected ? (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-destructive/80 py-0.5">
            <AlertCircle className="h-3 w-3" />
            Not connected
          </div>
        ) : isLoading ? (
          <div className="space-y-2 pt-1">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────── Stat Value ─────────────────────────── */
function StatValue({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xl font-bold font-mono tracking-tight text-foreground leading-none">
        {value.toLocaleString()}
      </span>
      <span className="text-[11px] text-muted-foreground mt-1 font-medium whitespace-nowrap">{label}</span>
    </div>
  );
}

function StatDivider() {
  return <div className="h-7 w-px bg-border self-center mx-2" />;
}

/* ─────────────────────────── GithubStats ─────────────────────────── */
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

  const isConnected = !!user?.githubUsername;

  return (
    <div className="w-full flex flex-col gap-4">

      {/* ── Connection Banner ── */}
      {user && !user.githubUsername && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-dashed border-border bg-muted/30 px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Github className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground leading-snug">
                Connect your GitHub account
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unlock your impact score, contribution graph & activity stats.
              </p>
            </div>
          </div>
          <Button
            onClick={handleConnectGithub}
            size="sm"
            className="gap-2 shrink-0 w-full sm:w-auto"
          >
            <Github className="h-3.5 w-3.5" />
            Connect GitHub
          </Button>
        </div>
      )}

      {/* ── Main grid: Impact Profile (left) + KPIs (right, 2×2) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-6 items-stretch">

        {/* Left — Impact Profile */}
        <Card className="bg-card border border-border shadow-sm flex flex-col">
          <CardHeader className="px-3 pt-3 pb-1">
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full shrink-0", isConnected ? "bg-primary animate-pulse" : "bg-foreground/20")} />
              Impact Profile
            </CardTitle>
          </CardHeader>

          <CardContent className="px-3 pb-3 pt-0 flex flex-col items-center justify-center flex-1 min-h-[150px]">
            {!isConnected ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/50">
                  <Github className="h-7 w-7 text-foreground/20" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">GitHub not connected</p>
                  <p className="text-xs text-foreground/40 mt-1">Connect to see your impact score</p>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-primary h-7 w-7" />
                <p className="text-xs text-foreground/40">Calculating score…</p>
              </div>
            ) : dashboardStats ? (
              <div className="w-full flex flex-col items-center gap-4">
                <PieChartVariant1 stats={dashboardStats} />
                <ScoreDetailsDialog stats={dashboardStats}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs w-full max-w-[160px]"
                  >
                    View Stats <TrendingUp className="h-3 w-3" />
                  </Button>
                </ScoreDetailsDialog>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <AlertCircle className="h-6 w-6 text-foreground/20" />
                <p className="text-xs text-foreground/40 text-center">Unable to fetch score</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right — KPI 2×2 grid, same height as left */}
        <div className="grid grid-cols-2 grid-rows-2 gap-6 h-full">

          <KpiCard title="Commits" icon={LucideGitCommit} isConnected={isConnected} isLoading={isLoading}>
            <StatValue value={dashboardStats?.totalCommits ?? 0} label="Last year" />
          </KpiCard>

          <KpiCard title="Pull Requests" icon={LucideGitPullRequest} isConnected={isConnected} isLoading={isLoading}>
            <div className="flex items-center">
              <StatValue value={dashboardStats?.totalPRs ?? 0} label="Total PRs" />
              <StatDivider />
              <StatValue value={dashboardStats?.totalMergedPRs ?? 0} label="Merged" />
            </div>
          </KpiCard>

          <KpiCard title="Issues" icon={Waypoints} isConnected={isConnected} isLoading={isLoading}>
            <div className="flex items-center">
              <StatValue value={dashboardStats?.totalOpenIssues ?? 0} label="Open" />
              <StatDivider />
              <StatValue value={dashboardStats?.totalIssuesClosed ?? 0} label="Closed" />
            </div>
          </KpiCard>

          <KpiCard title="Reviews" icon={Layers2} isConnected={isConnected} isLoading={isLoading}>
            <StatValue value={dashboardStats?.totalReviews ?? 0} label="Total reviews" />
          </KpiCard>

        </div>
      </div>

      {/* ── Contribution Graph ── */}
      <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-1">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Github className="h-4 w-4 text-foreground/40" />
            Contribution Graph
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-3">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-3 text-center py-10">
              <Github className="h-8 w-8 text-foreground/10" />
              <p className="text-sm font-medium text-foreground/40">
                No contribution data available
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3 py-2">
              <Skeleton className="h-4 w-40 mx-auto" />
              <Skeleton className="h-28 w-full rounded-md" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <div className="w-full">
              <ContributionGraph />
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
