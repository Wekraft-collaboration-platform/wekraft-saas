"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Infinity, Zap } from "lucide-react";

interface MemberLimitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current number of members in the project */
  currentMemberCount?: number;
  /** The maximum allowed by the current plan */
  memberLimit?: number;
  /** Called when user clicks "Upgrade Now" */
  onUpgrade?: () => void;
}

export const MemberLimitDialog = ({
  open,
  onOpenChange,
  currentMemberCount,
  memberLimit,
  onUpgrade,
}: MemberLimitDialogProps) => {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      // Default: navigate to billing/upgrade page
      window.location.href = "/dashboard/billing";
    }
    onOpenChange(false);
  };

  //  <Image
  //           src="/22.svg"
  //           alt="Member limit reached illustration"
  //           width={160}
  //           height={160}
  //           className="relative z-10 drop-shadow-xl select-none"
  //           priority
  //           unoptimized
  //         />

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md px-4 overflow-hidden border border-accent bg-sidebar rounded-xl">
        <h2 className="px-3 py-1 text-sm border border-accent rounded-full w-fit bg-muted mt-4 ">Member Limit Reached  <Infinity className="inline w-4 h-4" /></h2>

        <div className="h-40 border border-accent bg-linear-to-br from-muted via-muted to-indigo-600/40 rounded-lg relative overflow-hidden">

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.3)_0%,_rgba(255,255,255,0.1)_30%,_transparent_70%)] mix-blend-overlay animate-pulse" />
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6 space-y-4">
          <DialogHeader className="space-y-1.5">

            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {currentMemberCount !== undefined && memberLimit !== undefined ? (
                <>
                  Your project has{" "}
                  <span className="font-semibold text-foreground">
                    {currentMemberCount}/{memberLimit}
                  </span>{" "}
                  seats filled. You cannot accept new members until you upgrade
                  your plan.
                </>
              ) : (
                "You cannot accept new members until you upgrade your plan."
              )}
            </DialogDescription>
          </DialogHeader>

          {/* Upgrade perks hint */}
          <ul className="text-xs text-muted-foreground space-y-1.5 pl-1">
            {[
              "More seats per project",
              "Higher cloud storage Limits",
              "Priority support & features",
            ].map((perk) => (
              <li key={perk} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {perk}
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              className="flex-1 gap-2 font-semibold text-sm"
              onClick={handleUpgrade}
            >
              <Zap className="w-4 h-4" />
              Upgrade Now
            </Button>
            <Button
              variant="outline"
              className="flex-1 text-sm"
              onClick={() => onOpenChange(false)}
            >
              Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
