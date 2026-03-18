"use client";

import { useQuery } from "@tanstack/react-query";
import { useQuery as useConvexQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useSidebar } from "@/components/ui/sidebar";
import { getDashboardStats } from "@/modules/dashboard/action/action";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LucideGitCommit } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const user = useConvexQuery(api.user.getCurrentUser);
  const { open: sidebarOpen, isMobile } = useSidebar();

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
        <h1 className="text-3xl font-semibold ">
          Welcome {user?.name || <Skeleton className="h-8 w-40 inline-block align-bottom" />}
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-10 w-full my-5 px-8 font-sans">
        {/* COMMIT */}
        <Card className="bg-linear-to-br from-accent/90 to-transparent dark:to-black  min-w-[260px]">
          <CardHeader>
            <CardTitle>Commits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between -mt-1">
              <div className="flex flex-col">
                <p className="text-2xl font-semibold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    dashboardStats?.totalCommits ?? 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last Year commits
                </p>
              </div>
              <Separator orientation="vertical" className="mx-2" />
              <LucideGitCommit className="h-10 w-10" />
            </div>
          </CardContent>
        </Card>

        {/* TOTAL PR*/}
        <Card className="bg-linear-to-br from-accent/90 to-transparent dark:to-black  min-w-[260px]">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <p>Pull Requests</p>
              <p>Merged PRs</p>{" "}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between -mt-1">
              <div className="flex flex-col">
                <p className="text-2xl font-semibold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    dashboardStats?.totalPRs ?? 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Total PRs</p>
              </div>
              <Separator
                orientation="vertical"
                className="mx-2 h-10! bg-accent"
              />
              <div className="flex flex-col">
                <p className="text-2xl font-semibold">
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    dashboardStats?.totalMergedPRs ?? 0
                  )}
                </p>
                <p className="text-sm text-muted-foreground">Merged PRs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative  min-w-[260px] bg-linear-to-br from-accent/90 to-transparent dark:to-black">
          {/* TODO FUTURE PART */}
        </Card>
      </div>
    </div>
  );
}

