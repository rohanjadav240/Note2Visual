import React, { useState } from 'react';
import {
  FileText,
  Search,
  Copy,
  Check,
  BookOpen,
  Hash,
  ExternalLink
} from 'lucide-react';
import type { Lesson, Chapter } from '../../types';

interface SourceDocumentViewerProps {
  lesson: Lesson;
}

export const SourceDocumentViewer: React.FC<SourceDocumentViewerProps> = ({ lesson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  // Extract all text and concepts from chapters
  const allSections = lesson.lesson_data?.chapters?.flatMap((ch, chIdx) =>
    ch.topics.map((t, tIdx) => ({
      chapterNumber: chIdx + 1,
      chapterTitle: ch.title,
      topicNumber: tIdx + 1,
      topicTitle: t.title,
      overview: t.overview || '',
      concepts: t.concepts || [],
      takeaways: t.key_takeaways || [],
      sourcePages: t.source_pages || []
    }))
  ) || [];

  const filteredSections = allSections.filter((sec) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      sec.topicTitle.toLowerCase().includes(term) ||
      sec.overview.toLowerCase().includes(term) ||
      sec.concepts.some(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.short_explanation.toLowerCase().includes(term)
      )
    );
  });

  const fullText = allSections
    .map(
      (s) =>
        `### ${s.chapterNumber}.${s.topicNumber} ${s.topicTitle}\n${s.overview}\n\n` +
        s.concepts.map((c) => `* **${c.title}**: ${c.short_explanation}`).join('\n')
    )
    .join('\n\n---\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-4xl mx-auto space-y-5 p-4 sm:p-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">
            <FileText className="h-4 w-4" />
            <span>Extracted Source Material</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
            {lesson.title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono text-slate-500 block">
              {wordCount.toLocaleString()} Words • {allSections.length} Structured Topics
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="btn-secondary"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy All Text'}</span>
          </button>
        </div>
      </div>

      {/* Search Input Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search extracted keywords, formulas, and citations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 shadow-2xs"
        />
      </div>

      {/* Document Sections List */}
      <div className="space-y-4">
        {filteredSections.map((sec, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">
                  {sec.chapterNumber}.{sec.topicNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                  {sec.topicTitle}
                </h3>
              </div>

              {sec.sourcePages && sec.sourcePages.length > 0 && (
                <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400 font-semibold">
                  Source: Page {sec.sourcePages.join(', ')}
                </span>
              )}
            </div>

            {sec.overview && (
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                {sec.overview}
              </p>
            )}

            <div className="space-y-2 pt-1">
              {sec.concepts.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {c.title}
                    </span>
                    {c.source_page && (
                      <span className="font-mono text-[9px] text-slate-400">
                        p. {c.source_page}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {c.detailed_explanation || c.short_explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredSections.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400">
            No matching terms found for "{searchTerm}".
          </div>
        )}
      </div>
    </div>
  );
};
