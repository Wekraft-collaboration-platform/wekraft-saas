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
    image: "/workspace.png",
  },
  {
    tag: "Speed & Productivity",
    Icon: Zap,
    title: "Ship faster. Burn less.",
    description:
      "Automated workflows, AI-driven prioritization, and real-time syncs keep your team moving at peak velocity.",
    cta: "See performance gains",
    image: "/kaya .png",
  },
  {
    tag: "Deadline Tracking",
    Icon: Calendar,
    title: "Never miss a milestone.",
    description:
      "Smart deadline alerts, progress tracking, and sprint reports ensure your projects land on time, every time.",
    cta: "Track your projects",
    image: "/deadline.png",
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 backdrop-blur-md bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
            <span className="text-sm font-semibold text-blue-300 tracking-wide">
              Why teams choose Wekraft
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight max-w-2xl mx-auto mb-6">
            <span className="text-white">The unfair</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-600">advantage.</span>
          </h2>
          <p className="text-neutral-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            Three core pillars that separate Wekraft from every other PM tool on the market.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cards.map(({ tag, Icon, title, description, cta, image }, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="group relative flex flex-col rounded-3xl bg-neutral-900/40 border border-white/10 overflow-hidden hover:bg-neutral-900/80 transition-all duration-500 hover:shadow-[0_8px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1"
            >
              {/* Top gradient line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Corner glow on hover */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-150" />

              {/* Visual Area */}
              <div className="p-0 h-56 border-b border-white/5 relative overflow-hidden bg-neutral-950/50 flex items-center justify-center">
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                />
              </div>

              {/* Content Area */}
              <div className="flex flex-col flex-1 p-6 gap-4">
                {/* Tag */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-shadow duration-500">
                    <Icon className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </div>
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                    {tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white/90 group-hover:text-white leading-snug transition-colors duration-300">
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