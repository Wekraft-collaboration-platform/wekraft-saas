"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Flag,
  Hourglass,
  CheckCircle2,
  Calendar,
  ChevronDown,
  Info,
  MoreVertical
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface SprintTaskCardProps {
  task: Doc<"tasks"> | Doc<"issues">;
  availableSprints?: Doc<"sprints">[];
  onMoveToSprint?: (sprintId: Id<"sprints"> | undefined) => void;
}

export const SprintTaskCard = ({ task, availableSprints, onMoveToSprint }: SprintTaskCardProps) => {
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

  const assignees = isIssue 
    ? (task as Doc<"issues">).IssueAssignee || []
    : (task as Doc<"tasks">).assignedTo || [];

  const estimation = !isIssue ? (task as Doc<"tasks">).estimation : null;
  const isCompleted = status.toLowerCase() === "completed" || status.toLowerCase() === "closed";
  const creationDate = format(new Date(task.createdAt), "MMM d, yyyy");
  const dueDate = estimation ? format(new Date(estimation.endDate), "MMM d") : null;

  const timelineLabel = isIssue 
    ? (task as Doc<"issues">).due_date 
      ? `${format(new Date(task.createdAt), "MMM d")} - ${format(new Date((task as Doc<"issues">).due_date!), "MMM d")}`
      : format(new Date(task.createdAt), "MMM d")
    : (task as Doc<"tasks">).estimation
      ? `${format(new Date((task as Doc<"tasks">).estimation.startDate), "MMM d")} - ${format(new Date((task as Doc<"tasks">).estimation.endDate), "MMM d")}`
      : format(new Date(task.createdAt), "MMM d");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
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
            className="flex items-center h-full px-3 gap-3.5"
          >
            <div className="flex items-center shrink-0">
              {/* Status Icon */}
              <div className="w-3.5 h-full flex items-center justify-center shrink-0">
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <div 
                    className="w-[3px] h-6 rounded-full" 
                    style={{ backgroundColor: typeColor }}
                  />
                )}
              </div>
            </div>
            
            {/* Title */}
            <span className={cn(
              "font-medium transition-all flex-1 truncate text-[13px]",
              isCompleted ? "text-muted-foreground/40 line-through" : "text-foreground/90"
            )}>
              {task.title}
            </span>
            
            {/* Timeline View */}
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0",
              "bg-muted/50 text-muted-foreground/60"
            )}>
              <Calendar className="w-3 h-3 opacity-60" />
              {timelineLabel}
            </div>

            {/* Move Action (Optional) */}
            {availableSprints && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                   <Button variant="ghost" size="icon" className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg ml-1 shrink-0">
                      <MoreVertical className="w-4 h-4" />
                   </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/40 shadow-xl">
                   <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Move to</div>
                   {availableSprints.map((s) => (
                      <DropdownMenuItem 
                        key={s._id} 
                        className={cn("text-[13px] font-medium py-2.5", task.sprintId === s._id && "bg-primary/5 text-primary")}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveToSprint?.(s._id);
                        }}
                      >
                        {s.name}
                      </DropdownMenuItem>
                   ))}
                   <DropdownMenuItem 
                      className={cn("text-[13px] font-medium py-2.5", !task.sprintId && "bg-primary/5 text-primary")}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveToSprint?.(undefined);
                      }}
                    >
                      Backlog
                   </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none shadow-2xl bg-card">
        <div className="flex flex-col relative">
          {/* Accent Header */}
          <div 
            className="h-2 w-full absolute top-0 left-0" 
            style={{ backgroundColor: typeColor }} 
          />
          
          <div className="px-8 pt-10 pb-8">
            {/* Header Content */}
            <div className="flex items-start justify-between gap-6 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-primary/20 bg-primary/5 text-primary">
                    {isIssue ? "Issue" : "Task"}
                  </Badge>
                  {"isBlocked" in task && task.isBlocked && (
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-rose-500/20 bg-rose-500/5 text-rose-500">
                      Blocked
                    </Badge>
                  )}
                  <Separator orientation="vertical" className="h-3 mx-1" />
                  <span className="text-[11px] text-muted-foreground/50 font-medium">
                    Created {creationDate}
                  </span>
                </div>
                
                <h2 className={cn(
                  "text-2xl font-bold tracking-tight leading-tight",
                  isCompleted ? "text-muted-foreground line-through opacity-70" : "text-foreground"
                )}>
                  {task.title}
                </h2>
              </div>
              

            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info className="w-3 h-3" />
                    Description
                  </h4>
                  {task.description ? (
                    <p className="text-[14px] text-muted-foreground leading-relaxed">
                      {task.description}
                    </p>
                  ) : (
                    <p className="text-[14px] text-muted-foreground/30 italic">
                      No description provided.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Badges Section */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/40 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                      <Flag className="w-3 h-3" />
                      Priority
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-foreground capitalize">
                        {priority}
                      </span>
                      <div className="w-1 h-3 rounded-full" style={{ backgroundColor: typeColor }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/30 border border-border/40 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                      <Hourglass className="w-3 h-3" />
                      Timeline
                    </span>
                    <span className="text-[13px] font-bold text-foreground">
                      {dueDate || "None"}
                    </span>
                  </div>
                </div>

                {/* Assignees Section */}
                <div>
                  <h4 className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest mb-3">
                    Assignees
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {assignees.map((assignee) => (
                      <div
                        key={assignee.userId}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-border bg-card shadow-sm hover:border-primary/20 transition-all cursor-default"
                      >
                        <Avatar className="w-5 h-5 border border-background shrink-0">
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback className="text-[8px] bg-muted font-bold">{assignee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-[12px] font-bold text-foreground/80 pr-1">
                          {assignee.name}
                        </span>
                      </div>
                    ))}
                    {assignees.length === 0 && (
                      <span className="text-[12px] text-muted-foreground/30 italic">Unassigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Meta Data */}
            <Separator className="mb-6 opacity-30" />
            <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground/50">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  ID: <span className="text-foreground/40">TSK-{task._id.toString().slice(-4).toUpperCase()}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="h-8 text-xs font-bold text-primary hover:bg-primary/5 hover:text-primary rounded-lg">
                  Edit Details
                </Button>
              </div>
            </div>
          </div>
        </div>
    </DialogContent>
    </Dialog>
  );
};
