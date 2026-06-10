import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Sparkles, Zap, Brain, Rocket } from 'lucide-react';

export const MODELS = [
  {
    id: "groq:llama-3.1-8b-instant",
    name: "Groq Llama 3.1 8B (Instant)",
    provider: "Groq",
    icon: Zap,
    description: "Blistering native Groq speeds for general queries."
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B (Fast)",
    provider: "Meta",
    icon: Sparkles,
    description: "Lightning fast responses for general queries."
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude 4 Sonnet (Research)",
    provider: "Anthropic",
    icon: Brain,
    description: "Unmatched depth and reasoning for heavy research."
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek (Coding)",
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted/80 transition-colors border border-transparent hover:border-border/50 text-foreground font-medium text-sm group cursor-pointer relative z-50"
      >
        <span className="opacity-70 group-hover:opacity-100 transition-opacity">
          SmartLearn <span className="font-bold">{selectedModel.name}</span>
        </span>
        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-72 bg-card border border-border shadow-xl rounded-2xl overflow-hidden p-1.5 z-50"
            >
            <div className="text-xs font-semibold text-muted-foreground px-3 py-2 uppercase tracking-wider">
              Models
            </div>
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
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isSelected ? 'bg-primary/10' : 'hover:bg-muted'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 p-1.5 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-[15px] leading-none ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {model.name}
                      </span>
                      {isSelected && <Check size={16} className="text-primary shrink-0" />}
                    </div>
                    <p className="text-muted-foreground text-[13px] leading-tight mt-1 line-clamp-2">
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
