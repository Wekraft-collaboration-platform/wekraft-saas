"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, Status, COLUMNS } from "@/types/types";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  statusIcons,
  priorityIcons,
  KANBAN_COLUMN_ICONS,
} from "@/lib/static-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  MoreHorizontal,
  GripVertical,
  Plus,
  FileCodeCorner,
  ArrowDownNarrowWideIcon,
  ChevronsRightLeft,
  SeparatorVertical,
  Bug,
  Tag,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";
import { Id } from "../../../convex/_generated/dataModel";

interface KanbanTaskProps {
  tasks: Task[];
  projectId: Id<"projects">;
  taskLimit: number;
}

export const KanbanTask = ({
  tasks,
  projectId,
  taskLimit,
}: KanbanTaskProps) => {
  const { open: sidebarOpen } = useSidebar();

  // Optimistic UI — instantly updates the kanban on drag-drop
  const updateStatus = useMutation(
    api.workspace.updateTaskStatus,
  ).withOptimisticUpdate((localStore, args) => {
    const currentTasks = localStore.getQuery(api.workspace.getTasks, {
      projectId,
      limit: taskLimit,
    });

    if (currentTasks !== undefined) {
      const updated = currentTasks.map((task) =>
        task._id === args.taskId
          ? { ...task, status: args.status, updatedAt: Date.now() }
          : task,
      );
      localStore.setQuery(
        api.workspace.getTasks,
        { projectId, limit: taskLimit },
        updated,
      );
    }
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskForSheet, setSelectedTaskForSheet] = useState<Task | null>(
    null,
  );
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kanban-collapsed-columns");
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse collapsed columns", e);
        }
      }
    }
    return new Set();
  });

  const toggleColumn = (columnId: string) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      localStorage.setItem(
        "kanban-collapsed-columns",
        JSON.stringify(Array.from(next)),
      );
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const task = tasks.find((t) => t._id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    let newStatus: Status | null = null;

    if (COLUMNS.some((col) => col.id === overId)) {
      newStatus = overId as Status;
    } else {
      const overTask = tasks.find((t) => t._id === overId);
      if (overTask) {
        newStatus = overTask.status as Status;
      }
    }

    const task = tasks.find((t) => t._id === activeTaskId);
    if (task && newStatus && task.status !== newStatus) {
      if (newStatus === "completed" && task.isBlocked) {
        toast.error("task is marked as blocked , kindly fix that");
        setActiveId(null);
        setActiveTask(null);
        return;
      }

      toast.promise(
        updateStatus({
          taskId: task._id,
          status: newStatus,
        }),
        {
          loading: "Updating status...",
          success: `Task moved to ${COLUMNS.find((c) => c.id === newStatus)?.label}`,
          error: (err: any) =>
            err.data?.message || err.message || "Failed to update status",
        },
      );
    }

    setActiveId(null);
    setActiveTask(null);
  };

  return (
    <div
      className={cn(
        "flex gap-6 w-full overflow-x-auto mx-auto pb-10 custom-scrollbar scroll-smooth",
        sidebarOpen ? "max-w-[calc(100vw-360px)]" : "max-w-[calc(100vw-160px)]",
        tasks.length === 0 && "items-center justify-center min-h-[500px]",
      )}
    >
      {tasks.length === 0 ? (
        <div className="flex flex-col items-start justify-center space-y-1.5 p-4 w-[360px] mx-auto">
          <Image
            src="/pat101.svg"
            alt="Empty Workspace"
            width={100}
            height={100}
            className="opacity-80"
          />
          <p className="text-base font-medium  text-primary">Empty Workspace</p>
          <p className="text-muted-foreground text-wrap text-left">
            Create your First Task to get started using this interactive kanban
            board.
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
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={tasks.filter((t) => t.status === column.id)}
              onTaskClick={setSelectedTaskForSheet}
              isCollapsed={collapsedColumns.has(column.id)}
              onToggle={() => toggleColumn(column.id)}
            />
          ))}
          <DragOverlay>
            {activeTask ? (
              <div className="opacity-80 scale-105 transition-transform">
                <TaskCard task={activeTask} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      <TaskDetailSheet
        task={selectedTaskForSheet}
        isOpen={!!selectedTaskForSheet}
        onClose={() => setSelectedTaskForSheet(null)}
      />
    </div>
  );
};

interface ColumnProps {
  column: (typeof COLUMNS)[0];
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Column = ({
  column,
  tasks,
  onTaskClick,
  isCollapsed,
  onToggle,
}: ColumnProps) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div
      className={cn(
        "flex flex-col transition-all duration-500 ease-in-out bg-sidebar rounded-lg border border-border overflow-hidden shadow-sm h-fit min-h-[560px] max-h-[calc(100vh-320px)]",
        isCollapsed
          ? "min-w-[60px] w-[60px] bg-sidebar border-none shadow-none"
          : "min-w-[320px] w-[320px]",
      )}
    >
      <div
        className={cn(
          "p-2 flex border-b sticky top-0 z-10 transition-all duration-300",
          isCollapsed
            ? "flex-col items-center gap-4 h-full border-b-0 bg-transparent"
            : "items-center justify-between bg-card backdrop-blur-md",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2.5",
            isCollapsed && "flex-col mt-2",
          )}
        >
          {!isCollapsed && KANBAN_COLUMN_ICONS[column.id]}
          <h3
            className={cn(
              "font-semibold tracking-tight capitalize text-primary transition-all duration-300",
              isCollapsed
                ? "[writing-mode:vertical-lr] rotate-180 text-lg py-4"
                : "text-base",
            )}
          >
            {column.label}
          </h3>
          <Badge
            variant="secondary"
            className="bg-primary/5 text-primary/60 text-[10px] font-bold h-5 w-5 rounded-full border-none flex items-center justify-center p-0"
          >
            {tasks.length}
          </Badge>
        </div>

        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "order-first",
          )}
        >
          {!isCollapsed && (
            <button
              aria-label="Column menu"
              className="text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/5"
            >
              <ArrowDownNarrowWideIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={onToggle}
            aria-label="Column menu"
            className="text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/5"
          >
            <SeparatorVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3.5 flex flex-col gap-3.5 overflow-y-auto custom-scrollbar transition-opacity duration-300",
          isCollapsed ? "opacity-0 invisible h-0 p-0" : "opacity-100 visible",
        )}
      >
        <SortableContext
          items={tasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTask
              key={task._id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        {!isCollapsed && tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-primary/5 rounded-2xl min-h-[120px] text-primary/20 italic text-[11px] font-medium tracking-wide">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
};

const SortableTask = ({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 border-2 border-primary/30 border-dashed rounded-2xl h-[130px] bg-primary/5"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <TaskCard task={task} />
    </div>
  );
};

const TaskCard = ({ task, isOverlay }: { task: Task; isOverlay?: boolean }) => {
  return (
    <Card
      className={cn(
        "group cursor-pointer p-0 transition-all duration-300 border-none shadow-sm hover:shadow-xl bg-background backdrop-blur-sm rounded-md",
        isOverlay &&
          "border-primary shadow-2xl ring-4 ring-primary/5 scale-[1.02]",
      )}
    >
      <div className="p-3">
        <div className="flex items-start justify-between gap-3 ">
          <h4 className="text-xs leading-relaxed tracking-tight line-clamp-2 group-hover:text-primary transition-colors flex items-center gap-2">
            {task.isBlocked ? (
              <Bug className="w-3.5 h-3.5 text-red-500 shrink-0" />
            ) : (
              task.estimation?.endDate &&
              task.estimation.endDate < Date.now() &&
              task.status !== "completed" && (
                <Info className="w-3.5 h-3.5 text-primary/70 shrink-0" />
              )
            )}
            {task.title}
          </h4>
          <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-primary/40 transition-colors shrink-0 mt-0.5" />
        </div>

        <div className="flex items-center justify-between pt-5 gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            {task.priority && (
              <div className="flex items-center gap-2 shrink-0">
                {priorityIcons[task.priority]}
              </div>
            )}

            <div className="flex items-center gap-2 text-[9px] font-semibold font-inter tracking-tight shrink-0">
              {task.type ? (
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-inter capitalize tracking-wide border",
                    task.type.color === "green" &&
                      "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
                    task.type.color === "yellow" &&
                      "bg-yellow-500/10 text-yellow-400 border-yellow-400/20",
                    task.type.color === "blue" &&
                      "bg-sky-500/10 text-sky-400 border-sky-400/20",
                    task.type.color === "indigo" &&
                      "bg-indigo-500/10 text-indigo-400 border-indigo-400/20",
                    task.type.color === "orange" &&
                      "bg-orange-500/10 text-orange-400 border-orange-400/20",
                    task.type.color === "red" &&
                      "bg-red-500/10 text-red-400 border-red-400/20",
                    task.type.color === "purple" &&
                      "bg-purple-500/10 text-purple-400 border-purple-400/20",
                    task.type.color === "gray" &&
                      "bg-gray-500/10 text-gray-400 border-gray-400/20",
                  )}
                >
                  {task.type.label}
                </div>
              ) : (
                <span className="text-[10px] border border-border p-1 rounded-md text-muted-foreground/80 font-medium whitespace-nowrap">
                  No Tag
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 px-2 py-1 rounded bg-secondary/70 border border-border/30 text-[10px] text-primary/60 font-bold group-hover:bg-primary/5 group-hover:text-primary transition-all shrink-0">
              <Calendar className="w-3 h-3 mb-0.5" />
              <span>{format(task.estimation.endDate, "dd MMM")}</span>
            </div>
          </div>

          <div className="flex justify-end ml-auto -space-x-2 shrink-0">
            {task.assignees?.slice(0, 3).map((assignee, i) => (
              <Avatar
                key={i}
                className="w-6 h-6 border-2 border-background ring-1 ring-border/10 shadow-sm transition-transform hover:scale-110 hover:z-10"
              >
                <AvatarImage src={assignee.avatar} className="object-cover" />
                <AvatarFallback className="text-[10px] font-bold bg-primary/5 text-primary/40">
                  {assignee.name[0]}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
