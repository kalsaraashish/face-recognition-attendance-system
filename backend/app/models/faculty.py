"""Faculty ORM model."""
from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Faculty(Base):
    __tablename__ = "faculty"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    faculty_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    mobile: Mapped[str | None] = mapped_column(String(15), nullable=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=False)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True, unique=True)
    status: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # ── Relationships ─────────────────────────────────────────────
    department: Mapped["Department"] = relationship(  # noqa: F821
        "Department", back_populates="faculties"
    )
    user: Mapped["User"] = relationship(  # noqa: F821
        "User", back_populates="faculty_profile"
    )
    attendance_sessions: Mapped[list["AttendanceSession"]] = relationship(  # noqa: F821
        "AttendanceSession", back_populates="faculty"
    )
    face_encodings: Mapped[list["FaceEncoding"]] = relationship(  # noqa: F821
        "FaceEncoding", back_populates="faculty", cascade="all, delete-orphan"
    )
    attendance_records: Mapped[list["FacultyAttendance"]] = relationship(  # noqa: F821
        "FacultyAttendance", back_populates="faculty", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Faculty id={self.id} code={self.faculty_code!r}>"
