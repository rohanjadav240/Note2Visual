import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  Brain,
  FileText,
  Volume2,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Zap,
  Target,
  Download,
  Share2,
  Workflow
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  return (
    <div className="space-y-12 py-4 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-[11px] font-mono font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Full Educational Capabilities</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Engineered for Deep Academic Comprehension
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Note2Visual converts any educational text or slide deck into active, multi-sensory study packs—combining 10 visual representations, audible lesson briefings, interactive mind mapping, and active recall testing.
        </p>
      </div>

      {/* Core Feature Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature 1 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
            <Layers className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100">
            10 Cognitive Representation Formats
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Content-aware layout generation selects the pedagogical layout that fits your subject:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              <strong>Infographics & Sketchnotes:</strong> Visual metaphors, notebook doodle styles, key callouts.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              <strong>Flowcharts & Algorithms:</strong> Stepwise logic, conditional branches, start/end terminals.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              <strong>Timelines & Histories:</strong> Chronological milestone markers with context notes.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              <strong>Revision Cheat Sheets:</strong> High-yield exam cheat sheets with mnemonics & trap alerts.
            </li>
          </ul>
        </div>

        {/* Feature 2 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Workflow className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100">
            Interactive Mind Map Studio
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Directly navigate and restructure knowledge trees:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              <strong>Zoom, Pan & Trace:</strong> Explore intricate hierarchies smoothly with mouse or touchpad.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              <strong>Live Node Customization:</strong> Add child nodes, edit concept labels, or prune irrelevant branches.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
              <strong>Vector SVG Export:</strong> Download full vector diagrams to insert directly into presentation slides.
            </li>
          </ul>
        </div>

        {/* Feature 3 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
            <Volume2 className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100">
            AI Audio Lessons & Podcast Briefings
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Listen on the go with synthesized spoken lecture briefings:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
              <strong>Natural Speech Synthesis:</strong> Real-time browser audio playback with zero latency or API fees.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
              <strong>Variable Playback Speed:</strong> Study at 0.75x, 1x, 1.25x, 1.5x, or 2x speed.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
              <strong>Synchronized Transcript:</strong> Follow along with clickable timestamp markers.
            </li>
          </ul>
        </div>

        {/* Feature 4 */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
            <Target className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100">
            Active Recall Flashcards & Quizzes
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Never passively reread notes again. Test yourself continuously:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              <strong>3D Flip Flashcards:</strong> Flip with Spacebar, navigate with Arrow keys, tag known vs difficult.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              <strong>Conceptual Quizzes:</strong> Instant evaluation, detailed reasoning, and targeted retry mode.
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>
              <strong>Source Citations:</strong> Jump back to exact pages or sentences in the original document.
            </li>
          </ul>
        </div>
      </div>

      {/* Call to action */}
      <div className="rounded-xl border border-slate-200 bg-slate-900 p-8 text-center text-white dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-2xl font-serif font-bold">
          Ready to experience visual learning?
        </h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Upload any lecture, research paper, or textbook chapter and get an interactive visual study pack in seconds.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <span>Transform Notes Now</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
