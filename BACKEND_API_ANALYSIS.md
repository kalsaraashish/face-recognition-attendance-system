# Backend API Analysis
## AI-Based Face Recognition Attendance Management System

---

## 1. Architecture Overview

| Attribute | Value |
|---|---|
| **Framework** | FastAPI 0.111 (Python) |
| **Architecture** | Service Layer Architecture (Router → Service → ORM Model) |
| **Database** | MySQL 8.0 via PyMySQL |
| **ORM** | SQLAlchemy 2.0 |
| **Migrations** | Alembic |
| **Authentication** | JWT Bearer Tokens (Access + Refresh) |
| **Password Hashing** | bcrypt via passlib |
| **Validation** | Pydantic v2 |
| **Face Recognition** | OpenCV + face_recognition + NumPy |
| **Report Export** | ReportLab (PDF) + openpyxl (Excel) |

---

## 2. Server URLs

| Environment | URL |
|---|---|
| **Backend Base URL** | `http://localhost:8000` |
| **API Prefix** | `http://localhost:8000/api` |
| **Swagger UI** | `http://localhost:8000/docs` |
| **ReDoc** | `http://localhost:8000/redoc` |
| **OpenAPI JSON** | `http://localhost:8000/openapi.json` |
| **Health Check** | `http://localhost:8000/health` |

---

## 3. User Roles

| Role | Description |
|---|---|
| `ADMIN` | Full system access — manages students, faculty, departments, subjects, face registration |
| `FACULTY` | Creates attendance sessions, marks attendance via camera, views reports |
| `STUDENT` | Views own profile, attendance, and attendance percentage only |

---

## 4. Authentication

### JWT Token Flow

1. Client calls `POST /api/auth/login` with email + password
2. Server returns `access_token` (30 min) + `refresh_token` (7 days)
3. Client stores both tokens in `localStorage`
4. Every protected request adds header: `Authorization: Bearer <access_token>`
5. When access token expires, call `POST /api/auth/refresh` with refresh_token
6. Server returns new token pair

### Token Header Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### JWT Payload Structure
```json
{
  "sub": "1",
  "role": "ADMIN",
  "type": "access",
  "iat": 1719100000,
  "exp": 1719101800
}
```

---

## 5. Database Models / Entities

### users
| Field | Type | Notes |
|---|---|---|
| id | int PK | Auto-increment |
| name | string(150) | Full name |
| email | string(255) | Unique, used for login |
| password_hash | string(255) | bcrypt hash |
| role | enum | ADMIN / FACULTY / STUDENT |
| status | bool | True = active |
| created_at | datetime | Auto |
| updated_at | datetime | Auto |

### students
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| enrollment_no | string(50) | Unique |
| first_name | string(100) | |
| last_name | string(100) | |
| email | string(255) | Unique |
| mobile | string(15) | Nullable |
| department_id | FK → departments | |
| semester | int | 1–8 |
| photo_url | string(500) | Nullable |
| status | bool | |
| created_at | datetime | |
| updated_at | datetime | |

### faculty
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| faculty_code | string(50) | Unique |
| name | string(150) | |
| email | string(255) | Unique |
| mobile | string(15) | Nullable |
| department_id | FK → departments | |
| user_id | FK → users | Linked login account |
| status | bool | |

### departments
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| name | string(150) | Unique |
| description | text | Nullable |

### subjects
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| subject_code | string(50) | Unique |
| subject_name | string(200) | |
| department_id | FK → departments | |
| semester | int | 1–8 |

### face_encodings
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| student_id | FK → students | CASCADE delete |
| encoding_data | text | JSON array of 128 floats |
| created_at | datetime | |

### attendance_sessions
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| faculty_id | FK → faculty | |
| department_id | FK → departments | |
| semester | int | |
| subject_id | FK → subjects | |
| session_date | date | |
| start_time | time | Nullable |
| end_time | time | Nullable |

### attendance_records
| Field | Type | Notes |
|---|---|---|
| id | int PK | |
| session_id | FK → attendance_sessions | CASCADE delete |
| student_id | FK → students | |
| status | enum | PRESENT / ABSENT |
| marked_at | datetime | Auto |

---

## 6. Complete API Endpoint Reference

### 6.1 Authentication — `/api/auth`

#### `POST /api/auth/login`
- **Auth Required:** No
- **Roles:** Public

**Request Body:**
```json
{
  "email": "admin@attendance.com",
  "password": "Admin@123456"
}
```

**Response 200:**
```json
{
  "access_token": "eyJhbGci...",
  "refresh_token": "eyJhbGci...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": 1,
    "name": "System Admin",
    "email": "admin@attendance.com",
    "role": "ADMIN",
    "status": true
  }
}
```

**Error Responses:**
```json
{ "detail": "Invalid email or password", "status_code": 401 }
{ "detail": "Account is disabled. Contact administrator.", "status_code": 401 }
```

---

#### `POST /api/auth/refresh`
- **Auth Required:** No (uses refresh_token in body)

**Request Body:**
```json
{ "refresh_token": "eyJhbGci..." }
```

**Response 200:** Same as login response (new token pair)

---

#### `POST /api/auth/change-password`
- **Auth Required:** Yes (any role)

**Request Body:**
```json
{
  "current_password": "Admin@123456",
  "new_password": "NewPass@789",
  "confirm_password": "NewPass@789"
}
```

**Response 200:**
```json
{ "message": "Password updated successfully" }
```

---

#### `GET /api/auth/me`
- **Auth Required:** Yes (any role)

**Response 200:**
```json
{
  "id": 1,
  "name": "System Admin",
  "email": "admin@attendance.com",
  "role": "ADMIN",
  "status": true
}
```

---

### 6.2 Students — `/api/students`

#### `GET /api/students`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Query Params:**

| Param | Type | Default | Description |
|---|---|---|---|
| page | int | 1 | Page number |
| per_page | int | 20 | Items per page (max 100) |
| search | string | null | Search name/enrollment/email |
| department_id | int | null | Filter by department |
| semester | int | null | Filter by semester (1–8) |
| status | bool | null | Filter by active/inactive |

**Response 200:**
```json
{
  "students": [
    {
      "id": 1,
      "enrollment_no": "MCA2024001",
      "first_name": "Rohan",
      "last_name": "Patel",
      "full_name": "Rohan Patel",
      "email": "rohan.patel@student.edu",
      "mobile": "9876543210",
      "department_id": 1,
      "department": { "id": 1, "name": "MCA" },
      "semester": 3,
      "photo_url": null,
      "status": true,
      "created_at": "2024-06-23T10:00:00",
      "updated_at": "2024-06-23T10:00:00",
      "has_face_registered": false
    }
  ],
  "total": 45,
  "page": 1,
  "per_page": 20,
  "total_pages": 3
}
```

---

#### `GET /api/students/search?q=rohan`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- Same response as list above

---

#### `GET /api/students/{student_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY

**Response 200:** Single `StudentOut` object (same shape as list item above)

**Error:** `{ "detail": "Student not found", "status_code": 404 }`

---

#### `POST /api/students`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Request Body:**
```json
{
  "enrollment_no": "MCA2024001",
  "first_name": "Rohan",
  "last_name": "Patel",
  "email": "rohan.patel@student.edu",
  "mobile": "9876543210",
  "department_id": 1,
  "semester": 3
}
```

**Response 201:** Single `StudentOut` object

**Errors:**
```json
{ "detail": "Enrollment number 'MCA2024001' already exists", "status_code": 409 }
{ "detail": "Email 'rohan@student.edu' already registered", "status_code": 409 }
```

---

#### `PUT /api/students/{student_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Request Body (all fields optional):**
```json
{
  "first_name": "Rohan",
  "last_name": "Patel",
  "email": "new@email.com",
  "mobile": "9876543210",
  "department_id": 2,
  "semester": 4,
  "status": true
}
```

**Response 200:** Updated `StudentOut` object

---

#### `DELETE /api/students/{student_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Response 200:**
```json
{ "message": "Student 1 deleted successfully" }
```

---

### 6.3 Faculty — `/api/faculty`

#### `GET /api/faculty`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Query Params:** `page`, `per_page`, `department_id`, `status`

**Response 200:**
```json
{
  "faculties": [
    {
      "id": 1,
      "faculty_code": "FAC001",
      "name": "Dr. Priya Sharma",
      "email": "priya.sharma@college.edu",
      "mobile": "9123456780",
      "department_id": 1,
      "department": { "id": 1, "name": "MCA" },
      "status": true
    }
  ],
  "total": 10,
  "page": 1,
  "per_page": 20,
  "total_pages": 1
}
```

---

#### `GET /api/faculty/{faculty_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY

**Response 200:** Single `FacultyOut` object

---

#### `POST /api/faculty`
- **Auth Required:** Yes
- **Roles:** ADMIN only
- **Note:** This creates BOTH a Faculty record AND a linked User account for login

**Request Body:**
```json
{
  "faculty_code": "FAC001",
  "name": "Dr. Priya Sharma",
  "email": "priya.sharma@college.edu",
  "mobile": "9123456780",
  "department_id": 1,
  "password": "Faculty@123"
}
```

**Response 201:** Single `FacultyOut` object

---

#### `PUT /api/faculty/{faculty_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Request Body (all fields optional):**
```json
{
  "name": "Dr. Priya Sharma",
  "email": "new@email.com",
  "mobile": "9123456780",
  "department_id": 2,
  "status": true
}
```

---

#### `DELETE /api/faculty/{faculty_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Response 200:**
```json
{ "message": "Faculty 1 deleted successfully" }
```

---

### 6.4 Departments — `/api/departments`

#### `GET /api/departments`
- **Auth Required:** Yes
- **Roles:** ALL (Admin, Faculty, Student)

**Response 200:**
```json
[
  { "id": 1, "name": "MCA", "description": "Master of Computer Applications" },
  { "id": 2, "name": "MBA", "description": "Master of Business Administration" }
]
```

---

#### `GET /api/departments/{dept_id}`
- **Auth Required:** Yes
- **Roles:** ALL

**Response 200:** Single `DepartmentOut` object

---

#### `POST /api/departments`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Request Body:**
```json
{
  "name": "MCA",
  "description": "Master of Computer Applications"
}
```

**Response 201:** Single `DepartmentOut` object

---

#### `PUT /api/departments/{dept_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Request Body (all fields optional):**
```json
{
  "name": "MCA Updated",
  "description": "New description"
}
```

---

#### `DELETE /api/departments/{dept_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Response 200:** `{ "message": "Department 1 deleted" }`

---

### 6.5 Subjects — `/api/subjects`

#### `GET /api/subjects`
- **Auth Required:** Yes
- **Roles:** ALL
- **Query Params:** `department_id`, `semester`

**Response 200:**
```json
[
  {
    "id": 1,
    "subject_code": "MCA301",
    "subject_name": "Machine Learning",
    "department_id": 1,
    "department": { "id": 1, "name": "MCA" },
    "semester": 3
  }
]
```

---

#### `POST /api/subjects`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Request Body:**
```json
{
  "subject_code": "MCA301",
  "subject_name": "Machine Learning",
  "department_id": 1,
  "semester": 3
}
```

**Response 201:** Single `SubjectOut` object

---

#### `PUT /api/subjects/{subject_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Request Body (all optional):**
```json
{
  "subject_name": "Advanced Machine Learning",
  "department_id": 1,
  "semester": 4
}
```

---

#### `DELETE /api/subjects/{subject_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Response 200:** `{ "message": "Subject 1 deleted" }`

---

### 6.6 Face Recognition — `/api/face`

#### `POST /api/face/register/{student_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN only
- **Content-Type:** `multipart/form-data`
- **Note:** Upload 1–10 images. Each must contain exactly ONE face.

**Request (multipart):**
```
Field name: images
Type: File (multiple)
Accepted: image/jpeg, image/png, image/jpg
Max size: 10 MB each
```

**Response 200:**
```json
{
  "student_id": 1,
  "total_uploaded": 3,
  "registered": 3,
  "results": [
    { "filename": "face1.jpg", "status": "success", "encoding_id": 1 },
    { "filename": "face2.jpg", "status": "success", "encoding_id": 2 },
    { "filename": "blurry.jpg", "status": "failed", "reason": "No face detected in the image" }
  ]
}
```

**Error Responses:**
```json
{ "detail": "No face detected in the image", "status_code": 422 }
{ "detail": "Multiple faces detected. Please upload an image with a single face", "status_code": 422 }
{ "detail": "Student not found", "status_code": 404 }
```

---

#### `POST /api/face/recognize`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Content-Type:** `multipart/form-data`
- **Purpose:** Identify which student is in the image (does NOT mark attendance)

**Request (multipart):**
```
Field name: image
Type: File (single)
Accepted: image/jpeg, image/png
```

**Response 200 — Match found:**
```json
{
  "matched": true,
  "student_id": 5,
  "student_name": "Rohan Patel",
  "enrollment_no": "MCA2024001",
  "confidence": 0.8721
}
```

**Response 200 — No match:**
```json
{
  "matched": false,
  "student_id": null,
  "student_name": null,
  "enrollment_no": null,
  "confidence": 0.3210
}
```

---

#### `DELETE /api/face/{student_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Response 200:**
```json
{ "deleted_count": 3 }
```

---

### 6.7 Attendance — `/api/attendance`

#### `POST /api/attendance/session`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Note:** Faculty auto-resolves their own `faculty_id` from JWT. Admin picks first faculty of department.

**Request Body:**
```json
{
  "department_id": 1,
  "semester": 3,
  "subject_id": 2,
  "session_date": "2024-06-23",
  "start_time": "10:00:00",
  "end_time": "11:00:00"
}
```

**Response 201:**
```json
{
  "id": 1,
  "faculty_id": 1,
  "department_id": 1,
  "semester": 3,
  "subject_id": 2,
  "session_date": "2024-06-23",
  "start_time": "10:00:00",
  "end_time": "11:00:00"
}
```

---

#### `GET /api/attendance/sessions`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Query Params:** `faculty_id`, `department_id`, `session_date`, `page`, `per_page`

**Response 200:**
```json
{
  "sessions": [ { ...SessionOut... } ],
  "total": 50,
  "page": 1,
  "per_page": 20,
  "total_pages": 3
}
```

---

#### `GET /api/attendance/sessions/{session_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY

**Response 200:** Single `SessionOut` object

---

#### `POST /api/attendance/mark`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Purpose:** Manually mark attendance (without face recognition)

**Request Body:**
```json
{
  "session_id": 1,
  "student_id": 5,
  "status": "PRESENT"
}
```
> `status` can be `"PRESENT"` or `"ABSENT"`. Defaults to `"PRESENT"`.

**Response 200:**
```json
{
  "id": 1,
  "session_id": 1,
  "student_id": 5,
  "student_name": "Rohan Patel",
  "enrollment_no": "MCA2024001",
  "status": "PRESENT",
  "marked_at": "2024-06-23T10:15:00"
}
```

**Errors:**
```json
{ "detail": "Attendance already marked for student 5 in session 1", "status_code": 409 }
```

---

#### `POST /api/attendance/mark/face`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Content-Type:** `multipart/form-data`
- **Purpose:** Recognize face from image and mark attendance PRESENT in one step

**Request (multipart form-data):**
```
session_id: 1        (form field, integer)
image: <file>        (file field, JPEG/PNG)
```

**Response 200:** Same as `AttendanceRecordOut` above

**Errors:**
```json
{ "detail": "Could not recognize student face", "status_code": 404 }
{ "detail": "Attendance already marked for student X in session Y", "status_code": 409 }
```

---

#### `GET /api/attendance/sessions/{session_id}/records`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY

**Response 200:**
```json
[
  {
    "id": 1,
    "session_id": 1,
    "student_id": 5,
    "student_name": "Rohan Patel",
    "enrollment_no": "MCA2024001",
    "status": "PRESENT",
    "marked_at": "2024-06-23T10:15:00"
  }
]
```

---

#### `GET /api/attendance/student/{student_id}/summary`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY (any student), STUDENT (own only)
- **Query Params:** `subject_id`, `date_from` (YYYY-MM-DD), `date_to` (YYYY-MM-DD)

**Response 200:**
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

### 6.8 Dashboard — `/api/dashboard`

#### `GET /api/dashboard/me`
- **Auth Required:** Yes
- **Roles:** ALL
- **Purpose:** Returns the correct dashboard for whatever role the JWT contains
- Returns AdminDashboard, FacultyDashboard, or StudentDashboard based on role

---

#### `GET /api/dashboard/admin`
- **Auth Required:** Yes
- **Roles:** ADMIN only

**Response 200:**
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

---

#### `GET /api/dashboard/faculty`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY (resolves from JWT)

**Response 200:**
```json
{
  "today_sessions": 2,
  "total_sessions": 45,
  "students_present_today": 28,
  "students_absent_today": 7,
  "today_attendance_percentage": 80.0
}
```

---

#### `GET /api/dashboard/student`
- **Auth Required:** Yes
- **Roles:** STUDENT only (resolves from email in JWT)

**Response 200:**
```json
{
  "student_id": 5,
  "full_name": "Rohan Patel",
  "enrollment_no": "MCA2024001",
  "attendance_percentage": 83.33,
  "present_days": 25,
  "absent_days": 5,
  "total_sessions": 30
}
```

---

### 6.9 Reports — `/api/reports`

#### `GET /api/reports/daily`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Query Params:** `report_date` (default: today), `department_id`, `semester`, `subject_id`

**Response 200:**
```json
{
  "date": "2024-06-23",
  "total_records": 35,
  "records": [
    {
      "date": "2024-06-23",
      "session_id": 1,
      "subject": "Machine Learning",
      "department": "MCA",
      "semester": 3,
      "enrollment_no": "MCA2024001",
      "student_name": "Rohan Patel",
      "status": "PRESENT",
      "marked_at": "2024-06-23 10:15:00"
    }
  ]
}
```

---

#### `GET /api/reports/monthly`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Query Params:** `year` (required), `month` (required, 1–12), `department_id`, `semester`

**Response 200:**
```json
{
  "year": 2024,
  "month": 6,
  "total_students": 45,
  "summaries": [
    {
      "student_id": 5,
      "enrollment_no": "MCA2024001",
      "student_name": "Rohan Patel",
      "total_sessions": 22,
      "present_count": 18,
      "absent_count": 4,
      "attendance_percentage": 81.82
    }
  ]
}
```

---

#### `GET /api/reports/student/{student_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Query Params:** `subject_id`, `date_from`, `date_to`

**Response 200:** Single `StudentAttendanceSummary` object

---

#### `GET /api/reports/department/{department_id}`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Query Params:** `semester`, `subject_id`, `date_from`, `date_to`

**Response 200:**
```json
{
  "department": "MCA",
  "total_students": 45,
  "summaries": [ { ...StudentAttendanceSummary... } ]
}
```

---

#### `GET /api/reports/export/excel`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Query Params:** `report_date`, `department_id`, `semester`, `subject_id`
- **Response:** File download (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)
- **Filename:** `attendance_YYYY-MM-DD.xlsx`

**Frontend Usage:**
```javascript
window.open(`${BASE_URL}/api/reports/export/excel?report_date=2024-06-23`, '_blank')
// OR use axios with responseType: 'blob'
```

---

#### `GET /api/reports/export/pdf`
- **Auth Required:** Yes
- **Roles:** ADMIN, FACULTY
- **Response:** File download (`application/pdf`)
- **Filename:** `attendance_YYYY-MM-DD.pdf`

---

## 7. Attendance Marking Flow

### Flow A — Manual Attendance
```
1. Faculty creates session → POST /api/attendance/session
2. Faculty gets session_id from response
3. For each student: POST /api/attendance/mark with { session_id, student_id, status }
4. GET /api/attendance/sessions/{session_id}/records to verify
```

### Flow B — Face Recognition Attendance (Live Camera)
```
1. Faculty creates session → POST /api/attendance/session → get session_id
2. Frontend opens webcam (getUserMedia)
3. User appears in front of camera
4. Frontend captures frame as Blob/File
5. POST /api/attendance/mark/face with FormData:
   - session_id: <number>  (form field)
   - image: <Blob>         (file field)
6. Backend recognizes face → marks PRESENT → returns AttendanceRecord
7. Frontend shows matched student name + confirmation
8. Repeat for next student
```

### Flow C — Face Registration (Admin)
```
1. Admin selects student
2. Admin uploads 1–10 clear face photos
3. POST /api/face/register/{student_id} with FormData { images: [File, File...] }
4. Backend stores 128-d encodings in face_encodings table
5. Student is now eligible for face recognition attendance
```

---

## 8. Error Response Format

All errors return a consistent JSON shape:

```json
{
  "detail": "Human-readable error message",
  "status_code": 404
}
```

### Error Code Reference

| Status Code | Meaning | When |
|---|---|---|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid/expired JWT |
| 403 | Forbidden | Valid JWT but wrong role |
| 404 | Not Found | Student/Faculty/Session not found |
| 409 | Conflict | Duplicate enrollment_no, email, or double attendance |
| 422 | Unprocessable | No face detected, multiple faces, validation failure |
| 500 | Internal Server Error | Unexpected backend error |

### Validation Error (Pydantic — 422)
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

---

## 9. Role–Endpoint Authorization Matrix

| Endpoint | ADMIN | FACULTY | STUDENT |
|---|:---:|:---:|:---:|
| POST /api/auth/login | ✅ | ✅ | ✅ |
| POST /api/auth/refresh | ✅ | ✅ | ✅ |
| GET /api/auth/me | ✅ | ✅ | ✅ |
| POST /api/auth/change-password | ✅ | ✅ | ✅ |
| GET /api/students | ✅ | ✅ | ❌ |
| POST /api/students | ✅ | ❌ | ❌ |
| PUT /api/students/{id} | ✅ | ❌ | ❌ |
| DELETE /api/students/{id} | ✅ | ❌ | ❌ |
| GET /api/faculty | ✅ | ✅ | ❌ |
| POST /api/faculty | ✅ | ❌ | ❌ |
| PUT /api/faculty/{id} | ✅ | ❌ | ❌ |
| DELETE /api/faculty/{id} | ✅ | ❌ | ❌ |
| GET /api/departments | ✅ | ✅ | ✅ |
| POST /api/departments | ✅ | ❌ | ❌ |
| PUT/DELETE /api/departments | ✅ | ❌ | ❌ |
| GET /api/subjects | ✅ | ✅ | ✅ |
| POST /api/subjects | ✅ | ❌ | ❌ |
| PUT/DELETE /api/subjects | ✅ | ❌ | ❌ |
| POST /api/face/register | ✅ | ❌ | ❌ |
| POST /api/face/recognize | ✅ | ✅ | ❌ |
| DELETE /api/face/{id} | ✅ | ❌ | ❌ |
| POST /api/attendance/session | ✅ | ✅ | ❌ |
| GET /api/attendance/sessions | ✅ | ✅ | ❌ |
| POST /api/attendance/mark | ✅ | ✅ | ❌ |
| POST /api/attendance/mark/face | ✅ | ✅ | ❌ |
| GET /api/attendance/sessions/{id}/records | ✅ | ✅ | ❌ |
| GET /api/attendance/student/{id}/summary | ✅ | ✅ | Own only |
| GET /api/dashboard/admin | ✅ | ❌ | ❌ |
| GET /api/dashboard/faculty | ✅ | ✅ | ❌ |
| GET /api/dashboard/student | ❌ | ❌ | ✅ |
| GET /api/dashboard/me | ✅ | ✅ | ✅ |
| GET /api/reports/* | ✅ | ✅ | ❌ |
| GET /api/reports/export/* | ✅ | ✅ | ❌ |

---

## 10. Required Environment Variables

```env
DATABASE_URL=mysql+pymysql://root:root@localhost:3306/attendance_db?charset=utf8mb4
SECRET_KEY=<64-char random hex>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg
FACE_RECOGNITION_TOLERANCE=0.5
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
DEFAULT_ADMIN_EMAIL=admin@attendance.com
DEFAULT_ADMIN_PASSWORD=Admin@123456
```

---

## 11. Default Admin Credentials

| Field | Value |
|---|---|
| Email | admin@attendance.com |
| Password | Admin@123456 |

> Created automatically on first server startup if not already present.

---

## 12. Multipart Form-Data Rules (for frontend)

| Endpoint | Field Name | Type | Notes |
|---|---|---|---|
| `POST /api/face/register/{id}` | `images` | `File[]` | Multiple files, same field name |
| `POST /api/face/recognize` | `image` | `File` | Single file |
| `POST /api/attendance/mark/face` | `session_id` | `Form (int)` | Number field in form |
| `POST /api/attendance/mark/face` | `image` | `File` | Single file |

**Correct Axios usage for face mark:**
```javascript
const formData = new FormData();
formData.append('session_id', sessionId);
formData.append('image', imageBlob, 'capture.jpg');
axios.post('/api/attendance/mark/face', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

**Correct Axios usage for face registration:**
```javascript
const formData = new FormData();
files.forEach(file => formData.append('images', file));
axios.post(`/api/face/register/${studentId}`, formData);
```

---

## 13. No Bugs Found

The backend code was fully audited. No bugs blocking API integration were identified. The previously noted `.env` fix (`?charset=utf8mb4` in DATABASE_URL) has already been applied.
