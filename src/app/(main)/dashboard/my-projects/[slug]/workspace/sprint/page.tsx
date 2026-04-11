"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { PageTransition } from "@/components/PageTransition";
import { SprintBoard } from "@/modules/workspace/sprint/SprintBoard";
import { FastForward, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";


const SprintPage = () => {
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  
  const tasks = useQuery(
    api.workspace.getTimelineTasks,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip"
  );

  const issues = useQuery(
    api.issue.getFilteredIssues,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip"
  );

  if (!project) {
    return <SprintLoadingSkeleton />;
  }

  return (
    <PageTransition className="w-full h-full p-6 2xl:p-8 space-y-8 bg-background/50">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FastForward className="w-6 h-6 ml-1 -mt-0.5 text-primary inline" />
              Sprint
           </h1>
        </div>

        <div className="flex items-center gap-3">
           <div className="relative group hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                 placeholder="Search sprint..." 
                 className="pl-9 w-[240px] h-10 bg-muted/20 border-none transition-all focus:bg-background focus:ring-1 focus:ring-primary shadow-2xs"
              />
           </div>
           
           <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
              <Filter className="w-4 h-4" />
           </Button>


        </div>
      </header>

      {/* Board Section */}
      <section className="flex-1 min-h-0">
         <SprintBoard tasks={tasks || []} issues={issues || []} />
      </section>
    </PageTransition>
  );
};

const SprintLoadingSkeleton = () => (
  <div className="p-8 space-y-8 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
    <Skeleton className="h-[300px] w-full rounded-2xl" />
    <div className="grid grid-cols-3 gap-6">
      <Skeleton className="h-[500px] w-full rounded-xl" />
      <Skeleton className="h-[500px] w-full rounded-xl" />
      <Skeleton className="h-[500px] w-full rounded-xl" />
    </div>
  </div>
);

export default SprintPage;
