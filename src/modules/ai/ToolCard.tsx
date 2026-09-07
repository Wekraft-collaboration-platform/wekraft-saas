// src/modules/ai/ToolCard.tsx
"use client";

import { MoveRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOL_META: Record<
  string,
  { label: string; caller: string; colorClass: string }
> = {
  // ── Kaya calling Sub-Agents ───────────────────────────────────────────────
  analyst_agent: {
    label: "Project analyst agent",
    caller: "Kaya",
    colorClass: "bg-amber-500/30 text-primary",
  },
  ask_project_analyst: {
    label: "Project analyst agent",
    caller: "Kaya",
    colorClass: "bg-amber-500/30 text-primary",
  },
  sprint_agent: {
    label: "Sprint manager agent",
    caller: "Kaya",
    colorClass: "bg-blue-500/25 text-primary",
  },
  db_write_agent: {
    label: "DB & Memory agent",
    caller: "Kaya",
    colorClass: "bg-violet-500/25 text-primary",
  },

  // ── Project Analyst's Tools ───────────────────────────────────────────────
  get_tasks_summary: {
    label: "Analyzing tasks summary",
    caller: "Project analyst",
    colorClass: "bg-indigo-500/30 text-primary/80",
  },
  get_issues_summary: {
    label: "Analyzing issues summary",
    caller: "Project analyst",
    colorClass: "bg-indigo-500/30 text-primary/80",
  },
  get_member_workload: {
    label: "Reviewing team workload",
    caller: "Project analyst",
    colorClass: "bg-indigo-500/30 text-primary/80",
  },
  get_project_insights: {
    label: "Checking project timeline",
    caller: "Project analyst",
    colorClass: "bg-indigo-500/30 text-primary/80",
  },
  get_user_standup: {
    label: "Preparing your standup",
    caller: "Project analyst",
    colorClass: "bg-orange-600/30 text-primary/80",
  },

  // ── Sprint Manager's Tools ────────────────────────────────────────────────
  get_sprint_insights: {
    label: "Analyzing sprint velocity",
    caller: "Sprint manager",
    colorClass: "bg-blue-500/20 text-muted-foreground",
  },
  create_sprint: {
    label: "Creating sprint",
    caller: "Sprint manager",
    colorClass: "bg-blue-500/20 text-muted-foreground",
  },
  add_items_to_sprint: {
    label: "Allocating sprint backlog",
    caller: "Sprint manager",
    colorClass: "bg-blue-600/20 text-primary/80",
  },

  // ── DB Write & Memory Tools ───────────────────────────────────────────────
  search_user_memory: {
    label: "Searching user memory",
    caller: "DB Write agent",
    colorClass: "bg-emerald-500/20 text-emerald-300",
  },
  get_scheduler: {
    label: "Checking scheduler",
    caller: "DB Write agent",
    colorClass: "bg-violet-600/20 text-primary/80",
  },
  setup_report_scheduler: {
    label: "Setting up scheduler",
    caller: "DB Write agent",
    colorClass: "bg-violet-600/30 text-primary/80",
  },
  create_calendar_event: {
    label: "Creating calendar event",
    caller: "DB Write agent",
    colorClass: "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  },
  bulk_create_tasks: {
    label: "Generating bulk tasks",
    caller: "DB Write agent",
    colorClass: "bg-purple-500/20 text-primary/80",
  },
  bulk_create_issues: {
    label: "Generating bulk issues",
    caller: "DB Write agent",
    colorClass: "bg-purple-500/20 text-primary/80",
  },
};

export interface ToolCallCardProps {
  toolName: string;
  caller?: string;
  label?: string;
}

export function ToolCallCard({ toolName, caller, label }: ToolCallCardProps) {
  const meta = TOOL_META[toolName] ?? {
    label: label || toolName.replace(/_/g, " "),
    caller: caller || "Agent",
    colorClass:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  };

  const finalCaller = caller || meta.caller;
  const finalLabel = label || meta.label;

  return (
    <div className="mx-4 my-1.5 px-3 py-1.5 border border-neutral-800 rounded-md bg-card text-xs tracking-tight text-muted-foreground flex items-center gap-3 w-fit animate-in fade-in duration-200">
      <span className="font-medium text-neutral-300">{finalCaller}</span> called <MoveRight className="inline w-3 h-3 text-muted-foreground/70" />
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-3 rounded-full text-xs",
          meta.colorClass,
        )}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
        <span>{finalLabel}</span>
      </div>
    </div>
  );
}

