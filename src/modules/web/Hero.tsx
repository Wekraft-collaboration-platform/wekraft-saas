"use client";
import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";
import Image from "next/image";
import { FlipText } from "@/components/ui/flip-text";
import { Button } from "@/components/ui/button";
import { Megaphone, PlaneTakeoff, Speaker } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const rawRotateX = useTransform(scrollYProgress, [0, 0.25], [14, 0]);
  const rawScale = useTransform(scrollYProgress, [0, 0.25], [0.88, 1]);
  const rawY = useTransform(scrollYProgress, [0, 0.25], [40, 0]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.08, 0.3], [0, 1, 1]);

  const rotateX = useSpring(rawRotateX, { stiffness: 80, damping: 20 });
  const scale = useSpring(rawScale, { stiffness: 80, damping: 20 });
  const y = useSpring(rawY, { stiffness: 80, damping: 20 });

  // ── Waitlist ──────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-black relative overflow-hidden flex flex-col"
    >
      <div className="hidden sm:block">
        <Spotlight
          className="-top-40 left-0 md:-top-20 md:left-60"
          fill="#C1C1C1"
        />
      </div>
      <div className="absolute inset-0 z-0">
        <Image
          src="/night-hero.png"
          alt="background"
          fill
          sizes="100vw"
          className="object-cover opacity-70 object-[center_80%]"
          priority
          quality={85}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-black/20 to-black/75" />
      </div>

      <main className="relative z-10 flex flex-col items-center pt-28 md:pt-40 pb-20 w-full">
        <div className="inline-flex items-center p-1 pr-4 border border-blue-500/30 rounded-full cursor-pointer transition-colors duration-200 mb-18 bg-blue-500/5 hover:bg-blue-500/10">
          <div className="bg-blue-600 px-5 py-1 rounded-full flex items-center gap-1.5">
            <span className="text-[12px]"><Megaphone className="w-4 h-4 inline"/></span>
            <span className="text-[11px] font-bold text-white uppercase tracking-wider leading-none">
              Announcement
            </span>
          </div>
          <span className="text-blue-200 text-sm font-medium ml-3">
            Introducing wekraft <PlaneTakeoff className="w-4 h-4 inline ml-1"/>
          </span>
        </div>

        <div className="flex flex-col  items-center justify-center font-pop relative px-4">
          <h1 className="text-white font-sans tracking-tight text-[64px] font-semibold">
            Meet Your AI-Native Platform
          </h1>
          <div className="flex items-center gap-3 text-white font-sans tracking-tight text-[64px] font-semibold">
            <h1 className="mr-2">for Teams</h1>
            <FlipText className="" duration={3.5}>
              Building the Future.
            </FlipText>
          </div>
        </div>

        <div className="w-full text-center md:w-250  mx-auto relative mt-5 ">
          {/* Gradients */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-blue-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-blue-500 to-transparent h-px w-3/4" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-blue-500 to-transparent h-px w-1/4" />

          <p className="text-neutral-300 text-base md:text-[20px] max-w-3xl mx-auto mt-5 font-sans tracking-tight text-pretty text-center px-4">
            Your AI-powered workspace for planning, tracking, and shipping
            products faster. From weekend builds to growing startups — keep
            every task, update, and deadline aligned.
          </p>
        </div>

        {/* CTA  */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-20">
          <Link href={"/auth"}>
            <Button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
              Try for Free
            </Button>
          </Link>
          <Button
            variant="outline"
            className="rounded-md border-white/10 bg-white/5 text-white  px-10 py-3 text-sm "
          >
            Book a demo
          </Button>
        </div>

        <p className="mt-5 text-neutral-400 text-sm font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          No credit card required • Start shipping today
        </p>
        <div
          className="hidden md:block mt-14 w-full max-w-[85%] mx-auto"
          style={{ perspective: "1200px" }}
        >
          <motion.div
            style={{ rotateX, scale, y, opacity: rawOpacity }}
            className="relative will-change-transform"
          >
            {/* Top edge glow */}
            <div className="absolute -inset-x-4 -top-4 h-8 bg-blue-500/25 blur-2xl rounded-full pointer-events-none" />
            {/* Border frame */}
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.08)]">
              <Image
                src="/hero-img-1.jpeg"
                alt="Hero Image"
                className="w-full h-auto block"
                width="1920"
                height="1080"
                priority
                quality={85}
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 md:h-80 bg-linear-to-t from-black via-black/50 to-transparent" />
          </motion.div>
        </div>

        {/* Mobile version */}
        <div className="block md:hidden mt-20 relative w-screen left-1/2 -translate-x-1/2 overflow-x-auto scrollbar-hide px-4">
          <div className="relative w-[180%] shrink-0">
            <div className="absolute -inset-x-4 -top-4 h-8 bg-blue-500/20 blur-2xl rounded-full pointer-events-none" />
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <Image
                src="/hero-img1.png"
                alt="Hero Image"
                className="w-full h-auto block"
                width={1920}
                height={1080}
                priority
                quality={85}
                sizes="(max-width: 768px) 100vw, 500px"
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black via-black/40 to-transparent" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hero;
