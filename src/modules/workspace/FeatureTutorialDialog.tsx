"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  X,
  LayoutList,
  Paperclip,
  Tag,
  Zap,
  Bug,
  Globe,
  AlertTriangle,
  Github,
  CalendarDays,
  Plus,
  BarChart2,
  RefreshCw,
  Clock,
  Users,
  LineChart,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LuCheckCheck } from "react-icons/lu";

type FeatureKey = "task" | "issue" | "sprint" | "timeLogs";

interface Step {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface FeatureConfig {
  feature: FeatureKey;
  seenKey: "taskTutorialSeen" | "issueTutorialSeen" | "sprintTutorialSeen" | "timeLogsTutorialSeen";
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
    headerImage: "/1.svg",
    steps: [
      { icon: LayoutList, title: "Multiple views", desc: "Switch between List, Table, and Kanban — organize work the way your team thinks." },
      { icon: Paperclip, title: "Attachments", desc: "Files, designs, code links — all the context you need, right on the task." },
      { icon: Tag, title: "Custom tags", desc: "Color-coded tags and date ranges keep every task categorized and on schedule." },
      { icon: Zap, title: "Block as Issue", desc: "One click turns a blocker into a tracked issue — nothing slips through." },
    ],
  },
  {
    feature: "issue",
    seenKey: "issueTutorialSeen",
    title: "Issues",
    subtitle: "Bug & blocker tracker",
    headerImage: "/2.svg",
    steps: [
      { icon: Bug, title: "Log bugs", desc: "Capture defects manually or auto-generate them from blocked tasks." },
      { icon: Globe, title: "Environment", desc: "Tag bugs to Local, Dev, Staging, or Production — know exactly where it broke." },
      { icon: AlertTriangle, title: "Severity", desc: "Critical, Medium, or Low — prioritize your fix queue at a glance." },
      { icon: Github, title: "GitHub sync", desc: "Issues, status changes, and PRs stay in sync with your repo automatically." },
    ],
  },
  {
    feature: "sprint",
    seenKey: "sprintTutorialSeen",
    title: "Sprint",
    subtitle: "Time-boxed delivery",
    headerImage: "/3.svg",
    steps: [
      { icon: CalendarDays, title: "Create sprint", desc: "Set a goal, pick your dates, and your iteration is ready to run." },
      { icon: Plus, title: "Scope work", desc: "Drag backlog tasks and open bugs straight into the sprint — scope in seconds." },
      { icon: BarChart2, title: "Live progress", desc: "Real-time charts and counters show exactly where your sprint stands." },
      { icon: RefreshCw, title: "Velocity", desc: "Past sprint data powers Kaya AI's predictive estimates for what's next." },
    ],
  },
  {
    feature: "timeLogs",
    seenKey: "timeLogsTutorialSeen",
    title: "Time Logs",
    subtitle: "Track where time goes",
    headerImage: "/4.svg",
    steps: [
      { icon: Clock, title: "Log hours", desc: "Add hours to any task manually — no timers, no friction." },
      { icon: ClipboardList, title: "Traceability", desc: "Every log ties to a task or issue — full accountability, zero guesswork." },
      { icon: Users, title: "Team view", desc: "See individual and team effort side by side — spot overload before it happens." },
      { icon: LineChart, title: "AI insights", desc: "Your time data trains Kaya AI to estimate future work more accurately." },
    ],
  },
];

export function FeatureTutorialDialog({ feature }: { feature: FeatureKey }) {
  const tutorialStatus = useQuery(api.user.getTutorialSeenStatus);
  const markSeen = useMutation(api.user.markTutorialSeen);

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
    try { await markSeen({ feature }); } catch { /* non-blocking */ }
  };

  // ── X / backdrop = temporary close only (shows again on next visit) ──────
  const handleClose = () => setOpen(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop — temporary close only */}
      <div className="absolute inset-0 bg-black/5! backdrop-blur-[4px]" onClick={handleClose} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[440px] mx-4 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black animate-in fade-in zoom-in-95 duration-200">

        {/* ── Full-bleed image header ───────────────────────────── */}
        <div className="relative w-full h-44 overflow-hidden">
          <Image
            src={config.headerImage}
            alt=""
            fill
            className={`object-cover w-full h-full ${feature === 'task' ? 'scale-[2.2]' : ''}`}
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#111] via-black/30 to-transparent" />

          {/* X — temporary close */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1 rounded-full bg-black"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Title */}
          <div className="absolute bottom-3 left-4">
            <p className="text-white font-bold text-base leading-tight drop-shadow">{config.title}</p>
            <p className="text-white/55 text-[11px] mt-0.5">{config.subtitle}</p>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="bg-[#111] px-6 pt-5 pb-5">

          <h3 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-4">
            How to use {config.title}
          </h3>

          <ul className="space-y-4 mb-6">
            {config.steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={i} className="flex items-start gap-3.5">
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-white/[0.07] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-neutral-100 leading-tight mb-1">{step.title}</p>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">{step.desc}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* ── Footer ───────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/[0.07] mt-2">
            <Link
              href="/docs"
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
