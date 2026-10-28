"""Database models for Note2Visual."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Text, DateTime, Boolean, 
    ForeignKey, JSON, Enum as SQLEnum
)
from sqlalchemy.orm import relationship, DeclarativeBase
import enum


class Base(DeclarativeBase):
    pass


class ProjectStatus(str, enum.Enum):
    CREATED = "created"
    UPLOADING = "uploading"
    EXTRACTING = "extracting"
    ANALYZING = "analyzing"
    GENERATING = "generating"
    BUILDING_VISUALS = "building_visuals"
    VALIDATING = "validating"
    COMPLETED = "completed"
    FAILED = "failed"


class ExplanationLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class VisualPattern(str, enum.Enum):
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


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=True)
    hashed_password = Column(String(500), nullable=False)
    tier = Column(String(50), default="free")  # free, pro, educator
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(500), nullable=False, default="Untitled Project")
    subject = Column(String(200), nullable=True)
    language = Column(String(50), default="English")
    explanation_level = Column(String(50), default=ExplanationLevel.INTERMEDIATE.value)
    detail_amount = Column(String(50), default="standard")
    default_pattern = Column(String(50), default=VisualPattern.AUTO.value)
    status = Column(String(50), default=ProjectStatus.CREATED.value)
    status_message = Column(Text, nullable=True)
    progress = Column(Float, default=0.0)
    audio_lesson = Column(JSON, nullable=True)
    mind_map_data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="projects")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
    lessons = relationship("Lesson", back_populates="project", cascade="all, delete-orphan")
    exports = relationship("Export", back_populates="project", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    original_filename = Column(String(500), nullable=False)
    stored_filename = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    page_count = Column(Integer, nullable=True)
    extracted_text = Column(Text, nullable=True)
    extraction_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="documents")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    version = Column(Integer, default=1)
    title = Column(String(500), nullable=False)
    subject = Column(String(200), nullable=True)
    lesson_data = Column(JSON, nullable=False)  # Full structured lesson
    visual_settings = Column(JSON, nullable=True)  # Theme + layout config
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="lessons")


class Export(Base):
    __tablename__ = "exports"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    export_type = Column(String(50), default="full")  # full, concise, diagrams, flashcards
    file_path = Column(String(500), nullable=True)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    project = relationship("Project", back_populates="exports")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(String, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    answers = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class LearningProgress(Base):
    __tablename__ = "learning_progress"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    topic_id = Column(String, nullable=False)
    topic_title = Column(String(500), nullable=False)
    time_spent_seconds = Column(Integer, default=0)
    completed = Column(Boolean, default=False)
    last_accessed = Column(DateTime, default=lambda: datetime.now(timezone.utc))
