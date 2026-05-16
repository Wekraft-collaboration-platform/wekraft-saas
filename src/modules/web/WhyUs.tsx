"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

const painPoints = [
  { competitor: "Jira", pain: "Takes 3 days to onboard a dev. Needs a dedicated admin to manage workflows. Built for enterprise org charts, not engineering teams." },
  { competitor: "Asana", pain: "Designed for marketing and ops. No native sprint tracking, no developer tooling. You'll still need Jira running alongside it." },
  { competitor: "ClickUp", pain: "Everything and nothing. Feature overload with poor defaults. Teams stop using it within a month." },
  { competitor: "Monday", pain: "Beautiful spreadsheets that don't understand code. Zero GitHub sync, no velocity tracking, no dev tooling whatsoever." },
  { competitor: "Linear", pain: "Great design, no intelligence. No AI agent, no IDE integration, no auto time tracking. A well-designed manual process." },
  { competitor: "Atlassian", pain: "Enterprise pricing for problems that shouldn't need enterprise solutions. Still needs plugins for things that should be built-in." },
];

const pillars = [
  {
    title: "Kaya, your AI project manager",
    description: "Kaya predicts sprint delays, auto-reassigns blocked tasks, and generates retrospectives — without anyone asking her to. She works while your team sleeps.",
  },
  {
    title: "Your workspace inside VS Code",
    description: "Tasks, issues, PR statuses, and deadlines — all inside your editor. No tab switching. No context loss. Developers stay in flow, managers stay informed.",
  },
  {
    title: "GitHub sync that goes both ways",
    description: "Close a PR and the task moves to Done. Open an issue and it lands in your sprint. No webhooks to configure, no plugins to install. It just works.",
  },
  {
    title: "Velocity and burnout analytics",
    description: "AI heatmaps show who is overloaded before they are. Sprint velocity is always visible. Retrospectives are written for you. No manual reporting ever.",
  },
  {
    title: "Time tracking from IDE activity",
    description: "Your editor activity becomes your timesheet automatically. No timers, no forms. Ready to export for billing, payroll, or sprint estimation.",
  },
  {
    title: "One price, everything included",
    description: "No feature tiers. No seat minimums. No 'contact sales' walls. Everything your team needs at a price that doesn't change as you grow.",
  },
];

const features = [
  { name: "AI PM Agent", wekraft: true, asana: false, jira: false, linear: false, clickup: false, monday: false, atlassian: false },
  { name: "VS Code Extension", wekraft: true, asana: false, jira: false, linear: false, clickup: false, monday: false, atlassian: false },
  { name: "GitHub Sync", wekraft: true, asana: null, jira: true, linear: true, clickup: null, monday: false, atlassian: true },
  { name: "Sprint Tracking", wekraft: true, asana: null, jira: true, linear: true, clickup: null, monday: null, atlassian: true },
  { name: "Auto Time Tracking", wekraft: true, asana: false, jira: null, linear: false, clickup: null, monday: false, atlassian: null },
  { name: "Burnout Detection", wekraft: true, asana: false, jira: false, linear: false, clickup: false, monday: false, atlassian: false },
  { name: "AI Sprint Reports", wekraft: true, asana: false, jira: false, linear: false, clickup: false, monday: false, atlassian: false },
  { name: "Developer Analytics", wekraft: true, asana: false, jira: null, linear: true, clickup: null, monday: false, atlassian: null },
  { name: "Flat Pricing", wekraft: true, asana: false, jira: false, linear: false, clickup: false, monday: false, atlassian: false },
  { name: "Setup < 5 minutes", wekraft: true, asana: null, jira: false, linear: true, clickup: null, monday: null, atlassian: false },
];

const cols = [
  { key: "wekraft", label: "Wekraft" },
  { key: "asana", label: "Asana" },
  { key: "jira", label: "Jira" },
  { key: "linear", label: "Linear" },
  { key: "clickup", label: "ClickUp" },
  { key: "monday", label: "Monday" },
  { key: "atlassian", label: "Atlassian" },
] as const;

type ColKey = (typeof cols)[number]["key"];

function Cell({ val, isWe }: { val: boolean | null; isWe?: boolean }) {
  if (val === true) return <Check className={`w-4 h-4 mx-auto ${isWe ? "text-white" : "text-white/30"}`} strokeWidth={2.5} />;
  if (val === null) return <Minus className="w-4 h-4 mx-auto text-white/15" />;
  return <X className="w-3.5 h-3.5 mx-auto text-white/10" />;
}

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

export default function WhyUs() {
  return (
    <div className="w-full font-sans space-y-28">

      {/* ── Problem ─────────────────────────────── */}
      <div>
        <motion.div {...fade()} className="mb-12">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-5 font-medium">The problem</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 mb-4">
            Every PM tool was built for someone else.
          </h2>
          <p className="text-neutral-400 text-base max-w-lg leading-relaxed">
            Not for the engineer writing code at 11pm. Not for the team lead running standups without a dedicated PM. We know — we were those people.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {painPoints.map((item, i) => (
            <motion.div
              key={item.competitor}
              {...fade(i * 0.06)}
              className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-[#0A0A0A] p-6 hover:border-white/[0.1] hover:bg-[#0F0F0F] transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-white/50 text-[11px] font-mono uppercase tracking-widest mb-3 group-hover:text-white/70 transition-colors">{item.competitor}</p>
              <p className="text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors">{item.pain}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Pillars ──────────────────────────────── */}
      <div>
        <motion.div {...fade()} className="mb-12">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-5 font-medium">What we do differently</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 mb-4">
            Fewer tools. More shipping.
          </h2>
          <p className="text-neutral-400 text-base max-w-lg leading-relaxed">
            Six things that make a measurable difference to how your team works, starting from day one.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              {...fade(i * 0.06)}
              className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-[#0A0A0A] p-7 hover:border-white/[0.1] hover:bg-[#0F0F0F] transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <p className="text-white/30 text-[10px] font-mono mb-4 group-hover:text-white/50 transition-colors">0{i + 1}</p>
              <h3 className="text-white font-medium text-base mb-2 group-hover:text-white/90 transition-colors">{p.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed group-hover:text-neutral-300 transition-colors">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Comparison ───────────────────────────── */}
      <div>
        <motion.div {...fade()} className="mb-12">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-5 font-medium">Side by side</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 mb-4">
            How we compare.
          </h2>
          <p className="text-neutral-400 text-base max-w-lg leading-relaxed">
            Out-of-the-box, without plugins or add-ons.
          </p>
        </motion.div>

        <motion.div {...fade(0.1)} className="overflow-x-auto rounded-xl border border-white/[0.05] bg-[#0A0A0A] p-6">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left text-[11px] text-white/40 font-medium pb-4 pr-6 w-[180px] uppercase tracking-wider">Feature</th>
                {cols.map((c) => (
                  <th
                    key={c.key}
                    className={`text-center text-[11px] font-semibold pb-4 px-3 uppercase tracking-wider ${c.key === "wekraft" ? "text-white" : "text-white/40 font-medium"}`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr
                  key={f.name}
                  className={`border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors ${i === features.length - 1 ? "border-0" : ""}`}
                >
                  <td className="text-white/70 text-sm py-4 pr-6 font-medium">{f.name}</td>
                  {cols.map((c) => (
                    <td key={c.key} className="py-4 px-3 text-center">
                      <Cell val={f[c.key] as boolean | null} isWe={c.key === "wekraft"} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center gap-5 mt-5 text-[11px] text-white/30">
            <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-white/50" /> Native</span>
            <span className="flex items-center gap-1.5"><Minus className="w-3 h-3 text-white/30" /> Partial / plugin</span>
            <span className="flex items-center gap-1.5"><X className="w-3 h-3 text-white/20" /> Not available</span>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
