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
  Info,
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
import {
  DurationSortPopover,
  PrioritySortPopover,
  TagFilterPopover,
} from "./workspace-modules/TaskPopovers";
import { SortConfig } from "./function/taskFilters";
import Image from "next/image";
import { EditTaskDialog } from "./EditTaskDialog";
import { MoveToSprintDialog } from "./MoveToSprintDialog";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const priorityIcons: Record<string, React.ReactNode> = {
  none: <Minus className="w-3.5 h-3.5" />,
  low: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[4px] h-5 bg-yellow-500 rounded-px" />
      <div className="w-[4px] h-4 dark:bg-neutral-400 bg-accent/20 rounded-px" />
      <div className="w-[4px] h-3 dark:bg-neutral-400 bg-accent/20 rounded-px" />
      <div className="w-[4px] h-[8px] dark:bg-neutral-400 bg-accent/20 rounded-px" />
    </div>
  ),
  medium: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[4px] h-5 bg-green-500 rounded-px" />
      <div className="w-[4px] h-4 bg-green-500 rounded-px" />
      <div className="w-[4px] h-3  dark:bg-neutral-400 bg-accent/20  rounded-px" />
      <div className="w-[4px] h-[8px] dark:bg-neutral-400 bg-accent/20 rounded-px" />
    </div>
  ),
  high: (
    <div className="flex items-end gap-px h-3 mb-0.5">
      <div className="w-[4px] h-5 bg-red-500 rounded-px" />
      <div className="w-[4px] h-4 bg-red-500 rounded-px" />
      <div className="w-[4px] h-3 bg-red-500 rounded-px" />
      <div className="w-[4px] h-[8px] dark:bg-neutral-400 bg-accent/20 rounded-px" />
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

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  accentColor: string;
  defaultExpanded?: boolean;
  onTaskClick: (task: Task) => void;
  selectedTaskIds: Id<"tasks">[];
  setSelectedTaskIds: React.Dispatch<React.SetStateAction<Id<"tasks">[]>>;
  projectId: Id<"projects">;
  projectName: string;
  repoFullName?: string;
  ownerClerkId?: string;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  tagFilter: string | null;
  setTagFilter: (tag: string | null) => void;
  allTasks: Task[];
}

const TaskGroup = ({
  title,
  tasks,
  accentColor,
  defaultExpanded = false,
  onTaskClick,
  selectedTaskIds,
  setSelectedTaskIds,
  projectId,
  projectName,
  repoFullName,
  ownerClerkId,
  sortConfig,
  setSortConfig,
  tagFilter,
  setTagFilter,
  allTasks,
}: TaskGroupProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleTask = (taskId: Id<"tasks">) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const deleteTasks = useMutation(api.workspace.deleteTasks);

  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    try {
      await deleteTasks({ taskIds: [taskId] });
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const toggleAll = () => {
    const groupTaskIds = tasks.map((t) => t._id as Id<"tasks">);
    const allInGroupSelected = groupTaskIds.every((id) =>
      selectedTaskIds.includes(id),
    );

    if (allInGroupSelected) {
      setSelectedTaskIds((prev) =>
        prev.filter((id) => !groupTaskIds.includes(id)),
      );
    } else {
      setSelectedTaskIds((prev) => {
        const newIds = [...prev];
        groupTaskIds.forEach((id) => {
          if (!newIds.includes(id)) newIds.push(id);
        });
        return newIds;
      });
    }
  };

  const isAllGroupSelected =
    tasks.length > 0 && tasks.every((t) => selectedTaskIds.includes(t._id as Id<"tasks">));

  return (
    <div className="">
      <div className="flex items-center justify-between mb-4 px-4 dark:bg-neutral-900 bg-neutral-200/55  py-1.5 rounded-md">
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
            <span className="text-[10px] font-medium text-muted-foreground dark:bg-muted bg-neutral-100 px-1.5 py-0.5 rounded">
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
        <div className="overflow-hidden w-full dark:bg-background bg-card mt-2">
          <Table className="border-t border-b dark:border-neutral-800 border-neutral-200">
            <TableHeader className=" border-none">
              <TableRow className="hover:bg-transparent dark:bg-neutral-950 bg-neutral-100 border-none">
                <TableHead className="w-[50px] px-4">
                  <Checkbox
                    checked={isAllGroupSelected}
                    onCheckedChange={toggleAll}
                    className="rounded border-muted-foreground/30 data-[state=checked]:bg-primary"
                  />
                </TableHead>
                <TableHead className="px-4 text-sm font-medium dark:text-primary capitalize tracking-widest min-w-[200px]  border-r border-b dark:border-neutral-800 border-neutral-200">
                  <div className="flex items-center gap-2">
                    <FolderPen className="w-4.5 h-4.5" /> Task Name
                  </div>
                </TableHead>
                <TableHead className="px-4 text-sm font-medium capitalize tracking-widest min-w-[300px] border-r border-b dark:border-neutral-800 border-neutral-200">
                  <div className="flex items-center gap-2">
                    <TextQuote className="w-4.5 h-4.5" /> Description
                  </div>
                </TableHead>
                <TableHead className="text-[13px] dark:text-primary text-foreground font-medium px-4 border-r dark:border-neutral-800 border-neutral-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Duration
                    </div>
                    <DurationSortPopover
                      sortConfig={sortConfig}
                      setSortConfig={setSortConfig}
                      trigger={
                        <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      }
                    />
                  </div>
                </TableHead>
                <TableHead className="text-[13px] dark:text-primary text-foreground font-medium px-4 border-r dark:border-neutral-800 border-neutral-200">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Tags
                    </div>
                    <TagFilterPopover
                      tasks={allTasks}
                      activeTag={tagFilter}
                      setTagFilter={setTagFilter}
                      trigger={
                        <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      }
                    />
                  </div>
                </TableHead>
                <TableHead className="text-[13px] dark:text-primary text-foreground font-medium px-4 border-r dark:border-neutral-800 border-neutral-200">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Assigned
                  </div>
                </TableHead>
                <TableHead className="text-[13px] dark:text-primary text-foreground font-medium px-4 text-center">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 justify-center">
                      <ChartNoAxesColumnIncreasing className="w-4 h-4" />{" "}
                      Priority
                    </div>
                    <PrioritySortPopover
                      sortConfig={sortConfig}
                      setSortConfig={setSortConfig}
                      trigger={
                        <ChevronsUpDown className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
                      }
                    />
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
                    className={cn(
                      "group border-none dark:hover:bg-neutral-900 hover:bg-neutral-100 transition-all duration-200 cursor-pointer",
                      selectedTaskIds.includes(task._id as Id<"tasks">) &&
                        "bg-primary/5",
                    )}
                    onClick={() => onTaskClick(task)}
                  >
                    <TableCell
                      className="px-4 py-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedTaskIds.includes(task._id)}
                        onCheckedChange={() =>
                          toggleTask(task._id)
                        }
                        className="rounded border-muted-foreground/30 data-[state=checked]:bg-primary"
                      />
                    </TableCell>

                    <TableCell className="p-2.5 border-r border-b dark:border-neutral-800 border-neutral-200  max-w-[180px] truncate">
                      <span className="text-sm font-medium dark:text-primary text-foreground capitalize flex items-center gap-1.5 transition-colors">
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
                      </span>
                    </TableCell>
                    <TableCell className="p-2.5 border-r border-b dark:border-neutral-800 border-neutral-200">
                      <p className="text-xs text-muted-foreground dark:group-hover:text-primary group-hover:text-foreground transition-colors line-clamp-1 max-w-[280px] truncate">
                        {task.description || "No description provided yet..."}
                      </p>
                    </TableCell>
                    <TableCell className="p-2.5 whitespace-nowrap text-xs text-muted-foreground dark:group-hover:text-primary group-hover:text-foreground border-r border-b dark:border-neutral-800 border-neutral-200 transition-colors">
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
                    <TableCell className="p-2.5 whitespace-nowrap border-r border-b dark:border-neutral-800 border-neutral-200">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {task.type ? (
                          <div
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold font-inter capitalize tracking-wide border",
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
                    <TableCell className="p-2.5 border-r border-b dark:border-neutral-800 border-neutral-200">
                      {task.assignees && task.assignees.length > 0 ? (
                        <div className="flex items-center justify-center -space-x-2">
                          {task.assignees.map((person, i) => (
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
                          <p className="text-[11px] text-muted-foreground dark:group-hover:text-primary group-hover:text-foreground flex items-center gap-1 transition-colors">
                            <Minus className="w-3.5 h-3.5" />
                            Unassigned
                          </p>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-2.5 border-b dark:border-neutral-800 border-neutral-200 text-muted-foreground dark:group-hover:text-primary group-hover:text-foreground whitespace-nowrap transition-colors">
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
                            <EditTaskDialog
                              projectName={projectName}
                              projectId={projectId}
                              repoFullName={repoFullName}
                              ownerClerkId={ownerClerkId}
                              task={task}
                              trigger={
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="gap-2 focus:bg-primary/5 cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" /> Edit Task
                                </DropdownMenuItem>
                              }
                            />
                            <MoveToSprintDialog
                              trigger={
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="gap-2 focus:bg-primary/5 cursor-pointer"
                                >
                                  <Layout className="w-4 h-4" /> Move to Sprint
                                </DropdownMenuItem>
                              }
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="gap-2 focus:bg-red-500/10 text-red-500 cursor-pointer"
                                >
                                  <AlertCircle className="w-4 h-4" /> Delete
                                  Task
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-neutral-900 border-neutral-800 shadow-2xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-primary">
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-muted-foreground">
                                    This action cannot be undone. This will
                                    permanently delete this task and remove all
                                    associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-neutral-800 border-neutral-700 text-primary hover:bg-neutral-700">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteTask(task._id)}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Delete Permanently
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

export const ListTab = ({
  tasks,
  allTasks,
  selectedTaskIds,
  setSelectedTaskIds,
  projectId,
  projectName,
  repoFullName,
  ownerClerkId,
  sortConfig,
  setSortConfig,
  tagFilter,
  setTagFilter,
}: {
  tasks: Task[];
  allTasks: Task[];
  selectedTaskIds: Id<"tasks">[];
  setSelectedTaskIds: React.Dispatch<React.SetStateAction<Id<"tasks">[]>>;
  projectId: Id<"projects">;
  projectName: string;
  repoFullName?: string;
  ownerClerkId?: string;
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  tagFilter: string | null;
  setTagFilter: (tag: string | null) => void;
}) => {
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
        selectedTaskIds={selectedTaskIds}
        setSelectedTaskIds={setSelectedTaskIds}
        projectId={projectId}
        projectName={projectName}
        repoFullName={repoFullName}
        ownerClerkId={ownerClerkId}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        allTasks={allTasks}
      />
      <TaskGroup
        title="In Progress"
        tasks={tasks.filter((t) => t.status === "inprogress")}
        accentColor="bg-amber-500"
        onTaskClick={handleTaskClick}
        selectedTaskIds={selectedTaskIds}
        setSelectedTaskIds={setSelectedTaskIds}
        projectId={projectId}
        projectName={projectName}
        repoFullName={repoFullName}
        ownerClerkId={ownerClerkId}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        allTasks={allTasks}
      />
      <TaskGroup
        title="Reviewing"
        tasks={tasks.filter((t) => t.status === "reviewing")}
        accentColor="bg-blue-500"
        onTaskClick={handleTaskClick}
        selectedTaskIds={selectedTaskIds}
        setSelectedTaskIds={setSelectedTaskIds}
        projectId={projectId}
        projectName={projectName}
        repoFullName={repoFullName}
        ownerClerkId={ownerClerkId}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        allTasks={allTasks}
      />
      <TaskGroup
        title="Testing"
        tasks={tasks.filter((t) => t.status === "testing")}
        accentColor="bg-indigo-500"
        onTaskClick={handleTaskClick}
        selectedTaskIds={selectedTaskIds}
        setSelectedTaskIds={setSelectedTaskIds}
        projectId={projectId}
        projectName={projectName}
        repoFullName={repoFullName}
        ownerClerkId={ownerClerkId}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        allTasks={allTasks}
      />
      <TaskGroup
        title="Completed"
        tasks={tasks.filter((t) => t.status === "completed")}
        accentColor="bg-emerald-500"
        onTaskClick={handleTaskClick}
        selectedTaskIds={selectedTaskIds}
        setSelectedTaskIds={setSelectedTaskIds}
        projectId={projectId}
        projectName={projectName}
        repoFullName={repoFullName}
        ownerClerkId={ownerClerkId}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        tagFilter={tagFilter}
        setTagFilter={setTagFilter}
        allTasks={allTasks}
      />

      <TaskDetailSheet
        task={selectedTask}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
};
