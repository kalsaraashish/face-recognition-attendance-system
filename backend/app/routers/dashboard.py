"""
Dashboard router — returns analytics based on the caller's role.
GET /api/dashboard/admin    → AdminDashboard
GET /api/dashboard/faculty  → FacultyDashboard
GET /api/dashboard/student  → StudentDashboard
GET /api/dashboard/me       → auto-selects based on JWT role
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_admin,
    require_admin_or_faculty,
    require_student,
)
from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.faculty import Faculty
from app.models.student import Student
from app.models.user import User, UserRole
from app.schemas.dashboard import AdminDashboard, FacultyDashboard, StudentDashboard
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/admin", response_model=AdminDashboard, summary="Admin dashboard analytics")
def admin_dashboard(
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return DashboardService(db).get_admin_dashboard()


@router.get("/faculty", response_model=FacultyDashboard, summary="Faculty dashboard analytics")
def faculty_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_faculty),
):
    # Admins may pass faculty_id via query; faculty resolved from their profile
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise NotFoundError("Faculty profile for current user")
    return DashboardService(db).get_faculty_dashboard(faculty.id)


@router.get("/student", response_model=StudentDashboard, summary="Student dashboard analytics")
def student_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    student = db.query(Student).filter(Student.email == current_user.email).first()
    if not student:
        raise NotFoundError("Student profile for current user")
    return DashboardService(db).get_student_dashboard(student.id)


@router.get("/me", summary="Dashboard auto-selected by role")
def my_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns the appropriate dashboard payload based on the authenticated user's role."""
    svc = DashboardService(db)
    if current_user.role == UserRole.ADMIN:
        return svc.get_admin_dashboard()
    if current_user.role == UserRole.FACULTY:
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if not faculty:
            raise NotFoundError("Faculty profile")
        return svc.get_faculty_dashboard(faculty.id)
    if current_user.role == UserRole.STUDENT:
        student = db.query(Student).filter(Student.email == current_user.email).first()
        if not student:
            raise NotFoundError("Student profile")
        return svc.get_student_dashboard(student.id)
    raise ForbiddenError("Unknown role")
