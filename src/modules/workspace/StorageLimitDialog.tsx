"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Mail, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface StorageLimitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ownerName?: string;
  ownerEmail?: string;
}

export function StorageLimitDialog({
  isOpen,
  onClose,
  ownerName = "the project owner",
  ownerEmail,
}: StorageLimitDialogProps) {
  const handleCopyEmail = () => {
    if (ownerEmail) {
      navigator.clipboard.writeText(ownerEmail);
      toast.success("Owner's email copied to clipboard!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-background border-border/40 text-foreground overflow-hidden p-6 rounded-2xl shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col items-center text-center space-y-4 pt-4">
          {/* Header Icon with Premium Glow */}
          <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>

          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
              Storage Limit Reached
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              This project has run out of cloud storage space. To upload more files, the project owner needs to upgrade their plan.
            </DialogDescription>
          </DialogHeader>

          {/* Owner details card */}
          <div className="w-full bg-accent/25 border border-border/50 rounded-xl p-4 space-y-2.5 text-left">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Project Owner Details
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate capitalize">
                  {ownerName}
                </span>
                {ownerEmail && (
                  <span className="text-xs text-muted-foreground truncate">
                    {ownerEmail}
                  </span>
                )}
              </div>

              {ownerEmail && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 rounded-lg hover:bg-accent"
                    onClick={handleCopyEmail}
                    title="Copy Email"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-8 h-8 rounded-lg hover:bg-accent"
                    asChild
                  >
                    <a href={`mailto:${ownerEmail}`} title="Email Owner">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex sm:justify-center gap-2">
          <Button
            onClick={onClose}
            className="w-full sm:w-auto font-medium rounded-xl px-6"
          >
            Okay, got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
