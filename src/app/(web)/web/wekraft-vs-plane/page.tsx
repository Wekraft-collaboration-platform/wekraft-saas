import React from "react";
import { Metadata } from "next";
import Navbar from "@/modules/web/Navbar";
import CompareHero from "@/modules/web/compare/CompareHero";
import CompareTable, { ComparisonFeature } from "@/modules/web/compare/CompareTable";
import CompareFeatures from "@/modules/web/compare/CompareFeatures";

import CompareFAQ, { FAQItem } from "@/modules/web/compare/CompareFAQ";
import { Compass, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Wekraft vs Plane | AI-First Software Engineering Hub",
  description: "Plane is an open-source clone, but it lacks developer integration. Compare Plane with Wekraft's VS Code sync, codebase heatmaps, and autonomous dev agents.",
};

const planeFeatures: ComparisonFeature[] = [
  {
    name: "VS Code Handshake Sync",
    category: "DEVELOPER ECOSYSTEM",
    wekraftStatus: "check",
    wekraftDetail: "Synchronize issue state and logs bidirectionally inside VS Code as you edit code.",
    competitorStatus: "x",
    competitorDetail: "No native IDE editor extension or sync channel.",
  },
  {
    name: "Harry Dev Agent (AI Dev)",
    category: "AI COLLABORATION",
    wekraftStatus: "check",
    wekraftDetail: "Autonomous agent reads issue descriptions, edits local codebase files, and opens PRs.",
    competitorStatus: "x",
    competitorDetail: "Lacks codebase-aware coding agents; Plane AI is limited to text generation.",
  },
  {
    name: "Integrated Video Meet",
    category: "COLLABORATIVE SUITE",
    wekraftStatus: "check",
    wekraftDetail: "Launch dynamic voice/video rooms directly connected to cycles, sprints, and tasks.",
    competitorStatus: "x",
    competitorDetail: "Relies on pasting external huddle or Zoom URLs in issue descriptions.",
  },
  {
    name: "Commit Activity Heatmaps",
    category: "CALENDARS & VISIBILITY",
    wekraftStatus: "check",
    wekraftDetail: "View stress hotspots and commit rates directly inside the roadmap view.",
    competitorStatus: "x",
    competitorDetail: "Does not map repo stress or code activity; has basic calendar views.",
  },
  {
    name: "Native Time Trackers",
    category: "PROJECT MANAGEMENT",
    wekraftStatus: "check",
    wekraftDetail: "Built-in timers and time log sheets for client billing and developer performance tracking.",
    competitorStatus: "limited",
    competitorDetail: "Basic custom properties; no native automated timer logging.",
  },
];

const planeFaqs: FAQItem[] = [
  {
    question: "How is Wekraft different from Plane?",
    answer: "Plane is built as an open-source alternative to Jira and Linear, adopting their core designs. Wekraft goes a step further by being an AI-First Developer Ecosystem. It features native VS Code editor syncing, autonomous PM/Dev agents (Kaya & Harry) that have long-term workspace memory, built-in video rooms, and commit stress heatmaps.",
  },
  {
    question: "Can we self-host Wekraft like we can Plane?",
    answer: "Yes, Wekraft is built with modern web technologies and supports Docker-based self-hosting deployments. You can deploy Wekraft inside your private cloud environment to keep database files secure.",
  },
  {
    question: "Does the Plane importer support migrating cycles and comments?",
    answer: "Yes. Our custom Plane Importer tool connects securely to your Plane workspace API to pull down active projects, modules, cycle dates, issue logs, assignees, comments, and attachments directly into Wekraft.",
  },
];

// Custom visual mockup for Plane vs Wekraft
function PlaneMockup() {
  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 p-6 font-mono text-[11px] text-neutral-300">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <span className="text-white font-semibold">IDE Handshake Sync Status</span>
        <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">VS Code Connected</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4 py-4">
        {/* IDE Edit */}
        <div className="p-3 border border-white/5 rounded-xl bg-white/[0.01]">
          <div className="text-neutral-500 mb-1 text-[10px] uppercase">VS Code Codebase:</div>
          <div className="text-[10px] text-emerald-400 font-semibold leading-relaxed">
            <span>$ git commit -m "fix(modules): resolves memory leak issue #104"</span>
          </div>
        </div>

        {/* Handshake Indicator */}
        <div className="p-3 border border-blue-500/20 rounded-xl bg-blue-500/[0.02] flex items-center justify-between">
          <div>
            <div className="text-white font-bold">Wekraft Board Synced</div>
            <div className="text-[10px] text-neutral-400">Issue #104 status updated to:</div>
          </div>
          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Completed</span>
        </div>
      </div>
    </div>
  );
}

export default function PlaneComparePage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      <main className="flex flex-col items-center pt-32 pb-16 px-4 md:px-8 text-center w-full mx-auto relative z-10">
        <CompareHero
          competitorName="Plane"
          competitorLogo={
            <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-neutral-300 border border-neutral-300 rounded text-[8px] leading-none shrink-0">
              P
            </span>
          }
          competitorColor="from-indigo-500 to-violet-500"
          title1="Move beyond a Linear clone."
          title2="Experience an AI-first workspace."
          description="Plane copies traditional project management layouts. Wekraft unifies issues and cycles with bi-directional VS Code handshake syncs, autonomous coding agents, and codebase stress maps."
          visualMockup={<PlaneMockup />}
        />

        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <CompareTable
            competitorName="Plane"
            competitorLogo={
              <span className="w-3.5 h-3.5 flex items-center justify-center font-bold text-neutral-400 border border-neutral-500 rounded text-[8px] leading-none shrink-0">
                P
              </span>
            }
            features={planeFeatures}
          />

          <CompareFeatures />

          <CompareFAQ competitorName="Plane" faqs={planeFaqs} />
        </div>
      </main>
    </div>
  );
}
