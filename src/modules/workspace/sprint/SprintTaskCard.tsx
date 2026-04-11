"use client";

import { motion } from "framer-motion";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Users, 
  Heart, 
  Check, 
  MoreHorizontal,
  ChevronDown,
  Layout
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SprintTaskCardProps {
  task: Doc<"tasks"> | Doc<"issues">;
  variant?: "standard" | "slim";
}

export const SprintTaskCard = ({ task, variant = "standard" }: SprintTaskCardProps) => {
  const isIssue = "severity" in task;
  
  const status = task.status as string;
  const isCompleted = status === "completed" || status === "closed";
  const isCurrent = ["inprogress", "reviewing", "testing", "opened", "in review"].includes(status);
  const isBacklog = ["not started", "not opened", "reopened"].includes(status);

  let statusColorClass = "";
  if (isCompleted) statusColorClass = "bg-green-500/5 border-green-500/10";
  else if (isCurrent) statusColorClass = "bg-blue-500/5 border-blue-500/10";
  else if (isBacklog) statusColorClass = "bg-red-500/5 border-red-500/10";
  else statusColorClass = "bg-muted/5 border-muted/10";

  const containerVariants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        duration: 0.2, 
        ease: [0.23, 1, 0.32, 1] as any
      } 
    },
    tap: { scale: 0.97, transition: { duration: 0.1 } },
  };

  if (variant === "slim") {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        whileTap="tap"
        className="flex items-center gap-3 p-2 bg-card border rounded-md shadow-2xs hover:shadow-xs transition-shadow cursor-pointer group"
      >
        <div className="flex-shrink-0">
          <Badge variant={isIssue ? "destructive" : "outline"} className="w-6 h-6 p-0 flex items-center justify-center rounded-sm text-[10px] uppercase font-bold">
            {isIssue ? "!" : "T"}
          </Badge>
        </div>
        
        <Avatar className="w-6 h-6">
          <AvatarImage src={isIssue 
            ? (task as Doc<"issues">).IssueAssignee?.[0]?.avatar 
            : (task as Doc<"tasks">).assignedTo?.[0]?.avatar} />
          <AvatarFallback className="text-[10px]">{task.title[0]}</AvatarFallback>
        </Avatar>
        
        <span className="text-xs flex-1 truncate font-medium text-foreground/90">
          {task.title}
        </span>
        
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
          <Check className="w-3.5 h-3.5 text-green-500" />
          <span className="text-[10px] font-mono tabular-nums">#{task._id.slice(-4)}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      whileTap="tap"
      className="p-3 bg-card border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Layout className="w-3.5 h-3.5 text-muted-foreground" />
        <Avatar className="w-5 h-5">
           <AvatarImage src={""} />
           <AvatarFallback className="text-[10px]">GB</AvatarFallback>
        </Avatar>
        <span className="text-[11px] font-medium text-muted-foreground mr-auto">
           {isIssue ? "Reported issue" : "Task updated"}
        </span>
        <MoreHorizontal className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
      </div>

      {/* Content Area */}
      <div className={cn(
        "p-3 rounded-md border text-sm leading-relaxed transition-colors",
        statusColorClass
      )}>
        <p className="text-foreground/90">
          {task.description || task.title}
        </p>
        
        {/* Tags */}
        <div className="flex gap-2 mt-3 cursor-default">
           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-background border text-[10px] text-muted-foreground hover:text-foreground transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              frontend
           </div>
        </div>
        
        <div className="mt-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
           #{task._id.slice(-4)}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-end gap-3 px-1">
         <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[10px]">2</span>
         </div>
         <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-[10px]">6</span>
         </div>
         <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="w-3.5 h-3.5" />
            <span className="text-[10px]">0</span>
         </div>
      </div>
    </motion.div>
  );
};
