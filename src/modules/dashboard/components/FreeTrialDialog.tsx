"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, X, Check, HelpCircle, Clover } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface FreeTrialDialogProps {
  open?: boolean;
  onClose?: () => void;
}

export function FreeTrialDialog({ open: propOpen, onClose }: FreeTrialDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const activateFreeTrial = useMutation(api.user.activateFreeTrial);

  // Sync propOpen with local state
  useEffect(() => {
    if (propOpen !== undefined) {
      setIsOpen(propOpen);
    }
  }, [propOpen]);

  // Listen to custom window event to trigger dialog
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-free-trial-dialog", handleOpenEvent);
    return () => window.removeEventListener("open-free-trial-dialog", handleOpenEvent);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleActivate = async () => {
    setLoading(true);
    try {
      await activateFreeTrial();
      toast.success("1-Week Free Trial activated! You've been upgraded to Plus.");
      handleClose();
      // Reload or trigger updates where necessary
      window.dispatchEvent(new CustomEvent("free-trial-activated"));
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to activate free trial");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[3px] p-4 transition-all duration-300 animate-in fade-in">
      <div className="bg-sidebar text-sidebar-foreground rounded-2xl max-w-[460px] w-full border border-accent shadow-2xl flex flex-col justify-between p-6 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200 relative">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-white transition-colors cursor-pointer rounded-full p-1 hover:bg-white/5 z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Section */}
        <div className="flex flex-col gap-4">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1  text-xs border bg-muted rounded-full w-fit">
            <Clover className="w-3.5 h-3.5" />
            Special Offer: Free Trial
          </span>

          {/* Inner Box with gradient and SVG decoration */}
          <div className="relative overflow-hidden bg-linear-to-br from-transparent via-slate-900 to-purple-900/60 rounded-xl border border-neutral-800 p-5 min-h-[130px] flex items-center">
            {/* Background SVG / Artwork */}
            <div className="absolute right-0 bottom-0 top-0 w-32 pointer-events-none select-none" />
            <img
              src="/21.svg"
              alt="Trial decoration"
              className="absolute -right-3 -bottom-4 w-32 h-32 object-cover pointer-events-none select-none "
            />
            <div className="relative z-10 space-y-1">
              <h2 className="text-xl font-bold text-white leading-snug">
                Unlock 1-Week Plus Trial
              </h2>
              <p className="text-xs text-neutral-300 font-medium text-left max-w-[240px]">
                Experience premium collaboration features with absolutely no charges.
              </p>
            </div>
          </div>

          {/* Content / Features list */}
          <div className="mt-2 flex flex-col gap-4 px-1 text-left">
            <h3 className="text-sm font-semibold text-white">What's included in your trial:</h3>
            <ul className="flex flex-col gap-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <strong className="text-white block font-medium">15 GB Cloud Storage</strong>
                  <span className="text-neutral-400">Plenty of space for all your projects and deliverables.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <strong className="text-white block font-medium">Scale up to 10 Projects</strong>
                  <span className="text-neutral-400">Create, manage, and collaborate across multiple repositories.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <strong className="text-white block font-medium">Advanced Project Analytics</strong>
                  <span className="text-neutral-400">Unlock project heatmap tools and team insights.</span>
                </div>
              </li>
            </ul>

            <div className="bg-accent/40 rounded-lg p-3 text-[10px] text-muted-foreground flex items-start gap-2 border border-border/30 mt-1">
              <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                After the 1-week free trial period, your account will revert back to the Free plan. To keep your premium benefits, you can choose to upgrade to Plus at any time. No automatic charges will apply.
              </span>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <Button
            variant="outline"
            onClick={handleClose}
            className="text-xs hover:bg-white/5 cursor-pointer text-muted-foreground hover:text-white"
          >
            Later
          </Button>
          <Button
            onClick={handleActivate}
            disabled={loading}
            className="rounded-lg px-6 text-xs bg-primary hover:bg-primary/90 text-primary-foreground  flex items-center gap-1.5 cursor-pointer shadow-lg shadow-primary/20"
          >
            {loading ? "Activating..." : "Free Upgrade"}
            <Clover className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
