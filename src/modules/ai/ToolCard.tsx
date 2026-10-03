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
    colorClass: "bg-indigo-500/30 text-primary/80",
  },
  ask_project_analyst: {
    label: "Project analyst agent",
    caller: "Kaya",
    colorClass: "bg-indigo-500/30 text-primary/80",
  },
  sprint_agent: {
    label: "Sprint manager agent",
    caller: "Kaya",
    colorClass: "bg-indigo-500/30 text-primary/80",
  },
  db_write_agent: {
    label: "DB Write agent",
    caller: "Kaya",
    colorClass: "bg-indigo-500/30 text-primary/80",
  },
  mcp_agent: {
    label: "mcp agent",
    caller: "Kaya",
    colorClass: "bg-indigo-500/30 text-primary/80",
  },
  mcp: {
    label: "mcp agent",
    caller: "Kaya",
    colorClass: "bg-indigo-500/30 text-primary/80",
  },

  // ── MCP Tools ────────────────────────────────────────────────────────────
  linear_list_issues: {
    label: "linear list issues",
    caller: "MCP Agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  slack_list_channels: {
    label: "slack list channels",
    caller: "MCP Agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  calendly_get_availability: {
    label: "calendly get availability",
    caller: "MCP Agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  notion_search: {
    label: "notion search",
    caller: "MCP Agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  jira_list_issues: {
    label: "jira list issues",
    caller: "MCP Agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  jira_search_issues: {
    label: "jira search issues",
    caller: "MCP Agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },

  // ── Project Analyst's Tools ───────────────────────────────────────────────
  get_tasks_summary: {
    label: "Analyzing tasks summary",
    caller: "Project analyst",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  get_issues_summary: {
    label: "Analyzing issues summary",
    caller: "Project analyst",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  get_member_workload: {
    label: "Reviewing team workload",
    caller: "Project analyst",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  get_project_insights: {
    label: "Checking project timeline",
    caller: "Project analyst",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  get_user_standup: {
    label: "Preparing your standup",
    caller: "Project analyst",
    colorClass: "bg-neutral-800 text-neutral-300",
  },

  // ── Sprint Manager's Tools ────────────────────────────────────────────────
  get_sprint_insights: {
    label: "Analyzing sprint velocity",
    caller: "Sprint manager",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  create_sprint: {
    label: "Creating sprint",
    caller: "Sprint manager",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  add_items_to_sprint: {
    label: "Allocating sprint backlog",
    caller: "Sprint manager",
    colorClass: "bg-neutral-800 text-neutral-300",
  },

  // ── DB Write Tools ────────────────────────────────────────────────────────
  get_scheduler: {
    label: "Checking scheduler",
    caller: "DB Write agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  setup_report_scheduler: {
    label: "Setting up scheduler",
    caller: "DB Write agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  create_calendar_event: {
    label: "Creating calendar event",
    caller: "DB Write agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  bulk_create_tasks: {
    label: "Generating bulk tasks",
    caller: "DB Write agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
  bulk_create_issues: {
    label: "Generating bulk issues",
    caller: "DB Write agent",
    colorClass: "bg-neutral-800 text-neutral-300",
  },
};

export interface ToolCallCardProps {
  toolName: string;
  caller?: string;
  label?: string;
}

export function ToolCallCard({ toolName, caller, label }: ToolCallCardProps) {
  const isSkill = caller === "Skill" || caller === "Skill activated";
  const isKayaCaller = caller === "Kaya";
  const defaultColor = isSkill
    ? "bg-white/10 text-neutral-100 border border-white/20"
    : isKayaCaller
      ? "bg-indigo-500/30 text-primary/80"
      : "bg-neutral-800 text-neutral-300";

  const meta = TOOL_META[toolName] ?? {
    label: label || toolName.replace(/_/g, " "),
    caller: caller || "Agent",
    colorClass: defaultColor,
  };

  const finalCaller = isSkill ? "Skill" : caller || meta.caller;
  const finalLabel = label || meta.label;

  return (
    <div className="mx-4 my-1.5 px-3 py-1.5 border border-neutral-800 rounded-md bg-card text-xs tracking-tight text-muted-foreground flex items-center gap-3 w-fit animate-in fade-in duration-200">
      <span className="font-medium text-neutral-300">{finalCaller}</span>{" "}
      {isSkill ? "activated" : "called"}{" "}
      <MoveRight className="inline w-3 h-3 text-muted-foreground/70" />
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-3 rounded-full text-xs",
          isSkill
            ? "bg-white/10 text-neutral-100 border border-white/20"
            : meta.colorClass,
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            isSkill ? "bg-white" : "bg-current opacity-80",
          )}
        />
        <span className="capitalize">{finalLabel}</span>
      </div>
    </div>
  );
}
