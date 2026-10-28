import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Headphones,
  Sparkles,
  BookOpen,
  Clock,
  RefreshCw,
  FileText
} from 'lucide-react';
import { apiService } from '../../services/api';
import type { AudioLessonResponse, AudioLessonSection } from '../../types';

interface AudioLessonPlayerProps {
  projectId: string;
  projectTitle: string;
}

export const AudioLessonPlayer: React.FC<AudioLessonPlayerProps> = ({
  projectId,
  projectTitle
}) => {
  const [audioLesson, setAudioLesson] = useState<AudioLessonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [speechSupported, setSpeechSupported] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }

    const loadLesson = async () => {
      try {
        setLoading(true);
        const data = await apiService.getAudioLesson(projectId);
        setAudioLesson(data);
      } catch (err) {
        // Not generated yet, that's fine
        setAudioLesson(null);
      } finally {
        setLoading(false);
      }
    };

    loadLesson();

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [projectId]);

  const handleGenerate = async (mode: string = 'lecture') => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.generateAudioLesson(projectId, mode);
      setAudioLesson(data);
      setCurrentSectionIndex(0);
    } catch (err: any) {
      console.error('Audio generation failed:', err);
      setError('Could not synthesize audio lesson. Please ensure the study notes are generated first.');
    } finally {
      setLoading(false);
    }
  };

  const playSection = (index: number) => {
    if (!audioLesson || !speechSupported) return;
    const section = audioLesson.sections[index];
    if (!section) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(section.text);
    utterance.rate = playbackSpeed;

    utterance.onend = () => {
      if (index + 1 < audioLesson.sections.length) {
        setCurrentSectionIndex(index + 1);
        playSection(index + 1);
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setCurrentSectionIndex(index);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!speechSupported) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      playSection(currentSectionIndex);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      playSection(currentSectionIndex);
    }
  };

  const handleRestart = () => {
    window.speechSynthesis.cancel();
    setCurrentSectionIndex(0);
    playSection(0);
  };

  if (loading && !audioLesson) {
    return (
      <div className="flex h-72 flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Synthesizing AI Audio Lesson & Script...
        </div>
      </div>
    );
  }

  if (!audioLesson) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 shadow-xs max-w-2xl mx-auto space-y-5 my-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Headphones className="h-7 w-7" />
        </div>

        <div>
          <h3 className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
            Generate AI Audio Lesson
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Turn your visual notes into an interactive audio masterclass. Listen while on a walk or during revision with speed controls and synchronized transcripts.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-rose-50 p-2.5 text-xs text-rose-800 border border-rose-200">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handleGenerate('lecture')}
            disabled={loading}
            className="btn-primary"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Comprehensive Lecture</span>
          </button>

          <button
            onClick={() => handleGenerate('revision')}
            disabled={loading}
            className="btn-secondary"
          >
            <Clock className="h-4 w-4" />
            <span>Fast 2-Min Exam Recap</span>
          </button>
        </div>
      </div>
    );
  }

  const currentSection = audioLesson.sections[currentSectionIndex] || audioLesson.sections[0];
  const progressPercent = Math.round(
    ((currentSectionIndex + 1) / audioLesson.sections.length) * 100
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Audio Player Card */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-2xs">
              <Headphones className="h-5 w-5" />
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Educational Audio Class
              </span>
              <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
                {audioLesson.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">
              ~{Math.round(audioLesson.estimated_duration_seconds / 60)} min listening
            </span>
          </div>
        </div>

        {/* Current Active Section Badge */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Part {currentSectionIndex + 1} of {audioLesson.sections.length} • {currentSection?.topic_title}
            </span>
            <span className="font-mono text-[10px] text-slate-400 font-semibold">
              Speaker: {currentSection?.speaker}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans italic">
            "{currentSection?.text}"
          </p>
        </div>

        {/* Playback Progress Rail */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>Progress: {progressPercent}%</span>
            <span>Section {currentSectionIndex + 1}/{audioLesson.sections.length}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-blue-600 transition-all duration-300"
            />
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Left: Speed presets */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-mono text-slate-400 mr-1">Speed:</span>
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeedChange(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                  playbackSpeed === s
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Center: Play/Pause/Restart */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleRestart}
              title="Restart from beginning"
              className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            <button
              onClick={togglePlay}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white hover:bg-blue-800 shadow-md transition-transform hover:scale-105 cursor-pointer"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </button>
          </div>

          {/* Right: Regenerate options */}
          <button
            onClick={() => handleGenerate(audioLesson.mode === 'lecture' ? 'revision' : 'lecture')}
            className="text-xs text-blue-700 hover:underline dark:text-blue-400 font-semibold cursor-pointer"
          >
            Switch to {audioLesson.mode === 'lecture' ? 'Fast Recap' : 'Full Lecture'}
          </button>
        </div>
      </div>

      {/* Synchronized Script Chapters */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
          <FileText className="h-4 w-4 text-slate-500" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Full Audio Lesson Script
          </h3>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-2">
          {audioLesson.sections.map((sec, idx) => (
            <div
              key={idx}
              onClick={() => playSection(idx)}
              className={`pt-3 p-3 rounded-lg cursor-pointer transition-colors ${
                currentSectionIndex === idx
                  ? 'bg-blue-50/70 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-serif">
                  {idx + 1}. {sec.topic_title}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {sec.speaker}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {sec.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
