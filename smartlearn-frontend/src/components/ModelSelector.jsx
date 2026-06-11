import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Sparkles, Zap, Brain, Rocket, Wand2 } from 'lucide-react';

export const MODELS = [
  {
    id: "openrouter/auto",
    name: "Auto (Dynamic)",
    provider: "OpenRouter",
    icon: Wand2,
    description: "Intelligently routes prompts to balance cost and capability."
  },
  {
    id: "groq:llama-3.1-8b-instant",
    name: "Groq Llama 3.1 8B (Instant)",
    provider: "Groq",
    icon: Zap,
    description: "Blistering native Groq speeds for general queries."
  },
  {
    id: "groq:llama-3.3-70b-versatile",
    name: "Llama 3.3 70B (Fast)",
    provider: "Groq",
    icon: Sparkles,
    description: "Lightning fast responses for general queries."
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet (Research)",
    provider: "Anthropic",
    icon: Brain,
    description: "Unmatched depth and reasoning for heavy research."
  },
  {
    id: "deepseek/deepseek-coder",
    name: "DeepSeek Coder (Coding)",
    provider: "DeepSeek",
    icon: Rocket,
    description: "Specialized powerhouse for software development."
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash (Study)",
    provider: "Google",
    icon: Sparkles,
    description: "Highly capable multimodal study assistant."
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
              className="absolute top-full left-0 mt-2 w-[340px] bg-background border border-border shadow-2xl rounded-3xl overflow-hidden p-2 z-50 origin-top-left"
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
                  className={`w-full flex items-start gap-4 p-3 rounded-2xl text-left transition-all duration-200 group ${
                    isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/60'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 p-2 rounded-full transition-colors ${isSelected ? 'bg-primary/10 text-primary' : 'bg-transparent text-muted-foreground group-hover:text-foreground'}`}>
                    <Icon size={20} className={isSelected ? 'fill-primary/20' : ''} />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold text-[15px] leading-tight ${isSelected ? 'text-primary' : 'text-foreground'}`}>
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
