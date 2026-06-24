<div align="center">

# 🎓 AI-Based Face Recognition Attendance Management System

<img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
<img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
<img src="https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
<img src="https://img.shields.io/badge/OpenCV-4.9-5C3EE8?style=for-the-badge&logo=opencv&logoColor=white"/>
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>

<br/>
<br/>

> **A production-ready, AI-powered attendance management system that uses real-time face recognition to automatically mark student attendance — built with FastAPI, React, OpenCV, and MySQL.**

<br/>

![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-orange?style=flat-square)
![MCA Project](https://img.shields.io/badge/MCA-Major%20Project-purple?style=flat-square)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ System Architecture](#-system-architecture)
- [🖥️ Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🗄️ Database Schema](#-database-schema)
- [🔐 User Roles & Permissions](#-user-roles--permissions)
- [🚀 Quick Start](#-quick-start)
- [⚙️ Backend Setup](#-backend-setup)
- [🎨 Frontend Setup](#-frontend-setup)
- [📡 API Reference](#-api-reference)
- [🤖 Face Recognition Flow](#-face-recognition-flow)
- [📊 Dashboard Preview](#-dashboard-preview)
- [🔧 Environment Variables](#-environment-variables)
- [📝 License](#-license)

---

## ✨ Features

### 🤖 AI-Powered Face Recognition
- Real-time face detection using **OpenCV** and **face_recognition** library
- 128-dimensional face encoding for high-accuracy matching
- Configurable tolerance threshold (strict/lenient matching)
- Multi-image registration per student for better accuracy

### 👥 Role-Based Access Control
- **3 distinct roles**: Admin, Faculty, Student
- JWT-based authentication with access + refresh tokens
- Fine-grained endpoint authorization per role

### 📅 Smart Attendance Management
- Create attendance sessions per subject/department/semester
- Mark attendance manually **or** via live camera face recognition
- Duplicate attendance prevention
- Real-time attendance confirmation with student name display

### 📊 Reports & Analytics
- Daily, Monthly, Student-wise, Department-wise reports
- One-click **PDF** and **Excel** export with styled formatting
- Interactive charts on dashboard (Present/Absent breakdown)
- Department-level attendance percentage tracking

### 🔒 Production-Ready Security
- bcrypt password hashing
- JWT access tokens (30 min) + refresh tokens (7 days)
- Auto token refresh on expiry
- CORS protection
- Input validation with Pydantic v2

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│    React 18 + Vite + Tailwind CSS + Axios + React Router DOM    │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP/REST (JWT Bearer)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                │
│              FastAPI 0.111 — /api/* prefix                      │
│   ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────────────┐   │
│   │  /auth   │ │/students│ │ /faculty │ │    /attendance   │   │
│   └──────────┘ └─────────┘ └──────────┘ └──────────────────┘   │
│   ┌───────────┐ ┌──────────┐ ┌─────────┐ ┌────────────────┐    │
│   │/dashboard │ │ /reports │ │  /face  │ │  /departments  │    │
│   └───────────┘ └──────────┘ └─────────┘ └────────────────┘    │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────┐ ┌─────────────────┐
│   SERVICE LAYER  │ │   FACE AI    │ │   FILE SYSTEM   │
│  Business Logic  │ │  OpenCV +    │ │  uploads/       │
│  SQLAlchemy ORM  │ │face_recog lib│ │  students/      │
└────────┬─────────┘ └──────────────┘ └─────────────────┘
         │
         ▼
┌──────────────────┐
│   MySQL 8.0 CE   │
│   (via PyMySQL)  │
└──────────────────┘
```

---

## 🖥️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **FastAPI** | 0.111 | REST API framework |
| **SQLAlchemy** | 2.0 | ORM / Database layer |
| **Alembic** | 1.13 | Database migrations |
| **PyMySQL** | 1.1 | MySQL connector |
| **Pydantic** | v2 | Request/response validation |
| **python-jose** | 3.3 | JWT token handling |
| **passlib[bcrypt]** | 1.7 | Password hashing |
| **face_recognition** | 1.3 | Face encoding & matching |
| **OpenCV** | 4.9 | Image processing |
| **NumPy** | 1.26 | Numerical computation |
| **ReportLab** | 4.1 | PDF generation |
| **openpyxl** | 3.1 | Excel generation |
| **Loguru** | 0.7 | Structured logging |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18 | UI library |
| **Vite** | 5.0 | Build tool |
| **Tailwind CSS** | 3.0 | Styling |
| **React Router DOM** | 6 | Client-side routing |
| **Axios** | 1.x | HTTP client |
| **Recharts** | 2.x | Charts & analytics |
| **Lucide React** | 0.38 | Icon library |
| **react-hot-toast** | 2.x | Toast notifications |
| **date-fns** | 3.x | Date formatting |

---

## 📁 Project Structure

```
📦 attendance-system/
│
├── 🐍 backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # App settings (pydantic-settings)
│   │   │   ├── database.py        # SQLAlchemy engine + session
│   │   │   ├── security.py        # JWT + bcrypt utilities
│   │   │   ├── dependencies.py    # FastAPI DI + role guards
│   │   │   └── exceptions.py      # Custom HTTP exceptions
│   │   │
│   │   ├── models/                # SQLAlchemy ORM models
│   │   │   ├── user.py
│   │   │   ├── student.py
│   │   │   ├── faculty.py
│   │   │   ├── department.py
│   │   │   ├── subject.py
│   │   │   ├── face_encoding.py
│   │   │   ├── attendance_session.py
│   │   │   └── attendance_record.py
│   │   │
│   │   ├── schemas/               # Pydantic request/response models
│   │   ├── routers/               # FastAPI route handlers
│   │   ├── services/              # Business logic layer
│   │   ├── utils/                 # Image & face utilities
│   │   ├── uploads/students/      # Stored face images
│   │   └── main.py                # App factory + lifespan
│   │
│   ├── alembic/                   # Database migrations
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env
│
└── ⚛️ frontend/
    ├── src/
    │   ├── api/                   # Axios API modules
    │   ├── components/            # Reusable UI components
    │   │   ├── layout/            # Sidebar, TopNavbar, AppLayout
    │   │   ├── common/            # Button, Modal, Table, Badge...
    │   │   ├── dashboard/         # StatCard, Charts
    │   │   └── attendance/        # CameraCapture, SessionForm
    │   ├── context/               # AuthContext
    │   ├── hooks/                 # Custom React hooks
    │   ├── pages/                 # All page components
    │   ├── routes/                # ProtectedRoute, RoleRoute
    │   └── utils/                 # Formatters, validators
    ├── .env
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🗄️ Database Schema

```
┌──────────┐       ┌─────────────┐       ┌────────────┐
│  users   │       │  departments│       │  subjects  │
├──────────┤       ├─────────────┤       ├────────────┤
│ id  (PK) │       │ id  (PK)    │       │ id  (PK)   │
│ name     │       │ name        │       │ subject_code│
│ email    │       │ description │       │ subject_name│
│ password │       └──────┬──────┘       │ department_id│
│ role     │              │              │ semester   │
│ status   │         ┌────┴────┐         └─────┬──────┘
└────┬─────┘         │        │               │
     │           ┌───┴──┐  ┌──┴────┐          │
     │           │stud- │  │facul- │          │
     │           │ents  │  │ ty    │          │
     │           ├──────┤  ├───────┤          │
     │           │id(PK)│  │id(PK) │          │
     └──────────►│email │  │email  │          │
                 │enroll│  │code   │     ┌────┴──────────────┐
                 │dept_id  │dept_id│     │ attendance_sessions│
                 │semester │user_id├────►├───────────────────┤
                 └───┬──┘  └───┬──┘     │ id, faculty_id     │
                     │         │        │ department_id       │
             ┌───────┘         │        │ subject_id, date   │
             │                 └───────►└────────┬──────────┘
     ┌───────┴──────┐                            │
     │face_encodings│                   ┌────────┴──────────┐
     ├──────────────┤                   │attendance_records  │
     │ id (PK)      │                   ├────────────────────┤
     │ student_id   │                   │ id, session_id     │
     │ encoding_data│                   │ student_id         │
     │ created_at   │                   │ status (PRESENT/   │
     └──────────────┘                   │        ABSENT)     │
                                        │ marked_at          │
                                        └────────────────────┘
```

---

## 🔐 User Roles & Permissions

| Feature | 👑 Admin | 👨‍🏫 Faculty | 🎓 Student |
|---|:---:|:---:|:---:|
| Login / Logout | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ (own) |
| Manage Students | ✅ CRUD | 👁️ Read | ❌ |
| Manage Faculty | ✅ CRUD | 👁️ Read | ❌ |
| Manage Departments | ✅ CRUD | 👁️ Read | 👁️ Read |
| Manage Subjects | ✅ CRUD | 👁️ Read | 👁️ Read |
| Register Student Face | ✅ | ❌ | ❌ |
| Recognize Face | ✅ | ✅ | ❌ |
| Create Attendance Session | ✅ | ✅ | ❌ |
| Mark Attendance (manual) | ✅ | ✅ | ❌ |
| Mark Attendance (face) | ✅ | ✅ | ❌ |
| View Attendance Records | ✅ | ✅ | Own only |
| View Reports | ✅ | ✅ | ❌ |
| Export PDF/Excel | ✅ | ✅ | ❌ |
| Change Password | ✅ | ✅ | ✅ |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| MySQL Server | 8.0+ |
| cmake | Latest |
| C++ Build Tools | (for dlib/face_recognition) |

```bash
# Ubuntu/Debian — install build deps for face_recognition
sudo apt-get update
sudo apt-get install -y cmake build-essential libopenblas-dev liblapack-dev libx11-dev

# macOS
brew install cmake
```

---

## ⚙️ Backend Setup

### Step 1 — Create MySQL Database
Open **MySQL Workbench** and run:
```sql
CREATE DATABASE attendance_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Fix MySQL 8 auth plugin (run if you get auth errors)
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### Step 2 — Clone & Setup Python Environment
```bash
git clone https://github.com/yourusername/attendance-system.git
cd attendance-system/backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3 — Configure Environment
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/attendance_db?charset=utf8mb4
SECRET_KEY=your-64-character-random-secret-key-here
DEFAULT_ADMIN_EMAIL=admin@attendance.com
DEFAULT_ADMIN_PASSWORD=Admin@123456
```

### Step 4 — Run Database Migrations
```bash
alembic upgrade head
```

### Step 5 — Start Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

✅ Backend running at: **http://localhost:8000**  
📖 Swagger UI: **http://localhost:8000/docs**  
🔍 ReDoc: **http://localhost:8000/redoc**

> **Default Admin Login**: `admin@attendance.com` / `Admin@123456`  
> *(Created automatically on first startup)*

---

## 🎨 Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000/api

# Start development server
npm run dev
```

✅ Frontend running at: **http://localhost:5173**

---

## 📡 API Reference

> Full interactive documentation available at **http://localhost:8000/docs**

### Authentication
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login, get JWT tokens | ❌ Public |
| `POST` | `/api/auth/refresh` | Refresh access token | ❌ Public |
| `GET` | `/api/auth/me` | Get current user | ✅ Any |
| `POST` | `/api/auth/change-password` | Change password | ✅ Any |

### Students
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `GET` | `/api/students` | List with pagination & filters | Admin, Faculty |
| `GET` | `/api/students/{id}` | Get student by ID | Admin, Faculty |
| `POST` | `/api/students` | Create student | Admin |
| `PUT` | `/api/students/{id}` | Update student | Admin |
| `DELETE` | `/api/students/{id}` | Delete student | Admin |

### Face Recognition
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `POST` | `/api/face/register/{student_id}` | Upload & register face images | Admin |
| `POST` | `/api/face/recognize` | Identify student from image | Admin, Faculty |
| `DELETE` | `/api/face/{student_id}` | Remove stored encodings | Admin |

### Attendance
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `POST` | `/api/attendance/session` | Create attendance session | Admin, Faculty |
| `GET` | `/api/attendance/sessions` | List sessions | Admin, Faculty |
| `POST` | `/api/attendance/mark` | Manual attendance marking | Admin, Faculty |
| `POST` | `/api/attendance/mark/face` | Face recognition attendance | Admin, Faculty |
| `GET` | `/api/attendance/sessions/{id}/records` | Session attendance records | Admin, Faculty |
| `GET` | `/api/attendance/student/{id}/summary` | Student attendance summary | All (own for Student) |

### Reports
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `GET` | `/api/reports/daily` | Daily attendance report | Admin, Faculty |
| `GET` | `/api/reports/monthly` | Monthly summary | Admin, Faculty |
| `GET` | `/api/reports/department/{id}` | Department report | Admin, Faculty |
| `GET` | `/api/reports/export/excel` | Download Excel report | Admin, Faculty |
| `GET` | `/api/reports/export/pdf` | Download PDF report | Admin, Faculty |

### Dashboard
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `GET` | `/api/dashboard/me` | Auto-select by role | All |
| `GET` | `/api/dashboard/admin` | Admin analytics | Admin |
| `GET` | `/api/dashboard/faculty` | Faculty analytics | Admin, Faculty |
| `GET` | `/api/dashboard/student` | Student analytics | Student |

---

## 🤖 Face Recognition Flow

### Face Registration (Admin)
```
Admin selects student
       │
       ▼
Upload 1–10 clear face photos
  POST /api/face/register/{student_id}
  Content-Type: multipart/form-data
  Field: images (multiple files)
       │
       ▼
OpenCV detects face in each image
       │
       ├── No face detected?     → Skip (report as failed)
       ├── Multiple faces?       → Skip (report as failed)
       └── Exactly 1 face?       ↓
                                 ▼
                    Generate 128-d face encoding
                    Store in face_encodings table (JSON)
                    Save image to uploads/students/{id}/
```

### Face Attendance Marking (Faculty)
```
Faculty creates session
       │
       ▼
Student stands in front of camera
       │
       ▼
Faculty clicks "Capture & Mark"
  POST /api/attendance/mark/face
  FormData: { session_id, image }
       │
       ▼
Backend extracts face encoding from image
       │
       ▼
Compare with ALL stored encodings
  (Euclidean distance < tolerance 0.5)
       │
       ├── No match?    → 404 "Face not recognized"
       └── Match found? → Mark PRESENT in attendance_records
                          Return { student_name, enrollment_no, confidence }
```

---

## 📊 Dashboard Preview

### Admin Dashboard Response
```json
{
  "total_students": 150,
  "total_faculty": 12,
  "total_departments": 5,
  "total_subjects": 30,
  "today_attendance_count": 87,
  "today_sessions_count": 4,
  "overall_attendance_percentage": 78.5,
  "active_students": 148,
  "active_faculty": 11
}
```

### Face Recognition Response
```json
{
  "matched": true,
  "student_id": 5,
  "student_name": "Rohan Patel",
  "enrollment_no": "MCA2024001",
  "confidence": 0.8721
}
```

### Student Attendance Summary
```json
{
  "student_id": 5,
  "enrollment_no": "MCA2024001",
  "student_name": "Rohan Patel",
  "total_sessions": 30,
  "present_count": 25,
  "absent_count": 5,
  "attendance_percentage": 83.33
}
```

---

## 🔧 Environment Variables

### Backend `.env`
| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | MySQL connection string | `mysql+pymysql://root:pass@localhost:3306/attendance_db?charset=utf8mb4` |
| `SECRET_KEY` | JWT signing secret (64+ chars) | `27f2d281859184e3...` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token lifetime | `7` |
| `FACE_RECOGNITION_TOLERANCE` | Match strictness (0.4–0.6) | `0.5` |
| `MAX_FILE_SIZE_MB` | Upload size limit | `10` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:5173` |
| `DEFAULT_ADMIN_EMAIL` | Seeded admin email | `admin@attendance.com` |
| `DEFAULT_ADMIN_PASSWORD` | Seeded admin password | `Admin@123456` |

### Frontend `.env`
| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8000/api` |
| `VITE_APP_NAME` | App display name | `FaceAttend` |

---

## 🛠️ Development Commands

```bash
# Backend
uvicorn app.main:app --reload          # Start with hot reload
alembic upgrade head                   # Apply all migrations
alembic revision --autogenerate -m ""  # Generate new migration
alembic downgrade -1                   # Roll back one migration
alembic history                        # View migration history

# Frontend
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 🚀 Production Checklist

- [ ] Change `SECRET_KEY` to a 64+ char random string
- [ ] Change default admin password
- [ ] Set `DEBUG=False` in `.env`
- [ ] Use a dedicated MySQL user (not root)
- [ ] Configure Nginx reverse proxy with HTTPS
- [ ] Set `ALLOWED_ORIGINS` to production frontend URL only
- [ ] Mount `uploads/` as persistent storage volume

---

## 📝 License

This project is licensed under the **MIT License**.

```
MIT License — Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, copy, modify, merge, publish, distribute, and/or sell
copies of this software, subject to the MIT license terms.
```

