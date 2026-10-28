import React from 'react';
import { Calculator, ArrowRight, CheckCircle2, Sigma, BookOpen } from 'lucide-react';
import type { DiagramData } from '../../types';

interface MathExplanationViewProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export const MathExplanationView: React.FC<MathExplanationViewProps> = ({
  data,
  selectedNodeId,
  onSelectNode
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No mathematical derivations available for this topic.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 min-h-[520px]">
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Formal Analytical Derivation
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {data.nodes.length} Proof Steps
          </span>
        </div>

        {data.nodes.map((node, i) => {
          const isSelected = selectedNodeId === node.id;
          const stepNumber = (node.style?.step_number as number) || i + 1;
          const examples = (node.style?.examples as string[]) || [];

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
              <div className="flex items-start gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-mono font-bold text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs">
                  {stepNumber < 10 ? `0${stepNumber}` : stepNumber}
                </span>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                      {node.label}
                    </h3>
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                      Phase {stepNumber}
                    </span>
                  </div>

                  {/* Mathematical Expression Box */}
                  <div className="rounded-lg border border-slate-300 bg-slate-50 p-4 font-mono text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 shadow-2xs leading-relaxed">
                    {node.description}
                  </div>

                  {examples.length > 0 && (
                    <div className="pt-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px] uppercase">
                        Worked Verification & Boundary Conditions:
                      </span>
                      <ul className="list-disc pl-5 mt-1.5 space-y-1 text-xs">
                        {examples.map((ex, idx) => (
                          <li key={idx} className="leading-relaxed">{ex}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
