"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { FolderNode } from './action';
import { Folder, MoveRight, Network, Plus, Minus, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Custom Node Component ---
const FolderNodeComponent = (props: NodeProps) => {
    const data = props.data as { label: string; level: number; isExpanded: boolean };
    const { label, isExpanded, level } = data;
    const isRoot = level === 0;
    
    return (
        <div className={cn(
            "px-6 py-4 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] min-w-[220px] flex items-center gap-4 cursor-pointer select-none relative group",
            isRoot 
                ? "bg-[#0A0A0A] bg-gradient-to-br from-blue-600/15 via-transparent to-blue-600/5 border-blue-500/30 text-white shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:scale-[1.02] hover:-translate-y-1 hover:border-blue-400" 
                : "bg-[#0D0D0D]/90 backdrop-blur-md border-white/10 hover:border-white/25 text-zinc-100 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:bg-[#111111] hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.98]",
            isExpanded && !isRoot && "ring-1 ring-white/10 border-white/50 bg-[#121212]"
        )}>
            {/* Connection Points */}
            <Handle type="target" position={Position.Left} className="w-1 h-1 !bg-current !border-none !opacity-0" />
            
                <div className="flex items-center gap-4 w-full">
                    {isRoot ? (
                        <div className="p-2 bg-blue-600/10 rounded-lg border border-blue-500/20 shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                            <Network size={18} className="text-blue-400" />
                        </div>
                    ) : (
                        <div className="p-2.5 bg-zinc-900/80 rounded-lg border border-white/5 shrink-0 group-hover:bg-zinc-800/80 transition-colors shadow-inner">
                            <Folder size={16} className={cn("transition-colors", isExpanded ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
                        </div>
                    )}
                    
                    <div className="flex flex-col flex-1 truncate">
                        <span className={cn(
                            "text-[14px] tracking-tight truncate",
                            isRoot ? "font-bold text-white" : "font-medium text-zinc-200 group-hover:text-white"
                        )} title={label}>{label}</span>
                        {isRoot && <span className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest mt-0.5">Root Hub</span>}
                    </div>

                    {!isRoot && (
                        <ChevronRight 
                            size={14} 
                            className={cn(
                                "text-zinc-600 transition-all duration-300",
                                isExpanded ? "rotate-90 text-white" : "group-hover:text-zinc-400"
                            )} 
                        />
                    )}
                </div>

            <Handle type="source" position={Position.Right} className="w-1 h-1 !bg-current !border-none !opacity-0" />
        </div>
    );
};

const nodeTypes = {
  folderNode: FolderNodeComponent,
};

interface HeatmapFlowProps {
  structure: FolderNode | null;
}

const HeatmapFlowInner = ({ structure }: HeatmapFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  
  // Track expanded paths for toggleable layers
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["root"]));

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    const path = node.id;
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        // Toggle off: Collapse this path and all its descendants
        for (const p of next) {
          if (p === path || p.startsWith(path + '/')) {
            next.delete(p);
          }
        }
      } else {
        // Toggle on: Expand this path and collapse siblings
        const parts = path.split('/');
        const level = parts.length;
        const parentPath = parts.slice(0, -1).join('/');

        // Remove any other expanded path at the same level sharing the same parent
        for (const p of next) {
          if (p === "root") continue;
          
          const pParts = p.split('/');
          const pLevel = pParts.length;
          const pParentPath = pParts.slice(0, -1).join('/');

          if (pLevel === level && pParentPath === parentPath) {
            // It's a sibling, remove it and all its descendants
            for (const sub of next) {
               if (sub === p || sub.startsWith(p + '/')) {
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
    const VERTICAL_GAP = 90;

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
                .forEach(child => calculateHeights(child, level + 1));
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
        
        // Vertical Centering Logic:
        // Offset y by half of the total height at this level
        const totalAtThisLevel = levelCounts[level] || 1;
        const x = level * HORIZONTAL_GAP;
        const y = (currentIdx - (totalAtThisLevel - 1) / 2) * VERTICAL_GAP;

        newNodes.push({
            id,
            type: 'folderNode',
            data: { 
                label: node.name, 
                level,
                isExpanded
            },
            position: { x, y },
        });

        if (parentId) {
            newEdges.push({
                id: `e-${parentId}-${id}`,
                source: parentId,
                target: id,
                type: 'smoothstep',
                animated: true,
                style: { 
                    stroke: 'rgba(59, 130, 246, 0.5)', 
                    strokeWidth: 2,
                },
                pathOptions: {
                    borderRadius: 20,
                    offset: 30
                }
            } as any);
        }

        if (isExpanded) {
            Object.values(node.children)
                .sort((a, b) => b.totalFileCount - a.totalFileCount)
                .slice(0, 15) // Limit depth for clean view
                .forEach(child => traverse(child, level + 1, id));
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
            duration: 1000 
        });
    }, 50);
  }, [structure, expandedPaths, setNodes, setEdges, fitView]);

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
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(220, 213, 213, 0.41)" />
        
        <Panel position="top-right" className="bg-[#080808]/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-[11px] text-zinc-400 font-mono shadow-xl flex items-center gap-3">
           <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse" />
             <span className="text-white/90">Architecture Flow</span>
           </div>
        </Panel>
        
        {/* Premium Integrated Legend & Navigation Controls (Compact Version) */}
        <Panel position="top-left" className="mt-5 ml-5 flex items-stretch gap-2.5 select-none scale-85 origin-top-left xl:scale-90">
            {/* Main Legend Card */}
            <div className="bg-[#050505]/80 backdrop-blur-2xl px-5 py-4 rounded-[2rem] border border-white/10 space-y-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-3 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
                        Network Map
                    </h4>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3.5 group/item cursor-help">
                        <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-blue-600/20 via-blue-500/40 to-blue-400/80 border border-blue-400/30 shadow-[inset_0_0_10px_rgba(59,130,246,0.2)]" />
                        <span className="text-[11px] font-medium text-zinc-400 group-hover/item:text-zinc-200 transition-colors">Root Project</span>
                    </div>
                    <div className="flex items-center gap-3.5 group/item cursor-help">
                        <div className="w-3.5 h-3.5 rounded-full border border-white/10 bg-zinc-900/50 shadow-inner group-hover/item:border-white/30 transition-colors" />
                        <span className="text-[11px] font-medium text-zinc-500 group-hover/item:text-zinc-300 transition-colors">Directory Folders</span>
                    </div>
                </div>
            </div>

            {/* Docked Control Strip */}
            <div className="bg-[#050505]/80 backdrop-blur-2xl p-1 rounded-[1.5rem] border border-white/10 flex flex-col gap-0.5 shadow-2xl justify-center">
                <button 
                  onClick={() => fitView({ duration: 800, padding: 0.8 })}
                  className="p-2.5 hover:bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-all duration-300 group/btn"
                  title="Reset View"
                >
                  <Network size={14} className="group-hover/btn:scale-110 group-active/btn:scale-95 transition-transform" />
                </button>
                <div className="h-px bg-white/5 mx-2.5" />
                <button 
                  onClick={() => zoomIn({ duration: 300 })}
                  className="p-2.5 hover:bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-all duration-200 group/btn"
                  title="Zoom In"
                >
                  <Plus size={14} className="group-hover/btn:scale-110 group-active/btn:scale-95 transition-transform" />
                </button>
                <button 
                  onClick={() => zoomOut({ duration: 300 })}
                  className="p-2.5 hover:bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-all duration-200 group/btn"
                  title="Zoom Out"
                >
                  <Minus size={14} className="group-hover/btn:scale-110 group-active/btn:scale-95 transition-transform" />
                </button>
            </div>
        </Panel>



      </ReactFlow>
    </div>
  );
};

export const HeatmapFlow = ({ structure }: HeatmapFlowProps) => {
  return (
    <ReactFlowProvider>
      <HeatmapFlowInner structure={structure} />
    </ReactFlowProvider>
  );
};
