// src/modules/ai/ToolCard.tsx
"use client";

import { MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOL_META: Record<
  string,
  { label: string; caller: string; colorClass: string }
> = {
  // ── Kaya's own tools ──────────────────────────────────────────────────────
  create_calendar_event: {
    label: "Creating calendar event",
    caller: "Kaya",
    colorClass: "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  },
  ask_project_analyst: {
    label: "Agent project analyst",
    caller: "Kaya",
    colorClass: "bg-amber-600/20 text-primary/80",
  },
  create_sprint: {
    label: "Creating sprint",
    caller: "Kaya",
    colorClass: "bg-teal-600/30 text-primary/80",
  },
  add_items_to_sprint: {
    label: "Waiting for task selection",
    caller: "Kaya",
    colorClass: "bg-blue-600/20 text-primary/80",
  },
  get_scheduler: {
    label: "Checking scheduler",
    caller: "Kaya",
    colorClass: "bg-violet-600/20 text-primary/80",
  },
  setup_report_scheduler: {
    label: "Setting up scheduler",
    caller: "Kaya",
    colorClass: "bg-violet-600/30 text-primary/80",
  },

  // ── Project analyst's tools ───────────────────────────────────────────────
  get_project_tasks: {
    label: "Fetching tasks",
    caller: "Project analyst",
    colorClass: "bg-teal-600/20 text-primary/80",
  },
  get_project_issues: {
    label: "Fetching issues",
    caller: "Project analyst",
    colorClass: "bg-teal-600/20 text-primary/80",
  },
  get_sprint_planner_context: {
    label: "Checking sprint context",
    caller: "Project analyst",
    colorClass: "bg-pink-600/40 text-primary/80",
  },
};

interface ToolCallCardProps {
  toolName: string;
}

export function ToolCallCard({ toolName }: ToolCallCardProps) {
  const meta = TOOL_META[toolName] ?? {
    label: toolName,
    caller: "Agent",
    colorClass:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  };

  return (
    <div className="mx-4 my-2 px-3 py-2 border border-neutral-800 rounded-md bg-card text-xs tracking-tight text-muted-foreground flex items-center gap-3 w-fit">
      {meta.caller} called <MoveRight className="inline w-3 h-3" />
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-3 rounded-full",
          meta.colorClass,
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
        <span>{meta.label}</span>
      </div>
    </div>
  );
}
