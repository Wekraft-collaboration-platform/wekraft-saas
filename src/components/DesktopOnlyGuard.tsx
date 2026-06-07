"use client";

import React, { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

interface DesktopOnlyGuardProps {
  children: React.ReactNode;
}

export function DesktopOnlyGuard({ children }: DesktopOnlyGuardProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const handleResize = () => {
      // 1024px is standard Tailwind lg breakpoint for PC screens
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isDesktop === null) {
    return <div className="h-screen w-full bg-black animate-pulse" />;
  }

  if (isDesktop) {
    return <>{children}</>;
  }

  // Mobile / Tablet blocked screen view (dark minimal theme)
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-zinc-400 font-sans px-6 selection:bg-zinc-800">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl border border-border bg-sidebar backdrop-blur-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-black text-zinc-300">
          <Monitor className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-light tracking-tight text-zinc-100">Desktop Access Only</h2>
          <p className="text-zinc-500 text-xs leading-relaxed">
            The WeKraft workspace is designed for larger displays. Please open this page on a PC, laptop, or desktop screen to continue.
          </p>
        </div>
      </div>
    </div>
  );
}
