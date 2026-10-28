import React, { useState, useEffect } from 'react';
import {
  Shuffle,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import type { Concept } from '../../types';

interface FlashcardsDeckProps {
  concepts: Concept[];
  topicTitle?: string;
}

export const FlashcardsDeck: React.FC<FlashcardsDeckProps> = ({ concepts, topicTitle }) => {
  const [deck, setDeck] = useState<Concept[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownMap, setKnownMap] = useState<Record<string, boolean>>({});
  const [difficultMap, setDifficultMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setDeck(concepts);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [concepts]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        goNext();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck.length, currentIndex]);

  if (!deck || deck.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center text-xs text-slate-400">
        <Layers className="h-8 w-8 mb-2 stroke-1" />
        <span>No flashcards generated for this topic yet.</span>
      </div>
    );
  }

  const currentCard = deck[currentIndex] || deck[0];

  const goNext = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => (i + 1 < deck.length ? i + 1 : 0));
  };

  const goPrev = () => {
    setIsFlipped(false);
    setCurrentIndex((i) => (i - 1 >= 0 ? i - 1 : deck.length - 1));
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const markKnown = () => {
    setKnownMap((prev) => ({ ...prev, [currentCard.id]: true }));
    setDifficultMap((prev) => ({ ...prev, [currentCard.id]: false }));
    goNext();
  };

  const markDifficult = () => {
    setDifficultMap((prev) => ({ ...prev, [currentCard.id]: true }));
    setKnownMap((prev) => ({ ...prev, [currentCard.id]: false }));
    goNext();
  };

  const knownCount = Object.values(knownMap).filter(Boolean).length;
  const difficultCount = Object.values(difficultMap).filter(Boolean).length;

  return (
    <div className="max-w-2xl mx-auto space-y-5 p-4 sm:p-6 select-none">
      {/* Deck Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Card {currentIndex + 1} of {deck.length}
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-mono font-semibold">
            {knownCount} Mastered
          </span>
          {difficultCount > 0 && (
            <span className="text-rose-700 dark:text-rose-400 font-mono font-semibold">
              • {difficultCount} Needs Review
            </span>
          )}
        </div>

        <button
          onClick={handleShuffle}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer font-semibold"
        >
          <Shuffle className="h-3.5 w-3.5" />
          <span>Shuffle Deck</span>
        </button>
      </div>

      {/* Main 3D Flippable Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative min-h-[320px] sm:min-h-[360px] w-full rounded-2xl border-2 border-slate-300 bg-white p-8 text-center shadow-md dark:border-slate-700 dark:bg-slate-900 cursor-pointer transition-all hover:border-blue-600 flex flex-col justify-between"
      >
        {/* Top Card Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span className="uppercase tracking-wider">
            {isFlipped ? 'Answer / Verification' : 'Recall Prompt'}
          </span>
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            Press Space to flip
          </span>
        </div>

        {/* Card Body */}
        <div className="my-auto py-6">
          {!isFlipped ? (
            /* Front */
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase font-bold text-blue-700 dark:text-blue-400">
                Core Concept
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 max-w-md mx-auto leading-snug">
                {currentCard.title}
              </h3>
              <p className="text-xs text-slate-400 font-sans pt-3">
                Click anywhere or press Space to reveal explanation
              </p>
            </div>
          ) : (
            /* Back */
            <div className="space-y-4 text-left max-w-lg mx-auto">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                  Explanation:
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {currentCard.detailed_explanation || currentCard.short_explanation}
                </p>
              </div>

              {currentCard.examples && currentCard.examples.length > 0 && (
                <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300 italic">
                  <span className="not-italic font-bold text-[10px] uppercase font-mono mr-1">
                    Application Example:
                  </span>
                  "{currentCard.examples[0]}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Card Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-mono text-[11px] text-slate-400">
            {topicTitle || 'Active Recall Deck'}
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center gap-1">
            <RotateCw className="h-3 w-3" />
            <span>Click to {isFlipped ? 'see front' : 'flip'}</span>
          </span>
        </div>
      </div>

      {/* Navigation and Mastery Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Prev / Next buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            className="btn-secondary"
            title="Previous card (Left Arrow)"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          <button
            onClick={goNext}
            className="btn-secondary"
            title="Next card (Right Arrow)"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Know / Need Review buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={markDifficult}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs font-semibold dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300 cursor-pointer transition-colors"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Needs Review</span>
          </button>

          <button
            onClick={markKnown}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold shadow-2xs cursor-pointer transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Mark Mastered</span>
          </button>
        </div>
      </div>
    </div>
  );
};
