import React from 'react';
import { Milestone, Clock, Calendar, CheckCircle, ArrowRight } from 'lucide-react';
import type { DiagramData } from '../../types';

interface TimelineViewProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  data,
  selectedNodeId,
  onSelectNode
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No chronological timeline data available.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 sm:p-8 min-h-[520px]">
      <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-700 dark:text-blue-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Chronological Evolution Axis
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {data.nodes.length} Key Epochs / Milestones
        </span>
      </div>

      <div className="relative max-w-2xl mx-auto pl-8 border-l-2 border-slate-300 dark:border-slate-700 space-y-7 my-4">
        {data.nodes.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          const stage = (node.style?.stage as number) || index + 1;
          const importance = (node.style?.importance as string) || 'medium';

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode && onSelectNode(node.id)}
              className="relative group cursor-pointer"
            >
              {/* Timeline Bullet Pin */}
              <div
                className={`absolute -left-[41px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white transition-all dark:bg-slate-900 ${
                  isSelected
                    ? 'border-blue-600 ring-4 ring-blue-100 dark:border-blue-400 dark:ring-blue-950 scale-110'
                    : 'border-slate-400 group-hover:border-blue-600'
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    isSelected ? 'bg-blue-600 dark:bg-blue-400' : 'bg-slate-400 group-hover:bg-blue-600'
                  }`}
                />
              </div>

              {/* Node Card */}
              <div
                className={`rounded-xl border bg-white p-5 transition-all shadow-xs dark:bg-slate-900 ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-200 shadow-md dark:border-blue-400 dark:ring-blue-900'
                    : 'border-slate-200 hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-blue-800 dark:text-blue-400 font-bold uppercase tracking-wider">
                    <Milestone className="h-3.5 w-3.5" />
                    <span>Chronological Milestone {stage < 10 ? `0${stage}` : stage}</span>
                  </div>
                  {importance === 'high' && (
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-[9px] font-mono font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Foundational Epoch
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif leading-snug">
                  {node.label}
                </h4>

                {node.description && (
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {node.description}
                  </p>
                )}

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>View underlying citations</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
