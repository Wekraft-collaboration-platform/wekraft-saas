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
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Bug,
  Calendar,
  FileCode,
  Plus,
  MoreHorizontal,
  Circle,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  SeparatorVertical,
  ArrowDownNarrowWideIcon,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CreateIssueDialog } from "./CreateIssueDialog";
import { ISSUE_SEVERITY_ICONS } from "@/lib/static-store";

// ─── Types ───────────────────────────────────────────────────────────────────

type IssueStatus = "not opened" | "opened" | "reopened" | "closed";
type IssueType = "manual" | "task-issue" | "github";
type IssueSeverity = "critical" | "medium" | "low";

export interface IssueAssignee {
  _id: Id<"issueAssignees">;
  userId: Id<"users">;
  name: string;
  avatar?: string;
}

export interface Issue {
  _id: Id<"issues">;
  title: string;
  description?: string;
  fileLinked?: string;
  environment?: "local" | "dev" | "staging" | "production";
  severity?: IssueSeverity;
  due_date?: number;
  status: IssueStatus;
  type: IssueType;
  githubIssueUrl?: string;
  taskId?: Id<"tasks">;
  projectId: Id<"projects">;
  createdByUserId: Id<"users">;
  assignedTo: IssueAssignee[];
  createdAt: number;
  updatedAt: number;
}

// ─── Static Config ───────────────────────────────────────────────────────────

const ISSUE_COLUMNS: {
  id: IssueStatus;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "not opened",
    label: "Not Opened",
    icon: <Circle className="w-4 h-4 dark:text-primary" />,
  },
  {
    id: "opened",
    label: "Opened",
    icon: <AlertTriangle className="w-4 h-4 dark:text-primary" />,
  },
  {
    id: "reopened",
    label: "Reopened",
    icon: <RotateCcw className="w-4 h-4 dark:text-primary" />,
  },
  {
    id: "closed",
    label: "Closed",
    icon: <CheckCircle2 className="w-4 h-4 dark:text-primary" />,
  },
];

export const SEVERITY_CONFIG: Record<
  IssueSeverity,
  { label: string; iconColor: string; icon: React.ReactNode }
> = {
  critical: {
    label: "Critical",
    iconColor: "text-red-500",
    icon: ISSUE_SEVERITY_ICONS["critical"],
  },
  medium: {
    label: "Medium",
    iconColor: "text-orange-400",
    icon: ISSUE_SEVERITY_ICONS["medium"],
  },
  low: {
    label: "Low",
    iconColor: "text-blue-400",
    icon: ISSUE_SEVERITY_ICONS["low"],
  },
};

export const TYPE_CONFIG: Record<
  IssueType,
  { label: string; iconColor: string; icon: React.ReactNode }
> = {
  manual: {
    label: "Manual",
    iconColor: "text-blue-400",
    icon: <Bug className="w-2.5 h-2.5" />,
  },
  "task-issue": {
    label: "Task",
    iconColor: "text-purple-400",
    icon: <Bug className="w-2.5 h-2.5" />,
  },
  github: {
    label: "GitHub",
    iconColor: "text-zinc-400",
    icon: <Bug className="w-2.5 h-2.5" />,
  },
};

// ─── Main Component ──────────────────────────────────────────────────────────

interface IssueKanbanUIProps {
  projectId: Id<"projects">;
  projectName?: string;
  repoFullName?: string;
  ownerClerkId?: string;
}

export const IssueKanbanUI = ({
  projectId,
  projectName,
  repoFullName,
  ownerClerkId,
}: IssueKanbanUIProps) => {
  const { open: sidebarOpen } = useSidebar();
  const issues = useQuery(api.issue.getIssuesForKanban, { projectId }) ?? [];

  const updateIssueStatus = useMutation(
    api.issue.updateIssueStatus,
  ).withOptimisticUpdate((localStore, args) => {
    const current = localStore.getQuery(api.issue.getIssuesForKanban, {
      projectId,
    });
    if (current !== undefined) {
      const updated = current.map((issue) =>
        issue._id === args.issueId
          ? { ...issue, status: args.status, updatedAt: Date.now() }
          : issue,
      );
      localStore.setQuery(api.issue.getIssuesForKanban, { projectId }, updated);
    }
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  // ─ Collapsed columns ─────────────────────────────────────────────────────
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("issue-kanban-collapsed");
      if (saved) {
        try {
          return new Set(JSON.parse(saved));
        } catch {
          /* ignore */
        }
      }
    }
    return new Set();
  });

  const toggleColumn = (colId: string) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(colId)) next.delete(colId);
      else next.add(colId);
      localStorage.setItem(
        "issue-kanban-collapsed",
        JSON.stringify(Array.from(next)),
      );
      return next;
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const found = issues.find((i) => i._id === active.id);
    if (found) setActiveIssue(found as Issue);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      setActiveIssue(null);
      return;
    }

    const activeIssueId = active.id as string;
    const overId = over.id as string;

    let newStatus: IssueStatus | null = null;
    if (ISSUE_COLUMNS.some((col) => col.id === overId)) {
      newStatus = overId as IssueStatus;
    } else {
      const overIssue = issues.find((i) => i._id === overId);
      if (overIssue) newStatus = overIssue.status as IssueStatus;
    }

    const issue = issues.find((i) => i._id === activeIssueId);
    if (issue && newStatus && issue.status !== newStatus) {
      toast.promise(
        updateIssueStatus({
          issueId: issue._id as Id<"issues">,
          status: newStatus,
        }),
        {
          loading: "Moving issue...",
          success: "Issue status updated",
          error: "Failed to move issue",
        },
      );
    }

    setActiveId(null);
    setActiveIssue(null);
  };

  return (
    <div
      className={cn(
        "flex gap-4 w-full overflow-x-auto pb-10 custom-scrollbar scroll-smooth pt-4",
        sidebarOpen ? "max-w-[calc(100vw-360px)]" : "max-w-[calc(100vw-160px)]",
      )}
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {ISSUE_COLUMNS.map((column) => (
          <IssueColumn
            key={column.id}
            column={column}
            issues={(issues as Issue[]).filter((i) => i.status === column.id)}
            isCollapsed={collapsedColumns.has(column.id)}
            onToggle={() => toggleColumn(column.id)}
            projectId={projectId}
            projectName={projectName}
            repoFullName={repoFullName}
            ownerClerkId={ownerClerkId}
          />
        ))}
        <DragOverlay>
          {activeIssue ? (
            <div className="opacity-80 scale-105 transition-transform">
              <IssueCard issue={activeIssue} isOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

// ─── Column ───────────────────────────────────────────────────────────────────

interface IssueColumnProps {
  column: (typeof ISSUE_COLUMNS)[0];
  issues: Issue[];
  isCollapsed: boolean;
  onToggle: () => void;
  projectId: Id<"projects">;
  projectName?: string;
  repoFullName?: string;
  ownerClerkId?: string;
}

const IssueColumn = ({
  column,
  issues,
  isCollapsed,
  onToggle,
  projectId,
  projectName,
  repoFullName,
  ownerClerkId,
}: IssueColumnProps) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col transition-all duration-300 rounded-lg dark:border-accent border-neutral-200 h-fit min-h-[500px] max-h-[800px]",
        isCollapsed
          ? "min-w-[56px] w-[56px] dark:bg-sidebar bg-neutral-100 dark:border-border border-neutral-200"
          : "min-w-[300px] w-[300px] dark:bg-sidebar bg-neutral-100",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5",
          isCollapsed && "flex-col gap-4 py-4",
        )}
      >
        <div
          className={cn("flex items-center gap-2", isCollapsed && "flex-col")}
        >
          {column.icon}
          {!isCollapsed && (
            <>
              <span className="text-sm font-semibold dark:text-neutral-200 text-foreground">
                {column.label}
              </span>
              <span className="text-[11px] font-medium dark:text-primary text-primary/80 dark:bg-primary/10 bg-primary/5 px-2 py-0.5 rounded-full">
                {issues.length}
              </span>
            </>
          )}
          {isCollapsed && (
            <h3 className="[writing-mode:vertical-lr] rotate-180 text-xs font-semibold text-neutral-500 py-2">
              {column.label}
            </h3>
          )}
        </div>

        <div
          className={cn("flex items-center gap-1", isCollapsed && "flex-col")}
        >
          {!isCollapsed && (
            <Button variant="ghost" size="icon" className="h-7 w-7 ">
              <ArrowDownNarrowWideIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={onToggle}
            variant="outline"
            size="icon"
            className="h-7 w-7"
          >
            <SeparatorVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-3">
          <CreateIssueDialog
            projectId={projectId}
            projectName={projectName}
            repoFullName={repoFullName}
            ownerClerkId={ownerClerkId}
            trigger={
              <Button
                variant="outline"
                className="w-full h-8 justify-center mb-5"
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      )}

      <div
        className={cn(
          "flex flex-col gap-2.5 overflow-y-auto custom-scrollbar px-3 pb-3",
          isCollapsed && "hidden",
        )}
      >
        <SortableContext
          items={issues.map((i) => i._id)}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <SortableIssue key={issue._id} issue={issue} />
          ))}
        </SortableContext>

        {issues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 border border-dashed dark:border-neutral-800 border-neutral-200 rounded-xl">
            <span className="text-[10px] text-muted-foreground font-medium italic">
              Empty
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const SortableIssue = ({ issue }: { issue: Issue }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: issue._id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-20 dark:border-2 dark:border-neutral-800 border-2 border-neutral-200 rounded-xl h-[130px] dark:bg-neutral-900 bg-neutral-100"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <IssueCard issue={issue} />
    </div>
  );
};

// ─── Issue Card ───────────────────────────────────────────────────────────────

export const IssueCard = ({
  issue,
  isOverlay,
}: {
  issue: Issue;
  isOverlay?: boolean;
}) => {
  const severity = issue.severity
    ? SEVERITY_CONFIG[issue.severity]
    : {
        label: "No Severity",
        iconColor: "text-neutral-500",
        icon: null,
      };
  const type = TYPE_CONFIG[issue.type];

  return (
    <Card
      className={cn(
        "group cursor-pointer p-2.5! dark:bg-muted bg-card dark:border-neutral-800 border-neutral-200 dark:hover:border-neutral-700 hover:border-neutral-300 transition-all rounded-xl shadow-sm",
        isOverlay && "scale-[1.02] shadow-2xl dark:border-neutral-700 border-neutral-300 dark:bg-sidebar bg-card",
      )}
    >
      <div className="flex flex-col gap-3">
        {/* Top: Severity and Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-1 rounded dark:bg-sidebar bg-neutral-100 dark:border-neutral-800 border-neutral-200 dark:text-neutral-400 text-neutral-500 flex items-center gap-1.5",
              )}
            >
              <span className={cn(severity.iconColor)}>
                {severity.icon &&
                  React.cloneElement(severity.icon as React.ReactElement, {
                    // @ts-ignore
                    className: "w-2.5 h-2.5",
                  })}
              </span>
              {severity.label}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-1 rounded dark:bg-sidebar bg-neutral-100 dark:border-neutral-800 border-neutral-200 dark:text-neutral-400 text-neutral-500 flex items-center gap-1.5",
              )}
            >
              <span className={cn(type.iconColor)}>
                {type.icon &&
                  React.cloneElement(type.icon as React.ReactElement, {
                    // @ts-ignore
                    className: "w-2.5 h-2.5",
                  })}
              </span>
              {type.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {issue.githubIssueUrl && (
              <a
                href={issue.githubIssueUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className=""
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-neutral-500 hover:text-primary transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Name */}
        <h4 className="text-[13px] font-medium dark:text-neutral-200 text-foreground line-clamp-2 leading-snug">
          {issue.title}
        </h4>

        {/* Codebase Linked */}
        <div className="flex items-center gap-2 text-neutral-500">
          <FileCode className="h-3.5 w-3.5" />
          <span className="text-[11px] truncate">
            {issue.fileLinked ? (
              <span className="text-neutral-400">
                {issue.fileLinked.split("/").pop()}
              </span>
            ) : (
              "Not linked any file"
            )}
          </span>
        </div>

        {/* Footer: Due Date and Assignee */}
        <div className="flex items-center justify-between pt-1 border-t dark:border-neutral-800/50 border-neutral-200 mt-1">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">
              {issue.due_date ? format(issue.due_date, "MMM d") : "No due date"}
            </span>
          </div>

          <div className="flex -space-x-1.5">
            {issue.assignedTo?.slice(0, 3).map((assignee, i) => (
              <Avatar
                key={i}
                className="h-5 w-5 border border-sidebar group-hover:border-neutral-800 transition-all"
              >
                <AvatarImage src={assignee.avatar} />
                <AvatarFallback className="text-[8px] dark:bg-neutral-800 bg-neutral-200 dark:text-neutral-400 text-neutral-600">
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
