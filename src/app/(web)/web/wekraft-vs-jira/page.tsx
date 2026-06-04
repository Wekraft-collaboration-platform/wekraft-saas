import React from "react";
import { Metadata } from "next";
import Navbar from "@/modules/web/Navbar";
import CompareHero from "@/modules/web/compare/CompareHero";
import CompareTable, { ComparisonFeature } from "@/modules/web/compare/CompareTable";
import CompareFeatures from "@/modules/web/compare/CompareFeatures";

import CompareFAQ, { FAQItem } from "@/modules/web/compare/CompareFAQ";
import { Briefcase, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Wekraft vs Jira | Clean, High-Speed Project Management",
  description: "Ditch the slow loading screens and configuration bloat. Compare Jira with Wekraft's sub-second performance, native AI agents, and built-in meetings.",
};

const jiraFeatures: ComparisonFeature[] = [
  {
    name: "Sub-Second Performance",
    category: "SPEED & USABILITY",
    wekraftStatus: "check",
    wekraftDetail: "Loads instantaneously under 100ms. High-density, keyboard-first design.",
    competitorStatus: "x",
    competitorDetail: "Average board load times exceed 4 seconds, causing noticeable workspace friction.",
  },
  {
    name: "Kaya AI PM Agent",
    category: "AI COLLABORATION",
    wekraftStatus: "check",
    wekraftDetail: "Native PM agent writes tickets, analyzes logs, and maps dependencies automatically.",
    competitorStatus: "x",
    competitorDetail: "No native AI PM capabilities; relies on static rules and macros.",
  },
  {
    name: "Developer Handshake Sync",
    category: "DEVELOPER ECOSYSTEM",
    wekraftStatus: "check",
    wekraftDetail: "Bidirectional sync to VS Code directly updating task boards from your IDE.",
    competitorStatus: "limited",
    competitorDetail: "Requires complex marketplace plugins and webhooks setup.",
  },
  {
    name: "Built-In Meeting Rooms",
    category: "COLLABORATIVE SUITE",
    wekraftStatus: "check",
    wekraftDetail: "Launch dynamic audio and video rooms directly inside sprint cycles in 1 click.",
    competitorStatus: "x",
    competitorDetail: "Depends on external meeting integrations and calendar syncs.",
  },
  {
    name: "Workspace Roles & Permissions",
    category: "ADMINISTRATION",
    wekraftStatus: "check",
    wekraftDetail: "Clean, visual permission dashboards that can be configured by any team lead.",
    competitorStatus: "check",
    competitorDetail: "Highly detailed and secure, but requires specialized training to configure.",
  },
];

const jiraFaqs: FAQItem[] = [
  {
    question: "Is Wekraft secure enough to replace Jira?",
    answer: "Absolutely. Wekraft features advanced workspace membership controls, secure data storage via Convex, and complies with modern security protocols. Wekraft's architecture keeps your codebase keys and project descriptions fully isolated.",
  },
  {
    question: "How much faster is Wekraft compared to Jira?",
    answer: "Wekraft is designed to load in under 100ms, even on workspaces with thousands of active tasks. Jira often takes several seconds to switch between backlogs, sprint boards, and timeline roadmaps.",
  },
  {
    question: "Can Wekraft import our sprint cycles and subtasks from Jira?",
    answer: "Yes. Using Wekraft's Jira Importer, you can import XML or CSV dumps from Jira. The importer automatically parses issues, epic links, sprint dates, assignees, and attachments to make transition seamless.",
  },
];

// Custom visual mockup for Jira vs Wekraft
function JiraMockup() {
  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 p-6 font-mono text-[11px] text-neutral-300">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <span className="text-white font-semibold">Workspace Loading Latency</span>
        <span className="text-neutral-500 font-bold">10,000 Tasks Test</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6 py-4">
        {/* Jira slow loading */}
        <div>
          <div className="flex justify-between text-neutral-500 mb-1">
            <span>Jira Cloud Loading...</span>
            <span>4.8s (Delayed)</span>
          </div>
          <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full w-[40%] animate-pulse" />
          </div>
        </div>

        {/* Wekraft loading */}
        <div>
          <div className="flex justify-between text-blue-400 mb-1">
            <span className="font-bold">Wekraft Load Time</span>
            <span className="text-emerald-400">92ms (Instant)</span>
          </div>
          <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full w-[100%]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JiraComparePage() {
  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <Navbar />

      <main className="flex flex-col items-center pt-32 pb-16 px-4 md:px-8 text-center w-full mx-auto relative z-10">
        <CompareHero
          competitorName="Jira"
          competitorLogo={<Briefcase className="w-3.5 h-3.5 text-blue-400" />}
          competitorColor="from-blue-600 to-indigo-500"
          title1="Unbloat your sprint board."
          title2="Built for high-performance teams."
          description="Say goodbye to sluggish reload speeds and complicated workflow configurations. Wekraft delivers a snappy, keyboard-first project board with built-in AI dev agents and meeting rooms."
          visualMockup={<JiraMockup />}
        />

        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <CompareTable
            competitorName="Jira"
            competitorLogo={<Briefcase className="w-3.5 h-3.5 text-neutral-400" />}
            features={jiraFeatures}
          />

          <CompareFeatures />

          <CompareFAQ competitorName="Jira" faqs={jiraFaqs} />
        </div>
      </main>
    </div>
  );
}
