import React from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Cpu,
  Layers,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  FileText,
  Search,
  Sparkles
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload or Paste Any Study Material',
      desc: 'Provide your educational inputs: upload multi-page PDFs, Microsoft Word (.docx), PowerPoint (.pptx), paste plain lecture notes, or supply public video URLs. Note2Visual handles clean text extraction and OCR for scanned documents.',
      details: [
        'Supports dense academic textbooks up to 100MB',
        'Preserves chapter structure, headings, and equations',
        'Zero data training on personal academic materials'
      ]
    },
    {
      num: '02',
      title: 'Pedagogical Parsing & Concept Mapping',
      desc: 'Our AI engine parses core assertions, domain terms, chronological orders, dependencies, and logical hierarchies. It discards conversational filler and clusters insights into unified study topics.',
      details: [
        'Automatic subject classification (STEM, Humanities, Medicine, CS)',
        'Extracts key terminology and definitions',
        'Maps parent-to-child knowledge hierarchies'
      ]
    },
    {
      num: '03',
      title: 'Multi-Modal Visual Synthesis',
      desc: 'Instead of forcing everything into one diagram, Note2Visual synthesizes 10 specialized educational formats: from interactive Mind Maps and Flowcharts to Sketchnotes and Exam Cheat Sheets.',
      details: [
        'Diagrams adapt dynamically to the subject structure',
        'Interactive nodes with zoom, pan, and live editing',
        'Synthesizes an audio lecture briefing with synchronized script'
      ]
    },
    {
      num: '04',
      title: 'Active Study & Formatted Export',
      desc: 'Study interactively via 3D flashcards, take self-assessment quizzes with answer rationales, listen to podcast briefings, or export vector SVGs and printable revision PDFs for offline study.',
      details: [
        'Spaced repetition flashcards with keyboard shortcuts',
        'Direct source document citations for instant fact-checking',
        'One-click vector SVG and PDF export'
      ]
    }
  ];

  return (
    <div className="space-y-12 py-4 max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-[11px] font-mono font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
          <Cpu className="h-3.5 w-3.5" />
          <span>The Note2Visual Pipeline</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-slate-100">
          How Note2Visual Transforms Your Notes
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          From dense, unreadable text documents to high-retention visual learning experiences in four rigorous pedagogical steps.
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-8">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className="flex flex-col md:flex-row gap-6 rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-mono font-bold text-base dark:bg-white dark:text-slate-900 shadow-sm">
              {step.num}
            </div>

            <div className="space-y-3 flex-1">
              <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
                {step.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {step.details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
        <h3 className="text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-2">
          Experience the transformation yourself
        </h3>
        <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
          No credit card required. Upload a sample syllabus or lecture slide deck now.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <span>Get Started Free</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
