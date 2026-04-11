"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { PageTransition } from "@/components/PageTransition";
import { SprintAnalytics } from "@/modules/workspace/sprint/SprintAnalytics";
import { SprintBoard } from "@/modules/workspace/sprint/SprintBoard";
import { SprintBacklog } from "@/modules/workspace/sprint/SprintBacklog";
import { FastForward, Search, Filter, LayoutGrid, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const SprintPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const [activeTab, setActiveTab] = useState("board");

  const project = useQuery(api.project.getProjectBySlug, { slug });
  
  const sprints = useQuery(
    api.sprints.listSprints,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip"
  );

  const tasks = useQuery(
    api.workspace.getTimelineTasks,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip"
  );

  const issues = useQuery(
    api.issue.getFilteredIssues,
    project?._id ? { projectId: project._id as Id<"projects"> } : "skip"
  );

  if (!project || !sprints || !tasks || !issues) {
    return <SprintLoadingSkeleton />;
  }

  const activeSprint = sprints.find(s => s.status === "active") || null;
  const plannedSprints = sprints.filter(s => s.status === "planned");
  
  // Filter tasks for the active board
  const boardTasks = tasks.filter(t => t.sprintId === activeSprint?._id);
  const boardIssues = issues.filter(i => i.sprintId === activeSprint?._id);

  // Filter tasks for the backlog
  const backlogTasks = tasks.filter(t => !t.sprintId);
  const backlogIssues = issues.filter(i => !i.sprintId);

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
                 className="pl-9 w-[240px] h-10 bg-muted/20 border-none transition-all focus:bg-background focus:ring-1 focus:ring-primary shadow-2xs text-xs"
              />
           </div>
           
           <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 border-border/40">
              <Filter className="w-4 h-4" />
           </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
        <div className="flex items-center justify-between border-b border-border/40 pb-1">
           <TabsList className="bg-transparent h-auto p-0 gap-8 rounded-none">
              <TabsTrigger 
                value="board" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-4 pt-0 transition-all font-bold gap-2 text-muted-foreground"
              >
                <LayoutGrid className="w-4 h-4" />
                Active Sprint
              </TabsTrigger>
              <TabsTrigger 
                 value="backlog" 
                 className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-4 pt-0 transition-all font-bold gap-2 text-muted-foreground"
              >
                <ListTodo className="w-4 h-4" />
                Backlog
              </TabsTrigger>
           </TabsList>
        </div>

        <TabsContent value="board" className="mt-0 space-y-8 animate-in fade-in duration-500">
           {/* Analytics only on board for active sprint context */}
           <div className="min-h-0">
              <SprintAnalytics tasks={boardTasks} />
           </div>

           <section className="flex-1 min-h-0">
              <SprintBoard 
                sprint={activeSprint}
                tasks={boardTasks} 
                issues={boardIssues} 
              />
           </section>
        </TabsContent>

        <TabsContent value="backlog" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <SprintBacklog 
              projectId={project._id}
              sprints={plannedSprints}
              allTasks={tasks}
              allIssues={issues}
           />
        </TabsContent>
      </Tabs>
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
