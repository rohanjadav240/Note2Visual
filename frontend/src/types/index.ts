/* TypeScript types matching backend Pydantic schemas */

export type ProjectStatus =
  | 'created'
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'generating'
  | 'building_visuals'
  | 'validating'
  | 'completed'
  | 'failed';

export type ExplanationLevel = 'beginner' | 'intermediate' | 'advanced';

export type VisualPattern =
  | 'mind_map'
  | 'flowchart'
  | 'storyboard'
  | 'timeline'
  | 'comparison'
  | 'concept_network'
  | 'infographic'
  | 'lesson_cards'
  | 'math_explanation'
  | 'system_architecture'
  | 'auto';

export interface Project {
  id: string;
  title: string;
  subject: string | null;
  language: string;
  explanation_level: string;
  detail_amount: string;
  default_pattern: string;
  status: ProjectStatus;
  status_message: string | null;
  progress: number;
  created_at: string;
  updated_at: string;
  document_name: string | null;
  document_count: number;
}

export interface DocumentInfo {
  id: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  page_count: number | null;
  created_at: string;
}

export interface ProcessingStep {
  step: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message: string | null;
}

export interface ProcessingStatus {
  project_id: string;
  status: string;
  progress: number;
  steps: ProcessingStep[];
  error: string | null;
}

export interface Concept {
  id: string;
  title: string;
  short_explanation: string;
  detailed_explanation: string;
  examples: string[];
  source_page: number | null;
  importance: 'low' | 'medium' | 'high';
  related_concepts: string[];
}

export interface ReviewQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  topic_id?: string;
}

export interface Topic {
  id: string;
  title: string;
  overview: string;
  concepts: Concept[];
  key_takeaways: string[];
  review_questions: ReviewQuestion[];
}

export interface Chapter {
  id: string;
  title: string;
  overview: string;
  topics: Topic[];
  source_pages: number[];
}

export interface DiagramNode {
  id: string;
  label: string;
  type: string;
  description: string;
  position: { x: number; y: number } | null;
  style: Record<string, unknown>;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
}

export interface DiagramData {
  pattern: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  metadata: Record<string, unknown>;
}

export interface LessonData {
  title: string;
  subject: string;
  learning_objectives: string[];
  chapters: Chapter[];
  diagrams: Record<string, DiagramData>;
  source_document: string;
  total_pages: number;
  generated_at: string | null;
  explanation_level: string;
  recommended_pattern?: string;
  _demo_mode?: boolean;
  _demo_notice?: string;
}

export interface Lesson {
  id: string;
  project_id: string;
  version: number;
  title: string;
  subject: string | null;
  lesson_data: LessonData;
  visual_settings: VisualSettings | null;
  created_at: string;
  updated_at: string;
}

export interface VisualSettings {
  pattern: VisualPattern;
  theme: string;
  color_primary: string;
  color_accent: string;
  dark_mode: boolean;
  font_size: string;
  diagram_density: string;
  spacing: string;
  animation_intensity: string;
  show_source_refs: boolean;
}

export interface ExportInfo {
  id: string;
  project_id: string;
  export_type: string;
  status: string;
  created_at: string;
}

export interface QuizResult {
  score: number;
  total_questions: number;
  correct_answers: number;
  results: Array<{
    question_id: string;
    selected: number;
    correct: number;
    is_correct: boolean;
    explanation: string;
  }>;
}

export interface LearningProgressData {
  total_lessons: number;
  completed_lessons: number;
  total_topics: number;
  completed_topics: number;
  total_quiz_attempts: number;
  average_score: number;
  total_time_seconds: number;
  recent_sessions: Array<{
    topic_id: string;
    topic_title: string;
    time_spent: number;
    completed: boolean;
    last_accessed: string;
  }>;
}

export const PATTERN_LABELS: Record<VisualPattern, string> = {
  mind_map: 'Mind Map',
  flowchart: 'Flowchart',
  storyboard: 'Storyboard',
  timeline: 'Timeline',
  comparison: 'Comparison',
  concept_network: 'Concept Network',
  infographic: 'Infographic',
  lesson_cards: 'Lesson Cards',
  math_explanation: 'Math Explanation',
  system_architecture: 'System Architecture',
  auto: 'Auto-detect',
};

export const PATTERN_DESCRIPTIONS: Record<VisualPattern, string> = {
  mind_map: 'Topic hierarchies and relationships branching from a central idea',
  flowchart: 'Step-by-step processes, algorithms, and decision workflows',
  storyboard: 'Sequential explanations with scenes, examples, and takeaways',
  timeline: 'Historical events and chronological processes',
  comparison: 'Side-by-side comparison of theories, methods, or concepts',
  concept_network: 'Interconnected ideas with labeled relationships',
  infographic: 'Chapter summaries with facts, definitions, and highlights',
  lesson_cards: 'Bite-sized learning units with one concept each',
  math_explanation: 'Equations, step-by-step derivations, and worked examples',
  system_architecture: 'Software systems, networks, and technical architectures',
  auto: 'Automatically select the best layout for the content',
};
