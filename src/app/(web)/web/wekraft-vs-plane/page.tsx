import React from "react";
import { Metadata } from "next";
import Navbar from "@/modules/web/Navbar";
import CompareTable, { ComparisonFeature } from "@/modules/web/compare/CompareTable";
import CompareFeatures from "@/modules/web/compare/CompareFeatures";

import CompareFAQ, { FAQItem } from "@/modules/web/compare/CompareFAQ";
import { Compass, ArrowRight } from "lucide-react";
import StructuredData from "@/components/StructuredData";

export const metadata: Metadata = {
  title: {
    absolute: "WeKraft vs Plane",
  },
  description: "Plane is an open-source clone, but it lacks developer integration. Compare Plane with WeKraft's VS Code sync, codebase heatmaps, and autonomous dev agents.",
  alternates: {
    canonical: "https://wekraft.xyz/web/wekraft-vs-plane",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://wekraft.xyz/web"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Compare",
      "item": "https://wekraft.xyz/web/why-wekraft"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "WeKraft vs Plane",
      "item": "https://wekraft.xyz/web/wekraft-vs-plane"
    }
  ]
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
    question: "How is WeKraft different from Plane?",
    answer: "Plane is built as an open-source alternative to Jira and Linear, adopting their core designs. WeKraft goes a step further by being an AI-First Developer Ecosystem. It features native VS Code editor syncing, autonomous PM/Dev agents (Kaya & Harry) that have long-term workspace memory, built-in video rooms, and commit stress heatmaps.",
  },
  {
    question: "Can we self-host WeKraft like we can Plane?",
    answer: "Yes, WeKraft is built with modern web technologies and supports Docker-based self-hosting deployments. You can deploy WeKraft inside your private cloud environment to keep database files secure.",
  },
  {
    question: "Does the Plane importer support migrating cycles and comments?",
    answer: "Yes. Our custom Plane Importer tool connects securely to your Plane workspace API to pull down active projects, modules, cycle dates, issue logs, assignees, comments, and attachments directly into WeKraft.",
  },
];

export default function PlaneComparePage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": planeFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30 overflow-hidden relative">
      <StructuredData data={[breadcrumbSchema, faqSchema]} />
      <Navbar />

      <main className="flex flex-col items-center pt-32 pb-16 px-4 md:px-8 text-center w-full mx-auto relative z-10">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
          <CompareTable
            competitorName="Plane"
            competitorLogo={<img src="/plane-so logo.png" alt="Plane" className="w-5 h-5 object-contain" />}
            features={planeFeatures}
          />

          <CompareFeatures />

          <CompareFAQ competitorName="Plane" faqs={planeFaqs} />
        </div>
      </main>
    </div>
  );
}
