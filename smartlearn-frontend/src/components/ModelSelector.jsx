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
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-muted/80 text-foreground transition-colors font-semibold text-[15px] group cursor-pointer focus-ring"
        title="Select AI Engine"
      >
        <span className="flex items-center gap-2">
          SmartLearn <span className="opacity-70 font-medium">{selectedModel.name.split(' ')[0]}</span>
        </span>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform duration-200 ml-1 ${isOpen ? 'rotate-180' : ''}`} />
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
              className="absolute top-full left-0 mt-3 w-[350px] bg-background/70 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)] rounded-3xl overflow-hidden p-2 z-50 origin-top-left"
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
                  className={`w-full flex items-start gap-4 p-3 rounded-2xl text-left transition-all duration-300 group ${
                    isSelected ? 'bg-primary/10 shadow-sm' : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 p-2 rounded-full transition-colors duration-300 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-transparent text-muted-foreground group-hover:text-primary'}`}>
                    <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} className={isSelected ? 'drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]' : ''} />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-[15px] leading-tight tracking-wide ${isSelected ? 'text-primary' : 'text-foreground/90 group-hover:text-foreground'}`}>
                        {model.name}
                      </span>
                      {isSelected && <Check size={18} className="text-primary shrink-0" />}
                    </div>
                    <p className="text-muted-foreground text-[13px] leading-snug mt-1">
                      {model.description}
                    </p>
                  </div>
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
