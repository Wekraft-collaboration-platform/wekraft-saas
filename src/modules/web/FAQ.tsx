"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Lock,
  FileText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const defaultFaqs: FAQItem[] = [
  {
    id: "security-measures",
    question: "What security measures protect our data privacy in WeKraft?",
    answer:
      "WeKraft employs multi-layered enterprise defense including Application-Level Encryption (ALE), End-to-End (E2E) Encryption, and granular access controls. Your data is encrypted both in transit (TLS 1.3) and at rest (AES-256), ensuring absolute data privacy for your code, tasks, and project history.",
  },
  {
    id: "ale-encryption",
    question:
      "How does Application-Level Encryption (ALE) protect sensitive data?",
    answer:
      "Application-Level Encryption (ALE) encrypts sensitive payload fields directly within the application before writing to persistent database storage. Cryptographic keys are isolated and rotated regularly, meaning even database snapshots remain completely unreadable without application keys.",
  },
  {
    id: "ete-e2e-privacy",
    question: "What is End-to-End (E2E / ETE) Encryption and how is it used?",
    answer:
      "End-to-End Encryption ensures that sensitive developer communications, secrets, and task attachments are encrypted on your local device before transmission. Only authorized workspace members hold the decryption keys — WeKraft servers only route the encrypted blobs, guaranteeing zero third-party visibility.",
  },
  {
    id: "audit-logs",
    question:
      "Are detailed Audit Logs available for tracking workspace actions?",
    answer:
      "Yes! WeKraft generates immutable, real-time audit logs for every key event across your workspace — including authentication attempts, permission changes, document exports, and settings updates. Admins can inspect, filter, and export full audit trails anytime for SOC 2, ISO 27001, and GDPR compliance.",
  },
  {
    id: "access-control",
    question: "Who can access our project data and developer workspaces?",
    answer:
      "Access is strictly limited by your organization's Role-Based Access Control (RBAC) policies. You can grant workspace members, contractors, or guest collaborators granular read/write permissions. WeKraft personnel have zero access to your workspace data.",
  },
  {
    id: "compliance-export",
    question: "Can we export audit logs and compliance data?",
    answer:
      "Absolutely. Organization administrators can export comprehensive audit logs in JSON or CSV format or stream logs directly to enterprise SIEM tools like Splunk, Datadog, or AWS CloudWatch for automated threat monitoring and regulatory reporting.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(1); // Default second item open

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative w-full bg-black py-20 md:py-28 px-6 md:px-12 font-sans overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header — Matching infraSection style perfectly */}
        <div className="text-center mb-16 px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-muted/10 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.1)] px-4 py-1.5 text-sm tracking-wide text-white"
          >
            <span className="size-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            Security & Privacy FAQ
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-b from-white via-white to-neutral-500 bg-clip-text text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-transparent leading-tight max-w-3xl mx-auto"
          >
            Frequently Asked Questions
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-neutral-400 max-w-2xl mx-auto"
          >
            Learn how WeKraft safeguards your workspace data with
            Application-Level Encryption (ALE), End-to-End Encryption (E2E), and
            immutable Audit Logs.
          </motion.p>
        </div>

        {/* Main Grid: Left Clean Dark Card + Right Compact FAQ Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Clean Dark Grey Security Banner */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:col-span-5 relative group"
          >
            <div className="h-full rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden bg-linear-to-br from-slate-800 via-black to-slate-800 border border-white/10 shadow-xl transition-all duration-300 hover:border-white/20">
              {/* Content */}
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/15 bg-white/[0.04] text-xs font-medium text-neutral-300 mb-6">
                    <span className="size-1.5 rounded-full bg-white" />
                    Data Protection First
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-tight">
                    Ready to Secure Your Data Privacy & Workspace?
                  </h3>

                  <p className="mt-3 text-neutral-400 text-xs sm:text-sm leading-relaxed">
                    Application-Level Encryption (ALE), End-to-End Encryption
                    (E2E), and tamper-proof Audit Logs built directly into your
                    collaborative workspace.
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 bg-neutral-900/60 px-3.5 py-2.5 rounded-xl border border-white/[0.08]">
                    <Lock className="w-4 h-4 text-neutral-300 shrink-0" />
                    <span className="text-xs sm:text-sm text-neutral-200 font-medium">
                      Application-Level Encryption (ALE)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-neutral-900/60 px-3.5 py-2.5 rounded-xl border border-white/[0.08]">
                    <ShieldCheck className="w-4 h-4 text-neutral-300 shrink-0" />
                    <span className="text-xs sm:text-sm text-neutral-200 font-medium">
                      End-to-End Data Encryption (E2E)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-neutral-900/60 px-3.5 py-2.5 rounded-xl border border-white/[0.08]">
                    <FileText className="w-4 h-4 text-neutral-300 shrink-0" />
                    <span className="text-xs sm:text-sm text-neutral-200 font-medium">
                      Immutable Real-time Audit Logs
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-1">
                  <a
                    href="/dashboard/audit-logs"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs sm:text-sm hover:bg-neutral-200 transition-colors duration-200 group/btn"
                  >
                    <span>View Audit Logs & Specs</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Compact Accordion List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="lg:col-span-7 flex flex-col justify-center space-y-5"
          >
            {defaultFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-white/15 bg-neutral-950/40 overflow-hidden transition-colors hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 text-left focus:outline-none group/btn cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-semibold text-white pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-4 sm:px-5 pb-3.5 pt-0 text-xs sm:text-sm text-neutral-400 leading-relaxed font-normal border-t border-white/[0.06] mt-1 pt-2.5 bg-white/[0.005]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
