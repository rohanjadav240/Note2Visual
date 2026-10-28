import React, { useEffect, useState } from 'react';
import {
  Settings,
  Sliders,
  Sun,
  Moon,
  Layers,
  Cpu,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAppStore, useVisualSettingsStore } from '../store';
import { apiService } from '../services/api';
import { PATTERN_LABELS } from '../types';
import type { VisualPattern } from '../types';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useAppStore();
  const { settings, setPattern, updateSettings } = useVisualSettingsStore();

  const [healthData, setHealthData] = useState<{
    status: string;
    ai_provider: string;
    demo_mode: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await apiService.getHealth();
        setHealthData(res);
      } catch (err) {
        console.error('Failed to query health:', err);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Preferences & System Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Customize diagram defaults, typography density, and review pedagogical engine configuration.
        </p>
      </div>

      {/* Backend Engine Status */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Pedagogical Engine Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-slate-400 block mb-0.5">Backend Core</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>{healthData?.status || 'Active'}</span>
            </div>
          </div>

          <div className="rounded border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-slate-400 block mb-0.5">AI Synthesis Mode</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
              <Cpu className="h-3.5 w-3.5 text-blue-600" />
              <span className="capitalize">{healthData?.ai_provider || 'Hybrid AI / Rule-Engine'}</span>
            </div>
          </div>

          <div className="rounded border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-slate-400 block mb-0.5">Document Parsing Engine</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
              <span>PyMuPDF + Docx Parser</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Configuration */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Visual Workspace Preferences
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-900 dark:text-slate-100">
                Display Theme
              </div>
              <div className="text-[11px] text-slate-500">
                Solid academic palette with crisp contrast and no eye-straining gradients.
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-3.5 w-3.5" />
                  <span>Switch to Dark</span>
                </>
              ) : (
                <>
                  <Sun className="h-3.5 w-3.5" />
                  <span>Switch to Light</span>
                </>
              )}
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <label className="block text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
              Default Visual Pattern
            </label>
            <select
              value={settings.pattern}
              onChange={(e) => setPattern(e.target.value as VisualPattern)}
              className="w-full max-w-xs rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="auto">Auto-detect best structure</option>
              {Object.entries(PATTERN_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
            <label className="block text-xs font-medium text-slate-900 dark:text-slate-100 mb-1">
              Diagram Information Density
            </label>
            <div className="flex gap-2">
              {['compact', 'standard', 'detailed'].map((d) => (
                <button
                  key={d}
                  onClick={() => updateSettings({ diagram_density: d })}
                  className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    settings.diagram_density === d
                      ? 'border border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
