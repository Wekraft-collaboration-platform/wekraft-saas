"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Clock,
  CheckCircle,
  ArrowRight,
  BarChart2,
  Layers,
  Target,
  Calendar,
  TrendingUp,
  Activity,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Card 1 visual – Simplicity UI mock
───────────────────────────────────────────── */
const SimplicityVisual = () => (
  <div className="relative w-full h-44 flex items-center justify-center">
    {/* Center glow */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-24 h-24 rounded-full bg-blue-500/10 blur-2xl" />
    </div>

    {/* Center hub */}
    <div className="relative z-10 w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
      <Layers className="w-7 h-7 text-blue-400" />
    </div>

    {/* Orbiting feature chips */}
    {[
      { label: "Tasks", Icon: CheckCircle, x: -110, y: -30 },
      { label: "Sprints", Icon: Activity, x: 90, y: -30 },
      { label: "Docs", Icon: Layers, x: -90, y: 48 },
      { label: "Goals", Icon: Target, x: 80, y: 50 },
    ].map(({ label, Icon, x, y }) => (
      <motion.div
        key={label}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 * Math.random() * 4, duration: 0.5 }}
        className="absolute z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800 border border-white/10 text-xs text-white font-medium shadow-lg"
        style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: "translate(-50%,-50%)" }}
      >
        <Icon className="w-3 h-3 text-blue-400" />
        {label}
      </motion.div>
    ))}

    {/* Connecting lines (SVG) */}
    <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 5 }}>
      {[
        { x1: "50%", y1: "50%", x2: "17%", y2: "34%" },
        { x1: "50%", y1: "50%", x2: "78%", y2: "34%" },
        { x1: "50%", y1: "50%", x2: "22%", y2: "68%" },
        { x1: "50%", y1: "50%", x2: "75%", y2: "68%" },
      ].map((line, i) => (
        <line key={i} {...line} stroke="rgba(59,130,246,0.15)" strokeWidth="1" strokeDasharray="4 4" />
      ))}
    </svg>
  </div>
);

/* ─────────────────────────────────────────────
   Card 2 visual – Speed metrics
───────────────────────────────────────────── */
const SpeedVisual = () => {
  const bars = [40, 65, 50, 80, 60, 90, 72];
  return (
    <div className="relative w-full h-44 flex flex-col justify-end px-4 pt-4 overflow-hidden">
      <div className="absolute top-2 right-4 flex items-center gap-1.5 text-xs text-green-400 font-medium">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>+38% velocity</span>
      </div>

      {/* Grid lines */}
      <div className="absolute inset-x-4 inset-y-6 flex flex-col justify-between pointer-events-none">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-full h-px bg-white/5" />
        ))}
      </div>

      {/* Bars */}
      <div className="relative z-10 flex items-end gap-2 h-28 pb-1">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ background: i === bars.length - 1 ? "rgba(59,130,246,0.8)" : "rgba(255,255,255,0.08)" }}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.06, duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* X-axis */}
      <div className="flex gap-2 mt-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="flex-1 text-center text-[9px] text-neutral-600">{d}</div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Card 3 visual – Deadline tracker mock
───────────────────────────────────────────── */
const DeadlineVisual = () => {
  const items = [
    { label: "Project Setup", time: "0:00", done: true },
    { label: "Design Review", time: "2:30", done: true },
    { label: "Sprint Planning", time: "4:40", done: false, active: true },
    { label: "Launch QA", time: "6:00", done: false },
  ];

  return (
    <div className="relative w-full h-44 flex flex-col gap-2 px-2 pt-3 overflow-hidden">
      {/* Glow top-right */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 blur-2xl rounded-full" />

      {items.map(({ label, time, done, active }) => (
        <div
          key={label}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all ${
            active
              ? "border-blue-500/40 bg-blue-500/10 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
              : "border-white/5 bg-white/[0.03]"
          }`}
        >
          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 border ${
            done ? "border-blue-500 bg-blue-500/20" : active ? "border-blue-400" : "border-white/20"
          }`}>
            {done && <CheckCircle className="w-3 h-3 text-blue-400" />}
          </div>
          <span className={`text-xs flex-1 font-medium ${active ? "text-white" : done ? "text-neutral-500 line-through" : "text-neutral-400"}`}>
            {label}
          </span>
          <div className="flex items-center gap-1">
            <Clock className={`w-3 h-3 ${active ? "text-blue-400" : "text-neutral-600"}`} />
            <span className={`text-[10px] font-mono ${active ? "text-blue-400" : "text-neutral-600"}`}>{time}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main cards data
───────────────────────────────────────────── */
const cards = [
  {
    tag: "Simplicity",
    Icon: Layers,
    title: "One workspace. Zero chaos.",
    description:
      "Everything your team needs in one clean interface. No bloat, no learning curve — just clarity from day one.",
    cta: "Explore the workspace",
    Visual: SimplicityVisual,
  },
  {
    tag: "Speed & Productivity",
    Icon: Zap,
    title: "Ship faster. Burn less.",
    description:
      "Automated workflows, AI-driven prioritization, and real-time syncs keep your team moving at peak velocity.",
    cta: "See performance gains",
    Visual: SpeedVisual,
  },
  {
    tag: "Deadline Tracking",
    Icon: Calendar,
    title: "Never miss a milestone.",
    description:
      "Smart deadline alerts, progress tracking, and sprint reports ensure your projects land on time, every time.",
    cta: "Track your projects",
    Visual: DeadlineVisual,
  },
];

/* ─────────────────────────────────────────────
   WhyUs Component
───────────────────────────────────────────── */
const WhyUs = () => {
  return (
    <section
      id="why-us"
      className="bg-black py-24 px-6 md:px-12 font-sans text-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-sm font-medium text-blue-400 ">
              Why teams choose Wekraft
            </span>
          </div>
          <h2 className="text-5xl font-bold tracking-tight leading-[1.1] max-w-2xl mx-auto mb-4">
            <span className="text-white">The unfair</span>{" "}
            <span className="text-neutral-500">advantage.</span>
          </h2>
          <p className="text-neutral-400 text-base max-w-xl mx-auto">
            Three core pillars that separate Wekraft from every other PM tool on the market.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map(({ tag, Icon, title, description, cta, Visual }, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="group relative flex flex-col rounded-2xl bg-neutral-900 border border-white/8 overflow-hidden hover:border-white/15 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
            >
              {/* Top gradient line */}
              <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Corner glow on hover */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Visual Area */}
              <div className="p-5 border-b border-white/5">
                <Visual />
              </div>

              {/* Content Area */}
              <div className="flex flex-col flex-1 p-6 gap-4">
                {/* Tag */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
                    {tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white leading-snug">
                  {title}
                </h3>

                {/* Description */}
                <p className="text-sm text-neutral-400 leading-relaxed flex-1">
                  {description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-sm font-medium text-blue-500 group/cta cursor-pointer mt-auto">
                  <span className="group-hover/cta:underline">{cta}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/cta:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUs;
