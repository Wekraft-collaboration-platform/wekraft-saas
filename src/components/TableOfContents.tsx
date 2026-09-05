"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Heading {
  level: number;
  text: string;
  id: string;
}

export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (totalHeight > 0) {
        setScrollProgress((scrollY / totalHeight) * 100);
      } else {
        setScrollProgress(0);
      }

      // Automatically highlight the last heading when scrolled to the very bottom of the page
      if (totalHeight > 0 && scrollY >= totalHeight - 15) {
        setActiveId(headings[headings.length - 1].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      // Avoid observer overriding when we are already at the bottom
      const scrollY = window.scrollY || window.pageYOffset;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0 && scrollY >= totalHeight - 15) {
        return;
      }

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: "-80px 0% -80% 0%",
      threshold: 0.1, // More responsive trigger threshold
    });

    const elements = headings.map((h) => document.getElementById(h.id));
    elements.forEach((el) => {
      if (el) observer.current?.observe(el);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.current?.disconnect();
    };
  }, [headings]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 90;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
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
      history.pushState(null, "", `#${id}`);
      setActiveId(id);
    }
  };

  return (
    <aside className="hidden xl:block w-52 shrink-0">
      <div className="sticky top-12">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/20">
            On this page
          </p>
          <span className="text-[9px] font-mono text-white/25">
            {Math.round(scrollProgress)}%
          </span>
        </div>
        <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-75 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <nav className="relative space-y-1">
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              className={cn(
                "relative flex items-start gap-2 py-1.5 text-[11.5px] leading-[1.5] transition-colors duration-300 truncate group",
                activeId === h.id
                  ? "text-white font-semibold"
                  : "text-white/30 hover:text-white/60 font-medium",
                h.level === 3 ? "pl-5" : "pl-3"
              )}
            >
              <AnimatePresence>
                {activeId === h.id && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1 bottom-1 w-[2px] bg-blue-500 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </AnimatePresence>
              
              {h.level === 3 && (
                <span className={cn(
                  "mt-[0.45rem] h-[3px] w-[3px] rounded-full shrink-0 transition-colors duration-300",
                  activeId === h.id ? "bg-blue-400" : "bg-white/15 group-hover:bg-white/30"
                )} />
              )}
              <span className="truncate">{h.text}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
