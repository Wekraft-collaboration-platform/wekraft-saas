"use client";

import React, { useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  type OnConnect,
  type Node,
  type Edge,
  BackgroundVariant,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Source Code' },
    position: { x: 50, y: 150 },
    style: { background: '#1c1c1c', color: '#fff', border: '1px solid #333', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
  },
  {
    id: '2',
    data: { label: 'Analysis Engine' },
    position: { x: 250, y: 150 },
    style: { background: '#1c1c1c', color: '#fff', border: '1px solid #333', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
  },
  {
    id: '3',
    type: 'output',
    data: { label: 'Heatmap Report' },
    position: { x: 450, y: 150 },
    style: { background: '#2563eb', color: '#fff', border: '1px solid #1e40af', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e2-3', source: '2', target: '3', style: { stroke: '#3b82f6' } },
];

export const HeatmapFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div className="w-full h-full rounded border overflow-hidden shadow-2xl">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        colorMode="dark"
      >
        <Controls showInteractive={false} className="bg-[#1c1c1c] border-[#333] fill-white" />
        {/* <MiniMap 
            nodeColor="#333" 
            maskColor="rgba(0, 0, 0, 0.5)" 
            className="bg-[#1c1c1c] border border-[#333] rounded-lg"
        /> */}
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#333" />
        <Panel position="top-right" className="bg-[#1c1c1c] p-2 rounded-md border border-[#333] text-[10px] text-neutral-400 font-mono">
           WEKRAFT // FLOW_VISUALIZER_V1
        </Panel>
      </ReactFlow>
    </div>
  );
};
