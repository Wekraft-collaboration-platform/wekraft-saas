// src/modules/ai/ToolCallCard.tsx
"use client";

import { Calendar, MoveRight } from "lucide-react";

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
    <div className="mx-4 my-2 px-3 py-2 border border-neutral-800 rounded-md bg-card text-xs tracking-tight text-muted-foreground flex items-center gap-3  w-fit">
      Kaya called <MoveRight className="inline w-3 h-3" />
      <div className="flex items-center gap-2 py-1 px-3 rounded bg-accent/40">
        {meta.icon}
        <span>{meta.label}</span>
      </div>
    </div>
  );
}
