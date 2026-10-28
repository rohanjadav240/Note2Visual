import React from 'react';
import { FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-semibold uppercase mb-2">
          <FileText className="h-4 w-4" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Terms of Service
        </h1>
        <p className="mt-1 text-slate-500">Effective Date: October 2026</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100">
          1. Acceptance of Terms
        </h2>
        <p className="leading-relaxed">
          By accessing or using Note2Visual, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not access or use the application.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100">
          2. Permitted Academic & Educational Use
        </h2>
        <p className="leading-relaxed">
          Note2Visual is designed as an educational assistant and visual study aid for students, educators, and lifelong learners. You agree to use the service only for lawful personal, academic, or professional study purposes.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100">
          3. User Intellectual Property
        </h2>
        <p className="leading-relaxed">
          You retain full intellectual property rights to all original notes, syllabi, and documents that you submit to the platform. By using Note2Visual, you grant us only the limited temporary license necessary to process, analyze, and render your visual learning materials.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100">
          4. Disclaimer of Academic Warranties
        </h2>
        <p className="leading-relaxed">
          Note2Visual provides AI-generated visual models and synthesis as supplementary educational aids. While our system preserves exact page and paragraph citations for verification, users are encouraged to cross-reference primary academic sources before examinations or professional applications.
        </p>
      </section>
    </div>
  );
};
