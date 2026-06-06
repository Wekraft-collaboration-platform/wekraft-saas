"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import React, { useRef, useEffect } from "react";

interface FeatureBlock {
  tag: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  imagePosition: "left" | "right";
}

const features: FeatureBlock[] = [
  {
    tag: "Time Tracking",
    title: "Predict delivery before deadlines hit.",
    description:
      "Accurately track time spent on every task and get AI-powered predictions for project delivery. No more guesswork — know exactly when your sprint will ship, and catch delays before they snowball.",
    image: "/time.png",
    imageAlt: "WeKraft time tracking and delivery prediction dashboard",
    imagePosition: "right",
  },
  {
    tag: "Task Management",
    title: "The simplest workspace you'll ever use.",
    description:
      "Create tasks linked directly to your codebase. Switch between List, Table, and Kanban views in a click. Everything lives where your code does — no context-switching, no friction.",
    image: "/task.png",
    imageAlt: "WeKraft task management with multiple views",
    imagePosition: "left",
  },
  {
    tag: "Issue Sync",
    title: "GitHub issues, managed your way.",
    description:
      "Import issues directly from GitHub and organize them in a beautiful Kanban board. Bi-directional sync keeps everything in harmony — update here, see it there. Zero manual overhead.",
    image: "/issues.png",
    imageAlt: "WeKraft GitHub issue import and Kanban management",
    imagePosition: "right",
  },
  {
    tag: "Insights",
    title: "Know what's coming before your team does.",
    description:
      "Team workload breakdown, velocity charts, sprint speed analysis, and predictive insights that surface risks before you even think to check. Data-driven decisions, made effortless.",
    image: "/ins.png",
    imageAlt: "WeKraft advanced team insights and analytics dashboard",
    imagePosition: "left",
  },
  {
    tag: "Extension",
    title: "Bring work directly to your IDE.",
    description:
      "Sync your workspace directly with your editor. View tasks, comments, and project status within your development environment for a seamless coding workflow.",
    image: "/exten.jpeg",
    imageAlt: "WeKraft IDE extension and developer workspace integration",
    imagePosition: "right",
  },
];

const FeatureRow = ({ feature, index }: { feature: FeatureBlock; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" });

  const isImageRight = feature.imagePosition === "right";

  return (
    <div
      ref={ref}
      className={`grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16 items-center py-20 ${index !== features.length - 1 ? "border-b border-white/[0.06]" : ""
        }`}
    >
      {/* Text Block */}
      <motion.div
        className={`flex flex-col gap-5 lg:col-span-2 ${isImageRight ? "lg:order-1" : "lg:order-2"}`}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
      >
        {/* Tag pill */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/15! bg-muted backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <span className="text-[13px] font-medium text-white tracking-wide">
              {feature.tag}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-semibold text-white tracking-tight leading-[1.2]">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="text-neutral-400 text-sm md:text-base leading-relaxed max-w-md">
          {feature.description}
        </p>

        {/* CTA Link */}
        <div className="mt-2">
          <a
            href="#"
            className="inline-flex items-center gap-2 text-blue-400 text-sm font-medium group/link hover:text-blue-300 transition-colors duration-200"
          >
            Learn more
            <svg
              className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </motion.div>

      {/* Image Block */}
      <motion.div
        className={`relative lg:col-span-3 ${isImageRight ? "lg:order-2" : "lg:order-1"}`}
        initial={{
          opacity: 0,
          x: isImageRight ? 120 : -120,
        }}
        animate={
          isInView
            ? { opacity: 1, x: 0 }
            : { opacity: 0, x: isImageRight ? 120 : -120 }
        }
        transition={{
          duration: 1,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.3,
        }}
      >

        <div className="absolute -inset-x-4 -top-4 bottom-1/4 bg-linear-to-b from-neutral-800/90 to-transparent rounded-t-2xl blur-2xl pointer-events-none" />


        <div
          className="relative rounded-xl overflow-hidden border border-white/10 shadow-[0_8px_60px_rgba(0,0,0,0.5)] group"
          style={{
            maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          }}
        >
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

          <Image
            src={feature.image}
            alt={feature.imageAlt}
            width={1200}
            height={750}
            className="w-full h-auto block"
            quality={90}
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>
      </motion.div>
    </div>
  );
};

const WhyWeKraft = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(sectionRef, { once: true, margin: "-60px 0px" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("scroll") === "features") {
      const timer = setTimeout(() => {
        const element = document.getElementById("features");
        if (element) {
          // Immediately scroll to top so we animate down from y=0
          window.scrollTo(0, 0);

          const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 90;
          const startPosition = 0;
          const distance = targetPosition;
          const duration = 1200; // Slower duration (1.2 seconds)
          let start: number | null = null;

          const step = (timestamp: number) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);

            // Easing function (easeInOutCubic)
            const easing = percentage < 0.5
              ? 4 * percentage * percentage * percentage
              : 1 - Math.pow(-2 * percentage + 2, 3) / 2;

            window.scrollTo(0, startPosition + distance * easing);

            if (progress < duration) {
              window.requestAnimationFrame(step);
            }
          };

          window.requestAnimationFrame(step);
        }
        // Clean up URL query parameter
        window.history.replaceState(null, "", window.location.pathname);
      }, 400); // 400ms delay to let the page mount
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <section id="features" className="bg-black py-20 md:py-32 px-6 md:px-12 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={sectionRef}
          className="text-center mb-8 md:mb-16"
          initial={{ opacity: 0, y: 24 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >

          <div className=" font-semibold text-3xl sm:text-4xl md:text-5xl tracking-tight mb-4 leading-[1.1]! max-w-4xl mx-auto">
            <h2 className="text-white">Built for speed.</h2>
            <h2 className="text-neutral-400  mt-1">
              Designed for simplicity.
            </h2>
          </div>

          <p className="text-neutral-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to plan, track, and ship — in one workspace that actually feels good.
          </p>
        </motion.div>

        {/* Feature Rows */}
        {features.map((feature, index) => (
          <FeatureRow key={index} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
};

export default WhyWeKraft;
