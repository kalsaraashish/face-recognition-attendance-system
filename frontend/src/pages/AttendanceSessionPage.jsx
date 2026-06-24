import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession, getSessionRecords } from '../api/attendanceApi';
import { getDepartment } from '../api/departmentApi';
import { getSubject } from '../api/subjectApi';
import { getFaculty } from '../api/facultyApi';
import Spinner from '../components/common/Spinner';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { formatDate, formatTime } from '../utils/formatters';
import { FileSpreadsheet, FileText, Calendar, Clock, BookOpen, GraduationCap, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendanceSessionPage = () => {
  const { id } = useParams();
  const sessionId = Number(id);
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [department, setDepartment] = useState(null);
  const [subject, setSubject] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf' | null

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sessInfo, recsList] = await Promise.all([
        getSession(sessionId),
        getSessionRecords(sessionId),
      ]);
      setSession(sessInfo);
      setRecords(recsList);

      // Fetch related metadata details
      try {
        const [deptData, subData, facData] = await Promise.all([
          getDepartment(sessInfo.department_id),
          getSubject(sessInfo.subject_id),
          getFaculty(sessInfo.faculty_id),
        ]);
        setDepartment(deptData);
        setSubject(subData);
        setFaculty(facData);
      } catch (err) {
        console.error('Failed to load nested session metadata details', err);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load session details and student logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const handleExport = async (format) => {
    if (!session) return;
    setExporting(format);
    const toastId = toast.loading(`Generating ${format.toUpperCase()} report...`);
    
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({
        report_date: session.session_date,
        department_id: session.department_id,
        semester: session.semester,
        subject_id: session.subject_id,
      });

      const url = `${import.meta.env.VITE_API_BASE_URL}/reports/export/${format}?${params}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Export failed on the server');
      }

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `attendance_session_${sessionId}_${session.session_date}.${
        format === 'excel' ? 'xlsx' : 'pdf'
      }`;
      link.click();
      toast.success('Report downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to export report. Make sure server reports exist.', { id: toastId });
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-10 w-10 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  // Calculate statistics
  const totalEnrolled = records.length;
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const absentCount = totalEnrolled - presentCount;
  const attendanceRate = totalEnrolled > 0 ? ((presentCount / totalEnrolled) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Back button and title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/attendance')}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-white border border-slate-200 shadow-sm"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Session Records
            </h2>
            <p className="text-xs text-slate-400 font-semibold uppercase">ID: #{session?.id}</p>
          </div>
        </div>

        {/* Export triggers */}
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            onClick={() => handleExport('excel')}
            loading={exporting === 'excel'}
            disabled={records.length === 0}
            className="text-xs"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
            Download Excel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport('pdf')}
            loading={exporting === 'pdf'}
            disabled={records.length === 0}
            className="text-xs"
          >
            <FileText className="mr-2 h-4 w-4 text-red-500" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Grid: Details card & Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Session Details
          </h3>
          
          <div className="space-y-3.5 text-sm">
            <div className="flex items-center space-x-2.5 text-slate-655">
              <Calendar className="h-4.5 w-4.5 text-slate-400" />
              <span className="font-semibold text-slate-800">{formatDate(session?.session_date)}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-655">
              <Clock className="h-4.5 w-4.5 text-slate-400" />
              <span>{formatTime(session?.start_time)} - {formatTime(session?.end_time)}</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-655">
              <GraduationCap className="h-4.5 w-4.5 text-slate-400" />
              <span>{department?.name || `Dept ID: ${session?.department_id}`} (Semester {session?.semester})</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-655">
              <BookOpen className="h-4.5 w-4.5 text-slate-400" />
              <span className="font-semibold text-slate-800">
                {subject ? `${subject.subject_code} - ${subject.subject_name}` : `Subject ID: ${session?.subject_id}`}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 uppercase font-semibold">Faculty In-charge</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">
              {faculty?.name || `Faculty ID: ${session?.faculty_id}`}
            </p>
          </div>
        </div>

        {/* Stats card present */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Attendance Rate
            </h4>
            <h2 className="text-4xl font-black text-slate-850 mt-4">
              {attendanceRate}%
            </h2>
          </div>
          <div className="border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
            Total registered student slots: <span className="font-bold text-slate-700">{totalEnrolled}</span>
          </div>
        </div>

        {/* Stats card breakdown counts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
            Students Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <p className="text-[10px] text-green-700 font-bold uppercase">Present</p>
              <h3 className="text-2xl font-black text-green-800 mt-1">{presentCount}</h3>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
              <p className="text-[10px] text-red-700 font-bold uppercase">Absent</p>
              <h3 className="text-2xl font-black text-red-800 mt-1">{absentCount}</h3>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-medium">
            Computed from manual logs and face captures.
          </div>
        </div>
      </div>

      {/* Main Records Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h3 className="text-sm font-bold text-slate-800">Student Logs List</h3>
        </div>
        
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[500px] text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Enrollment No</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Student Name</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Marked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500 italic">
                    No student attendance records logged for this session yet.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id || rec.student_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{rec.enrollment_no}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{rec.student_name}</td>
                    <td className="px-6 py-4">
                      <Badge status={rec.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {rec.marked_at ? formatDate(rec.marked_at, 'dd MMM yyyy hh:mm a') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSessionPage;
