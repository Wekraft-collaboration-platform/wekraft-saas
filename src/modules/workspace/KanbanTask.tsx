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
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";

interface KanbanTaskProps {
  tasks: Task[];
}

export const KanbanTask = ({ tasks }: KanbanTaskProps) => {
  const { open: sidebarOpen } = useSidebar();
  const updateStatus = useMutation(api.workspace.updateTaskStatus);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskForSheet, setSelectedTaskForSheet] = useState<Task | null>(
    null,
  );

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
      toast.promise(
        updateStatus({
          taskId: task._id,
          status: newStatus,
        }),
        {
          loading: "Updating status...",
          success: `Task moved to ${COLUMNS.find((c) => c.id === newStatus)?.label}`,
          error: "Failed to update status",
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
}

const Column = ({ column, tasks, onTaskClick }: ColumnProps) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column,
    },
  });

  return (
    <div className="flex flex-col min-w-[320px] w-[320px] bg-sidebar rounded-lg border border-border overflow-hidden shadow-sm h-fit min-h-[560px] max-h-[calc(100vh-320px)]">
      <div
        className={cn(
          "p-2 flex items-center justify-between border-b  backdrop-blur-md sticky top-0 z-10 bg-card",
        )}
      >
        <div className="flex items-center gap-2.5">
          {KANBAN_COLUMN_ICONS[column.id]}
          <h3 className="font-semibold text-sm tracking-tight capitalize text-primary">
            {column.label}
          </h3>
          <Badge
            variant="secondary"
            className="bg-primary/5 text-primary/60 text-[10px] font-bold h-5 px-1.5 border-none"
          >
            {tasks.length}
          </Badge>
        </div>
        <button
          aria-label="Column menu"
          className="text-muted-foreground/50 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/5"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-3.5 flex flex-col gap-3.5 overflow-y-auto custom-scrollbar"
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

        {tasks.length === 0 && (
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
          <h4 className="text-xs leading-relaxed tracking-tight line-clamp-2 group-hover:text-primary transition-colors">
            {task.title}
          </h4>
          <GripVertical className="w-4 h-4 text-muted-foreground group-hover:text-primary/40 transition-colors shrink-0 mt-0.5" />
        </div>

        {task.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
            {task.description}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-2   pt-4">
          {task.priority && (
            <div className="flex items-center gap-2">
              {priorityIcons[task.priority]}
              <span className="text-[9px] text-muted-foreground/60 uppercase font-bold tracking-widest">
                {task.priority}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-secondary/40 border border-border/30 text-[10px] text-primary/60 font-bold group-hover:bg-primary/5 group-hover:text-primary transition-all">
              <Calendar className="w-3 h-3 mb-0.5" />
              <span>{format(task.estimation.endDate, "dd MMM")}</span>
            </div>

            <div className="flex -space-x-2">
              {task.assignedTo?.map((assignee, i) => (
                <Avatar
                  key={i}
                  className="w-7 h-7 border-2 border-background ring-1 ring-border/10 shadow-sm transition-transform hover:scale-110 hover:z-10"
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
      </div>
    </Card>
  );
};
