import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';

export const FaqPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What types of documents can I upload to Note2Visual?',
      a: 'Note2Visual supports PDF documents (textbooks, lecture slides, papers), Microsoft Word (.docx), Microsoft PowerPoint (.pptx), plain text notes (.txt, .md), and public video URLs. Scanned PDFs are automatically processed via optical character recognition (OCR).'
    },
    {
      q: 'How does Note2Visual choose which diagram layout to generate?',
      a: 'Our pedagogical classifier analyzes the structural nature of your text. For instance, chronological events are mapped to Timelines, algorithmic or causal steps to Flowcharts, conceptual hierarchies to Mind Maps, and comparative entities to Side-by-Side Comparison Tables. You can also manually switch to any of the 10 available layouts anytime.'
    },
    {
      q: 'Can I edit the generated Mind Maps and diagrams?',
      a: 'Yes. Note2Visual includes an interactive Mind Map Studio. You can zoom, pan, click any node to rename it, add new child concepts, delete irrelevant branches, and export the resulting diagram as a vector SVG file.'
    },
    {
      q: 'How do the AI Audio Lessons work?',
      a: 'The engine synthesizes a structured academic lecture briefing with timestamped chapters and speaker notes. Audio playback is powered by your browser\'s native Web Speech synthesis, ensuring zero latency, completely offline playback capability, and customizable reading speeds from 0.75x to 2.0x.'
    },
    {
      q: 'Are my uploaded study materials and notes kept private?',
      a: 'Absolutely. We adhere to rigorous data privacy principles. Your files and notes are stored strictly for your personal learning workspace. We do not sell your data or train external foundation models on your educational uploads.'
    },
    {
      q: 'Can I export my study packs for offline use or printing?',
      a: 'Yes! You can download full formatted PDF revision packages containing the synthesized visual lesson, key formula summaries, and active recall practice questions.'
    }
  ];

  return (
    <div className="space-y-10 py-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-[11px] font-mono font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Frequently Asked Questions</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Everything You Need to Know
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Common questions about document processing, visual models, audio briefings, and exports.
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 shadow-2xs overflow-hidden"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
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

      {/* Still have questions */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
        <h3 className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100">
          Still have questions?
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Try transforming your notes right now. It takes less than 30 seconds to generate your first study pack.
        </p>
        <div className="pt-2">
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs"
          >
            <span>Create Study Pack</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
