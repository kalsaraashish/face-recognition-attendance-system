import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Guards & Routing Components
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StudentDetailPage from './pages/StudentDetailPage';
import FacultyPage from './pages/FacultyPage';
import DepartmentsPage from './pages/DepartmentsPage';
import SubjectsPage from './pages/SubjectsPage';
import AttendancePage from './pages/AttendancePage';
import AttendanceSessionPage from './pages/AttendanceSessionPage';
import FaceAttendancePage from './pages/FaceAttendancePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import StudentLeavePage from './pages/StudentLeavePage';
import ManageLeavePage from './pages/ManageLeavePage';

// Import App.css (cleared in setup)
import './App.css';

export const App = () => {
  const allRoles = ['ADMIN', 'FACULTY', 'STUDENT'];
  const adminFaculty = ['ADMIN', 'FACULTY'];
  const adminOnly = ['ADMIN'];

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes utilizing AppLayout shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard: All Roles */}
            <Route
              path="dashboard"
              element={
                <RoleRoute allowedRoles={allRoles}>
                  <DashboardPage />
                </RoleRoute>
              }
            />

            {/* Students: Admin & Faculty */}
            <Route
              path="students"
              element={
                <RoleRoute allowedRoles={adminFaculty}>
                  <StudentsPage />
                </RoleRoute>
              }
            />
            <Route
              path="students/:id"
              element={
                <RoleRoute allowedRoles={adminFaculty}>
                  <StudentDetailPage />
                </RoleRoute>
              }
            />

            {/* Faculty: Admin & Faculty */}
            <Route
              path="faculty"
              element={
                <RoleRoute allowedRoles={adminFaculty}>
                  <FacultyPage />
                </RoleRoute>
              }
            />

            {/* Departments: Admin Only */}
            <Route
              path="departments"
              element={
                <RoleRoute allowedRoles={adminOnly}>
                  <DepartmentsPage />
                </RoleRoute>
              }
            />

            {/* Subjects: Admin Only */}
            <Route
              path="subjects"
              element={
                <RoleRoute allowedRoles={adminOnly}>
                  <SubjectsPage />
                </RoleRoute>
              }
            />

            {/* Attendance: Admin & Faculty */}
            <Route
              path="attendance"
              element={
                <RoleRoute allowedRoles={adminFaculty}>
                  <AttendancePage />
                </RoleRoute>
              }
            />
            <Route
              path="attendance/session/:id"
              element={
                <RoleRoute allowedRoles={adminFaculty}>
                  <AttendanceSessionPage />
                </RoleRoute>
              }
            />
            <Route
              path="attendance/face"
              element={
                <RoleRoute allowedRoles={adminFaculty}>
                  <FaceAttendancePage />
                </RoleRoute>
              }
            />

            {/* Reports: Admin & Faculty */}
            <Route
              path="reports"
              element={
                <RoleRoute allowedRoles={adminFaculty}>
                  <ReportsPage />
                </RoleRoute>
              }
            />

            {/* STUDENT sections */}
            <Route
              path="attendance/student/me"
              element={
                <RoleRoute allowedRoles={['STUDENT']}>
                  <StudentAttendancePage />
                </RoleRoute>
              }
            />
            <Route
              path="attendance/student/leaves"
              element={
                <RoleRoute allowedRoles={['STUDENT']}>
                  <StudentLeavePage />
                </RoleRoute>
              }
            />

            {/* Leave management: Admin & Faculty */}
            <Route
              path="leaves/manage"
              element={
                <RoleRoute allowedRoles={adminFaculty}>
                  <ManageLeavePage />
                </RoleRoute>
              }
            />

            {/* Settings: All Roles */}
            <Route
              path="settings"
              element={
                <RoleRoute allowedRoles={allRoles}>
                  <SettingsPage />
                </RoleRoute>
              }
            />

            {/* Fallback 404 under layout */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#FFFFFF',
              color: '#1E293B',
              fontSize: '14px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
