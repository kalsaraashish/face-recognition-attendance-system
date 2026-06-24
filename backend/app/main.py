"""
Main FastAPI application.
- Registers all routers under /api
- Configures CORS
- Runs DB startup checks and admin seed on lifespan
- Registers global exception handlers
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger

from app.core.config import settings
from app.core.database import SessionLocal, check_db_connection, create_tables
from app.core.exceptions import AppException
from app.routers import (
    attendance,
    auth,
    dashboard,
    departments,
    face_recognition,
    faculty,
    reports,
    students,
    subjects,
)


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info("Starting up AI Face Recognition Attendance System...")

    # Verify DB connectivity
    if not check_db_connection():
        logger.error("Database connection failed — check DATABASE_URL in .env")
    else:
        logger.info("Database connection: OK")
        create_tables()

        # Seed default admin user
        db = SessionLocal()
        try:
            from app.services.auth_service import AuthService
            AuthService(db).seed_admin()
        finally:
            db.close()

    yield

    logger.info("Shutting down...")


# ── App factory ───────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "Production-ready REST API for the AI-Based Face Recognition "
            "Attendance Management System built with FastAPI, OpenCV, and MySQL."
        ),
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── CORS ──────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Exception handlers ────────────────────────────────────────
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail, "status_code": exc.status_code},
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled exception on {request.method} {request.url}: {exc}")
        return JSONResponse(
            status_code=500,
            content={"detail": "An unexpected error occurred", "status_code": 500},
        )

    # ── Routers ───────────────────────────────────────────────────
    prefix = "/api"
    app.include_router(auth.router,             prefix=prefix)
    app.include_router(students.router,         prefix=prefix)
    app.include_router(faculty.router,          prefix=prefix)
    app.include_router(departments.router,      prefix=prefix)
    app.include_router(subjects.router,         prefix=prefix)
    app.include_router(attendance.router,       prefix=prefix)
    app.include_router(face_recognition.router, prefix=prefix)
    app.include_router(dashboard.router,        prefix=prefix)
    app.include_router(reports.router,          prefix=prefix)

    # ── Health check ──────────────────────────────────────────────
    @app.get("/health", tags=["Health"])
    def health_check():
        return {
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "db": check_db_connection(),
        }

    @app.get("/", tags=["Root"])
    def root():
        return {
            "message": f"Welcome to {settings.APP_NAME}",
            "docs": "/docs",
            "version": settings.APP_VERSION,
        }

    return app


app = create_app()


# ── Dev entry point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
