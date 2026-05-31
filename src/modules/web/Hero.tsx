"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Megaphone, PlaneTakeoff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FlipText } from "@/components/ui/flip-text";
import { Spotlight } from "@/components/ui/spotlight";

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
  const [_email, _setEmail] = useState("");
  const [_loading, _setLoading] = useState(false);

  // ── Floating Cursor ──────────────────────────────────────────────
  const FloatingCursor = ({
    name,
    color,
    initialX,
    initialY,
    isLeft = false,
  }: {
    name: string;
    color: string;
    initialX: string;
    initialY: string;
    isLeft?: boolean;
  }) => {
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const posRef = React.useRef(pos);
    posRef.current = pos;

    const [transitionSettings, setTransitionSettings] = useState<{
      type: "spring";
      stiffness: number;
      damping: number;
      mass: number;
    }>({
      type: "spring",
      stiffness: 60,
      damping: 18,
      mass: 0.6,
    });

    useEffect(() => {
      let timeoutId: NodeJS.Timeout;

      const move = () => {
        // Determine type of movement:
        // 70% chance of a medium/large movement, 30% chance of a small micro-movement/wiggle
        const isMicro = Math.random() < 0.3;

        let newX = 0;
        let newY = 0;
        let nextDelay = 0;

        if (isMicro) {
          // Small wiggle/read adjustment
          newX = posRef.current.x + (Math.random() - 0.5) * 45;
          newY = posRef.current.y + (Math.random() - 0.5) * 25;

          setTransitionSettings({
            type: "spring",
            stiffness: 85,
            damping: 14,
            mass: 0.4,
          });
          nextDelay = 800 + Math.random() * 1200; // Stay/wiggle for 0.8 - 2s
        } else {
          // Larger movement
          const maxW = 380;
          const maxH = 140;

          newX = (Math.random() - 0.5) * maxW;
          newY = (Math.random() - 0.5) * maxH;

          // Randomize speed/stiffness for the spring
          const speedMode = Math.random();
          if (speedMode < 0.3) {
            // Fast flick/jump
            setTransitionSettings({
              type: "spring",
              stiffness: 110,
              damping: 16,
              mass: 0.5,
            });
            nextDelay = 1200 + Math.random() * 1000;
          } else if (speedMode < 0.75) {
            // Normal human movement
            setTransitionSettings({
              type: "spring",
              stiffness: 55,
              damping: 18,
              mass: 0.7,
            });
            nextDelay = 2200 + Math.random() * 1800;
          } else {
            // Slow drag/glide
            setTransitionSettings({
              type: "spring",
              stiffness: 22,
              damping: 12,
              mass: 0.9,
            });
            nextDelay = 3500 + Math.random() * 2000;
          }
        }

        // Boundaries to prevent going too far off
        // (especially preventing left cursors from going too far left, and right cursors too far right)
        if (isLeft) {
          newX = Math.max(-60, Math.min(320, newX));
        } else {
          newX = Math.max(-320, Math.min(60, newX));
        }
        // General vertical bounds to keep it near the heading text
        newY = Math.max(-80, Math.min(80, newY));

        setPos({ x: newX, y: newY });
        timeoutId = setTimeout(move, nextDelay);
      };

      move();

      return () => clearTimeout(timeoutId);
    }, [isLeft]);

    return (
      <motion.div
        className="absolute z-50 pointer-events-none"
        style={{ top: initialY, left: initialX }}
        animate={{
          x: pos.x,
          y: pos.y,
        }}
        transition={transitionSettings}
      >
        <div className="relative">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={color}
            className={`drop-shadow-xl ${isLeft ? "scale-x-[-1]" : ""}`}
            role="img"
            aria-label="Cursor"
          >
            <path d="M3 2L21 12L13 14L11 22L3 2Z" />
          </svg>
          <div
            className="mt-1 px-2.5 py-1 text-[10px] font-medium rounded-md shadow-2xl text-white whitespace-nowrap"
            style={{ backgroundColor: color }}
          >
            {name}
          </div>
        </div>
      </motion.div>
    );
  };

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
        <div className="inline-flex items-center p-1 pr-4 border border-neutral-400/30 rounded-full cursor-pointer transition-colors duration-200 mb-18 bg-blue-500/5 hover:bg-blue-500/10">
          <div className="bg-blue-600 px-5 py-1 rounded-full flex items-center gap-1.5">
            <span className="text-[12px]">
              <Megaphone className="w-4 h-4 inline" />
            </span>
            <span className="text-sm font-medium text-white leading-none">
              Less Managing
            </span>
          </div>
          <span className="text-blue-50 text-sm font-medium ml-3">
            More Building <PlaneTakeoff className="w-4 h-4 inline ml-1" />
          </span>
        </div>

        <div className="flex flex-col items-center justify-center font-pop relative px-4">
          <h1 className="text-white font-sans tracking-tight text-[64px] font-semibold">
            Meet The Simplest Workspace
          </h1>
          <div className="flex items-center gap-3 text-white tracking-tight text-[64px] font-semibold">
            <h1 className="mr-2">for the most</h1>
            <FlipText className="" duration={3.5}>
              Complex Projects
            </FlipText>
          </div>

          <div className="hidden min-[600px]:block">
            <FloatingCursor
              name="Ritesh"
              color="#3b82f6"
              initialX="-5%"
              initialY="20%"
              isLeft={true}
            />
            <FloatingCursor
              name="Rox"
              color="#6366f1"
              initialX="100%"
              initialY="90%"
            />

            <FloatingCursor
              name="Sanjali"
              color="#06b6d4"
              initialX="-5%"
              initialY="90%"
              isLeft={true}
            />
          </div>
        </div>

        <div className="w-full text-center md:w-250  mx-auto relative mt-5 ">
          {/* Gradients */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-blue-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-blue-500 to-transparent h-px w-3/4" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-blue-500 to-transparent h-px w-1/4" />

          <p className="text-neutral-300 text-base md:text-[20px] max-w-3xl mx-auto mt-5 font-sans tracking-tight text-pretty text-center px-4">
            Project management shouldn’t slow teams down. Wekraft keeps
            everything simple, organized, and AI-assisted — so your team can
            focus on building.
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
                src="/hero-img-new.png"
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
                src="/hero-img-new.png"
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
