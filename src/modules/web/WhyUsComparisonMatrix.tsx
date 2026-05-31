"use client";

import React from "react";
import Link from "next/link";
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureItem {
  name: string;
  wekraft: "check" | "limited" | "x";
  linear: "check" | "limited" | "x";
  jira: "check" | "limited" | "x";
  notion: "check" | "limited" | "x";
  asana: "check" | "limited" | "x";
}

interface CategoryGroup {
  category: string;
  features: FeatureItem[];
}

const matrixData: CategoryGroup[] = [
  {
    category: "AI ASSISTANT",
    features: [
      { name: "Kaya PM Agent (AI PM)", wekraft: "check", linear: "x", jira: "x", notion: "x", asana: "x" },
      { name: "Harry Dev Agent (AI Dev)", wekraft: "check", linear: "x", jira: "x", notion: "x", asana: "x" },
      { name: "Long-Term Memory Layer", wekraft: "check", linear: "x", jira: "x", notion: "x", asana: "x" }
    ]
  },
  {
    category: "COLLABORATIVE SUITE",
    features: [
      { name: "Kaya AI Integrated Teamspace", wekraft: "check", linear: "x", jira: "x", notion: "x", asana: "x" },
      { name: "Team Meet (Video Calls)", wekraft: "check", linear: "x", jira: "x", notion: "x", asana: "x" },
      { name: "Workspace Membership Roles", wekraft: "check", linear: "check", jira: "check", notion: "check", asana: "check" }
    ]
  },
  {
    category: "CALENDAR & HEATMAPS",
    features: [
      { name: "1-Click Codebase Heatmap", wekraft: "check", linear: "x", jira: "x", notion: "x", asana: "x" },
      { name: "Commit Activity Heatmap", wekraft: "check", linear: "check", jira: "x", notion: "x", asana: "x" },
      { name: "Milestone Calendar", wekraft: "check", linear: "check", jira: "check", notion: "check", asana: "check" }
    ]
  },
  {
    category: "MANAGE SECTORS",
    features: [
      { name: "Tasks Board & Estimation", wekraft: "check", linear: "check", jira: "check", notion: "check", asana: "check" },
      { name: "Issues Logs (Severity/Env)", wekraft: "check", linear: "check", jira: "check", notion: "limited", asana: "check" },
      { name: "Sprint Cycles & Velocities", wekraft: "check", linear: "check", jira: "check", notion: "x", asana: "x" },
      { name: "Time Logs & Trackers", wekraft: "check", linear: "x", jira: "limited", notion: "x", asana: "limited" }
    ]
  },
  {
    category: "DEVELOPER ECOSYSTEM",
    features: [
      { name: "VS Code Handshake Sync", wekraft: "check", linear: "x", jira: "x", notion: "x", asana: "x" },
      { name: "Bi-directional Git Linkage", wekraft: "check", linear: "check", jira: "limited", notion: "x", asana: "x" }
    ]
  }
];

function renderStatusIcon(status: "check" | "limited" | "x", isWekraft = false) {
  if (status === "check") {
    return (
      <div className={cn(
        "flex items-center justify-center mx-auto",
        isWekraft ? "text-white" : "text-neutral-400"
      )}>
        <Check className="w-4 h-4 stroke-[2.5]" />
      </div>
    );
  }
  if (status === "limited") {
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium tracking-tight bg-white/[0.04] text-neutral-300 border border-white/[0.08] mx-auto">
        Limited
      </span>
    );
  }
  return <X className="w-4 h-4 text-white/[0.15] mx-auto stroke-[2]" />;
}

export default function WhyUsComparisonMatrix() {
  return (
    <div className="w-full font-sans text-neutral-100 py-16 relative">

      {/* Responsive Horizontal Container */}
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 border border-white/[0.08] rounded-2xl p-6 md:p-8">
        <table className="w-full border-collapse min-w-[850px]">
          {/* Table Header Row */}
          <thead>
            <tr className="border-b border-white/[0.06]">
              {/* Carousel cell in col-1 */}
              <th className="text-left pb-6 pl-0 w-[30%] font-medium align-bottom">
                <div className="flex flex-col items-start justify-end pb-2">
                  <span className="text-left text-neutral-400 text-xs font-medium tracking-tight">
                    Compare features
                  </span>
                </div>
              </th>
              
              {/* WeKraft Sticky Header with Logo & Get Started Button */}
              <th className="pb-6 w-[14%] bg-white/[0.015] border-x border-t border-white/[0.06] rounded-t-xl text-center align-bottom relative">
                <div className="flex flex-col items-center justify-center gap-3 pt-4 px-2">
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <img src="/logo.svg" alt="WeKraft" className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-semibold text-white tracking-tight">
                      WeKraft
                    </span>
                  </div>
                </div>
              </th>

              {/* Linear */}
              <th className="pb-6 w-[14%] text-center align-bottom border-l border-white/[0.04]">
                <div className="flex flex-col items-center justify-center gap-3 px-2 pt-4">
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <svg className="w-4 h-4 text-neutral-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8M12 8v8" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-300 tracking-tight">Linear</span>
                  </div>
                </div>
              </th>

              {/* Jira */}
              <th className="pb-6 w-[14%] text-center align-bottom border-l border-white/[0.04]">
                <div className="flex flex-col items-center justify-center gap-3 px-2 pt-4">
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <svg className="w-4 h-4 fill-neutral-300 shrink-0" viewBox="0 0 24 24">
                      <path d="M11.53 2C6.81 2 3 5.81 3 10.53S6.81 19.06 11.53 19.06s8.53-3.81 8.53-8.53S16.25 2 11.53 2zm0 13.88c-2.95 0-5.35-2.4-5.35-5.35S8.58 5.18 11.53 5.18s5.35 2.4 5.35 5.35-2.4 5.35-5.35 5.35z"/>
                    </svg>
                    <span className="text-sm font-medium text-neutral-300 tracking-tight">Jira</span>
                  </div>
                </div>
              </th>

              {/* Notion */}
              <th className="pb-6 w-[14%] text-center align-bottom border-l border-white/[0.04]">
                <div className="flex flex-col items-center justify-center gap-3 px-2 pt-4">
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <svg className="w-4 h-4 fill-neutral-300 shrink-0" viewBox="0 0 24 24">
                      <path d="M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zm3 4v10l2-1V9l5 6 2-1V7l-2 1v6l-5-6-2 1z"/>
                    </svg>
                    <span className="text-sm font-medium text-neutral-300 tracking-tight">Notion</span>
                  </div>
                </div>
              </th>

              {/* Asana */}
              <th className="pb-6 w-[14%] text-center align-bottom border-l border-white/[0.04]">
                <div className="flex flex-col items-center justify-center gap-3 px-2 pt-4">
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <svg className="w-4 h-4 fill-neutral-300 shrink-0" viewBox="0 0 24 24">
                      <circle cx="12" cy="7" r="2.5" />
                      <circle cx="8" cy="14" r="2.5" />
                      <circle cx="16" cy="14" r="2.5" />
                    </svg>
                    <span className="text-sm font-medium text-neutral-300 tracking-tight">Asana</span>
                  </div>
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body Groups */}
          <tbody>
            {matrixData.map((group) => (
              <React.Fragment key={group.category}>
                {/* Category Header Row */}
                <tr>
                  <td colSpan={6} className="text-left pl-0 text-[11px] tracking-widest text-neutral-400 font-medium uppercase pt-8 pb-3 border-b border-white/[0.04]">
                    {group.category}
                  </td>
                </tr>

                {/* Feature Rows */}
                {group.features.map((feature) => (
                  <tr
                    key={feature.name}
                    className="hover:bg-white/[0.015] border-b border-white/[0.04] transition-colors duration-150 group"
                  >
                    {/* Feature Title */}
                    <td className="py-4 pl-0 text-left text-sm text-neutral-300 group-hover:text-white transition-colors tracking-tight font-medium">
                      {feature.name}
                    </td>

                    {/* WeKraft Status Column */}
                    <td className="py-4 bg-white/[0.015] border-x border-white/[0.06] text-center">
                      {renderStatusIcon(feature.wekraft, true)}
                    </td>

                    {/* Competitors Status Columns */}
                    <td className="py-4 text-center border-l border-white/[0.04]">
                      {renderStatusIcon(feature.linear)}
                    </td>
                    <td className="py-4 text-center border-l border-white/[0.04]">
                      {renderStatusIcon(feature.jira)}
                    </td>
                    <td className="py-4 text-center border-l border-white/[0.04]">
                      {renderStatusIcon(feature.notion)}
                    </td>
                    <td className="py-4 text-center border-l border-white/[0.04]">
                      {renderStatusIcon(feature.asana)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Table Footer Legend */}
        <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-white/[0.06] text-xs text-neutral-500 tracking-tight pl-0">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Native capability</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium tracking-tight bg-white/[0.04] text-neutral-300 border border-white/[0.08]">
              Limited
            </span>
            <span>Partial / plugin required</span>
          </div>

          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-white/[0.15] stroke-[2]" />
            <span>Not available</span>
          </div>

          <span className="ml-auto text-[11px] text-neutral-500">
            *Evaluated against core default workspaces without custom external add-ons.
          </span>
        </div>
      </div>
    </div>
  );
}
