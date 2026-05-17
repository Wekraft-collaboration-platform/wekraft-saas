"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Minus, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  { name: "AI PM Agent (native)", wekraft: "check", asana: "x", jira: "x", linear: "x", clickup: "x", monday: "x", atlassian: "x" },
  { name: "VS Code Extension", wekraft: "check", asana: "x", jira: "x", linear: "x", clickup: "x", monday: "x", atlassian: "x" },
  { name: "GitHub bi-directional sync", wekraft: "check", asana: "minus", jira: "check", linear: "check", clickup: "minus", monday: "minus", atlassian: "check" },
  { name: "Auto sprint tracking", wekraft: "check", asana: "minus", jira: "check", linear: "check", clickup: "minus", monday: "minus", atlassian: "check" },
  { name: "Automatic time tracking", wekraft: "check", asana: "x", jira: "minus", linear: "x", clickup: "minus", monday: "x", atlassian: "minus" },
  { name: "Heatmap / burnout detection", wekraft: "check", asana: "x", jira: "x", linear: "x", clickup: "x", monday: "x", atlassian: "x" },
  { name: "AI sprint reports", wekraft: "check", asana: "x", jira: "x", linear: "x", clickup: "x", monday: "x", atlassian: "x" },
  { name: "Built-in developer analytics", wekraft: "check", asana: "x", jira: "minus", linear: "check", clickup: "minus", monday: "x", atlassian: "minus" },
  { name: "Flat / team-based pricing", wekraft: "check", asana: "x", jira: "x", linear: "x", clickup: "x", monday: "x", atlassian: "x" },

  { name: "< 5 min onboarding", wekraft: "check", asana: "minus", jira: "x", linear: "check", clickup: "minus", monday: "minus", atlassian: "x" },
];

const competitors = ["WeKraft", "Asana", "Jira", "Linear", "ClickUp", "Monday", "Atlassian"];
const keys = ["wekraft", "asana", "jira", "linear", "clickup", "monday", "atlassian"] as const;

type FeatureKey = typeof keys[number];

function renderIcon(status: string, isWekraft = false) {
  if (status === "check") {
    return (
      <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto ${isWekraft ? "bg-blue-500/20 border border-blue-500/30" : "bg-white/5 border border-white/10"}`}>
        <Check className={`w-3.5 h-3.5 ${isWekraft ? "text-blue-400" : "text-white/40"}`} />
      </div>
    );
  }
  if (status === "minus") {
    return <Minus className="w-4 h-4 text-white/20 mx-auto" />;
  }
  return <X className="w-3.5 h-3.5 text-white/10 mx-auto" />;
}

// Score: check=2, minus=1, x=0
function getScore(key: FeatureKey) {
  return features.reduce((sum, f) => {
    const v = f[key];
    return sum + (v === "check" ? 2 : v === "minus" ? 1 : 0);
  }, 0);
}

const maxScore = features.length * 2;

const Comparison = () => {
  const [showAll, setShowAll] = useState(false);
  const visibleFeatures = showAll ? features : features.slice(0, 7);

  return (
    <div className="w-full font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <p className="text-xs font-mono text-white/30 uppercase tracking-widest mb-4">
          Side-by-side comparison
        </p>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.1] text-white mb-4">
          See how we stack up
          <br />
          <span className="text-neutral-500">against the alternatives.</span>
        </h2>
        <p className="text-neutral-400 text-base max-w-3xl leading-relaxed">
          Jira is powerful but bloated. Asana is too generic for developers. Linear is fast but rigid. We built WeKraft to give software engineering teams the <strong className="text-white font-medium">blazing speed</strong> they crave, with the <strong className="text-white font-medium">AI-driven depth</strong> they actually need.
        </p>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-8">
        {keys.map((key, i) => {
          const score = getScore(key);
          const pct = Math.round((score / maxScore) * 100);
          const isWe = key === "wekraft";
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={cn(
                "rounded-2xl p-4 text-center border transition-all duration-300 relative overflow-hidden group",
                isWe 
                  ? "bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.15)]" 
                  : "bg-white/[0.02] hover:bg-white/[0.04] border-white/10"
              )}
            >
              {isWe && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              <p className={cn("text-xs font-semibold mb-2 relative z-10", isWe ? "text-blue-300" : "text-white/50")}>
                {competitors[i]}
              </p>
              <p className={cn("text-3xl font-bold tracking-tight relative z-10", isWe ? "text-white drop-shadow-md" : "text-white/40")}>
                {pct}%
              </p>
              <p className="text-[10px] uppercase tracking-wider font-mono text-white/30 mt-2 relative z-10">match</p>
            </motion.div>
          );
        })}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[760px]">
          {/* Header row */}
          <div className="grid grid-cols-8 gap-2 pb-4 mb-2 border-b border-white/8">
            <div className="col-span-2 text-[10px] font-mono text-white/25 uppercase tracking-wider pl-2">
              Feature
            </div>
            {competitors.map((c, i) => (
              <div key={c} className={`text-center text-xs font-semibold ${i === 0 ? "text-blue-400" : "text-white/30"}`}>
                {c}
              </div>
            ))}
          </div>

          {/* Feature rows */}
          <div className="space-y-1">
            {visibleFeatures.map((feature, idx) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="grid grid-cols-8 gap-2 items-center py-3 px-2 rounded-xl hover:bg-white/[0.02] transition-colors group"
              >
                <div className="col-span-2 text-white/70 text-sm group-hover:text-white transition-colors">
                  {feature.name}
                </div>
                {keys.map((key) => (
                  <div key={key} className="flex items-center justify-center">
                    {renderIcon(feature[key], key === "wekraft")}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Show more */}
          {!showAll && (
            <div className="relative mt-2">
              <div className="absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
              <button
                onClick={() => setShowAll(true)}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm text-white/40 hover:text-white/70 transition-colors border border-white/8 rounded-xl hover:bg-white/[0.02]"
              >
                Show all {features.length} features
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/8 text-xs text-white/25">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-blue-400" /> Native / included
            </div>
            <div className="flex items-center gap-2">
              <Minus className="w-3.5 h-3.5 text-white/25" /> Partial / plugin needed
            </div>
            <div className="flex items-center gap-2">
              <X className="w-3.5 h-3.5 text-white/25" /> Not available
            </div>
            <span className="ml-auto">*Based on default out-of-the-box capabilities, no add-ons.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comparison;
