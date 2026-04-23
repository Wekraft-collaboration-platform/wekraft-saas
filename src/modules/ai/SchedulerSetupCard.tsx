"use client";

import { useState } from "react";
import { CalendarClock, BarChart2, Layers, Check, Save } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface SchedulerResumeValue {
  name: string;
  frequencyDays: number;
  reportType: "sprints" | "project";
  isActive: boolean;
}

interface SchedulerSetupCardProps {
  projectId: string;
  isCompleted: boolean;
  initialData?: {
    name: string;
    frequencyDays: number;
    reportType: "sprints" | "project";
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
  const [reportType, setReportType] = useState<"sprints" | "project">(
    initialData?.reportType ?? "sprints",
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
      reportType,
      isActive: isActive,
    });
  }

  // ── Completed state ────────────────────────────────────────────────────
  if (isCompleted || submitted) {
    return (
      <div className="mx-4 my-1.5 w-full max-w-[280px]">
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2 flex items-center gap-2.5 text-[11px] text-muted-foreground">
          <Check className="w-3 h-3 text-violet-400" />
          Scheduler configured
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

        <div className="px-3 py-3 space-y-3">
          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
              Scheduler Name
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

          {/* Row for Type and Frequency */}
          <div className="flex flex-col gap-3">
            {/* Report Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                Report Type
              </label>
              <div className="flex bg-muted/30 p-1 rounded-md border border-border h-10">
                {(["sprints", "project"] as const).map((type) => {
                  const Icon = type === "sprints" ? Layers : BarChart2;
                  const active = reportType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setReportType(type)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 rounded-[4px] text-[10px] transition-all",
                        active
                          ? "bg-background text-foreground shadow-sm border border-border/50"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Frequency Input */}
            <div className="space-y-1 w-full">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
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

          {/* Summary line */}
          {/* {canSubmit && (
            <div className="text-[9px] text-muted-foreground/80 italic text-center pt-1 border-t border-border/50">
              Generating{" "}
              <span className="text-violet-400 font-medium">{reportType}</span>{" "}
              report every{" "}
              <span className="text-violet-400 font-medium">{freq} days</span>
            </div>
          )} */}

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
