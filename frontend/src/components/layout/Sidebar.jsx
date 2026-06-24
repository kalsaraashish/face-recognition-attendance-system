import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  Building2,
  BookOpen,
  CalendarCheck,
  Camera,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isAdmin = user?.role === 'ADMIN';
  const isFaculty = user?.role === 'FACULTY';
  const isStudent = user?.role === 'STUDENT';

  // Helper to determine if link is active
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const linkClass = (path) => {
    const active = isActive(path);
    // Face attendance has a special highlight if active
    const isFace = path === '/attendance/face';
    
    return `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? isFace
          ? 'bg-blue-500 text-white shadow-sm'
          : 'bg-blue-600 text-white shadow-sm'
        : 'text-blue-200 hover:text-white hover:bg-white/10'
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500 text-white">
              <Camera className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FaceAttend</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {/* Common Section */}
          <div className="space-y-1">
            <NavLink to="/dashboard" className={linkClass('/dashboard')} onClick={onClose}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          {/* ADMIN & FACULTY management sections */}
          {(isAdmin || isFaculty) && (
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-blue-300/80">
                Management
              </p>
              <div className="mt-2 space-y-1">
                <NavLink to="/students" className={linkClass('/students')} onClick={onClose}>
                  <GraduationCap className="h-5 w-5" />
                  <span>Students</span>
                </NavLink>
                {isAdmin && (
                  <>
                    <NavLink to="/faculty" className={linkClass('/faculty')} onClick={onClose}>
                      <Users className="h-5 w-5" />
                      <span>Faculty</span>
                    </NavLink>
                    <NavLink to="/departments" className={linkClass('/departments')} onClick={onClose}>
                      <Building2 className="h-5 w-5" />
                      <span>Departments</span>
                    </NavLink>
                    <NavLink to="/subjects" className={linkClass('/subjects')} onClick={onClose}>
                      <BookOpen className="h-5 w-5" />
                      <span>Subjects</span>
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE sections for Admin & Faculty */}
          {(isAdmin || isFaculty) && (
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-blue-300/80">
                Attendance
              </p>
              <div className="mt-2 space-y-1">
                <NavLink to="/attendance" className={isActive('/attendance/face') ? linkClass('/not-active-path') : linkClass('/attendance')} onClick={onClose}>
                  <CalendarCheck className="h-5 w-5" />
                  <span>Sessions</span>
                </NavLink>
                <NavLink
                  to="/attendance/face"
                  className={linkClass('/attendance/face')}
                  onClick={onClose}
                >
                  <Camera className="h-5 w-5 text-blue-300 animate-pulse" />
                  <span className="font-semibold text-white">Face Attendance</span>
                </NavLink>
              </div>
            </div>
          )}

          {/* STUDENT sections */}
          {isStudent && (
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-blue-300/80">
                Attendance
              </p>
              <div className="mt-2 space-y-1">
                <NavLink to="/attendance/student/me" className={linkClass('/attendance/student/me')} onClick={onClose}>
                  <CalendarCheck className="h-5 w-5" />
                  <span>My Attendance</span>
                </NavLink>
              </div>
            </div>
          )}

          {/* REPORTS sections for Admin & Faculty */}
          {(isAdmin || isFaculty) && (
            <div className="space-y-1">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-blue-300/80">
                Reports
              </p>
              <div className="mt-2 space-y-1">
                <NavLink to="/reports" className={linkClass('/reports')} onClick={onClose}>
                  <BarChart3 className="h-5 w-5" />
                  <span>Reports</span>
                </NavLink>
              </div>
            </div>
          )}

          {/* ACCOUNT section */}
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-blue-300/80">
              Account
            </p>
            <div className="mt-2 space-y-1">
              <NavLink to="/settings" className={linkClass('/settings')} onClick={onClose}>
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </NavLink>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center space-x-3 rounded-lg bg-white/5 px-3 py-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="truncate text-sm font-medium text-white">{user?.name}</h4>
              <p className="truncate text-xs text-blue-300 uppercase">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
