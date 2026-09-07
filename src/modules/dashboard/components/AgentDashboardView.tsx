"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Paperclip, ChevronDown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import RightSidebar from "@/app/(main)/dashboard/RightSidebar";

export function AgentDashboardView() {
  const [activeTab, setActiveTab] = useState<"kaya" | "harry">("kaya");
  const [isRightSidebarExpanded, setIsRightSidebarExpanded] = useState(false);
  const isKaya = activeTab === "kaya";

  return (
    <div className="flex flex-col lg:flex-row items-start w-full min-h-[calc(100vh-120px)]">
      {/* Center Agent Interface */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] w-full px-4 select-none">
        {/* Centered Logo & Title */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <Image
              src={isKaya ? "/kaya.svg" : "/harry.svg"}
              alt={isKaya ? "Kaya" : "Harry"}
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {isKaya ? "Kaya" : "Harry"}
          </h1>
        </div>

        {/* Card Wrapper */}
        <div className="w-full max-w-[760px]">
          {/* Top Attached Tabs */}
          <div className="flex items-end gap-1.5 pl-3 -mb-[1px]">
            {/* Ask Kaya Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("kaya")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border-t border-x",
                isKaya
                  ? "bg-gradient-to-r from-[#f9a8d4] via-[#d8b4fe] to-[#bae6fd] text-zinc-950 border-transparent z-10"
                  : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border-zinc-800"
              )}
            >
              <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                <Image
                  src="/kaya.svg"
                  alt="Kaya"
                  width={15}
                  height={15}
                  className="object-contain"
                />
              </div>
              <span>Ask Kaya</span>
            </button>

            {/* Ask Harry Tab */}
            <button
              type="button"
              onClick={() => setActiveTab("harry")}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border-t border-x",
                !isKaya
                  ? "bg-gradient-to-r from-[#fed7aa] via-[#fde047] to-[#fbcfe8] text-zinc-950 border-transparent z-10"
                  : "bg-zinc-900/90 text-zinc-400 hover:text-zinc-200 border-zinc-800"
              )}
            >
              <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                <Image
                  src="/harry.svg"
                  alt="Harry"
                  width={15}
                  height={15}
                  className="object-contain"
                />
              </div>
              <span>Ask Harry</span>
            </button>
          </div>

          {/* Main Box */}
          <div
            className={cn(
              "relative w-full rounded-2xl rounded-tl-none bg-[#09090b] border p-6 shadow-2xl transition-colors duration-200",
              isKaya ? "border-[#d8b4fe]/40" : "border-[#fed7aa]/40"
            )}
          >
            {/* Top Notice */}
            <div className="min-h-[110px] text-sm text-zinc-400 leading-relaxed">
              {isKaya
                ? "Kaya is available for Pro projects. Upgrade to Pro to unlock."
                : "Harry is available for Pro projects. Upgrade to Pro to unlock."}
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-between pt-2">
              {/* Auto Model Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-medium cursor-pointer hover:bg-zinc-800 transition-colors">
                <svg
                  className="w-3.5 h-3.5 text-zinc-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18M3 12h18" />
                </svg>
                <span>Auto</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </div>

              {/* Right Tools */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Attach"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#d946ef] via-[#a855f7] to-[#ec4899] text-white text-xs font-semibold shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span>Upgrade to Pro</span>
                  <Lock className="w-3 h-3 text-white/90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Sheet (Preserved on Dashboard) */}
      <RightSidebar
        isRightSidebarExpanded={isRightSidebarExpanded}
        setIsRightSidebarExpanded={setIsRightSidebarExpanded}
      />
    </div>
  );
}
