"use client";

import { SignUpButton } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Play, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { InstallExtensionModal } from "./InstallExtensionModal";

const ProjectOnSteroids = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [idePickerOpen, setIdePickerOpen] = useState(false);

  // Modal states for Get a Demo
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoName, setDemoName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoSize, setDemoSize] = useState("1-10");
  const [demoNote, setDemoNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim() || !demoEmail.trim()) {
      toast.error("Please enter both your name and email.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      toast.success("Request received! Our team will contact you shortly.");

      // Auto-close modal after success message animation
      setTimeout(() => {
        setIsDemoModalOpen(false);
        // Reset states
        setSubmitSuccess(false);
        setDemoName("");
        setDemoEmail("");
        setDemoNote("");
        setDemoSize("1-10");
      }, 2000);
    }, 1200);
  };

  return (
    <section className="relative overflow-hidden w-full pt-20 md:pt-32 pb-0 bg-gradient-to-b from-[#2A3DF4] via-[#60A5FA] to-black">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-16 mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl lg:text-[64px] font-bold leading-[1.1] max-w-[700px] tracking-tight text-white">
            Go-to platform for effortlessly managing engineering projects
          </h2>

          <div className="flex flex-col gap-6 lg:max-w-[450px] pt-2">
            <p className="text-lg md:text-xl text-blue-50/90 leading-relaxed font-medium">
              WeKraft makes it easy to build workflows, track issues, and ship
              software. Unify your entire development lifecycle in minutes, not
              months.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2">
              {isLoading ? (
                <button
                  type="button"
                  disabled
                  className="bg-white/80 text-blue-600 px-8 py-3.5 rounded-md opacity-65 cursor-not-allowed"
                >
                  Loading...
                </button>
              ) : isAuthenticated ? (
                <Link href="/dashboard">
                  <button
                    type="button"
                    className="bg-white text-blue-600  px-8 py-3.5 rounded-md hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </Link>
              ) : (
                <SignUpButton>
                  <button
                    type="button"
                    className="bg-white text-blue-600 px-8 py-3.5 rounded-md hover:bg-neutral-50 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
                  >
                    Try WeKraft for free
                  </button>
                </SignUpButton>
              )}

              <a
                href="https://youtu.be/31xHoT9QJP0"
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline"
                id="project-on-steroids-get-demo"
              >
                <button
                  type="button"
                  className="border border-white/40 text-white px-8 py-3.5 rounded-md hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all backdrop-blur-sm cursor-pointer"
                >
                  Get a demo
                </button>
              </a>

              <button
                type="button"
                onClick={() => setIdePickerOpen(true)}
                className="bg-blue-600 text-white px-8 py-3.5 rounded-md hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm cursor-pointer"
              >
                Download Extension
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Image with 3D Tilt */}
        <div
          className="relative w-full h-[400px] md:h-[550px] flex justify-center items-start mt-8 pointer-events-none"
          style={{ perspective: "2000px" }}
        >
          <div
            className="absolute top-0 w-[95%] md:w-[85%] max-w-[1100px]"
            style={{
              transform:
                "rotateX(15deg) rotateY(12deg) rotateZ(-4deg) translateX(5%) translateY(5%)",
              transformOrigin: "center top",
            }}
          >
            {/* === DEVICE BEZEL FRAME === */}
            <div
              className="relative rounded-[18px] md:rounded-[28px]"
              style={{
                padding: "10px 10px 14px 10px",
                background:
                  "linear-gradient(145deg, #e2e8f0 0%, #cbd5e1 25%, #b0bcc9 55%, #94a3b8 85%, #8493a6 100%)",
                boxShadow: `
                  0 1px 0 0 rgba(255,255,255,0.4),
                  inset 0 1px 3px rgba(255,255,255,0.5),
                  inset 0 -1px 3px rgba(0,0,0,0.15),
                  0 4px 8px rgba(0,0,0,0.15),
                  0 12px 30px rgba(0,0,0,0.25),
                  0 30px 60px -10px rgba(0,0,0,0.4),
                  0 50px 100px -20px rgba(0,0,0,0.3)
                `,
              }}
            >
              {/* Bezel top-edge highlight */}
              <div
                className="absolute inset-x-0 top-0 h-[1.5px] rounded-t-[18px] md:rounded-t-[28px] pointer-events-none z-20"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.8) 30%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.8) 70%, transparent 95%)",
                }}
              />

              {/* Bezel left-edge highlight */}
              <div
                className="absolute inset-y-0 left-0 w-[1px] rounded-l-[18px] md:rounded-l-[28px] pointer-events-none z-20"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 5%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.3) 70%, transparent 95%)",
                }}
              />

              {/* Inner edge shadow */}
              <div
                className="absolute pointer-events-none z-10 rounded-[10px] md:rounded-[20px]"
                style={{
                  inset: "8px 8px 12px 8px",
                  boxShadow: `
                    inset 0 2px 8px rgba(0,0,0,0.5),
                    inset 0 0 3px rgba(0,0,0,0.25),
                    inset 2px 0 4px rgba(0,0,0,0.15),
                    inset -2px 0 4px rgba(0,0,0,0.15)
                  `,
                }}
              />

              {/* === SCREEN AREA === */}
              <div className="relative rounded-[10px] md:rounded-[20px] overflow-hidden">
                <Image
                  src="/dash.png"
                  alt="WeKraft Dashboard"
                  width={1920}
                  height={1080}
                  className="w-full h-auto object-cover object-top block"
                  priority
                />

                {/* Glass reflection */}
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background:
                      "linear-gradient(155deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 20%, transparent 45%, transparent 65%, rgba(255,255,255,0.02) 100%)",
                  }}
                />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-auto z-20">
                  <button
                    type="button"
                    className="w-20 h-20 md:w-28 md:h-28 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 hover:scale-105 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.3)] group"
                    aria-label="Play video"
                  >
                    <Play
                      className="w-8 h-8 md:w-12 md:h-12 ml-2 text-white/90 group-hover:text-white transition-colors"
                      fill="currentColor"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Get a Demo Dialog */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setIsDemoModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-md bg-neutral-950 border border-white/[0.08] rounded-2xl p-6 md:p-8 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.06)] text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDemoModalOpen(false)}
                disabled={isSubmitting}
                className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors p-1"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>

              {submitSuccess ? (
                /* Success View */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white tracking-tight mb-2">
                    Request Submitted
                  </h3>
                  <p className="text-neutral-400 text-sm max-w-xs leading-relaxed">
                    Thank you, {demoName.split(" ")[0]}! We will email you at{" "}
                    <span className="text-neutral-300 font-medium">
                      {demoEmail}
                    </span>{" "}
                    to arrange a demo.
                  </p>
                </motion.div>
              ) : (
                /* Form View */
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-white tracking-tight">
                      Get a Demo
                    </h3>
                    <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                      Experience how WeKraft simplifies project management, time
                      tracking, and team channels.
                    </p>
                  </div>

                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="demo-name"
                        className="block text-neutral-300 text-xs font-semibold mb-1.5"
                      >
                        Full Name
                      </label>
                      <input
                        id="demo-name"
                        type="text"
                        required
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                        placeholder="Akash Gupta"
                        disabled={isSubmitting}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="demo-email"
                        className="block text-neutral-300 text-xs font-semibold mb-1.5"
                      >
                        Work Email
                      </label>
                      <input
                        id="demo-email"
                        type="email"
                        required
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        placeholder="akash@company.com"
                        disabled={isSubmitting}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="demo-size"
                          className="block text-neutral-300 text-xs font-semibold mb-1.5"
                        >
                          Team Size
                        </label>
                        <select
                          id="demo-size"
                          value={demoSize}
                          onChange={(e) => setDemoSize(e.target.value)}
                          disabled={isSubmitting}
                          className="w-full bg-neutral-900 border border-white/[0.08] rounded-xl px-3 py-2.5 text-neutral-300 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                        >
                          <option value="1-10">1 - 10 devs</option>
                          <option value="11-50">11 - 50 devs</option>
                          <option value="51-200">51 - 200 devs</option>
                          <option value="200+">200+ devs</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-end">
                        <span className="text-[10px] text-neutral-500 leading-normal pb-1">
                          Our support team will reach out within 24 hours.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="demo-note"
                        className="block text-neutral-300 text-xs font-semibold mb-1.5"
                      >
                        Tell us about your team (Optional)
                      </label>
                      <textarea
                        id="demo-note"
                        rows={2}
                        value={demoNote}
                        onChange={(e) => setDemoNote(e.target.value)}
                        placeholder="We switch from Jira/Slack..."
                        disabled={isSubmitting}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-blue-500/50 resize-none transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all duration-150 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        "Request Demo"
                      )}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <InstallExtensionModal
        isOpen={idePickerOpen}
        onClose={() => setIdePickerOpen(false)}
        mode="modal"
      />
    </section>
  );
};

export default ProjectOnSteroids;
