"""Faculty router — full CRUD, Admin only for mutations."""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin, require_admin_or_faculty
from app.schemas.faculty import FacultyCreate, FacultyListResponse, FacultyOut, FacultyUpdate
from app.services.faculty_service import FacultyService

router = APIRouter(prefix="/faculty", tags=["Faculty"])


@router.post("", response_model=FacultyOut, status_code=201, summary="Create faculty member (Admin)")
def create_faculty(
    payload: FacultyCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return FacultyService(db).create_faculty(payload)


@router.get("", response_model=FacultyListResponse, summary="List faculty")
def list_faculty(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    department_id: Optional[int] = Query(None),
    status: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    return FacultyService(db).list_faculty(
        page=page, per_page=per_page, department_id=department_id, status=status
    )


@router.get("/{faculty_id}", response_model=FacultyOut, summary="Get faculty by ID")
def get_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    return FacultyService(db).get_faculty(faculty_id)


@router.put("/{faculty_id}", response_model=FacultyOut, summary="Update faculty (Admin)")
def update_faculty(
    faculty_id: int,
    payload: FacultyUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return FacultyService(db).update_faculty(faculty_id, payload)


@router.delete("/{faculty_id}", summary="Delete faculty (Admin)")
def delete_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    return FacultyService(db).delete_faculty(faculty_id)
