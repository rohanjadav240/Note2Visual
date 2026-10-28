import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Maximize,
  Download,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  Save
} from 'lucide-react';
import type { DiagramData, DiagramNode } from '../../types';

interface MindMapEditorProps {
  data?: DiagramData;
  topicId: string;
  topicTitle: string;
  onSave?: (nodes: DiagramNode[]) => void;
  onSelectNode?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export const MindMapEditor: React.FC<MindMapEditorProps> = ({
  data,
  topicId,
  topicTitle,
  onSave,
  onSelectNode,
  selectedNodeId
}) => {
  const [nodes, setNodes] = useState<DiagramNode[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [zoom, setZoom] = useState(100);
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.nodes && data.nodes.length > 0) {
      setNodes(data.nodes);
    } else {
      // Default initial layout
      setNodes([
        {
          id: `center_${topicId}`,
          label: topicTitle || 'Core Subject',
          type: 'center',
          description: 'Central concept anchor'
        },
        {
          id: `branch_1_${topicId}`,
          label: 'Primary Principles',
          description: 'Key fundamental concepts and mechanisms'
        },
        {
          id: `branch_2_${topicId}`,
          label: 'Practical Applications',
          description: 'Case studies and real-world utility'
        }
      ]);
    }
  }, [data, topicId, topicTitle]);

  const centerNode = nodes.find((n) => n.type === 'center') || nodes[0] || {
    id: `center_${topicId}`,
    label: topicTitle || 'Core Axiom',
    type: 'center'
  };

  const branchNodes = nodes.filter((n) => n.id !== centerNode.id);

  // SVG parameters
  const width = 1000;
  const height = 620;
  const centerX = width / 2;
  const centerY = height / 2;

  // Position branches around center in elliptical radial layout
  const positionedBranches = branchNodes.map((node, i) => {
    const total = Math.max(branchNodes.length, 1);
    const angle = (i * (2 * Math.PI)) / total - Math.PI / 2;
    const rx = 330;
    const ry = 220;
    const x = centerX + rx * Math.cos(angle);
    const y = centerY + ry * Math.sin(angle);
    return { ...node, x, y, angle, index: i };
  });

  // Node editing handlers
  const startEdit = (node: DiagramNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNodeId(node.id);
    setEditLabel(node.label);
  };

  const saveEdit = () => {
    if (!editingNodeId) return;
    const updated = nodes.map((n) =>
      n.id === editingNodeId ? { ...n, label: editLabel.trim() || n.label } : n
    );
    setNodes(updated);
    setEditingNodeId(null);
    if (onSave) onSave(updated);
  };

  const addBranch = () => {
    const newId = `branch_${Date.now()}`;
    const newBranch: DiagramNode = {
      id: newId,
      label: `New Branch ${branchNodes.length + 1}`,
      description: 'Click edit to customize description',
      style: { importance: 'medium' }
    };
    const updated = [...nodes, newBranch];
    setNodes(updated);
    setEditingNodeId(newId);
    setEditLabel(newBranch.label);
    if (onSave) onSave(updated);
  };

  const deleteBranch = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeId === centerNode.id) return; // don't delete center
    const updated = nodes.filter((n) => n.id !== nodeId);
    setNodes(updated);
    if (onSave) onSave(updated);
  };

  const toggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedBranches((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleManualSave = () => {
    if (onSave) {
      onSave(nodes);
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 2000);
    }
  };

  const exportSvg = () => {
    const svgElem = containerRef.current?.querySelector('svg');
    if (!svgElem) return;
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topicTitle.replace(/\s+/g, '_')}_mind_map.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scale = zoom / 100;

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-50/50 dark:bg-slate-950/60 rounded-xl overflow-hidden">
      {/* Editor Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Interactive Mind Map Studio
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-[11px] text-slate-500 font-mono">
            {branchNodes.length} Branches
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Branch */}
          <button
            onClick={addBranch}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-700 text-white font-semibold text-xs hover:bg-blue-800 shadow-2xs cursor-pointer transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Branch</span>
          </button>

          {/* Save changes */}
          <button
            onClick={handleManualSave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer transition-colors"
          >
            <Save className="h-3.5 w-3.5 text-emerald-600" />
            <span>{isSavedNotice ? 'Saved!' : 'Save Map'}</span>
          </button>

          {/* Export SVG */}
          <button
            onClick={exportSvg}
            title="Export as vector SVG"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center rounded-md border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-2xs">
            <button
              onClick={() => setZoom((z) => Math.max(z - 15, 50))}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 15, 180))}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="border-l border-slate-200 p-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mind Map Interactive Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 flex items-center justify-center overflow-auto p-8 min-h-[500px]"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            width: `${width}px`,
            height: `${height}px`,
            transition: 'transform 0.15s ease-out'
          }}
          className="relative shrink-0 select-none"
        >
          {/* SVG Connectors */}
          <svg width={width} height={height} className="absolute inset-0 overflow-visible pointer-events-none">
            {positionedBranches.map((branch) => {
              const isCollapsed = !!collapsedBranches[branch.id];
              if (isCollapsed) return null;

              const isSelected = selectedNodeId === branch.id;
              const ctrlX = (centerX + branch.x) / 2;
              const ctrlY = (centerY + branch.y) / 2;

              return (
                <g key={`edge-${branch.id}`}>
                  <path
                    d={`M ${centerX} ${centerY} Q ${ctrlX} ${ctrlY} ${branch.x} ${branch.y}`}
                    fill="none"
                    stroke={isSelected ? '#1d4ed8' : '#94a3b8'}
                    strokeWidth={isSelected ? 2.5 : 1.75}
                    opacity={isSelected ? 1 : 0.7}
                  />
                  <circle
                    cx={branch.x}
                    cy={branch.y}
                    r={isSelected ? 4 : 3}
                    fill={isSelected ? '#1d4ed8' : '#94a3b8'}
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
            className={`absolute rounded-xl border-2 px-6 py-4 text-center shadow-md z-20 cursor-pointer transition-all ${
              selectedNodeId === centerNode.id
                ? 'border-blue-600 bg-blue-50 text-blue-950 ring-4 ring-blue-100 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-100 dark:ring-blue-900'
                : 'border-slate-800 bg-slate-900 text-white dark:border-slate-200 dark:bg-white dark:text-slate-900'
            }`}
          >
            <div className="text-[10px] uppercase font-mono tracking-widest font-bold opacity-80 mb-1">
              Central Subject
            </div>

            {editingNodeId === centerNode.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                  className="rounded border bg-white px-2 py-0.5 text-xs text-slate-900 focus:outline-hidden"
                  autoFocus
                />
                <button onClick={saveEdit} className="p-1 hover:bg-slate-700 rounded text-emerald-400">
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="font-serif font-bold text-sm sm:text-base max-w-[240px] leading-snug">
                  {centerNode.label}
                </span>
                <button
                  onClick={(e) => startEdit(centerNode, e)}
                  title="Rename Central Axiom"
                  className="opacity-60 hover:opacity-100 p-0.5 cursor-pointer"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Branch Nodes */}
          {positionedBranches.map((branch) => {
            const isSelected = selectedNodeId === branch.id;
            const isEditing = editingNodeId === branch.id;
            const isCollapsed = !!collapsedBranches[branch.id];

            return (
              <div
                key={branch.id}
                onClick={() => onSelectNode && onSelectNode(branch.id)}
                style={{
                  left: `${branch.x}px`,
                  top: `${branch.y}px`,
                  transform: 'translate(-50%, -50%)',
                  width: '240px'
                }}
                className={`absolute rounded-xl border bg-white p-3.5 text-left transition-all z-10 shadow-xs dark:bg-slate-900 cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-200 shadow-md dark:border-blue-400 dark:ring-blue-900'
                    : 'border-slate-300 hover:border-slate-500 hover:shadow-sm dark:border-slate-700 dark:hover:border-slate-600'
                }`}
              >
                {/* Node Header */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                    Branch 0{branch.index + 1}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => startEdit(branch, e)}
                      title="Edit label"
                      className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => deleteBranch(branch.id, e)}
                      title="Delete branch"
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Node Content / Inline Edit */}
                {isEditing ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      className="w-full rounded border border-blue-500 px-2 py-1 text-xs text-slate-900 focus:outline-hidden dark:bg-slate-800 dark:text-slate-100"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={saveEdit}
                        className="px-2 py-0.5 rounded bg-blue-600 text-white text-[10px] font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingNodeId(null)}
                        className="px-2 py-0.5 rounded border border-slate-300 text-slate-600 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-serif leading-snug line-clamp-2">
                      {branch.label}
                    </h4>
                    {branch.description && (
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-sans">
                        {branch.description}
                      </p>
                    )}
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
