import { create } from 'zustand';
import type { VisualSettings, VisualPattern } from '../types';

interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'light',
  sidebarOpen: true,
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      return { theme: next };
    }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

interface VisualSettingsState {
  settings: VisualSettings;
  setPattern: (pattern: VisualPattern) => void;
  setThemeName: (theme: string) => void;
  updateSettings: (partial: Partial<VisualSettings>) => void;
}

export const useVisualSettingsStore = create<VisualSettingsState>((set) => ({
  settings: {
    pattern: 'auto',
    theme: 'clean_academic',
    color_primary: '#2563eb',
    color_accent: '#0d9488',
    dark_mode: false,
    font_size: 'medium',
    diagram_density: 'standard',
    spacing: 'comfortable',
    animation_intensity: 'moderate',
    show_source_refs: true,
  },
  setPattern: (pattern) =>
    set((state) => ({ settings: { ...state.settings, pattern } })),
  setThemeName: (theme) =>
    set((state) => ({ settings: { ...state.settings, theme } })),
  updateSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
}));
