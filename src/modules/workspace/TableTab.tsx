"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Minus,
  FileCode,
  Edit,
  Trash2,
  Tag as TagIcon,
  Table as TableIcon,
  FolderPen,
  CircleDot,
  Hourglass,
  Box,
  Users,
  ChartNoAxesColumnIncreasing
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { Task } from "@/types/types";

interface TableTabProps {
  tasks: Task[];
}

const statusColors: Record<string, string> = {
  "not started": "bg-slate-500/10 text-slate-500 border-slate-500/20",
  inprogress: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  reviewing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  testing: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  issue: "bg-red-500/10 text-red-500 border-red-500/20",
};

const priorityIcons: Record<string, React.ReactNode> = {
  none: <Minus className="w-3.5 h-3.5 opacity-40" />,
  low: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[3px] h-5 bg-yellow-500 rounded-[1px]" />
      <div className="w-[3px] h-4 bg-accent rounded-[1px]" />
      <div className="w-[3px] h-3 bg-accent rounded-[1px]" />
      <div className="w-[3px] h-[8px] bg-accent rounded-[1px]" />
    </div>
  ),
  medium: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[3px] h-5 bg-green-500 rounded-[1px]" />
      <div className="w-[3px] h-4 bg-green-500 rounded-[1px]" />
      <div className="w-[3px] h-3 bg-accent rounded-[1px]" />
      <div className="w-[3px] h-[8px] bg-accent rounded-[1px]" />
    </div>
  ),
  high: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[3px] h-5 bg-rose-500 rounded-[1px]" />
      <div className="w-[3px] h-4 bg-rose-500 rounded-[1px]" />
      <div className="w-[3px] h-3 bg-rose-500 rounded-[1px]" />
      <div className="w-[3px] h-[8px] bg-accent rounded-[1px]" />
    </div>
  ),
};

const PriorityBadge = ({ priority = "none" }: { priority?: string }) => {
  return (
    <div className="flex items-center justify-center w-full">
      {priorityIcons[priority] || priorityIcons.none}
    </div>
  );
};

export const TableTab = ({ tasks }: TableTabProps) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedTaskForSheet, setSelectedTaskForSheet] = useState<Task | null>(null);

  const toggleTask = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleAll = () => {
    if (selectedTasks.length === tasks.length && tasks.length > 0) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map(t => t._id));
    }
  };

  return (
    <div className="relative bg-transparent border-none flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-auto custom-scrollbar">
        <Table>
          <TableHeader className="bg-neutral-900/40 sticky top-0 z-10 border-b border-neutral-800">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[50px] px-6 py-4">
                <Checkbox 
                  checked={selectedTasks.length === tasks.length && tasks.length > 0} 
                  onCheckedChange={toggleAll}
                  className="rounded border-neutral-700 data-[state=checked]:bg-primary"
                />
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wider text-primary/40 px-4 min-w-[200px]">
                <div className="flex items-center gap-2">
                  <FolderPen className="w-4 h-4" /> Task Name
                </div>
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wider text-primary/40 px-4">
                <div className="flex items-center gap-2">
                  <CircleDot className="w-4 h-4" /> Status
                </div>
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wider text-primary/40 px-4">
                <div className="flex items-center gap-2">
                  <Hourglass className="w-4 h-4" /> Timeline
                </div>
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wider text-primary/40 px-4">
                <div className="flex items-center gap-2">
                  <Box className="w-4 h-4" /> Tags
                </div>
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wider text-primary/40 px-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" /> Assigned
                </div>
              </TableHead>
              <TableHead className="text-[11px] font-medium uppercase tracking-wider text-primary/40 px-4 text-center">
                <div className="flex items-center gap-2 justify-center">
                  <ChartNoAxesColumnIncreasing className="w-4 h-4" /> Priority
                </div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 opacity-20">
                    <TableIcon size={32} />
                    <p className="text-xs font-medium uppercase tracking-widest text-primary/80">Empty Workspace</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => {
                const isSelected = selectedTasks.includes(task._id);
                
                return (
                  <TableRow 
                    key={task._id} 
                    className={cn(
                      "group border-b border-neutral-800/40 hover:bg-neutral-800/20 transition-all cursor-pointer",
                      isSelected && "bg-primary/5"
                    )}
                    onClick={() => setSelectedTaskForSheet(task)}
                  >
                    <TableCell className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={isSelected}
                        onCheckedChange={() => toggleTask(task._id)}
                        className="rounded border-neutral-800 data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                    <TableCell className="px-4 font-medium text-[13px] text-primary/70 group-hover:text-primary transition-colors">
                      {task.title}
                    </TableCell>
                    <TableCell className="px-4">
                      <Badge className={cn("px-2.5 py-0.5 rounded-full text-[10px] items-center border font-semibold capitalize", statusColors[task.status] || "bg-neutral-800")}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 text-[12px] font-medium text-primary/50">
                      {task.estimation ? (
                        <span className="flex items-center gap-1.5 opacity-80">
                          {format(task.estimation.startDate, "MMM d")} — {format(task.estimation.endDate, "MMM d")}
                        </span>
                      ) : (
                        <span className="opacity-20 italic">No timeline</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* {task.type && task.type.length > 0 ? (
                          task.type.map((tag: string, i: number) => (
                            <div key={i} className="flex items-center gap-1 bg-neutral-800/50 border border-neutral-800/50 px-2 py-0.5 rounded text-[9px] font-medium text-primary/40 uppercase">
                              <TagIcon size={8} className="opacity-50" /> {tag}
                            </div>
                          ))
                        ) : (
                          <span className="text-[10px] text-primary/10">—</span>
                        )} */}
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex -space-x-1.5">
                        {task.assignedTo?.map((person, i) => (
                          <Avatar key={i} className="w-6 h-6 border-2 border-background shadow-sm">
                            <AvatarImage src={person.avatar} className="grayscale brightness-90 hover:grayscale-0 transition-all" />
                            <AvatarFallback className="text-[9px] bg-neutral-800 text-primary/40 font-bold uppercase">
                              {person.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="px-4">
                       <PriorityBadge priority={task.priority} />
                    </TableCell>
                    <TableCell className="px-4 text-right" onClick={(e) => e.stopPropagation()}>
                       <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-primary/20 hover:text-primary transition-all rounded hover:bg-neutral-800">
                             <MoreHorizontal size={14} />
                           </Button>
                         </DropdownMenuTrigger>
                         <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-primary/80 min-w-[140px] rounded-xl shadow-2xl">
                           <DropdownMenuItem className="text-xs font-semibold py-2 cursor-pointer focus:bg-neutral-800 focus:text-primary gap-2">
                             <Edit size={14} className="opacity-50" /> Edit
                           </DropdownMenuItem>
                           <DropdownMenuItem className="text-xs font-semibold py-2 cursor-pointer focus:bg-rose-500/10 focus:text-rose-500 text-rose-500/80 gap-2">
                             <Trash2 size={14} /> Delete
                           </DropdownMenuItem>
                         </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating Selected Toolbar */}
      {selectedTasks.length > 0 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-800 shadow-2xl rounded-2xl p-2 flex items-center gap-2 px-4 py-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
          <div className="text-[11px] font-semibold text-primary/90 mr-3 border-r border-neutral-800 pr-3">
            {selectedTasks.length} Selected
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-semibold text-primary/60 hover:text-primary hover:bg-neutral-800 rounded-lg gap-2">
            <FileCode size={13} /> Apply Code
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-semibold text-primary/60 hover:text-primary hover:bg-neutral-800 rounded-lg gap-2">
            <Edit size={13} /> Edit
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-semibold text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg gap-2">
            <Trash2 size={13} /> Delete
          </Button>
        </div>
      )}

      {/* Simple Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800/60 mt-auto">
        <div className="text-[10px] font-medium text-primary/30 uppercase tracking-widest">
           Showing {tasks.length} Results
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] font-semibold bg-transparent border-neutral-800 text-primary/40 hover:text-primary transition-all disabled:opacity-20">
            <ChevronLeft size={12} className="mr-1" /> Previous
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="secondary" size="sm" className="h-7 w-7 text-[10px] font-bold p-0 bg-primary/10 text-primary border border-primary/20 rounded-md">1</Button>
          </div>
          <Button variant="outline" size="sm" className="h-7 px-3 text-[10px] font-semibold bg-transparent border-neutral-800 text-primary/40 hover:text-primary transition-all disabled:opacity-20">
            Next <ChevronRight size={12} className="ml-1" />
          </Button>
        </div>
      </div>

      <TaskDetailSheet 
        task={selectedTaskForSheet} 
        isOpen={!!selectedTaskForSheet} 
        onClose={() => setSelectedTaskForSheet(null)} 
      />
    </div>
  );
};
