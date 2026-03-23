"use client";

import { useSidebar } from "@/components/ui/sidebar";
import React, { useEffect, useState, useRef } from "react";
import { HeatmapPanel } from "@/modules/workspace/HeatmapPanel";

const HeatmapPage = () => {
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const didInit = useRef(false);

  useEffect(() => {
    if (!didInit.current) {
      setSidebarOpen(false);
      setIsPanelOpen(true);
      didInit.current = true;
    }
  }, [setSidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && isPanelOpen) {
      setIsPanelOpen(false);
    }
  }, [sidebarOpen, isPanelOpen]);

  return (
    <div className="flex h-svh w-full overflow-hidden bg-background">
      <HeatmapPanel
        isOpen={isPanelOpen}
        onToggle={(open) => {
          setIsPanelOpen(open);
          if (open) setSidebarOpen(false);
        }}
      />
      <div className="flex-1 flex flex-col p-8 overflow-y-auto scroll-smooth">
        <header className="mb-10 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
              Workspace / Heatmap
            </p>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter">
            Activity Heatmap
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Monitor activity intensity across the project timeline. This panel
            pushes content to the right ensuring no coverage.
          </p>
        </header>
      </div>
    </div>
  );
};

export default HeatmapPage;
