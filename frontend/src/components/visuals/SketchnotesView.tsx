import React from 'react';
import {
  PenTool,
  Lightbulb,
  Bookmark,
  Pin,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Cpu,
  BookOpen,
  Target
} from 'lucide-react';
import type { DiagramData } from '../../types';

interface SketchnotesViewProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export const SketchnotesView: React.FC<SketchnotesViewProps> = ({
  data,
  selectedNodeId,
  onSelectNode
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No sketchnotes generated for this section.
      </div>
    );
  }

  const headerNode = data.nodes.find((n) => n.type === 'sketch_header');
  const noteNodes = data.nodes.filter((n) => n.type !== 'sketch_header');

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8 min-h-[520px] bg-amber-50/20 dark:bg-slate-950/40">
      {/* Notebook Grid Canvas */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Notebook Top Title Strip */}
        <div className="relative rounded-xl border-2 border-slate-300 bg-white p-6 shadow-xs dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b-2 border-dashed border-slate-200 pb-3 mb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-600 text-white shadow-2xs">
                <PenTool className="h-3.5 w-3.5" />
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-400">
                Hand-Drawn Sketchnote Notebook
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">
              Vol. 1 • {noteNodes.length} Visual Notes
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
            {headerNode ? headerNode.label : (data.metadata?.topic_title as string) || 'Topic Sketchnote'}
          </h2>
          {headerNode?.description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {headerNode.description}
            </p>
          )}
        </div>

        {/* Sketchnote Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {noteNodes.map((node, i) => {
            const isSelected = selectedNodeId === node.id;
            const style = node.style || {};
            const container = style.container || 'sticky_note';
            const example = style.example || '';
            const pageRef = style.page_ref;

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode && onSelectNode(node.id)}
                className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all text-left shadow-xs ${
                  container === 'sticky_note'
                    ? 'border-amber-300 bg-amber-50/70 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100'
                    : container === 'lined_card'
                    ? 'border-blue-300 bg-blue-50/60 text-blue-950 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100'
                    : 'border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
                } ${
                  isSelected
                    ? 'ring-4 ring-blue-300 dark:ring-blue-900 border-blue-600 scale-[1.01]'
                    : 'hover:border-slate-500'
                }`}
              >
                {/* Visual Pin / Tape accent */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider opacity-80">
                    <Pin className="h-3 w-3" />
                    <span>{style.note_tag || `Axiom ${i + 1}`}</span>
                  </div>
                  {pageRef && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                      Page {pageRef}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-bold font-serif mb-1.5 leading-snug">
                  {node.label}
                </h3>

                <p className="text-xs leading-relaxed opacity-90 mb-3 font-sans">
                  {node.description}
                </p>

                {example && (
                  <div className="rounded-lg border border-dashed border-black/20 dark:border-white/20 p-2.5 text-xs bg-white/50 dark:bg-black/20 italic">
                    <span className="font-semibold not-italic text-[10px] uppercase font-mono mr-1">
                      Visual Metaphor:
                    </span>
                    "{example}"
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
