import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Sparkles, Zap, Brain, Rocket, Wand2 } from 'lucide-react';

export const MODELS = [
  {
    id: "openrouter/auto",
    name: "SmartLearn Auto",
    provider: "OpenRouter",
    icon: Wand2,
    description: "Intelligently routes prompts to balance cost and capability."
  },
  {
    id: "gemini:gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    icon: Brain,
    description: "Google's ultra-fast native multi-modal study model."
  },
  {
    id: "groq:llama-3.3-70b-versatile",
    name: "Groq Fast (Llama 3.3)",
    provider: "Groq",
    icon: Zap,
    description: "Lightning fast responses for general queries."
  }
];

export default function ModelSelector({ selectedModelId, onModelSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];
  const SelectedIcon = selectedModel.icon;

  // Removed buggy mousedown listener in favor of a fixed invisible overlay

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 text-[12px] font-bold text-zinc-300 hover:text-white bg-[#0a0a0a] border border-white/10 rounded-full px-3 py-1.5 transition-all hover:bg-white/5 cursor-pointer shadow-sm"
        title="Select AI Engine"
      >
        <SelectedIcon size={14} className="text-red-500" />
        <span className="tracking-wide">{selectedModel.name}</span>
        <ChevronDown size={14} className="opacity-50 ml-1" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute bottom-full right-0 mb-2 w-[220px] bg-[#0a0a0a] border border-white/10 shadow-2xl rounded-2xl overflow-hidden p-1.5 z-50 origin-bottom-right"
            >
            {MODELS.map((model) => {
              const Icon = model.icon;
              const isSelected = model.id === selectedModel.id;
              
              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelSelect(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors duration-200 group ${
                    isSelected ? 'bg-red-500/10' : 'hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isSelected ? 'text-red-500' : 'text-zinc-500 group-hover:text-zinc-300'} />
                    <span className={`font-bold text-[13px] tracking-wide ${isSelected ? 'text-zinc-100' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                      {model.name}
                    </span>
                  </div>
                  {isSelected && <Check size={14} className="text-red-500 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
