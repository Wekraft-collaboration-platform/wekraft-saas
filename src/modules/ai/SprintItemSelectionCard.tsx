// src/modules/ai/SprintItemSelectionCard.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckSquare,
  Square,
  Zap,
  Loader2,
  Layers,
  Minus,
  FastForward,
  CheckCheck,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const priorityIcons: Record<string, React.ReactNode> = {
  none: <Minus className="w-3.5 h-3.5 text-muted-foreground" />,
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

interface SprintItemSelectionCardProps {
  projectId: Id<"projects">;
  sprintId: string;
  isCompleted: boolean;
  onResume: (value: { task_ids: string[] }) => void;
}

export function SprintItemSelectionCard({
  projectId,
  sprintId,
  isCompleted,
  onResume,
}: SprintItemSelectionCardProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const backlogTasks = useQuery(
    api.sprint.getBacklogTasks,
    projectId && !isCompleted ? { projectId } : "skip",
  );

  const sprintTasks = useQuery(
    api.sprint.getSprintTasks,
    isCompleted ? { sprintId: sprintId as any } : "skip",
  );

  const tasks = isCompleted ? sprintTasks : backlogTasks;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () => {
    if (!tasks) return;
    setSelected(new Set(tasks.map((t) => t._id)));
  };

  const clearAll = () => setSelected(new Set());

  const handleConfirm = () => {
    if (selected.size === 0) return;
    onResume({ task_ids: Array.from(selected) });
  };

  if (!tasks && projectId) {
    return (
      <div className="mx-4 my-3 rounded-lg border border-neutral-800 bg-card p-8 flex flex-col items-center justify-center gap-3 w-full max-w-md">
        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        <p className="text-xs text-muted-foreground">
          Loading backlog tasks...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-4 my-3 rounded-lg border border-neutral-800 bg-card overflow-hidden w-full max-w-md">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-medium text-foreground">
            Add tasks to sprint
          </span>
        </div>
        {!isCompleted && tasks && tasks.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              size="xs"
              variant="outline"
              onClick={selectAll}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Select all
            </Button>
            <Button
              size="xs"
              variant="outline"
              onClick={clearAll}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="divide-y divide-neutral-800/60 h-[160px]  overflow-y-auto">
        {tasks && tasks.length > 0 ? (
          tasks.map((task) => {
            const isSelected = isCompleted ? true : selected.has(task._id);
            return (
              <button
                key={task._id}
                disabled={isCompleted}
                onClick={() => toggle(task._id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  isCompleted
                    ? "opacity-50 cursor-default"
                    : "hover:bg-neutral-800/40 cursor-pointer",
                  isSelected && !isCompleted && "bg-neutral-800/30",
                )}
              >
                {/* Checkbox */}
                <span className="shrink-0 text-muted-foreground">
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </span>

                {/* Title & Assignees */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-xs text-foreground truncate">
                    {task.title}
                  </span>
                  {task.assignedTo && task.assignedTo.length > 0 && (
                    <AvatarGroup className="shrink-0">
                      {task.assignedTo.map((assignee: any) => (
                        <Avatar
                          key={assignee.userId}
                          className="w-4 h-4 border border-card"
                        >
                          <AvatarImage src={assignee.avatar} />
                          <AvatarFallback className="text-[6px]">
                            {assignee.name.substring(0, 1).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  )}
                </div>

                {/* Priority */}
                <div className="shrink-0">
                  {priorityIcons[task.priority || "none"]}
                </div>
              </button>
            );
          })
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-muted-foreground">
              No tasks available in backlog
            </p>
          </div>
        )}
      </div>

      {/* Footer — active state */}
      {!isCompleted && tasks && tasks.length > 0 && (
        <div className="px-4 py-3 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {selected.size} task{selected.size !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className={cn(
              "text-[10px] px-3 py-1.5 rounded-md font-medium transition-all",
              selected.size > 0
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed",
            )}
          >
            Add to sprint <FastForward className="w-3 h-3 inline ml-1" />
          </button>
        </div>
      )}

      {/* Footer — completed state */}
      {isCompleted && (
        <div className="px-4 py-2.5 border-t border-neutral-800">
          <span className="text-[11px] text-muted-foreground">
            <CheckCheck className="w-3 h-3 inline mr-1" /> Tasks action Approved
          </span>
        </div>
      )}
    </div>
  );
}
