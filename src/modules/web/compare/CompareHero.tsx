"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

interface CompareHeroProps {
  competitorName: string;
  competitorLogo: React.ReactNode;
  competitorColor: string; // e.g., "from-[#FF5722] to-[#FF9800]"
  title1: string;
  title2: string;
  description: string;
  visualMockup: React.ReactNode;
}

export default function CompareHero({
  competitorName,
  competitorLogo,
  competitorColor,
  title1,
  title2,
  description,
  visualMockup,
}: CompareHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animate content items
    gsap.from(".hero-content > *", {
      y: 24,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
      ease: "power3.out",
    });

    // Animate visual mockup side
    gsap.from(".hero-visual-side", {
      x: 40,
      opacity: 0,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
    });
  }, { scope: containerRef });

  return (
    <div className="w-full max-w-7xl mx-auto pt-8 pb-12 px-4 md:px-8 relative z-20" ref={containerRef}>


      <div className="relative border border-white/[0.08] bg-gradient-to-br from-white/[0.02] to-transparent rounded-[2.5rem] flex flex-col lg:flex-row items-center shadow-[0_24px_80px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] overflow-hidden backdrop-blur-2xl">
        {/* Left Content Column */}
        <div className="hero-content flex flex-col items-center lg:items-start text-center lg:text-left flex-[1] p-8 md:p-12 lg:p-16 relative z-10">
          
          {/* Badge comparing the tools */}
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-neutral-300 border border-white/[0.1] rounded-full px-3.5 py-1.5 mb-6 bg-white/[0.02] backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <span className="flex items-center justify-center shrink-0 w-4 h-4 text-white">
              <img src="/logo.svg" alt="WeKraft" className="w-3 h-3" />
            </span>
            <span className="text-neutral-500">vs</span>
            <span className="flex items-center gap-1">
              {competitorLogo}
              <span className="font-semibold text-white">{competitorName}</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight mb-4 leading-[1.1] text-white">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-neutral-400">
              {title1}
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-neutral-300 to-neutral-500">
              {title2}
            </span>
          </h1>

          {/* Description */}
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed mb-8 max-w-[540px]">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              href="/auth"
              className="w-full sm:w-auto text-black bg-white hover:bg-neutral-100 transition-all inline-flex items-center justify-center gap-2 font-semibold px-6 py-3 text-sm rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 duration-200"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/web/contact"
              className="w-full sm:w-auto text-white border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06] transition-all inline-flex items-center justify-center gap-2 font-medium px-6 py-3 text-sm rounded-full duration-200"
            >
              Help and support
            </Link>
          </div>
        </div>

        {/* Right Visual Column */}
        <div className="hero-visual-side flex-[1.2] w-full relative flex items-center justify-center lg:justify-end pr-8 lg:pr-12 pl-8 lg:pl-0 py-8 lg:py-12 mt-4 lg:mt-0">
          <div className="w-full relative shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center rounded-xl bg-transparent">
            {visualMockup}
          </div>
        </div>
      </div>
    </div>
  );
}
