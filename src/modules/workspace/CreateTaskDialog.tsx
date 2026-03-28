"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  X,
  CircleDashed,
  ChevronRight,
  Flag,
  User,
  CalendarIcon,
  Tag,
  Link2,
  MoreHorizontal,
  Bug,
  BugPlay,
  Ellipse,
  Ellipsis,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";
import { GetRepoStructure } from "./GetRepoStructure";

interface CreateTaskDialogProps {
  projectName: string;
  projectId: Id<"projects">; // From Convex
  repoFullName?: string; // owner/repo
  trigger: React.ReactNode;
}

export const CreateTaskDialog = ({
  projectName,
  projectId,
  repoFullName,
  trigger,
}: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not started");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "none">(
    "none",
  );
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [taskType, setTaskType] = useState("");

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const createTask = useMutation(api.workspace.createTask);

  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (!startDate || !endDate) {
      toast.error("Please select start and target dates");
      return;
    }

    try {
      setIsPending(true);
      await createTask({
        title,
        description: description.trim() || undefined,
        status: status as any,
        priority: priority === "none" ? undefined : (priority as any),
        estimation: {
          startDate: startDate.getTime(),
          endDate: endDate.getTime(),
        },
        type: taskType || "task",
        projectId,
        linkWithCodebase: selectedPath || undefined,
      });
      toast.success("Task created successfully");
      setOpen(false);
      // Reset form
      setTitle("");
      setDescription("");
      setStatus("not started");
      setPriority("none");
      setStartDate(undefined);
      setEndDate(undefined);
      setTaskType("");
      setSelectedPath(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create task");
    } finally {
      setIsPending(false);
    }
  };

  const statusIcons: Record<string, React.ReactNode> = {
    "not started": <Ellipsis className="w-3.5 h-3.5" />,
    inprogress: (
      <div className="w-3.5 h-3.5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />
    ),
    issue: <Bug className="w-3.5 h-3.5 text-red-500" />,
    reviewing: <CircleDashed className="w-3.5 h-3.5 text-blue-500" />,
    testing: <BugPlay className="w-3.5 h-3.5 text-indigo-500" />,
    completed: <div className="w-3.5 h-3.5 rounded-full bg-green-500" />,
  };

  const priorityIcons: Record<string, React.ReactNode> = {
    none: <MoreHorizontal className="w-3.5 h-3.5" />,
    low: (
      <div className="flex items-end gap-px h-3 mb-0.5">
        <div className="w-[1.5px] h-3 bg-yellow-500 rounded-px" />
        <div className="w-[1.5px] h-2 dark:bg-neutral-400 bg-accent rounded-px" />
        <div className="w-[1.5px] h-1.5 dark:bg-neutral-400 bg-accent rounded-px" />
        <div className="w-[1.5px] h-[4px] dark:bg-neutral-400 bg-accent rounded-px" />
      </div>
    ),
    medium: (
      <div className="flex items-end gap-px h-3 mb-0.5">
        <div className="w-[1.5px] h-3 bg-green-500 rounded-px" />
        <div className="w-[1.5px] h-2 bg-green-500 rounded-px" />
        <div className="w-[1.5px] h-1.5  dark:bg-neutral-400 bg-accent  rounded-px" />
        <div className="w-[1.5px] h-[4px] dark:bg-neutral-400 bg-accent rounded-px" />
      </div>
    ),
    high: (
      <div className="flex items-end gap-px h-3 mb-0.5">
        <div className="w-[1.5px] h-3 bg-red-500 rounded-px" />
        <div className="w-[1.5px] h-2.5 bg-red-500 rounded-px" />
        <div className="w-[1.5px] h-2 bg-red-500 rounded-px" />
        <div className="w-[1.5px] h-[4px] dark:bg-neutral-400 bg-accent rounded-px" />
      </div>
    ),
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full max-w-3xl bg-[#1c1c1c] border-[#2b2b2b] p-0 overflow-hidden text-neutral-200">
        <DialogHeader className="p-4 flex flex-row items-center gap-2 border-b border-[#2b2b2b]">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <div className="w-3 h-3 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white"></div>
            <span className="text-sm">{projectName}</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-xs">New task</span>
          </div>
        </DialogHeader>

        <div className="p-6 pb-2 space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label className="text-sm">Task Title</Label>
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base font-medium border bg-transparent p-2 focus-visible:ring-0 placeholder:text-neutral-600"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  {statusIcons[status]}
                  <span className="capitalize">{status.replace("-", " ")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200 ">
                <div className="text-xs text-center font-medium p-2 border-b border-accent">
                  Select Status
                </div>
                {Object.keys(statusIcons).map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => setStatus(s)}
                    className="gap-2 cursor-pointer"
                  >
                    {statusIcons[s]}
                    <span className="capitalize text-xs px-1.5">{s.replace("-", " ")}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  {priorityIcons[priority]}
                  <span>Priority</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200">
                <div className="text-xs text-center font-medium p-2 border-b border-accent">
                  Select Priority
                </div>
                {(["none", "low", "medium", "high"] as const).map((p) => (
                  <DropdownMenuItem
                    key={p}
                    onClick={() => setPriority(p)}
                    className="gap-2 cursor-pointer"
                  >
                    {priorityIcons[p]}
                    <span className="capitalize">{p}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Members */}
            <Button
              variant="outline"
              size="sm"
              className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]"
            >
              <User className="w-3.5 h-3.5" />
              Members
            </Button>

            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {startDate ? format(startDate, "MMM d") : "Start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1c1c1c] border-[#2b2b2b]">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="bg-[#1c1c1c] text-neutral-200"
                />
              </PopoverContent>
            </Popover>

            {/* End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {endDate ? format(endDate, "MMM d") : "Target date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-[#1c1c1c] border-[#2b2b2b]">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  className="bg-[#1c1c1c] text-neutral-200"
                />
              </PopoverContent>
            </Popover>

            {/* Type/Labels */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]"
                >
                  <Tag className="w-3.5 h-3.5" />
                  {taskType || "Type"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-3 bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-center text-muted-foreground border-b border-accent pb-2">
                    Custom Task Type
                  </p>
                  <Input
                    placeholder="e.g. Dashboard, Auth..."
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="h-8 bg-transparent border-[#333] text-xs focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Close or just keep value
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-1">
                    {["dashboard", "mobile", "auth", "infra"].map((t) => (
                      <Badge
                        key={t}
                        variant="ghost"
                        onClick={() => setTaskType(t)}
                        className="cursor-pointer bg-[#252525] hover:bg-blue-900/30 text-[10px] py-0 px-2 h-5 lowercase"
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Link Codebase */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]",
                    selectedPath && "text-blue-400 border-blue-900/50 bg-blue-900/10"
                  )}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  {selectedPath ? selectedPath.split('/').pop() : "Link Code"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0 bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200">
                <GetRepoStructure
                  repoFullName={repoFullName}
                  onSelect={setSelectedPath}
                  selectedPath={selectedPath}
                />
              </PopoverContent>
            </Popover>
          </div>

          <Textarea
            placeholder="Add a description, a project brief, or collect ideas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[220px] bg-transparent border-none p-2 focus-visible:ring-0 placeholder:text-neutral-600 resize-none text-sm leading-relaxed"
          />
        </div>

        <div className="p-4 border-t border-[#2b2b2b] flex items-center justify-end">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-8 text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleCreateTask}
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create task"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
