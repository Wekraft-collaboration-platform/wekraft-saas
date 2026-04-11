"use client";

import { useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { 
  CheckCircle2,
  Calendar,
  Bug,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SprintTaskCardProps {
  task: Doc<"tasks"> | Doc<"issues">;
  onClick?: () => void;
}

export const SprintTaskCard = ({ task, onClick }: SprintTaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isIssue = "severity" in task;
  
  const priority = (isIssue 
    ? (task as Doc<"issues">).severity 
    : (task as Doc<"tasks">).priority) || "low";

  const priorityColors: Record<string, string> = {
    critical: "#e74c3c", // Red
    high: "#e74c3c",     // Red
    medium: "#f1c40f",   // Yellow/Amber
    low: "#27ae60",      // Green
    normal: "#95a5a6",   // Gray
    none: "#95a5a6",     // Gray
  };

  const status = task.status as string;
  const typeColor = priorityColors[priority.toLowerCase()] || "#94a3b8";

  const isCompleted = status.toLowerCase() === "completed" || status.toLowerCase() === "closed";
  const timelineLabel = isIssue 
    ? (task as Doc<"issues">).due_date 
      ? `${format(new Date(task.createdAt), "MMM d")} - ${format(new Date((task as Doc<"issues">).due_date!), "MMM d")}`
      : format(new Date(task.createdAt), "MMM d")
    : (task as Doc<"tasks">).estimation
      ? `${format(new Date((task as Doc<"tasks">).estimation.startDate), "MMM d")} - ${format(new Date((task as Doc<"tasks">).estimation.endDate), "MMM d")}`
      : format(new Date(task.createdAt), "MMM d");

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative bg-card border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col w-full h-11 rounded-xl",
        isHovered 
          ? "border-primary/40 shadow-md translate-y-[-1px]" 
          : "border-border shadow-sm hover:border-border/80"
      )}
    >
      {/* Compact View */}
      <div 
        className="flex items-center h-full px-3 gap-3"
      >
        <div className="flex items-center shrink-0">
          {/* Status/Priority Indicator */}
          <div className="flex items-center gap-2">
            <div 
              className="w-[3px] h-6 rounded-full shrink-0" 
              style={{ backgroundColor: typeColor }}
            />
            <div className={cn(
               "p-1 rounded-md",
               isIssue ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
            )}>
               {isIssue ? <Bug size={14} /> : <ClipboardList size={14} />}
            </div>
          </div>
        </div>
        
        {/* Title */}
        <span className={cn(
          "font-medium transition-all flex-1 truncate text-[12px]",
          isCompleted ? "text-muted-foreground/40 line-through" : "text-foreground/90",
          isIssue && !isCompleted ? "font-bold tracking-tight" : ""
        )}>
          {task.title}
        </span>
        
        {/* Timeline View */}
        <div className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0",
          "bg-muted/50 text-muted-foreground/60"
        )}>
          <Calendar className="w-2.5 h-2.5 opacity-60" />
          {timelineLabel}
        </div>

        {isCompleted && (
           <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        )}
      </div>
    </div>
  );
};
