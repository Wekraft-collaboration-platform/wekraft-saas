"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight, Network } from "lucide-react";
import { memo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeatmapPanelProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

/**
 * HeatmapPanel
 *
 * Hierarchy Fix:
 * 1. Root container (relative) handles the layout space.
 * 2. Clipper (overflow-hidden, animated width) hides/shows the panel body.
 * 3. Button (absolute, outside clipper) remains visible even when clipper is w-0.
 */
export const HeatmapPanel = memo(({ isOpen, onToggle }: HeatmapPanelProps) => {
  const { setOpen: setSidebarOpen } = useSidebar();

  const handleToggle = () => {
    const nextState = !isOpen;
    onToggle(nextState);
    if (nextState) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="relative shrink-0 flex flex-col h-full z-10 transition-all duration-300">
      <div
        className={cn(
          "h-full bg-sidebar border-sidebar-border transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
          isOpen
            ? "w-96 border-r shadow-[2px_0_12px_rgba(0,0,0,0.01)]"
            : "w-0 border-r-0 shadow-none",
        )}
      >
        <div className="w-96 h-full flex flex-col shrink-0">
          {/* Panel Header */}
          <div className="flex items-center gap-3 px-6 h-16 border-b shrink-0 bg-sidebar">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Network className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm ">Heatmap Panel</h2>
              <p className="text-xs text-muted-foreground">Analytics View</p>
            </div>
          </div>
        </div>
      </div>
      <div
        className={cn(
          "absolute top-[45%] left-full -translate-x-1.5  -translate-y-1/2 transition-all duration-150 z-50",
          !isOpen && "opacity-100 ",
        )}
      >
        <Button
          onClick={handleToggle}
          className={cn(
            "bg-primary text-muted h-16! w-6! rounded-md  cursor-pointer",
            !isOpen && "text-muted",
          )}
        >
          {isOpen ? (
            <ChevronLeft size={16} className="" />
          ) : (
            <ChevronRight size={20} />
          )}
        </Button>
      </div>
    </div>
  );
});

HeatmapPanel.displayName = "HeatmapPanel";
