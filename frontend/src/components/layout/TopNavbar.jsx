import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Menu, Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react';

export const TopNavbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/students/')) return 'Student Details';
    if (path === '/students') return 'Students Management';
    if (path === '/faculty') return 'Faculty Management';
    if (path === '/departments') return 'Departments';
    if (path === '/subjects') return 'Subjects';
    if (path.startsWith('/attendance/session/')) return 'Session Records';
    if (path === '/attendance/face') return 'Face Attendance';
    if (path === '/attendance') return 'Attendance Sessions';
    if (path === '/reports') return 'Reports';
    if (path === '/settings') return 'Settings';
    return 'FaceAttend';
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Left side: Hamburger and Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right side: Notifications and Profile */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell */}
        <button className="relative rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm ring-2 ring-slate-100 hover:bg-blue-700 transition-colors">
              {getInitials()}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none">
              <div className="px-3.5 py-2.5">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
                  {user?.role}
                </span>
              </div>
              <div className="my-1 border-t border-slate-100"></div>
              <Link
                to="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center space-x-2 rounded-lg px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <SettingsIcon className="h-4 w-4 text-slate-500" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="flex w-full items-center space-x-2 rounded-lg px-3.5 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
