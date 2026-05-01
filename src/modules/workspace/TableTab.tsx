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
  ChartNoAxesColumnIncreasing,
  ChartPie,
  ChevronsUpDown,
  Calendar,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  Clock,
  Plus,
  FileCodeCorner,
  Bug,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { Task } from "@/types/types";
import {
  SortPopover,
  priorityIcons2,
  statusColors,
  statusIcons,
  statusIconsNoColors,
} from "@/lib/static-store";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

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

interface TableTabProps {
  tasks: Task[];
  onLoadMore: () => void;
  hasMore: boolean;
}

const PriorityBadge = ({ priority = "none" }: { priority?: string }) => {
  return (
    <div className="flex items-center justify-center w-full">
      {priorityIcons2[priority] || priorityIcons2.none}
    </div>
  );
};

const PAGE_SIZE = 10;

export const TableTab = ({ tasks, onLoadMore, hasMore }: TableTabProps) => {
  const [page, setPage] = useState(0);

  // Client-side pagination: slice the loaded tasks
  const totalPages = Math.ceil(tasks.length / PAGE_SIZE);
  const paginatedTasks = tasks.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const canGoNext = page < totalPages - 1 || hasMore;
  const canGoPrev = page > 0;

  const handleNext = () => {
    if (page < totalPages - 1) {
      setPage((p) => p + 1);
    } else if (hasMore) {
      // At the last page of loaded data, but more exists — load more & advance
      onLoadMore();
      setPage((p) => p + 1);
    }
  };
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedTaskForSheet, setSelectedTaskForSheet] = useState<Task | null>(
    null,
  );

  const toggleTask = (taskId: string) => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const toggleAll = () => {
    if (selectedTasks.length === tasks.length && tasks.length > 0) {
      setSelectedTasks([]);
    } else {
      setSelectedTasks(tasks.map((t) => t._id));
    }
  };

  return (
    <div className="relative border-none flex flex-col">
      <div
        className="overflow-auto custom-scrollbar flex-1"
        style={{ minHeight: "calc(100vh - 320px)" }}
      >
        <Table>
          <TableHeader className="bg-neutral-900  z-10 ">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[50px] px-6 py-4">
                <Checkbox
                  checked={
                    selectedTasks.length === paginatedTasks.length &&
                    paginatedTasks.length > 0
                  }
                  onCheckedChange={toggleAll}
                  className="rounded border-neutral-500 data-[state=checked]:bg-primary"
                />
              </TableHead>
              <TableHead className="text-[15px] text-primary font-medium px-4 min-w-[180px]  border-r border-neutral-700">
                <div className="flex items-center gap-2">
                  <FolderPen className="w-4.5 h-4.5" /> Task Name
                </div>
              </TableHead>
              <TableHead className="text-[15px] text-primary font-medium  px-4 border-r border-neutral-700">
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <ChartPie className="w-4.5 h-4.5" /> Status
                  </div>
                  <ChevronsUpDown className="w-4.5 h-4.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0" />
                </div>
              </TableHead>
              <TableHead className="text-[15px] text-primary font-medium  px-4  border-r  border-neutral-700">
                <div className="flex items-center justify-center gap-2 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Hourglass className="w-4.5 h-4.5" /> Duration
                  </div>
                  <SortPopover
                    title="Sort Duration"
                    icon={Calendar}
                    trigger={
                      <ChevronsUpDown className="w-4.5 h-4.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0" />
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
              <TableHead className="text-[15px] text-primary font-medium  px-4  border-r  border-neutral-700">
                <div className="flex items-center justify-center gap-2 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Box className="w-4.5 h-4.5" /> Tags
                  </div>
                  <ChevronsUpDown className="w-4.5 h-4.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0" />
                </div>
              </TableHead>
              <TableHead className="text-[15px] text-primary font-medium px-4  border-r  border-neutral-700">
                <div className="flex items-center gap-2">
                  <Users className="w-4.5 h-4.5" /> Assigned
                </div>
              </TableHead>
              <TableHead className="text-[15px] text-primary font-medium px-4 text-center border-r border-neutral-700">
                <div className="flex items-center justify-between gap-2 overflow-hidden">
                  <div className="flex items-center gap-2 justify-center">
                    <ChartNoAxesColumnIncreasing className="w-4.5 h-4.5" />{" "}
                    Priority
                  </div>
                  <SortPopover
                    title="Sort Priority"
                    icon={ChartNoAxesColumnIncreasing}
                    trigger={
                      <ChevronsUpDown className="w-4.5 h-4.5 text-muted-foreground hover:text-primary transition-colors cursor-pointer shrink-0" />
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
            {paginatedTasks.length === 0 ? (
              <TableRow className="">
                <TableCell colSpan={8} className="h-[400px] text-center">
                  <div className="flex flex-col items-start justify-center space-y-1.5 p-4 w-[360px] mx-auto">
                    <Image
                      src="/pat101.svg"
                      alt="Empty Workspace"
                      width={100}
                      height={100}
                      className="opacity-80"
                    />
                    <p className="text-base font-medium  text-primary">
                      Empty Workspace
                    </p>
                    <p className="text-muted-foreground text-wrap text-left">
                      Create your First Task with your teammates and start
                      managing your project in a right way.
                    </p>

                    <div className="flex items-center gap-4 mt-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="rounded-full text-[11px]"
                      >
                        <Plus className="w-4 h-4" />
                        Add Task
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full text-[11px]"
                      >
                        Check Docs
                        <FileCodeCorner className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTasks.map((task) => {
                const isSelected = selectedTasks.includes(task._id);

                return (
                  <TableRow
                    key={task._id}
                    className={cn(
                      "group border-b border-neutral-800 hover:bg-neutral-800/20 transition-all cursor-pointer",
                      isSelected && "bg-primary/5",
                    )}
                    onClick={() => setSelectedTaskForSheet(task)}
                  >
                    <TableCell
                      className="px-6 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleTask(task._id)}
                        className="rounded border-neutral-800 data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                    <TableCell className="px-4 text-sm   font-medium border-r border-b border-neutral-700  text-primary transition-colors">
                      <div className="flex items-center gap-1.5 capitalize">
                        {task.title}
                        {task.isBlocked ? (
                          <Bug className="w-4 h-4 text-red-500/70 shrink-0 ml-auto" />
                        ) : (
                          task.estimation?.endDate &&
                          task.estimation.endDate < Date.now() &&
                          task.status !== "completed" && (
                            <Info className="w-4 h-4 text-primary/70 shrink-0 ml-auto" />
                          )
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 border-r border-b border-neutral-700">
                      <Badge
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[12px] flex items-center gap-1.5 border font-medium capitalize whitespace-nowrap bg-primary/10 text-primary",
                        )}
                      >
                        {statusIconsNoColors[task.status]}
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 text-[12px] font-medium text-primary/70 border-r border-b border-neutral-700">
                      {task.estimation ? (
                        <span className="flex items-center justify-center gap-1.5 opacity-80">
                          {format(task.estimation.startDate, "MMM d")} —{" "}
                          {format(task.estimation.endDate, "MMM d")}
                        </span>
                      ) : (
                        <span className="opacity-20 italic flex justify-center">
                          No timeline
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 border-r border-b border-neutral-700">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {task.type ? (
                          <div
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-inter capitalize tracking-wide border",
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
                          <span className="text-[10px] text-muted-foreground">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 border-r border-b border-neutral-700">
                      {task.assignedTo && task.assignedTo.length > 0 ? (
                        <div className="flex items-center justify-center -space-x-1">
                          {task.assignedTo.map((person, i) => (
                            <Avatar
                              key={i}
                              className="w-7 h-7 border-2 border-background shadow-sm"
                            >
                              <AvatarImage src={person.avatar} className="" />
                              <AvatarFallback className="text-[9px] bg-neutral-800 text-primary/40 font-bold uppercase">
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
                    <TableCell className="px-4 border-r border-b text-muted-foreground border-neutral-700">
                      <PriorityBadge priority={task.priority} />
                    </TableCell>
                    <TableCell
                      className="px-4 text-right border-b border-neutral-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-primary transition-all rounded hover:bg-neutral-800"
                          >
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-neutral-900 border-neutral-800 text-primary/80 min-w-[140px] rounded-xl shadow-2xl"
                        >
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
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] font-semibold text-primary/60 hover:text-primary hover:bg-neutral-800 rounded-lg gap-2"
          >
            <FileCode size={13} /> Apply Code
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] font-semibold text-primary/60 hover:text-primary hover:bg-neutral-800 rounded-lg gap-2"
          >
            <Edit size={13} /> Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] font-semibold text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg gap-2"
          >
            <Trash2 size={13} /> Delete
          </Button>
        </div>
      )}

      {/* Simple Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800/60">
        <div className="text-xs font-medium text-muted-foreground tracking-wider">
          Showing {page * PAGE_SIZE + 1}–
          {Math.min((page + 1) * PAGE_SIZE, tasks.length)} of {tasks.length}
          {hasMore ? "+" : ""} Results
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoPrev}
            onClick={() => setPage((p) => p - 1)}
            className="h-7 px-3 text-[10px] font-semibold bg-transparent border-neutral-800 text-primary transition-all disabled:opacity-20"
          >
            <ChevronLeft size={12} className="mr-1" /> Previous
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              className="h-7 w-7 text-[10px] font-bold p-0 bg-primary/10 text-primary border border-primary/20 rounded-md"
            >
              {page + 1}
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!canGoNext}
            onClick={handleNext}
            className="h-7 px-3 text-[10px] font-semibold bg-transparent border-neutral-800 text-primary transition-all disabled:opacity-20"
          >
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
