import React, { useEffect, useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, Panel } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as dagre from 'dagre';
import { Maximize2, X, Loader2, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  // Support Vite CommonJS interop safely
  const dagreLib = dagre.default ? dagre.default : dagre;
  const dagreGraph = new dagreLib.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 60, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 180, height: 50 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagreLib.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - 90,
        y: nodeWithPosition.y - 25,
      },
    };
    return newNode;
  });

  return { nodes: newNodes, edges };
};

export default function MindMapBlock({ data }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Clean up potential LLM markdown artifacts
      let cleanData = data;
      if (typeof cleanData === 'string') {
        cleanData = cleanData.replace(/```json/g, '').replace(/```/g, '').trim();
        // Remove trailing commas that LLMs sometimes generate
        cleanData = cleanData.replace(/,\s*([\]}])/g, '$1');
        cleanData = JSON.parse(cleanData);
      }

      if (!cleanData || !cleanData.nodes) {
        throw new Error("Invalid Mind Map Format");
      }

      // Format nodes nicely
      const initialNodes = cleanData.nodes.map(n => ({
        id: String(n.id),
        data: { label: n.label || n.data?.label || n.id },
        style: {
          background: '#1a1a1a',
          color: '#fff',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '12px',
          fontWeight: 'bold',
          fontSize: '14px',
          textAlign: 'center',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        },
      }));

      const initialEdges = (cleanData.edges || []).map(e => ({
        id: e.id || `e${e.source}-${e.target}`,
        source: String(e.source),
        target: String(e.target),
        label: e.label || '',
        animated: true,
        style: { stroke: '#888', strokeWidth: 2 },
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err) {
      console.error("Mind Map Parse Error:", err);
      setError(`Failed to generate mind map: ${err.message}. Data: ${String(data).substring(0, 100)}`);
    }
  }, [data]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  if (error) {
    return (
      <div className="bg-[#0f0f0f] border border-border/50 rounded-2xl overflow-hidden shadow-lg h-[250px] w-full my-6 flex flex-col items-center justify-center gap-4 text-muted-foreground relative">
        <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
        <Network size={32} className="text-primary/50 animate-bounce" />
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="font-semibold text-sm tracking-widest uppercase">Rendering Mind Map...</span>
        </div>
      </div>
    );
  }

  const FlowComponent = (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      minZoom={0.2}
      maxZoom={4}
      attributionPosition="bottom-right"
      className="dark"
    >
      <Background color="#444" gap={16} size={1} />
      <Controls />
      {!isFullscreen && (
        <Panel position="top-right">
          <button 
            onClick={() => setIsFullscreen(true)}
            className="bg-primary/90 hover:bg-primary text-white p-2 rounded-lg shadow-md backdrop-blur-sm transition-colors"
            title="Open Fullscreen"
          >
            <Maximize2 size={16} />
          </button>
        </Panel>
      )}
    </ReactFlow>
  );

  return (
    <>
      {/* Inline Block */}
      <div className="my-6 border border-border/50 rounded-2xl overflow-hidden shadow-lg bg-[#0f0f0f] relative h-[400px] w-full">
        {FlowComponent}
      </div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex flex-col"
          >
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/50">
              <h2 className="text-xl font-bold tracking-tight">Interactive Mind Map</h2>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-muted hover:bg-red-500/10 hover:text-red-500 text-muted-foreground rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 w-full h-full relative">
              {FlowComponent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
