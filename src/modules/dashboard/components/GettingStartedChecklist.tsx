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
    label: "Link repository to your Project",
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
    icon: LayoutDashboard,
    label: "Visit your Project workspace",
    hint: "Explore tasks, sprints & team tools",
    description:
      "Your workspace is the command center for your project. Explore tasks, sprints, issues, and your team — all in one place.",
    cta: "Go to workspace",
    action: (router, context) => {
      const projects = context?.projects;
      if (projects && projects.length > 0) {
        router.push(`/dashboard/my-projects/${projects[0].slug}?tour=workspace`);
      } else {
        router.push("/dashboard");
      }
    },
  },
  {
    id: 4,
    icon: ListTodo,
    label: "Create your first task",
    hint: "Assign, prioritize & track work",
    description:
      "Break your project into actionable tasks. Assign them to teammates, set priorities, link to code, and track completion.",
    cta: "Go to Tasks",
    action: (router, context) => {
      const projects = context?.projects;
      if (projects && projects.length > 0) {
        router.push(`/dashboard/my-projects/${projects[0].slug}/workspace/tasks?tour=create-task`);
      } else {
        router.push("/dashboard");
      }
    },
  },
  {
    id: 5,
    icon: CalendarClock,
    label: "Set a project deadline to Track",
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
    id: 6,
    icon: Users,
    label: "Invite teammates to collaborate",
    hint: "Share the invite link or email",
    description:
      "Bring your whole team in. Assign roles, control permissions, and collaborate in real time.",
    cta: "Invite teammates",
    action: (router, context) => {
      const projects = context?.projects;
      if (projects && projects.length > 0) {
        router.push(`/dashboard/my-projects/${projects[0].slug}?invite=true`);
      } else {
        router.push("/dashboard");
      }
    },
  },
  {
    id: 7,
    icon: Puzzle,
    label: "Install the VS Code extension",
    hint: "Manage tasks without leaving your editor",
    description:
      "The Wekraft VS Code extension lets you view tasks, log time, and push updates to your project — all inside your editor.",
    cta: "Installed",
    action: (router, context) => {
      if (context?.markExtensionInstalled) {
        context.markExtensionInstalled();
      }
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

  const [extensionInstalled, setExtensionInstalled] = useState(false);

  useEffect(() => {
    const handleExtensionInstalledEvent = () => {
      setExtensionInstalled(true);
    };
    window.addEventListener('mark-extension-installed', handleExtensionInstalledEvent);
    return () => window.removeEventListener('mark-extension-installed', handleExtensionInstalledEvent);
  }, []);

  const handleMarkExtensionInstalled = () => {
    setExtensionInstalled(true);
    window.dispatchEvent(new CustomEvent('mark-extension-installed'));
  };

  const completedIds = useMemo(() => [
    ...(progressData?.completedSteps ?? []),
    ...(extensionInstalled ? [7] : [])
  ], [progressData?.completedSteps, extensionInstalled]);

  // Auto-mark completed in DB if all steps finished locally
  useEffect(() => {
    if (currentUser && !currentUser.gettingstartedcompleted && completedIds.length >= 7) {
      completeGettingStarted().catch((err) => console.error("Error completing getting started checklist:", err));
    }
  }, [currentUser, completedIds, completeGettingStarted]);

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

  // Hide when fully done in DB
  if (currentUser?.gettingstartedcompleted) return null;

  const totalDone = completedIds.length;
  const totalSteps = STEPS.length;
  const pct = Math.round((totalDone / totalSteps) * 100);

  // Hide when fully done
  if (totalDone >= totalSteps) return null;

  // -1 = user explicitly closed everything, null = never interacted
  // Auto-open first incomplete step only when user hasn't explicitly closed
  const firstIncompleteId = STEPS.find((s) => !completedIds.includes(s.id))?.id ?? null;
  const activeId = expandedStep === -1 ? null : expandedStep !== null ? expandedStep : firstIncompleteId;

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
            <h2 className="text-[15px] font-medium text-white leading-none">Getting Started</h2>
            <span className="text-[10px] font-medium text-neutral-300 leading-none">{totalDone} of {totalSteps} completed</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('start-quick-tour'));
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
            <div key={step.id} className={cn("rounded-md transition-colors border", open ? "bg-white/5 border-white/5" : "border-transparent")}>
              {/* Step Row */}
              <button
                id={`tour-step-${step.id}`}
                type="button"
                onClick={() => {
                  if (!done) handleRowClick(step.id);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-all duration-150 outline-none group",
                  open ? "bg-white/5" : "hover:bg-white/5 data-[tour-active=true]:bg-white/5",
                  !done ? "cursor-pointer" : "cursor-default"
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
                          : "text-muted-foreground/25 group-hover:text-muted-foreground/50 group-data-[tour-active=true]:text-muted-foreground/50"
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
                          : "text-white group-hover:text-white data-[tour-active=true]:text-white"
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
                      open ? "rotate-180 text-white" : ""
                    )}
                  />
                )}
              </button>

              {/* Expanded detail panel */}
              {open && (
                <div className="pl-10 pr-3 pb-4 pt-1">
                  <p className="text-[11px] leading-relaxed text-muted-foreground mb-4">
                    {step.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      step.action(router, {
                        projects: userProjects,
                        markExtensionInstalled: handleMarkExtensionInstalled,
                      });
                      setExpandedStep(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-white border border-white/10 rounded-md px-2 py-1.5 hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer"
                  >
                    {step.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
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
