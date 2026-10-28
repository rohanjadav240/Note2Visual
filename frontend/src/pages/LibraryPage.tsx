import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Layers,
  Copy,
  Edit2,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  MoreVertical
} from 'lucide-react';
import { apiService } from '../services/api';
import type { Project } from '../types';
import { PATTERN_LABELS } from '../types';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'processing'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Rename modal state
  const [renamingProject, setRenamingProject] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  // Duplicating state
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!window.confirm('Delete this study lesson? This action cannot be undone.')) return;
    try {
      await apiService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project. Please try again.');
    }
  };

  const handleDuplicate = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setDuplicatingId(id);
      const duplicated = await apiService.duplicateProject(id);
      setProjects((prev) => [duplicated, ...prev]);
    } catch (err) {
      console.error('Failed to duplicate project:', err);
      alert('Failed to duplicate study pack.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleStartRename = (project: Project, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setRenamingProject(project);
    setRenameValue(project.title);
  };

  const handleSaveRename = async () => {
    if (!renamingProject || !renameValue.trim()) return;
    try {
      setRenameLoading(true);
      const updated = await apiService.updateProject(renamingProject.id, {
        title: renameValue.trim(),
      });
      setProjects((prev) =>
        prev.map((p) => (p.id === renamingProject.id ? { ...p, title: updated.title } : p))
      );
      setRenamingProject(null);
    } catch (err) {
      console.error('Failed to rename project:', err);
      alert('Failed to update title.');
    } finally {
      setRenameLoading(false);
    }
  };

  const subjects = ['All', ...new Set(projects.map((p) => p.subject).filter(Boolean) as string[])];

  const filteredProjects = projects
    .filter((p) => {
      const query = search.toLowerCase();
      const matchesSearch =
        p.title.toLowerCase().includes(query) ||
        (p.subject && p.subject.toLowerCase().includes(query)) ||
        (p.document_name && p.document_name.toLowerCase().includes(query));

      const matchesSubject = selectedSubject === 'All' || p.subject === selectedSubject;
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'completed'
          ? p.status === 'completed'
          : p.status !== 'completed';

      return matchesSearch && matchesSubject && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return a.title.localeCompare(b.title);
    });

  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const processingCount = projects.length - completedCount;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
            Study Library & Projects
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage your AI-synthesized visual study packs, interactive mind maps, and quiz decks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/upload"
            className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Create Study Pack</span>
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500">
            Total Study Packs
          </div>
          <div className="mt-1 text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
            {projects.length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across all subjects</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500">
            Completed Lessons
          </div>
          <div className="mt-1 text-2xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
            {completedCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ready for active review</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500">
            Processing / Draft
          </div>
          <div className="mt-1 text-2xl font-bold font-serif text-amber-600 dark:text-amber-400">
            {processingCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">In pipeline</div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500">
            Visual Engine
          </div>
          <div className="mt-1 text-base font-bold font-serif text-blue-600 dark:text-blue-400 flex items-center gap-1.5 pt-1">
            <Sparkles className="h-4 w-4" />
            <span>9 Visual Formats</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Multi-modal synthesis</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search packs by title, file, or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Subject Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="processing">In Progress</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center rounded border border-slate-200 p-0.5 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              className={`p-1 rounded ${
                viewMode === 'grid'
                  ? 'bg-white shadow-2xs text-blue-600 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`p-1 rounded ${
                viewMode === 'list'
                  ? 'bg-white shadow-2xs text-blue-600 dark:bg-slate-700 dark:text-white'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center dark:border-slate-800 bg-white dark:bg-slate-900">
          <BookOpen className="mx-auto h-9 w-9 text-slate-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No study packs found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {search || selectedSubject !== 'All' || selectedStatus !== 'all'
              ? 'Try adjusting your search criteria or resetting filters.'
              : 'Transform lecture notes, textbook chapters, or exam syllabi into interactive visual lessons.'}
          </p>
          <Link
            to="/upload"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create First Study Pack</span>
          </Link>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const isCompleted = project.status === 'completed';
            const patternLabel =
              PATTERN_LABELS[project.default_pattern as any] || project.default_pattern;
            const targetUrl = isCompleted
              ? `/workspace/${project.id}`
              : `/processing/${project.id}`;

            return (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-slate-400 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {project.subject || 'General'}
                    </span>
                    <span
                      className={`text-[10px] font-mono capitalize px-2 py-0.5 rounded ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <Link to={targetUrl} className="block group-hover:text-blue-600 transition-colors">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                      {project.title}
                    </h3>
                  </Link>

                  <div className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
                    {project.document_name && (
                      <div className="flex items-center gap-1.5 truncate">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{project.document_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>Format: {patternLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleStartRename(project, e)}
                      title="Rename lesson"
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDuplicate(project.id, e)}
                      disabled={duplicatingId === project.id}
                      title="Duplicate lesson"
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded disabled:opacity-50"
                    >
                      {duplicatingId === project.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      onClick={(e) => handleDelete(project.id, e)}
                      title="Delete lesson"
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <Link
                      to={targetUrl}
                      className="ml-1 flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
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
      ) : (
        /* LIST VIEW */
        <div className="rounded-lg border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 dark:bg-slate-800/60 dark:border-slate-800 text-[11px] font-mono text-slate-500 uppercase">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Title / Lesson</th>
                  <th className="py-2.5 px-3 font-semibold">Subject</th>
                  <th className="py-2.5 px-3 font-semibold">Pattern</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Created</th>
                  <th className="py-2.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredProjects.map((project) => {
                  const isCompleted = project.status === 'completed';
                  const patternLabel =
                    PATTERN_LABELS[project.default_pattern as any] || project.default_pattern;
                  const targetUrl = isCompleted
                    ? `/workspace/${project.id}`
                    : `/processing/${project.id}`;

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          to={targetUrl}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 block line-clamp-1"
                        >
                          {project.title}
                        </Link>
                        {project.document_name && (
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                            {project.document_name}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {project.subject || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                        {patternLabel}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-mono capitalize px-2 py-0.5 rounded ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}
                        >
                          {project.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartRename(project)}
                            title="Rename"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(project.id)}
                            disabled={duplicatingId === project.id}
                            title="Duplicate"
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50"
                          >
                            {duplicatingId === project.id ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(project.id)}
                            title="Delete"
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <Link
                            to={targetUrl}
                            className="ml-1 inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                          >
                            <span>Open</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renamingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100">
              Rename Study Pack
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Enter a concise title for this educational study pack.
            </p>

            <div className="mt-4">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename();
                  if (e.key === 'Escape') setRenamingProject(null);
                }}
                autoFocus
                className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRenamingProject(null)}
                className="rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRename}
                disabled={renameLoading || !renameValue.trim()}
                className="flex items-center gap-1.5 rounded bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {renameLoading && <RefreshCw className="h-3 w-3 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
