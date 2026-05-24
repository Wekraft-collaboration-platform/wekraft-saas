"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { STEPS } from "./GettingStartedChecklist";

export function WelcomeDialog() {
  const [show, setShow] = useState(false);
  const [tourStep, setTourStep] = useState<number>(0); 
  // 0: Welcome Modal, 1-6: Checklist Steps, 7: Tabs
  
  const [pos, setPos] = useState({ bottom: 0, left: 0 });

  useEffect(() => {
    // Check local storage to see if the user has already seen the welcome dialog
    // const hasSeen = localStorage.getItem("wekraft_has_seen_welcome");
    // if (!hasSeen) {
      setShow(true);
    // }
  }, []);

  useEffect(() => {
    let targetId = null;
    if (tourStep >= 1 && tourStep <= 6) targetId = `tour-step-${tourStep}`;

    const el = targetId ? document.getElementById(targetId) : null;

    if (tourStep > 0) {
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        el.style.position = "relative";
        el.style.zIndex = "51";
        el.style.borderRadius = "0.5rem";
        el.classList.add("bg-accent/20");
        
        // Use a small timeout to let the smooth scroll settle before measuring
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setPos({ 
            bottom: window.innerHeight - rect.top + 5, 
            left: rect.left + 20 
          });
        }, 300);

        // Initial position before scroll settles
        const rect = el.getBoundingClientRect();
        setPos({ 
          bottom: window.innerHeight - rect.top + 5, 
          left: rect.left + 20 
        });
      } else {
        // Fallback positioning if element not found
        setPos({ bottom: 200, left: 400 });
      }
    } else {
      if (el) {
        el.style.position = "";
        el.style.zIndex = "";
        el.style.borderRadius = "";
        el.classList.remove("bg-accent/20");
      }
    }

    // Cleanup previous element if we move to next step
    return () => {
      if (el) {
        el.style.position = "";
        el.style.zIndex = "";
        el.style.borderRadius = "";
        el.classList.remove("bg-accent/20");
      }
    };
  }, [tourStep]);

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
    setTourStep(1);
  };

  if (!show) return null;

  if (tourStep > 0) {
    const currentStepConfig = STEPS[tourStep - 1];

    const stepTitle = currentStepConfig?.label;
    const stepDescription = currentStepConfig?.description;

    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div 
          className="absolute inset-0 bg-background/50 backdrop-blur-[1px] pointer-events-auto transition-opacity" 
        />
        
        {/* Tooltip positioned ABOVE the target */}
        <div 
          className="absolute z-50 pointer-events-auto flex flex-col items-start animate-in fade-in slide-in-from-bottom-8 duration-500"
          style={{ bottom: pos.bottom, left: pos.left }}
        >
          <div className="flex flex-col w-[320px]">
            {/* Tooltip Card */}
            <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-lg p-5">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full shrink-0">
                  {tourStep}
                </span>
                <h3 className="text-sm font-semibold text-foreground">
                  {stepTitle}
                </h3>
              </div>
              
              <div className="h-px w-full bg-border/60 my-3" />
              
              <p className="text-xs text-muted-foreground leading-relaxed">
                {stepDescription}
              </p>
            </div>

            {/* Buttons outside the box */}
            <div className="mt-3 flex items-center justify-between gap-3 px-1">
              <Button variant="ghost" onClick={handleSkip} className="h-8 px-3 text-xs text-muted-foreground hover:text-white">
                Skip Tour
              </Button>
              <div className="flex gap-2">
                {tourStep > 1 && (
                  <Button variant="secondary" onClick={() => setTourStep(tourStep - 1)} className="h-8 px-3 text-xs">
                    Back
                  </Button>
                )}
                {tourStep < 6 && (
                  <Button variant="secondary" onClick={() => setTourStep(tourStep + 1)} className="h-8 px-3 text-xs">
                    Next
                  </Button>
                )}
                
                {tourStep === 1 && (
                  <Button onClick={handleConnect} className="h-8 px-4 text-xs bg-white text-black hover:bg-neutral-200">
                    Connect
                  </Button>
                )}
                
                {tourStep === 6 && (
                  <Button onClick={handleSkip} className="h-8 px-4 text-xs bg-white text-black hover:bg-neutral-200">
                    Done
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* SVG Arrow pointing down with 2 curves */}
          <div className="-mt-1 ml-10 z-10 text-white drop-shadow-md shrink-0">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M30 5 C 50 20, 10 40, 30 55 M 30 55 L 20 45 M 30 55 L 40 45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
