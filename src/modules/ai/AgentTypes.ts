import { WithMessages } from "./langGraphAgent/types";

/**
 * Kaya agent state — maps directly to KayaState in graph.py
 */
export interface AgentState extends WithMessages {
  user_id?: string;
  project_id?: string;
  thread_id: string;
}

/**
 * Custom SSE events emitted via get_stream_writer() from Kaya nodes.
 * Extend this union as you add more custom events.
 */
export type KayaCustomEvent =
  | { type: "status"; message: string }
  | { type: "memory_loaded"; count: number; memories?: string[] }
  | { type: "error"; message: string };

/**
 * No HITL in Kaya yet — placeholder for future interrupts (e.g. PRD approval).
 */
export type InterruptValue = never;
export type ResumeValue = never;
