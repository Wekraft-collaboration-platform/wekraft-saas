import React from "react";
import { Metadata } from "next";
import Navbar from "@/modules/web/Navbar";
import CompareHero from "@/modules/web/compare/CompareHero";
import CompareTable, { ComparisonFeature } from "@/modules/web/compare/CompareTable";
import CompareFeatures from "@/modules/web/compare/CompareFeatures";

import CompareFAQ, { FAQItem } from "@/modules/web/compare/CompareFAQ";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Wekraft vs Asana | Built for Software Teams",
  description: "Asana is good for general task templates, but lacks developer workflows. Compare Asana with Wekraft's VS Code sync, unified docs, and AI PM agents.",
};

const asanaFeatures: ComparisonFeature[] = [
  {
    name: "Unified Code & Sprints",
    category: "DEVELOPER ECOSYSTEM",
    wekraftStatus: "check",
    wekraftDetail: "Bi-directional Git syncing and IDE workspace bindings match code commits to tasks.",
    competitorStatus: "x",
    competitorDetail: "Must paste github commit URLs manually; no native codebase connection.",
  },
  {
    name: "Built-In Workspace Docs",
    category: "PROJECT MANAGEMENT",
    wekraftStatus: "check",
    wekraftDetail: "Integrated markdown docs and Wikis reside right alongside tasks and sprint boards.",
    competitorStatus: "x",
    competitorDetail: "Lacks dedicated document hubs, forcing reliance on external note editors.",
  },
  {
    name: "Kaya PM & Harry Dev AI",
    category: "AI COLLABORATION",
    wekraftStatus: "check",
    wekraftDetail: "Autonomous agents write requirements, triage tickets, and edit source code.",
    competitorStatus: "limited",
    competitorDetail: "Asana intelligence writes summaries but cannot touch files or configure workspaces.",
  },
  {
    name: "Milestone calendars & heatmaps",
    category: "CALENDARS & VISIBILITY",
    wekraftStatus: "check",
    wekraftDetail: "Commit calendars and codebase heatmaps flag stress points automatically.",
    competitorStatus: "limited",
    competitorDetail: "Basic Gantt and calendar views without code repository metrics.",
  },
  {
    name: "Integrated Video Meetings",
    category: "COLLABORATIVE SUITE",
    wekraftStatus: "check",
    wekraftDetail: "Launch Team Meet video rooms directly from tasks, keeping discussion contextual.",
    competitorStatus: "x",
    competitorDetail: "No native video support; relies on calendar integrations.",
  },
];

const asanaFaqs: FAQItem[] = [
  {
    question: "Why is Wekraft better for engineering teams than Asana?",
    answer: "Asana is built for general task coordination across marketing, ops, and HR, which means it lacks specialized developer features. Wekraft is designed exclusively for software shipping. It provides VS Code handshake integrations, Git linkage, commit activity heatmaps, and native AI PM/Dev agents that automate ticketing and code editing.",
  },
  {
    question: "Can we import our projects and task dependencies from Asana?",
    answer: "Yes, Wekraft has an Asana Importer. Simply upload your Asana project JSON/CSV export, and our importer maps your task boards, cycles, milestones, dependencies, assignees, and descriptions automatically.",
  },
  {
    question: "Is there a free tier for small teams starting with Wekraft?",
    answer: "Yes! Wekraft offers a free tier for up to 10 users with unlimited tasks and projects, whereas Asana restricts most advanced views and dashboards behind premium tiers.",
  },
];

// Custom visual mockup for Asana vs Wekraft
function AsanaMockup() {
  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 p-6 font-mono text-[11px] text-neutral-300">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <span className="text-white font-semibold">Workspace Context Switching</span>
        <span className="text-neutral-500 font-bold">Tool Consolidation</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4 py-6">
        {/* Asana Fragmented Tools */}
        <div className="text-xs text-neutral-500">
          <div className="mb-2 text-[10px] uppercase tracking-wider">Asana Setup (3 Apps Needed):</div>
          <div className="flex gap-2">
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-400">Asana Tasks</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-400">Notion Docs</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-400">Zoom Calls</span>
          </div>
        </div>

        <div className="text-xs text-blue-400">
          <div className="mb-2 text-[10px] uppercase tracking-wider text-blue-400/80">Wekraft Setup (Consolidated):</div>
          <div className="p-3 border border-blue-500/20 rounded-xl bg-blue-500/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🚀</span>
              <span className="text-white font-bold">Tasks, Docs, & Team Meet in One Tab</span>
            </div>
            <span className="text-emerald-400 font-bold">1 Tool</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AsanaComparePage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      <main className="flex flex-col items-center pt-32 pb-16 px-4 md:px-8 text-center w-full mx-auto relative z-10">
        <CompareHero
          competitorName="Asana"
          competitorLogo={<CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
          competitorColor="from-rose-500 to-orange-400"
          title1="Unify your product workspace."
          title2="Stop paying for fragmented apps."
          description="Asana requires you to buy external tools for document wikis and video meetings. Wekraft unifies sprint cycles, task boards, collaborative documents, and AI PM agents in a single dashboard."
          visualMockup={<AsanaMockup />}
        />

        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <CompareTable
            competitorName="Asana"
            competitorLogo={<CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />}
            features={asanaFeatures}
          />

          <CompareFeatures />

          <CompareFAQ competitorName="Asana" faqs={asanaFaqs} />
        </div>
      </main>
    </div>
  );
}
