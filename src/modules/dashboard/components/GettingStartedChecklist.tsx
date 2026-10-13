"use client";

import { useQuery, useMutation } from "convex/react";
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
  Compass,
  LayoutDashboard,
  ArrowRight,
  Zap,
  TramFront,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

// ─── Types ─────────────────────────────────────────────────────────────────
interface StepConfig {
  id: number;
  icon: React.ElementType;
  label: string;
  hint: string;
  description: string;
  cta: string;
  action: (router: ReturnType<typeof useRouter>, context?: any) => void;
}

// ─── Steps ─────────────────────────────────────────────────────────────────
export const STEPS: StepConfig[] = [
  {
    id: 1,
    icon: Github,
    label: "Connect your GitHub Account",
    hint: "Required to track commits & PRs",
    description:
      "To connect your account, head to your Dashboard and click 'Connect GitHub'. Authorize WeKraft with your GitHub account to sync commits, pull requests, and activity.",
    cta: "",
    action: () => {},
  },
  {
    id: 2,
    icon: GitBranch,
    label: "Link repository to your Project",
    hint: "Connect GitHub repo to your project",
    description:
      "To link a repository, navigate to Repositories from the sidebar or project settings, select your desired GitHub repo from the list, and attach it to your project.",
    cta: "",
    action: () => {},
  },
  {
    id: 3,
    icon: LayoutDashboard,
    label: "Visit your Project workspace",
    hint: "Explore tasks, sprints & team tools",
    description:
      "To open your workspace, select your project name from the sidebar under Projects. This opens the central hub containing tasks, sprints, analytics, and settings.",
    cta: "",
    action: () => {},
  },
  {
    id: 4,
    icon: ListTodo,
    label: "Create your first task",
    hint: "Assign, prioritize & track work",
    description:
      "Inside your project workspace, navigate to the Tasks tab, click '+ New Task', enter a title and description, and assign priorities or milestones.",
    cta: "",
    action: () => {},
  },
  {
    id: 5,
    icon: CalendarClock,
    label: "Set a project deadline to Track",
    hint: "Keeps the team focused",
    description:
      "Go to your Project Overview or Settings, locate the Deadline field, and pick your target delivery date. WeKraft tracks milestone countdowns automatically.",
    cta: "",
    action: () => {},
  },
  {
    id: 6,
    icon: Users,
    label: "Invite teammates to collaborate",
    hint: "Share the invite link or email",
    description:
      "Open your project workspace, click 'Invite' or go to Project Settings > Team, enter your colleague's email address or copy the direct project invite link.",
    cta: "",
    action: () => {},
  },
  {
    id: 7,
    icon: Sparkles,
    label: "Unlock your free trial (no charges)",
    hint: "Absolutely free for 1 week, upgrade to plus",
    description:
      "Use your 1 free trial. It has no charges, is absolutely free for 1 week, and lets you experience the Plus plan features.",
    cta: "Unlock Trial",
    action: (router, context) => {
      window.dispatchEvent(new CustomEvent("open-free-trial-dialog"));
    },
  },
];

// ─── Component ─────────────────────────────────────────────────────────────
export function GettingStartedChecklist() {
  const currentUser = useQuery(api.user.getCurrentUser);
  const completeGettingStarted = useMutation(api.user.completeGettingStarted);
  const progressData = useQuery(api.user.getOnboardingProgress);
  const userProjects = useQuery(api.project.getUserProjects);
  const router = useRouter();
  const [expandedStep, setExpandedStep] = useState<number | null>(-1);

  const userDetails = useQuery(api.user.getUserDetails);
  const [localSteps, setLocalSteps] = useState<number[]>([]);

  useEffect(() => {
    const updateLocal = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("wekraft_completed_steps") || "[]");
        setLocalSteps(stored);
      } catch {}
    };
    updateLocal();
    window.addEventListener("wekraft-step-completed", updateLocal);
    window.addEventListener("storage", updateLocal);
    return () => {
      window.removeEventListener("wekraft-step-completed", updateLocal);
      window.removeEventListener("storage", updateLocal);
    };
  }, []);

  const completedIds = useMemo(
    () => Array.from(new Set([
      ...(progressData?.completedSteps ?? []),
      ...(userDetails?.freeTrialUsed ? [7] : []),
      ...localSteps,
    ])),
    [progressData?.completedSteps, userDetails?.freeTrialUsed, localSteps],
  );

  // The first 6 steps are required. Step 7 (free trial) is optional/bonus —
  // skipping it should NOT block gettingstartedcompleted from being set in the DB.
  // This fixes a bug where referred users who skipped the trial were never counted
  // toward the referrer's referral reward (getReferralCount checks gettingstartedcompleted).
  const REQUIRED_STEPS = STEPS.filter((s) => s.id !== 7).map((s) => s.id); // [1,2,3,4,5,6]
  const requiredDone = REQUIRED_STEPS.every((id) => completedIds.includes(id));

  // Auto-mark completed in DB when all required steps (1-6) are finished.
  // Step 7 (free trial) is optional and does not block this.
  useEffect(() => {
    if (currentUser && !currentUser.gettingstartedcompleted && requiredDone) {
      completeGettingStarted().catch((err) =>
        console.error("Error completing getting started checklist:", err),
      );
    }
  }, [currentUser, requiredDone, completeGettingStarted]);

  // Skeleton while Convex query loads
  if (progressData === undefined || currentUser === undefined) {
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

  const totalDone = completedIds.length;
  const totalSteps = STEPS.length;
  const pct = Math.round((totalDone / totalSteps) * 100);

  // Hide when fully done
  if (totalDone >= totalSteps) return null;

  // -1 = user explicitly closed everything, null = never interacted
  // Auto-open first incomplete step only when user hasn't explicitly closed
  const firstIncompleteId =
    STEPS.find((s) => !completedIds.includes(s.id))?.id ?? null;
  const activeId =
    expandedStep === -1
      ? null
      : expandedStep !== null
        ? expandedStep
        : firstIncompleteId;

  const handleRowClick = (stepId: number) => {
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
        <div className="flex items-center gap-3">
          <Compass className="h-[22px] w-[22px] text-white" />
          <div className="flex flex-col items-start gap-1">
            <h2 className="text-[15px] font-medium text-white leading-none">
              Getting Started
            </h2>
            <span className="text-[10px] font-medium text-neutral-300 leading-none">
              {totalDone} of {totalSteps} completed
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("start-quick-tour"));
            }}
            title="Quick Tour"
            className="flex items-center gap-1 h-7 px-3! rounded text-xs font-medium text-primary/70 hover:text-primary bg-primary/5 hover:bg-primary/15 transition-colors cursor-pointer border border-primary/15"
          >
            <TramFront className="h-4 w-4" />
            Quick Tour
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-3">
        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-200 to-blue-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="px-2 pb-3 flex flex-col gap-px">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const done = completedIds.includes(step.id);
          const open = activeId === step.id;

          return (
            <div
              key={step.id}
              className={cn(
                "rounded-md transition-colors border",
                open ? "bg-white/5 border-white/5" : "border-transparent",
              )}
            >
              {/* Step Row */}
              <button
                id={`tour-step-${step.id}`}
                type="button"
                onClick={() => {
                  if (!done) handleRowClick(step.id);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-150 outline-none group",
                  open
                    ? "bg-white/5"
                    : "hover:bg-white/5 data-[tour-active=true]:bg-white/5",
                  !done ? "cursor-pointer" : "cursor-default",
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
                          : "text-muted-foreground/25 group-hover:text-muted-foreground/50 group-data-[tour-active=true]:text-muted-foreground/50",
                      )}
                    />
                  )}
                </span>

                {/* Label + hint */}
                <span className="flex flex-col flex-1 min-w-0">
                  <span
                    className={cn(
                      "text-sm font-medium leading-none transition-colors",
                      done
                        ? "text-muted-foreground line-through decoration-muted-foreground/50"
                        : open
                          ? "text-white"
                          : "text-white group-hover:text-white data-[tour-active=true]:text-white",
                    )}
                  >
                    {step.label}
                  </span>
                  {!done && (
                    <span className="text-[10px] text-muted-foreground mt-1 leading-none truncate">
                      {step.hint}
                    </span>
                  )}
                </span>

                {/* Chevron — only for incomplete */}
                {!done && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200 text-primary",
                      open ? "rotate-180 text-white" : "",
                    )}
                  />
                )}
              </button>

              {/* Expanded detail panel */}
              {open && (
                <div className="pl-10 pr-3 pb-4 pt-1">
                  <p className={cn("text-[11px] leading-relaxed text-muted-foreground", step.cta ? "mb-4" : "")}>
                    {step.description}
                  </p>
                  {step.cta ? (
                    <button
                      type="button"
                      onClick={() => {
                        step.action(router, {
                          projects: userProjects,
                        });
                        setExpandedStep(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-white border border-white/10 rounded-md px-2 py-1.5 hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer"
                    >
                      {step.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
