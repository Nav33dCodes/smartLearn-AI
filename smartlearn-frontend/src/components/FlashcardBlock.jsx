import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

export default function FlashcardBlock({ data }) {
  const cards = useMemo(() => {
    try {
      const result = JSON.parse(data);
      if (Array.isArray(result)) return result;
      if (typeof result === 'object' && result !== null) return [result];
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
          className="relative w-full max-w-sm h-64 cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="front"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gradient-to-br from-background to-muted/30 border border-border rounded-2xl shadow-sm flex flex-col items-center justify-center p-6 text-center"
              >
                <span className="absolute top-4 left-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Front</span>
                <h3 className="text-xl md:text-2xl font-semibold text-foreground leading-snug">
                  {cards[currentIndex].front}
                </h3>
                <div className="absolute bottom-4 text-muted-foreground/50 flex items-center gap-1.5 text-xs font-medium">
                  <RotateCw size={12} /> Click to reveal
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-primary text-primary-foreground rounded-2xl shadow-md flex flex-col items-center justify-center p-6 text-center"
              >
                <span className="absolute top-4 left-4 text-xs font-bold text-primary-foreground/70 uppercase tracking-widest">Back</span>
                <p className="text-lg md:text-xl font-medium leading-relaxed">
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
