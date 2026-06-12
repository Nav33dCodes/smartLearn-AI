import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

export default function FlashcardBlock({ data }) {
  const cards = useMemo(() => {
    try {
      let cleanData = data;
      if (typeof cleanData === 'string') {
        cleanData = cleanData.replace(/```json/g, '').replace(/```/g, '').trim();
        // Extract just the JSON object/array if the AI hallucinated conversational text around it
        const jsonMatch = cleanData.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          cleanData = jsonMatch[0];
        }
        cleanData = cleanData.replace(/,\s*([\]}])/g, '$1'); // Fix trailing commas
        const result = JSON.parse(cleanData);
        if (Array.isArray(result)) return result;
        if (typeof result === 'object' && result !== null) return [result];
      }
      return [];
    } catch (e) {
      return [];
    }
  }, [data]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="my-6 border border-border rounded-2xl bg-card shadow-sm overflow-hidden p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center gap-3 text-muted-foreground">
          <Layers className="animate-spin-slow" size={24} /> 
          <span className="text-sm font-medium">Generating Flashcards...</span>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i < cards.length - 1 ? i + 1 : 0));
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => (i > 0 ? i - 1 : cards.length - 1));
    }, 150);
  };

  return (
    <div className="my-6 border border-border rounded-2xl bg-card shadow-sm overflow-hidden select-none">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-primary" />
          <span className="font-semibold text-sm tracking-tight">Flashcard Deck</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          Card {currentIndex + 1} of {cards.length}
        </span>
      </div>

      {/* Card Body */}
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div 
          className="relative w-full max-w-sm h-64 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="front"
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-[#0f0f0f] border-2 border-white/10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] flex flex-col items-center justify-center p-8 text-center transition-all duration-300"
              >
                <span className="absolute top-5 left-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Front</span>
                <h3 className="text-xl md:text-2xl font-bold text-zinc-100 leading-snug">
                  {cards[currentIndex].front}
                </h3>
                <div className="absolute bottom-5 text-muted-foreground/40 flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase">
                  <RotateCw size={12} /> Click to flip
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-red-600 border-2 border-red-500 text-white rounded-3xl shadow-[0_10px_40px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center p-8 text-center"
              >
                <span className="absolute top-5 left-6 text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Back</span>
                <p className="text-lg md:text-xl font-bold leading-relaxed">
                  {cards[currentIndex].back}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-10">
          <button 
            onClick={handlePrev}
            className="p-3 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
            title="Previous Card"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={() => setIsFlipped(!isFlipped)}
            className="px-6 py-2.5 font-medium border border-border hover:bg-muted rounded-xl transition-colors text-sm"
          >
            Flip Card
          </button>

          <button 
            onClick={handleNext}
            className="p-3 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"
            title="Next Card"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
