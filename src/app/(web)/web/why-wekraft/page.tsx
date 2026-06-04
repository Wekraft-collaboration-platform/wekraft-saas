import React from "react";
import { Metadata } from "next";
import Navbar from "@/modules/web/Navbar";
import Link from "next/link";
import { Compass, Briefcase, CheckCircle2, FileText, ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Why WeKraft | Compare Project Management Platforms",
  description: "See how Wekraft stacks up against Jira, Linear, Asana, Notion, and Plane. Discover the AI-first engineering workspace.",
};

const competitors = [
  {
    name: "Linear",
    href: "/web/wekraft-vs-linear",
    icon: <img src="/linear.png" alt="Linear" className="w-5 h-5 object-contain" />,
    tagline: "Speed meets collaboration",
    description: "Leave behind isolated issue tracking. Wekraft delivers lightning-fast performance while integrating native AI agents, video rooms, and deep memory layers directly into your workflow.",
  },
  {
    name: "Jira",
    href: "/web/wekraft-vs-jira",
    icon: <img src="/jira-logo.jpg" alt="Jira" className="w-5 h-5 object-contain rounded-sm" />,
    tagline: "Unbloat your engineering boards",
    description: "Escape endless configuration and sluggish boards. Wekraft provides a blazing-fast, zero-setup environment that keeps your engineering team focused on shipping, not managing tickets.",
  },
  {
    name: "Asana",
    href: "/web/wekraft-vs-asana",
    icon: <img src="/asana-logo.svg" alt="Asana" className="w-5 h-5 object-contain" />,
    tagline: "Built for builders, not theater",
    description: "Stop paying for fragmented tools. Wekraft combines your task management, documentation, and team collaboration into one unified platform built specifically for developers.",
  },
  {
    name: "Notion",
    href: "/web/wekraft-vs-notion",
    icon: <img src="/Notion-logo.png" alt="Notion" className="w-5 h-5 object-contain" />,
    tagline: "Sprints connected to docs",
    description: "Move beyond disconnected wikis. Wekraft natively connects your documentation to your codebase and branch commits, ensuring your knowledge base is always in sync with your product.",
  },
  {
    name: "Plane",
    href: "/web/wekraft-vs-plane",
    icon: <img src="/plane-so logo.png" alt="Plane" className="w-5 h-5 object-contain" />,
    tagline: "AI-first developer workspace",
    description: "Upgrade to an AI-native workspace. While others just copy basic UI, Wekraft deeply integrates your projects with VS Code, autonomous coding agents, and your actual codebase.",
  },
];

export default function WhyWekraftPage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] max-w-7xl bg-gradient-to-b from-blue-500/5 via-transparent to-transparent blur-[120px] pointer-events-none" />

      <main className="flex flex-col items-center pt-36 pb-24 px-4 md:px-8 max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-neutral-300 border border-white/10 bg-white/[0.03] rounded-full px-3.5 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Product Comparison
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white font-pop">
            Discover why teams switch to Wekraft
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-normal">
            See how Wekraft stacks up against the tools you know. Click any card to read the complete feature comparisons and migration paths.
          </p>
        </div>

        {/* Competitor Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mb-16">
          {competitors.map((comp) => (
            <Link
              key={comp.name}
              href={comp.href}
              className="group relative border border-white/[0.08] bg-neutral-950/40 hover:bg-neutral-900/40 p-6 rounded-2xl transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.5)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white">
                      {comp.icon}
                    </div>
                    <span className="text-sm font-bold text-white">{comp.name}</span>
                  </div>
                  <span className="text-neutral-500 group-hover:text-white transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="text-xs font-semibold text-blue-400/80 mb-2 font-mono uppercase tracking-wider">
                  {comp.tagline}
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed font-normal mb-6">
                  {comp.description}
                </p>
              </div>

              <div className="text-[11px] font-semibold text-white group-hover:text-blue-400 flex items-center gap-1.5 transition-colors">
                Wekraft vs {comp.name} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>



      </main>
    </div>
  );
}
