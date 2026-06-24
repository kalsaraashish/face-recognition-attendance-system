"""Pydantic schemas for Attendance Session, Records, and Face Recognition."""
from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, Field

from app.models.attendance_record import AttendanceStatus


# ── Session ───────────────────────────────────────────────────────────────────
class SessionCreate(BaseModel):
    department_id: int
    semester: int = Field(..., ge=1, le=8)
    subject_id: int
    session_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "department_id": 1,
                "semester": 3,
                "subject_id": 2,
                "session_date": "2024-06-23",
                "start_time": "10:00:00",
                "end_time": "11:00:00",
            }
        }
    }


class SessionOut(BaseModel):
    id: int
    faculty_id: int
    department_id: int
    semester: int
    subject_id: int
    session_date: date
    start_time: Optional[time]
    end_time: Optional[time]

    model_config = {"from_attributes": True}


# ── Mark Attendance ───────────────────────────────────────────────────────────
class MarkAttendanceRequest(BaseModel):
    session_id: int
    student_id: int
    status: AttendanceStatus = AttendanceStatus.PRESENT


class MarkAttendanceByFaceRequest(BaseModel):
    """Used when marking attendance via face recognition endpoint."""
    session_id: int
    # Image is supplied as multipart upload, student_id resolved from recognition


class AttendanceRecordOut(BaseModel):
    id: int
    session_id: int
    student_id: int
    student_name: Optional[str] = None
    enrollment_no: Optional[str] = None
    status: AttendanceStatus
    marked_at: datetime

    model_config = {"from_attributes": True}


# ── Face Recognition Response ─────────────────────────────────────────────────
class RecognitionResult(BaseModel):
    matched: bool
    student_id: Optional[int] = None
    student_name: Optional[str] = None
    enrollment_no: Optional[str] = None
    confidence: Optional[float] = None  # 1 - distance (higher = more confident)


# ── Report filters ────────────────────────────────────────────────────────────
class AttendanceReportFilter(BaseModel):
    department_id: Optional[int] = None
    semester: Optional[int] = None
    subject_id: Optional[int] = None
    student_id: Optional[int] = None
    date_from: Optional[date] = None
    date_to: Optional[date] = None


class StudentAttendanceSummary(BaseModel):
    student_id: int
    enrollment_no: str
    student_name: str
    total_sessions: int
    present_count: int
    absent_count: int
    attendance_percentage: float
