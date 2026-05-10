"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const fullText =
  "Based on the latest sync, the team has completed 85% of the sprint. There are 4 high-priority backlogs in the 'Development' column. Would you like me to ping the owners for updates?";

const AIChatSimulation = () => {
  const [displayStep, setDisplayStep] = useState(0); // 0: User, 1: AI Thinking, 2: AI Typing, 3: Completed
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (displayStep === 0) {
      timeout = setTimeout(() => setDisplayStep(1), 1500);
    } else if (displayStep === 1) {
      timeout = setTimeout(() => setDisplayStep(2), 1200);
    } else if (displayStep === 2) {
      const words = fullText.split(" ");
      let currentWordIndex = 0;
      const interval = setInterval(() => {
        if (currentWordIndex < words.length) {
          setTypedText(words.slice(0, currentWordIndex + 1).join(" "));
          currentWordIndex++;
        } else {
          clearInterval(interval);
          setDisplayStep(3);
        }
      }, 60);
      return () => clearInterval(interval);
    } else if (displayStep === 3) {
      timeout = setTimeout(() => {
        setDisplayStep(0);
        setTypedText("");
      }, 4000);
    }

    return () => clearTimeout(timeout);
  }, [displayStep]);

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-6 font-sans">
      {/* User Message */}
      <AnimatePresence>
        {displayStep >= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex items-start gap-3 justify-end"
          >
            <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none text-sm shadow-lg max-w-[80%] leading-relaxed">
              Hey Kaya, what's the team status and current backlogs?
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex-shrink-0 overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                alt="User"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Message */}
      <AnimatePresence>
        {displayStep >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex items-start gap-3"
          >
            <Image
              src="/kaya.svg"
              alt="Kaya AI"
              width={20}
              height={20}
              className="w-7 h-7"
            />

            <div className="bg-neutral-900  border border-white/10 text-white p-4 rounded-2xl rounded-tl-none text-sm max-w-[85%] min-h-[60px] leading-relaxed relative overflow-hidden">
              {displayStep === 1 ? (
                <div className="flex gap-1.5 py-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                      className="w-1.5 h-1.5 bg-neutral-500 rounded-full"
                    />
                  ))}
                </div>
              ) : (
                <span className="text-neutral-200">
                  {typedText}
                  {displayStep === 2 && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="inline-block w-1.5 h-4 bg-blue-500 ml-1 translate-y-0.5"
                    />
                  )}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatSimulation;
