"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface FAQItem {
  question: string;
  answer: string;
}

interface CompareFAQProps {
  competitorName: string;
  faqs: FAQItem[];
}

export default function CompareFAQ({ competitorName, faqs }: CompareFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-16 border-t border-white/[0.05] relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-neutral-400 text-sm">
          Everything you need to know about switching from {competitorName} to WeKraft.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-white/[0.06] bg-neutral-950/20 rounded-xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left text-white font-medium hover:bg-white/[0.01] transition-all"
              >
                <span className="text-sm font-semibold pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-300",
                    isOpen && "rotate-180 text-white"
                  )}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="p-5 pt-0 text-xs text-neutral-400 leading-relaxed font-normal border-t border-white/[0.04] bg-white/[0.005]">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
