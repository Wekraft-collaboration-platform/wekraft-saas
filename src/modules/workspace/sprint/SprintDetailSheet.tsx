"use client";

import React from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  Calendar,
  Plus,
  Bug,
  TextQuote,
  CheckCircle2,
  X,
  ChevronDown,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc } from "../../../../convex/_generated/dataModel";
import { SprintComments } from "./SprintComments";

interface SprintDetailSheetProps {
  item: Doc<"tasks"> | Doc<"issues"> | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SprintDetailSheet = ({
  item,
  isOpen,
  onClose,
}: SprintDetailSheetProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const isIssue = !!(item && "severity" in item);

  const creator = useQuery(
    api.user.getUserById,
    item ? { userId: item.createdByUserId } : "skip"
  );

  if (!item) return null;

  const priority = isIssue 
    ? (item as Doc<"issues">).severity || "low"
    : (item as Doc<"tasks">).priority || "low";

  const status = item.status as string;
  
  const deadline = isIssue 
    ? (item as Doc<"issues">).due_date 
    : (item as Doc<"tasks">).estimation?.endDate;

  const priorityColors: Record<string, string> = {
    critical: "bg-rose-500",
    high: "bg-rose-500",
    medium: "bg-amber-500",
    low: "bg-emerald-500",
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md w-full h-full p-0 border-l border-border bg-card text-card-foreground flex flex-col shadow-2xl transition-all duration-300">
        <SheetHeader className="sr-only">
          <SheetTitle>{item.title}</SheetTitle>
          <SheetDescription>
            {isIssue ? "Issue" : "Task"} detail view for {item.title}
          </SheetDescription>
        </SheetHeader>
        {/*Header*/}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
             <div className={cn(
               "p-2 rounded-lg",
               isIssue ? "bg-rose-500/10 text-rose-500" : "bg-blue-500/10 text-blue-500"
             )}>
                {isIssue ? <Bug size={18} /> : <CheckCircle2 size={18} />}
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">
                  {isIssue ? "Issue" : "Task"}
                </span>
                <span className="text-xs font-medium text-muted-foreground mt-0.5">
                  WK-{item._id.toString().slice(-4).toUpperCase()}
                </span>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted" onClick={onClose}>
              <X size={18} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 w-full h-full">
          <div className="px-6 py-8 space-y-8 pb-20">
            {/* Title & Status */}
            <div className="space-y-4">
              <h1 className="text-xl font-bold tracking-tight text-foreground/90 leading-tight outline-none">
                {item.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2">
                 <Badge variant="secondary" className="px-2 py-0.5 bg-muted/50 border-border text-[10px] font-semibold uppercase tracking-wide">
                    {status}
                 </Badge>
                 <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/30 border border-border/50 text-[10px] font-medium text-muted-foreground">
                    <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", priorityColors[priority.toLowerCase()] || "bg-slate-400")} />
                    <span className="capitalize">{priority}</span>
                 </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-muted-foreground/70">
                <TextQuote size={13} />
                <h3 className="text-[10px] font-bold uppercase tracking-wider">Description</h3>
              </div>
              <div className={cn(
                "rounded-xl border border-border/40 group hover:border-border/80 transition-all overflow-hidden",
                item.description ? "bg-muted/5" : "bg-muted/20"
              )}>
                <ScrollArea className={cn(
                   "w-full",
                   item.description ? "max-h-[250px]" : "h-auto"
                )}>
                  <div className="p-4">
                    <p className={cn(
                      "text-[13px] leading-relaxed whitespace-pre-wrap",
                      item.description ? "text-foreground/80" : "text-muted-foreground/40 italic"
                    )}>
                      {item.description || "No description provided."}
                    </p>
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* Details Section */}
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="space-y-4">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer group/trigger select-none">
                  <div className="flex items-center gap-2 text-muted-foreground/70">
                    <Info size={13} />
                    <h3 className="text-[10px] font-bold uppercase tracking-wider">Details</h3>
                  </div>
                  <div className="flex items-center justify-center p-1 rounded-md bg-muted/0 group-hover/trigger:bg-muted/50 transition-colors duration-200">
                    <ChevronDown 
                      size={14} 
                      className={cn(
                        "text-muted-foreground/60 transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/trigger:text-foreground focus:outline-none",
                        isDetailsOpen && "rotate-180"
                      )} 
                    />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden">
                <div className="grid grid-cols-1 gap-y-6 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Assignee</span>
                    <div className="flex items-center gap-2">
                       <div className="flex -space-x-1.5">
                          {(isIssue ? (item as Doc<"issues">).IssueAssignee : (item as Doc<"tasks">).assignedTo)?.map((u: any, i: number) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background shadow-sm">
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback className="text-[8px] bg-muted">{u.name[0]}</AvatarFallback>
                            </Avatar>
                          )) || <div className="text-[11px] text-muted-foreground italic">Unassigned</div>}
                       </div>
                       {(isIssue ? (item as Doc<"issues">).IssueAssignee : (item as Doc<"tasks">).assignedTo)?.length === 0 && (
                         <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full border border-dashed border-border/40 hover:border-border text-muted-foreground">
                            <Plus size={12} />
                         </Button>
                       )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Reporter</span>
                    <div className="flex items-center gap-2">
                       <Avatar className="h-6 w-6 shadow-sm">
                          <AvatarImage src={creator?.avatarUrl || undefined} />
                          <AvatarFallback className="text-[8px] bg-muted">{creator?.name?.[0] || "?"}</AvatarFallback>
                       </Avatar>
                       <span className="text-[12px] font-medium text-foreground/80">{creator?.name || "..."}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Created At</span>
                    <div className="flex items-center gap-2 text-[12px] text-foreground/80 font-medium">
                      <Calendar size={13} className="text-muted-foreground/50" />
                      <span>{format(item.createdAt, "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Deadline</span>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-rose-500">
                      <Clock size={13} className="text-rose-500/50" />
                      <span>{deadline ? format(deadline, "MMM d, yyyy") : "No deadline"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Updated At</span>
                    <div className="flex items-center gap-2 text-[12px] text-foreground/80 font-medium">
                       <Clock size={13} className="text-muted-foreground/50" />
                       <span>{format(item.updatedAt, "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator className="bg-border/30" />

            {/* Extracted Comments Section */}
            <SprintComments itemId={item._id} isIssue={isIssue} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
