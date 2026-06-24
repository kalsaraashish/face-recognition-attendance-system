AI-Based Face Recognition Attendance Management System
Project Overview

Build a modern web-based Face Recognition Attendance Management System using:

Frontend: React + Vite + Tailwind CSS
Backend: Python FastAPI
Database: MySQL
Authentication: JWT
AI/ML: OpenCV + Face Recognition Library
Charts: Recharts
State Management: React Query
ORM: SQLAlchemy
API Docs: Swagger/OpenAPI

The system should automatically recognize student faces from a webcam feed and mark attendance.

UI Theme

Use the design style inspired by the reference image.

Colors
Primary Blue: #1E88E5
Secondary Blue: #42A5F5
Light Blue: #E3F2FD
Background: #F8FBFF
White: #FFFFFF
Text Dark: #1F2937
Text Gray: #6B7280
Success: #10B981
Warning: #F59E0B
Danger: #EF4444
Design Style
Clean
Modern
Soft shadows
Rounded corners
Glassmorphism cards
Blue gradient buttons
Smooth animations
Responsive layout
User Roles
Admin

Can:

Login
Manage Students
Register Student Faces
Manage Faculty
View Attendance Reports
View Dashboard Analytics
Faculty

Can:

Login
Start Attendance Session
View Attendance
Generate Reports
Student

Can:

Login
View Attendance
View Attendance Percentage
View Profile
Core Features
Authentication

JWT Authentication

Features:

Login
Logout
Forgot Password
Change Password
Student Management

Admin can:

Add Student
Edit Student
Delete Student
Search Student
View Student

Fields:

Enrollment Number
First Name
Last Name
Email
Mobile
Department
Semester
Photo
Status
Faculty Management

Admin can:

Add Faculty
Update Faculty
Delete Faculty

Fields:

Faculty Code
Name
Email
Department
Mobile
Face Registration Module

Admin opens camera.

System captures:

20-30 Face Images

Store:

Student Face Dataset

Generate:

Face Encoding

Save into database.

Attendance Module

Faculty starts attendance session.

Flow:

Select Department
Select Semester
Select Subject

↓

Open Webcam

↓

Detect Face

↓

Recognize Student

↓

Mark Attendance

↓

Save Attendance
Attendance Rules

If face matched:

Present

If face not matched:

Unknown Person

Prevent duplicate attendance.

Dashboard
Admin Dashboard

Cards:

Total Students
Total Faculty
Today's Attendance
Attendance Percentage

Charts:

Monthly Attendance
Department Wise Attendance
Faculty Dashboard

Cards:

Today's Sessions
Students Present
Students Absent
Student Dashboard

Cards:

Attendance %
Present Days
Absent Days
Reports

Generate:

Daily Attendance
Monthly Attendance
Student Attendance
Department Attendance

Export:

PDF
Excel
Database Design
users
id
name
email
password_hash
role
status
created_at
updated_at
students
id
enrollment_no
first_name
last_name
email
mobile
department_id
semester
photo_url
status
created_at
updated_at
faculty
id
faculty_code
name
email
mobile
department_id
status
departments
id
name
description
subjects
id
subject_code
subject_name
department_id
semester
face_encodings
id
student_id
encoding_data
created_at

Store encoding as JSON.

attendance_sessions
id
faculty_id
department_id
semester
subject_id
session_date
start_time
end_time
attendance_records
id
session_id
student_id
status
marked_at

Status:

Present
Absent
Backend Structure
backend/
│
├── app/
│
├── core/
│ ├── config.py
│ ├── security.py
│ ├── database.py
│
├── models/
│ ├── user.py
│ ├── student.py
│ ├── faculty.py
│ ├── attendance.py
│ ├── department.py
│ ├── subject.py
│
├── schemas/
│ ├── auth.py
│ ├── student.py
│ ├── faculty.py
│ ├── attendance.py
│
├── routers/
│ ├── auth.py
│ ├── students.py
│ ├── faculty.py
│ ├── attendance.py
│ ├── reports.py
│ ├── face_recognition.py
│
├── services/
│ ├── attendance_service.py
│ ├── face_service.py
│
├── utils/
│ ├── image_utils.py
│
├── uploads/
│
├── main.py
│
└── requirements.txt
Frontend Structure
frontend/
│
├── src/
│
├── api/
│
├── components/
│ ├── common/
│ ├── forms/
│ ├── tables/
│ ├── charts/
│
├── layouts/
│ ├── AdminLayout.jsx
│ ├── FacultyLayout.jsx
│ ├── StudentLayout.jsx
│
├── pages/
│
│ ├── auth/
│ │ ├── Login.jsx
│
│ ├── admin/
│ │ ├── Dashboard.jsx
│ │ ├── Students.jsx
│ │ ├── Faculty.jsx
│ │ ├── FaceRegistration.jsx
│
│ ├── faculty/
│ │ ├── AttendanceCamera.jsx
│ │ ├── Reports.jsx
│
│ ├── student/
│ │ ├── Dashboard.jsx
│ │ ├── Attendance.jsx
│
├── routes/
│
├── hooks/
│
├── context/
│
├── utils/
│
├── App.jsx
│
└── main.jsx
ML Module

Libraries:

opencv-python
face-recognition
numpy
pillow

Workflow:

Capture Face

↓

Generate Face Encoding

↓

Store Encoding

↓

Compare Real-Time Face

↓

Find Match

↓

Mark Attendance
Security
JWT Authentication
Password Hashing (bcrypt)
Protected Routes
Role-Based Access Control
Future Enhancements
Email Notifications
QR Attendance Backup
Mobile App
Liveness Detection
Anti-Spoofing Detection
Face Mask Recognition
