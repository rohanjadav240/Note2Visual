import React from 'react';
import { ArrowDown, CheckCircle2, PlayCircle, HelpCircle, ArrowRight } from 'lucide-react';
import type { DiagramData } from '../../types';

interface FlowchartCanvasProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  zoomLevel?: number;
}

export const FlowchartCanvas: React.FC<FlowchartCanvasProps> = ({
  data,
  selectedNodeId,
  onSelectNode,
  zoomLevel = 100
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No flowchart sequence defined for this topic.
      </div>
    );
  }

  const scale = zoomLevel / 100;

  return (
    <div className="relative flex h-full w-full justify-center overflow-auto p-6 sm:p-8 min-h-[520px]">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease-out'
        }}
        className="flex flex-col items-center gap-2 py-4 max-w-2xl w-full"
      >
        {/* Sequence Overview Bar */}
        <div className="w-full flex items-center justify-between px-4 py-2 mb-2 rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Sequential Mechanism Flow ({data.nodes.length} Stages)
          </span>
          <span className="text-[11px] text-blue-700 dark:text-blue-400 font-semibold font-mono">
            Deterministic Pipeline
          </span>
        </div>

        {data.nodes.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          const isStart = node.type === 'start';
          const isEnd = node.type === 'end';
          const isDecision = node.type === 'decision';

          return (
            <React.Fragment key={node.id}>
              {/* Connector line and directional marker */}
              {index > 0 && (
                <div className="flex flex-col items-center my-0.5 select-none">
                  <div className="h-5 w-0.5 bg-slate-300 dark:bg-slate-700" />
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 border border-slate-300 dark:bg-slate-800 dark:border-slate-700 -my-0.5 text-slate-600 dark:text-slate-400">
                    <ArrowDown className="h-3 w-3" />
                  </div>
                  <div className="h-2 w-0.5 bg-slate-300 dark:bg-slate-700" />
                </div>
              )}

              {/* Start Node */}
              {isStart ? (
                <div
                  onClick={() => onSelectNode && onSelectNode(node.id)}
                  className={`cursor-pointer inline-flex items-center gap-2.5 rounded-full border-2 border-emerald-700 bg-emerald-50 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-emerald-950 transition-all shadow-xs dark:border-emerald-500 dark:bg-emerald-950/70 dark:text-emerald-100 ${
                    isSelected ? 'ring-4 ring-emerald-200 dark:ring-emerald-900' : 'hover:shadow-sm'
                  }`}
                >
                  <PlayCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Initial Condition: {node.label}</span>
                </div>
              ) : isEnd ? (
                /* End Node */
                <div
                  onClick={() => onSelectNode && onSelectNode(node.id)}
                  className={`cursor-pointer inline-flex items-center gap-2.5 rounded-full border-2 border-slate-800 bg-slate-100 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 transition-all shadow-xs dark:border-slate-300 dark:bg-slate-800 dark:text-slate-100 ${
                    isSelected ? 'ring-4 ring-slate-300 dark:ring-slate-700' : 'hover:shadow-sm'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4 text-slate-800 dark:text-slate-300" />
                  <span>Terminal State: {node.label}</span>
                </div>
              ) : isDecision ? (
                /* Decision Point */
                <div
                  onClick={() => onSelectNode && onSelectNode(node.id)}
                  className={`cursor-pointer rounded-xl border-2 border-amber-600 bg-amber-50 p-4 text-left transition-all max-w-lg w-full dark:border-amber-500 dark:bg-amber-950/50 shadow-xs ${
                    isSelected ? 'ring-4 ring-amber-200 dark:ring-amber-900' : 'hover:border-amber-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-amber-800 dark:text-amber-400">
                      Evaluation / Checkpoint
                    </span>
                    <HelpCircle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-serif">
                    {node.label}
                  </h4>
                  {node.description && (
                    <p className="mt-1 text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                      {node.description}
                    </p>
                  )}
                </div>
              ) : (
                /* Standard Step Card */
                <div
                  onClick={() => onSelectNode && onSelectNode(node.id)}
                  className={`w-full cursor-pointer rounded-xl border bg-white p-4 sm:p-5 transition-all text-left shadow-xs dark:bg-slate-900 ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-200 shadow-md dark:border-blue-500 dark:ring-blue-900'
                      : 'border-slate-200 hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-700 text-[10px] font-mono font-bold text-white shadow-2xs">
                        {index < 10 ? `0${index}` : index}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                        Operational Step
                      </span>
                    </div>

                    {node.style?.importance === 'high' && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[9px] font-mono font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Critical Transition
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 font-serif">
                    {node.label}
                  </h4>

                  {node.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {node.description}
                    </p>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
