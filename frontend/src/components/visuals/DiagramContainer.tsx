import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Layers,
  GitBranch,
  ArrowRightCircle,
  Clock,
  Columns,
  Share2,
  FileText,
  CreditCard,
  Calculator,
  Cpu,
  PenTool,
  FileCheck2,
  Info,
  X
} from 'lucide-react';
import type { VisualPattern } from '../../types';
import { PATTERN_LABELS } from '../../types';

interface DiagramContainerProps {
  title: string;
  pattern: VisualPattern;
  onPatternChange: (p: VisualPattern) => void;
  availablePatterns?: VisualPattern[];
  children: React.ReactNode;
  onResetZoom?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  zoomLevel?: number;
  activeConceptTitle?: string | null;
  onClearSelection?: () => void;
  onDownloadSvg?: () => void;
}

const PATTERN_ICONS: Record<VisualPattern, React.ReactNode> = {
  auto: <Layers className="h-3.5 w-3.5" />,
  mind_map: <GitBranch className="h-3.5 w-3.5" />,
  flowchart: <ArrowRightCircle className="h-3.5 w-3.5" />,
  timeline: <Clock className="h-3.5 w-3.5" />,
  comparison: <Columns className="h-3.5 w-3.5" />,
  concept_network: <Share2 className="h-3.5 w-3.5" />,
  infographic: <FileText className="h-3.5 w-3.5" />,
  sketchnotes: <PenTool className="h-3.5 w-3.5" />,
  revision_sheet: <FileCheck2 className="h-3.5 w-3.5" />,
  lesson_cards: <CreditCard className="h-3.5 w-3.5" />,
  storyboard: <Layers className="h-3.5 w-3.5" />,
  math_explanation: <Calculator className="h-3.5 w-3.5" />,
  system_architecture: <Cpu className="h-3.5 w-3.5" />,
};

// Priority quick-switch patterns shown as tabs on desktop
const PRIMARY_PATTERNS: VisualPattern[] = [
  'mind_map',
  'flowchart',
  'timeline',
  'comparison',
  'infographic',
  'sketchnotes',
  'revision_sheet',
  'lesson_cards'
];

export const DiagramContainer: React.FC<DiagramContainerProps> = ({
  title,
  pattern,
  onPatternChange,
  availablePatterns = [
    'mind_map',
    'flowchart',
    'sketchnotes',
    'revision_sheet',
    'concept_network',
    'timeline',
    'storyboard',
    'comparison',
    'infographic',
    'lesson_cards',
    'math_explanation',
    'system_architecture'
  ],
  children,
  onResetZoom,
  onZoomIn,
  onZoomOut,
  zoomLevel = 100,
  activeConceptTitle,
  onClearSelection,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl border border-slate-200 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900 shadow-xs ${
        isFullscreen
          ? 'fixed inset-3 z-50 shadow-2xl overflow-hidden'
          : 'min-h-[580px] lg:h-[660px] w-full overflow-hidden'
      }`}
    >
      {/* Top Academic Toolbar */}
      <div className="flex flex-col border-b border-slate-200 bg-slate-50/90 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300">
        {/* Row 1: Active Title + Pattern Quick Tabs + Zoom */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          {/* Left: Section Title & Active Concept */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-700 text-white shadow-2xs">
              {PATTERN_ICONS[pattern] || <Layers className="h-3.5 w-3.5" />}
            </span>
            <div className="truncate">
              <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100 truncate block">
                {title || 'Visual Model'}
              </span>
            </div>

            {activeConceptTitle && (
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 border border-blue-200 text-xs font-medium dark:bg-blue-950 dark:text-blue-200 dark:border-blue-900 shrink-0">
                <span className="text-[10px] uppercase font-mono font-bold text-blue-700 dark:text-blue-400">Inspecting:</span>
                <span className="truncate max-w-[150px] font-semibold">{activeConceptTitle}</span>
                {onClearSelection && (
                  <button
                    onClick={onClearSelection}
                    className="p-0.5 hover:bg-blue-200 rounded text-blue-700 dark:hover:bg-blue-900 dark:text-blue-300 cursor-pointer"
                    title="Clear selection"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Zoom controls and Fullscreen */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center rounded-md border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 shadow-2xs">
              {onZoomOut && (
                <button
                  onClick={onZoomOut}
                  title="Zoom Out"
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
              )}
              <span className="px-2 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300 select-none">
                {zoomLevel}%
              </span>
              {onZoomIn && (
                <button
                  onClick={onZoomIn}
                  title="Zoom In"
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              )}
              {onResetZoom && (
                <button
                  onClick={onResetZoom}
                  title="Reset Scale"
                  className="border-l border-slate-200 p-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Full Screen Canvas'}
              className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 cursor-pointer shadow-2xs transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Pattern Tabs & Selector */}
        <div className="flex items-center justify-between gap-2 px-4 py-1.5 border-t border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/90 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono uppercase font-bold text-slate-400 dark:text-slate-500 mr-1 hidden sm:inline">
              Layout:
            </span>

            {/* Quick-switch buttons for primary patterns */}
            <div className="hidden md:flex items-center gap-1">
              {PRIMARY_PATTERNS.map((p) => {
                const isActive = pattern === p;
                return (
                  <button
                    key={p}
                    onClick={() => onPatternChange(p)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {PATTERN_ICONS[p]}
                    <span>{PATTERN_LABELS[p]}</span>
                  </button>
                );
              })}
            </div>

            {/* All Patterns Select (accessible on mobile or for secondary patterns) */}
            <select
              value={pattern}
              onChange={(e) => onPatternChange(e.target.value as VisualPattern)}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer md:ml-1"
            >
              {availablePatterns.map((pat) => (
                <option key={pat} value={pat}>
                  {PATTERN_LABELS[pat] || pat}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
            <Info className="h-3 w-3" />
            <span>Select any node to view detailed textbook citations & explanations</span>
          </div>
        </div>
      </div>

      {/* Visual Canvas Viewport */}
      <div className="relative flex-1 bg-slate-50/40 dark:bg-slate-950/40 overflow-auto">
        {children}
      </div>
    </div>
  );
};
