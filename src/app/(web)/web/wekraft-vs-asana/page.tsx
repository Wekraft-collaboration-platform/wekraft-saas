import React from "react";
import { Metadata } from "next";
import Navbar from "@/modules/web/Navbar";
import CompareTable, { ComparisonFeature } from "@/modules/web/compare/CompareTable";
import CompareFeatures from "@/modules/web/compare/CompareFeatures";

import CompareFAQ, { FAQItem } from "@/modules/web/compare/CompareFAQ";
import { CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "WeKraft vs Asana",
  },
  description: "Asana is good for general task templates, but lacks developer workflows. Compare Asana with WeKraft's VS Code sync, unified docs, and AI PM agents.",
  alternates: {
    canonical: "https://wekraft.xyz/web/wekraft-vs-asana",
  },
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
    question: "Why is WeKraft better for engineering teams than Asana?",
    answer: "Asana is built for general task coordination across marketing, ops, and HR, which means it lacks specialized developer features. WeKraft is designed exclusively for software shipping. It provides VS Code handshake integrations, Git linkage, commit activity heatmaps, and native AI PM/Dev agents that automate ticketing and code editing.",
  },
  {
    question: "Can we import our projects and task dependencies from Asana?",
    answer: "Yes, WeKraft has an Asana Importer. Simply upload your Asana project JSON/CSV export, and our importer maps your task boards, cycles, milestones, dependencies, assignees, and descriptions automatically.",
  },
  {
    question: "Is there a free tier for small teams starting with WeKraft?",
    answer: "Yes! WeKraft offers a free tier for up to 10 users with unlimited tasks and projects, whereas Asana restricts most advanced views and dashboards behind premium tiers.",
  },
];

export default function AsanaComparePage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      <main className="flex flex-col items-center pt-32 pb-16 px-4 md:px-8 text-center w-full mx-auto relative z-10">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <CompareTable
            competitorName="Asana"
            competitorLogo={<img src="/asana-logo.svg" alt="Asana" className="w-5 h-5 object-contain" />}
            features={asanaFeatures}
          />

          <CompareFeatures />

          <CompareFAQ competitorName="Asana" faqs={asanaFaqs} />
        </div>
      </main>
    </div>
  );
}
