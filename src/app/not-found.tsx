"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-zinc-100 flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      {/* ── Subtle Background Grid (Linear/Vercel Style) ── */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 70%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 70%, transparent 100%)"
        }}
      />

      {/* ── Main Content Container (Snappy Premium Animation) ── */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-[420px] w-full px-6 text-center flex flex-col items-center gap-8"
      >
        {/* Sleek Brand Tag / Error Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800/80 bg-zinc-950/50 text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Error 404
        </div>

        {/* Typography */}
        <div className="space-y-3">
          <p className="text-sm text-zinc-400 leading-relaxed max-w-[340px] mx-auto mt-2">
            The page you are looking for has drifted off. Let's get you back to your workspace.
          </p>
        </div>

        {/* Action Buttons (High contrast Vercel/Linear theme) */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[300px]">
          <Button 
            asChild
            id="404-go-dashboard-button"
            className="flex-1 bg-white text-black hover:bg-zinc-200 border-none text-xs h-9 font-medium cursor-pointer transition-all duration-150 rounded active:scale-[0.98]"
          >
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>

          <Button 
            asChild
            variant="outline"
            id="404-go-home-button"
            className="flex-1 border-zinc-800 bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-900/60 hover:border-zinc-700 text-xs h-9 font-medium cursor-pointer transition-all duration-150 rounded active:scale-[0.98]"
          >
            <Link href="/web">
              Return Home
            </Link>
          </Button>
        </div>

        {/* Go Back Link */}
        <button 
          onClick={() => window.history.back()}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer mt-1 font-medium"
        >
          <ArrowLeft className="h-3 w-3" />
          Go back to previous page
        </button>
      </motion.div>

      {/* Minimal Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none z-10">
        <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-600 font-mono">
          WeKraft Systems
        </span>
      </div>
    </div>
  );
}
