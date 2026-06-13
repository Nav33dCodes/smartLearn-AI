import React from "react";
import { useArtifacts } from "../context/ArtifactContext";
import { Play, BrainCircuit, Layers, Network, ChevronRight } from "lucide-react";

export default function ArtifactTrigger({ type, content, title, language }) {
  const { setActiveArtifact, activeArtifact } = useArtifacts();

  const handleOpen = () => {
    setActiveArtifact({ type, content, title, language });
  };

  const isActive = activeArtifact?.content === content; // simple equality check

  const getIcon = () => {
    switch (type) {
      case "sandpack": return <Play size={16} className="text-emerald-400 fill-current" />;
      case "quiz": return <BrainCircuit size={16} className="text-blue-400" />;
      case "flashcards": return <Layers size={16} className="text-purple-400" />;
      case "mindmap": return <Network size={16} className="text-amber-400" />;
      default: return <Play size={16} className="text-zinc-400" />;
    }
  };

  const getGlowColor = () => {
    switch (type) {
      case "sandpack": return "hover:border-emerald-500/30 group-hover:bg-emerald-500/10";
      case "quiz": return "hover:border-blue-500/30 group-hover:bg-blue-500/10";
      case "flashcards": return "hover:border-purple-500/30 group-hover:bg-purple-500/10";
      case "mindmap": return "hover:border-amber-500/30 group-hover:bg-amber-500/10";
      default: return "hover:border-zinc-500/30 group-hover:bg-zinc-500/10";
    }
  };

  return (
    <div 
      onClick={handleOpen}
      className={`group relative my-4 flex cursor-pointer items-center justify-between rounded-xl border p-4 shadow-sm transition-all duration-300
        ${isActive 
          ? "border-primary/50 bg-primary/5" 
          : "border-white/10 bg-[#09090b] hover:bg-[#121214]"
        }
      `}
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 transition-colors ${getGlowColor()}`}>
          {getIcon()}
        </div>
        <div>
          <h4 className="font-semibold text-zinc-100">{title}</h4>
          <p className="text-xs text-zinc-400">Click to view artifact</p>
        </div>
      </div>
      <div className="flex items-center text-zinc-500 transition-colors group-hover:text-zinc-300">
        <span className="mr-2 text-xs font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {isActive ? "Currently viewing" : "Open Canvas"}
        </span>
        <ChevronRight size={18} />
      </div>
    </div>
  );
}
