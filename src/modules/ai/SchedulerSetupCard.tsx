"use client";

import { useState } from "react";
import {
  CalendarClock,
  BarChart2,
  Layers,
  Check,
  Save,
  ClipboardClock,
  TicketCheck,
  BarChart,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface SchedulerResumeValue {
  name: string;
  frequencyDays: number;
  recipientEmail?: string;
  isActive: boolean;
}

interface SchedulerSetupCardProps {
  projectId: string;
  isCompleted: boolean;
  initialData?: {
    name: string;
    frequencyDays: number;
    recipientEmail?: string;
    isActive: boolean;
  };
  onResume: (value: SchedulerResumeValue) => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export function SchedulerSetupCard({
  isCompleted,
  initialData,
  onResume,
}: SchedulerSetupCardProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [frequencyDays, setFrequencyDays] = useState<string>(
    initialData?.frequencyDays?.toString() ?? "7",
  );
  const [recipientEmail, setRecipientEmail] = useState(
    initialData?.recipientEmail ?? "",
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [submitted, setSubmitted] = useState(false);

  const freq = parseInt(frequencyDays) || 3;
  const isFreqValid = freq >= 3 && freq <= 9;
  const canSubmit = name.trim().length > 0 && isFreqValid;

  function handleSubmit() {
    if (!canSubmit || submitted || isCompleted) return;
    setSubmitted(true);
    onResume({
      name: name.trim(),
      frequencyDays: freq,
      recipientEmail: recipientEmail.trim() || undefined,
      isActive: isActive,
    });
  }

  // ── Completed state ────────────────────────────────────────────────────
  if (submitted && !isCompleted) {
    return (
      <div className="mx-4 my-2 w-full max-w-[300px]">
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-4 py-3 flex items-center gap-3 text-[12px] text-muted-foreground animate-pulse">
          <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
          Configuring scheduler...
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="mx-auto my-4 w-full max-w-[400px]">
        <div className="rounded-md border border-violet-500/20 bg-card shadow-md overflow-hidden">
          <div className="px-3 py-2 border-b border-violet-500/10 flex items-center justify-between bg-violet-500/5">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">
                Active Scheduler
              </span>
            </div>
            {/* <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-500/20 text-[10px] text-primary font-medium border border-violet-500/30">
              <Check className="w-2.5 h-2.5" /> Live
            </div> */}
          </div>

          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                <ClipboardClock className="w-3.5 h-3.5 text-primary/70" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground  tracking-tighter mb-0.5">
                  Scheduler Name
                </p>
                <p className="text-xs font-medium text-foreground">
                  {initialData?.name || name}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                  <TicketCheck className="w-3.5 h-3.5 text-primary/70" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground  tracking-tighter mb-0.5">
                    Recipient
                  </p>
                  <p className="text-xs! font-medium text-foreground truncate max-w-[160px]">
                    {initialData?.recipientEmail ||
                      recipientEmail ||
                      "Owner Email"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                  <BarChart className="w-3.5 h-3.5 text-primary/70" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground  tracking-tighter mb-0.5">
                    Frequency
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    Every {initialData?.frequencyDays || freq} Days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto my-4 w-full max-w-[400px]">
      <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
        {/* Compact Header */}
        <div className="px-3 py-2 border-b border-border flex items-center justify-between bg-sidebar">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-3.5 h-3.5 text-primary" />
            <span className="text-sm tracking-wider">Scheduler</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs">Toggle: </span>
            <button
              onClick={() => setIsActive(!isActive)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all border",
                isActive
                  ? "bg-violet-500/10 border-violet-500/20 text-primary"
                  : "bg-muted border-border text-muted-foreground",
              )}
            >
              {isActive ? "Active" : "Paused"}
            </button>
          </div>
        </div>

        <div className="px-3 py-3 space-y-3">
          {/* Name Input */}
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground capitalize tracking-tight">
              <ClipboardClock className="w-3.5 h-3.5" /> Scheduler Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daily Sync"
              className="w-full h-8 rounded-md border border-border bg-background px-2 py-1 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>

          {/* Row for Recipient Email and Frequency */}
          <div className="flex flex-col gap-3">
            {/* Recipient Email */}
            <div className="space-y-1">
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground capitalize tracking-tight">
                <TicketCheck className="w-3.5 h-3.5" />
                Recipient Email (Optional)
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="e.g. team@example.com"
                className="w-full h-8 rounded-md border border-border bg-background px-2 py-1 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {/* Frequency Input */}
            <div className="space-y-1 w-full">
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground capitalize tracking-tight">
                <BarChart className="w-3.5 h-3.5" />
                Frequency in Days (3-9)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={3}
                  max={9}
                  value={frequencyDays}
                  onChange={(e) => setFrequencyDays(e.target.value)}
                  className={cn(
                    "w-full h-8 rounded-md border bg-background pl-2 pr-7 text-xs focus:outline-none transition",
                    isFreqValid
                      ? "border-border focus:ring-1 focus:ring-violet-500/50"
                      : "border-red-500/50 focus:ring-1 focus:ring-red-500/30",
                  )}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">
                  days
                </span>
              </div>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              "mt-5 h-7 rounded-md text-[10px]  px-6 flex items-center ml-auto",
              canSubmit
                ? "bg-violet-600 hover:bg-violet-500 text-white shadow-md active:scale-[0.98]"
                : "bg-muted text-muted-foreground cursor-not-allowed",
            )}
          >
            Save Configuration <Save className="w-3 h-3 inline ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
