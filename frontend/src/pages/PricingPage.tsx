import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, GraduationCap, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free Academic',
      tagline: 'Ideal for individual students getting started.',
      price: '$0',
      period: 'forever',
      highlight: false,
      cta: 'Start Free',
      ctaLink: '/upload',
      features: [
        '10 visual study packs per month',
        'PDF, TXT, and Markdown upload up to 20MB',
        'Standard Mind Maps, Flowcharts & Sketchnotes',
        'Interactive Flashcards & Active Quizzes',
        'Audio Lesson Generation with Web Speech playback',
        'Standard PDF Revision Sheets export'
      ]
    },
    {
      name: 'Pro Student',
      tagline: 'For intensive exam prep and high-volume semester courses.',
      price: '$9',
      period: 'per month',
      highlight: true,
      badge: 'Most Popular',
      cta: 'Upgrade to Pro',
      ctaLink: '/register',
      features: [
        'Unlimited visual study packs',
        'Up to 100MB documents (PDF, DOCX, PPTX, Video/URL)',
        'All 10 Visual Formats (including Revision Sheets & Architecture)',
        'Full Interactive Mind Map Studio with live branch editing',
        'Vector SVG & High-Resolution PDF exports',
        'Priority AI synthesis queue',
        'Multi-lingual lesson translations (15+ languages)'
      ]
    },
    {
      name: 'Educator & Campus',
      tagline: 'For teachers, professors, and university departments.',
      price: '$29',
      period: 'per month',
      highlight: false,
      cta: 'Contact Education Team',
      ctaLink: '/register',
      features: [
        'Everything in Pro Student',
        'Shared group libraries & student classroom workspaces',
        'LMS integration & syllabus batch processing',
        'Custom institution branding on PDF exports',
        'Student performance & quiz analytics',
        'Dedicated educational support & training'
      ]
    }
  ];

  return (
    <div className="space-y-12 py-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 bg-blue-50 text-[11px] font-mono font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Simple, Transparent Plans</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Invest in High-Retention Visual Study
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Transparent student-friendly pricing. No lock-ins, zero hidden fees, and full academic discounts.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col justify-between rounded-xl border p-6 transition-all bg-white dark:bg-slate-900 shadow-xs ${
              plan.highlight
                ? 'border-blue-600 ring-2 ring-blue-600/20 dark:border-blue-500'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-2xs font-mono">
                {plan.badge}
              </div>
            )}

            <div>
              <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
                <h2 className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
                  {plan.name}
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 min-h-[32px]">
                  {plan.tagline}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-500">/{plan.period}</span>
                </div>
              </div>

              <div className="py-5 space-y-2.5">
                <div className="text-[11px] font-mono uppercase text-slate-400 dark:text-slate-500 font-semibold">
                  What's Included:
                </div>
                <ul className="space-y-2 text-xs">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <Check className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                to={plan.ctaLink}
                className={`w-full py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                  plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{plan.cta}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Security Guarantee */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 flex flex-col sm:flex-row items-center gap-4 dark:border-slate-800 dark:bg-slate-900/60">
        <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 text-center sm:text-left">
          <div className="font-semibold text-slate-900 dark:text-slate-100">
            Strict Academic Privacy & Ownership
          </div>
          <div>
            Your course documents, lecture slides, and notes remain 100% your intellectual property. We never train public AI models on private user uploads.
          </div>
        </div>
      </div>
    </div>
  );
};
