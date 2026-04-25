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
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Calendar,
  Tag,
  CircleDot,
  Bug,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";
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
import { Task } from "@/types/types";
import { SortPopover } from "@/lib/static-store";
import Image from "next/image";

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

interface SortOptionProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
}

const SortOption = ({ label, icon, onClick, isActive }: SortOptionProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-3 py-2 text-[11px] font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800/50 rounded-lg group",
      isActive ? "text-primary bg-primary/5" : "text-muted-foreground",
    )}
  >
    {icon && (
      <div className="shrink-0 transition-transform group-hover:scale-110">
        {icon}
      </div>
    )}
    <span>{label}</span>
  </button>
);

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
          <h2 className="text-base tracking-tight flex items-center gap-2">
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
                <TableHead className="px-4 text-sm font-medium text-primary capitalize tracking-widest min-w-[200px]  border-r border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <FolderPen className="w-4.5 h-4.5" /> Task Name
                  </div>
                </TableHead>
                <TableHead className="px-4 text-sm font-medium capitalize tracking-widest min-w-[300px] border-r border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <TextQuote className="w-4.5 h-4.5" /> Description
                  </div>
                </TableHead>
                <TableHead className="px-4 text-sm text-primary font-medium capitalize tracking-widest shrink-0 border-r border-b border-neutral-800">
                  <div className="flex items-center justify-center gap-2 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <Hourglass className="w-4.5 h-4.5" /> Duration
                    </div>
                    <SortPopover
                      title="Sort Duration"
                      icon={Calendar}
                      trigger={
                        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0" />
                      }
                    >
                      <SortOption
                        label="Upcoming First"
                        icon={<ArrowUpNarrowWide className="w-3 h-3" />}
                      />
                      <SortOption
                        label="Latest First"
                        icon={<ArrowDownWideNarrow className="w-3 h-3" />}
                      />
                      <Separator className="my-1.5 opacity-50" />
                      <SortOption
                        label="Shortest Duration"
                        icon={<ArrowUpNarrowWide className="w-3 h-3" />}
                      />
                      <SortOption
                        label="Longest Duration"
                        icon={<ArrowDownWideNarrow className="w-3 h-3" />}
                      />
                    </SortPopover>
                  </div>
                </TableHead>
                <TableHead className="px-4 text-sm text-primary font-medium capitalize tracking-widest shrink-0 border-r border-b border-neutral-800 min-w-[120px]">
                  <div className="flex items-center justify-center gap-2 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <Box className="w-4.5 h-4.5" /> Tags
                    </div>
                    <SortPopover
                      title="Filter & Sort"
                      icon={Tag}
                      trigger={
                        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0" />
                      }
                    >
                      <SortOption
                        label="Sort A-Z"
                        icon={<ArrowUpNarrowWide className="w-3 h-3" />}
                      />
                      <SortOption
                        label="Filter by Type"
                        icon={<CircleDot className="w-3 h-3" />}
                      />
                    </SortPopover>
                  </div>
                </TableHead>
                <TableHead className="px-4 text-sm text-primary font-medium  capitalize tracking-widest shrink-0 border-r border-b border-neutral-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4.5 h-4.5" /> Assigned
                  </div>
                </TableHead>
                <TableHead className="px-4 text-sm text-primary font-medium  capitalize tracking-widest shrink-0 border-b border-neutral-800">
                  <div className="flex items-center justify-between gap-2 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <ChartNoAxesColumnIncreasing className="w-4.5 h-4.5" />{" "}
                      Priority
                    </div>
                    <SortPopover
                      title="Sort Priority"
                      icon={ChartNoAxesColumnIncreasing}
                      trigger={
                        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0" />
                      }
                    >
                      <SortOption
                        label="High to Low"
                        icon={<ArrowUpNarrowWide className="w-3 h-3" />}
                      />
                      <SortOption
                        label="Low to High"
                        icon={<ArrowDownWideNarrow className="w-3 h-3" />}
                      />
                    </SortPopover>
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
                    className="py-14 text-center text-sm text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Image
                        src="/pat103.svg"
                        alt="Empty Workspace"
                        width={80}
                        height={80}
                        className="opacity-80"
                      />
                      <span className="text-base text-primary/70">
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
                    <TableCell
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox className="rounded border-muted-foreground/30 data-[state=checked]:bg-primary" />
                    </TableCell>

                    <TableCell className="p-2.5 border-r border-b border-neutral-800  max-w-[180px] truncate">
                      <span className="text-xs font-medium text-muted-foreground capitalize flex items-center gap-1.5">
                        {task.isBlocked && <Bug className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                        {task.title}
                      </span>
                    </TableCell>
                    <TableCell className="p-2.5 border-r border-b border-neutral-800">
                      <p className="text-xs text-muted-foreground line-clamp-1 max-w-[280px] truncate">
                        {task.description || "No description provided yet..."}
                      </p>
                    </TableCell>
                    <TableCell className="p-2.5 whitespace-nowrap text-xs text-muted-foreground border-r border-b border-neutral-800">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {task.estimation ? (
                          <span>
                            {format(task.estimation.startDate, "MMM d")} —{" "}
                            {format(task.estimation.endDate, "MMM d")}
                          </span>
                        ) : (
                          "No date"
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-2.5 whitespace-nowrap border-r border-b border-neutral-800">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {task.type ? (
                          <div
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold border",
                              task.type.color === "green" &&
                                "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
                              task.type.color === "yellow" &&
                                "bg-yellow-500/10 text-yellow-400 border-yellow-400/20",
                              task.type.color === "purple" &&
                                "bg-purple-500/10 text-purple-400 border-purple-400/20",
                              task.type.color === "blue" &&
                                "bg-blue-500/10 text-blue-400 border-blue-400/20",
                              task.type.color === "grey" &&
                                "bg-neutral-500/10 text-neutral-400 border-neutral-400/20",
                            )}
                          >
                            <div
                              className={cn(
                                "w-1 h-1 rounded-full",
                                task.type.color === "green" && "bg-emerald-400",
                                task.type.color === "yellow" && "bg-yellow-400",
                                task.type.color === "purple" && "bg-purple-400",
                                task.type.color === "blue" && "bg-blue-400",
                                task.type.color === "grey" && "bg-neutral-400",
                              )}
                            />
                            {task.type.label}
                          </div>
                        ) : (
                          <span className="text-[10px] text-primary/10">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-2.5 border-r border-b border-neutral-800">
                      {task.assignedTo && task.assignedTo.length > 0 ? (
                        <div className="flex items-center justify-center -space-x-2">
                          {task.assignedTo.map((person, i) => (
                            <Avatar
                              key={i}
                              className="w-7 h-7 border-2 border-primary/50 shadow-sm hover:z-10 transition-transform hover:scale-110"
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
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Minus className="w-3.5 h-3.5" />
                            Unassigned
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-2.5 border-b border-neutral-800 text-muted-foreground whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </TableCell>

                    <TableCell
                      className="p-2.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
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
