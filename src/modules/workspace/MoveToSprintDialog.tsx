"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Layout } from "lucide-react";

interface MoveToSprintDialogProps {
  trigger: React.ReactNode;
}

export const MoveToSprintDialog = ({ trigger }: MoveToSprintDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#1c1c1c] border-[#2b2b2b] text-neutral-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            Move to Sprint
          </DialogTitle>
        </DialogHeader>
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Layout className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">Sprint Management Coming Soon</h3>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              You'll soon be able to assign tasks to active sprints directly from here.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
