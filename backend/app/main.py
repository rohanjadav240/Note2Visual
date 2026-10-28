"""Note2Visual — Main FastAPI application."""

import logging
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.database import init_db
from app.api.routes import router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Note2Visual API",
    description="AI-powered visual learning platform — transform notes into visual lessons",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api")

# Serve uploads and exports as static files
settings.upload_path.mkdir(parents=True, exist_ok=True)
settings.export_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(settings.upload_path)), name="uploads")
app.mount("/exports", StaticFiles(directory=str(settings.export_path)), name="exports")

@app.on_event("startup")
async def startup():
    logger.info("Initializing database...")
    init_db()
    logger.info(f"AI Provider: {settings.ai_provider} ({'demo mode' if settings.ai_provider == 'demo' else 'configured'})")
    logger.info("Note2Visual API ready")


@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "ai_provider": settings.ai_provider,
        "demo_mode": settings.ai_provider == "demo" or not settings.get_ai_api_key()
    }


# Serve frontend build if present (MUST be after all /api routes)
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api/") or full_path == "api":
            raise HTTPException(status_code=404, detail="API endpoint not found")
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"detail": "Frontend not found"}

