"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  SearchAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { STEPS, SOURCES, PURPOSES } from "./StaticContent";

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 20 : -20,
    opacity: 0,
  }),
};

export function MultiStepOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);

  // Form State
  const [hearAboutUs, setHearAboutUs] = useState("");
  const [purposes, setPurposes] = useState<string[]>([]);

  const handleNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const togglePurpose = (id: string) => {
    setPurposes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const isStep2 = currentStep === 2;

  return (
    <div className="dark flex flex-col items-center justify-center h-screen p-4 md:p-8 relative text-foreground">
      <Image
        src="/bg-footer.jpg"
        alt="bg-image"
        fill
        className="absolute w-full h-full object-cover opacity-30"
        priority
      />

      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-blue-500/45 blur-[200px] rounded-full pointer-events-none opacity-50" />

      {/* Progress Header */}
      <div className="flex items-center gap-3 mb-14">
        {STEPS.map((step) => (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border text-sm transition-all duration-300",
                currentStep >= step.id
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-muted-foreground border-white/40",
              )}
            >
              {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
            </div>
            {step.id < 5 && (
              <div
                className={cn(
                  "w-8 h-[1px] transition-colors duration-300",
                  currentStep > step.id ? "bg-white" : "bg-white/40",
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* BODY  */}
      <main className="w-full max-w-2xl bg-linear-to-b from-neutral-100/40 to-transparent rounded-2xl overflow-hidden font-sans">
        <div className="p-5">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {/* ── STEP 1 : Where did you hear about us ── */}
              {currentStep === 1 && (
                <div className="space-y-5 relative">
                  <div className="text-center space-y-2 mb-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-white flex items-center justify-center gap-2">
                      Where did you hear about us?
                      <SearchAlert className="w-5 h-5 text-white/60" />
                    </h2>
                    <p className="text-white/50 text-sm">
                      Select the channel that brought you here
                    </p>
                  </div>

                  <div className="grid grid-cols-4 gap-5">
                    {SOURCES.map((source) => { 
                      const selected = hearAboutUs === source.id;
                      return (
                        <button
                          key={source.id}
                          onClick={() => setHearAboutUs(source.id)}
                          className={cn(
                            "relative flex flex-col items-center justify-center gap-2 py-3.5 px-2 rounded-xl border transition-all duration-150 group overflow-hidden",
                            selected
                              ? "bg-white text-black border-white shadow-[0_0_18px_rgba(255,255,255,0.25)]"
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white/60 hover:text-white",
                          )}
                        >
                          {selected && (
                            <motion.div
                              layoutId="source-glow"
                              className="absolute inset-0 bg-white/10 blur-lg pointer-events-none"
                            />
                          )}

                          <div
                            className={cn(
                              "p-3 rounded-lg transition-all duration-200",
                              selected
                                ? "bg-black/10"
                                : "bg-white/5 group-hover:scale-110",
                            )}
                          >
                            <source.icon
                              className={cn(
                                "w-5 h-5",
                                selected ? "text-black" : "text-white/70",
                              )}
                            />
                          </div>

                          <span className="text-sm font-medium tracking-wide leading-tight">
                            {source.label}
                          </span>

                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-1.5 right-1.5"
                            >
                              <div className="bg-blue-500 rounded-full p-1 border border-white/20">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── STEP 2 : Purpose ── */}
              {currentStep === 2 && (
                <div className="space-y-5 relative">
                  <div className="text-center space-y-2 mb-5">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                      What brings you to WeKraft?
                    </h2>
                    <p className="text-white/70 text-sm">
                      Pick one or more — helps us tailor your experience
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {PURPOSES.map((p) => {
                      const selected = purposes.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          onClick={() => togglePurpose(p.id)}
                          className={cn(
                            "relative flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 group overflow-hidden",
                            selected
                              ? `bg-gradient-to-br ${p.color} ${p.border} shadow-[0_0_20px_rgba(255,255,255,0.06)]`
                              : "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20",
                          )}
                        >
                          {/* Icon bubble */}
                          <div
                            className={cn(
                              "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200",
                              selected
                                ? `${p.glow} border ${p.border}`
                                : "bg-white/5 border-white/10 group-hover:scale-105",
                            )}
                          >
                            <p.icon
                              className={cn(
                                "w-4 h-4",
                                selected ? p.accent : "text-white/50",
                              )}
                            />
                          </div>

                          {/* Text */}
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "text-sm font-semibold leading-tight",
                                selected ? "text-white" : "text-white/70",
                              )}
                            >
                              {p.label}
                            </p>
                            <p
                              className={cn(
                                "text-xs mt-0.5 leading-snug",
                                selected ? "text-white/60" : "text-white/35",
                              )}
                            >
                              {p.description}
                            </p>
                          </div>

                          {/* Check badge */}
                          {selected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute top-2 right-2"
                            >
                              <div
                                className={cn(
                                  "rounded-full p-0.5 border",
                                  p.border,
                                  p.glow,
                                )}
                              >
                                <Check
                                  className={cn("w-2.5 h-2.5", p.accent)}
                                />
                              </div>
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Action Footer */}
          <div className="flex items-center justify-between mt-10 pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="text-muted-foreground hover:text-white disabled:opacity-30 transition-all z-10 text-xs h-8 px-3"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Back
            </Button>

            <div className="flex items-center gap-5">
              {isStep2 && (
                <Button
                  variant="outline"
                  onClick={handleNext}
                  className="text-white/70 hover:text-white text-sm h-8 px-5 transition-all z-10"
                >
                  Skip <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="bg-white/90 text-xs text-black hover:bg-white font-medium px-6 h-8 transition-all active:scale-95 z-10 cursor-pointer rounded-lg"
              >
                {isStep2 && purposes.length > 0
                  ? `Continue (${purposes.length})`
                  : "Continue"}
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Background Decorative Element */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-black/30 blur-[120px] pointer-events-none" />
    </div>
  );
}
