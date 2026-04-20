"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarEventInterrupt, ResumeValue } from "@/modules/ai/AgentTypes";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Tag,
  FileText,
  AlertCircle,
  MoveRight,
  CheckCheck,
} from "lucide-react";

interface CalendarApprovalCardProps {
  interruptValue: CalendarEventInterrupt;
  isCompleted?: boolean;
  onResume: (value: ResumeValue) => void;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const TYPE_COLORS: Record<string, string> = {
  event: "text-blue-400 border-blue-900  bg-blue-900/10",
  milestone: "text-amber-400 border-amber-900 bg-amber-900/10",
};

export function CalendarApprovalCard({
  interruptValue,
  isCompleted,
  onResume,
}: CalendarApprovalCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!interruptValue?.preview) return null;

  const { preview } = interruptValue;
  const typeColor = TYPE_COLORS[preview.type] ?? TYPE_COLORS.event;

  const handleAction = (value: ResumeValue) => {
    setIsLoading(true);
    onResume(value);
  };

  return (
    <div
      className={cn(
        "my-3 p-2 w-full max-w-[400px] mx-4 border rounded-md",
        isCompleted
          ? "border-border bg-sidebar/20 opacity-60"
          : "border-border bg-sidebar",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {isCompleted ? (
          <span className="text-xs font-medium text-blue-500">
            <CheckCheck className="w-3 h-3 inline mr-1" />{" "}
            <span>Completed</span>
          </span>
        ) : (
          <span className="text-xs font-medium text-blue-500">
            <AlertCircle className="w-3 h-3 inline mr-1" />{" "}
            <span>Approval Required</span>
          </span>
        )}
        <p
          className={cn(
            "px-2 py-0.5 rounded border uppercase text-[9px] tracking-wide",
            typeColor,
          )}
        >
          {preview.type}
        </p>
      </div>

      {/* Title */}
      <div className="flex items-center gap-6 mb-2">
        <p className="text-sm font-sans capitalize font-medium text-foreground truncate leading-snug">
          {preview.title}
        </p>
      </div>
      {/* Description */}
      {/* {preview.description && (
        <p className="text-muted-foreground font-sans text-xs mb-3 leading-relaxed border-l border-neutral-800 pl-3">
          {preview.description}
        </p>
      )} */}

      <div className="flex flex-wrap text-xs  bg-accent/30 p-1 rounded-md mb-5">
        <span className="flex items-center gap-1">
          <div className="bg-card w-7 h-7 flex items-center justify-center rounded-md mr-2">
            <Calendar className="w-3 h-3 " />
          </div>
          {formatDate(preview.start)}
        </span>
        {preview.start !== preview.end && (
          <span className="flex items-center gap-1">
            <span>
              <MoveRight className="w-3 h-3 mx-2" />
            </span>
            {formatDate(preview.end)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border p-1.5">
        {!isCompleted ? (
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction({ action: "cancel" })}
              disabled={isLoading}
              className="text-[10px] h-7!"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant={"default"}
              onClick={() => handleAction({ action: "approve" })}
              disabled={isLoading}
              className="text-[10px] h-7! bg-blue-500 text-white hover:bg-blue-600"
            >
              {isLoading ? "Saving..." : "Confirm"}
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-right italic">
            Event Action Completed
          </p>
        )}
      </div>
    </div>
  );
}
