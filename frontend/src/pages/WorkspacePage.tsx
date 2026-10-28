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
  Award,
  Sliders,
  Check,
  RefreshCw,
  Clock,
  Headphones,
  GitBranch,
  CreditCard,
  FileCheck2,
  PenTool,
  Printer,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { apiService } from '../services/api';
import type {
  Lesson,
  Topic,
  Chapter,
  Concept,
  VisualPattern,
  QuizResult,
  VisualSettings,
  DiagramNode
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
import { SketchnotesView } from '../components/visuals/SketchnotesView';
import { RevisionSheetView } from '../components/visuals/RevisionSheetView';
import { LessonCardsView } from '../components/visuals/LessonCardsView';
import { MathExplanationView } from '../components/visuals/MathExplanationView';
import { SystemArchitectureCanvas } from '../components/visuals/SystemArchitectureCanvas';
import { MindMapEditor } from '../components/visuals/MindMapEditor';
import { AudioLessonPlayer } from '../components/study/AudioLessonPlayer';
import { SourceDocumentViewer } from '../components/study/SourceDocumentViewer';
import { FlashcardsDeck } from '../components/study/FlashcardsDeck';
import { QuizInteractive } from '../components/study/QuizInteractive';
import { Modal } from '../components/ui/Modal';

type StudyPackTab =
  | 'overview'
  | 'visuals'
  | 'mindmap'
  | 'flashcards'
  | 'quizzes'
  | 'audio'
  | 'source';

export const WorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active workspace study tab
  const [activeStudyTab, setActiveStudyTab] = useState<StudyPackTab>('visuals');

  // Active selections
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activePattern, setActivePattern] = useState<VisualPattern>('mind_map');
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeNotesTab, setActiveNotesTab] = useState<'notes' | 'takeaways'>('notes');
  const [topicSearch, setTopicSearch] = useState('');
  const [completedTopics, setCompletedTopics] = useState<Record<string, boolean>>({});

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  // All concepts in the active topic or active chapter
  const currentConcepts = currentTopic?.concepts || [];

  // All questions collected across the lesson
  const allQuestions = useMemo(() => {
    if (!lesson) return [];
    return lesson.lesson_data.chapters.flatMap((ch) =>
      ch.topics.flatMap((t) =>
        (t.review_questions || []).map((q) => ({
          ...q,
          topic_title: t.title
        }))
      )
    );
  }, [lesson]);

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

  // Mind map editor save handler
  const handleSaveMindMap = async (updatedNodes: DiagramNode[]) => {
    if (!projectId || !currentTopic) return;
    try {
      await apiService.updateMindMap(projectId, {
        topic_id: currentTopic.id,
        nodes: updatedNodes,
        edges: []
      });
    } catch (err) {
      console.error('Failed to update mind map:', err);
    }
  };

  // Trigger export
  const handleExportPdf = async () => {
    if (!projectId) return;
    try {
      setIsExporting(true);
      setExportMessage('Generating formatted study document...');
      const exp = await apiService.exportPdf(projectId, exportType, includeAnswers);
      setExportMessage('Export prepared! Downloading file...');
      setTimeout(() => {
        setIsExporting(false);
        setExportMessage('Study notes downloaded successfully.');
      }, 1200);
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
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Loading Visual Study Pack...
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-200 space-y-3 my-8">
        <h2 className="text-base font-bold">Study Pack Unavailable</h2>
        <p className="text-xs">{error || 'Lesson not found.'}</p>
        <Link to="/upload" className="btn-primary">
          Return to Upload
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Study Pack Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300 uppercase font-mono">
              {lesson.subject || 'Academic Lesson'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              v{lesson.version} • {lesson.lesson_data.chapters.length} Chapters • {allQuestions.length} Practice Items
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-slate-100 mt-1">
            {lesson.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportOpen(true)}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Notes</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Visual Settings"
            className="rounded-md border border-slate-300 bg-white p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-2xs"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 7 Study Pack Primary Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveStudyTab('overview')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold transition-all cursor-pointer ${
            activeStudyTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/50 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-400'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveStudyTab('visuals')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold transition-all cursor-pointer ${
            activeStudyTab === 'visuals'
              ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/50 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-400'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Visual Notes</span>
        </button>

        <button
          onClick={() => setActiveStudyTab('mindmap')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold transition-all cursor-pointer ${
            activeStudyTab === 'mindmap'
              ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/50 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-400'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <GitBranch className="h-4 w-4" />
          <span>Mind Map Editor</span>
        </button>

        <button
          onClick={() => setActiveStudyTab('flashcards')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold transition-all cursor-pointer ${
            activeStudyTab === 'flashcards'
              ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/50 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-400'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Flashcards</span>
        </button>

        <button
          onClick={() => setActiveStudyTab('quizzes')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold transition-all cursor-pointer ${
            activeStudyTab === 'quizzes'
              ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/50 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-400'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Practice Quizzes</span>
        </button>

        <button
          onClick={() => setActiveStudyTab('audio')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold transition-all cursor-pointer ${
            activeStudyTab === 'audio'
              ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/50 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-400'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <Headphones className="h-4 w-4" />
          <span>Audio Lesson</span>
        </button>

        <button
          onClick={() => setActiveStudyTab('source')}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-t-lg font-semibold transition-all cursor-pointer ${
            activeStudyTab === 'source'
              ? 'border-b-2 border-blue-600 text-blue-700 bg-blue-50/50 dark:text-blue-300 dark:bg-blue-950/40 dark:border-blue-400'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Source Document</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeStudyTab === 'overview' && (
        <div className="max-w-5xl mx-auto space-y-6 py-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              <BookOpen className="h-4 w-4" />
              <span>Executive Synthesis & Curriculum</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
              {lesson.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              {lesson.lesson_data.summary || 'Comprehensive educational visual summary synthesized from your uploaded notes.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Chapters</span>
                <span className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
                  {lesson.lesson_data.chapters.length}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Concepts</span>
                <span className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
                  {lesson.lesson_data.chapters.reduce((sum, ch) => sum + ch.topics.reduce((s, t) => s + t.concepts.length, 0), 0)}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Quiz Questions</span>
                <span className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
                  {allQuestions.length}
                </span>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/60">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Est. Study Time</span>
                <span className="text-lg font-bold font-serif text-slate-900 dark:text-slate-100">
                  ~25 min
                </span>
              </div>
            </div>
          </div>

          {/* Chapter Outline Cards */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
              Syllabus Chapters ({lesson.lesson_data.chapters.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.lesson_data.chapters.map((ch, idx) => (
                <div
                  key={ch.id}
                  onClick={() => {
                    setActiveChapterIndex(idx);
                    setActiveTopicIndex(0);
                    setActiveStudyTab('visuals');
                  }}
                  className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 cursor-pointer hover:border-blue-500 hover:shadow-xs transition-all space-y-2 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
                      Chapter 0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {ch.topics.length} Topics
                    </span>
                  </div>
                  <h4 className="text-sm font-bold font-serif text-slate-900 dark:text-slate-100">
                    {ch.title}
                  </h4>
                  {ch.overview && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {ch.overview}
                    </p>
                  )}
                  <div className="pt-2 flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    <span>Open Visual Notes</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL NOTES */}
      {activeStudyTab === 'visuals' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Syllabus Tree */}
          <div className="lg:col-span-3 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Topics Outline
                </span>
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Topic Search */}
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

              {/* Chapters & Topics Accordion */}
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

          {/* Right Column: Visual Canvas + Notes */}
          <div className="lg:col-span-9 space-y-4">
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
              {activePattern === 'sketchnotes' && (
                <SketchnotesView
                  data={currentDiagramData}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(id) => setSelectedNodeId(id)}
                />
              )}
              {activePattern === 'revision_sheet' && (
                <RevisionSheetView
                  data={currentDiagramData}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={(id) => setSelectedNodeId(id)}
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

            {/* Bottom Notes & Takeaways */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-medium">
                <button
                  onClick={() => setActiveNotesTab('notes')}
                  className={`pb-2.5 transition-colors border-b-2 ${
                    activeNotesTab === 'notes'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  Comprehensive Notes ({currentTopic?.concepts?.length || 0})
                </button>

                <button
                  onClick={() => setActiveNotesTab('takeaways')}
                  className={`pb-2.5 transition-colors border-b-2 ${
                    activeNotesTab === 'takeaways'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  Key Takeaways ({currentTopic?.key_takeaways?.length || 0})
                </button>
              </div>

              {activeNotesTab === 'notes' && (
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

                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                            {concept.detailed_explanation || concept.short_explanation}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeNotesTab === 'takeaways' && (
                <div className="mt-4 space-y-2">
                  {currentTopic?.key_takeaways?.map((takeaway, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-md border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300"
                    >
                      <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      <span className="leading-relaxed">{takeaway}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MIND MAP EDITOR */}
      {activeStudyTab === 'mindmap' && (
        <div className="h-[640px] w-full">
          <MindMapEditor
            data={currentDiagramData}
            topicId={currentTopic?.id || 'default_topic'}
            topicTitle={currentTopic?.title || lesson.title}
            onSave={handleSaveMindMap}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(id)}
          />
        </div>
      )}

      {/* TAB 4: FLASHCARDS */}
      {activeStudyTab === 'flashcards' && (
        <FlashcardsDeck
          concepts={currentConcepts.length > 0 ? currentConcepts : (lesson.lesson_data.chapters[0]?.topics[0]?.concepts || [])}
          topicTitle={currentTopic?.title}
        />
      )}

      {/* TAB 5: PRACTICE QUIZZES */}
      {activeStudyTab === 'quizzes' && (
        <QuizInteractive
          projectId={projectId || ''}
          questions={allQuestions}
        />
      )}

      {/* TAB 6: AUDIO LESSONS */}
      {activeStudyTab === 'audio' && (
        <AudioLessonPlayer
          projectId={projectId || ''}
          projectTitle={lesson.title}
        />
      )}

      {/* TAB 7: SOURCE DOCUMENT */}
      {activeStudyTab === 'source' && (
        <SourceDocumentViewer lesson={lesson} />
      )}

      {/* EXPORT MODAL */}
      <Modal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Study Pack"
        maxWidth="lg"
      >
        <div className="space-y-5">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Export a publication-grade study document with structured notes, diagrams, and active recall practice sheets.
          </p>

          <div className="space-y-3">
            <label className="text-xs font-semibold block text-slate-700 dark:text-slate-300">
              Format Package
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setExportType('full')}
                className={`cursor-pointer rounded-lg border p-3.5 text-xs transition-all ${
                  exportType === 'full'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100 ring-2 ring-blue-200'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="font-bold mb-1">Full Study Guide (A4)</div>
                <div className="text-[11px] opacity-80">Includes overview, detailed concepts, and quiz answers.</div>
              </div>

              <div
                onClick={() => setExportType('flashcards')}
                className={`cursor-pointer rounded-lg border p-3.5 text-xs transition-all ${
                  exportType === 'flashcards'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-100 ring-2 ring-blue-200'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="font-bold mb-1">Printable Flashcards</div>
                <div className="text-[11px] opacity-80">Cut-out study cards with prompts on front, answers on back.</div>
              </div>
            </div>
          </div>

          {exportMessage && (
            <div className="rounded-md bg-blue-50 border border-blue-200 p-2.5 text-xs text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {exportMessage}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsExportOpen(false)}
              className="btn-secondary"
            >
              Close
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="btn-primary"
            >
              <Printer className="h-4 w-4" />
              <span>{isExporting ? 'Generating...' : 'Download Document'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
