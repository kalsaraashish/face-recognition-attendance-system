"""
Student service — CRUD operations, search, and pagination.
"""
import math
from typing import Optional

from loguru import logger
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import ConflictError, NotFoundError
from app.models.student import Student
from app.models.face_encoding import FaceEncoding
from app.schemas.student import StudentCreate, StudentListResponse, StudentOut, StudentUpdate


class StudentService:
    def __init__(self, db: Session):
        self.db = db

    def _query_with_dept(self):
        return self.db.query(Student).options(joinedload(Student.department))

    def _to_out(self, student: Student) -> StudentOut:
        has_face = self.db.query(FaceEncoding).filter(
            FaceEncoding.student_id == student.id
        ).first() is not None
        data = StudentOut.model_validate(student)
        data.has_face_registered = has_face
        return data

    # ── Create ────────────────────────────────────────────────────
    def create_student(self, payload: StudentCreate) -> StudentOut:
        if self.db.query(Student).filter(Student.enrollment_no == payload.enrollment_no).first():
            raise ConflictError(f"Enrollment number '{payload.enrollment_no}' already exists")
        if self.db.query(Student).filter(Student.email == payload.email).first():
            raise ConflictError(f"Email '{payload.email}' already registered")

        student = Student(**payload.model_dump())
        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)
        logger.info(f"Student created: {student.enrollment_no}")
        return self._to_out(student)

    # ── Read One ──────────────────────────────────────────────────
    def get_student(self, student_id: int) -> StudentOut:
        student = (
            self._query_with_dept()
            .filter(Student.id == student_id)
            .first()
        )
        if not student:
            raise NotFoundError("Student")
        return self._to_out(student)

    # ── List with pagination, search, filter ──────────────────────
    def list_students(
        self,
        page: int = 1,
        per_page: int = 20,
        search: Optional[str] = None,
        department_id: Optional[int] = None,
        semester: Optional[int] = None,
        status: Optional[bool] = None,
    ) -> StudentListResponse:
        query = self._query_with_dept()

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    Student.first_name.ilike(like),
                    Student.last_name.ilike(like),
                    Student.enrollment_no.ilike(like),
                    Student.email.ilike(like),
                )
            )
        if department_id:
            query = query.filter(Student.department_id == department_id)
        if semester:
            query = query.filter(Student.semester == semester)
        if status is not None:
            query = query.filter(Student.status == status)

        total = query.count()
        total_pages = math.ceil(total / per_page) if total else 1
        students = query.offset((page - 1) * per_page).limit(per_page).all()

        return StudentListResponse(
            students=[self._to_out(s) for s in students],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        )

    # ── Update ────────────────────────────────────────────────────
    def update_student(self, student_id: int, payload: StudentUpdate) -> StudentOut:
        student = self.db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise NotFoundError("Student")

        updates = payload.model_dump(exclude_unset=True)
        if "email" in updates and updates["email"] != student.email:
            if self.db.query(Student).filter(Student.email == updates["email"]).first():
                raise ConflictError("Email already in use by another student")

        for field, value in updates.items():
            setattr(student, field, value)

        self.db.commit()
        self.db.refresh(student)
        logger.info(f"Student updated: id={student_id}")
        return self._to_out(student)

    # ── Delete ────────────────────────────────────────────────────
    def delete_student(self, student_id: int) -> dict:
        student = self.db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise NotFoundError("Student")
        self.db.delete(student)
        self.db.commit()
        logger.info(f"Student deleted: id={student_id}")
        return {"message": f"Student {student_id} deleted successfully"}

    # ── Update photo ──────────────────────────────────────────────
    def update_photo(self, student_id: int, photo_url: str) -> StudentOut:
        student = self.db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise NotFoundError("Student")
        student.photo_url = photo_url
        self.db.commit()
        self.db.refresh(student)
        return self._to_out(student)
