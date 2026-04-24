"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const HIDE_DURATION = 1000 * 60 * 60 * 1; // 1 hour

export const FloatingKaya = () => {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkVisibility();
  }, [pathname]);

  const checkVisibility = () => {
    // 1. Check if inside workspace but not in AI
    const isInWorkspace = pathname.includes(`/workspace`);
    const isAiPage = pathname.includes(`/workspace/ai`);

    if (!isInWorkspace || isAiPage) {
      setIsVisible(false);
      return;
    }

    // 2. Check localStorage for hidden state
    const hiddenUntil = localStorage.getItem("kaya_floating_hidden_until");
    if (hiddenUntil) {
      if (Date.now() < parseInt(hiddenUntil)) {
        setIsVisible(false);
        return;
      }
      // If time passed, clean up
      localStorage.removeItem("kaya_floating_hidden_until");
    }

    setIsVisible(true);
  };

  const handleHide = (e: React.MouseEvent) => {
    e.stopPropagation();
    const until = Date.now() + HIDE_DURATION;
    localStorage.setItem("kaya_floating_hidden_until", until.toString());
    setIsVisible(false);
  };

  const handleClick = () => {
    router.push(`/dashboard/my-projects/${slug}/workspace/ai`);
  };

  if (!isMounted || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        className="fixed bottom-8 right-8 z-[100] group"
      >
        {/* X Button */}
        <button
          onClick={handleHide}
          className="absolute -top-2 -right-2 bg-background border border-border text-muted-foreground hover:text-foreground rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Hide for 2 hours"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Main Icon */}
        <button
          onClick={handleClick}
          className={cn(
            "relative w-12 h-12 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 flex items-center justify-center overflow-hidden shadow-xl hover:shadow-primary/20 hover:scale-110 transition-all duration-300",
            "after:absolute after:inset-0 after:bg-primary/5 after:opacity-0 hover:after:opacity-100 transition-opacity",
          )}
        >
          <div className="relative w-9 h-9">
            <Image
              src="/kaya.svg"
              alt="Kaya AI"
              fill
              className="object-contain"
            />
          </div>

          {/* Subtle pulse effect */}
          <div className="absolute inset-0 rounded-full animate-ping bg-primary/20 opacity-20 pointer-events-none" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
