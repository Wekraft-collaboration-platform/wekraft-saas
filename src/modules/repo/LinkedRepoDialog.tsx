"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  GitPullRequest,
  BarChart3,
  ArrowRight,
  Github,
} from "lucide-react";

interface LinkedRepoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
}

export function LinkedRepoDialog({
  open,
  onOpenChange,
  projectName,
}: LinkedRepoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-sidebar border border-accent shadow-2xl rounded-xl">
        {/* Header Banner */}
        <div className="relative p-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Repo Connected!
              <Badge variant="outline" className="flex items-center gap-1.5 bg-[#18181A] border-accent/60 text-[10px] px-2.5 py-0.5 rounded-full font-semibold text-primary">
                <Github className="size-3 text-primary" />
                <span>GitHub</span>
              </Badge>
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-4 -mt-4 space-y-6">
          {/* Inner Sync Box - Gradient from Muted to Pink & border-accent */}
          <div className="relative overflow-hidden rounded-xl border border-accent bg-linear-to-r from-muted/50 to-orange-500/10 p-5 flex items-center justify-between gap-4 h-32">
            <div className="flex-1 space-y-1.5 z-10 relative">
              <span className="text-[12px] uppercase font-black tracking-wider text-orange-500">
                Sync Status
              </span>
              <p className="text-base foreground leading-snug max-w-[260px]">
                Your repository is now successfully synced with the project{" "}
                <span className="font-bold text-blue-500 capitalize">{projectName}</span>.
              </p>
            </div>
            {/* 25.svg Illustration - Bigger and Absolute */}
            <img
              src="/25.svg"
              alt="Repository Syncing"
              className="absolute -right-8 -bottom-5 w-40 h-40 object-contain pointer-events-none select-none z-0 opacity-90"
            />
          </div>

          {/* Next Steps Section */}
          <div className="space-y-4">
            <h3 className="text-base font-medium text-center text-muted-foreground pl-1">
              Here&apos;s what you can do next:
            </h3>

            <div className="space-y-3.5">
              {/* Perk 1 */}
              <div className="flex items-start gap-3.5 group">

                <Link2 className="size-4" />

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">
                    Link tasks with codebase
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Associate your development tasks with specific folders or files in your linked repository.
                  </p>
                </div>
              </div>

              {/* Perk 2 */}
              <div className="flex items-start gap-3.5 group">

                <GitPullRequest className="size-4" />

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">
                    Import and manage GitHub issues
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Pull your repository&apos;s issues directly into your workspace kanban board to keep everything in one place.
                  </p>
                </div>
              </div>

              {/* Perk 3 */}
              <div className="flex items-start gap-3.5 group">

                <img
                  src="/harry.svg"
                  className="size-4 object-contain"
                  alt="Harry"
                />

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    PR & Commit review by Harry{" "}
                    <span className="text-[8px] bg-purple-500/20 text-purple-400 border border-purple-500/35 px-1 rounded-sm uppercase tracking-widest font-black">
                      PRO
                    </span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Receive automated in-depth code reviews and quality reports from Harry, your dedicated Senior Dev.
                  </p>
                </div>
              </div>

              {/* Perk 4 */}
              <div className="flex items-start gap-3.5 group">

                <BarChart3 className="size-4" />

                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-foreground">
                    Visual codebase heatmaps
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Explore structure, active hotspots, and density changes in interactive visual representations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#0A0A0B]/40 border-t border-border/20 flex justify-end">
          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs gap-1.5 px-6 shadow-lg shadow-primary/10"
          >
            Awesome, let&apos;s go! <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
