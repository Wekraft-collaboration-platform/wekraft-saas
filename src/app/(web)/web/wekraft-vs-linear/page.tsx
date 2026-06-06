import React from "react";
import { Metadata } from "next";
import Navbar from "@/modules/web/Navbar";
import CompareTable, { ComparisonFeature } from "@/modules/web/compare/CompareTable";
import CompareFeatures from "@/modules/web/compare/CompareFeatures";
import CompareFAQ, { FAQItem } from "@/modules/web/compare/CompareFAQ";
import { Compass, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: {
    absolute: "WeKraft vs Linear",
  },
  description: "Linear is fast, but it excludes collaboration. Compare Linear with WeKraft's native AI agents, integrated video rooms, and built-in team Wikis.",
  alternates: {
    canonical: "https://wekraft.xyz/web/wekraft-vs-linear",
  },
};


const linearFeatures: ComparisonFeature[] = [
  {
    name: "Autonomous AI Dev/PM (Kaya & Harry)",
    category: "AI COLLABORATION",
    wekraftStatus: "check",
    wekraftDetail: "Kaya automates ticketing and backlog health, while Harry reads codebase commits and suggests edits.",
    competitorStatus: "x",
    competitorDetail: "Linear Asks can summarize text, but lacks autonomous agents to write code or plan sprints.",
  },
  {
    name: "Integrated Video Meet",
    category: "COLLABORATIVE SUITE",
    wekraftStatus: "check",
    wekraftDetail: "1-click voice and video calls directly inside the workspace keep engineers aligned.",
    competitorStatus: "x",
    competitorDetail: "Must paste Zoom/Slack huddle links; no native workspace rooms.",
  },
  {
    name: "Long-Term Memory Layer",
    category: "AI COLLABORATION",
    wekraftStatus: "check",
    wekraftDetail: "Stores architectural context, user roles, and codebase stress history across cycles.",
    competitorStatus: "x",
    competitorDetail: "Does not support contextual memory retention; stateless interactions.",
  },
  {
    name: "Commit Activity Heatmaps",
    category: "CALENDARS & VISIBILITY",
    wekraftStatus: "check",
    wekraftDetail: "Highlight stressed directories and active branch paths visually.",
    competitorStatus: "check",
    competitorDetail: "Tracks git logs and branches efficiently inside the issue list details.",
  },
  {
    name: "VS Code Handshake Sync",
    category: "DEVELOPER ECOSYSTEM",
    wekraftStatus: "check",
    wekraftDetail: "Direct workspace state updates synchronized between local IDE edits and board statuses.",
    competitorStatus: "x",
    competitorDetail: "Relies on standard CLI tools and branch integration, no direct IDE sync client.",
  },
];

const linearFaqs: FAQItem[] = [
  {
    question: "How does WeKraft compare to Linear in terms of speed?",
    answer: "Linear is widely praised for its performance, and WeKraft matches it. We use Convex and Next.js to deliver sub-100ms updates. The difference is WeKraft adds collaborative video rooms, standalone wiki documentation, and autonomous AI agents directly into the same fast workspace.",
  },
  {
    question: "Can our product managers write specifications inside WeKraft?",
    answer: "Yes! WeKraft includes full-featured markdown wiki spaces in each project. Product managers can write specs, mock-up charts, and link them directly to engineering issues. Even better, Kaya (our AI PM) can automatically parse these spec files to draft task sub-lists.",
  },
  {
    question: "What importer options are available for moving from Linear?",
    answer: "We offer a direct importer that uses your Linear Personal Access Token. It fetches all active teams, issues, cycles, custom labels, and comments, mapping them into your WeKraft project in less than five minutes.",
  },
];


export default function LinearComparePage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      <main className="flex flex-col items-center pt-32 pb-16 px-4 md:px-8 text-center w-full mx-auto relative z-10">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <CompareTable
            competitorName="Linear"
            competitorLogo={<img src="/linear.png" alt="Linear" className="w-5 h-5 object-contain" />}
            features={linearFeatures}
          />

          <CompareFeatures />



          <CompareFAQ competitorName="Linear" faqs={linearFaqs} />
        </div>
      </main>
    </div>
  );
}
