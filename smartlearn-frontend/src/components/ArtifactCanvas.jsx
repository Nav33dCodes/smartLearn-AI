import React, { Suspense, useState } from "react";
import { useArtifacts } from "../context/ArtifactContext";
import { X, Play, BrainCircuit, Layers, Network, Maximize2, Minimize2, Code, Eye, Square } from "lucide-react";

// Lazy load heavy components
const SandpackBlock = React.lazy(() => import("./SandpackBlock"));
import QuizBlock from "./QuizBlock";
import FlashcardBlock from "./FlashcardBlock";
import MindMapBlock from "./MindMapBlock";

export default function ArtifactCanvas() {
  const { activeArtifact, setActiveArtifact } = useArtifacts();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewMode, setViewMode] = useState("preview"); // "code" | "preview" | "split"

  if (!activeArtifact) return null;

  const { type, content, title, language } = activeArtifact;

  const handleClose = () => setActiveArtifact(null);

  const getIcon = () => {
    switch (type) {
      case "sandpack": return <Play size={18} className="text-emerald-400 fill-current" />;
      case "quiz": return <BrainCircuit size={18} className="text-blue-400" />;
      case "flashcards": return <Layers size={18} className="text-purple-400" />;
      case "mindmap": return <Network size={18} className="text-amber-400" />;
      default: return null;
    }
  };

  const renderContent = () => {
    switch (type) {
      case "sandpack":
        return (
          <Suspense fallback={<div className="flex h-full items-center justify-center text-zinc-500 animate-pulse">Booting IDE Engine...</div>}>
            <div className="h-full w-full overflow-hidden p-0">
              <SandpackBlock code={content} language={language || "javascript"} viewMode={viewMode} />
            </div>
          </Suspense>
        );
      case "quiz":
        return (
          <div className="h-full w-full p-6">
            <QuizBlock data={content} />
          </div>
        );
      case "flashcards":
        return (
          <div className="h-full w-full p-6">
            <FlashcardBlock data={content} />
          </div>
        );
      case "mindmap":
        return (
          <div className="h-full w-full p-4 relative">
            <MindMapBlock data={content} />
          </div>
        );
      default:
        return (
          <div className="flex h-full items-center justify-center text-zinc-500">
            Unknown artifact type
          </div>
        );
    }
  };

  return (
    <div className={`flex flex-col bg-[#0d0d0d] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-300 transition-all ${
      isFullScreen ? "fixed inset-0 z-[100]" : "h-full w-full"
    }`}>
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-white/5 bg-[#09090b]/80 px-4 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5">
            {getIcon()}
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        </div>
        
        {/* Center Toggles */}
        {type === "sandpack" && (
          <div className="flex items-center bg-[#18181b] p-1 rounded-lg border border-white/5">
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "code" ? "bg-[#27272a] text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
            >
              <Code size={14} /> Code
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${viewMode === "preview" ? "bg-[#27272a] text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}
            >
              <Eye size={14} /> Execution
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          
          <div className="w-px h-4 bg-white/10 mx-1"></div>

          <button 
            onClick={handleClose}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20"
            title="Stop Execution & Close"
          >
            <Square size={12} className="fill-current" />
            Stop Execution
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto relative min-h-0 scrollbar-thin">
        {renderContent()}
      </div>
    </div>
  );
}
