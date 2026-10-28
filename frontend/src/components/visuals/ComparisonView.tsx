import React from 'react';
import { ArrowLeftRight, Check, Sparkles, Scale, CheckCircle2, XCircle } from 'lucide-react';
import type { DiagramData } from '../../types';

interface ComparisonViewProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  data,
  selectedNodeId,
  onSelectNode
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No comparative matrix data available for this topic.
      </div>
    );
  }

  const nodes = data.nodes;
  const primaryNodes = nodes.filter((n) => n.type !== 'shared');
  const sharedNodes = nodes.filter((n) => n.type === 'shared');

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 min-h-[520px]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Academic Header Banner */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Comparative Analysis Matrix
            </span>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {primaryNodes.length} Distinct Paradigms
          </span>
        </div>

        {/* Primary Entities Side-by-Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {primaryNodes.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const isFirst = index === 0;

            return (
              <div
                key={node.id}
                onClick={() => onSelectNode && onSelectNode(node.id)}
                className={`cursor-pointer rounded-xl border bg-white p-5 sm:p-6 transition-all shadow-xs dark:bg-slate-900 ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-200 shadow-md dark:border-blue-500 dark:ring-blue-900'
                    : 'border-slate-200 hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3.5 dark:border-slate-800">
                  <span className={`font-mono text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isFirst
                      ? 'text-blue-800 bg-blue-50 dark:text-blue-300 dark:bg-blue-950'
                      : 'text-emerald-800 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950'
                  }`}>
                    Paradigm {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    Core Subject
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 font-serif">
                  {node.label}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {node.description}
                </p>

                {node.style?.importance === 'high' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                    High-Yield Exam Focus
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Shared / Intersecting Foundations */}
        {sharedNodes.length > 0 && (
          <div className="rounded-xl border border-slate-300 bg-slate-50/90 p-5 dark:border-slate-700 dark:bg-slate-900/60">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Common Ground & Shared Theoretical Foundations</span>
            </div>
            <div className="space-y-3">
              {sharedNodes.map((sNode) => (
                <div key={sNode.id} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{sNode.label}: </span>
                    <span className="leading-relaxed">{sNode.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
