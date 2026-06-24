"""Subject ORM model."""
from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    subject_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    subject_name: Mapped[str] = mapped_column(String(200), nullable=False)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=False)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)

    # ── Relationships ─────────────────────────────────────────────
    department: Mapped["Department"] = relationship(  # noqa: F821
        "Department", back_populates="subjects"
    )
    attendance_sessions: Mapped[list["AttendanceSession"]] = relationship(  # noqa: F821
        "AttendanceSession", back_populates="subject"
    )

    def __repr__(self) -> str:
        return f"<Subject id={self.id} code={self.subject_code!r}>"
