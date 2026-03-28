import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Calendar,
  Tag,
  Users,
  AlertCircle,
  MessageSquare,
  Paperclip,
  X,
  CheckCircle2,
  Trash2,
  Copy,
  ChevronRight,
  Send,
  Plus,
} from "lucide-react";
import { Task } from "./ListTab";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface TaskDetailSheetProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  "not started": "bg-slate-500/10 text-slate-500 border-slate-500/20",
  inprogress: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  testing: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
};

const priorityConfig: Record<string, { label: string; color: string; icon: any }> = {
  low: { label: "Low", color: "text-green-500 bg-green-500/10", icon: CheckCircle2 },
  medium: { label: "Medium", color: "text-yellow-500 bg-yellow-500/10", icon: AlertCircle },
  high: { label: "High", color: "text-red-500 bg-red-500/10", icon: AlertCircle },
  none: { label: "None", color: "text-slate-500 bg-slate-500/10", icon: CheckCircle2 },
};

export const TaskDetailSheet = ({ task, isOpen, onClose }: TaskDetailSheetProps) => {
  if (!task) return null;

  const priority = priorityConfig[task.priority || "none"] || priorityConfig.none;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl w-full p-0 border-l border-neutral-800 bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col h-full">
          {/* Header Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
                    <Copy className="h-3.5 w-3.5" /> Copy ID
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <Badge className={cn("px-2.5 py-0.5 rounded-full capitalize font-medium", statusColors[task.status] || "bg-slate-500/10")}>
                    {task.status}
                </Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scrollbar-hide">
            {/* Title & Description */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-primary mb-1">
                    <Tag className="w-3 h-3" /> {task.type || "Task"}
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground/90 capitalize leading-tight">
                  {task.title}
                </h2>
              </div>
              <div className="group relative">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap min-h-[60px] p-3 rounded-xl border border-transparent hover:border-neutral-800 transition-colors bg-neutral-900/50">
                  {task.description || "No description provided. Click to add details..."}
                </p>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Assignees
                </label>
                <div className="flex -space-x-2">
                  {task.assignedTo && task.assignedTo.length > 0 ? (
                    task.assignedTo.map((person, i) => (
                      <Avatar key={i} className="w-8 h-8 border-2 border-background ring-1 ring-neutral-800">
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                          {person.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    ))
                  ) : (
                    <Button variant="outline" size="sm" className="rounded-full h-8 px-3 border-dashed gap-1.5 text-xs text-muted-foreground">
                        <Plus size={14} /> Assign
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" /> Priority
                </label>
                <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border", priority.color, "border-current/20")}>
                    <priority.icon className="w-3.5 h-3.5" />
                    {priority.label}
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Project Period
                </label>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/50 border border-neutral-800">
                  <div className="flex-1 flex items-center gap-2 text-sm font-medium">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {task.estimation ? (
                        <>
                            <span>{format(task.estimation.startDate, "MMMM d, yyyy")}</span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                            <span>{format(task.estimation.endDate, "MMMM d, yyyy")}</span>
                        </>
                    ) : (
                        <span className="text-muted-foreground">Set dates</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-neutral-800" />

            {/* Additional Sections (UI Only) */}
            <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Activity
                    </h3>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Recent First</Button>
                 </div>

                 <div className="space-y-4">
                    <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">You</span>
                                <span className="text-[10px] text-muted-foreground">Just now</span>
                            </div>
                            <div className="text-sm text-foreground/80 bg-neutral-900/50 p-3 rounded-xl rounded-tl-none border border-neutral-800">
                                This task is ready for review. I've completed the initial UI implementation.
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
          </div>

          {/* Comment Input */}
          <div className="p-4 border-t border-neutral-800 bg-neutral-950/50">
            <div className="relative group">
                <textarea 
                    placeholder="Write a comment..." 
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-4 pr-12 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none min-h-[100px]"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Paperclip size={16} />
                     </Button>
                </div>
                <div className="absolute bottom-4 right-4 animate-in fade-in zoom-in duration-300">
                     <Button size="icon" className="h-8 w-8 rounded-full bg-primary text-black hover:scale-105 transition-transform">
                        <Send size={14} />
                     </Button>
                </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
