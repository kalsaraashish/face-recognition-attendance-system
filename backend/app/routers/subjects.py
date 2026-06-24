"""Subjects router — full CRUD."""
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.dependencies import require_admin, require_any_role
from app.core.exceptions import ConflictError, NotFoundError
from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectOut, SubjectUpdate

router = APIRouter(prefix="/subjects", tags=["Subjects"])


def _get_or_404(db: Session, subject_id: int) -> Subject:
    s = (
        db.query(Subject)
        .options(joinedload(Subject.department))
        .filter(Subject.id == subject_id)
        .first()
    )
    if not s:
        raise NotFoundError("Subject")
    return s


@router.post("", response_model=SubjectOut, status_code=201, summary="Create subject (Admin)")
def create_subject(
    payload: SubjectCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    if db.query(Subject).filter(Subject.subject_code == payload.subject_code).first():
        raise ConflictError(f"Subject code '{payload.subject_code}' already exists")
    subject = Subject(**payload.model_dump())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return SubjectOut.model_validate(subject)


@router.get("", response_model=list[SubjectOut], summary="List subjects")
def list_subjects(
    department_id: Optional[int] = Query(None),
    semester: Optional[int] = Query(None, ge=1, le=8),
    db: Session = Depends(get_db),
    _=Depends(require_any_role),
):
    query = db.query(Subject).options(joinedload(Subject.department))
    if department_id:
        query = query.filter(Subject.department_id == department_id)
    if semester:
        query = query.filter(Subject.semester == semester)
    return [SubjectOut.model_validate(s) for s in query.all()]


@router.get("/{subject_id}", response_model=SubjectOut, summary="Get subject by ID")
def get_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_any_role),
):
    return SubjectOut.model_validate(_get_or_404(db, subject_id))


@router.put("/{subject_id}", response_model=SubjectOut, summary="Update subject (Admin)")
def update_subject(
    subject_id: int,
    payload: SubjectUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    subject = _get_or_404(db, subject_id)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(subject, k, v)
    db.commit()
    db.refresh(subject)
    return SubjectOut.model_validate(subject)


@router.delete("/{subject_id}", summary="Delete subject (Admin)")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    subject = _get_or_404(db, subject_id)
    db.delete(subject)
    db.commit()
    return {"message": f"Subject {subject_id} deleted"}
