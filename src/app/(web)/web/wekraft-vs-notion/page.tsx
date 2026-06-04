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

export default function NotionComparePage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      <main className="flex flex-col items-center pt-32 pb-16 px-4 md:px-8 text-center w-full mx-auto relative z-10">
        <CompareHero
          competitorName="Notion"
          competitorLogo={<FileText className="w-3.5 h-3.5 text-neutral-300" />}
          competitorColor="from-neutral-100 to-neutral-400"
          title1="Centralize your issues."
          title2="Built for shipping code."
          description="Ditch fragile Notion databases. Wekraft delivers a sub-second, structured kanban board with built-in severity levels and automated sprint syncing."
          visualMockup={<img src="/issues.png" alt="Wekraft Issues Board" className="w-full rounded-2xl object-cover border border-white/[0.08]" />}
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
