"use client";

import { Button } from "@/components/ui/button";
import { ClipboardCheck, Clover, Frown, Sparkles } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export function GettingStartedCompleteDialog() {
  const currentUser = useQuery(api.user.getCurrentUser);
  const markGettingStartedCompleteSeen = useMutation(api.user.markGettingStartedCompleteSeen);
  const router = useRouter();

  if (currentUser === undefined || currentUser === null) return null;

  const showCompleteDialog = !!currentUser.gettingstartedcompleted && !currentUser.hasSeenGettingStartedComplete;

  if (!showCompleteDialog) return null;

  const handleDismissCompleteDialog = () => {
    markGettingStartedCompleteSeen().catch(() => { });
  };

  const handleUpgradeCompleteDialog = () => {
    markGettingStartedCompleteSeen().catch(() => { });
    router.push("/web/pricing");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4 transition-all duration-300 animate-in fade-in">
      <div className="bg-sidebar text-sidebar-foreground rounded-2xl max-w-[440px] w-full min-h-[400px] border border-accent shadow-xl flex flex-col justify-between p-6 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">

        {/* Top Section */}
        <div className="flex flex-col gap-4">
          {/* Tag (outside inner box) */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm  bg-white/10 text-white/80 w-fit">
            Completed <ClipboardCheck className="w-4 h-4! ml-1 -mt-0.5" />
          </span>

          {/* Inner Box: heading and SVG only */}
          <div className="relative overflow-hidden bg-linear-to-br from-muted via-muted to-rose-500/40 rounded-xl border border-neutral-800 p-5 pr-28 min-h-[140px] flex items-center">
            {/* Flower SVG Background */}
            <img
              src="/flw1.svg"
              alt="Onboarding completed illustration"
              className="absolute -right-10 top-2 w-42 h-42 object-cover pointer-events-none select-none"
            />
            <h2 className="relative z-10 text-lg font-semibold text-white leading-snug">
              Seems Like You're Liking WeKraft!
            </h2>
          </div>

          {/* Content Section */}
          <div className="mt-2 flex flex-col text-center gap-4 px-1">
            <h3 className="text-base font-semibold text-white leading-snug">
              Very good! You just completed the basic steps.
            </h3>
            <p className="text-neutral-200 text-xs leading-relaxed mt-1">
              You are ready to manage your repositories, deadlines, and tasks. Upgrade now to unlock advanced tools, unlimited projects, and Kaya AI support.
            </p>
          </div>
        </div>

        {/* Centered Footer Buttons */}
        <div className="flex items-center justify-center gap-5 mt-6">
          <Button
            variant="outline"
            onClick={handleDismissCompleteDialog}
            className="text-xs"
          >
            Later <Frown className="w-3.5 h-3.5" />
          </Button>
          <Button
            onClick={handleUpgradeCompleteDialog}
            className="rounded-lg px-5  text-xs "
          >
            Upgrade now <Clover className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
