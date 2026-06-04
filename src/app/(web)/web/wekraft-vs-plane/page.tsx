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
          title1="Meet Kaya, your AI PM."
          title2="Collaborate in real time."
          description="Discuss projects, query sprint workloads, and map out client deliverables by chatting directly with Kaya inside your team spaces."
          visualMockup={<img src="/kaya-team.png" alt="Wekraft Kaya AI PM Agent" className="w-full rounded-2xl object-cover border border-white/[0.08]" />}
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
