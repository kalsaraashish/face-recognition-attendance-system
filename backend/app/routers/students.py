"""
Students router — CRUD + search with pagination.
Admin only for write operations; faculty can read.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin, require_admin_or_faculty
from app.schemas.student import StudentCreate, StudentListResponse, StudentOut, StudentUpdate
from app.services.student_service import StudentService

router = APIRouter(prefix="/students", tags=["Students"])


@router.post("", response_model=StudentOut, status_code=201, summary="Create student (Admin)")
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return StudentService(db).create_student(payload)


@router.get("", response_model=StudentListResponse, summary="List students with filters")
def list_students(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by name, enrollment or email"),
    department_id: Optional[int] = Query(None),
    semester: Optional[int] = Query(None, ge=1, le=8),
    status: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    return StudentService(db).list_students(
        page=page,
        per_page=per_page,
        search=search,
        department_id=department_id,
        semester=semester,
        status=status,
    )


@router.get("/search", response_model=StudentListResponse, summary="Search students")
def search_students(
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    department_id: Optional[int] = Query(None),
    semester: Optional[int] = Query(None, ge=1, le=8),
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    return StudentService(db).list_students(
        page=page,
        per_page=per_page,
        search=q,
        department_id=department_id,
        semester=semester,
    )


@router.get("/{student_id}", response_model=StudentOut, summary="Get student by ID")
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    return StudentService(db).get_student(student_id)


@router.put("/{student_id}", response_model=StudentOut, summary="Update student (Admin)")
def update_student(
    student_id: int,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return StudentService(db).update_student(student_id, payload)


@router.delete("/{student_id}", summary="Delete student (Admin)")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return StudentService(db).delete_student(student_id)
