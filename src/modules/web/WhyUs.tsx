"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar, GitBranch, Layers, Zap } from "lucide-react";
import React from "react";

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
    image: "/",
  },
  {
    tag: "Codebase Integration",
    Icon: GitBranch,
    title: "Link your codebase.",
    description:
      "Link your codebase directly with tasks to track. Connect repositories to sync progress, commits, and PRs automatically.",
    cta: "Connect repository",
    image: "/",
  },
  {
    tag: "Deadline Tracking",
    Icon: Calendar,
    title: "Never miss a milestone.",
    description:
      "Smart deadline alerts, progress tracking, and sprint reports ensure your projects land on time, every time.",
    cta: "Track your projects",
    image: "/",
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-sm text-blue-100 tracking-wide">
              Why teams choose Wekraft
            </span>
          </div>
          <h2 className="text-5xl font-semibold tracking-tight leading-tight max-w-2xl mx-auto mb-6">
            <span className="text-white">The Unfair</span>{" "}
            <span className="text-neutral-400">Advantage.</span>
          </h2>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto leading-relaxed">
            Three core pillars that separate Wekraft from every other PM tool on
            the market.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {cards.map(({ tag, Icon, title, description, cta, image }, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="group relative flex flex-col rounded-xl bg-linear-to-b from-black to-neutral-900 border border-white/10 overflow-hidden transition-all duration-500 hover:-translate-y-1"
            >
              {/* Visual Area */}
              <div className="p-0 h-48 border-b border-white/5 relative overflow-hidden bg-neutral-900 flex items-center justify-center">
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
                  <div className="w-8 h-8 rounded-lg bg-neutral-800/40 border border-white/10 flex items-center justify-center transition-colors duration-300 group-hover:bg-neutral-800/80">
                    <Icon className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[11px] font-medium text-neutral-400 group-hover:text-neutral-300 uppercase tracking-widest transition-colors">
                    {tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-white">
                  {title}
                </h3>

                {/* Description */}
                <p className="text-sm text-neutral-400 leading-relaxed flex-1">
                  {description}
                </p>

                {/* CTA */}
                <div className="flex items-center gap-1.5 text-sm font-medium text-neutral-400 group-hover:text-white group/cta cursor-pointer mt-auto transition-colors duration-300">
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
