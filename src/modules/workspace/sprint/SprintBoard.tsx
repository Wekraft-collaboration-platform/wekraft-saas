"use client";

import { motion } from "framer-motion";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { SprintTaskCard } from "./SprintTaskCard";
import { 
  ArrowUpDown, 
  ChevronDown, 
  LayoutList,
  SortAsc
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateTaskDialog } from "../CreateTaskDialog";
import { CreateIssueDialog } from "../CreateIssueDialog";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { Goal } from "lucide-react";

interface SprintBoardProps {
  sprint: Doc<"sprints"> | null;
  tasks: Doc<"tasks">[];
  issues: Doc<"issues">[];
}

export const SprintBoard = ({ sprint, tasks, issues }: SprintBoardProps) => {
  // Group tasks
  const backlogTasks = tasks.filter((t) => t.status === "not started");
  const currentTasks = tasks.filter((t) => ["inprogress", "reviewing", "testing"].includes(t.status));
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const backlogIssues = issues.filter((i) => ["not opened", "reopened"].includes(i.status));
  const currentIssues = issues.filter((i) => ["opened", "in review"].includes(i.status));
  const completedIssues = issues.filter((i) => i.status === "closed");

  const columns = [
    { 
      id: "backlog", 
      title: "To Do", 
      tasks: [...backlogTasks, ...backlogIssues],
      color: "border-t-orange-500"
    },
    { 
      id: "current", 
      title: "In Progress", 
      tasks: [...currentTasks, ...currentIssues],
      color: "border-t-blue-500"
    },
    { 
      id: "complete", 
      title: "Done", 
      tasks: [...completedTasks, ...completedIssues],
      color: "border-t-emerald-500"
    },
  ];

  if (!sprint) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed rounded-3xl bg-muted/5 opacity-40 select-none">
         <div className="p-6 bg-muted/20 rounded-full mb-6">
            <LayoutList className="w-12 h-12 text-muted-foreground" />
         </div>
         <h3 className="text-xl font-bold">No Active Sprint</h3>
         <p className="text-sm mt-2 max-w-[300px] text-center">
            Go to the Backlog tab to start a sprint and see your tasks here.
         </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Board Header Info */}
      <div className="flex items-center justify-between px-2 bg-muted/20 p-4 rounded-2xl border border-border/40">
        <div className="flex items-center gap-4">
           <div className="p-2.5 bg-primary/10 rounded-xl">
              <Goal className="w-5 h-5 text-primary" />
           </div>
           <div>
              <h2 className="font-bold text-lg leading-none">{sprint.name}</h2>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1 opacity-70">
                {sprint.goal || "No sprint goal defined"}
              </p>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time Remaining</span>
              <span className="text-sm font-bold text-primary">
                {sprint.endDate ? Math.ceil((sprint.endDate - Date.now()) / (1000 * 60 * 60 * 24)) : 0} days
              </span>
           </div>
           
           <CompleteSprintDialog sprint={sprint} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start h-full min-h-[600px] overflow-hidden">
        {columns.map((col) => (
          <div key={col.id} className={cn(
            "flex flex-col h-full min-w-0 bg-muted/10 rounded-2xl border border-border/40 overflow-hidden shadow-sm",
          )}>
            {/* Column Header */}
            <div className={cn("flex items-center gap-3 p-4 border-b border-t-2 bg-background/50", col.color)}>
              <h3 className="font-bold text-sm flex-1 uppercase tracking-wider text-muted-foreground/80">{col.title}</h3>
              <Badge variant="secondary" className="bg-muted font-bold text-[10px] px-1.5 h-5 min-w-[20px] justify-center">
                {col.tasks.length}
              </Badge>
            </div>

            {/* Tasks Container */}
            <motion.div 
              className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
            >
              {col.tasks.map((task) => (
                <SprintTaskCard key={task._id} task={task} />
              ))}
              
              {col.tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 opacity-20 select-none grayscale">
                   <LayoutList className="w-8 h-8 mb-2" />
                   <span className="text-[10px] font-medium italic">Empty</span>
                </div>
              )}
              
              <div className="pt-2">
                 <CreateItemDropdown projectId={sprint.projectId} sprintId={sprint._id} status={col.id === "backlog" ? "not started" : col.id === "current" ? "inprogress" : "completed"} />
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface CompleteSprintDialogProps {
  sprint: Doc<"sprints">;
}

const CompleteSprintDialog = ({ sprint }: CompleteSprintDialogProps) => {
  const [open, setOpen] = useState(false);
  const [destination, setDestination] = useState("backlog");
  const completeSprint = useMutation(api.sprints.completeSprint);

  const handleComplete = async () => {
    try {
      await completeSprint({
        sprintId: sprint._id,
        moveToBacklog: destination === "backlog",
      });
      setOpen(false);
      toast.success(`${sprint.name} completed!`);
    } catch (error) {
      toast.error("Failed to complete sprint");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 font-bold rounded-xl border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10">
          Complete Sprint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-border/40">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Complete Sprint</DialogTitle>
          <DialogDescription>
            This sprint is finished. What should we do with the remaining items?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
           <RadioGroup value={destination} onValueChange={setDestination} className="gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-2xl border border-border/40 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="backlog" id="backlog" />
                <Label htmlFor="backlog" className="flex-1 cursor-pointer font-bold">Move to Backlog</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-2xl border border-border/40 bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors">
                <RadioGroupItem value="next" id="next" />
                <Label htmlFor="next" className="flex-1 cursor-pointer font-bold">Move to Next Sprint</Label>
              </div>
           </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold">Cancel</Button>
          <Button onClick={handleComplete} className="rounded-xl font-bold px-8 bg-emerald-600 hover:bg-emerald-700">Complete Sprint</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const CreateItemDropdown = ({ projectId, sprintId, status }: { projectId: Id<"projects">, sprintId: Id<"sprints">, status: string }) => {
  return (
    <div className="flex gap-2">
       <CreateTaskDialog 
          projectId={projectId}
          projectName="Project"
          defaultSprintId={sprintId}
          trigger={
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-lg flex-1 border border-dashed border-border/60">
               <Plus className="w-3.5 h-3.5" />
               Add Task
            </Button>
          }
       />
       <CreateIssueDialog 
          projectId={projectId}
          defaultSprintId={sprintId}
          trigger={
            <Button variant="ghost" size="sm" className="h-8 w-8 text-muted-foreground hover:text-red-500 transition-colors hover:bg-red-500/5 rounded-lg border border-dashed border-border/60">
               <Plus className="w-3.5 h-3.5" />
            </Button>
          }
       />
    </div>
  )
}
