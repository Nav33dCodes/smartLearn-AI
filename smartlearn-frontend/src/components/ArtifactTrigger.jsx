import React, { useEffect } from "react";
import { useArtifacts } from "../context/ArtifactContext";
import { Play, BrainCircuit, Layers, Network, ChevronRight, CheckCircle2 } from "lucide-react";

export default function ArtifactTrigger({ type, content, title, language }) {
  const { setActiveArtifact, activeArtifact } = useArtifacts();

  // Auto-open the artifact when it is generated or loaded.
  // Because ChatWindow renders top-to-bottom, the latest artifact in the thread will be the final one to call this, opening the most relevant canvas.
  useEffect(() => {
    setActiveArtifact({ type, content, title, language });
  }, []);

  const handleOpen = () => {
    setActiveArtifact({ type, content, title, language });
  };

  const isActive = activeArtifact?.content === content;

  const getIcon = () => {
    switch (type) {
      case "sandpack": return <Play size={14} className="text-emerald-400 fill-current" />;
      case "quiz": return <BrainCircuit size={14} className="text-blue-400" />;
      case "flashcards": return <Layers size={14} className="text-purple-400" />;
      case "mindmap": return <Network size={14} className="text-amber-400" />;
      default: return <Play size={14} className="text-zinc-400" />;
    }
  };

  return (
    <div 
      onClick={handleOpen}
      className={`group w-fit min-w-[280px] relative my-4 flex cursor-pointer items-center justify-between rounded-2xl border p-3 shadow-sm transition-all duration-300
        ${isActive 
          ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20" 
          : "border-white/10 bg-[#0d0d0d] hover:bg-[#18181b] hover:border-white/20"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5`}>
          {getIcon()}
        </div>
        <div className="flex flex-col">
          <h4 className="text-sm font-semibold text-zinc-100 leading-tight">{title}</h4>
          <p className="text-[11px] font-medium text-zinc-500 flex items-center gap-1 mt-0.5">
            {isActive ? (
              <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 size={10} /> Canvas Open</span>
            ) : (
              "Click to view artifact"
            )}
          </p>
        </div>
      </div>
      <div className="ml-6 flex items-center text-zinc-500 transition-colors group-hover:text-zinc-300">
        <ChevronRight size={16} className={`transition-transform duration-300 ${isActive ? "rotate-90 text-primary" : "group-hover:translate-x-0.5"}`} />
      </div>
    </div>
  );
}
