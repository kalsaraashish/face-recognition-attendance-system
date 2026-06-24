"""
Attendance router.
POST /api/attendance/session          — create session (Faculty/Admin)
GET  /api/attendance/sessions         — list sessions
GET  /api/attendance/sessions/{id}    — session detail
POST /api/attendance/mark             — mark attendance manually
POST /api/attendance/mark/face        — mark via face recognition
GET  /api/attendance/sessions/{id}/records — records for a session
GET  /api/attendance/student/{id}/summary  — student attendance summary
"""
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_admin_or_faculty,
    require_any_role,
)
from app.models.faculty import Faculty
from app.models.user import User, UserRole
from app.schemas.attendance import (
    AttendanceRecordOut,
    MarkAttendanceRequest,
    RecognitionResult,
    SessionCreate,
    SessionOut,
    StudentAttendanceSummary,
)
from app.services.attendance_service import AttendanceService
from app.services.face_service import FaceService
from app.utils.image_utils import read_upload_bytes, validate_image_upload
from app.core.exceptions import ForbiddenError, NotFoundError

router = APIRouter(prefix="/attendance", tags=["Attendance"])


def _resolve_faculty_id(current_user: User, db: Session) -> int:
    """Resolve the faculty profile ID for the current user."""
    faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
    if not faculty:
        raise NotFoundError("Faculty profile for current user")
    return faculty.id


# ── Sessions ──────────────────────────────────────────────────────────────────
@router.post("/session", response_model=SessionOut, status_code=201, summary="Create attendance session")
def create_session(
    payload: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_faculty),
):
    if current_user.role == UserRole.FACULTY:
        faculty_id = _resolve_faculty_id(current_user, db)
    else:
        # Admin creating on behalf — use faculty_id from payload (via form) or default to 0
        faculty = db.query(Faculty).filter(Faculty.department_id == payload.department_id).first()
        faculty_id = faculty.id if faculty else 1

    return AttendanceService(db).create_session(faculty_id, payload)


@router.get("/sessions", summary="List attendance sessions")
def list_sessions(
    faculty_id: Optional[int] = Query(None),
    department_id: Optional[int] = Query(None),
    session_date: Optional[date] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    return AttendanceService(db).list_sessions(
        faculty_id=faculty_id,
        department_id=department_id,
        session_date=session_date,
        page=page,
        per_page=per_page,
    )


@router.get("/sessions/{session_id}", response_model=SessionOut, summary="Get session by ID")
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    return AttendanceService(db).get_session(session_id)


# ── Mark Attendance ───────────────────────────────────────────────────────────
@router.post("/mark", response_model=AttendanceRecordOut, summary="Mark attendance manually")
def mark_attendance(
    payload: MarkAttendanceRequest,
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    return AttendanceService(db).mark_attendance(payload)


@router.post(
    "/mark/face",
    response_model=AttendanceRecordOut,
    summary="Mark attendance via face recognition",
)
async def mark_by_face(
    session_id: int = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    """
    Upload a face image, recognize the student, then mark them PRESENT
    in the given session. Returns an error if the face is not recognized.
    """
    validate_image_upload(image)
    image_bytes = await read_upload_bytes(image)

    recognition: RecognitionResult = FaceService(db).recognize_face(image_bytes)
    if not recognition.matched or not recognition.student_id:
        from app.core.exceptions import FaceNotRecognizedError
        raise FaceNotRecognizedError("Could not recognize student face")

    return AttendanceService(db).mark_attendance_by_recognition(
        session_id=session_id,
        student_id=recognition.student_id,
    )


# ── Records & Reports ─────────────────────────────────────────────────────────
@router.get(
    "/sessions/{session_id}/records",
    response_model=list[AttendanceRecordOut],
    summary="Get all attendance records for a session",
)
def get_session_records(
    session_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin_or_faculty),
):
    return AttendanceService(db).get_session_records(session_id)


@router.get(
    "/student/{student_id}/summary",
    response_model=StudentAttendanceSummary,
    summary="Get attendance summary for a student",
)
def student_summary(
    student_id: int,
    subject_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Students can only view their own attendance
    if current_user.role == UserRole.STUDENT:
        from app.models.student import Student as StudentModel
        student = db.query(StudentModel).filter(StudentModel.email == current_user.email).first()
        if not student or student.id != student_id:
            raise ForbiddenError("You can only view your own attendance")

    return AttendanceService(db).get_student_summary(
        student_id=student_id,
        subject_id=subject_id,
        date_from=date_from,
        date_to=date_to,
    )


@router.delete("/sessions/{session_id}", summary="Delete attendance session (Admin/Faculty)")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_faculty),
):
    from app.core.exceptions import ForbiddenError, NotFoundError
    from app.models.attendance_session import AttendanceSession
    
    session = db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()
    if not session:
        raise NotFoundError("Attendance Session")
    
    if current_user.role == UserRole.FACULTY:
        faculty = db.query(Faculty).filter(Faculty.user_id == current_user.id).first()
        if not faculty or session.faculty_id != faculty.id:
            raise ForbiddenError("You can only delete your own sessions")
            
    db.delete(session)
    db.commit()
    return {"message": f"Session {session_id} deleted"}

