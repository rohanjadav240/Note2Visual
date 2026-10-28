import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  HelpCircle,
  Download,
  Settings,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Search,
  FileText,
  Lightbulb,
  ExternalLink,
  Award,
  Sliders,
  Check,
  RefreshCw,
  Clock
} from 'lucide-react';
import { apiService } from '../services/api';
import type {
  Lesson,
  Topic,
  Chapter,
  Concept,
  VisualPattern,
  QuizResult,
  VisualSettings
} from '../types';
import { PATTERN_LABELS } from '../types';
import { DiagramContainer } from '../components/visuals/DiagramContainer';
import { MindMapCanvas } from '../components/visuals/MindMapCanvas';
import { FlowchartCanvas } from '../components/visuals/FlowchartCanvas';
import { StoryboardView } from '../components/visuals/StoryboardView';
import { TimelineView } from '../components/visuals/TimelineView';
import { ComparisonView } from '../components/visuals/ComparisonView';
import { ConceptNetworkCanvas } from '../components/visuals/ConceptNetworkCanvas';
import { InfographicView } from '../components/visuals/InfographicView';
import { LessonCardsView } from '../components/visuals/LessonCardsView';
import { MathExplanationView } from '../components/visuals/MathExplanationView';
import { SystemArchitectureCanvas } from '../components/visuals/SystemArchitectureCanvas';
import { Modal } from '../components/ui/Modal';

export const WorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active selections
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activePattern, setActivePattern] = useState<VisualPattern>('mind_map');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeTab, setActiveTab] = useState<'notes' | 'takeaways' | 'cards' | 'questions'>('notes');
  const [topicSearch, setTopicSearch] = useState('');
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});

  // Modals
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Export state
  const [exportType, setExportType] = useState('full');
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Load lesson
  useEffect(() => {
    if (!projectId) return;
    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiService.getLesson(projectId);
        setLesson(data);
        if (data.visual_settings?.pattern && data.visual_settings.pattern !== 'auto') {
          setActivePattern(data.visual_settings.pattern);
        } else if (data.lesson_data?.recommended_pattern) {
          setActivePattern(data.lesson_data.recommended_pattern as VisualPattern);
        }
      } catch (err: any) {
        console.error('Failed to load lesson:', err);
        setError('Could not load visual lesson. Please verify the project ID.');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [projectId]);

  // Current active chapter & topic
  const currentChapter = lesson?.lesson_data?.chapters?.[activeChapterIndex];
  const currentTopic = currentChapter?.topics?.[activeTopicIndex];

  // Active diagram data for current topic
  const currentDiagramData = useMemo(() => {
    if (!lesson || !currentTopic) return undefined;
    const diagrams = lesson.lesson_data?.diagrams || {};
    return diagrams[currentTopic.id];
  }, [lesson, currentTopic]);

  // Find active concept label for header
  const activeConcept = useMemo(() => {
    if (!currentTopic || !selectedNodeId) return null;
    return currentTopic.concepts.find((c) => c.id === selectedNodeId);
  }, [currentTopic, selectedNodeId]);

  // Handle pattern change
  const handlePatternChange = async (newPattern: VisualPattern) => {
    setActivePattern(newPattern);
    if (projectId && lesson) {
      try {
        await apiService.updateVisualSettings(projectId, {
          pattern: newPattern,
          theme: lesson.visual_settings?.theme || 'clean_academic',
          color_primary: '#2563eb',
          color_accent: '#0d9488',
          dark_mode: false,
          font_size: 'medium',
          diagram_density: 'standard',
          spacing: 'comfortable',
          animation_intensity: 'moderate',
          show_source_refs: true,
        });
        // Refresh lesson to receive updated diagrams
        const updated = await apiService.getLesson(projectId);
        setLesson(updated);
      } catch (err) {
        console.error('Failed to persist pattern:', err);
      }
    }
  };

  // Toggle completion of a topic
  const handleToggleTopicComplete = async (topic: Topic) => {
    if (!projectId) return;
    const isNowCompleted = !completedTopics[topic.id];
    setCompletedTopics((prev) => ({ ...prev, [topic.id]: isNowCompleted }));

    try {
      await apiService.updateProgress(projectId, {
        topic_id: topic.id,
        topic_title: topic.title,
        time_spent_seconds: 60,
        completed: isNowCompleted,
      });
    } catch (err) {
      console.error('Error logging topic progress:', err);
    }
  };

  // Submit quiz
  const handleQuizSubmit = async () => {
    if (!projectId) return;
    try {
      setIsSubmittingQuiz(true);
      const res = await apiService.submitQuiz(projectId, quizAnswers);
      setQuizResult(res);
    } catch (err) {
      console.error('Error submitting quiz:', err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Trigger export
  const handleExportPdf = async () => {
    if (!projectId) return;
    try {
      setIsExporting(true);
      setExportMessage('Generating formatted study document...');
      const exp = await apiService.exportPdf(projectId, exportType, includeAnswers);
      setExportMessage('Export created! Downloading...');
      
      // Attempt download after short interval
      setTimeout(async () => {
        try {
          const res = await apiService.getExport(projectId, exp.id);
          setExportMessage('Export completed. Check your downloads.');
        } catch {
          setExportMessage('Document prepared. Ready in project exports.');
        } finally {
          setIsExporting(false);
        }
      }, 1500);
    } catch (err) {
      console.error('Export error:', err);
      setExportMessage('Failed to trigger export. Try again.');
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Loading Visual Learning Workspace...
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200 space-y-3">
        <h2 className="text-base font-bold">Workspace Unavailable</h2>
        <p className="text-xs">{error || 'Lesson not found.'}</p>
        <Link
          to="/upload"
          className="inline-block rounded bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
        >
          Return to Upload
        </Link>
      </div>
    );
  }

  // Collect all questions for the quiz
  const allQuestions = lesson.lesson_data.chapters.flatMap((ch) =>
    ch.topics.flatMap((t) => t.review_questions || [])
  );

  return (
    <div className="space-y-4">
      {/* Top Workspace Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase font-mono">
              {lesson.subject || 'Academic Lesson'}
            </span>
            <span className="text-xs text-slate-400">
              v{lesson.version} • {lesson.lesson_data.chapters.length} Chapters
            </span>
          </div>
          <h1 className="text-xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
            {lesson.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {allQuestions.length > 0 && (
            <button
              onClick={() => {
                setQuizResult(null);
                setIsQuizOpen(true);
              }}
              className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Award className="h-3.5 w-3.5 text-blue-600" />
              <span>Self-Check Quiz ({allQuestions.length})</span>
            </button>
          )}

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Notes</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Visual Settings"
            className="rounded border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Syllabus Hierarchy (Chapters & Topics) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Syllabus Structure
              </span>
              <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Topic Search Filter */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter topics..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="w-full rounded border border-slate-200 bg-slate-50 pl-8 pr-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Chapter Accordion */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {lesson.lesson_data.chapters.map((chapter, chIdx) => {
                const isChapterActive = activeChapterIndex === chIdx;
                const filteredTopics = chapter.topics.filter(
                  (t) =>
                    !topicSearch ||
                    t.title.toLowerCase().includes(topicSearch.toLowerCase())
                );

                if (topicSearch && filteredTopics.length === 0) return null;

                return (
                  <div key={chapter.id} className="rounded border border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => {
                        setActiveChapterIndex(chIdx);
                        setActiveTopicIndex(0);
                        setSelectedNodeId(null);
                      }}
                      className={`flex w-full items-center justify-between p-2 text-left text-xs font-semibold transition-colors ${
                        isChapterActive
                          ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="truncate">
                        {chIdx + 1}. {chapter.title}
                      </span>
                      {isChapterActive ? (
                        <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      )}
                    </button>

                    {/* Topics under active chapter */}
                    {isChapterActive && (
                      <div className="divide-y divide-slate-100 p-1 dark:divide-slate-800/50">
                        {filteredTopics.map((topic, topIdx) => {
                          const isTopicActive = activeTopicIndex === topIdx;
                          const isCompleted = !!completedTopics[topic.id];

                          return (
                            <div
                              key={topic.id}
                              onClick={() => {
                                setActiveTopicIndex(topIdx);
                                setSelectedNodeId(null);
                              }}
                              className={`flex items-center justify-between rounded p-2 text-xs cursor-pointer transition-colors ${
                                isTopicActive
                                  ? 'border border-blue-200 bg-blue-50 font-medium text-blue-900 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-200'
                                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-mono text-[10px] text-slate-400">
                                  {chIdx + 1}.{topIdx + 1}
                                </span>
                                <span className="truncate">{topic.title}</span>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleTopicComplete(topic);
                                }}
                                title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                                className="p-0.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                              >
                                <CheckCircle2
                                  className={`h-3.5 w-3.5 ${
                                    isCompleted ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950' : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center / Right: Interactive Visual Canvas + Inspector */}
        <div className="lg:col-span-9 space-y-4">
          {/* Visual Model Canvas */}
          <DiagramContainer
            title={currentTopic?.title || 'Visual Model'}
            pattern={activePattern}
            onPatternChange={handlePatternChange}
            zoomLevel={zoomLevel}
            onZoomIn={() => setZoomLevel((z) => Math.min(z + 15, 180))}
            onZoomOut={() => setZoomLevel((z) => Math.max(z - 15, 50))}
            onResetZoom={() => setZoomLevel(100)}
            activeConceptTitle={activeConcept?.title}
            onClearSelection={() => setSelectedNodeId(null)}
          >
            {activePattern === 'mind_map' && (
              <MindMapCanvas
                data={currentDiagramData}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
                zoomLevel={zoomLevel}
              />
            )}
            {activePattern === 'flowchart' && (
              <FlowchartCanvas
                data={currentDiagramData}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
                zoomLevel={zoomLevel}
              />
            )}
            {activePattern === 'storyboard' && (
              <StoryboardView
                data={currentDiagramData}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
              />
            )}
            {activePattern === 'timeline' && (
              <TimelineView
                data={currentDiagramData}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
              />
            )}
            {activePattern === 'comparison' && (
              <ComparisonView
                data={currentDiagramData}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
              />
            )}
            {activePattern === 'concept_network' && (
              <ConceptNetworkCanvas
                data={currentDiagramData}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
                zoomLevel={zoomLevel}
              />
            )}
            {activePattern === 'infographic' && (
              <InfographicView
                data={currentDiagramData}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
              />
            )}
            {activePattern === 'lesson_cards' && (
              <LessonCardsView
                data={currentDiagramData}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
              />
            )}
            {activePattern === 'math_explanation' && (
              <MathExplanationView
                data={currentDiagramData}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
              />
            )}
            {activePattern === 'system_architecture' && (
              <SystemArchitectureCanvas
                data={currentDiagramData}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
                zoomLevel={zoomLevel}
              />
            )}
          </DiagramContainer>

          {/* Bottom Tabs: Notes, Key Takeaways, Concept Flashcards, Questions */}
          <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-medium">
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Comprehensive Notes ({currentTopic?.concepts?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('takeaways')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'takeaways'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Key Takeaways ({currentTopic?.key_takeaways?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('cards')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'cards'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Flashcards ({currentTopic?.concepts?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('questions')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'questions'
                    ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                Review Questions ({currentTopic?.review_questions?.length || 0})
              </button>
            </div>

            {/* Tab 1: Detailed Notes */}
            {activeTab === 'notes' && (
              <div className="mt-4 space-y-4">
                {currentTopic?.overview && (
                  <div className="rounded bg-slate-50 p-3 text-xs italic text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                    {currentTopic.overview}
                  </div>
                )}

                <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {currentTopic?.concepts?.map((concept) => {
                    const isFocused = selectedNodeId === concept.id;
                    return (
                      <div
                        key={concept.id}
                        id={`concept-${concept.id}`}
                        onClick={() => setSelectedNodeId(concept.id)}
                        className={`pt-3 cursor-pointer rounded p-3 transition-colors ${
                          isFocused
                            ? 'bg-blue-50/70 border border-blue-200 dark:bg-blue-950/40 dark:border-blue-900'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {concept.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {concept.source_page && (
                              <span className="text-[10px] font-mono text-slate-400">
                                Page {concept.source_page}
                              </span>
                            )}
                            <span
                              className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase ${
                                concept.importance === 'high'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {concept.importance}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {concept.detailed_explanation || concept.short_explanation}
                        </p>

                        {concept.examples && concept.examples.length > 0 && (
                          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              Illustrative Examples:
                            </span>
                            <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-[11px]">
                              {concept.examples.map((ex, idx) => (
                                <li key={idx}>{ex}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Key Takeaways */}
            {activeTab === 'takeaways' && (
              <div className="mt-4 space-y-2">
                {currentTopic?.key_takeaways?.length ? (
                  <ul className="space-y-2">
                    {currentTopic.key_takeaways.map((takeaway, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 rounded-md border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300"
                      >
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                        <span className="leading-relaxed">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-slate-400 py-4 text-center">
                    No takeaways listed for this topic.
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Concept Flashcards */}
            {activeTab === 'cards' && (
              <div className="mt-4">
                <LessonCardsView
                  data={currentDiagramData}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(id) => setSelectedNodeId(id)}
                />
              </div>
            )}

            {/* Tab 4: Review Questions */}
            {activeTab === 'questions' && (
              <div className="mt-4 space-y-4">
                {currentTopic?.review_questions?.length ? (
                  currentTopic.review_questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2">
                        {idx + 1}. {q.question}
                      </div>

                      <div className="space-y-1.5 pl-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`rounded px-2.5 py-1 text-xs text-slate-700 dark:text-slate-300 border ${
                              optIdx === q.correct_answer
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'border-transparent'
                            }`}
                          >
                            <span className="font-mono mr-1.5 font-bold">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            {opt}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400 italic">
                          Rationale: {q.explanation}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-4 text-center">
                    No review questions generated for this section.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QUIZ MODAL */}
      <Modal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        title="Active Recall Self-Assessment"
        maxWidth="2xl"
      >
        <div className="space-y-6">
          {quizResult ? (
            /* Results Screen */
            <div className="space-y-5 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-slate-100">
                  Quiz Completed!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Score: <span className="font-bold text-slate-900 dark:text-slate-100">{quizResult.score}%</span> • ({quizResult.correct_answers} of {quizResult.total_questions} correct)
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-left divide-y divide-slate-100 dark:divide-slate-800">
                {quizResult.results.map((res, i) => (
                  <div key={res.question_id} className="pt-3 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      {res.is_correct ? (
                        <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5 text-[10px] font-medium dark:bg-emerald-950 dark:text-emerald-300">
                          Correct
                        </span>
                      ) : (
                        <span className="rounded bg-red-100 text-red-800 px-1.5 py-0.5 text-[10px] font-medium dark:bg-red-950 dark:text-red-300">
                          Incorrect
                        </span>
                      )}
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        Question {i + 1}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {res.explanation}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setQuizAnswers({});
                  setQuizResult(null);
                }}
                className="rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Retake Assessment
              </button>
            </div>
          ) : (
            /* Questions Flow */
            <div className="space-y-6">
              {allQuestions.map((q, idx) => (
                <div key={q.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    {idx + 1}. {q.question}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = quizAnswers[q.id] === optIdx;
                      return (
                        <label
                          key={optIdx}
                          onClick={() =>
                            setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                          }
                          className={`flex items-center gap-2.5 rounded-md border p-2.5 text-xs cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50 text-blue-900 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-100'
                              : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz_${q.id}`}
                            checked={isSelected}
                            onChange={() => {}}
                            className="text-blue-600"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsQuizOpen(false)}
                  className="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleQuizSubmit}
                  disabled={isSubmittingQuiz || Object.keys(quizAnswers).length === 0}
                  className="rounded bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmittingQuiz ? 'Submitting...' : 'Submit Answers'}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* EXPORT MODAL */}
      <Modal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Formatted Lesson PDF / Notes"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Generate an editorial academic study guide suitable for printing, reading, or offline review.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Document Format
              </label>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="full">Complete Lesson (Theory + Key Takeaways + Review)</option>
                <option value="summary">Concise Summary Brief (Objectives & Takeaways only)</option>
                <option value="diagrams">Diagram Structure & Outlines</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Include Review Question Answer Key & Explanations</span>
            </label>
          </div>

          {exportMessage && (
            <div className="rounded bg-blue-50 p-2.5 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {exportMessage}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsExportOpen(false)}
              className="rounded border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
            >
              Close
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="rounded bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isExporting ? 'Generating...' : 'Export Document'}
            </button>
          </div>
        </div>
      </Modal>

      {/* VISUAL SETTINGS MODAL */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Visual Representation Settings"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Active Visual Pattern
            </label>
            <select
              value={activePattern}
              onChange={(e) => handlePatternChange(e.target.value as VisualPattern)}
              className="w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {Object.entries(PATTERN_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Color Archetype
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded border border-blue-500 bg-blue-50 dark:bg-blue-950">
                <span className="h-3 w-3 rounded-full bg-blue-600"></span>
                <span>Academic Blue & Teal</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="h-3 w-3 rounded-full bg-slate-800 dark:bg-slate-200"></span>
                <span>Monochrome Slate</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
            Solid, high-contrast palette with zero artificial gradients for maximum reading comfort.
          </div>
        </div>
      </Modal>
    </div>
  );
};
