"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Doc } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MoreHorizontal,
  Hexagon,
  Flag,
  Hourglass,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SprintTaskCardProps {
  task: Doc<"tasks"> | Doc<"issues">;
  variant?: "standard" | "slim";
}

export const SprintTaskCard = ({ task, variant = "standard" }: SprintTaskCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const isIssue = "severity" in task;
  
  const priority = (isIssue 
    ? (task as Doc<"issues">).severity 
    : (task as Doc<"tasks">).priority) || "low";

  const priorityColors: Record<string, string> = {
    critical: "#e74c3c", // Red
    high: "#e74c3c",     // Red
    medium: "#27ae60",   // Green
    low: "#f1c40f",      // Yellow/Amber
    normal: "#95a5a6",   // Gray
    none: "#95a5a6",     // Gray
  };

  const status = task.status as string;
  const typeColor = priorityColors[priority.toLowerCase()] || "#94a3b8";

  // Real-time progress calculation based on status
  const getProgress = (status: string) => {
    switch (status.toLowerCase()) {
      case "not started": case "not opened": case "reopened": return 0;
      case "inprogress": case "opened": return 30;
      case "testing": return 60;
      case "reviewing": case "in review": return 80;
      case "completed": case "closed": return 100;
      default: return 0;
    }
  };

  const progress = getProgress(status);

  const assignees = isIssue 
    ? (task as Doc<"issues">).IssueAssignee || []
    : (task as Doc<"tasks">).assignedTo || [];

  const estimation = !isIssue ? (task as Doc<"tasks">).estimation : null;
  const isCompleted = status.toLowerCase() === "completed" || status.toLowerCase() === "closed";
  const creationDate = format(new Date(task.createdAt), "MMM d, yyyy");
  const dueDate = estimation ? format(new Date(estimation.endDate), "MMM d") : null;

  return (
    <LayoutGroup>
      <motion.div
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative bg-card border border-border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col w-full",
          isHovered 
            ? "rounded-2xl p-6 shadow-xl z-20" 
            : cn(
                "shadow-sm hover:border-border/80",
                variant === "slim" ? "rounded-md p-2" : "rounded-xl p-3"
              )
        )}
        style={{
          boxShadow: isHovered 
            ? `0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1), 0 0 20px 0px ${typeColor}15`
            : "0 1px 3px rgba(0,0,0,0.05)"
        }}
      >
        {/* Compact Default View */}
        {!isHovered && (
          <motion.div 
            layout="position"
            className={cn(
              "flex items-center h-6 px-1",
              variant === "slim" ? "gap-3" : "gap-4"
            )}
          >
            {/* Priority Vertical Bar / Checkmark */}
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <div 
                className="w-1.5 h-full rounded-full shrink-0" 
                style={{ backgroundColor: typeColor }}
              />
            )}
            
            {/* Title */}
            <span className={cn(
              "font-medium transition-all flex-1 truncate",
              variant === "slim" ? "text-xs" : "text-[13px]",
              isCompleted ? "text-muted-foreground/40 line-through" : "text-foreground/90"
            )}>
              {task.title}
            </span>
            
            {/* Priority Badge */}
            <div className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0",
              isCompleted ? "bg-emerald-500/10 text-emerald-600/70" : "bg-muted/80 text-muted-foreground"
            )}>
              {priority}
            </div>
          </motion.div>
        )}

        {/* Expanded Hover View */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col"
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <motion.h3 
                      layout
                      className={cn(
                        "font-bold text-xl tracking-tight leading-tight flex items-center gap-2",
                        isCompleted ? "text-muted-foreground line-through opacity-70" : "text-foreground"
                      )}
                    >
                      {isCompleted && <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 inline-block" />}
                      {task.title}
                    </motion.h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                        {isIssue ? "Issue" : "Task"}
                      </span>
                      {"isBlocked" in task && task.isBlocked && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 uppercase">
                          Blocked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button
                  className="p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Description Section */}
              {task.description && (
                <div className="mb-6 pl-1">
                  <div className="flex gap-3">
                    <Info className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Actionable Badges: Priority & Status */}
              <div className="flex flex-col gap-4 mb-6">
                {/* Priority Selection Mock */}
                <div className="flex-1 flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-3">
                    <Flag className="w-4 h-4 text-muted-foreground/50" />
                    <span className="text-[13px] font-medium text-muted-foreground/60">Priority</span>
                  </div>
                  <div 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-[12px] font-bold shadow-sm"
                    style={{ backgroundColor: typeColor }}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </div>

                {/* Status Selection Mock */}
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hourglass className="w-4 h-4 text-muted-foreground/50" />
                    <span className="text-[13px] font-medium text-muted-foreground/60">Status</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-foreground text-[12px] font-bold shadow-sm">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </div>
              </div>

              {/* Timeline & Metadata */}
              <div className="flex flex-col gap-4 pt-1 px-4 py-3 rounded-xl bg-muted/30 border border-border/50 mb-7">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider">Timeline</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground/40" />
                    <span className="text-xs font-semibold text-foreground/80">
                      {creationDate} {dueDate && `- ${dueDate}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Assignees List */}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <span className="text-[11px] text-muted-foreground/50 font-bold uppercase tracking-wider mb-1">Assignees</span>
                <div className="flex flex-wrap gap-2">
                  {assignees.map((assignee) => (
                    <motion.div
                      layout
                      key={assignee.userId}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-border bg-card shadow-sm hover:border-primary/30 transition-colors"
                    >
                      <Avatar className="w-6 h-6 border-2 border-background shadow-xs shrink-0">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback className="text-[9px] bg-muted font-bold">{assignee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-[12px] font-bold text-foreground/90 pr-1">
                        {assignee.name}
                      </span>
                    </motion.div>
                  ))}
                  {assignees.length === 0 && (
                    <span className="text-[12px] text-muted-foreground/40 italic pl-1">Unassigned</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
};




