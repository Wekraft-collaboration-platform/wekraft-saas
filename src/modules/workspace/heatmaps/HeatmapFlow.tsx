"use client";

import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  type Edge,
  type EdgeProps,
  Handle,
  type Node,
  type NodeProps,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

import "@xyflow/react/dist/style.css";
import {
  FileIcon as FileSymbol,
  DefaultFolderOpenedIcon as FolderOpenSymbol,
  FolderIcon as FolderSymbol,
} from "@react-symbols/icons/utils";
import {
  BetweenVerticalEnd,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Info,
  ListChevronsUpDown,
  Minus,
  MoveRight,
  Network,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { FolderNode } from "./action";
import { Separator } from "@/components/ui/separator";

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
    path: string;
    tasks?: any[];
  };
  const {
    label,
    isExpanded,
    level,
    folderCount,
    fileCount,
    hasIssue,
    isChangedRecently,
    path,
    tasks = [],
  } = data;
  const isRoot = level === 0;

  // Filter tasks that are linked directly to this folder path (or direct parent folder of the linked file)
  const linkedTasks = useMemo(() => {
    if (!path || !tasks) return [];
    return tasks.filter((task) => {
      if (!task.linkWithCodebase) return false;
      const link = task.linkWithCodebase;
      const lastSlashIdx = link.lastIndexOf("/");
      const lastSegment = lastSlashIdx !== -1 ? link.substring(lastSlashIdx + 1) : link;
      const containingFolder = lastSegment.includes(".")
        ? (lastSlashIdx !== -1 ? link.substring(0, lastSlashIdx) : "")
        : link;
      return containingFolder === path;
    });
  }, [path, tasks]);

  // Group into completed vs active
  const { completedTasks, activeTasks } = useMemo(() => {
    const completed: any[] = [];
    const active: any[] = [];
    linkedTasks.forEach((task) => {
      if (task.status === "completed") {
        completed.push(task);
      } else {
        active.push(task);
      }
    });
    return { completedTasks: completed, activeTasks: active };
  }, [linkedTasks]);

  const [activeTab, setActiveTab] = useState<"assigned" | "completed">("assigned");

  // Extract assigned members and their active tasks flattened as rows
  const assignedRows = useMemo(() => {
    const rows: { userId: string; name: string; avatar?: string; task: any }[] = [];
    activeTasks.forEach((task) => {
      task.assignees?.forEach((a: any) => {
        rows.push({
          userId: a.userId,
          name: a.name,
          avatar: a.avatar,
          task,
        });
      });
    });
    return rows;
  }, [activeTasks]);

  // Extract members who completed tasks flattened as rows
  const completedRows = useMemo(() => {
    const rows: { userId: string; name: string; avatar?: string; task: any }[] = [];
    completedTasks.forEach((task) => {
      task.assignees?.forEach((a: any) => {
        rows.push({
          userId: a.userId,
          name: a.name,
          avatar: a.avatar,
          task,
        });
      });
    });
    return rows;
  }, [completedTasks]);

  return (
    <div
      className={cn(
        "px-6 py-4 rounded-xl border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] w-[260px] flex items-center gap-4 cursor-pointer select-none relative group",
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
        "border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,1,0.1)] ring-1 ring-yellow-500/20",
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
          <div className="flex items-center justify-between gap-4">
            <p
              className={cn(
                "text-base tracking-tight truncate",
                isRoot
                  ? "font-bold text-white"
                  : "font-medium text-zinc-100 group-hover:text-white",
                hasIssue && "text-red-300",
                isChangedRecently && !hasIssue,
              )}
              title={label}
            >
              {label}
            </p>

            {!isRoot && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    size="icon-xs"
                    variant="outline"
                    onClick={(e) => e.stopPropagation()}
                    className="z-10 bg-zinc-900 border-zinc-800 hover:bg-zinc-800"
                  >
                    <ChevronUp className="w-4 h-4 text-zinc-200" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[280px] h-[250px] p-0 bg-card border border-zinc-800 text-white rounded-xl shadow-2xl z-[9999] flex flex-col overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                  side="top"
                  align="end"
                >
                  <div className="flex flex-col h-full overflow-hidden">
                    <div className="border-b border-white/10 bg-muted py-3 px-3 flex items-center justify-between shrink-0 ">
                      <h4 className="text-xs text-zinc-100 flex items-center gap-1.5">
                        <span>Code Ownership</span>
                      </h4>
                      <p
                        className="text-[11px] text-zinc-200 truncate max-w-[110px]"
                        title={path}
                      >
                        /{path}
                      </p>
                    </div>

                    {assignedRows.length === 0 && completedRows.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic py-8 text-center flex-1 flex items-center justify-center">
                        No tasks linked to this folder yet.
                      </p>
                    ) : (
                      <>
                        {/* Tabs Bar */}
                        <div className="flex border-b border-white/15 mb-3 p-2 shrink-0">
                          <button
                            type="button"
                            className={cn(
                              "flex-1 pb-2 text-xs text-center transition-colors cursor-pointer",
                              activeTab === "assigned"
                                ? "text-white"
                                : "text-zinc-500 border-transparent hover:text-zinc-300"
                            )}
                            onClick={() => setActiveTab("assigned")}
                          >
                            Assigned ({assignedRows.length})
                          </button>
                          <Separator orientation="vertical" className="h-3 bg-white/30" />
                          <button
                            type="button"
                            className={cn(
                              "flex-1 pb-2 text-xs text-center border-b transition-colors cursor-pointer",
                              activeTab === "completed"
                                ? "text-white"
                                : "text-zinc-500 border-transparent hover:text-zinc-300"
                            )}
                            onClick={() => setActiveTab("completed")}
                          >
                            Completed ({completedRows.length})
                          </button>
                        </div>

                        {/* List Content */}
                        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-2 px-3">
                          {activeTab === "assigned" ? (
                            assignedRows.length === 0 ? (
                              <p className="text-xs text-zinc-500 italic py-8 text-center">
                                No active tasks.
                              </p>
                            ) : (
                              assignedRows.map((row) => (
                                <div
                                  key={`${row.userId}-${row.task._id}`}
                                  className="flex items-center justify-between gap-3 py-1 last:border-0"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Avatar className="w-5 h-5 border border-white/10 shrink-0">
                                      <AvatarImage
                                        src={row.avatar}
                                        alt={row.name}
                                      />
                                      <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-300">
                                        {row.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span
                                      className="text-xs font-medium text-zinc-100 truncate max-w-[100px]"
                                      title={row.name}
                                    >
                                      {row.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0 max-w-[140px]">
                                    <span
                                      className="text-[11px] text-zinc-200 truncate"
                                      title={row.task.title}
                                    >
                                      {row.task.title}
                                    </span>
                                    {row.task.priority && (
                                      <span
                                        className={cn(
                                          "text-[8px] px-1 py-0.2 rounded-sm border capitalize shrink-0 font-mono",
                                          row.task.priority === "high" &&
                                          "text-red-400 border-red-500/20 bg-red-500/5",
                                          row.task.priority === "medium" &&
                                          "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
                                          row.task.priority === "low" &&
                                          "text-zinc-400 border-zinc-500/20 bg-zinc-500/5",
                                        )}
                                      >
                                        {row.task.priority.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )
                          ) : (
                            completedRows.length === 0 ? (
                              <p className="text-xs text-zinc-500 italic py-8 text-center">
                                No completed tasks.
                              </p>
                            ) : (
                              completedRows.map((row) => (
                                <div
                                  key={`${row.userId}-${row.task._id}`}
                                  className="flex items-center justify-between gap-3 py-1 border-b border-white/5 last:border-0"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Avatar className="w-5 h-5 border border-white/10 shrink-0">
                                      <AvatarImage
                                        src={row.avatar}
                                        alt={row.name}
                                      />
                                      <AvatarFallback className="text-[9px] bg-zinc-800 text-zinc-300">
                                        {row.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span
                                      className="text-xs font-medium text-zinc-200 truncate max-w-[100px]"
                                      title={row.name}
                                    >
                                      {row.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0 max-w-[140px]">
                                    <span
                                      className="text-[11px] text-zinc-400 line-through truncate"
                                      title={row.task.title}
                                    >
                                      {row.task.title}
                                    </span>
                                  </div>
                                </div>
                              ))
                            )
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="flex items-center gap-2.5 mt-2">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900/50 border border-white/10 shadow-inner">
              <div className="w-4 h-4">
                <FolderSymbol folderName="folder" className="w-full h-full" />
              </div>
              <span className="text-[11px] font-semibold text-primary">
                {folderCount ?? 0}
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900/50 border border-white/10 shadow-inner">
              <div className="w-4 h-4">
                <FileSymbol fileName="index.tsx" className="w-full h-full" />
              </div>
              <span className="text-[11px] font-semibold text-primary">
                {fileCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {!isRoot && (
          <ChevronRight
            size={14}
            className={cn(
              "text-zinc-400 transition-all duration-300",
              isExpanded ? "rotate-90 text-white" : "group-hover:text-white",
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

const TreeEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: EdgeProps) => {
  const midX = sourceX + (targetX - sourceX) / 2;
  const path = `M ${sourceX} ${sourceY} H ${midX} V ${targetY} H ${targetX}`;

  return <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />;
};

const edgeTypes = {
  treeEdge: TreeEdge,
};

interface HeatmapFlowProps {
  structure: FolderNode | null;
  issuePaths?: string[];
  recentlyChangedPaths?: string[];
  isFreeTier?: boolean;
  tasks?: any[];
}

const HeatmapFlowInner = ({
  structure,
  issuePaths = [],
  recentlyChangedPaths = [],
  isFreeTier = false,
  tasks = [],
}: HeatmapFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [isLegendOpen, setIsLegendOpen] = useState(true);

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
      const shouldBeRed =
        !isFreeTier && nodeHasIssue && (!isExpanded || !hasIssueChild);

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
          path: node.path || "",
          level,
          isExpanded,
          folderCount: node.folderCount,
          fileCount: node.fileCount,
          hasIssue: shouldBeRed,
          isChangedRecently:
            !isFreeTier && recentlyChangedPaths.includes(node.path || ""),
          tasks: tasks,
        },
        position: { x, y },
      });

      if (parentId) {
        newEdges.push({
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          type: "treeEdge",
          animated: true,
          style: {
            stroke:
              !isFreeTier && nodeHasIssue && !expandedPaths.has(id)
                ? "rgba(239, 68, 68, 0.5)"
                : !isFreeTier &&
                  recentlyChangedPaths.includes(node.path || "") &&
                  !expandedPaths.has(id)
                  ? "rgba(234, 179, 8, 0.5)"
                  : "rgba(59, 130, 246, 0.5)",
            strokeWidth: 2,
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
        padding: 0.3, // Decreased padding to bring the view closer
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
    isFreeTier,
    tasks,
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
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2, maxZoom: 0.85 }}
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
          <div className="bg-[#050505]/80 backdrop-blur-2xl p-1 rounded-2xl border border-white/10 flex flex-col gap-0.5 shadow-2xl justify-center">
            <button
              onClick={() => fitView({ duration: 800, padding: 0.2 })}
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

        <Panel
          position="top-right"
          className="m-5 select-none origin-top-right"
        >
          <div
            className={cn(
              "bg-[#050505]/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-xl transition-all duration-300 overflow-hidden",
              isLegendOpen
                ? "w-[220px] p-4"
                : "w-[44px] h-[44px] p-0 flex items-center justify-center",
            )}
          >
            {isLegendOpen ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-primary" />
                    <span className="text-[10px] font-semibold text-primary">
                      Legend
                    </span>
                  </div>
                  <button
                    onClick={() => setIsLegendOpen(false)}
                    className="p-1 hover:bg-white/5 rounded-md transition-colors"
                  >
                    <ChevronUp size={14} className="text-zinc-500" />
                  </button>
                </div>

                <div className="space-y-3 pt-1">
                  {!isFreeTier && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] shrink-0" />
                        <span className="text-[11px] font-medium text-zinc-300">
                          Active Issues / Errors
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)] shrink-0" />
                        <span className="text-[11px] font-medium text-zinc-300">
                          Modified (Last 7 Days)
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500/50 border border-blue-500/30 shrink-0" />
                    <span className="text-[11px] font-medium text-zinc-500">
                      Stable Folders (No Recent Chnages/ Issues)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsLegendOpen(true)}
                className="w-full h-full flex items-center justify-center hover:bg-white/5 transition-colors"
                title="Show Legend"
              >
                <Info size={18} className="text-zinc-400" />
              </button>
            )}
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
  isFreeTier,
  tasks,
}: HeatmapFlowProps) => {
  return (
    <ReactFlowProvider>
      <HeatmapFlowInner
        structure={structure}
        issuePaths={issuePaths}
        recentlyChangedPaths={recentlyChangedPaths}
        isFreeTier={isFreeTier}
        tasks={tasks}
      />
    </ReactFlowProvider>
  );
};
