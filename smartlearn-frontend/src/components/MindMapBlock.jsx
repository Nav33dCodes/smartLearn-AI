import React, { useEffect, useState, useCallback } from 'react';
import { ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, Panel, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import * as dagre from 'dagre';
import { Maximize2, X, Loader2, Network, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/axios';
import { toast } from 'sonner';

const CustomMindMapNode = ({ data, id, targetPosition, sourcePosition }) => {
  return (
    <div className="relative group px-4 py-3 bg-[#1a1a1a] text-white border border-[#333] hover:border-primary/50 rounded-lg shadow-md font-bold text-sm text-center min-w-[150px] transition-colors cursor-pointer">
      <Handle type="target" position={targetPosition || Position.Top} className="!w-2 !h-2 !bg-primary border-none" />
      
      <div>{data.label}</div>
      
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={(e) => { e.stopPropagation(); data.onExpand(id, data.label); }}
          disabled={data.isExpanding}
          className="bg-primary hover:bg-primary/90 text-white text-[10px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 font-semibold tracking-wide disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {data.isExpanding ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />} 
          {data.isExpanding ? "Expanding..." : "Expand"}
        </button>
      </div>
      
      <Handle type="source" position={sourcePosition || Position.Bottom} className="!w-2 !h-2 !bg-primary border-none" />
    </div>
  );
};

const nodeTypes = { custom: CustomMindMapNode };

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

export default function MindMapBlock({ data, activeChatId }) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);

  const handleExpand = useCallback(async (nodeId, nodeLabel) => {
    if (!activeChatId) {
      toast.error("Cannot expand outside of a chat context.");
      return;
    }
    
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isExpanding: true } } : n));
    
    try {
      const response = await api.post('/expand-node', {
        parent_node: nodeId,
        chat_id: activeChatId
      });
      
      const newGraph = response.data;
      if (!newGraph.nodes || newGraph.nodes.length === 0) {
        toast.error("AI returned an empty expansion.");
        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isExpanding: false } } : n));
        return;
      }
      
      const formattedNewNodes = newGraph.nodes.map(n => ({
        id: String(n.id),
        type: 'custom',
        data: { label: n.label || n.data?.label || n.id, onExpand: handleExpand, isExpanding: false }
      }));
      
      const formattedNewEdges = (newGraph.edges || []).map(e => ({
        id: e.id || `e${e.source}-${e.target}`,
        source: String(e.source),
        target: String(e.target),
        label: e.label || '',
        animated: true,
        style: { stroke: '#888', strokeWidth: 2 }
      }));
      
      setNodes(currentNodes => {
        const resetNodes = currentNodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isExpanding: false } } : n);
        const mergedNodes = [...resetNodes, ...formattedNewNodes];
        
        setEdges(currentEdges => {
          const mergedEdges = [...currentEdges, ...formattedNewEdges];
          const layouted = getLayoutedElements(mergedNodes, mergedEdges);
          
          Promise.resolve().then(() => {
            setNodes(layouted.nodes);
            setEdges(layouted.edges);
          });
          
          return currentEdges;
        });
        
        return resetNodes;
      });
      
    } catch (err) {
      console.error(err);
      toast.error("Failed to expand node.");
      setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, isExpanding: false } } : n));
    }
  }, [activeChatId]);

  useEffect(() => {
    try {
      let nodesArr = [];
      let edgesArr = [];
      let idCounter = 0;

      // ── Universal recursive tree converter ───────────────────────────
      const treeToGraph = (obj, parentId = null) => {
        const currentId = String(idCounter++);
        const label =
          obj.label || obj.node || obj.title || obj.topic ||
          obj.name || obj.text || obj.concept || String(obj) || 'Node';
        nodesArr.push({ id: currentId, label });
        if (parentId !== null) {
          edgesArr.push({ id: `e${parentId}-${currentId}`, source: parentId, target: currentId });
        }
        const kids =
          obj.children || obj.subtopics || obj.branches ||
          obj.sub || obj.items || obj.subTopics || [];
        if (Array.isArray(kids)) kids.forEach(k => treeToGraph(k, currentId));
      };

      // ── Plain object map converter ({"Root": ["Child1", "Child2"]}) ──
      const mapToGraph = (obj, parentId = null) => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentId = String(idCounter++);
          nodesArr.push({ id: currentId, label: key });
          if (parentId !== null) {
            edgesArr.push({ id: `e${parentId}-${currentId}`, source: parentId, target: currentId });
          }
          if (Array.isArray(value)) {
            value.forEach(child => {
              if (typeof child === 'string') {
                const childId = String(idCounter++);
                nodesArr.push({ id: childId, label: child });
                edgesArr.push({ id: `e${currentId}-${childId}`, source: currentId, target: childId });
              } else if (typeof child === 'object') {
                treeToGraph(child, currentId);
              }
            });
          } else if (typeof value === 'object' && value !== null) {
            mapToGraph(value, currentId);
          }
        });
      };

      // ── Mermaid graph syntax fallback ────────────────────────────────
      const parseMermaid = (text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const nodeMap = {};
        lines.forEach(line => {
          // Match: A[Label] --> B[Label2]  or  A --> B
          const match = line.match(/^([A-Za-z0-9_]+)(?:\[[^\]]*\])?\s*--?>+\s*([A-Za-z0-9_]+)(?:\[[^\]]*\])?/);
          if (match) {
            const [, src, tgt] = match;
            const srcLabel = line.match(new RegExp(`${src}\\[([^\\]]+)\\]`))?.[1] || src;
            const tgtLabel = line.match(new RegExp(`${tgt}\\[([^\\]]+)\\]`))?.[1] || tgt;
            if (!nodeMap[src]) { nodeMap[src] = srcLabel; nodesArr.push({ id: src, label: srcLabel }); }
            if (!nodeMap[tgt]) { nodeMap[tgt] = tgtLabel; nodesArr.push({ id: tgt, label: tgtLabel }); }
            edgesArr.push({ id: `e${src}-${tgt}`, source: src, target: tgt });
          }
        });
        return nodesArr.length > 0;
      };

      // ── STEP 1: Clean raw string ─────────────────────────────────────
      let raw = data;
      if (typeof raw !== 'string') raw = JSON.stringify(raw);
      raw = raw.replace(/```[\w]*/g, '').replace(/```/g, '').trim();
      // Remove trailing commas before ] or }
      raw = raw.replace(/,\s*([\]}])/g, '$1');

      // ── STEP 2: Try JSON parse ───────────────────────────────────────
      let parsed = null;
      const jsonMatch = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch {}
      }
      if (!parsed) {
        try { parsed = JSON.parse(raw); } catch {}
      }

      if (parsed) {
        // ── Format A: {nodes: [...], edges: [...]} ──────────────────
        if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
          nodesArr = parsed.nodes.map(n => ({ id: String(n.id), label: n.label || n.data?.label || String(n.id) }));
          edgesArr = (parsed.edges || []).map(e => ({ id: e.id || `e${e.source}-${e.target}`, source: String(e.source), target: String(e.target) }));
        }
        // ── Format B: {node/title/topic: "...", children: [...]} ────
        else if (parsed.node || parsed.title || parsed.topic || parsed.name || parsed.concept) {
          treeToGraph(parsed, null);
        }
        // ── Format C: {elements: [...]} ─────────────────────────────
        else if (Array.isArray(parsed.elements)) {
          parsed.elements.forEach(el => {
            if (el.group === 'nodes') nodesArr.push({ id: String(el.data.id), label: el.data.label || el.data.id });
            if (el.group === 'edges') edgesArr.push({ id: el.data.id || `e${el.data.source}-${el.data.target}`, source: String(el.data.source), target: String(el.data.target) });
          });
        }
        // ── Format D: plain object map {"Root": ["A","B"]} ──────────
        else if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          mapToGraph(parsed, null);
        }
        // ── Format E: array of nodes ─────────────────────────────────
        else if (Array.isArray(parsed)) {
          parsed.forEach((item, i) => {
            if (typeof item === 'string') nodesArr.push({ id: String(i), label: item });
            else treeToGraph(item, i > 0 ? '0' : null);
          });
        }
      } else {
        // ── STEP 3: Mermaid graph syntax fallback ────────────────────
        if (!parseMermaid(raw)) {
          throw new Error('No parseable mind map structure found');
        }
      }

      if (nodesArr.length === 0) throw new Error('Empty mind map — no nodes produced');

      // ── STEP 4: Build ReactFlow nodes & edges ────────────────────────
      const initialNodes = nodesArr.map(n => ({
        id: String(n.id),
        type: 'custom',
        data: { label: n.label, onExpand: handleExpand, isExpanding: false }
      }));

      const initialEdges = edgesArr.map(e => ({
        id: e.id || `e${e.source}-${e.target}`,
        source: String(e.source),
        target: String(e.target),
        animated: true,
        style: { stroke: '#888', strokeWidth: 2 },
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (err) {
      console.error('Mind Map Parse Error:', err.message, '\nRaw data:', String(data).substring(0, 300));
      setError(err.message);
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
      <div className="bg-[#0f0f0f] border border-red-500/30 rounded-2xl overflow-hidden shadow-lg h-[250px] w-full my-6 flex flex-col items-center justify-center gap-4 text-muted-foreground relative">
        <Network size={32} className="text-red-400/70" />
        <div className="flex flex-col items-center gap-2 px-6 text-center">
          <span className="font-semibold text-sm text-red-400 tracking-wide">Mind Map could not render</span>
          <span className="text-xs text-zinc-500">The AI returned an unexpected format. Try asking again with a clearer prompt.</span>
        </div>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="bg-[#0f0f0f] border border-border/50 rounded-2xl overflow-hidden shadow-lg h-[250px] w-full my-6 flex flex-col items-center justify-center gap-4 text-muted-foreground relative">
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
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
      nodeTypes={nodeTypes}
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
