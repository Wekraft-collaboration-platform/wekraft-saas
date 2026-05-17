import React from "react";
import Navbar from "@/modules/web/Navbar";
import WhyUs from "@/modules/web/WhyUs";
import Comparison from "@/modules/web/Comparison";
import SmoothScroll from "@/providers/SmoothScroll";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WhyUsPage() {
  return (
    <SmoothScroll>
      <div className="bg-[#050505] min-h-screen text-white font-sans selection:bg-blue-500/30">
        <Navbar />
        
        <main className="pt-32 pb-24 px-6 md:px-12 flex justify-center">
          <div className="w-full max-w-5xl">
            
            {/* Header (Doc-style) */}
            <div className="mb-16">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono text-white/40 border border-white/10 rounded-full px-3 py-1 mb-6 bg-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Why Wekraft
              </div>
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Redefining Project <br/>
                <span className="text-neutral-500">Management.</span>
              </h1>
              <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl">
                Built exclusively for software teams. WeKraft replaces chaotic task trackers with an intelligent, unified workspace that lives right where you code.
              </p>
            </div>

            {/* Content Sections */}
            <div className="space-y-24">
              <WhyUs />
              <Comparison />
            </div>
            
            {/* Footer Hint (Doc-style) */}
            <div className="mt-24 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
              <span>Ready to upgrade your workflow?</span>
              <Link href="/auth" className="text-white hover:text-blue-400 transition-colors flex items-center gap-1.5 font-medium border border-white/10 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10">
                Get started for free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </main>
      </div>
    </SmoothScroll>
  );
}
