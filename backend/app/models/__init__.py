"""
Import all models here so that SQLAlchemy's metadata and Alembic can
discover every table when running migrations.
"""
from app.models.user import User, UserRole  # noqa: F401
from app.models.department import Department  # noqa: F401
from app.models.student import Student  # noqa: F401
from app.models.faculty import Faculty  # noqa: F401
from app.models.subject import Subject  # noqa: F401
from app.models.face_encoding import FaceEncoding  # noqa: F401
from app.models.attendance_session import AttendanceSession  # noqa: F401
from app.models.attendance_record import AttendanceRecord, AttendanceStatus  # noqa: F401
