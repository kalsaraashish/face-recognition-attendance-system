# AI-Based Face Recognition Attendance Management System

A production-quality FastAPI backend for managing student attendance using face recognition.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 |
| Database | MySQL 8+ |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic |
| Auth | JWT (access + refresh) + Bcrypt |
| Face Recognition | OpenCV + face_recognition + NumPy |
| Reports | ReportLab (PDF) + openpyxl (Excel) |
| Validation | Pydantic v2 |

---

## Project Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Pydantic Settings (reads .env)
│   │   ├── database.py        # SQLAlchemy engine + session
│   │   ├── security.py        # JWT + bcrypt utilities
│   │   ├── dependencies.py    # FastAPI DI: current_user, role guards
│   │   └── exceptions.py      # Custom HTTP exceptions
│   ├── models/                # SQLAlchemy ORM models
│   ├── schemas/               # Pydantic request/response schemas
│   ├── routers/               # FastAPI route handlers
│   ├── services/              # Business logic layer
│   ├── utils/
│   │   ├── image_utils.py     # File upload helpers
│   │   └── face_utils.py      # OpenCV + face_recognition helpers
│   ├── uploads/students/      # Stored face images
│   └── main.py                # App factory + lifespan
├── alembic/                   # DB migration scripts
├── alembic.ini
├── requirements.txt
├── .env
└── .env.example
```

---

## Quick Start

### 1. Prerequisites

- Python 3.11+
- MySQL 8+
- `cmake` and C++ build tools (required by `dlib` / `face_recognition`)

```bash
# Ubuntu / Debian
sudo apt-get install cmake build-essential libopenblas-dev liblapack-dev

# macOS
brew install cmake
```

### 2. Create MySQL database

```sql
CREATE DATABASE attendance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Clone & install

```bash
git clone <repo>
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env — set DB_PASSWORD, SECRET_KEY, etc.
```

### 5. Run migrations

```bash
alembic upgrade head
```

### 6. Start the server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server seeds the default admin user on first boot.

**Swagger UI:** http://localhost:8000/docs  
**ReDoc:** http://localhost:8000/redoc  
**Health:** http://localhost:8000/health

---

## Default Admin Credentials

| Field | Value |
|---|---|
| Email | admin@attendance.com |
| Password | Admin@123456|

Change these in `.env` before deploying to production.

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login, returns JWT tokens |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/change-password | Change password |
| GET | /api/auth/me | Current user profile |

### Students (Admin / Faculty read)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/students | List with pagination & filters |
| GET | /api/students/search?q= | Search by name/enrollment/email |
| GET | /api/students/{id} | Get by ID |
| POST | /api/students | Create (Admin) |
| PUT | /api/students/{id} | Update (Admin) |
| DELETE | /api/students/{id} | Delete (Admin) |

### Faculty (Admin only for mutations)

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/faculty | List |
| GET | /api/faculty/{id} | Get by ID |
| POST | /api/faculty | Create + linked User account |
| PUT | /api/faculty/{id} | Update |
| DELETE | /api/faculty/{id} | Delete |

### Departments & Subjects

Same CRUD pattern — GET open to all roles, mutations Admin-only.

### Face Recognition

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/face/register/{student_id} | Upload 1–10 face images (Admin) |
| POST | /api/face/recognize | Identify student from image |
| DELETE | /api/face/{student_id} | Remove stored encodings (Admin) |

### Attendance

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/attendance/session | Create session (Faculty/Admin) |
| GET | /api/attendance/sessions | List sessions |
| POST | /api/attendance/mark | Mark manually |
| POST | /api/attendance/mark/face | Mark via face recognition |
| GET | /api/attendance/sessions/{id}/records | Session records |
| GET | /api/attendance/student/{id}/summary | Student summary |

### Reports & Export

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reports/daily | Daily attendance |
| GET | /api/reports/monthly | Monthly summary |
| GET | /api/reports/student/{id} | Student report |
| GET | /api/reports/department/{id} | Department report |
| GET | /api/reports/export/excel | Download Excel |
| GET | /api/reports/export/pdf | Download PDF |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard/me | Auto-selects by role |
| GET | /api/dashboard/admin | Admin analytics |
| GET | /api/dashboard/faculty | Faculty analytics |
| GET | /api/dashboard/student | Student analytics |

---

## Role Permissions

| Feature | Admin | Faculty | Student |
|---|:---:|:---:|:---:|
| Manage Students | ✅ | Read | ❌ |
| Manage Faculty | ✅ | Read | ❌ |
| Manage Departments | ✅ | Read | Read |
| Manage Subjects | ✅ | Read | Read |
| Register Face | ✅ | ❌ | ❌ |
| Recognize Face | ✅ | ✅ | ❌ |
| Create Session | ✅ | ✅ | ❌ |
| Mark Attendance | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | Own only |
| Dashboard | Admin | Faculty | Student |

---

## Running Migrations

```bash
# Generate new migration after model changes
alembic revision --autogenerate -m "describe change"

# Apply all pending migrations
alembic upgrade head

# Roll back one step
alembic downgrade -1

# View migration history
alembic history
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| DATABASE_URL | Full MySQL connection URL | — |
| SECRET_KEY | JWT signing secret (min 32 chars) | — |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token lifetime | 30 |
| REFRESH_TOKEN_EXPIRE_DAYS | Refresh token lifetime | 7 |
| FACE_RECOGNITION_TOLERANCE | Match threshold (lower = stricter) | 0.5 |
| MAX_FILE_SIZE_MB | Upload size limit | 10 |
| ALLOWED_ORIGINS | CORS allowed origins (comma-separated) | localhost:3000 |

---

## Production Checklist

- [ ] Set a strong `SECRET_KEY` (32+ random characters)
- [ ] Change default admin password
- [ ] Set `DEBUG=False`
- [ ] Use a dedicated MySQL user with least-privilege grants
- [ ] Serve behind Nginx with HTTPS
- [ ] Configure `ALLOWED_ORIGINS` to your frontend domain only
- [ ] Set up log rotation for Loguru output
- [ ] Mount `uploads/` as a persistent volume (Docker)
