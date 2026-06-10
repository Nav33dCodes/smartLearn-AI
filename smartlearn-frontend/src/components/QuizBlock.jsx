import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, BrainCircuit } from 'lucide-react';

export default function QuizBlock({ data }) {
  const [questions, setQuestions] = useState(() => {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse quiz data", e);
      return [];
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="my-6 border border-border rounded-2xl bg-card shadow-sm overflow-hidden p-6 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col items-center gap-3 text-muted-foreground">
          <BrainCircuit className="animate-pulse" size={24} /> 
          <span className="text-sm font-medium">Generating Quiz...</span>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSelect = (index) => {
    if (selectedOption !== null) return; // already answered
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === currentQ.answer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-6 p-6 border border-border rounded-2xl bg-card shadow-sm text-center"
      >
        <div className="w-16 h-16 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <BrainCircuit size={32} />
        </div>
        <h3 className="text-2xl font-bold tracking-tight mb-2">Quiz Completed!</h3>
        <p className="text-muted-foreground mb-6 text-lg">
          You scored <span className="text-foreground font-semibold">{score}</span> out of <span className="text-foreground font-semibold">{questions.length}</span>.
        </p>
        <button 
          onClick={() => {
            setCurrentIndex(0);
            setSelectedOption(null);
            setShowExplanation(false);
            setScore(0);
            setIsFinished(false);
          }}
          className="px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
        >
          Retake Quiz
        </button>
      </motion.div>
    );
  }

  return (
    <div className="my-6 border border-border rounded-2xl bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit size={18} className="text-primary" />
          <span className="font-semibold text-sm tracking-tight">Interactive Quiz</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">
        <h4 className="text-lg font-medium text-foreground mb-6 leading-snug">
          {currentQ.question}
        </h4>

        <div className="space-y-3 mb-6">
          {currentQ.options.map((opt, i) => {
            const isSelected = selectedOption === i;
            const isCorrect = i === currentQ.answer;
            const showCorrect = showExplanation && isCorrect;
            const showWrong = showExplanation && isSelected && !isCorrect;

            let btnClass = "border-border hover:border-primary/50 hover:bg-muted text-foreground";
            if (showExplanation) {
              if (showCorrect) btnClass = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
              else if (showWrong) btnClass = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
              else btnClass = "border-border opacity-50";
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={showExplanation}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${btnClass}`}
              >
                <span className="font-medium">{opt}</span>
                {showCorrect && <CheckCircle2 size={18} className="text-green-500" />}
                {showWrong && <XCircle size={18} className="text-red-500" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="overflow-hidden"
            >
              <div className="p-4 rounded-xl bg-muted/50 border border-border/50 text-sm leading-relaxed mb-6">
                <span className="font-semibold text-foreground block mb-1">Explanation:</span>
                <span className="text-muted-foreground">{currentQ.explanation}</span>
              </div>
              <button
                onClick={handleNext}
                className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
