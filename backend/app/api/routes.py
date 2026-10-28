"""API routes for Note2Visual."""

import os
import uuid
import logging
import asyncio
from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token
from app.models.models import (
    User, Project, Document, Lesson, Export, QuizAttempt, LearningProgress,
    ProjectStatus
)
from app.schemas.schemas import (
    UserRegister, UserLogin, UserResponse, AuthToken,
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectListResponse,
    DocumentResponse, TextInputRequest, ProcessingStatus, ProcessingStep,
    LessonResponse, LessonUpdate, VisualSettings,
    ExportRequest, ExportResponse,
    QuizSubmission, QuizResult,
    AudioLessonRequest, AudioLessonResponse,
    MindMapUpdateRequest,
    ProgressUpdate, ProgressResponse
)
from app.services.documents.extractor import document_extractor
from app.services.ai.ai_service import ai_service
from app.services.visuals.generator import visual_generator

logger = logging.getLogger(__name__)
router = APIRouter()


# ==================== AUTH ====================

@router.post("/auth/register", response_model=AuthToken)
async def register(req: UserRegister, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    user = User(
        id=str(uuid.uuid4()),
        email=email_clean,
        name=req.name or email_clean.split("@")[0],
        hashed_password=hash_password(req.password),
        tier="free"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token(user.id, user.email)
    return AuthToken(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/auth/login", response_model=AuthToken)
async def login(req: UserLogin, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(user.id, user.email)
    return AuthToken(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@router.get("/auth/me", response_model=UserResponse)
async def get_me(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired session token.")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse.model_validate(user)


# ==================== PROJECTS ====================

@router.post("/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = Project(
        id=str(uuid.uuid4()),
        title=project.title,
        subject=project.subject,
        language=project.language,
        explanation_level=project.explanation_level.value,
        detail_amount=project.detail_amount,
        default_pattern=project.default_pattern.value,
        status=ProjectStatus.CREATED.value,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return _project_to_response(db_project)


@router.get("/projects", response_model=ProjectListResponse)
async def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.updated_at.desc()).all()
    return ProjectListResponse(
        projects=[_project_to_response(p) for p in projects],
        total=len(projects)
    )


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _project_to_response(project)


@router.patch("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(project_id: str, update: ProjectUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if update.title is not None:
        project.title = update.title
    if update.subject is not None:
        project.subject = update.subject
    if update.language is not None:
        project.language = update.language
    if update.explanation_level is not None:
        project.explanation_level = update.explanation_level.value
    if update.detail_amount is not None:
        project.detail_amount = update.detail_amount
    if update.default_pattern is not None:
        project.default_pattern = update.default_pattern.value
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    return _project_to_response(project)


@router.post("/projects/{project_id}/duplicate", response_model=ProjectResponse)
async def duplicate_project(project_id: str, db: Session = Depends(get_db)):
    src = db.query(Project).filter(Project.id == project_id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Source project not found")
    
    new_proj = Project(
        id=str(uuid.uuid4()),
        user_id=src.user_id,
        title=f"{src.title} (Copy)",
        subject=src.subject,
        language=src.language,
        explanation_level=src.explanation_level,
        detail_amount=src.detail_amount,
        default_pattern=src.default_pattern,
        status=src.status,
        progress=src.progress,
        audio_lesson=src.audio_lesson,
        mind_map_data=src.mind_map_data
    )
    db.add(new_proj)
    db.commit()

    # Copy lessons
    src_lesson = db.query(Lesson).filter(Lesson.project_id == project_id).first()
    if src_lesson:
        new_lesson = Lesson(
            id=str(uuid.uuid4()),
            project_id=new_proj.id,
            version=src_lesson.version,
            title=new_proj.title,
            subject=src_lesson.subject,
            lesson_data=src_lesson.lesson_data,
            visual_settings=src_lesson.visual_settings
        )
        db.add(new_lesson)
        db.commit()

    db.refresh(new_proj)
    return _project_to_response(new_proj)


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete associated files
    for doc in project.documents:
        file_path = settings.upload_path / doc.stored_filename
        if file_path.exists():
            file_path.unlink()
    
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}


# ==================== UPLOAD ====================

@router.post("/projects/{project_id}/upload", response_model=DocumentResponse)
async def upload_document(
    project_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate file type
    ext = Path(file.filename).suffix.lower()
    if ext not in {".pdf", ".docx", ".pptx", ".txt"}:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}. Supported: .pdf, .docx, .pptx, .txt")

    # Read file
    content = await file.read()
    file_size = len(content)
    
    if file_size > settings.max_upload_bytes:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum size: {settings.max_upload_size_mb}MB")
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    # Save file
    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = settings.upload_path / stored_filename
    with open(file_path, "wb") as f:
        f.write(content)

    # Create document record
    doc = Document(
        id=str(uuid.uuid4()),
        project_id=project_id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        file_type=ext.lstrip("."),
        file_size=file_size,
    )
    db.add(doc)
    
    # Update project title if still untitled
    if project.title == "Untitled Project":
        project.title = Path(file.filename).stem
    
    project.status = ProjectStatus.UPLOADING.value
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)

    return DocumentResponse.model_validate(doc)


@router.post("/projects/{project_id}/text-input", response_model=DocumentResponse)
async def ingest_text_input(
    project_id: str,
    req: TextInputRequest,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    stored_filename = f"{uuid.uuid4()}.txt"
    file_path = settings.upload_path / stored_filename
    file_path.write_text(req.text, encoding="utf-8")

    title_clean = req.title.strip() if req.title and req.title.strip() else "Pasted Study Material"

    doc = Document(
        id=str(uuid.uuid4()),
        project_id=project_id,
        original_filename=f"{title_clean}.txt",
        stored_filename=stored_filename,
        file_type="txt",
        file_size=len(req.text.encode("utf-8")),
        page_count=1,
        extracted_text=req.text,
        extraction_metadata={"source_type": req.source_type, "char_count": len(req.text)}
    )
    db.add(doc)

    if project.title == "Untitled Project":
        project.title = title_clean

    project.status = ProjectStatus.UPLOADING.value
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(doc)

    return DocumentResponse.model_validate(doc)


# ==================== GENERATION ====================

@router.post("/projects/{project_id}/generate")
async def generate_lesson(
    project_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not project.documents:
        raise HTTPException(status_code=400, detail="No document uploaded")

    if project.status in [ProjectStatus.EXTRACTING.value, ProjectStatus.ANALYZING.value, ProjectStatus.GENERATING.value]:
        raise HTTPException(status_code=409, detail="Generation already in progress")

    # Start background processing
    background_tasks.add_task(_process_document, project_id)
    
    project.status = ProjectStatus.EXTRACTING.value
    project.progress = 0.0
    project.status_message = "Starting document processing..."
    project.updated_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": "Generation started", "project_id": project_id}


async def _process_document(project_id: str):
    """Background task: extract content, generate lesson, build visuals."""
    from app.db.database import SessionLocal
    db = SessionLocal()

    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project or not project.documents:
            return

        doc = project.documents[0]
        file_path = str(settings.upload_path / doc.stored_filename)

        # Step 1: Extract content
        _update_status(db, project, ProjectStatus.EXTRACTING, 0.15, "Extracting document content...")
        try:
            extracted = document_extractor.extract(file_path)
        except Exception as e:
            _update_status(db, project, ProjectStatus.FAILED, 0.0, f"Extraction failed: {str(e)}")
            return

        # Save extraction data
        doc.extracted_text = extracted["text"]
        doc.page_count = extracted["metadata"].get("page_count", 0)
        doc.extraction_metadata = extracted["metadata"]
        db.commit()

        # Step 2: Analyze content
        _update_status(db, project, ProjectStatus.ANALYZING, 0.35, "Analyzing content and identifying topics...")

        # Step 3: Generate lesson
        _update_status(db, project, ProjectStatus.GENERATING, 0.50, "Generating lesson content...")
        try:
            options = {
                "explanation_level": project.explanation_level,
                "subject": project.subject or "auto-detect",
                "detail_amount": project.detail_amount,
            }
            lesson_data = await ai_service.generate_lesson(extracted, options)
        except Exception as e:
            _update_status(db, project, ProjectStatus.FAILED, 0.0, f"Lesson generation failed: {str(e)}")
            return

        # Step 4: Build visuals
        _update_status(db, project, ProjectStatus.BUILDING_VISUALS, 0.70, "Building visual diagrams...")
        pattern = project.default_pattern if project.default_pattern != "auto" else "auto"
        diagrams = visual_generator.generate_diagrams(lesson_data, pattern)
        lesson_data["diagrams"] = {k: v for k, v in diagrams.items()}

        # Step 5: Validate
        _update_status(db, project, ProjectStatus.VALIDATING, 0.85, "Validating generated content...")

        # Step 6: Save lesson
        lesson = Lesson(
            id=str(uuid.uuid4()),
            project_id=project_id,
            title=lesson_data.get("title", project.title),
            subject=lesson_data.get("subject", project.subject),
            lesson_data=lesson_data,
            visual_settings={
                "pattern": project.default_pattern,
                "theme": "clean_academic",
                "dark_mode": False,
            }
        )
        db.add(lesson)

        # Update project
        if lesson_data.get("subject") and not project.subject:
            project.subject = lesson_data["subject"]
        
        _update_status(db, project, ProjectStatus.COMPLETED, 1.0, "Lesson ready!")

    except Exception as e:
        logger.error(f"Processing error for project {project_id}: {e}", exc_info=True)
        project = db.query(Project).filter(Project.id == project_id).first()
        if project:
            _update_status(db, project, ProjectStatus.FAILED, 0.0, f"Processing error: {str(e)}")
    finally:
        db.close()


def _update_status(db: Session, project: Project, status: ProjectStatus, progress: float, message: str):
    project.status = status.value
    project.progress = progress
    project.status_message = message
    project.updated_at = datetime.now(timezone.utc)
    db.commit()


# ==================== STATUS ====================

@router.get("/projects/{project_id}/status", response_model=ProcessingStatus)
async def get_processing_status(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    steps_order = [
        ("uploading", "Uploading document"),
        ("extracting", "Extracting content"),
        ("analyzing", "Identifying topics"),
        ("generating", "Generating explanations"),
        ("building_visuals", "Building visual diagrams"),
        ("validating", "Validating content"),
        ("completed", "Lesson ready"),
    ]

    status_index = next(
        (i for i, (s, _) in enumerate(steps_order) if s == project.status),
        -1
    )

    steps = []
    for i, (step_key, step_label) in enumerate(steps_order):
        if project.status == "failed" and i >= status_index:
            step_status = "failed" if i == status_index else "pending"
        elif i < status_index:
            step_status = "completed"
        elif i == status_index:
            step_status = "in_progress" if project.status != "completed" else "completed"
        else:
            step_status = "pending"

        steps.append(ProcessingStep(
            step=step_key,
            label=step_label,
            status=step_status,
            message=project.status_message if i == status_index else None
        ))

    return ProcessingStatus(
        project_id=project_id,
        status=project.status,
        progress=project.progress,
        steps=steps,
        error=project.status_message if project.status == "failed" else None
    )


# ==================== LESSON ====================

@router.get("/projects/{project_id}/lesson")
async def get_lesson(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    lesson = db.query(Lesson).filter(
        Lesson.project_id == project_id
    ).order_by(Lesson.version.desc()).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="No lesson generated yet")

    return {
        "id": lesson.id,
        "project_id": lesson.project_id,
        "version": lesson.version,
        "title": lesson.title,
        "subject": lesson.subject,
        "lesson_data": lesson.lesson_data,
        "visual_settings": lesson.visual_settings,
        "created_at": lesson.created_at.isoformat() if lesson.created_at else None,
        "updated_at": lesson.updated_at.isoformat() if lesson.updated_at else None,
    }


@router.patch("/projects/{project_id}/lesson")
async def update_lesson(project_id: str, update: LessonUpdate, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(
        Lesson.project_id == project_id
    ).order_by(Lesson.version.desc()).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="No lesson found")

    if update.lesson_data:
        lesson.lesson_data = update.lesson_data
    if update.title:
        lesson.title = update.title

    lesson.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Lesson updated"}


@router.patch("/projects/{project_id}/visual-settings")
async def update_visual_settings(project_id: str, vis: VisualSettings, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(
        Lesson.project_id == project_id
    ).order_by(Lesson.version.desc()).first()

    if not lesson:
        raise HTTPException(status_code=404, detail="No lesson found")

    # Regenerate diagrams if pattern changed
    current_settings = lesson.visual_settings or {}
    new_pattern = vis.pattern.value

    if current_settings.get("pattern") != new_pattern:
        diagrams = visual_generator.generate_diagrams(lesson.lesson_data, new_pattern)
        lesson_data = dict(lesson.lesson_data)
        lesson_data["diagrams"] = diagrams
        lesson.lesson_data = lesson_data

    lesson.visual_settings = vis.model_dump()
    lesson.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Visual settings updated"}


# ==================== EXPORT ====================

@router.post("/projects/{project_id}/export/pdf", response_model=ExportResponse)
async def export_pdf(
    project_id: str,
    req: ExportRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.project_id == project_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="No lesson found")

    export = Export(
        id=str(uuid.uuid4()),
        project_id=project_id,
        export_type=req.export_type,
        status="processing",
    )
    db.add(export)
    db.commit()
    db.refresh(export)

    background_tasks.add_task(_generate_pdf, export.id, lesson.lesson_data, lesson.visual_settings, req)

    return ExportResponse.model_validate(export)


async def _generate_pdf(export_id: str, lesson_data: dict, visual_settings: dict, req: ExportRequest):
    """Generate PDF from lesson data."""
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        export = db.query(Export).filter(Export.id == export_id).first()
        if not export:
            return

        # Generate simple HTML-based PDF
        html = _build_pdf_html(lesson_data, visual_settings, req)
        
        filename = f"note2visual_{export.project_id[:8]}.pdf"
        filepath = settings.export_path / filename

        # Try WeasyPrint for PDF generation
        try:
            from weasyprint import HTML
            HTML(string=html).write_pdf(str(filepath))
        except ImportError:
            # Fallback: save as HTML
            filename = f"note2visual_{export.project_id[:8]}.html"
            filepath = settings.export_path / filename
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(html)

        export.file_path = str(filepath)
        export.status = "completed"
        db.commit()

    except Exception as e:
        logger.error(f"PDF generation error: {e}", exc_info=True)
        if export:
            export.status = "failed"
            db.commit()
    finally:
        db.close()


def _build_pdf_html(lesson_data: dict, visual_settings: dict, req: ExportRequest) -> str:
    """Build well-formatted HTML for PDF export."""
    title = lesson_data.get("title", "Visual Lesson")
    subject = lesson_data.get("subject", "")
    chapters = lesson_data.get("chapters", [])
    objectives = lesson_data.get("learning_objectives", [])

    sections_html = ""
    
    # Cover
    sections_html += f"""
    <div class="cover">
        <div class="cover-brand">Note2Visual</div>
        <h1>{title}</h1>
        <p class="cover-subject">{subject}</p>
    </div>
    <div style="page-break-after: always;"></div>
    """

    # Learning objectives
    if objectives:
        sections_html += '<div class="section"><h2>Learning Objectives</h2><ul>'
        for obj in objectives:
            sections_html += f"<li>{obj}</li>"
        sections_html += "</ul></div>"

    # Chapters
    for chapter in chapters:
        sections_html += f'<div class="chapter"><h2>{chapter.get("title", "")}</h2>'
        if chapter.get("overview"):
            sections_html += f'<p class="overview">{chapter["overview"]}</p>'

        for topic in chapter.get("topics", []):
            sections_html += f'<div class="topic"><h3>{topic.get("title", "")}</h3>'
            
            for concept in topic.get("concepts", []):
                sections_html += f"""
                <div class="concept">
                    <h4>{concept.get("title", "")}</h4>
                    <p>{concept.get("detailed_explanation", concept.get("short_explanation", ""))}</p>
                """
                if concept.get("examples"):
                    sections_html += '<div class="examples"><strong>Examples:</strong><ul>'
                    for ex in concept["examples"]:
                        sections_html += f"<li>{ex}</li>"
                    sections_html += "</ul></div>"
                
                if concept.get("source_page"):
                    sections_html += f'<span class="source-ref">Source: Page {concept["source_page"]}</span>'
                sections_html += "</div>"

            # Key takeaways
            takeaways = topic.get("key_takeaways", [])
            if takeaways:
                sections_html += '<div class="takeaways"><strong>Key Takeaways</strong><ul>'
                for t in takeaways:
                    sections_html += f"<li>{t}</li>"
                sections_html += "</ul></div>"

            # Review questions
            if req.export_type != "diagrams":
                questions = topic.get("review_questions", [])
                if questions:
                    sections_html += '<div class="questions"><strong>Review Questions</strong>'
                    for q in questions:
                        sections_html += f'<p class="question">{q.get("question", "")}</p>'
                        if req.include_answers:
                            correct = q.get("correct_answer", 0)
                            options = q.get("options", [])
                            if options and correct < len(options):
                                sections_html += f'<p class="answer">Answer: {options[correct]}</p>'
                                if q.get("explanation"):
                                    sections_html += f'<p class="explanation">{q["explanation"]}</p>'
                    sections_html += "</div>"

            sections_html += "</div>"  # topic
        sections_html += "</div>"  # chapter

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title} — Note2Visual</title>
<style>
@page {{ size: A4; margin: 2cm; }}
body {{ font-family: 'Segoe UI', system-ui, sans-serif; color: #1e293b; line-height: 1.6; font-size: 11pt; }}
.cover {{ text-align: center; padding: 120px 40px; }}
.cover-brand {{ font-size: 14pt; color: #2563eb; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 40px; }}
.cover h1 {{ font-size: 28pt; color: #0f172a; margin-bottom: 16px; }}
.cover-subject {{ font-size: 14pt; color: #64748b; }}
h2 {{ color: #1e40af; border-bottom: 2px solid #dbeafe; padding-bottom: 8px; margin-top: 32px; }}
h3 {{ color: #1e293b; margin-top: 24px; }}
h4 {{ color: #334155; }}
.concept {{ background: #f8fafc; border-left: 3px solid #2563eb; padding: 12px 16px; margin: 16px 0; page-break-inside: avoid; }}
.examples {{ background: #f0fdf4; padding: 8px 12px; border-radius: 4px; margin-top: 8px; }}
.takeaways {{ background: #eff6ff; padding: 12px 16px; border-radius: 6px; margin: 16px 0; }}
.questions {{ margin: 16px 0; }}
.question {{ font-weight: 600; margin-top: 12px; }}
.answer {{ color: #15803d; }}
.explanation {{ color: #64748b; font-style: italic; }}
.source-ref {{ font-size: 9pt; color: #94a3b8; }}
.overview {{ color: #475569; font-style: italic; }}
</style>
</head>
<body>
{sections_html}
<footer style="text-align: center; color: #94a3b8; font-size: 9pt; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
Generated by Note2Visual
</footer>
</body>
</html>"""


@router.get("/projects/{project_id}/export/{export_id}")
async def get_export(project_id: str, export_id: str, db: Session = Depends(get_db)):
    export = db.query(Export).filter(
        Export.id == export_id,
        Export.project_id == project_id
    ).first()
    if not export:
        raise HTTPException(status_code=404, detail="Export not found")
    
    if export.status == "processing":
        return {"status": "processing", "message": "PDF is being generated..."}
    
    if export.status == "failed":
        raise HTTPException(status_code=500, detail="PDF generation failed")

    from fastapi.responses import FileResponse
    if export.file_path and os.path.exists(export.file_path):
        return FileResponse(
            export.file_path,
            media_type="application/pdf" if export.file_path.endswith(".pdf") else "text/html",
            filename=os.path.basename(export.file_path)
        )
    raise HTTPException(status_code=404, detail="Export file not found")


# ==================== QUIZ ====================

@router.post("/projects/{project_id}/quiz/submit", response_model=QuizResult)
async def submit_quiz(project_id: str, submission: QuizSubmission, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.project_id == project_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="No lesson found")

    # Collect all questions from lesson
    all_questions = {}
    for chapter in lesson.lesson_data.get("chapters", []):
        for topic in chapter.get("topics", []):
            for q in topic.get("review_questions", []):
                all_questions[q["id"]] = q

    correct = 0
    total = len(submission.answers)
    results = []

    for q_id, selected in submission.answers.items():
        question = all_questions.get(q_id)
        if question:
            is_correct = selected == question.get("correct_answer", -1)
            if is_correct:
                correct += 1
            results.append({
                "question_id": q_id,
                "selected": selected,
                "correct": question.get("correct_answer", 0),
                "is_correct": is_correct,
                "explanation": question.get("explanation", "")
            })

    score = (correct / total * 100) if total > 0 else 0

    attempt = QuizAttempt(
        id=str(uuid.uuid4()),
        project_id=project_id,
        lesson_id=lesson.id,
        score=score,
        total_questions=total,
        correct_answers=correct,
        answers=submission.answers,
    )
    db.add(attempt)
    db.commit()

    return QuizResult(score=score, total_questions=total, correct_answers=correct, results=results)


# ==================== AUDIO LESSONS ====================

@router.post("/projects/{project_id}/audio-lesson", response_model=AudioLessonResponse)
async def generate_audio_lesson(
    project_id: str,
    req: AudioLessonRequest,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    lesson = db.query(Lesson).filter(Lesson.project_id == project_id).first()
    if not lesson or not lesson.lesson_data:
        raise HTTPException(status_code=400, detail="Lesson must be generated before creating an audio lesson")

    audio_data = await ai_service.generate_audio_script(lesson.lesson_data, mode=req.mode)
    project.audio_lesson = audio_data
    project.updated_at = datetime.now(timezone.utc)
    db.commit()

    return AudioLessonResponse(
        project_id=project_id,
        title=audio_data.get("title", project.title),
        mode=audio_data.get("mode", req.mode),
        script=audio_data.get("script", ""),
        sections=audio_data.get("sections", []),
        estimated_duration_seconds=audio_data.get("estimated_duration_seconds", 120),
        created_at=datetime.now(timezone.utc)
    )


@router.get("/projects/{project_id}/audio-lesson", response_model=AudioLessonResponse)
async def get_audio_lesson(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project or not project.audio_lesson:
        raise HTTPException(status_code=404, detail="No audio lesson found for this study pack")
    data = project.audio_lesson
    return AudioLessonResponse(
        project_id=project_id,
        title=data.get("title", project.title),
        mode=data.get("mode", "lecture"),
        script=data.get("script", ""),
        sections=data.get("sections", []),
        estimated_duration_seconds=data.get("estimated_duration_seconds", 120),
        created_at=project.updated_at or project.created_at
    )


# ==================== MIND MAP EDITOR ====================

@router.put("/projects/{project_id}/mind-map")
async def update_mind_map(
    project_id: str,
    req: MindMapUpdateRequest,
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    lesson = db.query(Lesson).filter(Lesson.project_id == project_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    lesson_data = dict(lesson.lesson_data)
    diagrams = dict(lesson_data.get("diagrams", {}))
    diagrams[req.topic_id] = {
        "pattern": "mind_map",
        "nodes": req.nodes,
        "edges": req.edges,
        "metadata": {"topic_id": req.topic_id, "customized": True}
    }
    lesson_data["diagrams"] = diagrams
    lesson.lesson_data = lesson_data
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"message": "Mind map updated successfully", "topic_id": req.topic_id}


# ==================== PROGRESS ====================

@router.post("/projects/{project_id}/progress")
async def update_progress(project_id: str, update: ProgressUpdate, db: Session = Depends(get_db)):
    progress = db.query(LearningProgress).filter(
        LearningProgress.project_id == project_id,
        LearningProgress.topic_id == update.topic_id
    ).first()

    if progress:
        progress.time_spent_seconds += update.time_spent_seconds
        progress.completed = update.completed
        progress.last_accessed = datetime.now(timezone.utc)
    else:
        progress = LearningProgress(
            id=str(uuid.uuid4()),
            project_id=project_id,
            topic_id=update.topic_id,
            topic_title=update.topic_title,
            time_spent_seconds=update.time_spent_seconds,
            completed=update.completed,
        )
        db.add(progress)

    db.commit()
    return {"message": "Progress updated"}


@router.get("/progress", response_model=ProgressResponse)
async def get_progress(db: Session = Depends(get_db)):
    total_lessons = db.query(Lesson).count()
    completed_projects = db.query(Project).filter(Project.status == "completed").count()
    
    all_progress = db.query(LearningProgress).all()
    total_topics = len(all_progress)
    completed_topics = sum(1 for p in all_progress if p.completed)
    total_time = sum(p.time_spent_seconds for p in all_progress)

    quiz_attempts = db.query(QuizAttempt).all()
    avg_score = sum(a.score for a in quiz_attempts) / len(quiz_attempts) if quiz_attempts else 0

    recent = sorted(all_progress, key=lambda p: p.last_accessed, reverse=True)[:10]
    recent_sessions = [
        {
            "topic_id": p.topic_id,
            "topic_title": p.topic_title,
            "time_spent": p.time_spent_seconds,
            "completed": p.completed,
            "last_accessed": p.last_accessed.isoformat() if p.last_accessed else None
        }
        for p in recent
    ]

    return ProgressResponse(
        total_lessons=total_lessons,
        completed_lessons=completed_projects,
        total_topics=total_topics,
        completed_topics=completed_topics,
        total_quiz_attempts=len(quiz_attempts),
        average_score=round(avg_score, 1),
        total_time_seconds=total_time,
        recent_sessions=recent_sessions
    )


# ==================== HELPERS ====================

def _project_to_response(project: Project) -> ProjectResponse:
    doc_name = None
    doc_count = len(project.documents) if project.documents else 0
    if project.documents:
        doc_name = project.documents[0].original_filename

    return ProjectResponse(
        id=project.id,
        user_id=project.user_id,
        title=project.title,
        subject=project.subject,
        language=project.language,
        explanation_level=project.explanation_level,
        detail_amount=project.detail_amount,
        default_pattern=project.default_pattern,
        status=project.status,
        status_message=project.status_message,
        progress=project.progress,
        created_at=project.created_at,
        updated_at=project.updated_at,
        document_name=doc_name,
        document_count=doc_count,
        has_audio_lesson=bool(project.audio_lesson),
    )
