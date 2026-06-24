"""
Attendance service — session CRUD, mark attendance, summaries, reports.
"""
from datetime import date
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import BadRequestError, ConflictError, NotFoundError
from app.models.attendance_record import AttendanceRecord, AttendanceStatus
from app.models.attendance_session import AttendanceSession
from app.models.faculty import Faculty
from app.models.student import Student
from app.models.subject import Subject
from app.schemas.attendance import (
    AttendanceRecordOut,
    MarkAttendanceRequest,
    SessionCreate,
    SessionOut,
    StudentAttendanceSummary,
)


class AttendanceService:
    def __init__(self, db: Session):
        self.db = db

    # ── Sessions ──────────────────────────────────────────────────
    def create_session(self, faculty_id: int, payload: SessionCreate) -> SessionOut:
        # Validate subject belongs to department & semester
        subject = self.db.query(Subject).filter(Subject.id == payload.subject_id).first()
        if not subject:
            raise NotFoundError("Subject")
        if subject.department_id != payload.department_id:
            raise BadRequestError("Subject does not belong to the selected department")

        session = AttendanceSession(
            faculty_id=faculty_id,
            department_id=payload.department_id,
            semester=payload.semester,
            subject_id=payload.subject_id,
            session_date=payload.session_date,
            start_time=payload.start_time,
            end_time=payload.end_time,
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        logger.info(f"Attendance session created: id={session.id} faculty={faculty_id}")
        return SessionOut.model_validate(session)

    def get_session(self, session_id: int) -> SessionOut:
        session = (
            self.db.query(AttendanceSession)
            .filter(AttendanceSession.id == session_id)
            .first()
        )
        if not session:
            raise NotFoundError("Attendance session")
        return SessionOut.model_validate(session)

    def list_sessions(
        self,
        faculty_id: Optional[int] = None,
        department_id: Optional[int] = None,
        session_date: Optional[date] = None,
        page: int = 1,
        per_page: int = 20,
    ) -> dict:
        import math

        query = self.db.query(AttendanceSession)
        if faculty_id:
            query = query.filter(AttendanceSession.faculty_id == faculty_id)
        if department_id:
            query = query.filter(AttendanceSession.department_id == department_id)
        if session_date:
            query = query.filter(AttendanceSession.session_date == session_date)

        total = query.count()
        sessions = (
            query.order_by(AttendanceSession.session_date.desc())
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        return {
            "sessions": [SessionOut.model_validate(s) for s in sessions],
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": math.ceil(total / per_page) if total else 1,
        }

    # ── Mark Attendance ───────────────────────────────────────────
    def mark_attendance(self, payload: MarkAttendanceRequest) -> AttendanceRecordOut:
        session = (
            self.db.query(AttendanceSession)
            .filter(AttendanceSession.id == payload.session_id)
            .first()
        )
        if not session:
            raise NotFoundError("Attendance session")

        student = self.db.query(Student).filter(Student.id == payload.student_id).first()
        if not student:
            raise NotFoundError("Student")

        # Prevent duplicate
        existing = (
            self.db.query(AttendanceRecord)
            .filter(
                AttendanceRecord.session_id == payload.session_id,
                AttendanceRecord.student_id == payload.student_id,
            )
            .first()
        )
        if existing:
            raise ConflictError(
                f"Attendance already marked for student {payload.student_id} in session {payload.session_id}"
            )

        record = AttendanceRecord(
            session_id=payload.session_id,
            student_id=payload.student_id,
            status=payload.status,
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)

        out = AttendanceRecordOut.model_validate(record)
        out.student_name = student.full_name
        out.enrollment_no = student.enrollment_no
        logger.info(f"Attendance marked: session={payload.session_id} student={payload.student_id} status={payload.status}")
        return out

    def mark_attendance_by_recognition(self, session_id: int, student_id: int) -> AttendanceRecordOut:
        """Called after face recognition resolves the student."""
        return self.mark_attendance(
            MarkAttendanceRequest(
                session_id=session_id,
                student_id=student_id,
                status=AttendanceStatus.PRESENT,
            )
        )

    # ── Attendance Records ────────────────────────────────────────
    def get_session_records(self, session_id: int) -> list[AttendanceRecordOut]:
        if not self.db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first():
            raise NotFoundError("Attendance session")

        records = (
            self.db.query(AttendanceRecord)
            .options(joinedload(AttendanceRecord.student))
            .filter(AttendanceRecord.session_id == session_id)
            .all()
        )
        result = []
        for r in records:
            out = AttendanceRecordOut.model_validate(r)
            out.student_name = r.student.full_name if r.student else None
            out.enrollment_no = r.student.enrollment_no if r.student else None
            result.append(out)
        return result

    # ── Student Summary ───────────────────────────────────────────
    def get_student_summary(
        self,
        student_id: int,
        subject_id: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> StudentAttendanceSummary:
        student = self.db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise NotFoundError("Student")

        query = (
            self.db.query(AttendanceRecord)
            .join(AttendanceRecord.session)
            .filter(AttendanceRecord.student_id == student_id)
        )
        if subject_id:
            query = query.filter(AttendanceSession.subject_id == subject_id)
        if date_from:
            query = query.filter(AttendanceSession.session_date >= date_from)
        if date_to:
            query = query.filter(AttendanceSession.session_date <= date_to)

        records = query.all()
        total = len(records)
        present = sum(1 for r in records if r.status == AttendanceStatus.PRESENT)
        absent = total - present
        pct = round((present / total * 100), 2) if total else 0.0

        return StudentAttendanceSummary(
            student_id=student.id,
            enrollment_no=student.enrollment_no,
            student_name=student.full_name,
            total_sessions=total,
            present_count=present,
            absent_count=absent,
            attendance_percentage=pct,
        )

    # ── Department Report ─────────────────────────────────────────
    def get_department_report(
        self,
        department_id: int,
        semester: Optional[int] = None,
        subject_id: Optional[int] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
    ) -> list[StudentAttendanceSummary]:
        students = (
            self.db.query(Student)
            .filter(Student.department_id == department_id)
        )
        if semester:
            students = students.filter(Student.semester == semester)

        summaries = []
        for student in students.all():
            summary = self.get_student_summary(
                student.id, subject_id=subject_id, date_from=date_from, date_to=date_to
            )
            summaries.append(summary)
        return summaries
