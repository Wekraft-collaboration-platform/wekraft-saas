"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  Github,
  GitBranch,
  Users,
  CalendarClock,
  ListTodo,
  Puzzle,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useState } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface StepConfig {
  id: number;
  icon: React.ElementType;
  label: string;
  hint: string;
  description: string;
  cta: string;
  action: (router: ReturnType<typeof useRouter>) => void;
}

// ─── Steps ─────────────────────────────────────────────────────────────────
export const STEPS: StepConfig[] = [
  {
    id: 1,
    icon: Github,
    label: "Connect GitHub",
    hint: "Required to track commits & PRs",
    description:
      "Link your GitHub account to unlock commit tracking, pull-request syncing, and developer stats across all your projects.",
    cta: "Connect GitHub account",
    action: (router) => {
      router.push("/dashboard");
      setTimeout(() => {
        document.getElementById("connect-github-btn")?.click();
      }, 400);
    },
  },
  {
    id: 2,
    icon: GitBranch,
    label: "Link a repository",
    hint: "Connect GitHub repo to your project",
    description:
      "Connect a GitHub repository to your project so Wekraft can sync commits, pull requests, and branches automatically.",
    cta: "Link a repository",
    action: (router) => {
      router.push("/dashboard/repositories");
    },
  },
  {
    id: 3,
    icon: Users,
    label: "Invite teammates",
    hint: "Share the invite link or email",
    description:
      "Bring your whole team in. Assign roles, control permissions, and collaborate in real time. The more the merrier.",
    cta: "Go to your workspace team",
    action: (router) => {
      router.push("/dashboard");
      setTimeout(() => {
        document.getElementById("tour-projects-tab")?.click();
        setTimeout(() => {
          document.getElementById("workspace-link-btn")?.click();
        }, 350);
      }, 450);
    },
  },
  {
    id: 4,
    icon: CalendarClock,
    label: "Set a project deadline",
    hint: "Keeps the team focused",
    description:
      "Define a target delivery date for your project. Wekraft will track your time-to-deadline and alert you as it approaches.",
    cta: "Open workspace overview",
    action: (router) => {
      router.push("/dashboard");
      setTimeout(() => {
        document.getElementById("tour-projects-tab")?.click();
        setTimeout(() => {
          document.getElementById("workspace-link-btn")?.click();
        }, 350);
      }, 450);
    },
  },
  {
    id: 5,
    icon: ListTodo,
    label: "Create your first task",
    hint: "Assign, prioritize & track work",
    description:
      "Break your project into actionable tasks. Assign them to teammates, set priorities, link to code, and track completion.",
    cta: "Go to Tasks",
    action: (router) => {
      router.push("/dashboard");
      setTimeout(() => {
        document.getElementById("tour-projects-tab")?.click();
        setTimeout(() => {
          document.getElementById("workspace-link-btn")?.click();
        }, 350);
      }, 450);
    },
  },
  {
    id: 6,
    icon: Puzzle,
    label: "Install the VS Code extension",
    hint: "Manage tasks without leaving your editor",
    description:
      "The Wekraft VS Code extension lets you view tasks, log time, and push updates to your project — all inside your editor.",
    cta: "Open VS Code Marketplace",
    action: () => {
      window.open("https://marketplace.visualstudio.com/", "_blank");
    },
  },
];

// ─── Component ─────────────────────────────────────────────────────────────
export function GettingStartedChecklist() {
  const progressData = useQuery(api.user.getOnboardingProgress);
  const router = useRouter();
  const [expandedStep, setExpandedStep] = useState<number | null>(-1);

  // Skeleton while Convex query loads
  if (progressData === undefined) {
    return (
      <div className="border-b border-border/40 p-4 shrink-0">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="h-5 w-5 rounded-full bg-primary/10 animate-pulse" />
          <div className="flex flex-col gap-1">
            <div className="h-2.5 w-24 bg-muted/50 rounded animate-pulse" />
            <div className="h-2 w-16 bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-[3px] w-full bg-muted/30 rounded-full mb-3 animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2 px-2">
            <div className="h-4 w-4 rounded-full bg-muted/30 animate-pulse shrink-0" />
            <div className="h-2.5 bg-muted/30 rounded animate-pulse flex-1" />
          </div>
        ))}
      </div>
    );
  }

  const completedIds: number[] = progressData.completedSteps ?? [];
  const totalDone = completedIds.length;
  const totalSteps = STEPS.length;
  const pct = Math.round((totalDone / totalSteps) * 100);

  // Hide when fully done
  if (totalDone >= totalSteps) return null;

  // -1 = user explicitly closed everything, null = never interacted
  // Auto-open first incomplete step only when user hasn't explicitly closed
  const firstIncompleteId = STEPS.find((s) => !completedIds.includes(s.id))?.id ?? null;
  const activeId = expandedStep === -1 ? null : expandedStep !== null ? expandedStep : firstIncompleteId;

  const handleRowClick = (stepId: number, isDone: boolean) => {
    if (isDone) return;
    // If this step is currently open → close it (use -1 sentinel so auto-expand doesn't re-open)
    if (activeId === stepId) {
      setExpandedStep(-1);
    } else {
      setExpandedStep(stepId);
    }
  };

  return (
    <div className="border-b border-border/40 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-2.5 w-2.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground leading-none">Getting Started</p>
            <p className="text-[10px] text-muted-foreground/60 mt-0.5 leading-none">
              {totalDone} of {totalSteps} done
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              // Expand the first incomplete step to start the guided flow
              const firstId = STEPS.find((s) => !completedIds.includes(s.id))?.id ?? null;
              setExpandedStep(firstId);
            }}
            title="Quick Tour"
            className="flex items-center gap-1 h-5 px-2 rounded text-[10px] font-medium text-primary/70 hover:text-primary bg-primary/8 hover:bg-primary/15 transition-colors cursor-pointer border border-primary/15"
          >
            <Zap className="h-2.5 w-2.5" />
            Quick Tour
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-3">
        <div className="w-full h-[3px] bg-accent/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="px-2 pb-3 flex flex-col gap-px">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const done = completedIds.includes(step.id);
          const open = activeId === step.id && !done;

          return (
            <div key={step.id} id={`tour-step-${step.id}`}>
              {/* Step Row */}
              <button
                type="button"
                onClick={() => handleRowClick(step.id, done)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-150 outline-none",
                  done
                    ? "cursor-default"
                    : open
                    ? "bg-accent/30 cursor-pointer"
                    : "hover:bg-accent/20 cursor-pointer group"
                )}
              >
                {/* Completion status */}
                <span className="shrink-0">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : (
                    <Circle
                      className={cn(
                        "h-4 w-4 transition-colors",
                        open
                          ? "text-muted-foreground/60"
                          : "text-muted-foreground/25 group-hover:text-muted-foreground/50"
                      )}
                    />
                  )}
                </span>

                {/* Step icon */}
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-colors",
                    done
                      ? "text-muted-foreground/30"
                      : open
                      ? "text-foreground/60"
                      : "text-muted-foreground/40 group-hover:text-muted-foreground/60"
                  )}
                />

                {/* Label + hint */}
                <span className="flex flex-col flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-[13px] font-medium leading-none transition-colors",
                      done
                        ? "text-muted-foreground/40 line-through decoration-muted-foreground/20"
                        : open
                        ? "text-foreground"
                        : "text-muted-foreground/80 group-hover:text-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {!done && (
                    <span className="text-[10px] text-muted-foreground/40 mt-0.5 leading-none truncate">
                      {step.hint}
                    </span>
                  )}
                </span>

                {/* Chevron — only for incomplete */}
                {!done && (
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform duration-200 text-muted-foreground/25",
                      open ? "rotate-180 text-muted-foreground/50" : ""
                    )}
                  />
                )}
              </button>

              {/* Expanded detail panel */}
              {open && (
                <div className="mx-3 mt-0.5 mb-1.5 px-3 py-3 rounded-md border border-border/50 bg-muted/20">
                  <p className="text-[11px] leading-relaxed text-muted-foreground mb-2.5">
                    {step.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      step.action(router);
                      setExpandedStep(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {step.cta}
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
