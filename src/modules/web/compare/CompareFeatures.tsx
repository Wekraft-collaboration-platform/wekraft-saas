"use client";

import React from "react";
import { Bot, Terminal, Code, Video, BarChart3, Database } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const wekraftFeatures: FeatureCard[] = [
  {
    icon: <Bot className="w-5 h-5 text-neutral-400 transition-colors group-hover:text-white" />,
    title: "Kaya PM Agent (AI PM)",
    description: "Kaya is your built-in Product Manager. She analyzes sprint history, identifies bottlenecks, drafts specifications, and auto-assigns items with precise severity tracking.",
  },
  {
    icon: <Terminal className="w-5 h-5 text-neutral-400 transition-colors group-hover:text-white" />,
    title: "Harry Dev Agent (AI Dev)",
    description: "An autonomous developer agent in your workspace. Assign tasks to Harry directly inside Wekraft, and watch him analyze codebases, run tests, and open PRs.",
  },
  {
    icon: <Code className="w-5 h-5 text-neutral-400 transition-colors group-hover:text-white" />,
    title: "VS Code Handshake Sync",
    description: "Updates tasks in real-time as you code. Complete a checkmark in your IDE, and Wekraft synchronizes issue logs, estimate changes, and task statuses instantly.",
  },
  {
    icon: <Video className="w-5 h-5 text-neutral-400 transition-colors group-hover:text-white" />,
    title: "Team Meet (Video Rooms)",
    description: "No more external link scheduling. Wekraft's built-in video rooms let engineers jump on quick voice/video calls directly from the issue cards or sprint boards.",
  },
  {
    icon: <BarChart3 className="w-5 h-5 text-neutral-400 transition-colors group-hover:text-white" />,
    title: "Codebase & Commit Heatmaps",
    description: "Get visual indicators of codebase stress. Spot buggy modules, commit spikes, and untested directories automatically from your connected repositories.",
  },
  {
    icon: <Database className="w-5 h-5 text-neutral-400 transition-colors group-hover:text-white" />,
    title: "Long-Term Memory Layer",
    description: "Unlike generic chat assistants, Wekraft's memory layer persists context across sprints, storing architecture decisions, team roles, and coding patterns.",
  },
];

export default function CompareFeatures() {
  return (
    <div className="w-full py-16 relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
          An Engineering Workspace Reimagined
        </h2>
        <p className="text-neutral-400 text-sm max-w-[600px] mx-auto">
          Wekraft is not just a digital board. It is an AI-first collaborative workspace designed from the ground up for software shipping.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {wekraftFeatures.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="group relative border border-white/5 bg-neutral-950 hover:bg-neutral-900 p-6 rounded-2xl transition-all duration-300 shadow-xl text-left"
          >
            {/* Minimal highlight on hover */}
            <div className="absolute inset-0 rounded-2xl bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.02] border border-white/5 mb-4 group-hover:border-white/20 transition-all duration-300">
              {feature.icon}
            </div>

            <h3 className="text-base font-medium text-neutral-300 mb-2 group-hover:text-white transition-colors duration-300">
              {feature.title}
            </h3>

            <p className="text-xs text-neutral-500 leading-relaxed font-normal group-hover:text-neutral-400 transition-colors duration-300">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
