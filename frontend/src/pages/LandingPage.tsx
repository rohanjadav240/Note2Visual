import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Upload,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  BarChart2,
  Cpu,
  GraduationCap,
  PlayCircle,
  Network,
  Milestone,
  Check,
  Volume2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  ShieldCheck,
  FileCode,
  FileCheck,
  ArrowLeftRight
} from 'lucide-react';
import { apiService } from '../services/api';
import { PATTERN_LABELS } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'mindmap' | 'flowchart' | 'sketchnotes' | 'revisionsheet'>('mindmap');
  const [beforeAfterMode, setBeforeAfterMode] = useState<'after' | 'before'>('after');
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(0);

  const handleQuickDemo = async (sampleTopic: string, defaultPattern: string = 'mind_map') => {
    try {
      setLoadingDemo(true);
      const proj = await apiService.createProject({
        title: sampleTopic,
        subject: sampleTopic.includes('Respiration') ? 'Biology' : sampleTopic.includes('Consensus') ? 'Computer Science' : 'History',
        language: 'en',
        explanation_level: 'intermediate',
        detail_amount: 'standard',
        default_pattern: defaultPattern as any,
      });

      const demoContent = sampleTopic.includes('Respiration')
        ? `Cellular Respiration and Bioenergetics:
Glycolysis occurs in the cytoplasm, breaking 1 glucose molecule into 2 pyruvate molecules and yielding 2 ATP net and 2 NADH.
The Krebs Cycle (Citric Acid Cycle) takes place in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to form citrate. It produces CO2, ATP, NADH, and FADH2.
Oxidative Phosphorylation is located on the inner mitochondrial cristae membrane. High energy electrons pass through complexes I-IV, creating a proton gradient that drives ATP Synthase to generate approximately 30-32 ATP per glucose molecule.`
        : `Distributed Consensus & Fault Tolerance:
A distributed system coordinates state among independent nodes across asynchronous networks.
CAP Theorem: A distributed store can guarantee at most two of Consistency, Availability, and Partition Tolerance.
Raft Consensus: Solves state machine replication through randomized leader elections, heartbeat syncs, and committed append-only logs.
Byzantine Fault Tolerance: Algorithms that maintain safety and liveness even when nodes send contradictory or malicious messages.`;

      const blob = new Blob([demoContent], { type: 'text/plain' });
      const file = new File([blob], `${sampleTopic.replace(/\s+/g, '_')}_Notes.txt`, {
        type: 'text/plain',
      });

      await apiService.uploadDocument(proj.id, file);
      await apiService.generateLesson(proj.id);
      navigate(`/processing/${proj.id}`);
    } catch (err) {
      console.error('Demo creation error:', err);
      navigate('/upload');
    } finally {
      setLoadingDemo(false);
    }
  };

  const visualFormats = [
    { id: 'mind_map', name: 'Mind Maps', desc: 'Central themes with branching conceptual sub-nodes for holistic context.' },
    { id: 'sketchnotes', name: 'Hand-drawn Sketchnotes', desc: 'Notebook doodle aesthetics, sticky callouts, and organic visual metaphors.' },
    { id: 'flowchart', name: 'Flowcharts & Logic', desc: 'Step-by-step algorithms, conditional branches, and operational workflows.' },
    { id: 'timeline', name: 'Timelines & History', desc: 'Chronological progression markers with contextual annotations.' },
    { id: 'comparison', name: 'Comparison Matrices', desc: 'Side-by-side attribute evaluations, pros/cons, and criteria matrices.' },
    { id: 'revision_sheet', name: 'Revision Cheat Sheets', desc: 'High-yield exam summaries, mnemonics, equations, and trap warnings.' },
    { id: 'system_architecture', name: 'System Architecture', desc: 'Multi-layer system components, interfaces, and protocol flows.' },
    { id: 'step_by_step', name: 'Step-by-Step Proofs', desc: 'Numbered sequential derivations with pedagogical commentary.' },
    { id: 'infographic', name: 'Infographics', desc: 'Data-rich statistical breakdowns, axioms, and summary cards.' },
  ];

  const faqs = [
    {
      q: 'How does Note2Visual convert my notes into visual diagrams?',
      a: 'When you upload a PDF, Word document, or paste notes, our pedagogical parser extracts key definitions, causal relationships, and hierarchical structures. It then maps the content into content-aware visual models such as Mind Maps, Flowcharts, or Sketchnotes.'
    },
    {
      q: 'Can I edit the generated Mind Maps and diagrams?',
      a: 'Yes! Note2Visual includes an interactive Mind Map Studio where you can pan, zoom, click nodes to rename labels, add child concepts, prune branches, and export vector SVGs.'
    },
    {
      q: 'Are the audio lessons human-narrated or AI?',
      a: 'Our engine generates a structured educational lecture script. The playback is synthesized instantly in your browser via the Web Speech API with 0 latency and customizable speeds from 0.75x to 2.0x.'
    },
    {
      q: 'Will my study materials be shared or used to train models?',
      a: 'Never. Your course documents and student notes are private to your workspace. We adhere to strict academic privacy principles and do not train foundation models on user uploads.'
    }
  ];

  return (
    <div className="space-y-16 py-2">
      {/* 1. HERO SECTION */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-14 text-center dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-900 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-200 mb-6 font-mono">
          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Cognitive AI Learning Platform</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          Turn Your Notes Into Visual Learning.
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          Upload PDF textbooks, lecture slides, or raw class notes. Note2Visual automatically transforms dense syllabus material into interactive mind maps, sketchnotes, audio lessons, flashcards, and exam quizzes.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/upload"
            className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Notes / PDF</span>
          </Link>

          <button
            onClick={() => handleQuickDemo('Distributed Consensus & Fault Tolerance', 'mind_map')}
            disabled={loadingDemo}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>{loadingDemo ? 'Synthesizing...' : 'Live Demo: Distributed Systems'}</span>
          </button>
        </div>

        {/* Value Prop Badges */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>9 Specialized Visual Formats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Spoken AI Audio Lessons</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Active Recall Quizzes & Flashcards</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Exact Source Page Citations</span>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE BEFORE & AFTER DEMO */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Interactive Comparison
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
              From Dense Lecture Notes to Instant Cognitive Clarity
            </h2>
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 p-1 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            <button
              onClick={() => setBeforeAfterMode('before')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                beforeAfterMode === 'before'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Before: Dense Text (40 Pages)
            </button>
            <button
              onClick={() => setBeforeAfterMode('after')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                beforeAfterMode === 'after'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              After: Note2Visual Study Pack
            </button>
          </div>
        </div>

        {beforeAfterMode === 'before' ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 font-mono text-xs leading-relaxed space-y-4">
            <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold uppercase">
              Original Course Syllabus Extract: Chapter 14.2 (Dense Text Format)
            </div>
            <p>
              "The Krebs cycle, also known as the tricarboxylic acid (TCA) cycle or citric acid cycle, is a series of chemical reactions used by all aerobic organisms to generate energy through the oxidization of acetate derived from carbohydrates, fats, and proteins into carbon dioxide and chemical energy in the form of ATP. Furthermore, the cycle provides precursors of certain amino acids as well as the reducing agent NADH that are used in numerous biochemical reactions. In eukaryotic cells, the citric acid cycle occurs in the matrix of the mitochondrion. The cycle is an 8-step process involving citrate synthase, aconitase, isocitrate dehydrogenase, α-ketoglutarate dehydrogenase, succinyl-CoA synthetase, succinate dehydrogenase, fumarase, and malate dehydrogenase..."
            </p>
            <div className="rounded border border-dashed border-slate-300 p-3 text-[11px] text-slate-500 dark:border-slate-700">
              ⚠️ Problems: Passive rereading, low retention (&lt;20% after 48h), difficult to recall during timed exams, no interactive testing.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-l-4 border-l-blue-600 border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-blue-600">Mind Map</span>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  Concept 1
                </span>
              </div>
              <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                Aerobic Cellular Respiration
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                Branching tree linking Glycolysis (Cytoplasm) $\to$ Krebs Cycle (Matrix) $\to$ Electron Transport Chain (Cristae).
              </p>
            </div>

            <div className="rounded-xl border border-l-4 border-l-emerald-600 border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-600">Revision Sheet</span>
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Exam Yield
                </span>
              </div>
              <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                Net ATP & Carrier Yield
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                Equation: C6H12O6 + 6O2 $\to$ 6CO2 + 6H2O + 30-32 ATP. High-yield exam mnemonic: "Can I Keep Selling Substances For Money, Officer?"
              </p>
            </div>

            <div className="rounded-xl border border-l-4 border-l-purple-600 border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-600">Active Recall</span>
                <span className="rounded bg-purple-50 px-2 py-0.5 text-[9px] font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  Flashcard & Quiz
                </span>
              </div>
              <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                Self-Assessment Question
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                "Where specifically does the proton gradient build during oxidative phosphorylation?" $\to$ Intermembrane space.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* 3. VISUAL FORMATS GALLERY */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Multi-Modal Pedagogical Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
            9 Specialized Visual Learning Formats
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Every subject has its own structure. Note2Visual chooses the visual format that best matches your course material.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visualFormats.map((fmt) => (
            <div
              key={fmt.id}
              className="rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
                  {fmt.name}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Format
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {fmt.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FOUR-STEP WORKFLOW */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            How It Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
            From Raw Notes to Mastery in 4 Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white font-mono font-bold text-xs dark:bg-white dark:text-slate-900">
              01
            </div>
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
              Upload Notes
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Drop PDF textbooks, Word docs, slide decks, or paste rough lecture text.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white font-mono font-bold text-xs dark:bg-white dark:text-slate-900">
              02
            </div>
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
              Pedagogical Analysis
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Identifies core axioms, dependencies, exam traps, and page citations.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white font-mono font-bold text-xs dark:bg-white dark:text-slate-900">
              03
            </div>
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
              Visual & Audio Synthesis
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generates interactive diagrams, mind maps, and synchronized voice briefings.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white font-mono font-bold text-xs dark:bg-white dark:text-slate-900">
              04
            </div>
            <h3 className="font-serif font-bold text-sm text-slate-900 dark:text-slate-100">
              Active Recall Testing
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Study with 3D flashcards, take quizzes, and download formatted revision PDFs.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BENEFITS FOR STUDENTS & EDUCATORS */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Measurable Outcomes
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
            Built for Serious Academic Retention
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              3x Faster Conceptual Grasp
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dual-coding theory demonstrates that combining spatial visual models with structured text increases immediate comprehension compared to monotone reading.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Zero Passive Rereading
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every study pack includes active-recall flashcard decks and self-assessment test items with explanation rationales so you know your true test readiness.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Volume2 className="h-5 w-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
              Auditory Commute Review
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Turn lectures into audio briefings to review concepts during commutes, workouts, or breaks without straining your eyes.
            </p>
          </div>
        </div>
      </section>

      {/* 6. PRICING PREVIEW */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600">
            Student Friendly Plans
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
            Transparent, Academic Pricing
          </h2>
          <p className="text-xs text-slate-500">
            Free tier available forever. Upgrade anytime for unlimited study packs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                Free Academic
              </div>
              <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-2">
                $0
              </div>
              <p className="text-xs text-slate-500 mt-1">10 study packs / month</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" /> Standard Mind Maps</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" /> Flashcards & Quizzes</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" /> Audio Lessons</li>
              </ul>
            </div>
            <Link to="/upload" className="mt-6 block text-center rounded bg-slate-200 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200">
              Start Free
            </Link>
          </div>

          <div className="rounded-xl border-2 border-blue-600 p-6 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">Pro Student</span>
                <span className="rounded bg-blue-600 text-white text-[9px] font-mono px-2 py-0.5">Popular</span>
              </div>
              <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-2">
                $9 <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Unlimited study packs</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" /> All 10 Visual Formats</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" /> Vector SVG & PDF Exports</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" /> Interactive Mind Map Studio</li>
              </ul>
            </div>
            <Link to="/register" className="mt-6 block text-center rounded bg-blue-600 py-2 text-xs font-semibold text-white hover:bg-blue-700">
              Get Pro Student
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 p-6 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/30 flex flex-col justify-between">
            <div>
              <div className="font-serif font-bold text-base text-slate-900 dark:text-slate-100">
                Educator & Team
              </div>
              <div className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-2">
                $29 <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Classrooms & professors</p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" /> Classroom Workspaces</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" /> Batch Syllabus Upload</li>
                <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-blue-600" /> LMS Export Options</li>
              </ul>
            </div>
            <Link to="/pricing" className="mt-6 block text-center rounded bg-slate-200 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200">
              View All Details
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-slate-100">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Got questions? We're here to explain our academic synthesis process.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpenIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpenIdx(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-serif text-sm font-semibold text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. FOOTER WITH NAVIGATION & LEGAL */}
      <footer className="mt-16 border-t border-slate-200 pt-10 pb-6 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="font-serif font-bold text-slate-900 dark:text-slate-100 text-sm mb-3">
              Note2Visual
            </div>
            <p className="text-[11px] leading-relaxed">
              Cognitive study platform transforming lecture notes into interactive visual models, mind maps, and active recall decks.
            </p>
          </div>

          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-3 font-mono text-[11px] uppercase">
              Platform
            </div>
            <ul className="space-y-2">
              <li><Link to="/features" className="hover:text-blue-600">Features</Link></li>
              <li><Link to="/how-it-works" className="hover:text-blue-600">How It Works</Link></li>
              <li><Link to="/templates" className="hover:text-blue-600">Templates</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-600">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-3 font-mono text-[11px] uppercase">
              Resources
            </div>
            <ul className="space-y-2">
              <li><Link to="/faq" className="hover:text-blue-600">FAQ & Help</Link></li>
              <li><Link to="/upload" className="hover:text-blue-600">Upload Notes</Link></li>
              <li><Link to="/library" className="hover:text-blue-600">Study Library</Link></li>
              <li><Link to="/progress" className="hover:text-blue-600">Progress Record</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 mb-3 font-mono text-[11px] uppercase">
              Legal
            </div>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
              <li><a href="mailto:support@note2visual.com" className="hover:text-blue-600">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} Note2Visual Inc. All academic rights reserved.
          </div>
          <div className="font-mono text-[10px]">
            Academic Identity • Zero Gradient Aesthetic
          </div>
        </div>
      </footer>
    </div>
  );
};
