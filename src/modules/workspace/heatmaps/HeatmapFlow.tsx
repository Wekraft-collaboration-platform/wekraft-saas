"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type Edge,
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { FolderNode } from "./action";
import { MoveRight, Network, Plus, Minus, ChevronRight } from "lucide-react";
import {
  FileIcon as FileSymbol,
  FolderIcon as FolderSymbol,
  DefaultFolderOpenedIcon as FolderOpenSymbol,
} from "@react-symbols/icons/utils";
import { cn } from "@/lib/utils";

// --- Custom Node Component ---
const FolderNodeComponent = (props: NodeProps) => {
  const data = props.data as {
    label: string;
    level: number;
    isExpanded: boolean;
    folderCount?: number;
    fileCount?: number;
    hasIssue?: boolean;
    isChangedRecently?: boolean;
  };
  const {
    label,
    isExpanded,
    level,
    folderCount,
    fileCount,
    hasIssue,
    isChangedRecently,
  } = data;
  const isRoot = level === 0;

  return (
    <div
      className={cn(
        "px-6 py-4 rounded-xl border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] min-w-[220px] flex items-center gap-4 cursor-pointer select-none relative group",
        isRoot
          ? "bg-[#0D0D0D] text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:scale-[1.02] hover:-translate-y-1 hover:border-primary/30"
          : "bg-[#0D0D0D]/90 backdrop-blur-md border-white/10 hover:border-white/25 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-[#111111] hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98]",
        isExpanded &&
          !isRoot &&
          "ring-1 ring-white/10 border-white/50 bg-[#121212]",
        hasIssue &&
          "border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-1 ring-red-500/40",
        isChangedRecently &&
          !hasIssue &&
          "border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.1)] ring-1 ring-yellow-500/20",
      )}
    >
      {/* Connection Points */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-1 h-1 !bg-current !border-none !opacity-0"
      />

      <div className="flex items-center gap-4 w-full">
        {isRoot ? (
          <div
            className={cn(
              "p-2 rounded-lg border shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] transition-colors",
              hasIssue
                ? "bg-red-500/10 border-red-500/20"
                : isChangedRecently
                  ? "bg-yellow-500/10 border-yellow-500/20"
                  : "bg-blue-600/10 border-blue-500/20",
            )}
          >
            <Network
              size={18}
              className={cn(hasIssue ? "text-red-400" : "text-blue-400")}
            />
          </div>
        ) : (
          <div
            className={cn(
              "p-2.5 bg-zinc-900/80 rounded-lg border border-white/5 shrink-0 group-hover:bg-zinc-800/80 transition-colors shadow-inner",
              hasIssue && "border-red-500/30 bg-red-500/5",
              isChangedRecently &&
                !hasIssue &&
                "border-yellow-500/30 bg-yellow-500/5",
            )}
          >
            <div className="w-5 h-5 flex items-center justify-center">
              {isExpanded ? (
                <FolderOpenSymbol className="w-full h-full" />
              ) : (
                <FolderSymbol folderName={label} className="w-full h-full" />
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col flex-1 truncate">
          <span
            className={cn(
              "text-[14px] tracking-tight truncate",
              isRoot
                ? "font-bold text-white"
                : "font-medium text-zinc-200 group-hover:text-white",
              hasIssue && "text-red-300",
              isChangedRecently && !hasIssue,
            )}
            title={label}
          >
            {label}
          </span>
          <div className="flex items-center gap-2.5 mt-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900/50 border border-white/10 shadow-inner">
              <div className="w-3 h-3">
                <FolderSymbol folderName="folder" className="w-full h-full" />
              </div>
              <span className="text-[10px] font-semibold text-primary">
                {folderCount ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900/50 border border-white/10 shadow-inner">
              <div className="w-3 h-3">
                <FileSymbol fileName="index.tsx" className="w-full h-full" />
              </div>
              <span className="text-[10px] font-semibold text-primary">
                {fileCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {!isRoot && (
          <ChevronRight
            size={14}
            className={cn(
              "text-zinc-600 transition-all duration-300",
              isExpanded ? "rotate-90 text-white" : "group-hover:text-zinc-400",
              hasIssue && "text-red-400/70",
              isChangedRecently && !hasIssue && "text-yellow-400/70",
            )}
          />
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-1 h-1 !bg-current !border-none !opacity-0"
      />
    </div>
  );
};

const nodeTypes = {
  folderNode: FolderNodeComponent,
};

interface HeatmapFlowProps {
  structure: FolderNode | null;
  issuePaths?: string[];
  recentlyChangedPaths?: string[];
}

const HeatmapFlowInner = ({
  structure,
  issuePaths = [],
  recentlyChangedPaths = [],
}: HeatmapFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  // Helper to check if a path contains issues
  const containsIssue = useCallback(
    (path: string) => {
      return issuePaths.some((ip) => ip === path || ip.startsWith(path + "/"));
    },
    [issuePaths],
  );

  // Track expanded paths for toggleable layers
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(["root"]),
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const path = node.id;
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        // Toggle off: Collapse this path and all its descendants
        for (const p of next) {
          if (p === path || p.startsWith(path + "/")) {
            next.delete(p);
          }
        }
      } else {
        // Toggle on: Expand this path and collapse siblings
        const parts = path.split("/");
        const level = parts.length;
        const parentPath = parts.slice(0, -1).join("/");

        // Remove any other expanded path at the same level sharing the same parent
        for (const p of next) {
          if (p === "root") continue;

          const pParts = p.split("/");
          const pLevel = pParts.length;
          const pParentPath = pParts.slice(0, -1).join("/");

          if (pLevel === level && pParentPath === parentPath) {
            // It's a sibling, remove it and all its descendants
            for (const sub of next) {
              if (sub === p || sub.startsWith(p + "/")) {
                next.delete(sub);
              }
            }
          }
        }
        next.add(path);
      }
      return next;
    });
  }, []);

  // Transform FolderNode tree into React Flow nodes and edges
  useEffect(() => {
    if (!structure) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Spacing configuration (centered & clean)
    const HORIZONTAL_GAP = 300;
    const VERTICAL_GAP = 100;

    // Track vertical counts to center the tree
    const levelCounts: Record<number, number> = {};

    // Pre-traverse to calculate total height at each level for centering
    const calculateHeights = (node: FolderNode, level: number) => {
      const path = node.path || "root";
      levelCounts[level] = (levelCounts[level] || 0) + 1;

      if (expandedPaths.has(path)) {
        Object.values(node.children)
          .sort((a, b) => b.totalFileCount - a.totalFileCount)
          .slice(0, 15)
          .forEach((child) => calculateHeights(child, level + 1));
      }
    };

    calculateHeights(structure, 0);

    // Actual traversal to place nodes
    const positionedCount: Record<number, number> = {};
    const traverse = (node: FolderNode, level: number, parentId?: string) => {
      const id = node.path || "root";
      const currentIdx = positionedCount[level] || 0;
      positionedCount[level] = currentIdx + 1;

      const isExpanded = expandedPaths.has(id);

      // Logic for "Last subfolder" coloring:
      // A node has an issue if it or its descendants are in issuePaths
      const nodeHasIssue = containsIssue(node.path || "");

      // It should be RED if:
      // 1. It has an issue
      // 2. AND (it's not expanded OR none of its children have an issue)
      // This ensures the "deepest" visible folder in the issue path is the one that's red.
      const hasIssueChild = Object.values(node.children).some((child) =>
        containsIssue(child.path),
      );
      const shouldBeRed = nodeHasIssue && (!isExpanded || !hasIssueChild);

      // Vertical Centering Logic:
      // Offset y by half of the total height at this level
      const totalAtThisLevel = levelCounts[level] || 1;
      const x = level * HORIZONTAL_GAP;
      const y = (currentIdx - (totalAtThisLevel - 1) / 2) * VERTICAL_GAP;

      newNodes.push({
        id,
        type: "folderNode",
        data: {
          label: node.name,
          level,
          isExpanded,
          folderCount: node.folderCount,
          fileCount: node.fileCount,
          hasIssue: shouldBeRed,
          isChangedRecently: recentlyChangedPaths.includes(node.path || ""),
        },
        position: { x, y },
      });

      if (parentId) {
        newEdges.push({
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: "smoothstep",
          animated: true,
          style: {
            stroke:
              nodeHasIssue && !expandedPaths.has(id)
                ? "rgba(239, 68, 68, 0.5)"
                : recentlyChangedPaths.includes(node.path || "") &&
                    !expandedPaths.has(id)
                  ? "rgba(234, 179, 8, 0.5)"
                  : "rgba(59, 130, 246, 0.5)",
            strokeWidth: 2,
          },
          pathOptions: {
            borderRadius: 20,
            offset: 30,
          },
        } as any);
      }

      if (isExpanded) {
        Object.values(node.children)
          .sort((a, b) => b.totalFileCount - a.totalFileCount)
          .slice(0, 15) // Limit depth for clean view
          .forEach((child) => traverse(child, level + 1, id));
      }
    };

    traverse(structure, 0);

    setNodes(newNodes);
    setEdges(newEdges);

    // Automatic view fitting on update (smoothly)
    setTimeout(() => {
      fitView({
        padding: 0.8, // Increased padding to make nodes look "not too big"
        maxZoom: 0.85, // Constrained limit for premium look
        duration: 1000,
      });
    }, 50);
  }, [
    structure,
    expandedPaths,
    issuePaths,
    setNodes,
    setEdges,
    fitView,
    containsIssue,
    recentlyChangedPaths,
  ]);

  return (
    <div className="w-full h-full bg-[#030303] overflow-hidden relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.8, maxZoom: 0.85 }}
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
        panOnScroll
        selectionOnDrag
        minZoom={0.1}
        maxZoom={4}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(220, 213, 213, 0.41)"
        />

        {/* Premium Integrated Legend \u0026 Navigation Controls (Compact Version) */}
        <Panel
          position="top-left"
          className="mt-5 ml-5 flex items-stretch gap-2.5 select-none scale-90 origin-top-left xl:scale-100"
        >
          {/* Docked Control Strip */}
          <div className="bg-[#050505]/80 backdrop-blur-2xl p-1 rounded-[1.5rem] border border-white/10 flex flex-col gap-0.5 shadow-2xl justify-center">
            <button
              onClick={() => fitView({ duration: 800, padding: 0.8 })}
              className="p-2.5 hover:bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-all duration-200 group/btn"
              title="Reset View"
            >
              <Network
                size={14}
                className="group-hover/btn:scale-110 group-active/btn:scale-95 transition-transform"
              />
            </button>
            <div className="h-px bg-white/5 mx-2.5" />
            <button
              onClick={() => zoomIn({ duration: 300 })}
              className="p-2.5 hover:bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-all duration-150 group/btn"
              title="Zoom In"
            >
              <Plus
                size={14}
                className="group-hover/btn:scale-110 group-active/btn:scale-95 transition-transform"
              />
            </button>
            <button
              onClick={() => zoomOut({ duration: 300 })}
              className="p-2.5 hover:bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-all duration-200 group/btn"
              title="Zoom Out"
            >
              <Minus
                size={14}
                className="group-hover/btn:scale-110 group-active/btn:scale-95 transition-transform"
              />
            </button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export const HeatmapFlow = ({
  structure,
  issuePaths,
  recentlyChangedPaths,
}: HeatmapFlowProps) => {
  return (
    <ReactFlowProvider>
      <HeatmapFlowInner
        structure={structure}
        issuePaths={issuePaths}
        recentlyChangedPaths={recentlyChangedPaths}
      />
    </ReactFlowProvider>
  );
};
