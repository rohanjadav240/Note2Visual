import React from 'react';
import { Film, Lightbulb, CheckCircle2, BookmarkCheck, ArrowRight } from 'lucide-react';
import type { DiagramData } from '../../types';

interface StoryboardViewProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export const StoryboardView: React.FC<StoryboardViewProps> = ({
  data,
  selectedNodeId,
  onSelectNode
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No storyboard scenes generated for this topic.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 min-h-[520px]">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Visual Storyboard & Pedagogical Narrative
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {data.nodes.length} Pedagogical Scenes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.nodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const example = (node.style?.example as string) || '';
            const sceneNumber = (node.style?.scene_number as number) || index + 1;

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode && onSelectNode(node.id)}
                className={`cursor-pointer rounded-xl border bg-white p-5 transition-all flex flex-col justify-between shadow-xs dark:bg-slate-900 ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-200 shadow-md dark:border-blue-500 dark:ring-blue-900'
                    : 'border-slate-200 hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Scene Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-[11px] font-mono font-bold text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
                        {sceneNumber < 10 ? `0${sceneNumber}` : sceneNumber}
                      </span>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        Narrative Act {sceneNumber}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Concept Vignette</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 font-serif leading-snug">
                    {node.label}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {node.description}
                  </p>
                </div>

                {/* Concrete Example / Analogy Callout */}
                {example && (
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs dark:bg-slate-800/70 dark:border-slate-700">
                    <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400 mb-1 text-[11px] uppercase tracking-wider font-mono">
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>Concrete Real-World Analogy</span>
                    </div>
                    <p className="italic text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      "{example}"
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
