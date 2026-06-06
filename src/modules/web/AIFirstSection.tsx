"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import {
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Bug,
  Brain,
  Shield,
  Zap,
  MessageSquare,
  Target,
  Calendar,
  Users,
  GitCommit,
  FileCode,
  Search,
} from "lucide-react";

/* ─── Harry PR Review Simulation ─────────────────────────────────── */

interface ReviewStep {
  id: number;
  label: string;
  icon: React.ReactNode;
  status: "pending" | "running" | "done" | "warning";
  detail?: string;
}

const initialSteps: ReviewStep[] = [
  {
    id: 1,
    label: "Scanning PR #247",
    icon: <Search className="w-3.5 h-3.5" />,
    status: "done",
    detail: "feat: add payment gateway integration",
  },
  {
    id: 2,
    label: "Analyzing 12 changed files",
    icon: <FileCode className="w-3.5 h-3.5" />,
    status: "done",
    detail: "+342 / -89 lines",
  },
  {
    id: 3,
    label: "Security check passed",
    icon: <Shield className="w-3.5 h-3.5" />,
    status: "done",
    detail: "No vulnerabilities detected",
  },
  {
    id: 4,
    label: "Found 2 potential issues",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    status: "warning",
    detail: "Missing error handling in webhook.ts",
  },
  {
    id: 5,
    label: "Auto-created issue #89",
    icon: <Bug className="w-3.5 h-3.5" />,
    status: "done",
    detail: "Race condition in payment callback",
  },
  {
    id: 6,
    label: "Review complete",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    status: "done",
    detail: "Approved with suggestions",
  },
];

const HarryPRReview = () => {
  const getStatusColor = (status: ReviewStep["status"]) => {
    switch (status) {
      case "done":
        return "text-white";
      case "warning":
        return "text-amber-400";
      default:
        return "text-neutral-500";
    }
  };

  const getStatusDot = (status: ReviewStep["status"]) => {
    switch (status) {
      case "done":
        return "bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]";
      case "warning":
        return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
      default:
        return "bg-neutral-700";
    }
  };

  return (
    <div className="relative">
      {/* PR Header */}
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
          <GitPullRequest className="w-3.5 h-3.5 text-white/90" />
          <span className="text-xs font-medium text-white">#247</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-white/80 font-medium truncate">
            feat: add payment gateway integration
          </p>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            rox → main • 12 files changed
          </p>
        </div>
      </div>

      {/* Review Steps */}
      <div className="flex flex-col">
        {initialSteps.map((step, i) => (
          <div
            key={step.id}
            className="relative"
          >
            {/* Connector line — centered under the dot */}
            {i < initialSteps.length - 1 && (
              <div
                className="absolute left-[10px] top-[20px] w-px h-full bg-neutral-700/50 z-0"
              />
            )}

            <div className="flex items-start gap-3 py-2 px-1 rounded-lg relative z-10">
              {/* Status dot */}
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-neutral-800/80 border border-neutral-700/50 mt-0.5"
              >
                <div
                  className={`w-2 h-2 rounded-full ${getStatusDot(step.status)}`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(step.status)}>
                    {step.icon}
                  </span>
                  <span className="text-[13px] font-medium text-white/90">
                    {step.label}
                  </span>
                </div>
                {step.detail && (
                  <p className="text-[11px] text-neutral-500 mt-1 ml-[22px] leading-relaxed">
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Feature Boxes ──────────────────────────────────────────────── */

const kayaFeatures = [
  {
    icon: <Target className="w-4 h-4" />,
    title: "Deadline Guardian",
    desc: "Tracks every milestone and alerts before deadlines slip.",
  },
  {
    icon: <Users className="w-4 h-4" />,
    title: "Workload Balancer",
    desc: "Distributes tasks evenly across team capacity.",
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    title: "Daily Priorities",
    desc: "Tells each member what to focus on today.",
  },
  {
    icon: <MessageSquare className="w-4 h-4" />,
    title: "Lives in Teamspace",
    desc: "Chat with Kaya right inside your team channels.",
  },
];

const harryFeatures = [
  {
    icon: <GitCommit className="w-4 h-4" />,
    title: "Auto PR Review",
    desc: "Reviews every pull request for quality and security.",
  },
  {
    icon: <Bug className="w-4 h-4" />,
    title: "Bug Hunter",
    desc: "Detects bugs and auto-creates trackable issues.",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Smart Assignment",
    desc: "Auto-assigns issues to the right team member.",
  },
  {
    icon: <Brain className="w-4 h-4" />,
    title: "Codebase Copilot",
    desc: "Answers questions about your repo in seconds.",
  },
];

/* ─── Main Section ───────────────────────────────────────────────── */

const AIFirstSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-60px 0px" });

  const kayaRef = useRef<HTMLDivElement>(null);
  const harryRef = useRef<HTMLDivElement>(null);
  const kayaInView = useInView(kayaRef, { once: true, margin: "-80px 0px" });
  const harryInView = useInView(harryRef, { once: true, margin: "-80px 0px" });

  const kayaFeatRef = useRef<HTMLDivElement>(null);
  const harryFeatRef = useRef<HTMLDivElement>(null);
  const kayaFeatInView = useInView(kayaFeatRef, { once: true, margin: "-40px 0px" });
  const harryFeatInView = useInView(harryFeatRef, { once: true, margin: "-40px 0px" });

  return (
    <section className="bg-black py-20 md:py-32 px-6 md:px-12 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* ── Section Header ─────────────────────────────────── */}
        <motion.div
          ref={sectionRef}
          className="mb-16 md:mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex flex-col items-center text-center lg:items-end lg:justify-between lg:flex-row lg:text-left gap-8">
            <div className="flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-neutral-900/50 backdrop-blur-sm mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                <span className="text-[13px] font-medium text-white tracking-wide">
                  AI-First Approach
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15] text-center lg:text-left">
                Meet your AI team.{" "}
                <br className="hidden md:block" />
                <span className="text-neutral-400">
                  They never sleep, never miss.
                </span>
              </h2>
            </div>
            <p className="text-neutral-400 text-sm sm:text-base md:text-lg max-w-md leading-relaxed text-center lg:text-right">
              Two AI agents that live inside your workspace — one manages your
              project, the other guards your code. Together, they handle the
              work nobody wants to do.
            </p>
          </div>
        </motion.div>

        {/* ── Two Agent Cards ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ─ Kaya Card ─ */}
          <motion.div
            ref={kayaRef}
            initial={{ opacity: 0, y: 60 }}
            animate={kayaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative rounded-2xl border border-white/10 bg-neutral-950/80 overflow-hidden group"
          >
            {/* Gradient background overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-transparent via-indigo-500/10 to-fuchsia-500/20 pointer-events-none" />

            {/* Card header */}
            <div className="relative z-10 p-6 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="/kaya.svg" alt="Kaya" width={32} height={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-base">Kaya</h3>
                    <span className="text-[10px] font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      PM AGENT
                    </span>
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    Your intelligent project manager
                  </p>
                </div>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                The PM that actually gives a damn about your project. From
                managing deadlines to team workload to guiding what to prioritize
                today — Kaya lives inside your teamspace, talking directly with
                your team.
              </p>
            </div>

            {/* Image — edge-to-edge for bigger presence */}
            <div className="relative z-10 mt-10 h-[240px] md:h-[360px] overflow-hidden">
              <div
                className="relative w-full h-full border border-b-0 border-white/[0.06] rounded-t-xl overflow-hidden"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 60%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 60%, transparent 100%)",
                }}
              >
                <Image
                  src="/kaya-team.png"
                  alt="Kaya AI PM Agent managing team in WeKraft teamspace"
                  fill
                  priority
                  className="object-cover object-top scale-125 origin-top transition-transform duration-500 group-hover:scale-130"
                  sizes="(max-width: 1080px) 100vw, 50vw"
                />
              </div>
            </div>
          </motion.div>

          {/* ─ Harry Card ─ */}
          <motion.div
            ref={harryRef}
            initial={{ opacity: 0, y: 60 }}
            animate={harryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
            transition={{
              duration: 0.9,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.15,
            }}
            className="relative rounded-2xl border border-white/10 bg-neutral-950/80 overflow-hidden group"
          >
            {/* Gradient background overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-transparent via-yellow-500/10 to-orange-500/30 pointer-events-none" />

            {/* Card header */}
            <div className="relative z-10 p-6 pb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                  <img src="/harry.svg" alt="Harry" width={32} height={32} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-base">Harry</h3>
                    <span className="text-[10px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      DEV AGENT
                    </span>
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    Your senior developer on auto-pilot
                  </p>
                </div>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed">
                A senior dev agent that auto-reviews every PR and commit, tracks
                issues, auto-assigns bugs, and helps your team navigate the
                codebase. Always watching, always shipping.
              </p>
            </div>

            {/* Mock PR Review UI */}
            <div className="relative z-10 px-4 pb-6">
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-linear-to-b from-neutral-900 to-neutral-950/60 p-5">
                {/* Harry review header */}
                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-white/[0.05]">
                  <div className="w-6 h-6 rounded-md flex items-center justify-center overflow-hidden">
                    <img
                      src="/harry.svg"
                      alt="Harry"
                      width={18}
                      height={18}
                    />
                  </div>
                  <span className="text-xs font-medium text-white/80">
                    Harry is reviewing...
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
                    <span className="text-[10px] text-white/80">Live</span>
                  </div>
                </div>

                {/* PR Review steps */}
                <HarryPRReview />
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Feature Boxes ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Kaya features */}
          <motion.div
            ref={kayaFeatRef}
            initial={{ opacity: 0, y: 30 }}
            animate={kayaFeatInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid grid-cols-2 gap-3"
          >
            {kayaFeatures.map((feat, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.08] bg-[#121316]/90 p-4 hover:bg-[#1a1b1e]/90 hover:border-white/[0.15] transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1a1b1e] border border-white/[0.06] flex items-center justify-center text-neutral-300 mb-3">
                  {feat.icon}
                </div>
                <h4 className="text-white text-sm font-semibold mb-1">
                  {feat.title}
                </h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Harry features */}
          <motion.div
            ref={harryFeatRef}
            initial={{ opacity: 0, y: 30 }}
            animate={harryFeatInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{
              duration: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.1,
            }}
            className="grid grid-cols-2 gap-3"
          >
            {harryFeatures.map((feat, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.08] bg-[#121316]/90 p-4 hover:bg-[#1a1b1e]/90 hover:border-white/[0.15] transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1a1b1e] border border-white/[0.06] flex items-center justify-center text-neutral-300 mb-3">
                  {feat.icon}
                </div>
                <h4 className="text-white text-sm font-semibold mb-1">
                  {feat.title}
                </h4>
                <p className="text-neutral-500 text-xs leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AIFirstSection;
