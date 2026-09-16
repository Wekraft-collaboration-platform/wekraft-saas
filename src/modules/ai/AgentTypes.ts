import { WithMessages } from "./langGraphAgent/types";

export interface AgentState extends WithMessages {
  user_id?: string;
  user_name?: string;
  project_id?: string;
  project_name?: string;
  thread_id: string;
}

// ── Calendar event HITL interrupt payload ──────────────────────────────────
export interface CalendarEventInterrupt {
  tool: "create_calendar_event";
  message: string;
  preview: {
    title: string;
    description: string;
    type: "event" | "milestone";
    start: string; // ISO 8601
    end: string; // ISO 8601
    allDay: boolean;
  };
}

// ── Sprint item selection HITL interrupt payload ───────────────────────────
export interface SprintItemSelectionInterrupt {
  tool: "add_items_to_sprint";
  sprint_id: string;
  message?: string;
}

// ── Report scheduler setup HITL interrupt payload ─────────────────────────
export interface SchedulerSetupInterrupt {
  tool: "setup_report_scheduler";
  message: string;
  existing_data?: {
    name: string;
    frequencyDays: number;
    recipientEmail?: string;
    isActive: boolean;
  };
}

// ── Task & Issue Creation HITL interrupt payload ───────────────────────────
export interface TaskItemPreview {
  title: string;
  description?: string;
  priority?: "high" | "medium" | "low";
}

export interface TaskCreationInterrupt {
  tool:
    | "create_task"
    | "bulk_create_tasks"
    | "create_issue"
    | "bulk_create_issues";
  message: string;
  preview: {
    type: "task" | "issue";
    tasks?: TaskItemPreview[];
    issues?: TaskItemPreview[];
  };
}

// ── Union of all possible interrupt values ─────────────────────────────────
export type InterruptValue =
  | CalendarEventInterrupt
  | SprintItemSelectionInterrupt
  | SchedulerSetupInterrupt
  | TaskCreationInterrupt;

// ── Resume values the frontend can send back ───────────────────────────────
export type ResumeValue =
  | { action: "cancel" }
  //  { action: "approve"; edits?: Partial<CalendarEventInterrupt["preview"]> } older working code
  | { action: "approve"; edits?: any }
  | { task_ids: string[] }
  | {
      name: string;
      frequencyDays: number;
      recipientEmail?: string;
      isActive: boolean;
    };

export type KayaCustomEvent =
  | { type: "status"; message: string }
  | { type: "memory_loaded"; count: number; memories?: string[] }
  | { type: "error"; message: string };
