"use client";

import { useSidebar } from "@/components/ui/sidebar";
import React, { useEffect, useState, useRef } from "react";
import { HeatmapFlow } from "@/modules/workspace/heatmaps/HeatmapFlow";
import { useParams } from "next/navigation";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { HeatmapPanel } from "@/modules/workspace/heatmaps/HeatmapPanel";
import { FolderNode } from "@/modules/workspace/heatmaps/action";


const HeatmapPage = () => {
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useSidebar();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [structure, setStructure] = useState<FolderNode | null>(null);

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
        structure={structure}
        setStructure={setStructure}
        onToggle={(open) => {
          setIsPanelOpen(open);
          if (open) setSidebarOpen(false);
        }}
      />
      {/* REACT FLOW MAP */}
      <div className="flex-1 relative overflow-hidden">
        <HeatmapFlow structure={structure} />
      </div>


    </div>
  );
};

export default HeatmapPage;
