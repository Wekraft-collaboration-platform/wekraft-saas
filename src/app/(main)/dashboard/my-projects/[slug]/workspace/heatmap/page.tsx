"use client";

import { useSidebar } from "@/components/ui/sidebar";
import React, { useEffect, useState, useRef } from "react";
import { HeatmapPanel } from "@/modules/workspace/HeatmapPanel";
import { useParams } from "next/navigation";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";

const HeatmapPage = () => {
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const params = useParams();
  const slug = params.slug as string;

  const project = useQuery(api.project.getProjectBySlug, { slug });
  const repoId = project?.repositoryId;

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
        repoId={repoId}
        onToggle={(open) => {
          setIsPanelOpen(open);
          if (open) setSidebarOpen(false);
        }}
      />
      <div className="flex-1 flex flex-col p-8 overflow-y-auto scroll-smooth">
       
      </div>
    </div>
  );
};

export default HeatmapPage;
