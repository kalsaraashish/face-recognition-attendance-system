"""FacultyAttendance ORM model — daily attendance logs for faculty."""
from datetime import date, datetime
from sqlalchemy import Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FacultyAttendance(Base):
    __tablename__ = "faculty_attendance"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    faculty_id: Mapped[int] = mapped_column(
        ForeignKey("faculty.id", ondelete="CASCADE"), nullable=False, index=True
    )
    attendance_date: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    marked_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PRESENT")

    # ── Relationships ─────────────────────────────────────────────
    faculty: Mapped["Faculty"] = relationship(  # noqa: F821
        "Faculty", back_populates="attendance_records"
    )

    def __repr__(self) -> str:
        return f"<FacultyAttendance id={self.id} faculty_id={self.faculty_id} date={self.attendance_date}>"
