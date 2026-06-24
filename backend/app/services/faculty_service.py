"""
Faculty service — CRUD with auto-creation of linked User account.
"""
import math
from typing import Optional

from loguru import logger
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import ConflictError, NotFoundError
from app.core.security import hash_password
from app.models.faculty import Faculty
from app.models.user import User, UserRole
from app.schemas.faculty import FacultyCreate, FacultyListResponse, FacultyOut, FacultyUpdate


class FacultyService:
    def __init__(self, db: Session):
        self.db = db

    def _query_with_dept(self):
        return self.db.query(Faculty).options(joinedload(Faculty.department))

    # ── Create ────────────────────────────────────────────────────
    def create_faculty(self, payload: FacultyCreate) -> FacultyOut:
        if self.db.query(Faculty).filter(Faculty.faculty_code == payload.faculty_code).first():
            raise ConflictError(f"Faculty code '{payload.faculty_code}' already exists")
        if self.db.query(Faculty).filter(Faculty.email == payload.email).first():
            raise ConflictError(f"Email '{payload.email}' already registered")

        # Create linked user account
        user = User(
            name=payload.name,
            email=payload.email,
            password_hash=hash_password(payload.password),
            role=UserRole.FACULTY,
            status=True,
        )
        self.db.add(user)
        self.db.flush()  # get user.id without committing

        faculty = Faculty(
            faculty_code=payload.faculty_code,
            name=payload.name,
            email=payload.email,
            mobile=payload.mobile,
            department_id=payload.department_id,
            user_id=user.id,
            status=True,
        )
        self.db.add(faculty)
        self.db.commit()
        self.db.refresh(faculty)
        logger.info(f"Faculty created: {faculty.faculty_code}")
        return FacultyOut.model_validate(faculty)

    # ── Read One ──────────────────────────────────────────────────
    def get_faculty(self, faculty_id: int) -> FacultyOut:
        faculty = (
            self._query_with_dept()
            .filter(Faculty.id == faculty_id)
            .first()
        )
        if not faculty:
            raise NotFoundError("Faculty")
        return FacultyOut.model_validate(faculty)

    # ── List ──────────────────────────────────────────────────────
    def list_faculty(
        self,
        page: int = 1,
        per_page: int = 20,
        department_id: Optional[int] = None,
        status: Optional[bool] = None,
    ) -> FacultyListResponse:
        query = self._query_with_dept()
        if department_id:
            query = query.filter(Faculty.department_id == department_id)
        if status is not None:
            query = query.filter(Faculty.status == status)

        total = query.count()
        total_pages = math.ceil(total / per_page) if total else 1
        faculties = query.offset((page - 1) * per_page).limit(per_page).all()

        return FacultyListResponse(
            faculties=[FacultyOut.model_validate(f) for f in faculties],
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages,
        )

    # ── Update ────────────────────────────────────────────────────
    def update_faculty(self, faculty_id: int, payload: FacultyUpdate) -> FacultyOut:
        faculty = self.db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            raise NotFoundError("Faculty")

        updates = payload.model_dump(exclude_unset=True)
        if "email" in updates and updates["email"] != faculty.email:
            if self.db.query(Faculty).filter(Faculty.email == updates["email"]).first():
                raise ConflictError("Email already in use")

        for field, value in updates.items():
            setattr(faculty, field, value)

        # Sync user record
        if faculty.user_id:
            user = self.db.query(User).filter(User.id == faculty.user_id).first()
            if user:
                if "name" in updates:
                    user.name = updates["name"]
                if "email" in updates:
                    user.email = updates["email"]
                if "status" in updates:
                    user.status = updates["status"]

        self.db.commit()
        self.db.refresh(faculty)
        logger.info(f"Faculty updated: id={faculty_id}")
        return FacultyOut.model_validate(faculty)

    # ── Delete ────────────────────────────────────────────────────
    def delete_faculty(self, faculty_id: int) -> dict:
        faculty = self.db.query(Faculty).filter(Faculty.id == faculty_id).first()
        if not faculty:
            raise NotFoundError("Faculty")

        # Deactivate linked user instead of hard delete
        if faculty.user_id:
            user = self.db.query(User).filter(User.id == faculty.user_id).first()
            if user:
                user.status = False

        self.db.delete(faculty)
        self.db.commit()
        logger.info(f"Faculty deleted: id={faculty_id}")
        return {"message": f"Faculty {faculty_id} deleted successfully"}
