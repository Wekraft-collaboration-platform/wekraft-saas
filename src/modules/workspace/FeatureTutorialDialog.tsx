"use client";

import { useMutation, useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Bug,
  CalendarDays,
  Clock,
  Github,
  Globe,
  LayoutList,
  LineChart,
  Paperclip,
  Plus,
  RefreshCw,
  Tag,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuCheckCheck } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { api } from "../../../convex/_generated/api";

type FeatureKey = "task" | "issue" | "sprint" | "timeLogs";

const DOCS_MAPPING: Record<FeatureKey, string> = {
  task: "/web/docs/tasks",
  issue: "/web/docs/issues",
  sprint: "/web/docs/sprints",
  timeLogs: "/web/docs/time-logs",
};

interface Step {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface FeatureConfig {
  feature: FeatureKey;
  seenKey:
  | "taskTutorialSeen"
  | "issueTutorialSeen"
  | "sprintTutorialSeen"
  | "timeLogsTutorialSeen";
  title: string;
  subtitle: string;
  headerImage: string;
  steps: Step[];
}

const FEATURES: FeatureConfig[] = [
  {
    feature: "task",
    seenKey: "taskTutorialSeen",
    title: "Tasks",
    subtitle: "Your work board",
    headerImage: "/task.png",
    steps: [
      {
        icon: LayoutList,
        title: "Multiple views",
        desc: "Switch between List, Table, and Kanban — organize work the way your team thinks.",
      },
      {
        icon: Paperclip,
        title: "Attachments",
        desc: "Files, designs, code links — all the context you need, right on the task.",
      },
      {
        icon: Tag,
        title: "Link with codebase",
        desc: "Link the code directly with the task for seamless traceability and context.",
      },
      {
        icon: Zap,
        title: "Block as Issue",
        desc: "One click turns a blocker into a tracked issue — nothing slips through.",
      },
    ],
  },
  {
    feature: "issue",
    seenKey: "issueTutorialSeen",
    title: "Issues",
    subtitle: "Bug & blocker tracker",
    headerImage: "/issues.png",
    steps: [
      {
        icon: Bug,
        title: "Log bugs",
        desc: "Create issues manually, automatically from blocked tasks, or by importing them directly from your GitHub repositories.",
      },
      {
        icon: Globe,
        title: "Environment",
        desc: "Specify the exact deployment environment (Local, Dev, Staging, or Production) where the issue occurred.",
      },
      {
        icon: Zap,
        title: "Link code",
        desc: "Link specific code files and segments directly with your issues to provide immediate debugging context.",
      },
      {
        icon: Github,
        title: "Import GitHub",
        desc: "Connect your repository to import and sync issues.",
      },
    ],
  },
  {
    feature: "sprint",
    seenKey: "sprintTutorialSeen",
    title: "Sprint",
    subtitle: "Time-boxed delivery",
    headerImage: "/3.svg",
    steps: [
      {
        icon: CalendarDays,
        title: "Create sprint",
        desc: "Set a goal, pick your dates, and your iteration is ready to run.",
      },
      {
        icon: Plus,
        title: "Scope work",
        desc: "Drag backlog tasks and open bugs straight into the sprint — scope in seconds.",
      },
      {
        icon: BarChart2,
        title: "Live progress",
        desc: "Real-time charts and counters show exactly where your sprint stands.",
      },
      {
        icon: RefreshCw,
        title: "Velocity",
        desc: "Past sprint data powers Kaya AI's predictive estimates for what's next.",
      },
    ],
  },
  {
    feature: "timeLogs",
    seenKey: "timeLogsTutorialSeen",
    title: "Time Logs",
    subtitle: "Track where time goes",
    headerImage: "/time.png",
    steps: [
      {
        icon: Clock,
        title: "Pace tracker",
        desc: "Monitor project velocity and track the exact duration remaining until release.",
      },
      {
        icon: AlertTriangle,
        title: "Delay debt",
        desc: "Keep an eye on total days overdue to identify and resolve blockers early.",
      },
      {
        icon: LineChart,
        title: "Milestone trajectory",
        desc: "Forecast and predict exact milestone completion dates using historic velocity.",
      },
      {
        icon: CalendarDays,
        title: "Timeline",
        desc: "View tasks in a full Gantt-chart style layout to manage schedules and deadlines.",
      },
    ],
  },
];

export function FeatureTutorialDialog({ feature }: { feature: FeatureKey }) {
  const tutorialStatus = useQuery(api.user.getTutorialSeenStatus);
  const markSeen = useMutation(api.user.markTutorialSeen);

  // biome-ignore lint/style/noNonNullAssertion: config will always be found for valid feature keys
  const config = FEATURES.find((f) => f.feature === feature)!;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (tutorialStatus === undefined || tutorialStatus === null) return;
    if (!tutorialStatus[config.seenKey]) {
      const t = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(t);
    }
  }, [tutorialStatus, config.seenKey]);

  // ── Only "Got it" permanently marks as seen ──────────────────────────────
  const handleGotIt = async () => {
    setOpen(false);
    try {
      await markSeen({ feature });
    } catch {
      /* non-blocking */
    }
  };

  // ── X / backdrop = temporary close only (shows again on next visit) ──────
  const handleClose = () => setOpen(false);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop — temporary close only */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop clicking is standard mouse-only close */}
      <div
        role="presentation"
        className="absolute inset-0 bg-black/5! backdrop-blur-[4px]"
        onClick={handleClose}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[500px] mx-4 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black animate-in fade-in zoom-in-95 duration-200">
        {/* ── Full-bleed image header ───────────────────────────── */}
        <div
          className={`relative w-full overflow-hidden ${feature !== "sprint" ? "bg-blue-500 h-48" : "h-44"}`}
        >
          {feature !== "sprint" ? (
            <div className="absolute bottom-0 left-6 right-6 h-38 rounded-t-lg overflow-hidden border-t border-x border-white/20 shadow-2xl">
              <Image
                src={config.headerImage}
                alt=""
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          ) : (
            <>
              <Image
                src={config.headerImage}
                alt=""
                fill
                className="object-cover w-full h-full"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#111] via-black/30 to-transparent" />
            </>
          )}

          {/* X — temporary close */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-black hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Title */}
          {feature === "sprint" && (
            <div className="absolute bottom-3 left-4">
              <p className="text-white font-bold text-base leading-tight drop-shadow">
                {config.title}
              </p>
              <p className="text-white/55 text-[11px] mt-0.5">
                {config.subtitle}
              </p>
            </div>
          )}
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="bg-[#111] px-6 pt-5 pb-5">
          <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            How to work with {config.title}
          </h3>

          <ul className="space-y-4 mb-6">
            {config.steps.map((step) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/[0.07] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-neutral-100 leading-tight mb-1">
                      {step.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ── Footer ───────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.07] mt-2">
            <Link
              href={DOCS_MAPPING[feature]}
              className="flex items-center border rounded-sm px-3 py-1 bg-neutral-900 gap-1 text-[12px] text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Learn more <ArrowRight className="w-3 h-3" />
            </Link>

            {/* "Got it" = marks as seen permanently */}
            <Button
              onClick={handleGotIt}
              size="sm"
              className="h-7 px-5! rounded-sm text-xs font-medium bg-white text-black hover:bg-neutral-200"
            >
              Got it <LuCheckCheck />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
