"use client";

import { 
  LucideLayers3, 
  Plus, 
  Merge, 
  Zap, 
  Layers2, 
  LucideLayers2,
  Trophy,
  Rocket,
  ShieldCheck,
  User,
  TrendingUp,
  Clover
} from "lucide-react";
import React, { useState } from "react";
import { useQuery as useConvexQuery } from "convex/react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ProjectCards } from "../ProjectCards";
import { Skeleton } from "@/components/ui/skeleton";
import CreateProjectDialog from "@/modules/project/CreateProjectDialog";
import { Badge } from "@/components/ui/badge";
import { api } from "../../../../../convex/_generated/api";
import { getActiveUserPlan, getPlanLimits } from "../../../../../convex/pricing";

const AllProjectsPage = () => {
  const [activeTab, setActiveTab] = useState<"creations" | "team">("creations");
  const user = useConvexQuery(api.user.getCurrentUser);
  const myProjects = useConvexQuery(api.project.getUserProjects);
  const joinedProjects = useConvexQuery(api.project.getJoinedProjects);

  const activePlan = user ? getActiveUserPlan(user as any) : "free";
  const limits = user ? getPlanLimits(user as any) : null;

  const createdCount = myProjects?.length || 0;
  const joinedCount = joinedProjects?.length || 0;
  const creationLimit = limits?.project_creation_limit || 2;
  const joiningLimit = limits?.project_joining_limit || 2;

  const isLoading = !user || !myProjects || !joinedProjects;

  return (
    <div className="w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-700 p-6 2xl:p-10 2xl:py-7 overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Manage Projects
            <LucideLayers3 className="h-8 w-8 text-primary animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-2 ">
            Keep track of your personal creations and the collaborative team projects you're part of.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <CreateProjectDialog
            trigger={
                <Button size='sm' className="text-xs cursor-pointer">
                <Plus className="h-4 w-4" /> New Project
                </Button>
            }
            />
        </div>
      </div>

      {/* Minimal Stats Bar */}
      <div className="flex items-center gap-4 w-full my-6 bg-muted/70 px-6 py-2.5 border border-border rounded-lg">
        {/* Segment 1: Plan */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="h-8 w-8 rounded-full bg-card flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Current Plan</span>
            <span className="text-sm capitalize">{isLoading ? <Skeleton className="h-4 w-16" /> : `${activePlan} Plan`}</span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-4 opacity-50" />

        {/* Segment 2: Creation Limit */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="h-8 w-8 rounded-full bg-card flex items-center justify-center">
            <Layers2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Project Limit</span>
            <span className="text-sm ">
              {isLoading ? <Skeleton className="h-4 w-12" /> : `${createdCount} of ${creationLimit} slots`}
            </span>
          </div>
        </div>

        <Separator orientation="vertical" className="h-10 mx-4 opacity-50" />

        {/* Segment 3: Availability */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="h-8 w-8 rounded-full bg-card flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Availability</span>
            <span className="text-sm ">
              {isLoading ? <Skeleton className="h-4 w-12" /> : `${creationLimit - createdCount} Slots left`}
            </span>
          </div>
        </div>

        {/* Right Side: Upgrade Button */}
        <div className="ml-auto">
          <Link href="/dashboard/pricing">
            <Button size="sm" className="text-xs">
              Upgrade <Clover className="" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Projects Section */}
      <div className="mt-14 space-y-8 mb-16">
        <div className="flex items-center gap-8 border-b border-accent pb-4">
            <button 
              onClick={() => setActiveTab("creations")}
              className={cn(
                "text-lg font-semibold tracking-tight flex items-center gap-3 transition-colors relative pb-4 -mb-4",
                activeTab === "creations" ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              My Creations
              <Badge variant="outline" className={cn("font-mono", activeTab === "creations" ? "text-primary bg-primary/5 border-primary/20" : "text-muted-foreground/60")}>
                  {myProjects?.length || 0}
              </Badge>
              {activeTab === "creations" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>

            <button 
              onClick={() => setActiveTab("team")}
              className={cn(
                "text-lg font-semibold tracking-tight flex items-center gap-3 transition-colors relative pb-4 -mb-4",
                activeTab === "team" ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              Team Projects
              <Badge variant="outline" className={cn("font-mono", activeTab === "team" ? "text-primary bg-primary/5 border-primary/20" : "text-muted-foreground/60")}>
                  {joinedProjects?.length || 0}
              </Badge>
              {activeTab === "team" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === "creations" ? (
            isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-3">
                        <Skeleton className="aspect-video w-full rounded-xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
              </div>
            ) : (
              <ProjectCards projects={myProjects} />
            )
          ) : (
            isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-3">
                        <Skeleton className="aspect-video w-full rounded-xl" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                ))}
              </div>
            ) : joinedProjects && joinedProjects.length > 0 ? (
              <ProjectCards projects={joinedProjects as any} hideCreateCard />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-accent/20 rounded-2xl bg-accent/5 hover:bg-accent/10 transition-colors duration-500 group">
                 <div className="relative mb-6">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                    <Merge className="h-16 w-16  relative z-10" />
                 </div>
                 <h3 className="text-lg font-bold text-foreground mb-1">No Team Projects Found</h3>
                 <p className="text-sm text-muted-foreground max-w-xs text-center mb-6">
                    You haven't joined any team projects yet. Collaboration is the key to success!
                 </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProjectsPage;
