// src/modules/ai/ToolCallCard.tsx
"use client";

import { Calendar } from "lucide-react";

const TOOL_META: Record<string, { label: string; icon: React.ReactNode }> = {
  create_calendar_event: {
    label: "Creating calendar event",
    icon: <Calendar className="w-3 h-3" />,
  },
};

interface ToolCallCardProps {
  toolName: string;
}

export function ToolCallCard({ toolName }: ToolCallCardProps) {
  const meta = TOOL_META[toolName] ?? { label: toolName, icon: null };

  return (
    <div className="mx-4 my-2 px-3 py-2 border border-neutral-800 rounded-md bg-card flex items-center gap-2 text-[10px] text-neutral-500 font-mono uppercase tracking-wide w-fit">
      {meta.icon}
      <span>{meta.label}</span>
    </div>
  );
}
