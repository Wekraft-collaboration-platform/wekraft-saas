"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  MoreVertical, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  CheckCircle2, 
  GripVertical,
  Calendar,
  Goal,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SprintTaskCard } from "./SprintTaskCard";
import { addDays } from "date-fns";
import { toast } from "sonner";

interface SprintBacklogProps {
  projectId: Id<"projects">;
  sprints: Doc<"sprints">[];
  allTasks: Doc<"tasks">[];
  allIssues: Doc<"issues">[];
}

export const SprintBacklog = ({ 
  projectId, 
  sprints, 
  allTasks, 
  allIssues 
}: SprintBacklogProps) => {
  const createSprint = useMutation(api.sprints.createSprint);
  const deleteSprint = useMutation(api.sprints.deleteSprint);
  const updateTaskSprint = useMutation(api.sprints.updateTaskSprint);

  const backlogTasks = allTasks.filter(t => !t.sprintId);
  const backlogIssues = allIssues.filter(i => !i.sprintId);

  const handleCreateSprint = async () => {
    const sprintCount = sprints.length + 1;
    await createSprint({
      projectId,
      name: `Sprint ${sprintCount}`,
    });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Sprints Section */}
      <div className="space-y-6">
        {sprints.map((sprint) => (
          <SprintSection 
            key={sprint._id} 
            sprint={sprint} 
            tasks={allTasks.filter(t => t.sprintId === sprint._id)}
            issues={allIssues.filter(i => i.sprintId === sprint._id)}
            allSprints={sprints}
          />
        ))}

        {sprints.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-muted/10 opacity-50">
            <Goal className="w-10 h-10 mb-4 text-muted-foreground" />
            <p className="text-sm font-medium">No sprints created yet</p>
            <Button 
              variant="link" 
              onClick={handleCreateSprint}
              className="mt-2 text-primary"
            >
              Create your first sprint
            </Button>
          </div>
        )}
      </div>

      {/* Backlog Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-muted rounded-lg">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
             </div>
             <div>
                <h3 className="font-bold text-lg leading-none">Backlog</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {backlogTasks.length + backlogIssues.length} items
                </p>
             </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleCreateSprint} className="h-9 gap-2 font-bold rounded-xl border-dashed">
            <Plus className="w-4 h-4" />
            Create Sprint
          </Button>
        </div>

        <div className="bg-muted/20 rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/30">
          {[
            ...backlogTasks, 
            ...backlogIssues
          ].map((item) => (
            <div key={item._id} className="group relative flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="w-4 h-4 text-muted-foreground/40" />
              </div>
              <SprintTaskCard 
                task={item} 
                availableSprints={sprints}
                onMoveToSprint={(sprintId) => {
                  if ("severity" in item) {
                    updateTaskSprint({ issueId: item._id as Id<"issues">, sprintId });
                  } else {
                    updateTaskSprint({ taskId: item._id as Id<"tasks">, sprintId });
                  }
                }}
              />
            </div>
          ))}

          {backlogTasks.length === 0 && backlogIssues.length === 0 && (
            <div className="p-8 text-center opacity-30 italic text-sm">
              Your backlog is empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SprintSectionProps {
  sprint: Doc<"sprints">;
  tasks: Doc<"tasks">[];
  issues: Doc<"issues">[];
  allSprints: Doc<"sprints">[];
}

const SprintSection = ({ sprint, tasks, issues, allSprints }: SprintSectionProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const deleteSprint = useMutation(api.sprints.deleteSprint);
  const updateTaskSprint = useMutation(api.sprints.updateTaskSprint);

  const statusColors = {
    planned: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    completed: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="rounded-2xl border bg-card/50 shadow-sm overflow-hidden border-border/60">
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 bg-muted/30 border-b border-border/40",
        sprint.status === "active" && "bg-primary/5"
      )}>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-6 h-6"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
          
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-base">{sprint.name}</h3>
            <Badge variant="outline" className={cn("text-[10px] font-bold uppercase py-0 px-2", statusColors[sprint.status])}>
              {sprint.status}
            </Badge>
            {sprint.startDate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 ml-2">
                <Calendar className="w-3 h-3" />
                {format(sprint.startDate, "MMM d")} - {format(sprint.endDate!, "MMM d")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {sprint.status === "planned" && (
            <StartSprintDialog sprint={sprint} />
          )}
          {sprint.status === "active" && (
            <Button size="sm" className="h-8 font-bold gap-2 rounded-lg border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 transition-all">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Complete
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/40 shadow-xl">
              <DropdownMenuItem className="text-[13px] font-medium py-2.5">
                Edit Sprint
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-[13px] font-medium py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive"
                onClick={() => deleteSprint({ sprintId: sprint._id })}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete Sprint
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Goal */}
      {sprint.goal && (
        <div className="px-6 py-2 bg-muted/10 border-b border-border/20">
          <p className="text-xs text-muted-foreground italic flex items-center gap-2">
            <Goal className="w-3 h-3 opacity-40 shrink-0" />
            {sprint.goal}
          </p>
        </div>
      )}

      {/* Tasks List */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border/30">
              {[...tasks, ...issues].map((item) => (
                <div key={item._id} className="group flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab pl-1">
                      <GripVertical className="w-4 h-4 text-muted-foreground/30" />
                   </div>
                   <SprintTaskCard 
                      task={item} 
                      availableSprints={allSprints}
                      onMoveToSprint={(sprintId) => {
                        if ("severity" in item) {
                          updateTaskSprint({ issueId: item._id as Id<"issues">, sprintId });
                        } else {
                          updateTaskSprint({ taskId: item._id as Id<"tasks">, sprintId });
                        }
                      }}
                   />
                </div>
              ))}
              {tasks.length === 0 && issues.length === 0 && (
                <div className="p-10 text-center opacity-30 select-none">
                  <p className="text-sm font-medium italic">Sprint is empty</p>
                  <p className="text-[10px] mt-1">Drag and drop items here to plan your sprint</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface StartSprintDialogProps {
  sprint: Doc<"sprints">;
}

const StartSprintDialog = ({ sprint }: StartSprintDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(sprint.name);
  const [goal, setGoal] = useState(sprint.goal || "");
  const [duration, setDuration] = useState("14"); // default 2 weeks
  const startSprint = useMutation(api.sprints.startSprint);

  const handleStart = async () => {
    try {
      const startDate = Date.now();
      const endDate = addDays(new Date(), parseInt(duration)).getTime();
      
      await startSprint({
        sprintId: sprint._id,
        startDate,
        endDate,
      });
      
      setOpen(false);
      toast.success(`${name} started!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to start sprint");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 font-bold gap-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-all">
          <Play className="w-3.5 h-3.5 fill-current" />
          Start Sprint
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-border/40">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Start Sprint</DialogTitle>
          <DialogDescription>
            Setting a sprint goal and duration helps your team focus.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sprint Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/20 border-border/40 rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-muted/20 border-border/40 rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goal" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sprint Goal</Label>
            <Textarea
              id="goal"
              placeholder="What do we want to achieve?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="bg-muted/20 border-border/40 rounded-xl min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold">Cancel</Button>
          <Button onClick={handleStart} className="rounded-xl font-bold px-8">Start Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
