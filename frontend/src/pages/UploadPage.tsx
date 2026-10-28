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
  ArrowRight,
  ClipboardList,
  Video,
  FileCheck2
} from 'lucide-react';
import { apiService } from '../services/api';
import type { VisualPattern, ExplanationLevel } from '../types';
import { PATTERN_LABELS, PATTERN_DESCRIPTIONS } from '../types';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Input source mode
  const [inputMode, setInputMode] = useState<'file' | 'text' | 'transcript'>('file');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [rawText, setRawText] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
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
    setRawText(textContent);
    setInputMode('text');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inputMode === 'file' && !file) {
      setError('Please select or drop a study document to upload.');
      return;
    }

    if (inputMode === 'text' && (!rawText || rawText.trim().length < 20)) {
      setError('Please enter at least 20 characters of study notes or lecture text.');
      return;
    }

    if (inputMode === 'transcript' && (!rawText || rawText.trim().length < 20)) {
      setError('Please provide video transcript text to synthesize.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Create project
      const project = await apiService.createProject({
        title: title.trim() || (inputMode === 'file' ? file!.name : 'Pasted Study Pack'),
        subject: subject || null,
        language: 'en',
        explanation_level: explanationLevel,
        detail_amount: detailAmount,
        default_pattern: defaultPattern,
      });

      // 2. Upload document or ingest text
      if (inputMode === 'file' && file) {
        await apiService.uploadDocument(project.id, file);
      } else {
        await apiService.ingestTextInput(project.id, {
          text: rawText,
          title: title.trim() || 'Lecture Notes',
          source_type: inputMode
        });
      }

      // 3. Kick off AI pipeline
      await apiService.generateLesson(project.id);

      // 4. Navigate to real-time processing monitor
      navigate(`/processing/${project.id}`);
    } catch (err: any) {
      console.error('Submission failed:', err);
      setError(
        err.response?.data?.detail || 'Failed to start lesson generation. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Editorial Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Transform Notes into Visual Understanding
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sans leading-relaxed">
          Upload PDF textbooks, lecture slides, paste raw notes, or transcripts. Note2Visual automatically deconstructs your content into 10 structured visual models and audio lessons.
        </p>
      </div>

      {/* Preset Fast-Start Buttons */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Quick Demo Presets (Instant Load)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() =>
              handlePresetSelect(
                'Cellular Respiration and Bioenergetics',
                'Biology',
                `Cellular Respiration and Bioenergetics:
Glycolysis occurs in the cytoplasm, breaking 1 glucose molecule into 2 pyruvate molecules and yielding 2 ATP net and 2 NADH.
The Citric Acid Cycle takes place in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to form citrate. It produces CO2, ATP, NADH, and FADH2.
Oxidative Phosphorylation is located on the inner mitochondrial cristae membrane. High energy electrons pass through complexes I-IV, creating a proton gradient that drives ATP Synthase to generate approximately 30-32 ATP per glucose molecule.`,
                'flowchart'
              )
            }
            className="rounded-lg border border-slate-200 p-3 text-left hover:border-blue-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-serif">
              Cellular Respiration
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              Biology • Flowchart
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handlePresetSelect(
                'Distributed Systems & Consensus',
                'Computer Science',
                `Distributed Systems and Consensus:
A distributed system consists of autonomous computing nodes communicating over a network to coordinate actions.
CAP Theorem establishes that a distributed data store can guarantee at most two of: Consistency, Availability, and Partition Tolerance.
Raft Consensus Algorithm achieves consensus via Leader Election, Log Replication, and Safety invariants.
Byzantine Fault Tolerance handles nodes that may fail arbitrarily, fail to respond, or send conflicting information.`,
                'mind_map'
              )
            }
            className="rounded-lg border border-slate-200 p-3 text-left hover:border-blue-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-serif">
              Distributed Systems
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              CS • Mind Map
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              handlePresetSelect(
                'The Industrial Revolution & Mechanization',
                'History',
                `The Industrial Revolution and Mechanization:
Phase 1 (1760-1830) began in Great Britain with the mechanization of the textile industry, steam engine efficiency by James Watt, and expansion of coal mining.
Phase 2 (1870-1914) saw electrical power grids, the Bessemer steel process, internal combustion engines, and the rise of assembly line mass production.
Socioeconomic consequences included urbanization, labor union formation, global trade acceleration, and standard of living transitions.`,
                'timeline'
              )
            }
            className="rounded-lg border border-slate-200 p-3 text-left hover:border-blue-500 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 font-serif">
              Industrial Revolution
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              History • Timeline
            </div>
          </button>
        </div>
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Source Mode Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setInputMode('file')}
            className={`inline-flex items-center gap-1.5 pb-2.5 transition-colors border-b-2 cursor-pointer ${
              inputMode === 'file'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document (PDF, DOCX, PPTX)</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('text')}
            className={`inline-flex items-center gap-1.5 pb-2.5 transition-colors border-b-2 cursor-pointer ${
              inputMode === 'text'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Paste Notes</span>
          </button>

          <button
            type="button"
            onClick={() => setInputMode('transcript')}
            className={`inline-flex items-center gap-1.5 pb-2.5 transition-colors border-b-2 cursor-pointer ${
              inputMode === 'transcript'
                ? 'border-blue-600 text-blue-700 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Video className="h-4 w-4" />
            <span>Video / Article Transcript</span>
          </button>
        </div>

        {/* Input Area */}
        {inputMode === 'file' ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all bg-white dark:bg-slate-900 ${
              dragActive
                ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40'
                : file
                ? 'border-emerald-500 bg-emerald-50/30 dark:border-emerald-700'
                : 'border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-600'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.pptx,.txt"
              onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                  file
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {file ? <CheckCircle2 className="h-7 w-7" /> : <Upload className="h-7 w-7" />}
              </div>

              {file ? (
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-serif">
                    {file.name}
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for synthesis
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="mt-2 text-xs text-rose-600 hover:underline"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Drop your PDF or study material here
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Supports PDF, DOCX, PPTX, or TXT up to 50MB
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste your lecture notes, book chapter summary, or raw text transcript here..."
              className="w-full rounded-xl border border-slate-300 bg-white p-4 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 shadow-xs leading-relaxed font-sans"
            />
            <div className="text-[11px] font-mono text-slate-400 text-right">
              {rawText.length} characters entered
            </div>
          </div>
        )}

        {/* Configuration Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Study Pack Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Molecular Biology Unit 3"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject Domain
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value="Computer Science">Computer Science & Engineering</option>
              <option value="Biology">Biology & Medicine</option>
              <option value="Physics">Physics & Mathematics</option>
              <option value="History">History & Social Sciences</option>
              <option value="Business">Business & Economics</option>
              <option value="Law">Law & Governance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Explanation Level
            </label>
            <select
              value={explanationLevel}
              onChange={(e) => setExplanationLevel(e.target.value as ExplanationLevel)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value="beginner">Beginner (Foundational, high intuition)</option>
              <option value="intermediate">Intermediate (Standard academic curriculum)</option>
              <option value="advanced">Advanced (Rigorous, formal derivations)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Default Visual Model
            </label>
            <select
              value={defaultPattern}
              onChange={(e) => setDefaultPattern(e.target.value as VisualPattern)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value="auto">Content-Aware Auto-Detect (Recommended)</option>
              {Object.entries(PATTERN_LABELS)
                .filter(([k]) => k !== 'auto')
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/library')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            <span>{isSubmitting ? 'Starting Synthesis...' : 'Synthesize Study Pack'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
