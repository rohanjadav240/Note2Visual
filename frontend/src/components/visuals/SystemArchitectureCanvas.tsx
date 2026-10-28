import React from 'react';
import { Cpu, Server, Database, Layers, ArrowRight, ShieldCheck } from 'lucide-react';
import type { DiagramData } from '../../types';

interface SystemArchitectureCanvasProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  zoomLevel?: number;
}

export const SystemArchitectureCanvas: React.FC<SystemArchitectureCanvasProps> = ({
  data,
  selectedNodeId,
  onSelectNode,
  zoomLevel = 100
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No system architecture components defined.
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
        className="w-full max-w-4xl space-y-6"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-700 dark:text-blue-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Modular Architectural Topology
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {data.nodes.length} Interconnected Modules
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.nodes.map((node, i) => {
              const isSelected = selectedNodeId === node.id;
              const importance = (node.style?.importance as string) || 'medium';

              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode && onSelectNode(node.id)}
                  className={`cursor-pointer rounded-xl border p-5 transition-all text-left shadow-xs ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-200 shadow-md dark:border-blue-500 dark:bg-blue-950/60 dark:ring-blue-900'
                      : 'border-slate-200 bg-slate-50/50 hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Subsystem {i + 1 < 10 ? `0${i + 1}` : i + 1}
                    </span>
                    {importance === 'high' && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        Core Service
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 mb-1.5 font-serif">
                    {node.label}
                  </h4>

                  {node.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {node.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
