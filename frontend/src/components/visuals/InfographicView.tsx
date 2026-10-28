import React from 'react';
import { BookmarkCheck, FileText, CheckCircle2, Award, Sparkles, BookOpen } from 'lucide-react';
import type { DiagramData } from '../../types';

interface InfographicViewProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
}

export const InfographicView: React.FC<InfographicViewProps> = ({
  data,
  selectedNodeId,
  onSelectNode
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No infographic summary available for this topic.
      </div>
    );
  }

  const headerNode = data.nodes.find((n) => n.type === 'header');
  const factNodes = data.nodes.filter((n) => n.type !== 'header' && n.type !== 'summary');
  const summaryNode = data.nodes.find((n) => n.type === 'summary');

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8 min-h-[520px]">
      <div className="max-w-4xl mx-auto rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Academic Header Banner */}
        <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1.5">
            <FileText className="h-4 w-4" />
            <span>Scholarly Synthesis Brief</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {headerNode ? headerNode.label : (data.metadata?.topic_title as string) || 'Topic Synthesis'}
          </h2>
          {headerNode?.description && (
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {headerNode.description}
            </p>
          )}

          {/* Quick Metrics Bar */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span>{factNodes.length} Core Principles</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Full Source Citations Retained</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-600" />
              <span>Peer-Level Academic Synthesis</span>
            </span>
          </div>
        </div>

        {/* Core Principles Grid */}
        <div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3.5">
            Key Principles & Mechanisms
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {factNodes.map((node, i) => {
              const isSelected = selectedNodeId === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode && onSelectNode(node.id)}
                  className={`cursor-pointer rounded-xl border p-4 sm:p-5 transition-all shadow-xs ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-200 shadow-md dark:border-blue-400 dark:bg-blue-950/60 dark:ring-blue-900'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-[11px] font-mono font-bold text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
                      {i + 1 < 10 ? `0${i + 1}` : i + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                      {node.label}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-8">
                    {node.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Essential Conclusion Box */}
        {summaryNode && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-5 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
            <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider mb-2 text-emerald-800 dark:text-emerald-300">
              <BookmarkCheck className="h-4 w-4" />
              <span>Essential Conclusion & Takeaways</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed font-sans text-emerald-900 dark:text-emerald-200">
              {summaryNode.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
