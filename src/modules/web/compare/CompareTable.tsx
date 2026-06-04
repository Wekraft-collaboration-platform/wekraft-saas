"use client";

import React from "react";
import { Check, X, Info, Minus } from "lucide-react";
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

function renderStatusIcon(status: "check" | "limited" | "x") {
  if (status === "check") {
    return (
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white shrink-0 mt-0.5 shadow-sm shadow-emerald-500/20">
        <Check className="w-3 h-3 stroke-[3.5]" />
      </div>
    );
  }
  if (status === "limited") {
    return (
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-600 text-white shrink-0 mt-0.5 shadow-sm shadow-neutral-600/20">
        <Minus className="w-3.5 h-3.5 stroke-[3.5]" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white shrink-0 mt-0.5 shadow-sm shadow-rose-500/20">
      <X className="w-3 h-3 stroke-[3.5]" />
    </div>
  );
}

export default function CompareTable({ competitorName, competitorLogo, features }: CompareTableProps) {
  return (
    <div className="w-full font-sans text-neutral-100 py-16 relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
          Why do {competitorName} users migrate to Wekraft?
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base max-w-[600px] mx-auto">
          An honest, feature-by-feature comparison of where Wekraft is built differently.
        </p>
      </div>

      <div className="w-full overflow-x-auto border border-white/[0.08] bg-neutral-950/40 rounded-[2rem] shadow-[0_24px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-2xl">
        <table className="w-full border-collapse min-w-[850px]">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.01]">
              <th className="text-left py-8 pl-8 w-[30%] text-neutral-500 text-xs font-mono uppercase tracking-widest font-semibold">
                Capability
              </th>
              <th className="py-8 px-6 w-[35%] text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-xl p-1.5 shrink-0">
                    <img src="/logo.svg" alt="WeKraft" className="w-5 h-5" />
                  </div>
                  <span className="text-lg md:text-xl font-bold text-white tracking-tight">WeKraft</span>
                </div>
              </th>
              <th className="py-8 px-6 w-[35%] text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/[0.03] border border-white/[0.08] rounded-xl p-1.5 text-neutral-300 shrink-0">
                    {React.isValidElement(competitorLogo) ? (
                      React.cloneElement(competitorLogo as React.ReactElement<any>, { className: "w-5 h-5 object-contain" })
                    ) : (
                      competitorLogo
                    )}
                  </div>
                  <span className="text-lg md:text-xl font-bold text-neutral-200 tracking-tight">{competitorName}</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {features.map((feature, idx) => (
              <tr
                key={feature.name}
                className={cn(
                  "border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors duration-150 group",
                  idx === features.length - 1 && "border-b-0"
                )}
              >
                {/* Capability Column */}
                <td className="py-6 pl-8 pr-4 text-left align-top">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-1.5 block">
                      {feature.category}
                    </span>
                    <span className="text-white font-semibold text-[15px] leading-snug group-hover:text-blue-400 transition-colors">
                      {feature.name}
                    </span>
                  </div>
                </td>

                {/* Wekraft Column */}
                <td className="py-6 px-6 text-left align-top">
                  <div className="flex items-start gap-3.5 text-left h-full">
                    {renderStatusIcon(feature.wekraftStatus)}
                    <span className="text-[13.5px] text-neutral-300 font-normal leading-relaxed">
                      {feature.wekraftDetail}
                    </span>
                  </div>
                </td>

                {/* Competitor Column */}
                <td className="py-6 px-6 text-left align-top">
                  <div className="flex items-start gap-3.5 text-left h-full">
                    {renderStatusIcon(feature.competitorStatus)}
                    <span className="text-[13.5px] text-neutral-400 font-normal leading-relaxed">
                      {feature.competitorDetail}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Note */}
        <div className="flex items-center gap-2 p-6 border-t border-white/[0.04] bg-white/[0.01] text-xs text-neutral-500">
          <Info className="w-4 h-4 text-neutral-600 shrink-0" />
          <span>Evaluation based on core workspaces without premium third-party plugins.</span>
        </div>
      </div>
    </div>
  );
}
