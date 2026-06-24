"""Pydantic schemas for dashboard analytics responses."""
from pydantic import BaseModel


class WeeklyAttendanceDay(BaseModel):
    name: str
    attendance: float


class RecentActivity(BaseModel):
    id: int
    action: str
    target: str
    time: str
    type: str


class AdminDashboard(BaseModel):
    total_students: int
    total_faculty: int
    total_departments: int
    total_subjects: int
    today_attendance_count: int
    today_sessions_count: int
    overall_attendance_percentage: float
    active_students: int
    active_faculty: int
    weekly_attendance: list[WeeklyAttendanceDay]
    recent_activities: list[RecentActivity]


class FacultyDashboard(BaseModel):
    today_sessions: int
    total_sessions: int
    students_present_today: int
    students_absent_today: int
    today_attendance_percentage: float


class StudentDashboard(BaseModel):
    student_id: int
    full_name: str
    enrollment_no: str
    attendance_percentage: float
    present_days: int
    absent_days: int
    total_sessions: int
