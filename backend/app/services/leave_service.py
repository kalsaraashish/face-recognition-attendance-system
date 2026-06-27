"""Leave Request service."""
from datetime import datetime
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import BadRequestError, NotFoundError
from app.models.leave_request import LeaveRequest, LeaveStatus
from app.models.student import Student
from app.models.user import User
from app.schemas.leave_request import LeaveRequestCreate, LeaveRequestOut, LeaveRequestReview


class LeaveService:
    def __init__(self, db: Session):
        self.db = db

    def apply_leave(self, student_id: int, payload: LeaveRequestCreate) -> LeaveRequestOut:
        if payload.start_date > payload.end_date:
            raise BadRequestError("Start date cannot be after end date")
            
        leave = LeaveRequest(
            student_id=student_id,
            start_date=payload.start_date,
            end_date=payload.end_date,
            reason=payload.reason,
            status=LeaveStatus.PENDING
        )
        self.db.add(leave)
        self.db.commit()
        self.db.refresh(leave)
        
        # Load relationships for the return schema
        leave = (
            self.db.query(LeaveRequest)
            .options(
                joinedload(LeaveRequest.student),
                joinedload(LeaveRequest.reviewer)
            )
            .filter(LeaveRequest.id == leave.id)
            .first()
        )
        return LeaveRequestOut.model_validate(leave)

    def list_student_leaves(self, student_id: int) -> list[LeaveRequestOut]:
        leaves = (
            self.db.query(LeaveRequest)
            .options(
                joinedload(LeaveRequest.student),
                joinedload(LeaveRequest.reviewer)
            )
            .filter(LeaveRequest.student_id == student_id)
            .order_by(LeaveRequest.applied_at.desc())
            .all()
        )
        return [LeaveRequestOut.model_validate(l) for l in leaves]

    def list_all_leaves(self) -> list[LeaveRequestOut]:
        leaves = (
            self.db.query(LeaveRequest)
            .options(
                joinedload(LeaveRequest.student),
                joinedload(LeaveRequest.reviewer)
            )
            .order_by(
                LeaveRequest.status == LeaveStatus.PENDING,
                LeaveRequest.applied_at.desc()
            )
            .all()
        )
        # SQLAlchemy boolean sort pending first
        # True is sorted after False, so to get PENDING (status == PENDING -> True) first, we sort desc
        # However, it's safer to just sort python-side or do two queries, or just standard sort.
        # Let's do python sorting or database ordering:
        # Since LeaveStatus.PENDING is a string, let's sort with case:
        # CASE WHEN status = 'PENDING' THEN 0 ELSE 1 END
        # This is more cross-database compatible:
        from sqlalchemy import case
        leaves = (
            self.db.query(LeaveRequest)
            .options(
                joinedload(LeaveRequest.student),
                joinedload(LeaveRequest.reviewer)
            )
            .order_by(
                case(
                    (LeaveRequest.status == LeaveStatus.PENDING, 0),
                    else_=1
                ),
                LeaveRequest.applied_at.desc()
            )
            .all()
        )
        return [LeaveRequestOut.model_validate(l) for l in leaves]

    def review_leave(self, leave_id: int, reviewer_id: int, payload: LeaveRequestReview) -> LeaveRequestOut:
        leave = self.db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
        if not leave:
            raise NotFoundError("Leave request not found")
            
        if leave.status != LeaveStatus.PENDING:
            raise BadRequestError("This leave request has already been reviewed")
            
        leave.status = payload.status
        leave.reviewed_at = datetime.now()
        leave.reviewed_by = reviewer_id
        
        self.db.commit()
        self.db.refresh(leave)
        
        # Load relations for the output schema
        leave = (
            self.db.query(LeaveRequest)
            .options(
                joinedload(LeaveRequest.student),
                joinedload(LeaveRequest.reviewer)
            )
            .filter(LeaveRequest.id == leave_id)
            .first()
        )
        return LeaveRequestOut.model_validate(leave)
