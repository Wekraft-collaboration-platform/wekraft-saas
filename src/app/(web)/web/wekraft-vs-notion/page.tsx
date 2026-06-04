import React from "react";
import { Metadata } from "next";
import Navbar from "@/modules/web/Navbar";
import CompareHero from "@/modules/web/compare/CompareHero";
import CompareTable, { ComparisonFeature } from "@/modules/web/compare/CompareTable";
import CompareFeatures from "@/modules/web/compare/CompareFeatures";

import CompareFAQ, { FAQItem } from "@/modules/web/compare/CompareFAQ";
import { FileText, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Wekraft vs Notion | Structured PM and Docs in One Workspace",
  description: "Notion is great for documents, but fails as a software engineering hub. Compare Notion with Wekraft's native developer cycles, VS Code sync, and AI agents.",
};

const notionFeatures: ComparisonFeature[] = [
  {
    name: "Native Sprint Cycles",
    category: "PROJECT MANAGEMENT",
    wekraftStatus: "check",
    wekraftDetail: "Cycles rollover automatically, tracking group velocity, burn-downs, and scope creep natively.",
    competitorStatus: "x",
    competitorDetail: "Must build custom databases, write rollback formulas, and manually filter dates.",
  },
  {
    name: "AI Agents (Kaya & Harry)",
    category: "AI COLLABORATION",
    wekraftStatus: "check",
    wekraftDetail: "Kaya handles PM triaging while Harry writes code and opens PRs with memory tracking.",
    competitorStatus: "limited",
    competitorDetail: "Notion AI is a text generation assistant; it cannot interact with sprint states or files.",
  },
  {
    name: "VS Code Handshake Sync",
    category: "DEVELOPER ECOSYSTEM",
    wekraftStatus: "check",
    wekraftDetail: "Task states automatically sync with your local VS Code editor as you edit code.",
    competitorStatus: "x",
    competitorDetail: "No local editor syncing or bidirectional integration.",
  },
  {
    name: "Integrated Video Calls",
    category: "COLLABORATIVE SUITE",
    wekraftStatus: "check",
    wekraftDetail: "Built-in Team Meet rooms directly linked to tickets, sprints, and teams.",
    competitorStatus: "x",
    competitorDetail: "Requires Zoom, Slack, or Google Meet links pasted into document templates.",
  },
  {
    name: "Commit Activity Heatmaps",
    category: "CALENDAR & HEATMAPS",
    wekraftStatus: "check",
    wekraftDetail: "Interactive codebase heatmaps tracking commit spikes and stress points directly.",
    competitorStatus: "x",
    competitorDetail: "Text-based database records without codebase visual indicators.",
  },
];

const notionFaqs: FAQItem[] = [
  {
    question: "Why should we switch from Notion to Wekraft?",
    answer: "While Notion is a powerful note-taking app, engineering teams quickly run into limits. Notion requires manual setup for database sprints, doesn't track burn-downs or cycle velocity out of the box, and lacks integrations with git and IDEs. Wekraft gives you the clean document interface of Notion but links it natively to high-performance sprint tools, VS Code, and autonomous AI agents.",
  },
  {
    question: "Can we import our existing Notion wikis and databases?",
    answer: "Yes! Wekraft features a dedicated import utility. You can upload Notion CSV exports or connect via Notion API to map databases, pages, tasks, and users to Wekraft modules in minutes.",
  },
  {
    question: "How does Wekraft keep docs and code connected?",
    answer: "With our VS Code Handshake Sync and bi-directional Git linkage, files mentioned in Wekraft Docs automatically sync with your codebase. Changes to code comments can update Wekraft tasks, and referencing a ticket in a commit updates the Wekraft board state.",
  },
];

// Custom visual mockup for Notion vs Wekraft
function NotionMockup() {
  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 p-6 font-mono text-[11px] text-neutral-300">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <span className="text-white font-semibold">Notion Database Sprawl</span>
        <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">Manual Formulas Required</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4 py-8">
        {/* Competitor Block */}
        <div className="p-4 border border-white/5 rounded-xl bg-white/[0.01] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center">📄</div>
            <div>
              <div className="text-neutral-400">Notion Workspace</div>
              <div className="text-[10px] text-neutral-600">Filters: Rollup (Sprint_Date) &gt; Today</div>
            </div>
          </div>
          <span className="text-neutral-600">Broken Link</span>
        </div>

        <div className="flex justify-center text-neutral-600">
          <ArrowRight className="w-5 h-5 rotate-90" />
        </div>

        {/* Wekraft Unified Block */}
        <div className="p-4 border border-blue-500/20 rounded-xl bg-blue-500/[0.02] flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-blue-500" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center">⚡</div>
            <div>
              <div className="text-white font-bold">Wekraft Unified Engine</div>
              <div className="text-[10px] text-blue-400/70">Docs, Sprints, & Git synchronized</div>
            </div>
          </div>
          <span className="text-emerald-400 font-bold">Native Syncing</span>
        </div>
      </div>
    </div>
  );
}

export default function NotionComparePage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      <main className="flex flex-col items-center pt-32 pb-16 px-4 md:px-8 text-center w-full mx-auto relative z-10">
        <CompareHero
          competitorName="Notion"
          competitorLogo={<FileText className="w-3.5 h-3.5 text-neutral-300" />}
          competitorColor="from-neutral-100 to-neutral-400"
          title1="Wikis and Sprints."
          title2="Natively Connected."
          description="Notion is excellent for documents, but breaks down as an engineering board. Wekraft unifies markdown documents with velocity charts, VS Code sync, and AI agents."
          visualMockup={<NotionMockup />}
        />

        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <CompareTable
            competitorName="Notion"
            competitorLogo={<FileText className="w-3.5 h-3.5 text-neutral-400" />}
            features={notionFeatures}
          />

          <CompareFeatures />

          <CompareFAQ competitorName="Notion" faqs={notionFaqs} />
        </div>
      </main>
    </div>
  );
}
