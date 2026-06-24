"""Initial schema — create all tables

Revision ID: 001
Revises:
Create Date: 2024-06-23

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── users ─────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("ADMIN", "FACULTY", "STUDENT", name="userrole"), nullable=False),
        sa.Column("status", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now(),
                  onupdate=sa.func.now()),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── departments ───────────────────────────────────────────────
    op.create_table(
        "departments",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(150), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
    )
    op.create_index("ix_departments_id", "departments", ["id"])

    # ── students ──────────────────────────────────────────────────
    op.create_table(
        "students",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("enrollment_no", sa.String(50), nullable=False, unique=True),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("mobile", sa.String(15), nullable=True),
        sa.Column("department_id", sa.Integer(), sa.ForeignKey("departments.id"), nullable=False),
        sa.Column("semester", sa.Integer(), nullable=False),
        sa.Column("photo_url", sa.String(500), nullable=True),
        sa.Column("status", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_students_id", "students", ["id"])
    op.create_index("ix_students_enrollment_no", "students", ["enrollment_no"], unique=True)

    # ── faculty ───────────────────────────────────────────────────
    op.create_table(
        "faculty",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("faculty_code", sa.String(50), nullable=False, unique=True),
        sa.Column("name", sa.String(150), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("mobile", sa.String(15), nullable=True),
        sa.Column("department_id", sa.Integer(), sa.ForeignKey("departments.id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True, unique=True),
        sa.Column("status", sa.Boolean(), nullable=False, server_default=sa.text("1")),
    )
    op.create_index("ix_faculty_id", "faculty", ["id"])
    op.create_index("ix_faculty_faculty_code", "faculty", ["faculty_code"], unique=True)

    # ── subjects ──────────────────────────────────────────────────
    op.create_table(
        "subjects",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("subject_code", sa.String(50), nullable=False, unique=True),
        sa.Column("subject_name", sa.String(200), nullable=False),
        sa.Column("department_id", sa.Integer(), sa.ForeignKey("departments.id"), nullable=False),
        sa.Column("semester", sa.Integer(), nullable=False),
    )
    op.create_index("ix_subjects_id", "subjects", ["id"])
    op.create_index("ix_subjects_subject_code", "subjects", ["subject_code"], unique=True)

    # ── face_encodings ────────────────────────────────────────────
    op.create_table(
        "face_encodings",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("student_id", sa.Integer(),
                  sa.ForeignKey("students.id", ondelete="CASCADE"), nullable=False),
        sa.Column("encoding_data", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_face_encodings_id", "face_encodings", ["id"])
    op.create_index("ix_face_encodings_student_id", "face_encodings", ["student_id"])

    # ── attendance_sessions ───────────────────────────────────────
    op.create_table(
        "attendance_sessions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("faculty_id", sa.Integer(), sa.ForeignKey("faculty.id"), nullable=False),
        sa.Column("department_id", sa.Integer(), sa.ForeignKey("departments.id"), nullable=False),
        sa.Column("semester", sa.Integer(), nullable=False),
        sa.Column("subject_id", sa.Integer(), sa.ForeignKey("subjects.id"), nullable=False),
        sa.Column("session_date", sa.Date(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=True),
        sa.Column("end_time", sa.Time(), nullable=True),
    )
    op.create_index("ix_attendance_sessions_id", "attendance_sessions", ["id"])
    op.create_index("ix_attendance_sessions_faculty_id", "attendance_sessions", ["faculty_id"])
    op.create_index("ix_attendance_sessions_department_id", "attendance_sessions", ["department_id"])
    op.create_index("ix_attendance_sessions_subject_id", "attendance_sessions", ["subject_id"])

    # ── attendance_records ────────────────────────────────────────
    op.create_table(
        "attendance_records",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("session_id", sa.Integer(),
                  sa.ForeignKey("attendance_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id"), nullable=False),
        sa.Column("status", sa.Enum("PRESENT", "ABSENT", name="attendancestatus"),
                  nullable=False, server_default="ABSENT"),
        sa.Column("marked_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_attendance_records_id", "attendance_records", ["id"])
    op.create_index("ix_attendance_records_session_id", "attendance_records", ["session_id"])
    op.create_index("ix_attendance_records_student_id", "attendance_records", ["student_id"])


def downgrade() -> None:
    op.drop_table("attendance_records")
    op.drop_table("attendance_sessions")
    op.drop_table("face_encodings")
    op.drop_table("subjects")
    op.drop_table("faculty")
    op.drop_table("students")
    op.drop_table("departments")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS attendancestatus")
    op.execute("DROP TYPE IF EXISTS userrole")
