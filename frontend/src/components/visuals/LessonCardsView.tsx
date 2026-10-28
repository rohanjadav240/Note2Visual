import React, { useState } from 'react';
import { Eye, EyeOff, BookOpen, Layers, CheckCircle2, RotateCw, Check, Sparkles } from 'lucide-react';
import type { DiagramData } from '../../types';

interface LessonCardsViewProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export const LessonCardsView: React.FC<LessonCardsViewProps> = ({
  data,
  selectedNodeId,
  onSelectNode
}) => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No study flashcards available for this section.
      </div>
    );
  }

  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const masteredCount = Object.values(masteredCards).filter(Boolean).length;

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 min-h-[520px]">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Active Recall Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Layers className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <span>Active Recall Revision Cards ({data.nodes.length} Units)</span>
            {masteredCount > 0 && (
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                {masteredCount}/{data.nodes.length} Mastered
              </span>
            )}
          </div>

          <button
            onClick={() => {
              const allFlipped = Object.keys(flippedCards).length === data.nodes.length;
              if (allFlipped) {
                setFlippedCards({});
              } else {
                const all: Record<string, boolean> = {};
                data.nodes.forEach((n) => (all[n.id] = true));
                setFlippedCards(all);
              }
            }}
            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-semibold dark:text-blue-400 cursor-pointer"
          >
            <RotateCw className="h-3 w-3" />
            <span>Flip All Cards</span>
          </button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.nodes.map((node, i) => {
            const isSelected = selectedNodeId === node.id;
            const isFlipped = !!flippedCards[node.id];
            const isMastered = !!masteredCards[node.id];
            const detailed = (node.style?.detailed as string) || '';
            const example = (node.style?.example as string) || '';

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode && onSelectNode(node.id)}
                className={`flex flex-col justify-between rounded-xl border bg-white p-5 transition-all min-h-[250px] cursor-pointer shadow-xs dark:bg-slate-900 ${
                  isMastered
                    ? 'border-emerald-300 bg-emerald-50/20 dark:border-emerald-900'
                    : isSelected
                    ? 'border-blue-600 ring-2 ring-blue-200 shadow-md dark:border-blue-500 dark:ring-blue-900'
                    : 'border-slate-200 hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3 dark:border-slate-800">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Card {i + 1 < 10 ? `0${i + 1}` : i + 1}
                    </span>
                    <button
                      onClick={(e) => toggleFlip(node.id, e)}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 dark:text-blue-400"
                    >
                      {isFlipped ? (
                        <>
                          <EyeOff className="h-3 w-3" />
                          <span>Show Prompt</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-3 w-3" />
                          <span>Reveal Answer</span>
                        </>
                      )}
                    </button>
                  </div>

                  {!isFlipped ? (
                    /* Front: Prompt / Question */
                    <div className="space-y-3 py-2">
                      <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">
                        Recall Prompt:
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif leading-snug">
                        {node.label}
                      </h4>
                      <div className="pt-4 text-center">
                        <span className="inline-block text-[11px] text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
                          Click Reveal to check your knowledge
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Back: Scholarly Answer */
                    <div className="space-y-2.5 py-1">
                      <div className="text-[10px] uppercase font-mono tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
                        Verified Explanation:
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        {node.description}
                      </p>
                      {example && (
                        <div className="mt-2 rounded bg-slate-50 p-2 text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-400 italic">
                          "{example}"
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Card Footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => toggleMastered(node.id, e)}
                    className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      isMastered
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    <span>{isMastered ? 'Mastered' : 'Mark as Known'}</span>
                  </button>

                  <span className="text-[10px] font-mono text-slate-400">
                    Source Verified
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
