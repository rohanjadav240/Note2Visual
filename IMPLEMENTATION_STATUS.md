# Note2Visual AI — Implementation Status & Architecture Plan

**Generated At:** 2026-10-28
**Platform:** Note2Visual AI (Inspired by VisualNote AI, designed for modern academic & professional visual learning)

---

## 1. Codebase Audit Summary

### What Is Already Working & Preserved
- **Backend Architecture**: FastAPI application with modular services (`extractor.py`, `ai_service.py`, `generator.py`, `routes.py`).
- **Database**: SQLite with SQLAlchemy ORM models (`Project`, `Document`, `Lesson`, `Export`, `QuizAttempt`, `LearningProgress`).
- **Document Processing**: PyMuPDF extraction for `.pdf`, `.docx`, `.pptx`, `.txt` with defensive fallbacks and page metadata.
- **AI Abstraction**: Provider-agnostic service supporting OpenAI, Anthropic, Google Gemini, and a deterministic offline Demo Mode.
- **Frontend Stack**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide icons, and Zustand store.
- **Design Identity**: Clean academic editorial styling (solid colors, zero gradients, Newsreader serif + Inter typography).
- **Core Visual Layouts**: Mind Map, Flowchart, Timeline, Comparison, Concept Network, Infographic, Flashcards, Math Derivation, Architecture.

---

## 2. Upgrade Objectives (VisualNote AI Parity & Extensions)

### Phase A: Authentication & Project Management
- [ ] User authentication model (`User`), password hashing (PBKDF2/bcrypt or secure SHA256 salt), and JWT/session tokens.
- [ ] Auth API endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`.
- [ ] Frontend Auth state (Zustand + local storage), Login & Registration dialogs/pages.
- [ ] Study pack project actions: Rename, Duplicate, Delete, Search, Grid/List view toggle.

### Phase B: Document Input Versatility
- [ ] Multi-source upload: PDF files, Raw Text paste, and Public URL/transcript inputs.
- [ ] Validation for format, size, and page count with transparent progress indicators.

### Phase C: Visual Formats & Sketchnotes (9 Specialized Layouts)
- [ ] Format A: Educational Infographic.
- [ ] Format B: Hand-Drawn Sketchnotes (`SketchnotesView.tsx` with notebook grid styling, visual callout boxes, and doodles).
- [ ] Format C: Flowcharts (Deterministic process flows).
- [ ] Format D: Interactive Mind Maps (with node editing and expand/collapse).
- [ ] Format E: Chronological Timelines.
- [ ] Format F: Comparison Matrix.
- [ ] Format G: Step-by-Step Pedagogical Guides (`StoryboardView.tsx`).
- [ ] Format H: Revision Sheets (`RevisionSheetView.tsx` with high-yield definitions, formula boxes, and common pitfalls).
- [ ] Format I: Technical & System Architecture (`SystemArchitectureCanvas.tsx`).

### Phase D: Interactive Study Pack Workspace (7 Integrated Tabs)
1. **Overview**: Executive summary, chapter taxonomy, key metrics, and completion progress.
2. **Visual Notes**: Multi-layout visual learning canvas.
3. **Mind Map Editor**: Interactive canvas with Zoom/Pan, add/edit nodes, expand/collapse, and SVG export.
4. **Flashcards**: Active recall revision cards with shuffle, known vs. difficult rating, keyboard shortcuts (Space/Arrows), and flip animation.
5. **Quizzes**: Practice exams with MCQ & True/False, explanations, scoring, retry mode, and performance history.
6. **Audio Lessons**: Text-to-speech educational audio lesson player with speed control, seek bar, play/pause, and real-time transcript sync.
7. **Source Document**: Original extracted text inspector with page anchors and in-document keyword search.

### Phase E: Public & Educational SaaS Pages
- [ ] Upgraded Landing Page with interactive Before-and-After slider, 9-format gallery, 4-step workflow, feature highlights, and FAQs.
- [ ] Features Page (`/features`).
- [ ] How It Works Page (`/how-it-works`).
- [ ] Pricing Page (`/pricing`).
- [ ] Help & FAQ Page (`/faq`).
- [ ] Privacy Policy (`/privacy`) & Terms of Service (`/terms`).
- [ ] Login (`/login`) & Register (`/register`).

### Phase F: Export & Verification
- [ ] Vector diagram SVG download.
- [ ] PNG image export.
- [ ] Formatted PDF study sheet download.
- [ ] Printable flashcard study guide.
- [ ] Full build verification (`npm run build` and backend test suite).
