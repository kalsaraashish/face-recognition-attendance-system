import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { getMyDashboard } from '../api/dashboardApi';
import StatCard from '../components/dashboard/StatCard';
import { WeeklyOverviewChart, AttendanceBreakdownChart } from '../components/dashboard/AttendanceChart';
import Spinner from '../components/common/Spinner';
import ErrorState from '../components/common/ErrorState';
import {
  GraduationCap,
  Users,
  Building,
  TrendingUp,
  Calendar,
  UserCheck,
  CalendarCheck,
  CheckCircle,
  XCircle,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// TODO: No backend endpoint for recent activity — using dummy data
// Replace with real API when available
const DUMMY_RECENT_ACTIVITY = [
  { id: 1, action: 'Face registered', target: 'Rohan Patel (MCA)', time: '10 mins ago', type: 'info' },
  { id: 2, action: 'Attendance session created', target: 'Machine Learning by Dr. Priya Sharma', time: '1 hour ago', type: 'success' },
  { id: 3, action: 'Manual attendance updated', target: 'Semester 3 CSE (2 Absent marked Present)', time: '3 hours ago', type: 'warning' },
  { id: 4, action: 'New Faculty added', target: 'Dr. Amit Verma (ECE)', time: '5 hours ago', type: 'info' },
  { id: 5, action: 'Excel report exported', target: 'Daily report - 23 Jun 2024', time: 'Yesterday', type: 'default' },
];

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashData = await getMyDashboard();
      setData(dashData);
    } catch (err) {
      console.error(err);
      setError('Could not load dashboard information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-10 w-10 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  const renderAdminDashboard = () => {
    // Computed absent students from total students and present count
    const totalPresent = data?.today_attendance_count || 0;
    const totalStudents = data?.total_students || 0;
    const computedAbsent = Math.max(0, totalStudents - totalPresent);

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Stat cards row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={data?.total_students}
            icon={GraduationCap}
            color="blue"
            subtitle="Enrolled students"
          />
          <StatCard
            title="Total Faculty"
            value={data?.total_faculty}
            icon={Users}
            color="indigo"
            subtitle="Registered instructors"
          />
          <StatCard
            title="Departments"
            value={data?.total_departments}
            icon={Building}
            color="purple"
            subtitle="Academic wings"
          />
          <StatCard
            title="Today Attendance"
            value={`${data?.overall_attendance_percentage || 0}%`}
            icon={TrendingUp}
            color="green"
            subtitle="Checked in today"
          />
        </div>

        {/* Stat cards row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard
            title="Today's Sessions"
            value={data?.today_sessions_count}
            icon={Calendar}
            color="amber"
            subtitle="Scheduled classes for today"
          />
          <StatCard
            title="Active Students"
            value={data?.active_students}
            icon={UserCheck}
            color="teal"
            subtitle="Status set to active"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeeklyOverviewChart data={data?.weekly_attendance} />
          </div>
          <div>
            <AttendanceBreakdownChart present={totalPresent} absent={computedAbsent} />
          </div>
        </div>

        {/* Activity feeds */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 border-b border-slate-150 pb-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-800 tracking-tight">
                Recent Activity Logs
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              System Wide
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {!data?.recent_activities || data.recent_activities.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No recent activity logged.
              </p>
            ) : (
              data.recent_activities.map((act) => (
                <div key={act.id} className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-slate-800">
                      {act.action}
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                      {act.target}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{act.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFacultyDashboard = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard
            title="Today's Sessions"
            value={data?.today_sessions}
            icon={Calendar}
            color="amber"
            subtitle="Classes remaining"
          />
          <StatCard
            title="Total Sessions"
            value={data?.total_sessions}
            icon={CalendarCheck}
            color="blue"
            subtitle="Overall classes logged"
          />
          <StatCard
            title="Present Today"
            value={data?.students_present_today}
            icon={CheckCircle}
            color="green"
            subtitle="Checked in"
          />
          <StatCard
            title="Absent Today"
            value={data?.students_absent_today}
            icon={XCircle}
            color="red"
            subtitle="Unmarked students"
          />
          <StatCard
            title="Today Attendance%"
            value={`${data?.today_attendance_percentage || 0}%`}
            icon={TrendingUp}
            color="teal"
            subtitle="Session average"
          />
        </div>

        {/* Quick action banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-700 to-brand-900 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between h-44">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold tracking-tight">Mark Face Attendance</h3>
              <p className="text-xs text-blue-100 max-w-sm">
                Launch the live scanner feed to automatically take class attendance using the webcam.
              </p>
            </div>
            <Link
              to="/attendance/face"
              className="inline-flex items-center space-x-2 text-sm font-semibold bg-white text-blue-800 px-4 py-2 rounded-lg self-start hover:bg-slate-50 transition-colors shadow-md"
            >
              <span>Launch Camera</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between h-44">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Manual Attendance</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Create new sessions, review active logs, or manually check in students.
              </p>
            </div>
            <Link
              to="/attendance"
              className="inline-flex items-center space-x-2 text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg self-start hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/10"
            >
              <span>Manage Sessions</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  const renderStudentDashboard = () => {
    const percentage = data?.attendance_percentage || 0;
    
    // Draw SVG circle math
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
        {/* Left Side: Circular attendance ring */}
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-sm flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
            Overall Attendance
          </h3>

          <div className="relative flex items-center justify-center h-48 w-48">
            <svg className="h-full w-full transform -rotate-95">
              {/* Back track ring */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                className="stroke-slate-100"
                strokeWidth="12"
                fill="none"
              />
              {/* Active filled ring */}
              <circle
                cx="96"
                cy="96"
                r={radius}
                className="stroke-blue-600 transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800">{percentage}%</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
                Logged Rate
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-6 max-w-xs font-medium">
            Maintain your attendance above 75% to remain compliant with academic criteria guidelines.
          </p>
        </div>

        {/* Right Side: Stat metrics cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Present Days"
              value={data?.present_days}
              icon={CheckCircle}
              color="green"
              subtitle="Lectures attended"
            />
            <StatCard
              title="Absent Days"
              value={data?.absent_days}
              icon={XCircle}
              color="red"
              subtitle="Lectures missed"
            />
            <StatCard
              title="Total Sessions"
              value={data?.total_sessions}
              icon={CalendarCheck}
              color="blue"
              subtitle="All registered sessions"
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3">
              Attendance details for {data?.full_name}
            </h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <span className="text-slate-400">Enrollment Number:</span>
                <p className="text-sm font-semibold text-slate-800">{data?.enrollment_no}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400">Status:</span>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 uppercase">
                    Active Student
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getGreeting = () => {
    return `Good morning, ${user?.name || 'User'}`;
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Dashboard
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          {getGreeting()}
        </p>
      </div>

      {/* Render based on roles */}
      {user?.role === 'ADMIN' && renderAdminDashboard()}
      {user?.role === 'FACULTY' && renderFacultyDashboard()}
      {user?.role === 'STUDENT' && renderStudentDashboard()}
    </div>
  );
};

export default DashboardPage;
