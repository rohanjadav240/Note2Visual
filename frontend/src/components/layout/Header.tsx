import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Plus, Sparkles, BookOpen, User, LogOut, LogIn } from 'lucide-react';
import { useAppStore, useAuthStore } from '../../store';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useAppStore();
  const { user, logout } = useAuthStore();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Overview';
    if (path.startsWith('/upload')) return 'Transform Notes';
    if (path.startsWith('/processing')) return 'Processing Syllabus';
    if (path.startsWith('/workspace')) return 'Visual Learning Workspace';
    if (path.startsWith('/library')) return 'Study Library';
    if (path.startsWith('/templates')) return 'Curated Templates';
    if (path.startsWith('/progress')) return 'Learning Record';
    if (path.startsWith('/settings')) return 'Preferences';
    if (path.startsWith('/features')) return 'Platform Capabilities';
    if (path.startsWith('/how-it-works')) return 'How It Works';
    if (path.startsWith('/pricing')) return 'Pricing & Plans';
    if (path.startsWith('/faq')) return 'FAQ & Help';
    if (path.startsWith('/privacy')) return 'Privacy Policy';
    if (path.startsWith('/terms')) return 'Terms of Service';
    if (path.startsWith('/login')) return 'Account Sign In';
    if (path.startsWith('/register')) return 'Create Account';
    return 'Note2Visual';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400 dark:text-slate-500 font-mono tracking-wider uppercase text-[11px]">
            Workspace
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            {getPageTitle()}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Engine status indicator */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-[11px] font-mono dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span>Engine Active</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors shadow-2xs"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* User Auth or Sign In */}
        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {user.name || user.email.split('@')[0]}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {user.tier || 'Student'}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </Link>
        )}

        {/* Primary CTA */}
        {location.pathname !== '/upload' && (
          <Link
            to="/upload"
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Transform Notes</span>
          </Link>
        )}
      </div>
    </header>
  );
};
