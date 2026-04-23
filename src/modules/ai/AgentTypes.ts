import { WithMessages } from "./langGraphAgent/types";

export interface AgentState extends WithMessages {
  user_id?: string;
  project_id?: string;
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

// ── Union of all possible interrupt values ─────────────────────────────────
export type InterruptValue =
  | CalendarEventInterrupt
  | SprintItemSelectionInterrupt;

// ── Resume values the frontend can send back ───────────────────────────────
export type ResumeValue =
  | { action: "cancel" }
  | { action: "approve"; edits?: Partial<CalendarEventInterrupt["preview"]> }
  | { task_ids: string[] };

export type KayaCustomEvent =
  | { type: "status"; message: string }
  | { type: "memory_loaded"; count: number; memories?: string[] }
  | { type: "error"; message: string };
