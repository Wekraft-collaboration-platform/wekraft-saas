"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function WhyUsHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animate the left column elements sequentially
    gsap.from(".hero-content > *", {
      y: 20,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power3.out",
    });

    // Animate the right visual section
    gsap.from(".hero-visual", {
      x: 30,
      opacity: 0,
      duration: 1,
      delay: 0.3,
      ease: "power3.out",
    });
  }, { scope: containerRef });

  return (
    <div className="w-full max-w-7xl mx-auto pt-4 pb-12 px-4 md:px-8 relative z-20" ref={containerRef}>
      <div className="relative border border-white/[0.1] bg-gradient-to-br from-white/[0.03] to-transparent rounded-[2rem] flex flex-col md:flex-row items-center shadow-[0_8px_40px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden backdrop-blur-2xl">
        
        {/* Multi-layered premium glows */}
        <div className="absolute -top-40 -right-40 w-full h-full max-w-2xl max-h-2xl bg-white/[0.04] blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute -bottom-40 -left-40 w-full h-full max-w-2xl max-h-2xl bg-white/[0.02] blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Left Column */}
        <div className="hero-content flex flex-col items-center md:items-start text-center md:text-left flex-[0.9] p-8 md:p-12 lg:p-14 relative z-10">
          {/* Premium Glass Badge */}
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-neutral-300 border border-white/[0.12] rounded-full px-3 py-1.5 mb-5 bg-white/[0.03] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/[0.06] cursor-default">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
            Why WeKraft
          </div>

          {/* Main Headline (Ultra-Premium Typography) */}
          <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-[3.25rem] font-bold tracking-tighter mb-4 leading-[1.1]">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/40">
              Unify your workflow.
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-400 via-neutral-500 to-neutral-700">
              Ship software faster.
            </span>
          </h1>

          {/* Description */}
          <p className="text-neutral-400 text-sm md:text-base lg:text-[16px] max-w-[95%] leading-relaxed mb-6 font-medium">
            WeKraft is a unified project management platform that connects your tasks, sprints, and issues directly to your workflow. Keep your team aligned and ship software faster without the endless context switching.
          </p>

          {/* Premium Solid White CTA Button */}
          <div className="mb-0">
            <Link 
              href="/auth" 
              className="text-black bg-white hover:bg-neutral-100 transition-all inline-flex items-center justify-center gap-1.5 font-semibold px-6 py-2.5 text-sm rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] ring-1 ring-white/50 hover:ring-white hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
            >
              Get started for free <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>

        {/* Right Column: Visual */}
        <div className="hero-visual flex-[1.1] w-full relative flex items-center justify-center md:justify-end pr-8 md:pr-12 lg:pr-14 py-8 md:py-12 lg:py-14 pl-8 md:pl-0 mt-4 md:mt-0">
          <div className="relative w-full rounded-xl overflow-hidden border border-white/[0.08] ring-1 ring-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-[#0a0a0a] group flex">
            <img 
              src="/workspace.png" 
              alt="WeKraft Workspace" 
              className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
}
