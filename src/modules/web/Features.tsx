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
      <div className="flex items-center justify-center w-fit mx-auto gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 backdrop-blur-md bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)] mb-14">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
        <span className="text-sm font-semibold text-blue-300 tracking-wide">
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
                    "relative p-5 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 border",
                    isActive
                      ? "bg-gradient-to-br from-white/10 to-white/5 border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                      : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/5",
                  )}
                >
                  <h3
                    className={cn(
                      "text-[17px] font-semibold mb-2 transition-colors duration-300",
                      isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300",
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
                        <p className="text-neutral-400 text-sm leading-relaxed mb-4 font-normal">
                          {step.description}
                        </p>
                        {/* Progress Bar Container */}
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5 overflow-hidden rounded-b-2xl">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
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
          <div className="relative aspect-video lg:aspect-auto lg:h-[500px] w-full mt-8 lg:mt-0">
            <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full pointer-events-none transition-opacity duration-700" />
            <div className="relative h-full w-full rounded-3xl border border-white/10 overflow-hidden bg-neutral-950 shadow-[0_0_50px_rgba(0,0,0,0.4)] group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0"
                >
                  <img
                    src={steps[activeStep].image}
                    alt={steps[activeStep].title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
                  />
                  {/* Overlay for better text readability and styling */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />
                </motion.div>
              </AnimatePresence>

              {/* Decorative corners like the image */}
              <div className="absolute top-4 left-4 w-2 h-2 border-t-2 border-l-2 border-white/50" />
              <div className="absolute top-4 right-4 w-2 h-2 border-t-2 border-r-2 border-white/50" />
              <div className="absolute bottom-4 left-4 w-2 h-2 border-b-2 border-l-2 border-white/50" />
              <div className="absolute bottom-4 right-4 w-2 h-2 border-b-2 border-r-2 border-white/50" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
