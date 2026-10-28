import React from 'react';
import { Share2, Network, ArrowRight } from 'lucide-react';
import type { DiagramData } from '../../types';

interface ConceptNetworkCanvasProps {
  data?: DiagramData;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  zoomLevel?: number;
}

export const ConceptNetworkCanvas: React.FC<ConceptNetworkCanvasProps> = ({
  data,
  selectedNodeId,
  onSelectNode,
  zoomLevel = 100
}) => {
  if (!data || !data.nodes || data.nodes.length === 0) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center text-xs text-slate-400">
        No concept network graph data available.
      </div>
    );
  }

  const width = 900;
  const height = 560;
  const centerX = width / 2;
  const centerY = height / 2;

  // Position nodes in a clean topological ellipse
  const positionedNodes = data.nodes.map((node, i) => {
    const total = data.nodes.length;
    const angle = (i * 2 * Math.PI) / Math.max(total, 1);
    const rx = 280;
    const ry = 180;
    const x = centerX + rx * Math.cos(angle);
    const y = centerY + ry * Math.sin(angle);
    return { ...node, x, y };
  });

  const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));
  const scale = zoomLevel / 100;

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-auto p-6 min-h-[520px]">
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
          <defs>
            <marker
              id="net-arrow"
              viewBox="0 0 10 10"
              refX="14"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 2 L 8 5 L 0 8 z" fill="#64748b" />
            </marker>
          </defs>

          {/* Edges */}
          {data.edges?.map((edge, idx) => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return null;

            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;

            return (
              <g key={`net-e-${idx}`}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  markerEnd="url(#net-arrow)"
                  className="dark:stroke-slate-700"
                />
                {edge.label && (
                  <g transform={`translate(${midX}, ${midY - 6})`}>
                    <rect
                      x="-35"
                      y="-10"
                      width="70"
                      height="16"
                      rx="4"
                      fill="#ffffff"
                      stroke="#e2e8f0"
                      className="dark:fill-slate-900 dark:stroke-slate-800"
                    />
                    <text
                      x="0"
                      y="2"
                      textAnchor="middle"
                      className="text-[9px] font-mono font-bold fill-slate-600 dark:fill-slate-300"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {positionedNodes.map((node, i) => {
          const isSelected = selectedNodeId === node.id;
          return (
            <div
              key={node.id}
              onClick={() => onSelectNode && onSelectNode(node.id)}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: 'translate(-50%, -50%)',
                width: '190px'
              }}
              className={`absolute cursor-pointer rounded-xl border bg-white p-3.5 text-left transition-all z-10 shadow-xs dark:bg-slate-900 ${
                isSelected
                  ? 'border-blue-600 ring-2 ring-blue-200 shadow-md dark:border-blue-500 dark:ring-blue-900'
                  : 'border-slate-300 hover:border-slate-500 hover:shadow-sm dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Node 0{i + 1}
                </span>
                <span className="h-2 w-2 rounded-full bg-blue-600" />
              </div>

              <h4 className="text-xs font-bold leading-snug text-slate-900 dark:text-slate-100 font-serif line-clamp-2">
                {node.label}
              </h4>

              {node.description && (
                <p className="mt-1 line-clamp-2 text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  {node.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
