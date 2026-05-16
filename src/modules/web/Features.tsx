"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Wekraft - task creation and management",
    description:
      "Experience seamless task management with our intuitive interface. Create, assign, and track progress effortlessly.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
  },
  {
    title: "Issue opening and closing with import from GitHub",
    description:
      "Sync your workflow. Import GitHub issues directly and manage them alongside your local tasks for unified visibility.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "Closed look into what's happening with advance insights",
    description:
      "Data-driven decisions. Gain deep insights into team performance, bottleneck detection, and project velocity.",
    image:
      "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "Deadline tracking and project reports",
    description:
      "Stay ahead of schedule. Automated reports and smart tracking keep your team aligned with project milestones.",
    image:
      "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=2676&auto=format&fit=crop",
  },
  {
    title: "Team space for discussion / chats and polling",
    description:
      "Collaborate effectively. Built-in chat and polling systems ensure every team member's voice is heard.",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop",
  },
];

const STEP_DURATION = 5000; // 5 seconds per step

const Features = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / STEP_DURATION) * 100;

      if (newProgress >= 100) {
        setActiveStep((prev) => (prev + 1) % steps.length);
        setProgress(0);
        clearInterval(interval);
      } else {
        setProgress(newProgress);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [activeStep]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setProgress(0);
  };

  return (
    <section
      id="features"
      className="bg-black py-14 px-6 md:px-12 font-sans text-white overflow-hidden"
    >
      {/* badge */}
      <div className="flex items-center justify-center w-fit mx-auto gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 ">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-sm font-medium text-blue-400 ">
          Where productivity feels natural.
        </span>
      </div>

      <div className="max-w-7xl mx-auto border border-accent rounded-2xl p-14 relative mt-14 bg-linear-to-b from-black to-neutral-900">
        {/* Header Section - Positioned on the border */}
        <div className="absolute -top-5 left-0 right-0 flex justify-center">
          <h2 className="relative z-10 inline-block px-10 bg-black text-5xl font-bold text-center tracking-tight leading-[1.1]">
            <span className="text-white">Project management</span> <br />
            <span className="text-neutral-500 ">made beautifully simple.</span>
          </h2>
        </div>

        {/* Interactive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center mt-20">
          {/* Left Side: Steps List */}
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <div
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "relative p-5 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border border-transparent",
                    isActive
                      ? "bg-white/5 border-white/10"
                      : "hover:bg-white/[0.02]",
                  )}
                >
                  <h3
                    className={cn(
                      "text-lg font-semibold mb-1 transition-colors duration-300",
                      isActive ? "text-white" : "text-neutral-500",
                    )}
                  >
                    {step.title}
                  </h3>

                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-neutral-500 text-xs leading-relaxed mb-3">
                          {step.description}
                        </p>
                        {/* Progress Bar Container */}
                        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden rounded-b-xl">
                          <motion.div
                            className="h-full bg-blue-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Right Side: Image/Preview Area */}
          <div className="relative aspect-video lg:aspect-auto lg:h-[420px] w-full">
            <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="relative h-full w-full rounded-2xl border border-white/10 overflow-hidden bg-neutral-900 group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img
                    src={steps[activeStep].image}
                    alt={steps[activeStep].title}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-700"
                  />
                  {/* Overlay for better text readability and styling */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Decorative corners like the image */}
              <div className="absolute top-3 left-3 w-1.5 h-1.5 border-t border-l border-white" />
              <div className="absolute top-3 right-3 w-1.5 h-1.5 border-t border-r border-white" />
              <div className="absolute bottom-3 left-3 w-1.5 h-1.5 border-b border-l border-white" />
              <div className="absolute bottom-3 right-3 w-1.5 h-1.5 border-b border-r border-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
