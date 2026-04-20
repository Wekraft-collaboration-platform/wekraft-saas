"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarEventInterrupt, ResumeValue } from "@/modules/ai/AgentTypes";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Tag, FileText } from "lucide-react";

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
        "my-3 mx-4 p-4 border rounded-lg font-mono text-[11px]",
        isCompleted
          ? "border-emerald-900 bg-emerald-900/5 opacity-75"
          : "border-neutral-800 bg-card",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] text-neutral-500 uppercase tracking-widest">
          Calendar event · approval required
        </span>
        {isCompleted && (
          <span className="text-[9px] bg-emerald-900/40 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900">
            saved
          </span>
        )}
      </div>

      {/* Title */}
      <p className="text-sm font-sans font-medium text-foreground mb-3 leading-snug">
        {preview.title}
      </p>

      {/* Description */}
      {preview.description && (
        <p className="text-neutral-400 font-sans text-[11px] mb-3 leading-relaxed border-l border-neutral-800 pl-3">
          {preview.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 mb-4 text-neutral-500">
        <span
          className={cn(
            "px-2 py-0.5 rounded border uppercase text-[9px] tracking-wide",
            typeColor,
          )}
        >
          {preview.type}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {formatDate(preview.start)}
        </span>
        {preview.start !== preview.end && (
          <span className="flex items-center gap-1">
            <span>→</span>
            {formatDate(preview.end)}
          </span>
        )}
        {preview.allDay && <span className="text-neutral-600">all day</span>}
      </div>

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAction({ action: "cancel" })}
            disabled={isLoading}
            className="text-[10px] uppercase border border-neutral-800 rounded-md h-7 px-3 text-neutral-400 hover:text-neutral-200"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction({ action: "approve" })}
            disabled={isLoading}
            className="text-[10px] uppercase bg-blue-900/20 text-blue-400 border border-blue-900 rounded-md h-7 px-4 hover:bg-blue-900/40"
          >
            {isLoading ? "Saving..." : "Confirm & Save"}
          </Button>
        </div>
      )}
    </div>
  );
}
