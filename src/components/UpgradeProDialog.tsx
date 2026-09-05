"use client";

import { Button } from "@/components/ui/button";
import { Clover, Check, X } from "lucide-react";
import { useUpgradeModalStore } from "@/store/useUpgradeModalStore";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export const UpgradeProDialog = () => {
  const { isOpen, closeModal } = useUpgradeModalStore();
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/web/pricing");
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className="bg-sidebar text-sidebar-foreground rounded-2xl max-w-[480px] w-full border border-accent shadow-2xl flex flex-col justify-between p-6 overflow-hidden !outline-hidden"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">Upgrade to Pro Plan</DialogTitle>
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute right-4 top-2 text-muted-foreground hover:text-white transition-colors cursor-pointer rounded-full p-1 hover:bg-white/5 z-20"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-4 mt-4">
          {/* Inner Box with gradient and SVG decoration */}
          <div className="relative overflow-hidden bg-linear-to-br from-transparent via-slate-900/60 to-purple-500/30 rounded-xl border border-neutral-800 p-5 min-h-[130px] flex items-center">
            <img
              src="/21.svg"
              alt="Upgrade decoration"
              className="absolute -right-3 -bottom-4 w-32 h-32 object-cover pointer-events-none select-none"
            />
            <div className="relative z-10 space-y-1 text-left">
              <h2 className="text-xl font-bold text-white leading-snug">
                Upgrade to Pro Plan
              </h2>
              <p className="text-xs text-neutral-300 font-medium max-w-[260px]">
                Unlock Kaya PM Agent, Harry Developer Agent, and advanced file uploads.
              </p>
            </div>
          </div>

          {/* Features Info */}
          <div className="flex flex-col gap-4 px-1 text-left">
            <h3 className="text-sm font-semibold text-white">What you unlock:</h3>
            <ul className="flex flex-col gap-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <strong className="text-white block font-medium">Kaya PM Assistant</strong>
                  <span className="text-neutral-400">Advanced project analysis, capacity tracking, automated reporting, and standups.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <strong className="text-white block font-medium">Harry Dev Assistant</strong>
                  <span className="text-neutral-400">Senior developer support, codebase reviews, and pull request explanations.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <strong className="text-white block font-medium">PRD & SRS Document Uploads</strong>
                  <span className="text-neutral-400">Upload PDF and Docx files (up to 5MB limit) directly into Kaya to ground your prompts.</span>
                </div>
              </li>
            </ul>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3">
              <Button
                className="flex-1 gap-2 text-xs cursor-pointer"
                onClick={handleUpgrade}
              >
                Upgrade Now
                <Clover className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-xs cursor-pointer"
                onClick={closeModal}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
