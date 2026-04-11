"use client";

import { motion } from "framer-motion";
import { Doc } from "../../../../convex/_generated/dataModel";
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

interface SprintBoardProps {
  tasks: Doc<"tasks">[];
  issues: Doc<"issues">[];
}

export const SprintBoard = ({ tasks, issues }: SprintBoardProps) => {
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
      title: "Backlog", 
      tasks: [...backlogTasks, ...backlogIssues],
      color: "border-t-red-500"
    },
    { 
      id: "current", 
      title: "Current", 
      tasks: [...currentTasks, ...currentIssues],
      color: "border-t-blue-500"
    },
    { 
      id: "complete", 
      title: "Completed", 
      tasks: [...completedTasks, ...completedIssues],
      color: "border-t-green-500"
    },
  ];

  const staggerContainer = {
    initial: { opacity: 1 },
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start h-full min-h-[600px] overflow-hidden">
      {columns.map((col) => (
        <div key={col.id} className={cn(
          "flex flex-col h-full min-w-0 bg-muted/20 rounded-xl border border-border/50 overflow-hidden shadow-2xs",
        )}>
          {/* Column Header */}
          <div className="flex items-center gap-3 p-3 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
            <Button variant="ghost" size="icon-sm" className="w-7 h-7">
               <LayoutList className="w-4 h-4 text-muted-foreground" />
            </Button>
            
            <h3 className="font-bold text-base flex-1">{col.title}</h3>
            
            <Select defaultValue="priority">
               <SelectTrigger className="w-[100px] h-8 text-[11px] bg-background">
                  <SelectValue placeholder="Sort" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
               </SelectContent>
            </Select>
            
            <Button variant="ghost" size="icon-sm" className="w-7 h-7">
               <SortAsc className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Tasks Container */}
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide"
          >
            {col.tasks.map((task) => (
              <SprintTaskCard key={task._id} task={task} />
            ))}
            
            {col.tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-30 select-none">
                 <LayoutList className="w-10 h-10 mb-2" />
                 <span className="text-xs">No tasks in {col.title}</span>
              </div>
            )}
          </motion.div>
        </div>
      ))}
    </div>
  );
};
