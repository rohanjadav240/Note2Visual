import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-mono text-[11px] font-semibold uppercase mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Security & Data Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Privacy Policy
        </h1>
        <p className="mt-1 text-slate-500">Last updated: October 2026</p>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100">
          1. Student Data Protection Principle
        </h2>
        <p className="leading-relaxed">
          Note2Visual is dedicated to safeguarding academic confidentiality and personal privacy. We collect only the information necessary to provide, optimize, and maintain our educational visual synthesis services.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100">
          2. Educational Documents and Text Ingestion
        </h2>
        <p className="leading-relaxed">
          When you upload lecture PDFs, syllabi, lecture notes, or transcripts, these files are processed strictly to parse concepts, generate interactive mind maps, create flashcard decks, and construct audio scripts. <strong>We do not use your proprietary course documents or private student notes to train public generative models.</strong>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100">
          3. Information Storage and Retention
        </h2>
        <p className="leading-relaxed">
          Your project files and generated visual representations are stored securely within your account. You retain absolute ownership over all uploaded documents and generated materials. You may permanently delete your projects or entire account at any time through the platform interface.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100">
          4. Security Infrastructure
        </h2>
        <p className="leading-relaxed">
          All data transmitted between your browser and our backend infrastructure is encrypted in transit using industry-standard TLS (HTTPS) protocols. Access tokens and authentication credentials utilize PBKDF2-HMAC-SHA256 password hashing.
        </p>
      </section>
    </div>
  );
};
