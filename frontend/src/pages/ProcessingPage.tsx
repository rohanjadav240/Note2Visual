import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ProcessingStatus } from '../types';

export const ProcessingPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [statusData, setStatusData] = useState<ProcessingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;

    let timer: any;
    let isMounted = true;

    const checkStatus = async () => {
      try {
        const data = await apiService.getProcessingStatus(projectId);
        if (!isMounted) return;
        setStatusData(data);

        if (data.status === 'completed') {
          // Finished! Auto-redirect to workspace after short pause
          setTimeout(() => {
            navigate(`/workspace/${projectId}`);
          }, 1200);
          return;
        }

        if (data.status === 'failed') {
          setError(data.error || 'Processing encountered an error.');
          return;
        }

        // Poll again
        timer = setTimeout(checkStatus, 1500);
      } catch (err: any) {
        console.error('Error polling status:', err);
        if (isMounted) {
          setError('Could not retrieve processing status from backend.');
        }
      }
    };

    checkStatus();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [projectId, navigate]);

  const progressPercent = Math.round((statusData?.progress || 0.1) * 100);

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Synthesizing Visual Lesson
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Project ID: <span className="font-mono">{projectId}</span>
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span>Processing Interrupted</span>
          </div>
          <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={() => navigate('/upload')}
            className="rounded bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
          >
            Try Again / Upload Different Notes
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Overall Synthesis Progress</span>
              <span className="font-mono">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            {statusData?.steps?.map((step) => {
              const isCompleted = step.status === 'completed';
              const isInProgress = step.status === 'in_progress';
              const isFailed = step.status === 'failed';

              return (
                <div key={step.step} className="flex items-center justify-between pt-3 text-xs">
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : isInProgress ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                    ) : isFailed ? (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-300 dark:text-slate-600" />
                    )}
                    <span
                      className={`font-medium ${
                        isInProgress
                          ? 'text-blue-600 dark:text-blue-400 font-semibold'
                          : isCompleted
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 capitalize">
                    {step.status.replace('_', ' ')}
                  </span>
                </div>
              );
            })}
          </div>

          {statusData?.status === 'completed' && (
            <div className="pt-2 text-center text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Lesson generated successfully! Loading workspace...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
