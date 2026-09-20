"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  TaskCreationInterrupt,
  ResumeValue,
  TaskItemPreview,
} from "@/modules/ai/AgentTypes";
import { cn } from "@/lib/utils";
import {
  CheckCheck,
  AlertCircle,
  CheckSquare,
  Bug,
  AlertTriangle,
  Flame,
  ListTodo,
} from "lucide-react";

interface TaskApprovalCardProps {
  interruptValue: TaskCreationInterrupt;
  isCompleted?: boolean;
  onResume: (value: ResumeValue) => void;
}

const PRIORITY_BADGES: Record<string, { label: string; className: string }> = {
  critical: {
    label: "Critical",
    className: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  high: {
    label: "High",
    className: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
  medium: {
    label: "Medium",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  low: {
    label: "Low",
    className: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
};

export function TaskApprovalCard({
  interruptValue,
  isCompleted,
  onResume,
}: TaskApprovalCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!interruptValue?.preview) return null;

  const { preview, message } = interruptValue;
  const isIssue =
    preview.type === "issue" || interruptValue.tool.includes("issue");
  const items: TaskItemPreview[] = preview.tasks || preview.issues || [];

  const handleAction = (value: ResumeValue) => {
    setIsLoading(true);
    onResume(value);
  };

  if (isCompleted) {
    return (
      <div className="my-2 mx-4 px-3 py-1.5 w-fit rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-neutral-300 text-xs flex items-center gap-2">
        <CheckCheck className="w-3.5 h-3.5" />
        <span className="font-medium">
          Action Approved ({items.length}{" "}
          {isIssue
            ? items.length === 1
              ? "issue"
              : "issues"
            : items.length === 1
              ? "task"
              : "tasks"}
          )
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "my-3 p-3 w-full max-w-[440px] mx-4 border rounded-xl transition-all shadow-md border-border/80 bg-sidebar",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        {isCompleted ? (
          <span className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        ) : (
          <span className="text-xs flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Approval Required</span>
          </span>
        )}
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] ",
            isIssue
              ? "bg-neutral-600/30 text-neutral-300"
              : "bg-neutral-600/30 text-neutral-300",
          )}
        >
          {isIssue ? (
            <>
              <Bug className="w-3 h-3" />
              <span>Issue Creation</span>
            </>
          ) : (
            <>
              <CheckSquare className="w-3 h-3" />
              <span>Task Creation</span>
            </>
          )}
        </div>
      </div>

      {/* Main Message / Subtitle */}
      <p className="text-xs font-medium text-foreground mb-3 leading-snug">
        {message ||
          (isIssue
            ? "Review and approve issues to create:"
            : "Review and approve tasks to create:")}
      </p>

      {/* Items List */}
      <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-3 pr-1">
        {items.length === 0 ? (
          <div className="text-xs text-muted-foreground italic py-2 text-center bg-accent/20 rounded-lg">
            No specific items extracted.
          </div>
        ) : (
          items.map((item, idx) => {
            const level = item.priority || "NA";
            const badge =
              PRIORITY_BADGES[level.toLowerCase()] ?? PRIORITY_BADGES.medium;

            return (
              <div
                key={idx}
                className="flex flex-col p-1.5 rounded-sm border border-border/60 bg-card/60 hover:bg-card/90 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center shrink-0">
                      {isIssue ? (
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                      ) : (
                        <ListTodo className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-foreground truncate leading-tight">
                      {item.title}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[9px]  border  shrink-0",
                      badge.className,
                    )}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* {item.description && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 pl-7 leading-relaxed">
                    {item.description}
                  </p>
                )} */}
              </div>
            );
          })
        )}
      </div>

      {/* Actions Footer */}
      <div className="border-t border-border/80 pt-2.5 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          {items.length}{" "}
          {items.length === 1
            ? isIssue
              ? "issue"
              : "task"
            : isIssue
              ? "issues"
              : "tasks"}{" "}
          to insert
        </span>
        {!isCompleted ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleAction({ action: "cancel" })}
              disabled={isLoading}
              className="text-[11px] h-7 px-3 cursor-pointer hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="default"
              onClick={() => handleAction({ action: "approve" })}
              disabled={isLoading}
              className={cn(
                "text-[11px] h-7 px-3 font-medium text-white shadow-xs cursor-pointer",
                isIssue
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-blue-600 hover:bg-blue-700",
              )}
            >
              {isLoading ? "Saving..." : "Confirm"}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Action Completed
          </p>
        )}
      </div>
    </div>
  );
}
