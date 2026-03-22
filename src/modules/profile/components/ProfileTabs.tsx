"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "@/modules/dashboard/action/action";
import { PieChartVariant1 } from "@/modules/dashboard/components/PieChart";
import { Button } from "@/components/ui/button";
import { 
  Github, 
  Youtube, 
  ExternalLink, 
  MessageSquare, 
  Trophy, 
  Code2, 
  Monitor, 
  Lock,
  GitCommit,
  GitPullRequest,
  Merge,
  AlertCircle,
  Plus,
  Link2,
  Globe,
  Trash2,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ProfileTabsProps {
  user: any;
  isUpgraded: boolean;
}

const getPlatformInfo = (url: string) => {
  if (!url) return { label: "Empty Slot", icon: Plus };
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("youtube.com")) return { label: "YouTube", icon: Youtube };
  if (lowerUrl.includes("producthunt.com")) return { label: "Product Hunt", icon: Monitor };
  if (lowerUrl.includes("dev.to")) return { label: "Dev.to", icon: MessageSquare };
  if (lowerUrl.includes("kaggle.com")) return { label: "Kaggle", icon: Trophy };
  if (lowerUrl.includes("codeforces.com")) return { label: "Codeforces", icon: Code2 };
  if (lowerUrl.includes("stackoverflow.com")) return { label: "StackOverflow", icon: ExternalLink };
  return { label: "Social", icon: Globe };
};

export function ProfileTabs({ user, isUpgraded }: ProfileTabsProps) {
  const socialLinks = user?.socialLinks || [];
  const slots = [0, 1, 2];
  const updateSocialLinks = useMutation(api.user.updateSocialLinks);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // TanStack Query for stats
  const { data: dashboardStats, isLoading } = useQuery({
    queryKey: ["dashboardStats", user?.githubUsername],
    queryFn: () => getDashboardStats(user?.githubUsername || ""),
    enabled: !!user?.githubUsername,
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleAddLink = async (index: number, url: string) => {
    setIsUpdating(true);
    const newLinks = [...socialLinks];
    newLinks[index] = url;
    
    try {
      await updateSocialLinks({ links: newLinks });
      toast.success("Social link connected!");
    } catch (err) {
      toast.error("Failed to connect link.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveLink = async (index: number) => {
    setIsUpdating(true);
    const newLinks = socialLinks.filter((_: string, i: number) => i !== index);
    
    try {
      await updateSocialLinks({ links: newLinks });
      toast.success("Social link removed.");
    } catch (err) {
      toast.error("Failed to remove link.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full mt-6">
      <Tabs defaultValue="github" className="w-full">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 mb-6  gap-1">
          <TabsTrigger
            value="github"
            className="flex items-center gap-2 px-6 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none transition-all"
          >
            <Github className="h-4 w-4" />
            <span className="text-sm font-semibold">GitHub</span>
          </TabsTrigger>

          {slots.map((index) => {
            const hasLink = socialLinks[index];
            const isLocked = !isUpgraded;
            const info = getPlatformInfo(hasLink);

            return (
              <TabsTrigger
                key={index}
                value={`slot-${index}`}
                disabled={isLocked}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none transition-all relative",
                  isLocked && "grayscale opacity-50 cursor-not-allowed border-none"
                )}
              >
                <info.icon className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {hasLink ? info.label : `Slot ${index + 1}`}
                </span>
                {isLocked && (
                  <Lock className="h-3 w-3 absolute top-2 right-2 opacity-100" />
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="github" className="mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                  Impact Score
                  <Github className="h-4 w-4 opacity-50" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : dashboardStats ? (
                  <div className="flex justify-center -mt-4">
                    <PieChartVariant1 stats={dashboardStats} />
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
                    Connect GitHub to see Impact Score
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <StatCard title="Commits" value={dashboardStats?.totalCommits} subValue="Last Year" icon={GitCommit} isLoading={isLoading} />
              <StatCard title="PRs" value={dashboardStats?.totalPRs} subValue="Created" icon={GitPullRequest} isLoading={isLoading} />
              <StatCard title="Merged PRs" value={dashboardStats?.totalMergedPRs} subValue="Successful" icon={Merge} isLoading={isLoading} />
              <StatCard title="Issues" value={dashboardStats?.totalIssuesClosed} subValue="Closed" icon={AlertCircle} isLoading={isLoading} />
            </div>
          </div>
        </TabsContent>

        {slots.map((index) => {
          const currentLink = socialLinks[index];
          const info = getPlatformInfo(currentLink);

          return (
            <TabsContent key={index} value={`slot-${index}`} className="focus-visible:outline-none">
              <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg bg-accent/5 transition-all hover:bg-accent/10 min-h-[350px]">
                {currentLink ? (
                  <div className="text-center space-y-5 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto ring-8 ring-primary/5">
                      <info.icon className="h-8 w-8 text-primary shadow-lg" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold font-pop tracking-tight">
                        {info.label} Connected
                      </h3>
                      <p className="text-muted-foreground font-mono text-sm max-w-sm mt-1 px-4 truncate mx-auto bg-card py-2 rounded border border-dashed">
                         {currentLink}
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                       <Button variant="outline" size="sm" asChild>
                         <a href={currentLink} target="_blank" rel="noopener noreferrer">
                           View Profile <ExternalLink className="ml-2 h-3.5 w-3.5" />
                         </a>
                       </Button>
                       <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleRemoveLink(index)}
                        disabled={isUpdating}
                       >
                         {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                       </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="h-14 w-14 rounded-full border-2 border-dashed flex items-center justify-center mx-auto opacity-40">
                      <Plus className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold">Social Slot Available</h3>
                      <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                        Showcase your other professional profiles like YouTube, StackOverflow or Kaggle.
                      </p>
                    </div>
                    <ConnectModal onConnect={(url) => handleAddLink(index, url)} isLoading={isUpdating} />
                  </div>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

function ConnectModal({ onConnect, isLoading }: { onConnect: (url: string) => void; isLoading: boolean }) {
  const [url, setUrl] = React.useState("");
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Connect Social Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Social Link</DialogTitle>
          <DialogDescription>
            Paste the profile URL (YouTube, dev.to, Product Hunt, etc.). We'll automatically identify the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="https://youtube.com/@yourchannel"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            disabled={!url || isLoading} 
            onClick={() => {
              onConnect(url);
              setOpen(false);
            }}
          >
            {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            Connect Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatCard({ title, value, subValue, icon: Icon, isLoading }: any) {
  return (
    <Card className="bg-card border-dashed overflow-hidden relative group">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <Icon className="h-4 w-4 text-muted-foreground opacity-50 group-hover:text-primary group-hover:opacity-100 transition-all" />
        </div>
        <div>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mb-1" />
          ) : (
            <p className="text-2xl font-bold font-mono">
              {value ?? 0}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground font-medium">
            {subValue}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
