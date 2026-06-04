"use client";

import React from "react";
import { Check, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComparisonFeature {
  name: string;
  category: string;
  wekraftStatus: "check" | "limited" | "x";
  wekraftDetail: string;
  competitorStatus: "check" | "limited" | "x";
  competitorDetail: string;
}

interface CompareTableProps {
  competitorName: string;
  competitorLogo: React.ReactNode;
  features: ComparisonFeature[];
}

function renderStatusIcon(status: "check" | "limited" | "x", highlight = false) {
  if (status === "check") {
    return (
      <div className={cn(
        "flex items-center justify-center w-5 h-5 rounded-full border",
        highlight ? "bg-white text-black border-white" : "bg-neutral-900 text-neutral-500 border-neutral-800"
      )}>
        <Check className="w-3 h-3 stroke-[3]" />
      </div>
    );
  }
  if (status === "limited") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-900 text-neutral-400 border border-neutral-800">
        Limited
      </span>
    );
  }
  return (
    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-transparent text-neutral-600 border border-neutral-800/50">
      <X className="w-3 h-3 stroke-[2.5]" />
    </div>
  );
}

export default function CompareTable({ competitorName, competitorLogo, features }: CompareTableProps) {
  // Group features by category
  const categories = Array.from(new Set(features.map(f => f.category)));

  return (
    <div className="w-full font-sans text-neutral-100 py-12 relative z-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
          Why do {competitorName} users migrate to Wekraft?
        </h2>
        <p className="text-neutral-400 text-sm max-w-[600px] mx-auto">
          An honest, feature-by-feature comparison of where Wekraft is built differently.
        </p>
      </div>

      <div className="w-full overflow-x-auto border border-white/[0.08] bg-neutral-950/50 rounded-2xl shadow-2xl">
        <table className="w-full border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-white/[0.08] text-neutral-400 text-[10px] font-mono uppercase tracking-widest bg-neutral-900/20">
              <th className="text-left py-5 pl-6 w-[34%]">Capability</th>
              <th className="py-5 w-[33%] bg-white/[0.02] border-x border-white/[0.04] text-center">
                <div className="flex items-center justify-center gap-2">
                  <img src="/logo.svg" alt="WeKraft" className="w-3.5 h-3.5 opacity-80" />
                  <span className="text-white font-semibold normal-case tracking-normal text-xs">WeKraft</span>
                </div>
              </th>
              <th className="py-5 w-[33%] text-center">
                <div className="flex items-center justify-center gap-2">
                  {competitorLogo}
                  <span className="text-neutral-300 font-semibold normal-case tracking-normal text-xs">{competitorName}</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <React.Fragment key={category}>
                {/* Category Row */}
                <tr>
                  <td colSpan={3} className="text-left text-[10px] tracking-widest text-neutral-500 font-semibold uppercase pt-8 pb-3 px-6 border-b border-white/[0.04] bg-neutral-900/10">
                    {category}
                  </td>
                </tr>

                {/* Feature Rows */}
                {features
                  .filter((f) => f.category === category)
                  .map((feature) => (
                    <tr
                      key={feature.name}
                      className="border-b border-white/[0.04] hover:bg-white/[0.01] transition-colors duration-150 group"
                    >
                      {/* Name Column */}
                      <td className="py-5 pl-6 pr-4 text-left font-medium text-sm text-neutral-300 group-hover:text-white transition-colors">
                        {feature.name}
                      </td>

                      {/* Wekraft Column */}
                      <td className="py-5 px-6 bg-white/[0.02] border-x border-white/[0.04] text-center align-top">
                        <div className="flex flex-col items-center justify-start gap-2 h-full pt-1">
                          {renderStatusIcon(feature.wekraftStatus, true)}
                          <span className="text-[11px] text-neutral-300 font-medium leading-relaxed max-w-[240px]">
                            {feature.wekraftDetail}
                          </span>
                        </div>
                      </td>

                      {/* Competitor Column */}
                      <td className="py-5 px-6 text-center align-top">
                        <div className="flex flex-col items-center justify-start gap-2 h-full pt-1">
                          {renderStatusIcon(feature.competitorStatus)}
                          <span className="text-[11px] text-neutral-500 font-normal leading-relaxed max-w-[240px]">
                            {feature.competitorDetail}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {/* Note */}
        <div className="flex items-center gap-2 mt-0 p-6 bg-neutral-900/20 text-xs text-neutral-500">
          <Info className="w-3.5 h-3.5 text-neutral-600" />
          <span>Evaluation based on core workspaces without premium third-party plugins.</span>
        </div>
      </div>
    </div>
  );
}
