import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';
import type { VisualPattern, ExplanationLevel } from '../types';
import { PATTERN_LABELS } from '../types';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form options
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Computer Science');
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('intermediate');
  const [detailAmount, setDetailAmount] = useState('standard');
  const [defaultPattern, setDefaultPattern] = useState<VisualPattern>('auto');

  const supportedExtensions = ['.pdf', '.docx', '.pptx', '.txt'];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!supportedExtensions.includes(ext)) {
      setError(`Unsupported file format. Please upload ${supportedExtensions.join(', ')}.`);
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit.');
      return;
    }
    setError(null);
    setFile(selectedFile);
    if (!title) {
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(baseName);
    }
  };

  const handlePresetSelect = (presetTitle: string, presetSubject: string, textContent: string, pattern: VisualPattern) => {
    setTitle(presetTitle);
    setSubject(presetSubject);
    setDefaultPattern(pattern);
    const blob = new Blob([textContent], { type: 'text/plain' });
    const dummyFile = new File([blob], `${presetTitle.replace(/\s+/g, '_')}.txt`, {
      type: 'text/plain'
    });
    setFile(dummyFile);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a study document to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Create project
      const project = await apiService.createProject({
        title: title.trim() || file.name,
        subject: subject || null,
        language: 'en',
        explanation_level: explanationLevel,
        detail_amount: detailAmount,
        default_pattern: defaultPattern,
      });

      // 2. Upload file
      await apiService.uploadDocument(project.id, file);

      // 3. Trigger generation pipeline
      await apiService.generateLesson(project.id);

      // 4. Redirect to status tracker
      navigate(`/processing/${project.id}`);
    } catch (err: any) {
      console.error('Upload processing error:', err);
      setError(
        err.response?.data?.detail || 'Failed to process document. Please check backend connection.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Transform Notes into Visual Lessons
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Upload textbook excerpts, lecture slides, papers or syllabus notes. The engine synthesizes concepts, generates diagrams, and creates active recall questions.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Preset Quick Loader */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>Instant Pre-Loaded Academic Textbooks</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() =>
              handlePresetSelect(
                'Cellular Respiration and Bioenergetics',
                'Biology & Medicine',
                `Cellular Respiration and ATP Production:
Glycolysis occurs in the cytoplasm, breaking 1 glucose molecule into 2 pyruvate molecules and yielding 2 ATP net and 2 NADH.
The Krebs Cycle (Citric Acid Cycle) takes place in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to form citrate. It produces CO2, ATP, NADH, and FADH2.
Oxidative Phosphorylation is located on the inner mitochondrial cristae membrane. High energy electrons pass through complexes I-IV, creating a proton gradient that drives ATP Synthase to generate approximately 30-32 ATP per glucose molecule.`,
                'flowchart'
              )
            }
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs transition-colors"
          >
            Biology: Cellular Respiration
          </button>

          <button
            type="button"
            onClick={() =>
              handlePresetSelect(
                'Operating Systems: Virtual Memory & Paging',
                'Computer Science',
                `Virtual Memory Architecture:
Virtual memory provides an illusion of a large contiguous memory space per process.
Paging divides virtual memory into fixed-size pages and physical memory into frames.
Page Table Maps virtual page numbers (VPN) to physical frame numbers (PFN).
Translation Lookaside Buffer (TLB) acts as a high-speed hardware cache for page table translations.
Page Fault occurs when a referenced virtual page is not currently resident in physical RAM, requiring the OS kernel to page it in from disk backing store.`,
                'system_architecture'
              )
            }
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs transition-colors"
          >
            CS: Virtual Memory & Paging
          </button>

          <button
            type="button"
            onClick={() =>
              handlePresetSelect(
                'Macroeconomics: Monetary Policy & Inflation',
                'Economics & Business',
                `Monetary Policy and Inflation Control:
Central banks manage liquidity and interest rates to achieve price stability and maximum sustainable employment.
The Federal Funds Rate influences borrowing costs throughout the commercial banking system.
Open Market Operations involve buying or selling government securities to regulate bank reserve balances.
Quantitative Easing expands the central bank balance sheet by purchasing long-term financial assets when policy rates are near the zero lower bound.`,
                'mind_map'
              )
            }
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs transition-colors"
          >
            Economics: Monetary Policy
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
              : file
              ? 'border-emerald-500 bg-emerald-50/40 dark:border-emerald-800 dark:bg-emerald-950/20'
              : 'border-slate-300 bg-white hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 shadow-xs'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.pptx,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
            className="hidden"
          />

          {file ? (
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-3 shadow-2xs">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                {file.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                {(file.size / 1024).toFixed(1)} KB • Click or drop another file to replace
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 mb-3 shadow-2xs">
                <Upload className="h-6 w-6" />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                Choose study file or drag & drop here
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports PDF, DOCX, PPTX, or TXT (up to 50MB)
              </div>
            </div>
          )}
        </div>

        {/* Lesson Parameters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 pb-3 dark:border-slate-800">
            Pedagogical Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Lesson Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Molecular Genetics & Transcription"
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Subject Domain
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Biology & Medicine">Biology & Medicine</option>
                <option value="Physics & Engineering">Physics & Engineering</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Economics & Business">Economics & Business</option>
                <option value="History & Social Sciences">History & Social Sciences</option>
                <option value="Philosophy & Logic">Philosophy & Logic</option>
                <option value="General Academic">General Academic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Target Understanding Level
              </label>
              <select
                value={explanationLevel}
                onChange={(e) => setExplanationLevel(e.target.value as ExplanationLevel)}
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="beginner">Introductory / High School</option>
                <option value="intermediate">Standard Undergraduate</option>
                <option value="advanced">Rigorous Graduate / Specialized</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Default Visual Layout
              </label>
              <select
                value={defaultPattern}
                onChange={(e) => setDefaultPattern(e.target.value as VisualPattern)}
                className="w-full rounded-md border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="auto">Auto-detect best layout</option>
                {Object.entries(PATTERN_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!file || isSubmitting}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-700 py-3.5 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
        >
          {isSubmitting ? (
            <span>Starting Synthesizer...</span>
          ) : (
            <>
              <span>Generate Visual Lesson</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
