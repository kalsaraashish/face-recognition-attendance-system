"""Department ORM model."""
from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Relationships ─────────────────────────────────────────────
    students: Mapped[list["Student"]] = relationship(  # noqa: F821
        "Student", back_populates="department"
    )
    faculties: Mapped[list["Faculty"]] = relationship(  # noqa: F821
        "Faculty", back_populates="department"
    )
    subjects: Mapped[list["Subject"]] = relationship(  # noqa: F821
        "Subject", back_populates="department"
    )
    attendance_sessions: Mapped[list["AttendanceSession"]] = relationship(  # noqa: F821
        "AttendanceSession", back_populates="department"
    )

    def __repr__(self) -> str:
        return f"<Department id={self.id} name={self.name!r}>"
