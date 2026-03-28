import React, { useState } from "react";
import {
  ChevronDown,
  Plus,
  FolderPen,
  TextQuote,
  Hourglass,
  Box,
  Users,
  ChartNoAxesColumnIncreasing,
  Ghost,
  Clock,
  MoreHorizontal,
  Layout,
  Smartphone,
  Server,
  AlertCircle,
  Layers2,
  Minus,
  Edit,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskDetailSheet } from "./TaskDetailSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Id } from "../../../convex/_generated/dataModel";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  estimation: { startDate: number; endDate: number };
  type?: string;
  assignedTo?: { name: string; avatar?: string; userId: Id<"users"> }[];
  priority?: string;
  status: string;
}

const priorityIcons: Record<string, React.ReactNode> = {
  none: <Minus className="w-3.5 h-3.5" />,
  low: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[4px] h-5 bg-yellow-500 rounded-px" />
      <div className="w-[4px] h-4 dark:bg-neutral-400 bg-accent rounded-px" />
      <div className="w-[4px] h-3 dark:bg-neutral-400 bg-accent rounded-px" />
      <div className="w-[4px] h-[8px] dark:bg-neutral-400 bg-accent rounded-px" />
    </div>
  ),
  medium: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[4px] h-5 bg-green-500 rounded-px" />
      <div className="w-[4px] h-4 bg-green-500 rounded-px" />
      <div className="w-[4px] h-3  dark:bg-neutral-400 bg-accent  rounded-px" />
      <div className="w-[4px] h-[8px] dark:bg-neutral-400 bg-accent rounded-px" />
    </div>
  ),
  high: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[4px] h-5 bg-red-500 rounded-px" />
      <div className="w-[4px] h-4 bg-red-500 rounded-px" />
      <div className="w-[4px] h-3 bg-red-500 rounded-px" />
      <div className="w-[4px] h-[8px] dark:bg-neutral-400 bg-accent rounded-px" />
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


interface TaskGroupProps {
  title: string;
  tasks: Task[];
  accentColor: string;
  defaultExpanded?: boolean;
  onTaskClick: (task: Task) => void;
}

const TaskGroup = ({
  title,
  tasks,
  accentColor,
  defaultExpanded = false,
  onTaskClick,
}: TaskGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4 px-4 dark:bg-neutral-900 py-1.5 rounded-md">
        <div
          className="flex items-center gap-3 cursor-pointer w-full select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground bg-muted rounded transition-transform duration-200",
              !isExpanded && "-rotate-90",
            )}
          />
          <div className={cn("w-1 h-5 rounded-full", accentColor)} />
          <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
            {title}
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {tasks.length}
            </span>
          </h2>
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          className="h-6 w-6 rounded-md transition-all hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {isExpanded && (
        <div className="overflow-hidden w-full bg-background mt-2">
          <Table className="border-t border-b border-neutral-800">
            <TableHeader className=" border-none">
              <TableRow className="hover:bg-transparent dark:bg-neutral-950 border-none">
                <TableHead className="w-[50px] px-4">
                  <Checkbox className="rounded border-muted-foreground/30 data-[state=checked]:bg-primary" />
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium  capitalize tracking-widest min-w-[200px]  border-r border-neutral-800">
                  <div className="flex items-center gap-2">
                    <FolderPen className="w-4 h-4" /> Task Name
                  </div>
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium capitalize tracking-widest min-w-[300px] border-r border-neutral-800">
                  <div className="flex items-center gap-2">
                    <TextQuote className="w-4 h-4" /> Description
                  </div>
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium  capitalize tracking-widest shrink-0 border-r border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-4 h-4" /> Estimation  <ChevronsUpDown className="w-4 h-4 inline ml-auto cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium  capitalize tracking-widest shrink-0 border-r border-neutral-800 min-w-[120px]">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4" /> Type
                  </div>
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium  capitalize tracking-widest shrink-0 border-r border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Assigned
                  </div>
                </TableHead>
                <TableHead className="px-4 text-[11px] font-medium  capitalize tracking-widest shrink-0 ">
                  <div className="flex items-center gap-2">
                    <ChartNoAxesColumnIncreasing className="w-4 h-4" /> Priority  <ChevronsUpDown className="w-4 h-4 inline ml-auto cursor-pointer" />
                  </div>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length === 0 ? (
                <TableRow className="hover:bg-transparent border-none">
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2 opacity-50">
                      <Ghost className="w-7 h-7" />
                      <span className="text-base">
                        No tasks under {title.toLowerCase()}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tasks.map((task) => (
                  <TableRow
                    key={task._id}
                    className="group border-none hover:bg-muted/40 transition-all duration-200 cursor-pointer"
                    onClick={() => onTaskClick(task)}
                  >
                    <TableCell className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox className="rounded border-muted-foreground/30 data-[state=checked]:bg-primary" />
                    </TableCell>

                    <TableCell className="p-2.5 border-r border-b border-neutral-800  max-w-[180px] truncate">
                      <span className="text-xs font-medium text-foreground/90 capitalize">
                        {task.title}
                      </span>
                    </TableCell>
                    <TableCell className="p-2.5 border-r border-b border-neutral-800">
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px] truncate">
                        {task.description || "No description provided yet..."}
                      </p>
                    </TableCell>
                    <TableCell className="p-2.5 whitespace-nowrap text-xs text-muted-foreground border-r border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {task.estimation ? (
                          <span>
                            {format(task.estimation.startDate, "MMM d")} -{" "}
                            {format(task.estimation.endDate, "MMM d")}
                          </span>
                        ) : (
                          "No date"
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-2.5 whitespace-nowrap border-r border-b border-neutral-800 text-center">
                      <Badge
                        variant="secondary"
                        className="font-medium tracking-tight text-[9px] px-4 py-0.5 rounded-full bg-primary text-black"
                      >
                        {task.type || "task"}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-2.5 border-r border-b border-neutral-800">
                      {task.assignedTo && task.assignedTo.length > 0 ? (
                        <div className="flex -space-x-2">
                          {task.assignedTo.map((person, i) => (
                            <Avatar
                              key={i}
                              className="w-7 h-7 border-2 border-background shadow-sm hover:z-10 transition-transform hover:scale-110"
                            >
                              <AvatarImage src={person.avatar} />
                              <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                                {person.name[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full">
                          <Minus className="w-3.5 h-3.5 " />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-2.5 border-b border-neutral-800 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </TableCell>
                    
                    <TableCell className="p-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg "
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl shadow-xl border-muted/50"
                        >
                          <DropdownMenuItem className="gap-2 focus:bg-primary/5 cursor-pointer">
                            <Edit className="w-4 h-4" /> Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 focus:bg-primary/5 cursor-pointer">
                            <Layout className="w-4 h-4" /> Move to Sprint
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2  cursor-pointer">
                            <AlertCircle className="w-4 h-4" /> Delete Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export const ListTab = ({ tasks }: { tasks: Task[] }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <TaskGroup
        title="Not-Started"
        tasks={tasks.filter((t) => t.status === "not started")}
        accentColor="bg-slate-400"
        defaultExpanded={true}
        onTaskClick={handleTaskClick}
      />
      <TaskGroup
        title="In Progress"
        tasks={tasks.filter((t) => t.status === "inprogress")}
        accentColor="bg-amber-500"
        onTaskClick={handleTaskClick}
      />
      <TaskGroup
        title="Reviewing"
        tasks={tasks.filter((t) => t.status === "reviewing")}
        accentColor="bg-blue-500"
        onTaskClick={handleTaskClick}
      />
      <TaskGroup
        title="Testing"
        tasks={tasks.filter((t) => t.status === "testing")}
        accentColor="bg-indigo-500"
        onTaskClick={handleTaskClick}
      />
      <TaskGroup
        title="Completed"
        tasks={tasks.filter((t) => t.status === "completed")}
        accentColor="bg-emerald-500"
        onTaskClick={handleTaskClick}
      />

      <TaskDetailSheet
        task={selectedTask}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
};
