"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeButtons() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative flex items-center w-[56px] h-8 p-1 rounded-full dark:bg-[#111111] bg-accent/50 opacity-50" />
    );
  }

  return (
    <div className="relative flex items-center justify-between w-[56px] h-8 p-1 rounded-full dark:bg-[#111111] bg-accent/50 shadow-inner">
      {/* Sliding background pill */}
      <div
        className={
          "absolute left-1 top-1 h-6 w-6 rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.4,0.0,0.2,1)] " +
          "dark:bg-[#222222] bg-white " +
          (theme === "dark" ? "translate-x-[24px]" : "translate-x-0")
        }
      />

      {/* Sun – Light mode */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTheme("light");
        }}
        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
          theme === "light"
            ? "text-foreground"
            : "text-muted-foreground/60 hover:text-muted-foreground"
        }`}
      >
        <Sun className="h-[14px] w-[14px]" />
      </button>

      {/* Moon – Dark mode */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTheme("dark");
        }}
        className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
          theme === "dark"
            ? "text-blue-400"
            : "text-muted-foreground/60 hover:text-muted-foreground"
        }`}
      >
        <Moon className="h-[14px] w-[14px]" />
      </button>
    </div>
  );
}
