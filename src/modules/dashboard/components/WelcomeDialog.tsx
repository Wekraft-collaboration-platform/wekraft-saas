"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { STEPS } from "./GettingStartedChecklist";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const MinimalArrow = ({ type, placement }: { type: number, placement: string }) => {
  const getPath = () => {
    switch (type) {
      case 1: return "M 30 5 C 15 30, 45 50, 30 75 M 30 75 L 22 65 M 30 75 L 38 65";
      case 2: return "M 30 5 C 45 30, 15 50, 30 75 M 30 75 L 22 65 M 30 75 L 38 65";
      case 3: return "M 30 5 C 20 25, 50 45, 30 75 M 30 75 L 22 65 M 30 75 L 38 65";
      case 4: return "M 30 5 C 40 25, 10 45, 30 75 M 30 75 L 22 65 M 30 75 L 38 65";
      case 5: return "M 30 5 C 10 40, 50 60, 30 75 M 30 75 L 22 65 M 30 75 L 38 65";
      default: return "M 30 5 C 15 30, 45 50, 30 75 M 30 75 L 22 65 M 30 75 L 38 65"; 
    }
  };

  let rotateClass = "";
  if (placement === 'bottom') rotateClass = "rotate-180";
  if (placement === 'left') rotateClass = "-rotate-90";
  if (placement === 'right') rotateClass = "rotate-90";

  return (
    <div className={`text-white drop-shadow-md ${rotateClass}`}>
      <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d={getPath()} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
};

export function WelcomeDialog() {
  const [show, setShow] = useState(false);
  const [tourStep, setTourStep] = useState<number>(0); 
  // 0: Welcome Modal, 1-6: Checklist Steps
  
  const [pos, setPos] = useState({ top: -1000, left: -1000, arrowX: 160, arrowY: 90, placement: 'top', arrowType: 1 });
  const router = useRouter();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const progressData = useQuery(api.user.getOnboardingProgress);
  const userProjects = useQuery(api.project.getUserProjects);
  const completedIds = progressData?.completedSteps ?? [];

  useEffect(() => {
    // Check local storage to see if the user has already seen the welcome dialog
    // const hasSeen = localStorage.getItem("wekraft_has_seen_welcome");
    // if (!hasSeen) {
      setShow(true);
    // }
  }, []);

  useEffect(() => {
    const handleStartTour = () => {
      setShow(true);
      const firstIncomplete = STEPS.find(s => !completedIds.includes(s.id));
      if (firstIncomplete) {
        setTourStep(firstIncomplete.id);
      } else {
        setTourStep(1); // fallback if all completed
      }
    };
    window.addEventListener('start-quick-tour', handleStartTour);
    return () => window.removeEventListener('start-quick-tour', handleStartTour);
  }, [completedIds]);

  useEffect(() => {
    let targetId = null;
    if (tourStep >= 1 && tourStep <= 6) targetId = `tour-step-${tourStep}`;

    const el = targetId ? document.getElementById(targetId) : null;
    let animationFrameId: number;

    if (tourStep > 0) {
      if (el) {
        // Delay scroll slightly to ensure smooth behavior after state updates
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 10);
        
        el.style.position = "relative";
        el.style.zIndex = "51";
        el.setAttribute("data-tour-active", "true");
        
        // Continuously update position to glue the tooltip to the element during smooth scroll
        const updatePos = () => {
          const rect = el.getBoundingClientRect();
          const boxWidth = tooltipRef.current?.offsetWidth || 320;
          const boxHeight = tooltipRef.current?.offsetHeight || 180;
          const margin = 24;

          const placements = ['top', 'right'];
          const currentPlacement = placements[(tourStep - 1) % placements.length];
          
          const gap = 70; // Set gap perfectly to arrow length (75 - 5 = 70)
          
          let top = 0;
          let left = 0;

          switch (currentPlacement) {
            case 'top':
              top = rect.top - boxHeight - gap;
              left = rect.left + rect.width / 2 - boxWidth / 2 + 40;
              break;
            case 'right':
              top = rect.top + rect.height / 2 - boxHeight / 2;
              left = rect.right + gap;
              break;
            case 'bottom':
              top = rect.bottom + gap;
              left = rect.left + rect.width / 2 - boxWidth / 2 + 40;
              break;
            case 'left':
              top = rect.top + rect.height / 2 - boxHeight / 2;
              left = rect.left - boxWidth - gap;
              break;
          }

          // Clamp left and top to ensure the tooltip stays within the screen
          left = Math.round(Math.max(margin, Math.min(window.innerWidth - boxWidth - margin, left)));
          top = Math.round(Math.max(margin, Math.min(window.innerHeight - boxHeight - margin, top)));

          // Calculate arrow position based on clamped tooltip position
          const targetCenterX = Math.round(rect.left + rect.width / 2);
          const targetCenterY = Math.round(rect.top + rect.height / 2);
          
          let arrowX = 160;
          let arrowY = 90;

          if (currentPlacement === 'top' || currentPlacement === 'bottom') {
            arrowX = targetCenterX - left;
            arrowX = Math.round(Math.max(40, Math.min(boxWidth - 40, arrowX)));
          } else {
            arrowY = targetCenterY - top;
            arrowY = Math.round(Math.max(40, Math.min(boxHeight - 40, arrowY)));
          }

          setPos({ top, left, arrowX, arrowY, placement: currentPlacement, arrowType: ((tourStep - 1) % 5) + 1 });
          animationFrameId = requestAnimationFrame(updatePos);
        };
        updatePos();

      } else {
        // Fallback positioning if element not found
        setPos({ top: 200, left: window.innerWidth / 2 - 160, arrowX: 160, arrowY: 90, placement: 'top', arrowType: 1 });
      }
    } else {
      if (el) {
        el.style.position = "";
        el.style.zIndex = "";
        el.removeAttribute("data-tour-active");
      }
    }

    // Cleanup previous element if we move to next step
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (el) {
        el.style.position = "";
        el.style.zIndex = "";
        el.removeAttribute("data-tour-active");
      }
    };
  }, [tourStep]);

  const handleSkip = () => {
    localStorage.setItem("wekraft_has_seen_welcome", "true");
    setShow(false);
    setTourStep(0);
  };

  const handleCtaClick = () => {
    localStorage.setItem("wekraft_has_seen_welcome", "true");
    setShow(false);
    setTourStep(0);
    const currentStepConfig = STEPS[tourStep - 1];
    if (currentStepConfig?.action) {
      currentStepConfig.action(router, { projects: userProjects });
    }
  };

  const startTour = () => {
    setTourStep(1);
  };

  const getNextStep = (current: number) => {
    for (let i = current + 1; i <= 6; i++) {
      if (!completedIds.includes(i)) return i;
    }
    return null;
  };

  if (!show) return null;

  const getShortCta = (stepId: number) => {
    switch (stepId) {
      case 1: return "Connect";
      case 2: return "Link Repo";
      case 3: return "Invite";
      case 4: return "Set Deadline";
      case 5: return "Create Task";
      case 6: return "Get Extension";
      default: return "Action";
    }
  };

  if (tourStep > 0) {
    const currentStepConfig = STEPS[tourStep - 1];
    const nextStep = getNextStep(tourStep);

    const stepTitle = currentStepConfig?.label;
    const stepDescription = currentStepConfig?.description;

    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div 
          className="absolute inset-0 bg-background/50 backdrop-blur-[1px] pointer-events-auto transition-opacity" 
        />
        
        {/* Tooltip positioned according to current placement */}
        {pos.top !== -1000 && (
          <div 
            className="absolute z-50 pointer-events-auto flex flex-col items-center animate-in fade-in transition-all duration-300 ease-out"
            style={{ top: pos.top, left: pos.left, width: 320 }}
          >
          {pos.placement === 'top' && (
            <div className="absolute z-10 transition-all duration-75" style={{ top: (tooltipRef.current?.offsetHeight || 180) - 5, left: pos.arrowX - 30 }}>
              <MinimalArrow type={pos.arrowType} placement={pos.placement} />
            </div>
          )}
          {pos.placement === 'bottom' && (
            <div className="absolute z-10 transition-all duration-75" style={{ top: -75, left: pos.arrowX - 30 }}>
              <MinimalArrow type={pos.arrowType} placement={pos.placement} />
            </div>
          )}
          {pos.placement === 'right' && (
            <div className="absolute z-10 transition-all duration-75" style={{ right: 'calc(100% + 5px)', top: pos.arrowY - 40 }}>
              <MinimalArrow type={pos.arrowType} placement={pos.placement} />
            </div>
          )}
          {pos.placement === 'left' && (
            <div className="absolute z-10 transition-all duration-75" style={{ left: 'calc(100% + 5px)', top: pos.arrowY - 40 }}>
              <MinimalArrow type={pos.arrowType} placement={pos.placement} />
            </div>
          )}

          <div className="flex flex-col w-full relative z-20">
            {/* Tooltip Card */}
            <div ref={tooltipRef} className="bg-card text-card-foreground border border-border shadow-2xl rounded-lg p-5">
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
            <div className="mt-3 flex items-center justify-between gap-3 px-1 w-full">
              <Button variant="ghost" onClick={handleSkip} className="h-8 px-3 text-xs text-muted-foreground hover:text-white">
                Skip Tour
              </Button>
              <div className="flex gap-2">
                {nextStep !== null ? (
                  <Button variant="secondary" onClick={() => setTourStep(nextStep)} className="h-8 px-3 text-xs">
                    Next
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={handleSkip} className="h-8 px-3 text-xs">
                    Done
                  </Button>
                )}
                
                <Button onClick={handleCtaClick} className="h-8 px-4 text-xs bg-white text-black hover:bg-neutral-200 whitespace-nowrap">
                  {getShortCta(tourStep)}
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom placement arrow is already handled above */}
        </div>
        )}
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
