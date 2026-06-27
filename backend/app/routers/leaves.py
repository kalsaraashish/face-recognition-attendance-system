"""Leaves router."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin_or_faculty, require_student
from app.models.user import User
from app.models.student import Student as StudentModel
from app.schemas.leave_request import LeaveRequestCreate, LeaveRequestOut, LeaveRequestReview
from app.services.leave_service import LeaveService
from app.core.exceptions import NotFoundError

router = APIRouter(prefix="/leaves", tags=["Leaves"])


@router.post("", response_model=LeaveRequestOut, summary="Submit a leave request (Student)")
def apply_leave(
    payload: LeaveRequestCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student = db.query(StudentModel).filter(StudentModel.email == current_user.email).first()
    if not student:
        raise NotFoundError("Student profile not found")
    return LeaveService(db).apply_leave(student.id, payload)


@router.get("/my", response_model=list[LeaveRequestOut], summary="List my leave requests (Student)")
def list_my_leaves(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    student = db.query(StudentModel).filter(StudentModel.email == current_user.email).first()
    if not student:
        raise NotFoundError("Student profile not found")
    return LeaveService(db).list_student_leaves(student.id)


@router.get("", response_model=list[LeaveRequestOut], summary="List all leave requests (Admin/Faculty)")
def list_all_leaves(
    _=Depends(require_admin_or_faculty),
    db: Session = Depends(get_db),
):
    return LeaveService(db).list_all_leaves()


@router.post("/{leave_id}/review", response_model=LeaveRequestOut, summary="Approve/Reject leave request (Admin/Faculty)")
def review_leave(
    leave_id: int,
    payload: LeaveRequestReview,
    current_user: User = Depends(require_admin_or_faculty),
    db: Session = Depends(get_db),
):
    return LeaveService(db).review_leave(leave_id, current_user.id, payload)
