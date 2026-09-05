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
import Image from "next/image";

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
      <DialogContent className="sm:max-w-[420px] bg-sidebar border-accent text-foreground overflow-hidden p-0 rounded-xl shadow-xl">
        <div className="relative w-full h-40">
          <Image
            src="/2.svg"
            alt="Storage Limit Reached"
            fill
            className="object-cover"
          />
        </div>

        <div className="p-4 space-y-4 flex flex-col items-center text-center">
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
            <div className="text-sm text-muted-foreground">
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


            </div>
          </div>

          <DialogFooter className="w-full pt-2 flex sm:justify-center gap-2">
            <Button
              onClick={onClose}
              className="w-full sm:w-auto font-medium rounded px-6"
            >
              Okay, got it
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
