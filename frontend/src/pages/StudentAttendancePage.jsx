import React, { useState, useEffect } from 'react';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import { Calendar, CheckCircle, XCircle, Award, Percent, ClipboardList } from 'lucide-react';
import { getStudentDashboard } from '../api/dashboardApi';
import { getStudentAttendanceRecords } from '../api/attendanceApi';

export const StudentAttendancePage = () => {
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch student dashboard to get ID and quick stats
      const dashboardData = await getStudentDashboard();
      setStats(dashboardData);

      // 2. Fetch detailed records using the student ID
      if (dashboardData?.student_id) {
        const recordsData = await getStudentAttendanceRecords(dashboardData.student_id);
        setRecords(recordsData);
      }
    } catch (err) {
      console.error('Failed to load attendance history', err);
      setError('Failed to load attendance records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const getStatusBadgeClass = (status) => {
    return status === 'PRESENT'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const getAttendancePctColor = (pct) => {
    if (pct >= 85) return 'text-emerald-600';
    if (pct >= 75) return 'text-blue-600';
    return 'text-rose-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Attendance</h1>
        <p className="text-sm text-slate-500">View your overall attendance statistics and detailed logs</p>
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
          {error}
        </div>
      ) : (
        <>
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Percentage */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance Percentage</p>
                <h3 className={`text-2xl font-bold mt-1.5 ${getAttendancePctColor(stats?.attendance_percentage || 0)}`}>
                  {stats?.attendance_percentage ?? 0}%
                </h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Percent size={22} />
              </div>
            </div>

            {/* Present Days */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present Days</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{stats?.present_days ?? 0}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <CheckCircle size={22} />
              </div>
            </div>

            {/* Absent Days */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Absent Days</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{stats?.absent_days ?? 0}</h3>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                <XCircle size={22} />
              </div>
            </div>

            {/* Total Classes */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Classes</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{stats?.total_sessions ?? 0}</h3>
              </div>
              <div className="p-3 bg-slate-50 text-slate-650 rounded-lg">
                <Award size={22} />
              </div>
            </div>
          </div>

          {/* Attendance History */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-950 flex items-center space-x-2">
              <ClipboardList size={18} className="text-slate-600" />
              <span>Attendance History</span>
            </h2>

            {records.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No Attendance Logs Found"
                description="There are no attendance records logged for you in any class session yet."
              />
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-55 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Subject</th>
                        <th className="px-6 py-4">Faculty</th>
                        <th className="px-6 py-4">Timing</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Marked At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {records.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {new Date(rec.session_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-slate-900">{rec.subject_name}</p>
                              <p className="text-xs text-slate-450">{rec.subject_code}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700 font-medium">
                            {rec.faculty_name}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {rec.start_time.slice(0, 5)} - {rec.end_time.slice(0, 5)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(rec.status)}`}>
                              {rec.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-450">
                            {rec.marked_at ? new Date(rec.marked_at).toLocaleString() : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAttendancePage;
