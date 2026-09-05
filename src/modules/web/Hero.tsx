"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Code2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FlipText } from "@/components/ui/flip-text";
import { Spotlight } from "@/components/ui/spotlight";
import { InstallExtensionModal } from "./InstallExtensionModal";

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
  const [idePickerOpen, setIdePickerOpen] = useState(false);

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

  const CollaboratorOverlay = ({
    name,
    avatarUrl,
    color,
    borderColor = "border-blue-500",
    glowColor = "rgba(59, 130, 246, 0.4)",
    bubbleX,
    bubbleY,
    cursorX,
    cursorY,
    action,
    delay = 0,
  }: {
    name: string;
    avatarUrl: string;
    color: string;
    borderColor?: string;
    glowColor?: string;
    bubbleX: string;
    bubbleY: string;
    cursorX: string;
    cursorY: string;
    action: string;
    delay?: number;
  }) => {
    return (
      <>
        {/* Avatar & Bubble Container */}
        <motion.div
          className="absolute z-40 flex items-center gap-2 pointer-events-none"
          style={{ left: bubbleX, top: bubbleY }}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            delay: delay + 0.6,
            type: "spring",
            stiffness: 80,
            damping: 15,
          }}
        >
          <div
            className={`relative w-8 h-8 rounded-full overflow-hidden border-2 ${borderColor} shadow-lg shrink-0`}
            style={{ boxShadow: `0 0 12px ${glowColor}` }}
          >
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-black animate-pulse" />
          </div>
          <div className="bg-neutral-800 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col justify-center min-w-[125px] max-w-[180px]">
            <span
              className="font-semibold text-xs tracking-wide"
              style={{ color }}
            >
              {name}
            </span>
            <span className="text-neutral-300 text-base leading-tight mt-0.5">
              {action}
            </span>
          </div>
        </motion.div>

        {/* Cursor Container */}
        <motion.div
          className="absolute z-50 pointer-events-none"
          style={{ left: cursorX, top: cursorY }}
          initial={{ opacity: 0, x: 15, y: 15 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ delay, type: "spring", stiffness: 70, damping: 15 }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={color}
            className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          >
            <path
              d="M3 2L21 12L13 14L11 22L3 2Z"
              stroke="black"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-black relative overflow-hidden flex flex-col"
      style={{ position: "relative" }}
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
        {/* IDE Picker */}
        <div className="relative mb-18">
          <button
            onClick={() => setIdePickerOpen((v) => !v)}
            className="inline-flex items-center p-1 pr-4 border border-neutral-400/30 rounded-full cursor-pointer transition-colors duration-200 bg-blue-500/5 hover:bg-blue-500/10"
          >
            <div className="bg-blue-600 px-5 py-1 rounded-full flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white leading-none">
                Extension
              </span>
            </div>
            <span className="text-blue-50 text-xs font-medium ml-3 flex items-center gap-1">
              <span className="hidden sm:inline">
                Bring WeKraft to your IDE
              </span>
              <span className="inline sm:hidden">available!</span>
              <ArrowRight className="w-4 h-4 inline" />
            </span>
          </button>

          <InstallExtensionModal
            isOpen={idePickerOpen}
            onClose={() => setIdePickerOpen(false)}
            mode="dropdown"
          />
        </div>

        <div className="flex flex-col items-center justify-center font-pop relative px-4 text-center">
          <h1 className="text-white font-sans tracking-tight text-[30px] sm:text-[44px] md:text-[62px] font-semibold leading-tight max-w-4xl">
            <span className="hidden md:block">
              Your Project Lives in Github,
            </span>
            <span className="block md:hidden">
              Your Project Lives in
              <br />
              Github, so should
            </span>
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-white tracking-tight text-[30px] sm:text-[44px] md:text-[62px] font-semibold leading-tight mt-1 md:mt-2">
            <span className="hidden md:inline">so should your </span>
            <span className="inline md:hidden">your {""}</span>
            <FlipText className="md:ml-2" duration={3.5}>
              Workspace.
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

            {/* <FloatingCursor
              name="Sanjali"
              color="#06b6d4"
              initialX="-5%"
              initialY="90%"
              isLeft={true}
            /> */}
          </div>
        </div>

        <div className="w-full text-center md:w-250  mx-auto relative mt-5 ">
          {/* Gradients */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-blue-500 to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-blue-500 to-transparent h-px w-3/4" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-linear-to-r from-transparent via-blue-500 to-transparent h-px w-1/4" />

          <p className="text-neutral-300 text-base md:text-[20px] max-w-3xl mx-auto mt-5 font-sans tracking-tight text-pretty text-center px-4">
            AI-first project management for software teams — synced with GitHub,
            powered by automation, built for shipping, Not for Chaos
          </p>
        </div>

        {/* CTA  */}
        <div className="flex flex-row items-center gap-3 sm:gap-4 mt-20">
          <Link href={"/auth"}>
            <Button className="rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-10 py-3 text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
              Try for Free
            </Button>
          </Link>
          <a
            href="https://youtu.be/31xHoT9QJP0"
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline"
            id="hero-get-demo"
          >
            <Button
              variant="outline"
              className="rounded-md border-white/10 bg-white/5 text-white px-4 sm:px-10 py-3 text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Get a demo</span>
              <span className="inline sm:hidden">Get demo</span>
            </Button>
          </a>
        </div>

        <p className="mt-6 text-sm font-medium text-white/60 tracking-tight">
          Built for <span className="text-white font-semibold">developers</span>{" "}
          · loved by{" "}
          <span className="text-white font-semibold">product managers</span>
        </p>
        <p className="mt-2 text-neutral-500 text-xs font-medium flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          No credit card required • Start shipping today
        </p>
        <div
          className="hidden md:block mt-14 w-full max-w-[85%] mx-auto"
          style={{ perspective: "1200px" }}
        >
          <motion.div
            style={{
              rotateX,
              scale,
              y,
              opacity: rawOpacity,
              transformStyle: "preserve-3d",
            }}
            className="relative will-change-transform"
          >
            {/* Top edge glow */}
            <div className="absolute -inset-x-4 -top-4 h-8 bg-blue-500/25 blur-2xl rounded-full pointer-events-none" />
            {/* Border frame */}
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.08)]">
              <Image
                src="/hero.png"
                alt="Hero Image"
                className="w-full h-auto block"
                width="1920"
                height="1080"
                priority
                quality={85}
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>

            {/* Collaborator Overlays (Curvy SVG Arrows & Collaborator Info) */}
            <div
              className="absolute inset-0 pointer-events-none select-none z-30 overflow-hidden"
              style={{ transform: "translateZ(20px)" }}
            >
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none select-none z-30"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  <marker
                    id="arrow-purple"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#C084FC" />
                  </marker>
                  <marker
                    id="arrow-blue"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3B82F6" />
                  </marker>
                  <marker
                    id="arrow-white"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FFFFFF" />
                  </marker>
                </defs>

                {/* Bhanu Arrow */}
                <motion.path
                  d="M 63.5 14.5 C 63.5 20, 68 23, 73 23"
                  fill="none"
                  stroke="#C084FC"
                  strokeWidth="0.28"
                  strokeDasharray="1 1"
                  strokeLinecap="round"
                  markerEnd="url(#arrow-purple)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                />

                {/* Ritesh Arrow */}
                <motion.path
                  d="M 84 38 C 88 38, 90.5 31, 90.5 24"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="0.28"
                  strokeDasharray="1 1"
                  strokeLinecap="round"
                  markerEnd="url(#arrow-blue)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                />

                {/* Rox Arrow */}
                <motion.path
                  d="M 48 61.5 C 43 61.5, 41 57, 41.5 52.5"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="0.28"
                  strokeDasharray="1 1"
                  strokeLinecap="round"
                  markerEnd="url(#arrow-white)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
                />
              </svg>

              {/* Bhanu (Purple Arrow): Hovering "View Breakdown" */}
              <CollaboratorOverlay
                name="Bhanu"
                avatarUrl="/bhanudp1.jpg"
                color="#C084FC"
                borderColor="border-purple-400"
                glowColor="rgba(192, 132, 252, 0.4)"
                bubbleX="59%"
                bubbleY="8%"
                cursorX="73.5%"
                cursorY="23.5%"
                action="checking project status"
                delay={0.2}
              />

              {/* Ritesh (Blue Arrow): Hovering "+ New Task" */}
              <CollaboratorOverlay
                name="Ritesh"
                avatarUrl="/riteshdp2.jpg"
                color="#3B82F6"
                borderColor="border-blue-500"
                glowColor="rgba(59, 130, 246, 0.4)"
                bubbleX="80%"
                bubbleY="38%"
                cursorX="90.5%"
                cursorY="23.5%"
                action="creating Stripe task"
                delay={0.6}
              />

              {/* Rox (White Arrow): Hovering "Reviewing" status on Payment Gateway */}
              <CollaboratorOverlay
                name="Rox"
                avatarUrl="/roxdp.jpg"
                color="#FFFFFF"
                borderColor="border-white"
                glowColor="rgba(255, 255, 255, 0.4)"
                bubbleX="48%"
                bubbleY="60%"
                cursorX="41.5%"
                cursorY="51.5%"
                action="reviewing payment module"
                delay={1.0}
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
                src="/hero.png"
                alt="Hero Image"
                className="w-full h-auto block"
                width={1920}
                height={1080}
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
