"""AttendanceSession ORM model — one session per class per day."""
from datetime import date, time

from sqlalchemy import Date, ForeignKey, Integer, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    faculty_id: Mapped[int] = mapped_column(ForeignKey("faculty.id"), nullable=False, index=True)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=False, index=True)
    semester: Mapped[int] = mapped_column(Integer, nullable=False)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id"), nullable=False, index=True)
    session_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    end_time: Mapped[time | None] = mapped_column(Time, nullable=True)

    # ── Relationships ─────────────────────────────────────────────
    faculty: Mapped["Faculty"] = relationship(  # noqa: F821
        "Faculty", back_populates="attendance_sessions"
    )
    department: Mapped["Department"] = relationship(  # noqa: F821
        "Department", back_populates="attendance_sessions"
    )
    subject: Mapped["Subject"] = relationship(  # noqa: F821
        "Subject", back_populates="attendance_sessions"
    )
    records: Mapped[list["AttendanceRecord"]] = relationship(  # noqa: F821
        "AttendanceRecord", back_populates="session", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<AttendanceSession id={self.id} date={self.session_date}>"
