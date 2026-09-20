"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useKayaStore } from "@/store/useKayaStore";

const HIDE_DURATION = 1000 * 60 * 60 * 1; // 1 hour

export const FloatingKaya = () => {
  const pathname = usePathname();
  const setIsKayaOpen = useKayaStore((s) => s.setIsOpen);

  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkVisibility();
  }, [pathname]);

  const checkVisibility = () => {
    const isInWorkspace = pathname.includes(`/workspace`);

    if (!isInWorkspace) {
      setIsVisible(false);
      return;
    }

    const hiddenUntil = localStorage.getItem("kaya_floating_hidden_until");
    if (hiddenUntil) {
      if (Date.now() < parseInt(hiddenUntil)) {
        setIsVisible(false);
        return;
      }
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
    setIsKayaOpen(true);
  };

  if (!isMounted || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 20 }}
        className="fixed bottom-6 right-6 z-[9999] group pointer-events-auto"
      >
        {/* Hide for 1 hour button */}
        <button
          onClick={handleHide}
          className="absolute -top-2 -right-2 bg-background/90 backdrop-blur-md border border-border text-muted-foreground hover:text-foreground rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110"
          title="Hide for 1 hour"
        >
          <X className="w-3 h-3" />
        </button>

        {/* Main Floating Trigger Button */}
        <button
          onClick={handleClick}
          className={cn(
            "relative flex items-center gap-2.5 pl-2.5 pr-3 py-2 rounded-full",
            "bg-neutral-900/90 dark:bg-neutral-950/90 backdrop-blur-xl",
            "border border-white/10 hover:border-primary/40",
            "shadow-lg shadow-black/40 hover:shadow-primary/20",
            "hover:scale-[1.03] active:scale-[0.98] transition-all duration-300",
            "cursor-pointer select-none",
          )}
        >
          {/* Logo container */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src="/kaya.svg"
                alt="Kaya AI"
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-25 pointer-events-none" />
          </div>

          {/* Text */}
          <span className="text-xs font-semibold text-neutral-100 tracking-tight">
            Kaya Agent
          </span>

          {/* Icon to Open */}
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/5 border border-white/10 text-neutral-400 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200 ml-0.5">
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
