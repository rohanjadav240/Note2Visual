import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  FolderKanban,
  LayoutGrid,
  BarChart3,
  Settings,
  X,
  GraduationCap,
  Layers,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  CreditCard,
  Compass,
  Cpu,
  LogIn,
  User as UserIcon
} from 'lucide-react';
import { useAuthStore } from '../../store';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileClose }) => {
  const { user } = useAuthStore();

  const mainNavItems = [
    { to: '/', label: 'Overview', icon: BookOpen },
    { to: '/upload', label: 'Transform Notes', icon: Upload },
    { to: '/library', label: 'Study Library', icon: FolderKanban },
    { to: '/templates', label: 'Curated Templates', icon: LayoutGrid },
    { to: '/progress', label: 'Progress & Review', icon: BarChart3 },
    { to: '/settings', label: 'Preferences', icon: Settings },
  ];

  const publicNavItems = [
    { to: '/features', label: 'Platform Features', icon: Sparkles },
    { to: '/how-it-works', label: 'How It Works', icon: Cpu },
    { to: '/pricing', label: 'Pricing Plans', icon: CreditCard },
    { to: '/faq', label: 'FAQ & Help', icon: HelpCircle },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto">
      {/* Brand & Nav */}
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <NavLink
            to="/"
            className="flex items-center gap-3 text-left"
            onClick={onMobileClose}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-900 bg-slate-900 text-white font-bold text-sm tracking-tight dark:border-white dark:bg-white dark:text-slate-900 shadow-xs">
              N2V
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 font-serif">
                Note2Visual
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 dark:text-slate-500 font-medium">
                Cognitive Studio
              </div>
            </div>
          </NavLink>

          <button
            onClick={onMobileClose}
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500 font-mono">
            Study Workspace
          </div>

          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500 font-mono">
            Platform & Guide
          </div>

          {publicNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onMobileClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 text-blue-700 dark:bg-slate-800 dark:text-blue-300 font-semibold'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box & User Indicator */}
      <div className="border-t border-slate-200 p-4 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-3">
        {user ? (
          <div className="rounded-md border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900 flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs dark:bg-blue-950 dark:text-blue-300">
              {(user.name?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs truncate">
                {user.name || user.email.split('@')[0]}
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">
                {user.tier || 'Student'} Plan
              </div>
            </div>
          </div>
        ) : (
          <NavLink
            to="/login"
            onClick={onMobileClose}
            className="flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 transition-colors shadow-2xs"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In to Sync</span>
          </NavLink>
        )}

        <div className="rounded-md border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100 text-[11px] mb-0.5">
            <GraduationCap className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Note2Visual Academic</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
            Cognitive visual synthesis for college, school & competitive exams.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar: sticky left flex column, NEVER overlaps content */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 sticky top-0 h-screen border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onMobileClose}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
