import React, { Suspense } from "react";
import { useArtifacts } from "../context/ArtifactContext";
import { X, Play, BrainCircuit, Layers, Network } from "lucide-react";

// Lazy load heavy components
const SandpackBlock = React.lazy(() => import("./SandpackBlock"));
import QuizBlock from "./QuizBlock";
import FlashcardBlock from "./FlashcardBlock";
import MindMapBlock from "./MindMapBlock";

export default function ArtifactCanvas() {
  const { activeArtifact, setActiveArtifact } = useArtifacts();

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
            <div className="h-full w-full overflow-hidden p-4">
              <SandpackBlock code={content} language={language || "javascript"} />
            </div>
          </Suspense>
        );
      case "quiz":
        return (
          <div className="h-full w-full overflow-y-auto p-6 scrollbar-thin">
            <QuizBlock content={content} />
          </div>
        );
      case "flashcards":
        return (
          <div className="h-full w-full overflow-y-auto p-6 scrollbar-thin">
            <FlashcardBlock content={content} />
          </div>
        );
      case "mindmap":
        return (
          <div className="h-full w-full p-4 relative">
            <MindMapBlock content={content} />
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
    <div className="flex h-full w-full flex-col bg-[#0d0d0d] shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-right-8 duration-300">
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-white/5 bg-[#09090b]/80 px-4 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/5">
            {getIcon()}
          </div>
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        </div>
        <button 
          onClick={handleClose}
          className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
          title="Close Canvas"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {renderContent()}
      </div>
    </div>
  );
}
