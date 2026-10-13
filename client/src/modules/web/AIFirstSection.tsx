"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import React, { useRef } from "react";
import {
  Brain,
  Zap,
  MessageSquare,
  Target,
  Calendar,
  Users,
  Blocks,
  CheckSquare,
} from "lucide-react";

/* ─── Feature Boxes ──────────────────────────────────────────────── */

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const agentFeatures: FeatureItem[] = [
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
  {
    icon: <Blocks className="w-4 h-4" />,
    title: "20+ Third-Party Integrations",
    desc: "Connect Linear, Slack, Notion, Supabase, and dev tools via MCP.",
  },
  {
    icon: <CheckSquare className="w-4 h-4" />,
    title: "Automate Task Creations",
    desc: "Turn discussions and issues into trackable tasks instantly.",
  },
  {
    icon: <Brain className="w-4 h-4" />,
    title: "Skills for Agents",
    desc: "Equip Kaya with custom skills, tools, and workspace context.",
  },
  {
    icon: <Zap className="w-4 h-4" />,
    title: "Smart Assignment",
    desc: "Auto-assigns issues and tasks to the right team member.",
  },
];

/* ─── Main Section ───────────────────────────────────────────────── */

const AIFirstSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(sectionRef, {
    once: true,
    margin: "-60px 0px",
  });

  const kayaRef = useRef<HTMLDivElement>(null);
  const kayaInView = useInView(kayaRef, { once: true, margin: "-80px 0px" });

  const featRef = useRef<HTMLDivElement>(null);
  const featInView = useInView(featRef, { once: true, margin: "-40px 0px" });

  return (
    <section className="bg-black py-20 md:py-32 px-6 md:px-12 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* ── Section Header ─────────────────────────────────── */}
        <motion.div
          ref={sectionRef}
          className="mb-14 md:mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="flex flex-col items-center text-center lg:items-end lg:justify-between lg:flex-row lg:text-left gap-8">
            <div className="flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-neutral-900/50 backdrop-blur-sm mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                <span className="text-[13px] font-medium text-white tracking-wide">
                  AI-First Approach
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.15] text-center lg:text-left">
                Meet Kaya, your AI PM. <br className="hidden md:block" />
                <span className="text-neutral-400">
                  Never sleeps, never misses.
                </span>
              </h2>
            </div>
            <p className="text-neutral-400 text-sm sm:text-base md:text-lg max-w-md leading-relaxed text-center lg:text-right">
              An intelligent PM agent that lives inside your workspace —
              managing deadlines, balancing workloads, connecting 20+ tools, and
              automating tasks across your team.
            </p>
          </div>
        </motion.div>

        {/* ── Kaya Showcase Unified Box ─────────────────────── */}
        <motion.div
          ref={kayaRef}
          initial={{ opacity: 0, y: 60 }}
          animate={kayaInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-2xl border border-white/[0.08] bg-[#121316]/90 overflow-hidden group shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:border-white/[0.15] transition-all duration-300 divide-y divide-white/[0.08]"
        >
          {/* ─ Part 1: Text Left, Image Right (Teamspace) ─ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Card info (left on lg, top on mobile) */}
            <div className="relative z-10 p-6 md:p-10 lg:col-span-5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-5">
                <img src="/kaya.svg" alt="Kaya" width={36} height={36} />

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-lg">Kaya</h3>
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    Your intelligent project manager
                  </p>
                </div>
              </div>

              <h4 className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-3">
                The PM that actually gives a damn about your project.
              </h4>

              <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-6">
                From managing deadlines to team workload to guiding what to
                prioritize today — Kaya lives inside your teamspace, talking
                directly with your team and orchestrating daily progress.
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-neutral-300">
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  Live in Teamspace
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  Automate Task Creations
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  20+ Integrations
                </span>
              </div>
            </div>

            {/* Image (right on lg, bottom on mobile) */}
            <div className="relative z-10 lg:col-span-7 h-[300px] sm:h-[420px] lg:h-[460px] overflow-hidden">
              <div
                className="relative w-full h-full border-t lg:border-t-0 lg:border-l border-white/[0.08] overflow-hidden"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 70%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 70%, transparent 100%)",
                }}
              >
                <Image
                  src="/kaya-team.png"
                  alt="Kaya AI PM Agent managing team in WeKraft teamspace"
                  fill
                  priority
                  className="object-cover object-top scale-110 lg:scale-115 origin-top transition-transform duration-500 group-hover:scale-120"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            </div>
          </div>

          {/* ─ Part 2: Image Left, Text Right (Tasks & MCP) ─ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-center">
            {/* Image (left on lg, bottom on mobile) */}
            <div className="relative z-10 lg:col-span-7 h-[300px] sm:h-[420px] lg:h-[460px] overflow-hidden order-2 lg:order-1">
              <div
                className="relative w-full h-full border-t lg:border-t-0 lg:border-r border-white/[0.08] overflow-hidden"
                style={{
                  maskImage:
                    "linear-gradient(to bottom, black 70%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, black 70%, transparent 100%)",
                }}
              >
                <Image
                  src="/kaya-2.png"
                  alt="Kaya Autonomous Task Analysis & Workload Management"
                  fill
                  className="object-cover object-top scale-105 lg:scale-110 origin-top transition-transform duration-500 group-hover:scale-115"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            </div>

            {/* Card info (right on lg, top on mobile) */}
            <div className="relative z-10 p-6 md:p-10 lg:col-span-5 flex flex-col justify-center order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-5">
                <img src="/kaya.svg" alt="Kaya" width={36} height={36} />

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-lg">Kaya</h3>
                  </div>
                  <p className="text-neutral-500 text-xs mt-0.5">
                    Autonomous task analysis & workload breakdown
                  </p>
                </div>
              </div>

              <h4 className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-3">
                Real-time task tracking and intelligent execution.
              </h4>

              <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-6">
                Kaya analyzes overdue work, tracks member assignments, and calls
                internal analyst agents to synthesize task summaries — all
                connected directly to your tools via MCP.
              </p>

              <div className="flex flex-wrap gap-2 text-xs text-neutral-300">
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  Multi-Agent Execution
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  Workload Analysis
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  MCP Tools
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Feature Boxes ──────────────────────────────────── */}
        <motion.div
          ref={featRef}
          initial={{ opacity: 0, y: 30 }}
          animate={featInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{
            duration: 0.7,
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.1,
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6"
        >
          {agentFeatures.map((feat, i) => (
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
    </section>
  );
};

export default AIFirstSection;
