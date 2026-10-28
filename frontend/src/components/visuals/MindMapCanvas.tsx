import React, { useState } from 'react';
import { BookOpen, ChevronRight, Layers, LayoutGrid, Network } from 'lucide-react';
import type { DiagramData } from '../../types';

interface MindMapCanvasProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  zoomLevel?: number;
}

const BRANCH_ACCENTS = [
  { stroke: '#1d4ed8', border: 'border-l-blue-600', badge: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-950', dot: '#1d4ed8' },
  { stroke: '#047857', border: 'border-l-emerald-600', badge: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-950', dot: '#047857' },
  { stroke: '#7c3aed', border: 'border-l-purple-600', badge: 'text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-950', dot: '#7c3aed' },
  { stroke: '#b45309', border: 'border-l-amber-600', badge: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-950', dot: '#b45309' },
  { stroke: '#0e7490', border: 'border-l-cyan-600', badge: 'text-cyan-700 bg-cyan-50 dark:text-cyan-300 dark:bg-cyan-950', dot: '#0e7490' },
  { stroke: '#be123c', border: 'border-l-rose-600', badge: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-950', dot: '#be123c' },
];

export const MindMapCanvas: React.FC<MindMapCanvasProps> = ({
  data,
  selectedNodeId,
  onSelectNode,
  zoomLevel = 100
}) => {
  const [viewMode, setViewMode] = useState<'radial' | 'tree'>('radial');

  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-slate-400 text-xs">
        <Layers className="h-8 w-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
        <span>No mind map branches found for this section.</span>
      </div>
    );
  }

  const centerNode = data.nodes.find((n) => n.type === 'center') || data.nodes[0];
  const branchNodes = data.nodes.filter((n) => n.id !== centerNode.id);

  // SVG dimensions for radial mode
  const width = 940;
  const height = 580;
  const centerX = width / 2;
  const centerY = height / 2;

  // Calculate coordinates in a balanced ellipse
  const positionedBranches = branchNodes.map((node, index) => {
    const total = branchNodes.length;
    // Spread evenly around the circle, starting from top-right
    const angle = (index * (2 * Math.PI)) / Math.max(total, 1) - Math.PI / 2;
    const radiusX = 310;
    const radiusY = 205;
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    const accent = BRANCH_ACCENTS[index % BRANCH_ACCENTS.length];
    return { ...node, x, y, accent, index };
  });

  const scale = zoomLevel / 100;

  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Sub-toolbar: View Switcher */}
      <div className="flex items-center justify-between px-5 py-2 border-b border-slate-200 bg-slate-50/70 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase font-bold text-slate-400">Layout View:</span>
          <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('radial')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                viewMode === 'radial'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Network className="h-3 w-3" />
              <span>Radial Concept Map</span>
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Taxonomic Tree</span>
            </button>
          </div>
        </div>

        <span className="text-[11px] text-slate-400 font-mono">
          {branchNodes.length} Cognitive Branches
        </span>
      </div>

      {/* Canvas Area */}
      {viewMode === 'radial' ? (
        <div className="relative flex-1 flex items-center justify-center overflow-auto p-6 min-h-[500px]">
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
              width: `${width}px`,
              height: `${height}px`,
              transition: 'transform 0.15s ease-out'
            }}
            className="relative shrink-0"
          >
            <svg width={width} height={height} className="absolute inset-0 overflow-visible select-none pointer-events-none">
              {/* Branch Connectors */}
              {positionedBranches.map((branch) => {
                const isSelected = selectedNodeId === branch.id;
                const strokeColor = isSelected ? '#1d4ed8' : branch.accent.stroke;
                const ctrlX = (centerX + branch.x) / 2;
                const ctrlY = (centerY + branch.y) / 2;

                return (
                  <g key={`edge-${branch.id}`}>
                    <path
                      d={`M ${centerX} ${centerY} Q ${ctrlX} ${ctrlY} ${branch.x} ${branch.y}`}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : 1.75}
                      opacity={isSelected ? 1 : 0.65}
                      className="transition-all"
                    />
                    <circle
                      cx={branch.x}
                      cy={branch.y}
                      r={isSelected ? 4.5 : 3.5}
                      fill={strokeColor}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Central Anchor Node */}
            <div
              onClick={() => onSelectNode && onSelectNode(centerNode.id)}
              style={{
                left: `${centerX}px`,
                top: `${centerY}px`,
                transform: 'translate(-50%, -50%)'
              }}
              className={`absolute cursor-pointer rounded-xl border-2 px-6 py-4 text-center transition-all shadow-md z-10 select-none ${
                selectedNodeId === centerNode.id
                  ? 'border-blue-600 bg-blue-50 text-blue-950 ring-4 ring-blue-100 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-100 dark:ring-blue-900'
                  : 'border-slate-800 bg-slate-900 text-white hover:border-blue-600 hover:shadow-lg dark:border-slate-200 dark:bg-white dark:text-slate-900'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <BookOpen className="h-3.5 w-3.5 opacity-80" />
                <span className="text-[10px] uppercase font-mono tracking-widest font-bold">
                  Core Axiom
                </span>
              </div>
              <div className="font-serif font-bold text-sm sm:text-base max-w-[220px] leading-snug">
                {centerNode.label}
              </div>
            </div>

            {/* Branch Nodes */}
            {positionedBranches.map((branch) => {
              const isSelected = selectedNodeId === branch.id;
              const importance = (branch.style?.importance as string) || 'medium';

              return (
                <div
                  key={branch.id}
                  onClick={() => onSelectNode && onSelectNode(branch.id)}
                  style={{
                    left: `${branch.x}px`,
                    top: `${branch.y}px`,
                    transform: 'translate(-50%, -50%)',
                    width: '230px'
                  }}
                  className={`absolute cursor-pointer rounded-lg border border-l-4 bg-white p-3.5 text-left transition-all z-10 shadow-xs dark:bg-slate-900 ${
                    branch.accent.border
                  } ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-200 shadow-md dark:ring-blue-800'
                      : 'border-slate-200 hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${branch.accent.badge}`}>
                      Concept {branch.index + 1}
                    </span>
                    {importance === 'high' && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        High Yield
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-slate-100 line-clamp-2">
                    {branch.label}
                  </h4>

                  {branch.description && (
                    <p className="mt-1.5 line-clamp-2 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {branch.description}
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Inspect Citations</span>
                    <ChevronRight className="h-3 w-3 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Taxonomic Tree View */
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-5">
            {/* Tree Root */}
            <div
              onClick={() => onSelectNode && onSelectNode(centerNode.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedNodeId === centerNode.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                  : 'border-slate-800 bg-slate-900 text-white dark:border-slate-300 dark:bg-white dark:text-slate-900'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-widest font-bold mb-1 opacity-80">
                Primary Root Concept
              </div>
              <h3 className="font-serif font-bold text-base">{centerNode.label}</h3>
              {centerNode.description && (
                <p className="text-xs mt-1 opacity-90 leading-relaxed">{centerNode.description}</p>
              )}
            </div>

            {/* Tree Children Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-slate-300 dark:border-slate-700">
              {branchNodes.map((bNode, idx) => {
                const isSelected = selectedNodeId === bNode.id;
                const accent = BRANCH_ACCENTS[idx % BRANCH_ACCENTS.length];
                return (
                  <div
                    key={bNode.id}
                    onClick={() => onSelectNode && onSelectNode(bNode.id)}
                    className={`p-4 rounded-lg border bg-white dark:bg-slate-900 cursor-pointer transition-all shadow-xs ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-200 dark:ring-blue-900'
                        : 'border-slate-200 hover:border-slate-400 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${accent.badge}`}>
                        Branch 0{idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {String(bNode.style?.importance || 'medium')}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif mb-1">
                      {bNode.label}
                    </h4>
                    {bNode.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {bNode.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
