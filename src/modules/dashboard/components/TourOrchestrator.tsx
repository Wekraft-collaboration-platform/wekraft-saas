"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { PartyPopper, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TourOrchestrator() {
  const progressData = useQuery(api.user.getOnboardingProgress);
  const router = useRouter();
  const prevCompletedRef = useRef<number[] | null>(null);
  const [completedTask, setCompletedTask] = useState<number | null>(null);

  useEffect(() => {
    if (!progressData) return;
    const currentCompleted = progressData.completedSteps;

    if (prevCompletedRef.current !== null) {
      // Find newly completed steps since last render
      const newSteps = currentCompleted.filter(id => !prevCompletedRef.current!.includes(id));
      
      if (newSteps.length > 0) {
        // If there's an active tour session
        if (sessionStorage.getItem("wekraft_tour_active") === "true") {
          const maxNewStep = Math.max(...newSteps);
          setCompletedTask(maxNewStep);
        }
      }
    }
    
    prevCompletedRef.current = currentCompleted;
  }, [progressData]);

  if (completedTask !== null) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-xs" onClick={() => setCompletedTask(null)} />
        <div className="flex flex-col w-[380px] relative pointer-events-auto animate-in zoom-in-95 duration-200">
          <div className="bg-linear-to-br from-neutral-800 to-neutral-950 text-card-foreground border border-border shadow-2xl rounded-lg p-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-white/10 p-2 rounded-lg border border-white/10">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <h4 className="font-bold text-base tracking-tight text-white/90">
                Task Completed!
              </h4>
            </div>

            <div className="h-px w-full bg-accent my-3" />

            <p className="text-xs text-muted-foreground leading-relaxed pr-2">
              Awesome work! You've successfully completed this step. Are you ready to continue the tour?
            </p>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 px-1 w-full">
            <Button
              variant="ghost"
              onClick={() => {
                sessionStorage.removeItem("wekraft_tour_active");
                setCompletedTask(null);
              }}
              className="h-8 px-3 text-xs text-muted-foreground hover:text-white"
            >
              Skip Tour
            </Button>

            <Button
              className="h-8 px-4 text-xs bg-white text-black hover:bg-white/90"
              onClick={() => {
                const step = completedTask;
                setCompletedTask(null);
                router.push(`/dashboard?tour=resume&resumeAfter=${step}`);
              }}
            >
              Continue Tour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
