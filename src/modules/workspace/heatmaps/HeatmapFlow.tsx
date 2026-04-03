"use client";

import React, { useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Panel,
  BackgroundVariant,
  type Node,
  type Edge,
  Handle,
  Position,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { FolderNode } from './action';
import { Folder, Files, MoveRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Custom Node Component ---
const FolderNodeComponent = ({ data }: { data: { label: string; fileCount: number; totalFileCount: number; isRoot?: boolean } }) => {
    const { label, fileCount, totalFileCount, isRoot } = data;
    
    // Calculate "Density" (e.g., more files = warmer border)
    const densityColor = totalFileCount > 50 ? "border-orange-500/50 shadow-orange-500/10" : 
                         totalFileCount > 20 ? "border-blue-500/50 shadow-blue-500/10" : 
                         "border-border/50";

    return (
        <div className={cn(
            "px-4 py-3 rounded-xl border bg-card/80 backdrop-blur-md shadow-xl min-w-[200px] transition-all hover:scale-105 hover:bg-card",
            densityColor,
            isRoot && "border-primary/50 shadow-primary/20 ring-1 ring-primary/20"
        )}>
            <Handle type="target" position={Position.Left} className="w-2! h-2! bg-muted-foreground/30 border-none" />
            
            <div className="flex items-start gap-3">
                <div className={cn(
                    "p-2 rounded-lg",
                    isRoot ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                    <Folder size={18} />
                </div>
                
                <div className="flex-1 space-y-1 overflow-hidden">
                    <p className="text-sm font-bold truncate leading-none mb-1">{label}</p>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                            <Files size={10} />
                            <span>{fileCount} direct</span>
                        </div>
                        {totalFileCount > fileCount && (
                            <div className="text-[10px] text-primary/70 font-semibold bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                                {totalFileCount} total
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            <Handle type="source" position={Position.Right} className="w-2! h-2! bg-primary/50 border-none" />
        </div>
    );
};

const nodeTypes = {
  folderNode: FolderNodeComponent,
};

interface HeatmapFlowProps {
  structure: FolderNode | null;
}

export const HeatmapFlow = ({ structure }: HeatmapFlowProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);


  // Transform FolderNode tree into React Flow nodes and edges
  useEffect(() => {
    if (!structure) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // BFS layout parameters
    const NODE_WIDTH = 280;
    const NODE_HEIGHT = 100;
    const HORIZONTAL_GAP = 120;
    const VERTICAL_GAP = 40;

    const traverse = (node: FolderNode, level: number, indexAtLevel: number, parentId?: string) => {
      const id = node.path || "root";
      
      // Calculate position (simple hierarchical layout)
      // Level 0 is at x: 50
      // We'll use a recursive offset to handle child positioning better
      const x = 50 + level * (NODE_WIDTH + HORIZONTAL_GAP);
      const y = 150 + indexAtLevel * (NODE_HEIGHT + VERTICAL_GAP);

      newNodes.push({
        id,
        type: 'folderNode',
        data: { 
            label: node.name, 
            fileCount: node.fileCount, 
            totalFileCount: node.totalFileCount,
            isRoot: level === 0 
        },
        position: { x, y },
      });

      if (parentId) {
        newEdges.push({
          id: `e-${parentId}-${id}`,
          source: parentId,
          target: id,
          animated: node.totalFileCount > 20, // Animate "heavy" paths
          style: { 
            stroke: node.totalFileCount > 50 ? '#f97316' : '#3b82f6', 
            strokeWidth: Math.max(1, Math.min(4, node.totalFileCount / 10)) 
          },
        });
      }

      // Process children
      Object.values(node.children)
        .sort((a, b) => b.totalFileCount - a.totalFileCount) // Important first
        .forEach((child, i) => {
          // Flatten child indexing for simple layout
          // In a real app, we'd use a proper tree layout library (like d3-tree or dagre)
          // For now, we'll just offset y based on the caller's accumulated index
          traverse(child, level + 1, i + (indexAtLevel * 2), id); 
        });
    };

    // A better way to avoid overlap in simple layout: Track total nodes per level
    const levelCounts: Record<number, number> = {};
    const betterTraverse = (node: FolderNode, level: number, parentId?: string) => {
        const id = node.path || "root";
        const currentIdx = levelCounts[level] || 0;
        levelCounts[level] = currentIdx + 1;

        const x = 50 + level * (NODE_WIDTH + HORIZONTAL_GAP);
        const y = 50 + currentIdx * (NODE_HEIGHT + VERTICAL_GAP);

        newNodes.push({
            id,
            type: 'folderNode',
            data: { 
                label: node.name, 
                fileCount: node.fileCount, 
                totalFileCount: node.totalFileCount,
                isRoot: level === 0 
            },
            position: { x, y },
        });

        if (parentId) {
            newEdges.push({
                id: `e-${parentId}-${id}`,
                source: parentId,
                target: id,
                animated: node.totalFileCount > 20,
                style: { 
                    stroke: node.totalFileCount > 50 ? '#f97316' : '#3b82f6', 
                    strokeWidth: Math.max(1.5, Math.min(5, node.totalFileCount / 15)) 
                },
            });
        }

        Object.values(node.children)
            .sort((a, b) => b.totalFileCount - a.totalFileCount)
            .slice(0, 10) // Limit children in flow to avoid chaos
            .forEach(child => betterTraverse(child, level + 1, id));
    };

    betterTraverse(structure, 0);

    setNodes(newNodes);
    setEdges(newEdges);
  }, [structure, setNodes, setEdges]);

  return (
    <div className="w-full h-full rounded-2xl border bg-sidebar/50 border-border/50 overflow-hidden shadow-2xl relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        proOptions={{ hideAttribution: true }}
      >
        <Controls showInteractive={false} className="bg-sidebar border-border fill-foreground shadow-xl rounded-lg overflow-hidden" />
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.05)" />
        <Panel position="top-right" className="bg-sidebar/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border/50 text-[10px] text-muted-foreground font-mono shadow-lg flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
           HUB // REPO_HEATMAP_LIVE
        </Panel>
        
        {/* Legend Panel */}
        <Panel position="bottom-left" className="bg-sidebar/80 backdrop-blur-md p-4 rounded-xl border border-border/50 space-y-2 shadow-2xl">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Heatmap Legend</h4>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-orange-500/50 border border-orange-500/50" />
                <span className="text-[10px]">High Density ({">"}50 files)</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500/50 border border-blue-500/50" />
                <span className="text-[10px]">Active Area ({">"}20 files)</span>
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-border/20">
                <MoveRight size={10} className="text-blue-500" />
                <span className="text-[10px]">Thickness = Total Files</span>
            </div>
        </Panel>

      </ReactFlow>
    </div>
  );
};
