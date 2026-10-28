import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Check,
  HelpCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { apiService } from '../../services/api';
import type { QuizResult } from '../../types';

interface QuestionItem {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  topic_title?: string;
}

interface QuizInteractiveProps {
  projectId: string;
  questions: QuestionItem[];
}

export const QuizInteractive: React.FC<QuizInteractiveProps> = ({ projectId, questions }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reviewOnlyIncorrect, setReviewOnlyIncorrect] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center text-xs text-slate-400">
        <HelpCircle className="h-8 w-8 mb-2 stroke-1" />
        <span>No test questions generated for this study pack yet.</span>
      </div>
    );
  }

  const selectOption = (qId: string, optionIndex: number) => {
    if (quizResult) return; // locked after submission
    setAnswers((prev) => ({ ...prev, [qId]: optionIndex }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await apiService.submitQuiz(projectId, answers);
      setQuizResult(res);
    } catch (err) {
      console.error('Quiz submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setQuizResult(null);
    setReviewOnlyIncorrect(false);
  };

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 sm:p-6">
      {/* Quiz Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-1">
            <Award className="h-4 w-4" />
            <span>Active Recall Self-Assessment</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
            Practice Test ({questions.length} Questions)
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {!quizResult ? (
            <span className="font-mono text-xs text-slate-500">
              {answeredCount}/{questions.length} Answered
            </span>
          ) : (
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Test</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Summary Box if Submitted */}
      {quizResult && (
        <div className="rounded-xl border-2 border-blue-600 bg-blue-50/60 p-6 text-center dark:border-blue-500 dark:bg-blue-950/40 space-y-3 shadow-xs">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
            <Award className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-slate-100">
            Score: {Math.round(quizResult.score)}%
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            You got <span className="font-bold text-slate-900 dark:text-slate-100">{quizResult.correct_answers}</span> out of{' '}
            <span className="font-bold text-slate-900 dark:text-slate-100">{quizResult.total_questions}</span> correct.
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setReviewOnlyIncorrect(!reviewOnlyIncorrect)}
              className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {reviewOnlyIncorrect ? 'Show All Questions' : 'Filter Incorrect Only'}
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-5">
        {questions.map((q, qIndex) => {
          const selectedOption = answers[q.id];
          const resultEntry = quizResult?.results.find((r) => r.question_id === q.id);
          const isCorrect = resultEntry?.is_correct;
          const hasResult = !!quizResult;

          if (reviewOnlyIncorrect && isCorrect) return null;

          return (
            <div
              key={q.id}
              className={`rounded-xl border p-5 sm:p-6 transition-all text-left shadow-xs ${
                hasResult
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20 dark:border-emerald-900'
                    : 'border-rose-300 bg-rose-50/20 dark:border-rose-900'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                  Question 0{qIndex + 1}
                </span>

                {hasResult && (
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    <span>{isCorrect ? 'Correct' : 'Incorrect'}</span>
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-slate-100 mb-4 leading-snug">
                {q.question}
              </h3>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedOption === optIndex;
                  const isTheCorrectOption = q.correct_answer === optIndex;

                  let optionStyle = 'border-slate-200 hover:border-slate-400 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200';

                  if (hasResult) {
                    if (isTheCorrectOption) {
                      optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:border-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-100 font-semibold';
                    } else if (isSelected && !isTheCorrectOption) {
                      optionStyle = 'border-rose-400 bg-rose-50 text-rose-950 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-100';
                    } else {
                      optionStyle = 'border-slate-200 opacity-60 dark:border-slate-800';
                    }
                  } else if (isSelected) {
                    optionStyle = 'border-blue-600 bg-blue-50 text-blue-950 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100 font-semibold ring-2 ring-blue-200 dark:ring-blue-900';
                  }

                  return (
                    <div
                      key={optIndex}
                      onClick={() => selectOption(q.id, optIndex)}
                      className={`flex items-center gap-3 rounded-lg border p-3 text-xs cursor-pointer transition-all ${optionStyle}`}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[10px] font-mono font-bold">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation note when result is shown */}
              {hasResult && q.explanation && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-mono font-bold text-[10px] uppercase text-slate-800 dark:text-slate-200 mr-1.5">
                    Verified Rationale:
                  </span>
                  <span className="leading-relaxed">{q.explanation}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!quizResult && (
        <div className="pt-2 text-center">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="btn-primary py-2.5 px-6 text-sm"
          >
            <span>{submitting ? 'Evaluating Responses...' : `Submit Test (${answeredCount}/${questions.length})`}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};
