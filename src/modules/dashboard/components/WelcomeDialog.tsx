"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { STEPS } from "./GettingStartedChecklist";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ChevronRight, X, Sparkles, GitBranch, Calendar, Users, ClipboardCheck } from "lucide-react";
import { usePathname } from "next/navigation";

const DynamicArrowOverlay = ({ pos }: { pos: any }) => {
  if (!pos || pos.top === -1000 || !pos.targetX) return null;
  
  let startX = 0;
  let startY = 0;
  let endX = pos.targetX;
  let endY = pos.targetY;
  
  if (pos.placement === 'top') {
    startX = pos.left + pos.arrowX;
    startY = pos.top + pos.boxHeight + 5;
    endY -= (pos.targetHeight / 2 + 5);
  } else if (pos.placement === 'bottom') {
    startX = pos.left + pos.arrowX;
    startY = pos.top - 5;
    endY += (pos.targetHeight / 2 + 5);
  } else if (pos.placement === 'left') {
    startX = pos.left + pos.boxWidth + 5;
    startY = pos.top + pos.arrowY;
    endX -= (pos.targetWidth / 2 + 5);
  } else if (pos.placement === 'right') {
    startX = pos.left - 5;
    startY = pos.top + pos.arrowY;
    endX += (pos.targetWidth / 2 + 5);
  }

  const dx = endX - startX;
  const dy = endY - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  
  // Normalize ratios based on original 70px length
  const getP = (val: number) => (val / 70) * dist;

  let f1 = 0, s1 = 0, f2 = 0, s2 = 0;
  switch (pos.arrowType) {
    case 1: f1 = getP(25); s1 = getP(-15); f2 = getP(25); s2 = getP(15); break;
    case 2: f1 = getP(25); s1 = getP(15);  f2 = getP(25); s2 = getP(-15); break;
    case 3: f1 = getP(20); s1 = getP(-10); f2 = getP(30); s2 = getP(20); break;
    case 4: f1 = getP(20); s1 = getP(10);  f2 = getP(30); s2 = getP(-20); break;
    case 5: f1 = getP(35); s1 = getP(-20); f2 = getP(15); s2 = getP(20); break;
    default: f1 = getP(25); s1 = getP(-15); f2 = getP(25); s2 = getP(15); break;
  }

  let cp1x = startX, cp1y = startY, cp2x = endX, cp2y = endY;

  if (pos.placement === 'top') {
    cp1y += f1; cp1x += s1;
    cp2y -= f2; cp2x += s2;
  } else if (pos.placement === 'bottom') {
    cp1y -= f1; cp1x += s1;
    cp2y += f2; cp2x += s2;
  } else if (pos.placement === 'left') {
    cp1x += f1; cp1y += s1;
    cp2x -= f2; cp2y += s2;
  } else if (pos.placement === 'right') {
    cp1x -= f1; cp1y += s1;
    cp2x += f2; cp2y += s2;
  }

  return (
    <svg className="fixed inset-0 w-full h-full pointer-events-none z-[60]" style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.5))" }}>
      <defs>
        <marker id="arrowhead" markerWidth="20" markerHeight="20" refX="7" refY="10" orient="auto" markerUnits="userSpaceOnUse">
          <path d="M 3 4 L 11 10 L 3 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <path
        d={`M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`}
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  );
};

export function WelcomeDialog() {
  const currentUser = useQuery(api.user.getCurrentUser);
  const markWelcomeSeen = useMutation(api.user.markWelcomeSeen);

  const [show, setShow] = useState(false);
  const [tourStep, setTourStep] = useState<number>(0);
  // 0: Welcome Modal, 1-6: Checklist Steps

  const [pos, setPos] = useState<any>({ top: -1000, left: -1000, arrowX: 160, arrowY: 90, placement: 'top', arrowType: 1 });
  const router = useRouter();
  const pathname = usePathname();
  const tooltipRef = useRef<HTMLDivElement>(null);

  const progressData = useQuery(api.user.getOnboardingProgress);
  const userProjects = useQuery(api.project.getUserProjects);
  const [extensionInstalled, setExtensionInstalled] = useState(false);

  useEffect(() => {
    const handleExtensionInstalledEvent = () => {
      setExtensionInstalled(true);
    };
    window.addEventListener('mark-extension-installed', handleExtensionInstalledEvent);
    return () => window.removeEventListener('mark-extension-installed', handleExtensionInstalledEvent);
  }, []);

  const completedIds = useMemo(() => [
    ...(progressData?.completedSteps ?? []),
    ...(extensionInstalled ? [7] : [])
  ], [progressData?.completedSteps, extensionInstalled]);

  const hasSeenWelcome = useQuery(api.user.getHasSeenWelcome);

  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (initialCheckDone.current) return;
    if (hasSeenWelcome === undefined || currentUser === undefined) return;

    if (sessionStorage.getItem("wekraft_tour_active") === "true") {
      setShow(true);
      initialCheckDone.current = true;
      // Calculate the first incomplete step instead of leaving tourStep at 0 (which shows the welcome modal)
      const firstIncomplete = STEPS.find((s) => !completedIds.includes(s.id));
      setTourStep(firstIncomplete ? firstIncomplete.id : 1);
      return;
    }

    // Only show if user hasn't seen/skipped the welcome dialog, and hasn't finished the checklist yet
    if (!hasSeenWelcome && !currentUser?.gettingstartedcompleted) {
      setShow(true);
      initialCheckDone.current = true;
    } else {
      setShow(false);
      initialCheckDone.current = true;
    }
  }, [hasSeenWelcome, currentUser, markWelcomeSeen]);

  useEffect(() => {
    const handleStartTour = (e: CustomEvent | Event) => {
      sessionStorage.setItem("wekraft_tour_active", "true");
      markWelcomeSeen().catch(() => { });
      setShow(true);
      
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.step) {
        setTourStep(customEvent.detail.step);
      } else if (customEvent.detail?.resumeAfter) {
        const next = getNextStep(customEvent.detail.resumeAfter);
        if (next) {
          setTourStep(next);
        } else {
          setTourStep(0);
          setShow(false);
        }
      } else {
        const firstIncomplete = STEPS.find(s => !completedIds.includes(s.id));
        if (firstIncomplete) {
          setTourStep(firstIncomplete.id);
        } else {
          setTourStep(1); // fallback if all completed
        }
      }
    };
    window.addEventListener('start-quick-tour', handleStartTour as EventListener);
    return () => window.removeEventListener('start-quick-tour', handleStartTour as EventListener);
  }, [completedIds, markWelcomeSeen]);

  useEffect(() => {
    let targetId = null;
    if (tourStep >= 1 && tourStep <= 7) targetId = `tour-step-${tourStep}`;
    // Step 3: point to the first project in the sidebar instead
    if (tourStep === 3) targetId = "sidebar-first-project";

    const el = targetId ? document.getElementById(targetId) : null;
    let animationFrameId: number = 0;
    let scrollTimer: ReturnType<typeof setTimeout>;

    if (tourStep > 0) {
      if (el) {
        scrollTimer = setTimeout(() => {
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
          let currentPlacement = placements[(tourStep - 1) % placements.length];
          
          // Step 3 targets the sidebar, so it should always be placed to the right
          if (tourStep === 3) {
            currentPlacement = 'right';
          }

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

          setPos({ 
            top, left, 
            arrowX, arrowY, 
            placement: currentPlacement, 
            arrowType: ((tourStep - 1) % 5) + 1,
            targetX: targetCenterX,
            targetY: targetCenterY,
            targetWidth: rect.width,
            targetHeight: rect.height,
            boxWidth,
            boxHeight
          });
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
      clearTimeout(scrollTimer);
      cancelAnimationFrame(animationFrameId);
      if (el) {
        el.style.position = "";
        el.style.zIndex = "";
        el.removeAttribute("data-tour-active");
      }
    };
  }, [tourStep]);

  const handleSkip = () => {
    sessionStorage.removeItem("wekraft_tour_active");
    markWelcomeSeen().catch(() => { });
    setShow(false);
    setTourStep(0);
  };

  const handleCtaClick = () => {
    markWelcomeSeen().catch(() => { });
    setShow(false);
    setTourStep(0);
    const currentStepConfig = STEPS[tourStep - 1];
    
    if (tourStep === 7) {
      setExtensionInstalled(true);
      window.dispatchEvent(new CustomEvent('mark-extension-installed'));
    }
    if (currentStepConfig?.action) {
      currentStepConfig.action(router, { projects: userProjects });
    }
  };

  const startTour = () => {
    sessionStorage.setItem("wekraft_tour_active", "true");
    markWelcomeSeen().catch(() => { });
    const firstIncomplete = STEPS.find(s => !completedIds.includes(s.id));
    setTourStep(firstIncomplete ? firstIncomplete.id : 1);
  };

  const getNextStep = (current: number) => {
    for (let i = current + 1; i <= 7; i++) {
      if (!completedIds.includes(i)) return i;
    }
    return null;
  };



  if (!show) return null;
  if (pathname !== "/dashboard") return null;

  const getShortCta = (stepId: number) => {
    switch (stepId) {
      case 1: return "Connect";
      case 2: return "Link Repo";
      case 3: return "Open Project";
      case 4: return "Invite";
      case 5: return "Set Deadline";
      case 6: return "Create Task";
      case 7: return "Complete";
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
          className="absolute inset-0 bg-background/40 backdrop-blur-[1px] pointer-events-auto transition-opacity"
        />

        {pos.top !== -1000 && (
          <>
            <DynamicArrowOverlay pos={pos} />
            <div
              className="absolute z-50 pointer-events-auto flex flex-col items-center animate-in fade-in transition-all duration-300 ease-out"
              style={{ top: pos.top, left: pos.left, width: 320 }}
            >
              <div className="flex flex-col w-full relative z-20">
              {/* Tooltip Card */}
              <div ref={tooltipRef} className="bg-linear-to-br from-neutral-800 to-neutral-950 text-card-foreground border border-border shadow-2xl rounded-lg p-5">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full shrink-0">
                    {tourStep}
                  </span>
                  <h3 className="text-sm font-semibold text-foreground">
                    {stepTitle}
                  </h3>
                </div>

                <div className="h-px w-full bg-accent my-3" />

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

                  <Button onClick={handleCtaClick} className="h-8 text-xs">
                    {getShortCta(tourStep)}
                  </Button>
                </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4 transition-all duration-300 animate-in fade-in">
      <div className="bg-sidebar text-sidebar-foreground rounded-2xl max-w-[440px] w-full min-h-[440px] border border-accent shadow-xl flex flex-col justify-between p-6 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">

        {/* Top Section */}
        <div className="flex flex-col gap-4">
          {/* Get Started (outside inner box) */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80 w-fit">
            Get Started <ChevronRight className="w-3 h-3 ml-1" />
          </span>

          {/* Inner Box: heading and SVG only */}
          <div className="relative overflow-hidden bg-linear-to-br from-muted via-muted to-indigo-500/40 rounded-xl border border-neutral-800 p-5 pr-28 min-h-[140px] flex items-center">
            {/* Flower SVG Background */}
            <img
              src="/flw2.svg"
              alt="Welcome illustration"
              className="absolute -right-10 top-5 w-42 h-42 object-cover pointer-events-none select-none"
            />
            <h2 className="relative z-10 text-lg font-semibold text-white leading-snug">
              Welcome to Wekraft! Let&apos;s start your journey.
            </h2>
          </div>

          {/* Description list (outside inner box, below it) */}
          <div className="mt-2 flex flex-col gap-3 px-1">
            <h3 className="text-sm text-center underline underline-offset-4 font-semibold text-white">How to use Wekraft</h3>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-400 px-5">
              <li className="flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Connect repo to your project</span>
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Set deadline</span>
              </li>
              <li className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Invite your teamates</span>
              </li>
              <li className="flex items-center gap-2">
                <ClipboardCheck className="w-3.5 h-3.5 text-white shrink-0" />
                <span>Create Tasks / Import issues</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Centered Footer Buttons */}
        <div className="flex items-center justify-center gap-5 mt-6">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="text-xs"
          >
            <X className="w-3.5 h-3.5" />
            Skip
          </Button>
          <Button
            onClick={startTour}
            className="text-xs"
          >
            Continue tour
            <Sparkles className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
