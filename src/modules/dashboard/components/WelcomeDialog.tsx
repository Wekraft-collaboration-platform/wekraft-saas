"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function WelcomeDialog() {
  const [show, setShow] = useState(false);
  const [stage, setStage] = useState<"welcome" | "tooltip">("welcome");
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    // Check local storage to see if the user has already seen the welcome dialog
    // const hasSeen = localStorage.getItem("wekraft_has_seen_welcome");
    // if (!hasSeen) {
      setShow(true);
    // }
  }, []);

  useEffect(() => {
    // Target the first step specifically
    const el = document.getElementById("tour-step-1");

    if (stage === "tooltip") {
      if (el) {
        // Bring step element above the backdrop and ensure it has an opaque background
        el.style.position = "relative";
        el.style.zIndex = "51";
        el.style.backgroundColor = "var(--sidebar)";
        el.style.borderRadius = "0.375rem"; // match rounded-md
        
        const rect = el.getBoundingClientRect();
        // Point to the right side of the step
        setPos({ top: rect.top + 10, left: rect.right + 10 });
      } else {
        // Fallback positioning
        setPos({ top: 200, left: 400 });
      }
    } else {
      if (el) {
        el.style.position = "";
        el.style.zIndex = "";
        el.style.backgroundColor = "";
        el.style.borderRadius = "";
      }
    }

    return () => {
      if (el) {
        el.style.position = "";
        el.style.zIndex = "";
        el.style.backgroundColor = "";
        el.style.borderRadius = "";
      }
    };
  }, [stage]);

  const handleSkip = () => {
    localStorage.setItem("wekraft_has_seen_welcome", "true");
    setShow(false);
  };

  const handleConnect = () => {
    localStorage.setItem("wekraft_has_seen_welcome", "true");
    setShow(false);
    setTimeout(() => {
      document.getElementById("connect-github-btn")?.click();
    }, 100);
  };

  const startTour = () => {
    setStage("tooltip");
  };

  if (!show) return null;

  if (stage === "tooltip") {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div 
          className="absolute inset-0 bg-background/50 backdrop-blur-[1px] pointer-events-auto transition-opacity" 
          onClick={handleSkip} 
        />
        
        {/* Tooltip positioned near the checklist */}
        <div 
          className="absolute z-50 pointer-events-auto flex items-start animate-in fade-in slide-in-from-right-8 duration-500"
          style={{ top: pos.top, left: pos.left }}
        >
          {/* SVG Curvy Arrow pointing left */}
          <div className="mt-6 -mr-2 z-10 text-white drop-shadow-md">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M45 40 C 45 20 25 15 10 15 M 10 15 L 18 8 M 10 15 L 18 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="flex flex-col ml-1 w-[320px]">
            <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-lg p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full">
                  1
                </span>
                <h3 className="text-sm font-semibold text-foreground">Connect GitHub</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Link your GitHub account to unlock commit tracking, pull-request syncing, and developer stats across all your projects.
              </p>
            </div>

            {/* Buttons outside the box */}
            <div className="mt-3 flex items-center justify-end gap-3">
              <Button variant="ghost" onClick={handleSkip} className="h-8 px-3 text-xs text-white hover:bg-white/10">
                Skip
              </Button>
              <Button onClick={handleConnect} className="h-8 px-4 text-xs bg-white text-black hover:bg-neutral-200">
                Connect
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card text-card-foreground rounded-lg shadow-2xl max-w-[400px] w-full border border-border flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Section */}
        <div className="p-3 flex flex-col items-center text-center">
          <h2 className="text-sm font-semibold text-foreground">Welcome to Wekraft</h2>
          <p className="text-muted-foreground text-[11px] mt-0.5">
            Your quick guide to getting started
          </p>
        </div>
        
        {/* Separator */}
        <div className="h-px w-full bg-border/60" />
        
        {/* Content Section */}
        <div className="p-5 bg-muted/10 text-center">
          <p className="text-foreground/90 text-sm leading-relaxed">
            Get ready to supercharge your workflow. Connect your GitHub, track projects, and collaborate with your team all in one place.
          </p>
        </div>
      </div>

      {/* Footer Section (Outside Box) */}
      <div className="mt-4 flex items-center justify-end gap-3 max-w-[400px] w-full animate-in fade-in zoom-in-95 duration-200 delay-75">
        <Button 
          variant="ghost" 
          onClick={handleSkip} 
          className="text-muted-foreground hover:text-foreground text-sm font-medium h-9 px-4"
        >
          Skip
        </Button>
        <Button 
          onClick={startTour} 
          className="bg-white text-black hover:bg-neutral-200 rounded-md px-5 py-2 h-9 text-sm font-medium shadow-sm transition-all"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
