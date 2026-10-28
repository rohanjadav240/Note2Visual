import React from 'react';
import {
  FileCheck2,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Bookmark,
  Zap,
  ArrowRight
} from 'lucide-react';
import type { DiagramData } from '../../types';

interface RevisionSheetViewProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export const RevisionSheetView: React.FC<RevisionSheetViewProps> = ({
  data,
  selectedNodeId,
  onSelectNode
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No revision sheet generated for this topic.
      </div>
    );
  }

  const headerNode = data.nodes.find((n) => n.type === 'revision_header');
  const axiomNodes = data.nodes.filter((n) => n.type !== 'revision_header');

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8 min-h-[520px]">
      <div className="max-w-4xl mx-auto rounded-xl border-2 border-slate-300 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Revision Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 mb-1">
              <FileCheck2 className="h-4 w-4" />
              <span>Exam High-Yield Revision Sheet</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
              {headerNode ? headerNode.label : (data.metadata?.topic_title as string) || 'Revision Guide'}
            </h2>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 text-xs font-mono font-semibold">
            <Zap className="h-3.5 w-3.5 text-amber-600" />
            <span>Fast Exam Recall Mode</span>
          </div>
        </div>

        {/* Axioms and Common Pitfalls */}
        <div className="space-y-4">
          {axiomNodes.map((node, i) => {
            const isSelected = selectedNodeId === node.id;
            const style = node.style || {};
            const mnemonic = style.mnemonic;
            const trapWarning = style.trap_warning;

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode && onSelectNode(node.id)}
                className={`cursor-pointer rounded-xl border p-5 transition-all text-left shadow-xs ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-200 shadow-md dark:border-blue-500 dark:bg-blue-950/60 dark:ring-blue-900'
                    : 'border-slate-200 bg-white hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-[10px] font-mono font-bold text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
                      {i + 1 < 10 ? `0${i + 1}` : i + 1}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 font-serif">
                      {node.label}
                    </h3>
                  </div>

                  {style.importance === 'high' && (
                    <span className="rounded bg-rose-100 px-2 py-0.5 text-[9px] font-mono font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300 uppercase">
                      Priority Must-Know
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-7 mb-3 font-sans">
                  {node.description}
                </p>

                {/* Sub-grid: Mnemonic & Common Traps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-7">
                  {mnemonic && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-950 dark:bg-emerald-950/50 dark:border-emerald-900 dark:text-emerald-200">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-[10px] uppercase text-emerald-800 dark:text-emerald-400 mb-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Mnemonic Anchor</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{mnemonic}</p>
                    </div>
                  )}

                  {trapWarning && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-950 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-200">
                      <div className="flex items-center gap-1.5 font-mono font-bold text-[10px] uppercase text-amber-800 dark:text-amber-400 mb-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Common Exam Pitfall</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">{trapWarning}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
