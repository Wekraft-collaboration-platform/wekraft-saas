"use client";

import { motion, useInView } from "framer-motion";
import { GitGraph, Headphones, MessageSquare, Video } from "lucide-react";
import Image from "next/image";
import type React from "react";
import { useRef } from "react";

/* ─── Card Data ──────────────────────────────────────────────────── */

interface FeatureCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

const cards: FeatureCard[] = [
  {
    icon: <Video className="w-5 h-5" />,
    title: "Team Meet",
    description:
      "Instant video huddles built right into your workspace. No links, no apps — just click and talk.",
    image: "/meet.png",
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "Customer Desk",
    description:
      "A lightweight support desk with tickets, priorities, and SLA tracking — all inside WeKraft.",
    image: "/customer.png",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Teamspace",
    description:
      "Real-time channels, threads, and DMs — a Discord-style hub that lives where your work does.",
    image: "/team-chat.png",
  },
];

/* ─── Main Component ─────────────────────────────────────────────── */

const BeyondCode = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(sectionRef, {
    once: true,
    margin: "-60px 0px",
  });
  const cardsInView = useInView(cardsRef, { once: true, margin: "-80px 0px" });

  return (
    <section className="bg-black py-20  px-6 md:px-12 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <motion.div
          ref={sectionRef}
          className="text-center mb-14 md:mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-neutral-900/50 backdrop-blur-sm mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <span className="text-[13px] font-medium text-white tracking-wide">
              Beyond Project Management
            </span>
          </div>

          <div className="font-semibold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4 leading-[1.1] max-w-4xl mx-auto">
            <h2 className="text-white">Your entire team workflow.</h2>
            <h2 className="text-neutral-400 mt-1">One connected space.</h2>
          </div>

          <p className="text-neutral-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            From daily standups to customer support — every tool your team
            needs, already built in.
          </p>
        </motion.div>

        {/* ── Cards Grid ── */}
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Row: 3 Cards */}
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              animate={
                cardsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }
              }
              transition={{
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.08 * i,
              }}
              className="group relative rounded-xl border border-white/[0.08] bg-[#121316]/90 overflow-hidden flex flex-col justify-between h-[420px] sm:h-[380px] lg:h-[460px] hover:border-white/[0.15] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
            >
              {/* Text Content */}
              <div className="relative z-10 p-6 md:p-8">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5 bg-[#1a1b1e] border border-white/[0.06] text-neutral-400 transition-colors">
                  {card.icon}
                </div>
                <h3 className="text-white font-medium text-lg tracking-tight mb-2">
                  {card.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed max-w-[90%]">
                  {card.description}
                </p>
              </div>

              {/* Image Container: bottom-right zoomed & half-cut */}
              <div className="absolute bottom-0 right-0 w-[82%] h-[46%] sm:h-[54%] lg:h-[56%] rounded-tl-xl border-t border-l border-white/[0.08] overflow-hidden bg-neutral-950">
                <div className="relative w-full h-full">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover object-top-left scale-[1.08] origin-top-left transition-transform duration-500 group-hover:scale-[1.12]"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                  />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Bottom Row: 1 Full-Col-Span Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{
              duration: 0.7,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.24,
            }}
            className="group lg:col-span-3 relative rounded-xl border border-white/[0.08] bg-[#121316]/90 overflow-hidden flex flex-col justify-between md:justify-center h-[380px] md:h-[300px] lg:h-[360px] p-6 md:p-8 lg:p-10 hover:border-white/[0.15] transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
          >
            {/* Text Content */}
            <div className="max-w-full md:max-w-[45%] relative z-10">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-5 bg-[#1a1b1e] border border-white/[0.06] text-neutral-400 transition-colors">
                <GitGraph className="w-5 h-5" />
              </div>
              <h3 className="text-white font-medium text-lg tracking-tight mb-2">
                Repo Heatmaps
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Visualize commit activity, hotspots, and contributor load across
                your entire codebase at a glance.
              </p>
            </div>

            {/* Image Container: bottom-right zoomed & half-cut */}
            <div className="absolute bottom-0 right-0 w-[80%] h-[45%] md:w-[50%] md:h-[90%] rounded-tl-xl border-t border-l border-white/[0.08] overflow-hidden bg-neutral-950">
              <div className="relative w-full h-full">
                <Image
                  src="/heat.png"
                  alt="Repo Heatmaps"
                  fill
                  className="object-cover object-left-top scale-[1.08] origin-top-left transition-transform duration-500 group-hover:scale-[1.12]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BeyondCode;
