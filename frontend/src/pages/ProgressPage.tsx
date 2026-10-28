import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Calendar,
  Layers,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';
import type { LearningProgressData } from '../types';

export const ProgressPage: React.FC = () => {
  const [data, setData] = useState<LearningProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await apiService.getProgress();
        setData(res);
      } catch (err) {
        console.error('Failed to load progress:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const minutesSpent = Math.round((data?.total_time_seconds || 0) / 60);

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Learning Record & Retention Analytics
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Detailed metrics on study sessions, topic completions, and active recall mastery.
        </p>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <BookOpen className="h-4 w-4 text-blue-600" />
            <span>Completed Lessons</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {data?.completed_lessons || 0}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">
              / {data?.total_lessons || 0}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Topics Mastered</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {data?.completed_topics || 0}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">
              / {data?.total_topics || 0}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <Award className="h-4 w-4 text-amber-500" />
            <span>Average Quiz Score</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {data?.average_score ? `${data.average_score}%` : 'N/A'}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs mb-1">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>Active Study Time</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {minutesSpent}
            <span className="text-xs font-normal text-slate-400 font-sans ml-1">min</span>
          </div>
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 p-5">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Recent Study Sessions
        </h3>

        {!data?.recent_sessions || data.recent_sessions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No study sessions recorded yet. Start reading a topic in the workspace to track progress.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800">
                  <th className="py-2.5">Topic</th>
                  <th className="py-2.5">Time Logged</th>
                  <th className="py-2.5">Status</th>
                  <th className="py-2.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_sessions.map((sess, i) => (
                  <tr key={i} className="text-slate-700 dark:text-slate-300">
                    <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                      {sess.topic_title}
                    </td>
                    <td className="py-3 font-mono">{Math.round(sess.time_spent / 60)} min</td>
                    <td className="py-3">
                      {sess.completed ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Completed
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          In Progress
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-mono text-[11px] text-slate-400">
                      {sess.last_accessed ? new Date(sess.last_accessed).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
