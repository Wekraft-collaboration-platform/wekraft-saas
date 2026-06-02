"use client";

import { Button } from "@/components/ui/button";
import { Gift, X, Check, Copy, Star, UserPlus, Wallet } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

interface ReferralDialogProps {
  open?: boolean;
  onClose?: () => void;
}

export function ReferralDialog({ open: propOpen, onClose }: ReferralDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const userDetails = useQuery(api.user.getUserDetails);
  const referralCount = useQuery(api.user.getReferralCount);

  // Sync propOpen with local state
  useEffect(() => {
    if (propOpen !== undefined) {
      setIsOpen(propOpen);
    }
  }, [propOpen]);

  // Listen to custom window event to trigger dialog globally
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-referral-dialog", handleOpenEvent);
    return () => window.removeEventListener("open-referral-dialog", handleOpenEvent);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleCopyReferral = () => {
    if (userDetails?.referalCreated) {
      navigator.clipboard.writeText(userDetails.referalCreated);
      setCopied(true);
      toast.success("Referral code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/5 backdrop-blur-[4px] p-4 transition-all duration-300 animate-in fade-in">
      <div className="bg-sidebar text-sidebar-foreground rounded-2xl max-w-[480px] w-full border border-accent shadow-2xl flex flex-col justify-between p-6 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200 relative">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-2 text-muted-foreground hover:text-white transition-colors cursor-pointer rounded-full p-1 hover:bg-white/5 z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Section */}
        <div className="flex flex-col gap-4 mt-4">


          {/* Inner Box with gradient and SVG decoration */}
          <div className="relative overflow-hidden bg-linear-to-br from-transparent via-slate-900/60 to-rose-500/30 rounded-xl border border-neutral-800 p-5 min-h-[130px] flex items-center">
            <div className="absolute right-0 bottom-0 top-0 w-32 pointer-events-none select-none" />
            <img
              src="/flw1.svg"
              alt="Referral decoration"
              className="absolute -right-3 -bottom-4 w-32 h-32 object-cover pointer-events-none select-none"
            />
            <div className="relative z-10 space-y-1">
              <h2 className="text-xl font-bold text-white leading-snug">
                Earn Rewards by Referring
              </h2>
              <p className="text-xs text-neutral-300 font-medium text-left max-w-[260px]">
                Share your unique code and earn cash rewards for every successful referral.
              </p>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="flex items-center gap-2 bg-accent/30 border border-border rounded-lg p-2">
            <span className="flex-1 font-mono text-sm tracking-wider text-white select-all px-1">
              {userDetails?.referalCreated || "Generating..."}
            </span>
            <Button
              variant="default"
              size="sm"
              className="h-7! text-xs shrink-0 cursor-pointer"
              onClick={handleCopyReferral}
              disabled={!userDetails?.referalCreated}
            >
              <span>Copy Link</span>
              {copied ? (
                <Check className="h-4 w-4 text-black" />
              ) : (
                <Copy className="h-4 w-4 " />
              )}
            </Button>
          </div>

          {/* Reward Info */}
          <div className="flex flex-col gap-4 px-1 text-left">
            <h3 className="text-sm font-semibold text-white">How you earn:</h3>
            <ul className="flex flex-col gap-3 text-xs text-neutral-300">
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <strong className="text-white block font-medium">$2 for Every 10 Referrals</strong>
                  <span className="text-neutral-400">For every 10 users who successfully onboard and complete the Getting Started tutorial, you earn $2.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <strong className="text-white block font-medium">Max $10 Reward (50 Referrals)</strong>
                  <span className="text-neutral-400">Refer up to 50 users and earn a maximum of $10 in referral rewards.</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="p-0.5 rounded-full bg-green-500/20 text-emerald-400 mt-0.5">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <strong className="text-white block font-medium">20% Upgrade Commission</strong>
                  <span className="text-neutral-400">When any of your referrals upgrade to a paid plan, you earn a straight 20% commission on their purchase.</span>
                </div>
              </li>
            </ul>

            {/* Progress Bar Section */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400 flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-primary" />
                  Referral Progress
                </span>
                <span className="font-semibold text-white">
                  {Math.min(referralCount ?? 0, 50)} / 50 users
                </span>
              </div>
              <div className="w-full bg-accent/50 rounded-full h-2.5 overflow-hidden border border-border/30">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-primary transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(((referralCount ?? 0) / 50) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-neutral-500">
                <span>$0</span>
                <span>$2</span>
                <span>$4</span>
                <span>$6</span>
                <span>$8</span>
                <span>$10</span>
              </div>
            </div>

            {/* Earnings Summary */}
            <div className="flex items-center justify-between bg-accent/40 rounded-lg p-2 border border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Wallet className="w-3.5 h-3.5 text-zinc-400" />
                <span>Estimated Referral Earnings</span>
              </div>
              <span className="text-sm font-bold text-white">
                ${Math.min(Math.floor((referralCount ?? 0) / 10) * 2, 10).toFixed(2)}
              </span>
            </div>


          </div>
        </div>


      </div>
    </div>,
    document.body
  );
}
