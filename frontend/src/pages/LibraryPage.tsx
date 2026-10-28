import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  BookOpen,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  FileText,
  Clock,
  Layers
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Project } from '../types';
import { PATTERN_LABELS } from '../types';

export const LibraryPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await apiService.listProjects();
      setProjects(res.projects);
    } catch (err) {
      console.error('Failed to list projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this study lesson?')) return;
    try {
      await apiService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const subjects = ['All', ...new Set(projects.map((p) => p.subject).filter(Boolean) as string[])];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.subject && p.subject.toLowerCase().includes(search.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || p.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
            Study Library
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {projects.length} saved visual lessons and synthesized study materials.
          </p>
        </div>

        <Link
          to="/upload"
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Visual Lesson</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search lessons by title or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <BookOpen className="mx-auto h-8 w-8 text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No lessons found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {search ? 'Try modifying your search query.' : 'Upload your first document to begin.'}
          </p>
          <Link
            to="/upload"
            className="mt-4 inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Transform Notes</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const isCompleted = project.status === 'completed';
            const patternLabel = PATTERN_LABELS[project.default_pattern as any] || project.default_pattern;

            return (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {project.subject || 'General'}
                    </span>
                    <span
                      className={`text-[10px] font-mono capitalize px-1.5 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <Link
                    to={isCompleted ? `/workspace/${project.id}` : `/processing/${project.id}`}
                    className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                      {project.title}
                    </h3>
                  </Link>

                  <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                    {project.document_name && (
                      <div className="flex items-center gap-1.5 truncate">
                        <FileText className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{project.document_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3 w-3 shrink-0 text-slate-400" />
                      <span>Pattern: {patternLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      title="Delete lesson"
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <Link
                      to={isCompleted ? `/workspace/${project.id}` : `/processing/${project.id}`}
                      className="flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <span>Open</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
