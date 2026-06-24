# ANTIGRAVITY IDE — Complete Frontend Build Prompt
## AI-Based Face Recognition Attendance Management System

---

> **INSTRUCTIONS FOR ANTIGRAVITY IDE:**
> Read this entire document before writing a single line of code.
> Follow every section exactly. Do not invent APIs. Do not skip pages.
> Every page listed must be built. Every API contract must be matched exactly.

---

## SECTION 1 — PROJECT IDENTITY

**Project Name:** FaceAttend — AI Face Recognition Attendance System
**Frontend Tech:** React 18 + Vite + Tailwind CSS
**Backend:** FastAPI (already built, do not modify)
**Backend Base URL:** `http://localhost:8000`
**API Prefix:** `http://localhost:8000/api`
**Swagger Docs:** `http://localhost:8000/docs`

---

## SECTION 2 — DESIGN SYSTEM (Match Google Stitch UI Exactly)

### Color Palette
```
Primary Blue:        #1E40AF  (blue-800)
Primary Blue Light:  #3B82F6  (blue-500)
Primary Blue Dark:   #1E3A8A  (blue-900)
Sidebar Background:  #1E3A8A  (dark navy blue)
Sidebar Active:      #2563EB  (blue-600)
Sidebar Text:        #BFDBFE  (blue-200)
Sidebar Active Text: #FFFFFF
Top Navbar:          #FFFFFF  with bottom border
Page Background:     #F1F5F9  (slate-100)
Card Background:     #FFFFFF
Success Green:       #10B981  (emerald-500)
Warning Amber:       #F59E0B  (amber-500)
Danger Red:          #EF4444  (red-500)
Info Blue:           #3B82F6  (blue-500)
Text Primary:        #1E293B  (slate-800)
Text Secondary:      #64748B  (slate-500)
Border:              #E2E8F0  (slate-200)
```

### Typography
```
Font: Inter (Google Fonts)
Headings: font-bold, tracking-tight
Page titles: text-2xl font-bold text-slate-800
Section titles: text-lg font-semibold text-slate-700
Table headers: text-xs font-semibold uppercase tracking-wider text-slate-500
Body text: text-sm text-slate-600
```

### Layout Dimensions
```
Sidebar width:        256px (w-64), collapses to 72px (w-18) on mobile
Top Navbar height:    64px (h-16)
Content padding:      24px (p-6)
Card border-radius:   12px (rounded-xl)
Button border-radius: 8px (rounded-lg)
Card shadow:          shadow-sm with hover:shadow-md
Table row height:     48px minimum
```

### Component Patterns
- All cards: `bg-white rounded-xl shadow-sm border border-slate-200 p-6`
- All primary buttons: `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`
- All secondary buttons: `bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium`
- All danger buttons: `bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium`
- All inputs: `border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full`
- All tables: `w-full text-sm` with `thead bg-slate-50` and alternating `hover:bg-slate-50` rows
- Status badge PRESENT: `bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium`
- Status badge ABSENT: `bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium`
- Status badge Active: `bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium`
- Status badge Inactive: `bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs font-medium`

---

## SECTION 3 — REQUIRED FOLDER STRUCTURE

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js              ← Central Axios instance
│   │   ├── authApi.js
│   │   ├── studentApi.js
│   │   ├── facultyApi.js
│   │   ├── departmentApi.js
│   │   ├── subjectApi.js
│   │   ├── attendanceApi.js
│   │   ├── faceApi.js
│   │   ├── dashboardApi.js
│   │   └── reportApi.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopNavbar.jsx
│   │   │   └── AppLayout.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── SkeletonRow.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   └── Toast.jsx (or use react-hot-toast)
│   │   ├── dashboard/
│   │   │   ├── StatCard.jsx
│   │   │   └── AttendanceChart.jsx
│   │   ├── students/
│   │   │   ├── StudentForm.jsx
│   │   │   └── StudentRow.jsx
│   │   ├── faculty/
│   │   │   └── FacultyForm.jsx
│   │   ├── attendance/
│   │   │   ├── SessionForm.jsx
│   │   │   ├── AttendanceTable.jsx
│   │   │   └── CameraCapture.jsx
│   │   └── face/
│   │       └── FaceRegisterModal.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useStudents.js
│   │   ├── useFaculty.js
│   │   ├── useDepartments.js
│   │   ├── useSubjects.js
│   │   └── useAttendance.js
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── StudentsPage.jsx
│   │   ├── StudentDetailPage.jsx
│   │   ├── FacultyPage.jsx
│   │   ├── DepartmentsPage.jsx
│   │   ├── SubjectsPage.jsx
│   │   ├── AttendancePage.jsx
│   │   ├── AttendanceSessionPage.jsx
│   │   ├── FaceAttendancePage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── routes/
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleRoute.jsx
│   ├── utils/
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── constants.js
│   ├── App.jsx               ← Only router setup here, no page code
│   ├── main.jsx
│   ├── index.css             ← Tailwind directives only
│   └── App.css               ← Clear this file, use Tailwind only
├── .env
├── .env.example
├── index.html
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

---

## SECTION 4 — REQUIRED NPM PACKAGES

Run these exact commands:

```bash
# Core routing
npm install react-router-dom

# HTTP client
npm install axios

# Toast notifications
npm install react-hot-toast

# Charts for dashboard/reports
npm install recharts

# Icons
npm install lucide-react

# Date formatting
npm install date-fns

# Tailwind CSS (if not already installed)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## SECTION 5 — TAILWIND SETUP

### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        }
      }
    },
  },
  plugins: [],
}
```

### `src/index.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## SECTION 6 — ENVIRONMENT VARIABLES

### `frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=FaceAttend
```

### `frontend/.env.example`
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=FaceAttend
```

---

## SECTION 7 — CENTRAL API CLIENT

### `src/api/axios.js`
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## SECTION 8 — AUTH CONTEXT

### `src/context/AuthContext.jsx`
```javascript
// Must provide:
// - user: { id, name, email, role, status }
// - isAuthenticated: boolean
// - login(email, password): calls POST /api/auth/login, stores tokens, sets user
// - logout(): clears localStorage, redirects to /login
// - loading: boolean (true while checking stored token on mount)

// On mount: if access_token in localStorage, call GET /api/auth/me to rehydrate user
// Store in localStorage: access_token, refresh_token, user (JSON)
```

---

## SECTION 9 — ROUTING SETUP

### `src/App.jsx` — Router only, no page JSX
```javascript
// Routes:
// /login                    → LoginPage (public, redirect to /dashboard if already authed)
// /                         → redirect to /dashboard
// /dashboard                → DashboardPage (protected, all roles)
// /students                 → StudentsPage (ADMIN + FACULTY)
// /students/:id             → StudentDetailPage (ADMIN + FACULTY)
// /faculty                  → FacultyPage (ADMIN + FACULTY)
// /departments              → DepartmentsPage (ADMIN only)
// /subjects                 → SubjectsPage (ADMIN only)
// /attendance               → AttendancePage (ADMIN + FACULTY)
// /attendance/session/:id   → AttendanceSessionPage (ADMIN + FACULTY)
// /attendance/face          → FaceAttendancePage (ADMIN + FACULTY)
// /reports                  → ReportsPage (ADMIN + FACULTY)
// /settings                 → SettingsPage (all roles — shows change password)
// *                         → NotFoundPage
```

### `src/routes/ProtectedRoute.jsx`
- If not authenticated → redirect to /login
- Show spinner while loading auth state

### `src/routes/RoleRoute.jsx`
- Accepts `allowedRoles` prop (array)
- If user role not in allowedRoles → show 403 message or redirect to /dashboard

---

## SECTION 10 — ALL API MODULES

### `src/api/authApi.js`
```javascript
// login(email, password) → POST /auth/login
// refreshToken(refreshToken) → POST /auth/refresh
// changePassword(current_password, new_password, confirm_password) → POST /auth/change-password
// getMe() → GET /auth/me
```

### `src/api/studentApi.js`
```javascript
// listStudents(params) → GET /students?page=&per_page=&search=&department_id=&semester=&status=
// searchStudents(q, params) → GET /students/search?q=
// getStudent(id) → GET /students/{id}
// createStudent(data) → POST /students
// updateStudent(id, data) → PUT /students/{id}
// deleteStudent(id) → DELETE /students/{id}
```

### `src/api/facultyApi.js`
```javascript
// listFaculty(params) → GET /faculty?page=&per_page=&department_id=&status=
// getFaculty(id) → GET /faculty/{id}
// createFaculty(data) → POST /faculty
// updateFaculty(id, data) → PUT /faculty/{id}
// deleteFaculty(id) → DELETE /faculty/{id}
```

### `src/api/departmentApi.js`
```javascript
// listDepartments() → GET /departments
// getDepartment(id) → GET /departments/{id}
// createDepartment(data) → POST /departments
// updateDepartment(id, data) → PUT /departments/{id}
// deleteDepartment(id) → DELETE /departments/{id}
```

### `src/api/subjectApi.js`
```javascript
// listSubjects(params) → GET /subjects?department_id=&semester=
// getSubject(id) → GET /subjects/{id}
// createSubject(data) → POST /subjects
// updateSubject(id, data) → PUT /subjects/{id}
// deleteSubject(id) → DELETE /subjects/{id}
```

### `src/api/attendanceApi.js`
```javascript
// createSession(data) → POST /attendance/session
// listSessions(params) → GET /attendance/sessions
// getSession(id) → GET /attendance/sessions/{id}
// markAttendance(data) → POST /attendance/mark
// markByFace(session_id, imageBlob) → POST /attendance/mark/face (multipart)
// getSessionRecords(sessionId) → GET /attendance/sessions/{id}/records
// getStudentSummary(studentId, params) → GET /attendance/student/{id}/summary
```

### `src/api/faceApi.js`
```javascript
// registerFace(studentId, files) → POST /face/register/{student_id} (multipart)
// recognizeFace(imageBlob) → POST /face/recognize (multipart)
// deleteEncodings(studentId) → DELETE /face/{student_id}
```

### `src/api/dashboardApi.js`
```javascript
// getMyDashboard() → GET /dashboard/me
// getAdminDashboard() → GET /dashboard/admin
// getFacultyDashboard() → GET /dashboard/faculty
// getStudentDashboard() → GET /dashboard/student
```

### `src/api/reportApi.js`
```javascript
// getDailyReport(params) → GET /reports/daily
// getMonthlyReport(year, month, params) → GET /reports/monthly
// getStudentReport(studentId, params) → GET /reports/student/{id}
// getDepartmentReport(deptId, params) → GET /reports/department/{id}
// exportExcel(params) → GET /reports/export/excel (trigger file download)
// exportPdf(params) → GET /reports/export/pdf (trigger file download)
```

---

## SECTION 11 — PAGE SPECIFICATIONS

### PAGE 1: `LoginPage.jsx`

**Route:** `/login`
**Auth:** Public (redirect to /dashboard if already logged in)

**Design:**
- Full-screen split layout: left side = brand panel (dark blue gradient with app logo + tagline), right side = login form
- Logo area: Camera icon + "FaceAttend" in large bold white text + tagline "AI-Powered Attendance System"
- Form card: centered, white, rounded-xl, shadow-lg, max-w-md
- Title: "Welcome Back" + subtitle "Sign in to your account"
- Fields: Email (with Mail icon), Password (with Eye toggle for show/hide)
- Primary button: "Sign In" (full width, blue)
- Error state: red alert box below form for invalid credentials
- Loading state: spinner inside button, button disabled

**API:** `POST /api/auth/login`

**On success:**
1. Store `access_token` in localStorage
2. Store `refresh_token` in localStorage
3. Store `user` object (JSON) in localStorage
4. Redirect to `/dashboard`

---

### PAGE 2: `DashboardPage.jsx`

**Route:** `/dashboard`
**Auth:** All roles

**Design:**
- Page title: "Dashboard" + greeting "Good morning, {user.name}"
- Renders different dashboard content based on `user.role`

**For ADMIN role — calls `GET /api/dashboard/admin`:**

Stat cards row (4 cards):
```
Card 1: Total Students    → total_students      (blue, GraduationCap icon)
Card 2: Total Faculty     → total_faculty       (indigo, Users icon)
Card 3: Departments       → total_departments   (purple, Building icon)
Card 4: Today Attendance% → overall_attendance_percentage + "%" (green, TrendingUp icon)
```

Second row — 2 more cards:
```
Card 5: Today's Sessions  → today_sessions_count  (amber, Calendar icon)
Card 6: Active Students   → active_students        (teal, UserCheck icon)
```

Charts section:
- Recharts `BarChart`: "Weekly Attendance Overview" — use dummy data (7 days, Mon–Sun) with TODO comment
- Recharts `PieChart` or `DonutChart`: "Attendance Breakdown" — Present vs Absent using `today_attendance_count` and computed absent

Recent Activity table:
- TODO: No API endpoint — use dummy data. Comment: `// TODO: No recent activity endpoint in backend`

**For FACULTY role — calls `GET /api/dashboard/faculty`:**
```
Card 1: Today's Sessions     → today_sessions
Card 2: Total Sessions       → total_sessions
Card 3: Present Today        → students_present_today (green)
Card 4: Absent Today         → students_absent_today (red)
Card 5: Today Attendance%    → today_attendance_percentage
```

**For STUDENT role — calls `GET /api/dashboard/student`:**
```
Card 1: Overall Attendance%  → attendance_percentage (circular progress indicator)
Card 2: Present Days         → present_days (green)
Card 3: Absent Days          → absent_days (red)
Card 4: Total Sessions       → total_sessions
```
Student dashboard does NOT show other students. Just their own data.

---

### PAGE 3: `StudentsPage.jsx`

**Route:** `/students`
**Auth:** ADMIN, FACULTY (FACULTY = read only, no create/edit/delete buttons)

**Design:**
- Page header: "Students Management" + student count badge + "Add Student" button (ADMIN only)
- Filter bar: search input, department dropdown, semester dropdown, status toggle
- Data table with columns: #, Enrollment No, Name, Department, Semester, Status (badge), Face (badge: Registered/Not Registered), Actions
- Pagination component below table
- Loading state: 5 SkeletonRow components
- Empty state: illustration + "No students found" message

**Add/Edit Student Modal:**
Fields:
```
enrollment_no    (text, required)
first_name       (text, required)
last_name        (text, required)
email            (email, required)
mobile           (text, optional)
department_id    (select — populated from GET /api/departments)
semester         (select 1–8, required)
```

**Row Actions (ADMIN only):**
- Edit (pencil icon) → opens edit modal pre-filled
- Face Register (Camera icon) → opens FaceRegisterModal
- Delete (trash icon) → opens ConfirmDialog, calls DELETE /api/students/{id}

**APIs used:**
- `GET /api/students` (with filters)
- `GET /api/departments` (for dropdown)
- `POST /api/students`
- `PUT /api/students/{id}`
- `DELETE /api/students/{id}`

---

### PAGE 4: `StudentDetailPage.jsx`

**Route:** `/students/:id`
**Auth:** ADMIN, FACULTY

**Design:**
- Breadcrumb: Students > Student Name
- Left panel: student photo (or avatar placeholder), name, enrollment no, status badge, department, semester, email, mobile
- Right panel tabs:
  - "Attendance Summary" tab: shows `GET /api/attendance/student/{id}/summary` data with filter dropdowns (subject, date range)
    - Attendance percentage circular ring chart
    - Present / Absent count cards
  - "Attendance Records" tab: table of sessions with date, subject, status

**APIs used:**
- `GET /api/students/{id}`
- `GET /api/attendance/student/{id}/summary`

---

### PAGE 5: `FacultyPage.jsx`

**Route:** `/faculty`
**Auth:** ADMIN, FACULTY (read-only for FACULTY)

**Design:**
- Same pattern as Students page
- Table columns: #, Faculty Code, Name, Department, Email, Mobile, Status, Actions
- Add/Edit Faculty Modal fields:
  ```
  faculty_code    (text, required)
  name            (text, required)
  email           (email, required)
  mobile          (text, optional)
  department_id   (select from GET /api/departments)
  password        (password, required for create, hidden for edit)
  ```
- Delete: ConfirmDialog before DELETE /api/faculty/{id}

---

### PAGE 6: `DepartmentsPage.jsx`

**Route:** `/departments`
**Auth:** ADMIN only

**Design:**
- Grid of department cards (not a table)
- Each card: department name, description, edit/delete buttons
- "Add Department" button opens modal
- Modal fields: name (required), description (optional)

---

### PAGE 7: `SubjectsPage.jsx`

**Route:** `/subjects`
**Auth:** ADMIN only

**Design:**
- Table: Subject Code, Subject Name, Department, Semester, Actions
- Filters: department dropdown, semester dropdown
- Add/Edit modal fields:
  ```
  subject_code    (text, required)
  subject_name    (text, required)
  department_id   (select from GET /api/departments)
  semester        (select 1–8)
  ```

---

### PAGE 8: `AttendancePage.jsx`

**Route:** `/attendance`
**Auth:** ADMIN, FACULTY

**Design:**
- Two tabs: "Sessions" and "Mark Attendance"

**Sessions tab:**
- Filters: faculty_id (ADMIN only), department, date picker
- Table: Session ID, Date, Department, Semester, Subject, Time, Actions
- "Create Session" button → SessionForm modal
- Row action "View Records" → navigates to `/attendance/session/:id`
- Row action "Take Attendance" → navigates to `/attendance/face` with session pre-selected

**Mark Attendance tab:**
- Dropdown: Select Session (loads from GET /api/attendance/sessions)
- After selecting session: load students (GET /api/students with dept+semester filter)
- Student list with PRESENT / ABSENT toggle for each
- Batch save: calls POST /api/attendance/mark for each student
- Real-time status: already marked students show their status (calls GET /api/attendance/sessions/{id}/records)

---

### PAGE 9: `AttendanceSessionPage.jsx`

**Route:** `/attendance/session/:id`
**Auth:** ADMIN, FACULTY

**Design:**
- Session header card: Date, Department, Subject, Semester, Faculty, Time
- Attendance records table: Enrollment No, Student Name, Status (PRESENT/ABSENT badge), Marked At
- Stats: Total Enrolled, Present count (green), Absent count (red), Percentage
- Export buttons: "Download PDF" and "Download Excel" (use GET /api/reports/export/pdf and /excel with session_date)

---

### PAGE 10: `FaceAttendancePage.jsx`

**Route:** `/attendance/face`
**Auth:** ADMIN, FACULTY

**Design:**
- Step 1 — Select Session:
  - Dropdown: Active session for today (GET /api/attendance/sessions?session_date=today)
  - "Create New Session" quick-create button
  - "Start Camera" button

- Step 2 — Live Camera Attendance:
  - Full camera feed in a rounded card (use `navigator.mediaDevices.getUserMedia`)
  - Below camera: session info (subject, date)
  - "Capture & Mark" button
  - On capture: convert canvas frame to Blob, POST `/api/attendance/mark/face` with FormData
  - Result card appears (slides in):
    - If matched: green card with student photo placeholder, name, enrollment, "PRESENT ✓"
    - If not matched: red card with "Face Not Recognized" message
    - If already marked: amber card with "Already marked present"
  - Recent captures list: last 5 marked students in a scrollable row
  - "Stop Camera" button

**Camera Capture Code Pattern:**
```javascript
// In CameraCapture.jsx:
const videoRef = useRef(null);
const canvasRef = useRef(null);

const startCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  videoRef.current.srcObject = stream;
};

const capture = () => {
  const canvas = canvasRef.current;
  const video = videoRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  canvas.toBlob(async (blob) => {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('image', blob, 'capture.jpg');
    const res = await api.post('/attendance/mark/face', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    // handle response
  }, 'image/jpeg');
};
```

---

### PAGE 11: `ReportsPage.jsx`

**Route:** `/reports`
**Auth:** ADMIN, FACULTY

**Design:**
- Two section tabs: "View Reports" and "Export"

**View Reports tab — 3 sub-tabs:**

1. **Daily Report:**
   - Date picker (default today)
   - Department + Semester + Subject filters
   - Table: Date, Department, Subject, Enrollment No, Student Name, Status
   - "Refresh" button
   - API: `GET /api/reports/daily`

2. **Monthly Report:**
   - Year + Month dropdowns
   - Department + Semester filters
   - Table: Enrollment No, Name, Total Sessions, Present, Absent, Percentage
   - Color code: red if < 75%, amber if 75–85%, green if > 85%
   - API: `GET /api/reports/monthly`

3. **Department Report:**
   - Department dropdown (required)
   - Semester + Subject + Date range filters
   - Same summary table as monthly
   - Recharts `BarChart`: top 10 students by attendance %
   - API: `GET /api/reports/department/{id}`

**Export tab:**
```
Export Daily Report:
  - Date picker
  - Department, Semester filters
  - "Download Excel" button → GET /api/reports/export/excel
  - "Download PDF" button → GET /api/reports/export/pdf

Note: Trigger download by creating <a> with href and clicking it, OR open in new tab
```

**Export button implementation:**
```javascript
const handleExport = async (format) => {
  const token = localStorage.getItem('access_token');
  const params = new URLSearchParams({ report_date: date, department_id: deptId });
  const url = `${import.meta.env.VITE_API_BASE_URL}/reports/export/${format}?${params}`;
  // Use fetch with Authorization header to get blob, then trigger download
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `attendance_${date}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
  link.click();
};
```

---

### PAGE 12: `SettingsPage.jsx`

**Route:** `/settings`
**Auth:** All roles

**Design:**
- Profile section: Avatar (initials-based), name, email, role badge, member since
- "Change Password" section (card below):
  - Current Password
  - New Password
  - Confirm New Password
  - "Update Password" button
  - API: `POST /api/auth/change-password`
- For ADMIN: additional "System Information" card showing API base URL, version

---

### PAGE 13: `NotFoundPage.jsx`
- 404 illustration with robot/camera icon
- "Page Not Found" heading
- "Go to Dashboard" button

---

## SECTION 12 — SIDEBAR NAVIGATION

### Sidebar structure by role:

**ADMIN sees:**
```
Logo area: Camera icon + "FaceAttend"

Navigation:
  Dashboard       /dashboard        (LayoutDashboard icon)
  ─── MANAGEMENT ───
  Students        /students         (GraduationCap icon)
  Faculty         /faculty          (Users icon)
  Departments     /departments      (Building2 icon)
  Subjects        /subjects         (BookOpen icon)
  ─── ATTENDANCE ───
  Sessions        /attendance       (CalendarCheck icon)
  Face Attendance /attendance/face  (Camera icon)  ← highlighted in blue
  ─── REPORTS ───
  Reports         /reports          (BarChart3 icon)
  ─── ACCOUNT ───
  Settings        /settings         (Settings icon)
```

**FACULTY sees:**
```
  Dashboard       /dashboard
  Students        /students         (read only)
  Sessions        /attendance
  Face Attendance /attendance/face
  Reports         /reports
  Settings        /settings
```

**STUDENT sees:**
```
  Dashboard       /dashboard
  My Attendance   /attendance/student/me  → redirect to their own summary
  Settings        /settings
```

### Sidebar behavior:
- Active route: highlighted with `bg-blue-600` background, white text
- Inactive: `text-blue-200` hover `text-white bg-white/10`
- Collapsible on mobile (hamburger in TopNavbar)
- Section labels: uppercase, text-blue-300, text-xs

---

## SECTION 13 — TOP NAVBAR

**Contents:**
- Left: Hamburger button (mobile) + Page title (dynamic, matches current route)
- Right: 
  - Notification bell icon (TODO — no backend endpoint, show static badge)
  - User avatar (initials circle, blue bg)
  - Dropdown on click: shows name, email, role badge, divider, "Settings" link, "Logout" button

**Logout flow:**
1. Clear `access_token`, `refresh_token`, `user` from localStorage
2. Redirect to `/login`

---

## SECTION 14 — REUSABLE COMPONENTS

### `StatCard.jsx`
Props: `{ title, value, icon, color, subtitle, trend }`
- Shows value in large bold text
- Icon in colored circle background
- Optional trend arrow (up/down)

### `Modal.jsx`
Props: `{ isOpen, onClose, title, children, size }`
- Centered overlay with dark backdrop
- Close on backdrop click or X button
- Sizes: sm, md, lg, xl
- Animate: fade + scale in

### `ConfirmDialog.jsx`
Props: `{ isOpen, onClose, onConfirm, title, message, confirmLabel, loading }`
- Warning icon
- Two buttons: Cancel + Confirm (red)
- Loading spinner on confirm button while processing

### `Pagination.jsx`
Props: `{ page, totalPages, onPageChange }`
- Shows: Previous, page numbers, Next
- Disable prev on page 1, next on last page
- Show ellipsis for large page counts

### `Badge.jsx`
Props: `{ status }` — "PRESENT" | "ABSENT" | "active" | "inactive" | "ADMIN" | "FACULTY" | "STUDENT"
- Automatically picks correct color from design system

### `SkeletonRow.jsx`
- Animated gray pulse bars simulating a table row

### `EmptyState.jsx`
Props: `{ title, description, actionLabel, onAction }`
- Centered illustration (use an SVG or Lucide icon), message, optional button

### `SearchInput.jsx`
Props: `{ value, onChange, placeholder }`
- Input with Search icon inside, debounced (300ms)

---

## SECTION 15 — UX REQUIREMENTS

### Loading States
- All data fetches show skeleton loaders (not spinners)
- Table skeletons: 5 `SkeletonRow` components
- Card skeletons: gray pulse rectangles

### Error States
- API errors show an `ErrorState` component with retry button
- Form validation errors shown inline below each field (red text)
- Toast notifications for all success/error actions

### Toast Notifications (react-hot-toast)
```javascript
// Success
toast.success('Student created successfully');
// Error
toast.error(error.response?.data?.detail || 'Something went wrong');
// Loading + result
const toastId = toast.loading('Creating session...');
toast.success('Session created!', { id: toastId });
```

### Form Behavior
- All forms show field-level validation before submitting
- Submit button disabled while loading
- Submit button shows spinner while loading
- On success: close modal, show toast, refresh table
- On error: keep modal open, show error toast

### Confirmation Dialogs
- All destructive actions (Delete student, Delete faculty, etc.) must show ConfirmDialog first
- Dialog: "Are you sure?" + "This action cannot be undone."

### Responsive Design
- Desktop (≥1024px): sidebar always visible
- Tablet (768–1023px): sidebar collapses, hamburger toggles it as overlay
- Mobile (<768px): sidebar is drawer overlay, all tables scroll horizontally

---

## SECTION 16 — EXACT API CONTRACTS (Do Not Change)

### POST /api/auth/login
```
Request: { email: string, password: string }
Response: { access_token, refresh_token, token_type, expires_in, user: { id, name, email, role, status } }
```

### GET /api/students (query params)
```
?page=1&per_page=20&search=string&department_id=int&semester=int&status=bool
Response: { students: [...], total, page, per_page, total_pages }
```

### StudentOut shape:
```json
{
  "id": 1, "enrollment_no": "MCA2024001",
  "first_name": "Rohan", "last_name": "Patel", "full_name": "Rohan Patel",
  "email": "...", "mobile": "...",
  "department_id": 1, "department": { "id": 1, "name": "MCA" },
  "semester": 3, "photo_url": null, "status": true,
  "created_at": "...", "updated_at": "...",
  "has_face_registered": false
}
```

### POST /api/face/register/{student_id}
```
Request: multipart/form-data, field name = "images", multiple files
Response: { student_id, total_uploaded, registered, results: [{ filename, status, ... }] }
```

### POST /api/attendance/mark/face
```
Request: multipart/form-data
  - session_id: number (form field)
  - image: File (file field)
Response: AttendanceRecordOut { id, session_id, student_id, student_name, enrollment_no, status, marked_at }
```

### Error format:
```json
{ "detail": "Human-readable message", "status_code": 404 }
```

---

## SECTION 17 — DUMMY DATA RULES

Use dummy/mock data ONLY for features that have NO backend endpoint. Mark every such usage clearly:

```javascript
// TODO: No backend endpoint for recent activity — using dummy data
// Replace with real API when available
const DUMMY_RECENT_ACTIVITY = [ ... ];
```

Known endpoints with NO backend support:
- Weekly attendance chart data on Admin Dashboard → use dummy 7-day data
- Notifications bell → use dummy count of 3
- Recent activity feed → use dummy list of 5 items
- Student profile photo (photo_url is null in dev) → use initials-based avatar

Everything else must use real API calls.

---

## SECTION 18 — FORBIDDEN ACTIONS

1. ❌ Do NOT modify any backend file
2. ❌ Do NOT create frontend API endpoints that don't exist in the backend
3. ❌ Do NOT put page component logic inside `App.jsx`
4. ❌ Do NOT use inline styles (use Tailwind classes only)
5. ❌ Do NOT use any CSS framework other than Tailwind
6. ❌ Do NOT hardcode the backend URL anywhere except `.env` and `axios.js`
7. ❌ Do NOT use `useState` for server state — use proper API calls with loading/error states
8. ❌ Do NOT ignore CORS — the backend already allows localhost:5173
9. ❌ Do NOT skip empty states or loading states
10. ❌ Do NOT put all components in one file

---

## SECTION 19 — ACCEPTANCE CHECKLIST

The build is complete when ALL of the following are true:

### Setup
- [ ] `npm run dev` starts without errors on port 5173
- [ ] No console errors on initial load
- [ ] Tailwind CSS is working (test with a blue background div)
- [ ] `.env` file exists with `VITE_API_BASE_URL`

### Authentication
- [ ] Login page renders correctly with split layout
- [ ] Login with `admin@attendance.com` / `Admin@123456` succeeds
- [ ] JWT stored in localStorage after login
- [ ] Unauthenticated access to `/dashboard` redirects to `/login`
- [ ] Logout clears tokens and redirects to login
- [ ] Token auto-refresh works on 401 response
- [ ] `/api/auth/me` called on app mount to rehydrate user

### Layout
- [ ] Sidebar renders with correct nav items per role
- [ ] Active route is highlighted in sidebar
- [ ] Top navbar shows user name and role
- [ ] Responsive: sidebar collapses on mobile

### Dashboard
- [ ] Admin dashboard shows 6 stat cards from real API
- [ ] Faculty dashboard shows 5 stat cards from real API
- [ ] Student dashboard shows 4 cards from real API
- [ ] Charts render (dummy data with TODO comments is acceptable)

### Students
- [ ] Students table loads with pagination
- [ ] Search by name/enrollment works
- [ ] Department and semester filters work
- [ ] Create student modal opens and submits
- [ ] Edit student pre-fills form
- [ ] Delete shows confirm dialog then deletes
- [ ] "Face Registered" badge shows correctly

### Faculty
- [ ] Faculty table loads with pagination
- [ ] Create faculty creates both faculty and user account
- [ ] Edit and delete work

### Departments
- [ ] Departments grid loads
- [ ] CRUD operations work

### Subjects
- [ ] Subjects table loads with department/semester filter
- [ ] CRUD operations work

### Attendance
- [ ] Sessions list loads
- [ ] Create session form works with department/subject/date
- [ ] Manual attendance marking works
- [ ] Session records page shows attendance table

### Face Attendance
- [ ] Camera opens via getUserMedia
- [ ] Capture sends image to POST /api/attendance/mark/face
- [ ] Matched student result card shows
- [ ] Unmatched shows error card
- [ ] Duplicate attendance shows warning

### Face Registration
- [ ] Can upload multiple images for a student
- [ ] Progress/result feedback per image

### Reports
- [ ] Daily report loads with filters
- [ ] Monthly report loads with year/month filter
- [ ] Department report loads
- [ ] Excel download triggers file save
- [ ] PDF download triggers file save

### Settings
- [ ] Profile info displays correctly
- [ ] Change password form works
- [ ] Success/error toast shows after submit

### General UX
- [ ] All tables show skeleton while loading
- [ ] All tables show empty state when no data
- [ ] All API errors show toast with message from `error.response.data.detail`
- [ ] All destructive actions have confirmation dialogs
- [ ] All forms show inline validation errors
- [ ] All submit buttons disabled + show spinner while loading

---

## SECTION 20 — FINAL NOTES TO ANTIGRAVITY IDE

1. **Start with the scaffold**: Create folder structure, install packages, setup Tailwind, create axios client and AuthContext first.

2. **Build the shell next**: AppLayout (Sidebar + TopNavbar), ProtectedRoute, RoleRoute, and App.jsx routing.

3. **Build pages in this order**: Login → Dashboard → Students → Faculty → Departments → Subjects → Attendance → Face Attendance → Reports → Settings.

4. **Test each page before moving to the next.**

5. **The backend is running at `http://localhost:8000`**. It has CORS allowed for `http://localhost:5173`. Make sure Vite runs on port 5173 (default).

6. **Default admin credentials**: `admin@attendance.com` / `Admin@123456`

7. **The `GET /api/dashboard/me` endpoint is the safest endpoint for the dashboard** — it automatically returns the right data shape for whatever role calls it. Use `user.role` to decide which component to render.

8. **Face attendance requires HTTPS in production** for `getUserMedia`. In development on localhost, it works on HTTP.

9. **All multipart requests** must use `Content-Type: multipart/form-data` (Axios sets this automatically when you pass FormData).

10. **Do not import or reference the Stitch UI image files** as actual page content. They were reference images only. Build all UI with React + Tailwind code.
