from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.attendance_record import AttendanceRecord, AttendanceStatus
from app.models.attendance_session import AttendanceSession
from app.models.department import Department
from app.models.faculty import Faculty
from app.models.student import Student
from app.models.subject import Subject
from app.models.user import User
from app.schemas.dashboard import AdminDashboard, FacultyDashboard, StudentDashboard


class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_admin_dashboard(self) -> AdminDashboard:
        today = date.today()

        total_students = self.db.query(Student).count()
        active_students = self.db.query(Student).filter(Student.status == True).count()  # noqa: E712
        total_faculty = self.db.query(Faculty).count()
        active_faculty = self.db.query(Faculty).filter(Faculty.status == True).count()  # noqa: E712
        total_departments = self.db.query(Department).count()
        total_subjects = self.db.query(Subject).count()

        today_sessions = (
            self.db.query(AttendanceSession)
            .filter(AttendanceSession.session_date == today)
            .count()
        )

        today_present = (
            self.db.query(AttendanceRecord)
            .join(AttendanceRecord.session)
            .filter(
                AttendanceSession.session_date == today,
                AttendanceRecord.status == AttendanceStatus.PRESENT,
            )
            .count()
        )

        # Overall attendance percentage
        total_records = self.db.query(AttendanceRecord).count()
        total_present = (
            self.db.query(AttendanceRecord)
            .filter(AttendanceRecord.status == AttendanceStatus.PRESENT)
            .count()
        )
        overall_pct = round((total_present / total_records * 100), 2) if total_records else 0.0

        # --- 1. Compute Weekly Attendance (last 7 days ending today) ---
        days = [today - timedelta(days=i) for i in range(6, -1, -1)]
        weekly_attendance = []
        for d in days:
            day_total = (
                self.db.query(AttendanceRecord)
                .join(AttendanceRecord.session)
                .filter(AttendanceSession.session_date == d)
                .count()
            )
            day_present = (
                self.db.query(AttendanceRecord)
                .join(AttendanceRecord.session)
                .filter(
                    AttendanceSession.session_date == d,
                    AttendanceRecord.status == AttendanceStatus.PRESENT
                )
                .count()
            )
            day_pct = round((day_present / day_total * 100), 2) if day_total else 0.0
            weekly_attendance.append({
                "name": d.strftime("%a"),
                "attendance": day_pct
            })

        # --- 2. Compute Recent Activities ---
        recent_activities = []
        
        def relative_time(dt: datetime) -> str:
            diff = datetime.now() - dt
            seconds = diff.total_seconds()
            if seconds < 0:
                return "just now"
            if seconds < 60:
                return "just now"
            minutes = seconds / 60
            if minutes < 60:
                return f"{int(minutes)} mins ago"
            hours = minutes / 60
            if hours < 24:
                return f"{int(hours)} hour{'s' if int(hours) > 1 else ''} ago"
            days_diff = diff.days
            if days_diff == 1:
                return "yesterday"
            if days_diff < 7:
                return f"{days_diff} days ago"
            return dt.strftime("%d %b %Y")

        # Query recent check-ins
        recent_records = (
            self.db.query(AttendanceRecord)
            .order_by(AttendanceRecord.marked_at.desc())
            .limit(5)
            .all()
        )
        for r in recent_records:
            recent_activities.append({
                "action": f"Marked {r.status.lower().capitalize()}",
                "target": f"{r.student.full_name} ({r.session.subject.subject_code})",
                "time": relative_time(r.marked_at),
                "type": "success" if r.status == AttendanceStatus.PRESENT else "warning",
                "timestamp": r.marked_at
            })

        # Query recent sessions
        recent_sessions = (
            self.db.query(AttendanceSession)
            .order_by(AttendanceSession.id.desc())
            .limit(5)
            .all()
        )
        for s in recent_sessions:
            dt = datetime.combine(s.session_date, s.start_time or time(0, 0))
            recent_activities.append({
                "action": "Session scheduled",
                "target": f"{s.subject.subject_name} ({s.department.name})",
                "time": relative_time(dt),
                "type": "info",
                "timestamp": dt
            })

        # Query recent students
        recent_students = (
            self.db.query(Student)
            .order_by(Student.created_at.desc())
            .limit(5)
            .all()
        )
        for stu in recent_students:
            recent_activities.append({
                "action": "Student registered",
                "target": f"{stu.full_name} ({stu.department.name})",
                "time": relative_time(stu.created_at),
                "type": "info",
                "timestamp": stu.created_at
            })

        # Sort combined activities by timestamp desc
        recent_activities.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Take top 5 and assign sequential IDs
        final_activities = []
        for idx, act in enumerate(recent_activities[:5]):
            final_activities.append({
                "id": idx + 1,
                "action": act["action"],
                "target": act["target"],
                "time": act["time"],
                "type": act["type"]
            })

        return AdminDashboard(
            total_students=total_students,
            total_faculty=total_faculty,
            total_departments=total_departments,
            total_subjects=total_subjects,
            today_attendance_count=today_present,
            today_sessions_count=today_sessions,
            overall_attendance_percentage=overall_pct,
            active_students=active_students,
            active_faculty=active_faculty,
            weekly_attendance=weekly_attendance,
            recent_activities=final_activities
        )

    def get_faculty_dashboard(self, faculty_id: int) -> FacultyDashboard:
        today = date.today()

        today_sessions = (
            self.db.query(AttendanceSession)
            .filter(
                AttendanceSession.faculty_id == faculty_id,
                AttendanceSession.session_date == today,
            )
            .count()
        )
        total_sessions = (
            self.db.query(AttendanceSession)
            .filter(AttendanceSession.faculty_id == faculty_id)
            .count()
        )

        today_session_ids = [
            s.id
            for s in self.db.query(AttendanceSession)
            .filter(
                AttendanceSession.faculty_id == faculty_id,
                AttendanceSession.session_date == today,
            )
            .all()
        ]

        present_today = absent_today = 0
        if today_session_ids:
            present_today = (
                self.db.query(AttendanceRecord)
                .filter(
                    AttendanceRecord.session_id.in_(today_session_ids),
                    AttendanceRecord.status == AttendanceStatus.PRESENT,
                )
                .count()
            )
            absent_today = (
                self.db.query(AttendanceRecord)
                .filter(
                    AttendanceRecord.session_id.in_(today_session_ids),
                    AttendanceRecord.status == AttendanceStatus.ABSENT,
                )
                .count()
            )

        total_today = present_today + absent_today
        pct = round((present_today / total_today * 100), 2) if total_today else 0.0

        return FacultyDashboard(
            today_sessions=today_sessions,
            total_sessions=total_sessions,
            students_present_today=present_today,
            students_absent_today=absent_today,
            today_attendance_percentage=pct,
        )

    def get_student_dashboard(self, student_id: int) -> StudentDashboard:
        student = self.db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise NotFoundError("Student")

        records = (
            self.db.query(AttendanceRecord)
            .filter(AttendanceRecord.student_id == student_id)
            .all()
        )
        total = len(records)
        present = sum(1 for r in records if r.status == AttendanceStatus.PRESENT)
        absent = total - present
        pct = round((present / total * 100), 2) if total else 0.0

        return StudentDashboard(
            student_id=student.id,
            full_name=student.full_name,
            enrollment_no=student.enrollment_no,
            attendance_percentage=pct,
            present_days=present,
            absent_days=absent,
            total_sessions=total,
        )
