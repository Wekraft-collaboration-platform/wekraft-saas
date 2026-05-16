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
  },
  {
    tag: "Speed & Productivity",
    Icon: Zap,
    title: "Ship faster. Burn less.",
    description:
      "Automated workflows, AI-driven prioritization, and real-time syncs keep your team moving at peak velocity.",
    cta: "See performance gains",
  },
  {
    tag: "Deadline Tracking",
    Icon: Calendar,
    title: "Never miss a milestone.",
    description:
      "Smart deadline alerts, progress tracking, and sprint reports ensure your projects land on time, every time.",
    cta: "Track your projects",
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
          {cards.map(({ tag, Icon, title, description, cta }, i) => (
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
              <div className="p-5 h-56 border-b border-white/5">
             
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
