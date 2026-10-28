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
  Check
} from 'lucide-react';
import { apiService } from '../services/api';
import { PATTERN_LABELS } from '../types';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'flowchart' | 'mindmap' | 'timeline'>('flowchart');

  const handleQuickDemo = async (sampleTopic: string, defaultPattern: string = 'mind_map') => {
    try {
      setLoadingDemo(true);
      const proj = await apiService.createProject({
        title: sampleTopic,
        subject: sampleTopic.includes('Respiration') ? 'Biology' : sampleTopic.includes('Systems') ? 'Computer Science' : 'History',
        language: 'en',
        explanation_level: 'intermediate',
        detail_amount: 'standard',
        default_pattern: defaultPattern as any,
      });

      const demoContent = sampleTopic.includes('Respiration')
        ? `Cellular Respiration and ATP Production:
Glycolysis occurs in the cytoplasm, breaking 1 glucose molecule into 2 pyruvate molecules and yielding 2 ATP net and 2 NADH.
The Krebs Cycle (Citric Acid Cycle) takes place in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to form citrate. It produces CO2, ATP, NADH, and FADH2.
Oxidative Phosphorylation is located on the inner mitochondrial cristae membrane. High energy electrons pass through complexes I-IV, creating a proton gradient that drives ATP Synthase to generate approximately 30-32 ATP per glucose molecule.`
        : `Distributed Systems and Consensus:
A distributed system consists of autonomous computing nodes communicating over a network to coordinate actions.
CAP Theorem establishes that a distributed data store can guarantee at most two of: Consistency, Availability, and Partition Tolerance.
Raft Consensus Algorithm achieves consensus via Leader Election, Log Replication, and Safety invariants.
Byzantine Fault Tolerance handles nodes that may fail arbitrarily, fail to respond, or send conflicting information.`;

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

  return (
    <div className="space-y-10 py-2">
      {/* Editorial Scholarly Hero Banner */}
      <section className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200 mb-6 font-mono">
          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>Educational Synthesizer & Visual Study Studio</span>
        </div>

        <h1 className="mx-auto max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
          Turn dense study notes into structured, interactive visual lessons.
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          Upload PDF textbooks, lecture slides, or raw markdown. Note2Visual deconstructs complex topics into 10 structured visual models, concept flashcards, and active-recall test questions.
        </p>

        {/* Action Buttons Row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/upload" className="btn-primary">
            <Upload className="h-4 w-4" />
            <span>Upload Notes / Syllabus</span>
          </Link>

          <button
            onClick={() => handleQuickDemo('Cellular Respiration and Bioenergetics', 'flowchart')}
            disabled={loadingDemo}
            className="btn-secondary"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>{loadingDemo ? 'Preparing Demo...' : 'Instant Demo: Biology Respiration'}</span>
          </button>
        </div>

        {/* Quality Guarantees */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-center items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>10 Cognitive Layouts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Automated Active Recall Quizzes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Clean Formatted PDF Exports</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Zero Fluff — Pure Learning</span>
          </div>
        </div>
      </section>

      {/* Live Visual Paradigm Preview */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-serif">
              Live Pedagogical Preview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Experience how different subject matter maps to specialized cognitive models:
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActivePreviewTab('flowchart')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                activePreviewTab === 'flowchart'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              Biology Flowchart
            </button>
            <button
              onClick={() => setActivePreviewTab('mindmap')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                activePreviewTab === 'mindmap'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              CS Mind Map
            </button>
            <button
              onClick={() => setActivePreviewTab('timeline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                activePreviewTab === 'timeline'
                  ? 'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-100'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
              }`}
            >
              History Timeline
            </button>
          </div>
        </div>

        {/* Live Preview Display Card */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-950/40 min-h-[300px] flex items-center justify-center">
          {activePreviewTab === 'flowchart' && (
            <div className="flex flex-col items-center gap-3 max-w-lg w-full">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-600 bg-emerald-50 px-5 py-2 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-100 shadow-xs">
                <PlayCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Start: 1 Glucose Molecule</span>
              </div>

              <div className="h-5 w-0.5 bg-slate-300 dark:bg-slate-700"></div>

              <div className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                    Step 1 • Cytoplasm
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    Anaerobic
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                  Glycolysis Phase
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Cleaves 6-carbon glucose into two 3-carbon pyruvates; produces 2 net ATP and 2 NADH.
                </p>
              </div>

              <div className="h-5 w-0.5 bg-slate-300 dark:bg-slate-700"></div>

              <div className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                    Step 2 • Mitochondrial Matrix
                  </span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-mono text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Key Cycle
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                  Krebs Cycle (Citric Acid Cycle)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Acetyl-CoA combines with oxaloacetate; produces CO2 while charging electron carriers NADH and FADH2.
                </p>
              </div>
            </div>
          )}

          {activePreviewTab === 'mindmap' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              <div className="sm:col-span-3 text-center mb-1">
                <span className="inline-block rounded-xl border-2 border-slate-900 bg-slate-900 text-white px-6 py-3 font-serif font-bold text-sm shadow-sm dark:border-white dark:bg-white dark:text-slate-900">
                  Distributed Systems Core
                </span>
              </div>
              <div className="rounded-xl border border-l-4 border-l-blue-600 border-slate-200 bg-white p-4 text-left shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 uppercase">Axiom 1</span>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 font-serif">CAP Theorem</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Tradeoffs between Consistency, Availability, and Partition Tolerance in asynchronous networks.
                </p>
              </div>
              <div className="rounded-xl border border-l-4 border-l-emerald-600 border-slate-200 bg-white p-4 text-left shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase">Axiom 2</span>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 font-serif">Raft Consensus</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Leader election protocols, heartbeats, and replicated log commit guarantees.
                </p>
              </div>
              <div className="rounded-xl border border-l-4 border-l-purple-600 border-slate-200 bg-white p-4 text-left shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <span className="text-[10px] font-mono font-bold text-purple-700 dark:text-purple-400 uppercase">Axiom 3</span>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 font-serif">Byzantine Faults</div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Resilience against arbitrary crashes, dropped packets, and adversarial conflicting messages.
                </p>
              </div>
            </div>
          )}

          {activePreviewTab === 'timeline' && (
            <div className="max-w-md w-full pl-6 border-l-2 border-slate-300 dark:border-slate-700 space-y-6 text-left">
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-blue-600 bg-white dark:bg-slate-900">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600 m-0.5"></div>
                </div>
                <div className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 uppercase">1543 AD</div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">Copernicus: Heliocentrism</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Publication of De revolutionibus establishes solar-centered astronomical orbits.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-blue-600 bg-white dark:bg-slate-900">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600 m-0.5"></div>
                </div>
                <div className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 uppercase">1687 AD</div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">Newton: Principia Mathematica</div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Universal Law of Gravitation unites celestial planetary motion with terrestrial physics.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3-Step Cognitive Workflow */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Cognitive Pipeline
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 dark:text-slate-100 mt-1">
            How Note2Visual structures your study session
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-mono font-bold text-xs mb-4 dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 font-serif">
              Extract & Deconstruct
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload PDF or document files. The engine parses hierarchy, separates core axioms from supporting examples, and logs exact source page numbers.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-mono font-bold text-xs mb-4 dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 font-serif">
              Synthesize Visual Models
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dynamically maps content into mind maps, workflows, chronological timelines, comparison matrices, or step-by-step mathematical proofs.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-mono font-bold text-xs mb-4 dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 font-serif">
              Active Recall & Revision
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Reinforce understanding with interactive flashcard flip cards, targeted quizzes with rationale, and formatted PDF revision briefs.
            </p>
          </div>
        </div>
      </section>

      {/* 10 Visual Patterns Reference */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 font-serif">
            10 Cognitive Representation Layouts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Switch seamlessly between representation models depending on your learning task:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 text-xs">
          {[
            { name: 'Mind Map', desc: 'Central themes & branches' },
            { name: 'Flowchart', desc: 'Processes & algorithms' },
            { name: 'Storyboard', desc: 'Narrative scene acts' },
            { name: 'Timeline', desc: 'Chronological progression' },
            { name: 'Comparison', desc: 'Side-by-side matrices' },
            { name: 'Concept Network', desc: 'Graph relationships' },
            { name: 'Infographic', desc: 'Key metrics & axioms' },
            { name: 'Lesson Cards', desc: 'Active recall bite units' },
            { name: 'Math Explanation', desc: 'Step derivations' },
            { name: 'System Architecture', desc: 'Modular components' },
          ].map((pat) => (
            <div
              key={pat.name}
              className="rounded-lg border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 shadow-2xs"
            >
              <div className="font-bold text-slate-900 dark:text-slate-100 text-xs font-serif">
                {pat.name}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                {pat.desc}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
