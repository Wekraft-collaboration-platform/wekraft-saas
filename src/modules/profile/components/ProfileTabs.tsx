"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/modules/dashboard/action/action";
import { PieChartVariant1 } from "@/modules/dashboard/components/PieChart";
import { Button } from "@/components/ui/button";
import {
  Github,
  ExternalLink,
  Lock,
  GitCommit,
  GitPullRequest,
  Merge,
  AlertCircle,
  Plus,
  Globe,
  Trash2,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { ConnectPlatformModal } from "./ConnectPlatformModal";
import { getServerStats } from "@/modules/profile/action/stats";
import { PLATFORM_REGISTRY } from "@/modules/profile/config/platforms";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileTabsProps {
  user: {
    githubUsername?: string;
    socialLinks?: string[];
  };
  isUpgraded: boolean;
}

interface StatCardProps {
  title: string;
  value: number | string | undefined;
  subValue: string;
  icon: LucideIcon;
  isLoading: boolean;
}

interface SlotContentProps {
  index: number;
  link: string | undefined;
  onConnect: () => void;
  onRemove: () => void;
  isUpdating: boolean;
}

interface PlatformInfo {
  label: string;
  icon: LucideIcon;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Reads from PLATFORM_REGISTRY — no manual map needed here

function getPlatformInfo(url: string): PlatformInfo {
  if (!url) return { label: "Empty Slot", icon: Plus };
  const lower = url.toLowerCase();
  const found = PLATFORM_REGISTRY.find((p) => lower.includes(p.urlMatch));
  if (found) return { label: found.name, icon: found.icon };
  return { label: "Social", icon: Globe };
}

const SLOTS = [0, 1, 2] as const;

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProfileTabs({ user, isUpgraded }: ProfileTabsProps) {
  const socialLinks: string[] = user?.socialLinks ?? [];
  const updateSocialLinks = useMutation(api.user.updateSocialLinks);

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = React.useState<number | null>(null);

  const { data: dashboardStats, isLoading: isGithubLoading } = useQuery({
    queryKey: ["dashboardStats", user?.githubUsername],
    queryFn: () => getDashboardStats(user?.githubUsername ?? ""),
    enabled: !!user?.githubUsername,
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleAddLink = async (url: string) => {
    if (activeSlotIndex === null) return;
    setIsUpdating(true);
    const newLinks = [...socialLinks];
    newLinks[activeSlotIndex] = url;
    try {
      await updateSocialLinks({ links: newLinks });
      toast.success("Platform connected!");
      setIsModalOpen(false);
    } catch {
      toast.error("Failed to connect platform.");
    } finally {
      setIsUpdating(false);
      setActiveSlotIndex(null);
    }
  };

  const handleRemoveLink = async (index: number) => {
    setIsUpdating(true);
    const newLinks = socialLinks.filter((_, i) => i !== index);
    try {
      await updateSocialLinks({ links: newLinks });
      toast.success("Platform removed.");
    } catch {
      toast.error("Failed to remove platform.");
    } finally {
      setIsUpdating(false);
    }
  };

  const openModal = (index: number) => {
    setActiveSlotIndex(index);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full mt-6">
      <Tabs defaultValue="github" className="w-full">
        {/* ── Tab List ── */}
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 mb-6 gap-1">
          {/* GitHub — always visible */}
          <TabsTrigger
            value="github"
            className="flex items-center gap-2 px-6 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none transition-all"
          >
            <Github className="h-4 w-4" />
            <span className="text-sm font-semibold uppercase tracking-tight">GitHub</span>
          </TabsTrigger>

          {/* Social Slots — locked for free users */}
          {SLOTS.map((index) => {
            const link = socialLinks[index];
            const info = getPlatformInfo(link);
            const isLocked = !isUpgraded;

            return (
              <TabsTrigger
                key={index}
                value={`slot-${index}`}
                disabled={isLocked}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none transition-all relative",
                  isLocked && "grayscale opacity-50 cursor-not-allowed"
                )}
              >
                <info.icon className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-tight">
                  {link ? info.label : `Slot ${index + 1}`}
                </span>
                {isLocked && (
                  <Lock className="h-3 w-3 absolute top-2 right-2" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ── GitHub Tab Content ── */}
        <TabsContent value="github" className="mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                  Impact Score
                  <Github className="h-4 w-4 opacity-50" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGithubLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : dashboardStats ? (
                  <div className="flex justify-center -mt-4">
                    <PieChartVariant1 stats={dashboardStats} />
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                    No GitHub data found.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Commits"    value={dashboardStats?.totalCommits}    subValue="Last Year"  icon={GitCommit}    isLoading={isGithubLoading} />
              <StatCard title="PRs"        value={dashboardStats?.totalPRs}        subValue="Created"    icon={GitPullRequest} isLoading={isGithubLoading} />
              <StatCard title="Merged PRs" value={dashboardStats?.totalMergedPRs}  subValue="Successful" icon={Merge}         isLoading={isGithubLoading} />
              <StatCard title="Issues"     value={dashboardStats?.totalIssuesClosed} subValue="Closed"  icon={AlertCircle}   isLoading={isGithubLoading} />
            </div>
          </div>
        </TabsContent>

        {/* ── Social Slot Tab Contents ── */}
        {SLOTS.map((index) => (
          <SlotContent
            key={index}
            index={index}
            link={socialLinks[index]}
            onConnect={() => openModal(index)}
            onRemove={() => handleRemoveLink(index)}
            isUpdating={isUpdating}
          />
        ))}
      </Tabs>

      {/* ── Connect Platform Modal ── */}
      <ConnectPlatformModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConnect={handleAddLink}
        isLoading={isUpdating}
      />
    </div>
  );
}

// ─── Slot Content ─────────────────────────────────────────────────────────────

function SlotContent({ index, link, onConnect, onRemove, isUpdating }: SlotContentProps) {
  const info = getPlatformInfo(link ?? "");

  const { data: platformStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["platformStats", link],
    queryFn: () => getServerStats(link!),
    enabled: !!link,
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <TabsContent value={`slot-${index}`} className="focus-visible:outline-none">
      {!link ? (
        /* ── Empty Slot ── */
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-accent/5 hover:bg-accent/10 transition-colors min-h-[350px]">
          <div className="text-center space-y-4">
            <div className="h-14 w-14 rounded-2xl border-2 border-dashed flex items-center justify-center mx-auto opacity-40">
              <Plus className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Social Slot Available</h3>
              <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                Showcase your presence on platforms like Dev.to, LeetCode, or Codeforces.
              </p>
            </div>
            <Button size="sm" onClick={onConnect} className="font-semibold">
              Connect Platform
            </Button>
          </div>
        </div>
      ) : (
        /* ── Connected Slot ── */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header bar */}
          <div className="flex items-center justify-between bg-card/50 p-4 rounded-xl border border-dashed">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <info.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold">{info.label} Connected</h3>
                <p className="text-xs text-muted-foreground truncate max-w-[280px]">{link}</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" asChild className="h-8 px-3 text-xs">
                <a href={link} target="_blank" rel="noopener noreferrer">
                  View <ExternalLink className="ml-1.5 h-3 w-3" />
                </a>
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={onRemove}
                disabled={isUpdating}
                aria-label="Remove platform"
              >
                {isUpdating
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <Trash2 className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isStatsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="bg-card border-dashed">
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </CardContent>
                </Card>
              ))
            ) : platformStats?.stats?.length ? (
              platformStats.stats.map((stat: { label: string; value: string | number; subValue?: string }, i: number) => (
                <StatCard
                  key={i}
                  title={stat.label}
                  value={stat.value}
                  subValue={stat.subValue ?? ""}
                  icon={info.icon}
                  isLoading={false}
                />
              ))
            ) : (
              <div className="col-span-4 p-8 text-center bg-accent/5 rounded-xl border border-dashed">
                <p className="text-sm text-muted-foreground">
                  Stats not available for this platform yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </TabsContent>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ title, value, subValue, icon: Icon, isLoading }: StatCardProps) {
  return (
    <Card className="bg-card border-dashed overflow-hidden group transition-all hover:border-primary/40 hover:bg-primary/[0.02]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
            {title}
          </p>
          <Icon className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:opacity-100 transition-all" />
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-16 mb-1" />
        ) : (
          <p className="text-2xl font-bold font-mono tracking-tighter">{value ?? 0}</p>
        )}
        <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{subValue}</p>
      </CardContent>
    </Card>
  );
}
