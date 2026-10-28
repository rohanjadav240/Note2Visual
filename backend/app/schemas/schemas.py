"""Pydantic schemas for API request/response validation."""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Any
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
    SKETCHNOTES = "sketchnotes"
    REVISION_SHEET = "revision_sheet"
    LESSON_CARDS = "lesson_cards"
    MATH_EXPLANATION = "math_explanation"
    SYSTEM_ARCHITECTURE = "system_architecture"
    AUTO = "auto"


# --- User & Auth Schemas ---

class UserRegister(BaseModel):
    email: str
    password: str = Field(min_length=6)
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    tier: str
    created_at: datetime

    class Config:
        from_attributes = True


class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


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
    user_id: Optional[str] = None
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
    has_audio_lesson: bool = False

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    projects: list[ProjectResponse]
    total: int


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


class LessonUpdate(BaseModel):
    lesson_data: Optional[dict] = None
    title: Optional[str] = None


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


# --- Document Schemas ---

class DocumentResponse(BaseModel):
    id: str
    project_id: str
    original_filename: str
    file_type: str
    file_size: int
    page_count: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class TextInputRequest(BaseModel):
    text: str = Field(min_length=10)
    title: Optional[str] = None
    source_type: str = "text"  # text, notes, transcript


# --- Lesson & Visual Schemas ---

class VisualSettingsUpdate(BaseModel):
    pattern: Optional[VisualPatternEnum] = None
    theme: Optional[str] = None
    color_primary: Optional[str] = None
    color_accent: Optional[str] = None
    dark_mode: Optional[bool] = None
    font_size: Optional[str] = None
    diagram_density: Optional[str] = None
    spacing: Optional[str] = None
    animation_intensity: Optional[str] = None
    show_source_refs: Optional[bool] = None


class Concept(BaseModel):
    id: str
    title: str
    short_explanation: str
    detailed_explanation: str = ""
    visual_type: str = "concept"
    importance: str = "medium"
    source_page: Optional[int] = None
    examples: list[str] = []
    keywords: list[str] = []


class Topic(BaseModel):
    id: str
    title: str
    overview: str = ""
    recommended_pattern: str = "mind_map"
    concepts: list[Concept] = []
    key_takeaways: list[str] = []
    review_questions: list[dict] = []
    source_pages: list[int] = []


class Chapter(BaseModel):
    id: str
    title: str
    description: str = ""
    topics: list[Topic] = []


class LessonData(BaseModel):
    title: str
    subject: Optional[str] = None
    summary: str = ""
    recommended_pattern: str = "mind_map"
    chapters: list[Chapter] = []
    diagrams: dict[str, Any] = {}


class LessonResponse(BaseModel):
    id: str
    project_id: str
    version: int
    title: str
    subject: Optional[str]
    lesson_data: LessonData
    visual_settings: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Export Schemas ---

class ExportRequest(BaseModel):
    export_type: str = "full"  # full, concise, diagrams, flashcards
    include_source_refs: bool = True
    include_questions: bool = True
    theme: str = "academic_clean"


class ExportResponse(BaseModel):
    id: str
    project_id: str
    export_type: str
    status: str
    download_url: Optional[str] = None
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


# --- Audio Lesson Schemas ---

class AudioLessonRequest(BaseModel):
    mode: str = "lecture"  # lecture, discussion, revision
    voice_speed: float = 1.0


class AudioLessonSection(BaseModel):
    speaker: str = "Narrator"
    text: str
    topic_title: str
    timestamp_estimate: int = 0


class AudioLessonResponse(BaseModel):
    project_id: str
    title: str
    mode: str
    script: str
    sections: list[AudioLessonSection]
    estimated_duration_seconds: int
    created_at: datetime


# --- Mind Map Editor Schema ---

class MindMapUpdateRequest(BaseModel):
    topic_id: str
    nodes: list[dict]
    edges: list[dict] = []


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
