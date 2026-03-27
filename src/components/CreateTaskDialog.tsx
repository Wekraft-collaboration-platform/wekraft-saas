"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
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
  MoreHorizontal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
  projectName: string;
  projectId: string; // From Convex
  trigger: React.ReactNode;
}

export const CreateTaskDialog = ({ projectName, projectId, trigger }: CreateTaskDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("not started");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "none">("none");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [taskType, setTaskType] = useState("");

  const statusIcons: Record<string, React.ReactNode> = {
    "not started": <CircleDashed className="w-3.5 h-3.5" />,
    "inprogress": <div className="w-3.5 h-3.5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin" />,
    "issue": <X className="w-3.5 h-3.5 text-red-500" />,
    "reviewing": <CircleDashed className="w-3.5 h-3.5 text-blue-500" />,
    "testing": <CircleDashed className="w-3.5 h-3.5 text-purple-500" />,
    "completed": <div className="w-3.5 h-3.5 rounded-full bg-green-500" />,
  };

  const priorityIcons = {
    none: <MoreHorizontal className="w-3.5 h-3.5" />,
    low: <Flag className="w-3.5 h-3.5 text-blue-400" />,
    medium: <Flag className="w-3.5 h-3.5 text-yellow-400" />,
    high: <Flag className="w-3.5 h-3.5 text-red-400" />,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#1c1c1c] border-[#2b2b2b] p-0 overflow-hidden text-neutral-200">
        <DialogHeader className="p-4 flex flex-row items-center gap-2 border-b border-[#2b2b2b]">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
             <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white">
                W
             </div>
             <span>{projectName}</span>
             <ChevronRight className="w-3 h-3" />
             <span>New task</span>
          </div>
        </DialogHeader>

        <div className="p-6 pb-2 space-y-4">
          <Input 
            placeholder="Task title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-neutral-600"
          />
          
          <div className="flex flex-wrap gap-2 items-center">
            {/* Status */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]">
                  {statusIcons[status]}
                  <span className="capitalize">{status.replace("-", " ")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200">
                {Object.keys(statusIcons).map((s) => (
                  <DropdownMenuItem key={s} onClick={() => setStatus(s)} className="gap-2 cursor-pointer">
                    {statusIcons[s]}
                    <span className="capitalize">{s.replace("-", " ")}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Priority */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]">
                  {priorityIcons[priority]}
                  <span className="capitalize">{priority === "none" ? "Priority" : priority}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200">
                {(["none", "low", "medium", "high"] as const).map((p) => (
                  <DropdownMenuItem key={p} onClick={() => setPriority(p)} className="gap-2 cursor-pointer">
                    {priorityIcons[p]}
                    <span className="capitalize">{p}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Members */}
            <Button variant="outline" size="sm" className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]">
              <User className="w-3.5 h-3.5" />
              Members
            </Button>

            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]">
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
                <Button variant="outline" size="sm" className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]">
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
                <Button variant="outline" size="sm" className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]">
                  <Tag className="w-3.5 h-3.5" />
                  {taskType || "Type"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-3 bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200">
                <div className="space-y-3">
                  <p className="text-xs font-medium text-neutral-500">Custom Task Type</p>
                  <Input 
                    placeholder="e.g. Dashboard, Auth..." 
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value)}
                    className="h-8 bg-transparent border-[#333] text-xs focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
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

             <Button variant="outline" size="sm" className="h-7 bg-[#252525] border-[#333] hover:bg-[#2b2b2b] text-neutral-400 px-2 gap-1.5 rounded-full text-[11px]">
                <Link2 className="w-3.5 h-3.5" />
                Link Code
             </Button>
          </div>

          <Textarea 
            placeholder="Add a description, a project brief, or collect ideas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[160px] bg-transparent border-none p-0 focus-visible:ring-0 placeholder:text-neutral-600 resize-none text-sm leading-relaxed"
          />
        </div>

        <div className="p-4 border-t border-[#2b2b2b] flex items-center justify-between">
            <div className="flex items-center gap-2">
               <span className="text-[10px] text-neutral-500 px-1.5 py-0.5 border border-[#333] rounded uppercase font-bold">M</span>
               <span className="text-[11px] text-neutral-500 font-medium">Add milestones</span>
               <Plus className="w-3.5 h-3.5 text-neutral-500" />
            </div>

            <div className="flex items-center gap-3">
               <Button variant="ghost" onClick={() => setOpen(false)} className="h-8 text-xs text-neutral-400 hover:text-white">
                  Cancel
               </Button>
               <Button className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white px-4">
                  Create task
               </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
