"""Pydantic schemas for API request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# --- Enums ---

class ProjectStatusEnum(str, Enum):
    CREATED = "created"
    UPLOADING = "uploading"
    EXTRACTING = "extracting"
    ANALYZING = "analyzing"
    GENERATING = "generating"
    BUILDING_VISUALS = "building_visuals"
    VALIDATING = "validating"
    COMPLETED = "completed"
    FAILED = "failed"


class ExplanationLevelEnum(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class VisualPatternEnum(str, Enum):
    MIND_MAP = "mind_map"
    FLOWCHART = "flowchart"
    STORYBOARD = "storyboard"
    TIMELINE = "timeline"
    COMPARISON = "comparison"
    CONCEPT_NETWORK = "concept_network"
    INFOGRAPHIC = "infographic"
    LESSON_CARDS = "lesson_cards"
    MATH_EXPLANATION = "math_explanation"
    SYSTEM_ARCHITECTURE = "system_architecture"
    AUTO = "auto"


# --- Project Schemas ---

class ProjectCreate(BaseModel):
    title: str = "Untitled Project"
    subject: Optional[str] = None
    language: str = "English"
    explanation_level: ExplanationLevelEnum = ExplanationLevelEnum.INTERMEDIATE
    detail_amount: str = "standard"
    default_pattern: VisualPatternEnum = VisualPatternEnum.AUTO


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    language: Optional[str] = None
    explanation_level: Optional[ExplanationLevelEnum] = None
    detail_amount: Optional[str] = None
    default_pattern: Optional[VisualPatternEnum] = None


class ProjectResponse(BaseModel):
    id: str
    title: str
    subject: Optional[str]
    language: str
    explanation_level: str
    detail_amount: str
    default_pattern: str
    status: str
    status_message: Optional[str]
    progress: float
    created_at: datetime
    updated_at: datetime
    document_name: Optional[str] = None
    document_count: int = 0

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]
    total: int


# --- Document Schemas ---

class DocumentResponse(BaseModel):
    id: str
    original_filename: str
    file_type: str
    file_size: int
    page_count: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Processing Status ---

class ProcessingStep(BaseModel):
    step: str
    label: str
    status: str  # pending, in_progress, completed, failed
    message: Optional[str] = None


class ProcessingStatus(BaseModel):
    project_id: str
    status: str
    progress: float
    steps: list[ProcessingStep]
    error: Optional[str] = None


# --- Lesson Schemas ---

class ConceptData(BaseModel):
    id: str
    title: str
    short_explanation: str
    detailed_explanation: str = ""
    examples: list[str] = []
    source_page: Optional[int] = None
    importance: str = "medium"  # low, medium, high
    related_concepts: list[str] = []


class TopicData(BaseModel):
    id: str
    title: str
    overview: str = ""
    concepts: list[ConceptData] = []
    key_takeaways: list[str] = []
    review_questions: list[dict] = []


class ChapterData(BaseModel):
    id: str
    title: str
    overview: str = ""
    topics: list[TopicData] = []
    source_pages: list[int] = []


class DiagramNode(BaseModel):
    id: str
    label: str
    type: str = "default"
    description: str = ""
    position: Optional[dict] = None
    style: Optional[dict] = None


class DiagramEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str = ""
    type: str = "default"


class DiagramData(BaseModel):
    pattern: str
    nodes: list[DiagramNode] = []
    edges: list[DiagramEdge] = []
    metadata: dict = {}


class LessonData(BaseModel):
    title: str
    subject: str = ""
    learning_objectives: list[str] = []
    chapters: list[ChapterData] = []
    diagrams: dict[str, DiagramData] = {}
    source_document: str = ""
    total_pages: int = 0
    generated_at: Optional[str] = None
    explanation_level: str = "intermediate"


class LessonResponse(BaseModel):
    id: str
    project_id: str
    version: int
    title: str
    subject: Optional[str]
    lesson_data: dict
    visual_settings: Optional[dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LessonUpdate(BaseModel):
    lesson_data: Optional[dict] = None
    title: Optional[str] = None


# --- Visual Settings ---

class VisualSettings(BaseModel):
    pattern: VisualPatternEnum = VisualPatternEnum.AUTO
    theme: str = "clean_academic"
    color_primary: str = "#2563eb"
    color_accent: str = "#0d9488"
    dark_mode: bool = False
    font_size: str = "medium"
    diagram_density: str = "standard"
    spacing: str = "comfortable"
    animation_intensity: str = "moderate"
    show_source_refs: bool = True


# --- Export Schemas ---

class ExportRequest(BaseModel):
    export_type: str = "full"  # full, concise, diagrams
    include_answers: bool = True
    paper_size: str = "A4"


class ExportResponse(BaseModel):
    id: str
    project_id: str
    export_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Quiz Schemas ---

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: list[str]
    correct_answer: int
    explanation: str = ""
    topic_id: str = ""


class QuizSubmission(BaseModel):
    answers: dict[str, int]  # question_id -> selected_option_index


class QuizResult(BaseModel):
    score: float
    total_questions: int
    correct_answers: int
    results: list[dict]


# --- Learning Progress ---

class ProgressUpdate(BaseModel):
    topic_id: str
    topic_title: str
    time_spent_seconds: int = 0
    completed: bool = False


class ProgressResponse(BaseModel):
    total_lessons: int
    completed_lessons: int
    total_topics: int
    completed_topics: int
    total_quiz_attempts: int
    average_score: float
    total_time_seconds: int
    recent_sessions: list[dict] = []
