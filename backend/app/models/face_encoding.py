"""FaceEncoding ORM model — stores face embeddings as JSON."""
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FaceEncoding(Base):
    __tablename__ = "face_encodings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    student_id: Mapped[int | None] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"), nullable=True, index=True
    )
    faculty_id: Mapped[int | None] = mapped_column(
        ForeignKey("faculty.id", ondelete="CASCADE"), nullable=True, index=True
    )
    # 128-dimensional face embedding serialised as JSON list of floats
    encoding_data: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # ── Relationships ─────────────────────────────────────────────
    student: Mapped["Student | None"] = relationship(  # noqa: F821
        "Student", back_populates="face_encodings"
    )
    faculty: Mapped["Faculty | None"] = relationship(  # noqa: F821
        "Faculty", back_populates="face_encodings"
    )

    def __repr__(self) -> str:
        return f"<FaceEncoding id={self.id} student_id={self.student_id} faculty_id={self.faculty_id}>"
