import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudent } from '../api/studentApi';
import { getStudentSummary } from '../api/attendanceApi';
import { listSubjects } from '../api/subjectApi';
import Spinner from '../components/common/Spinner';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/common/Badge';
import { Mail, Phone, Book, Calendar, ChevronRight, GraduationCap } from 'lucide-react';

export const StudentDetailPage = () => {
  const { id } = useParams();
  const studentId = Number(id);

  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [subjectId, setSubjectId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Tabs
  const [activeTab, setActiveTab] = useState('summary');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch student info
      const studentInfo = await getStudent(studentId);
      setStudent(studentInfo);

      // 2. Fetch subjects for dropdown filtering (based on department + semester)
      const subs = await listSubjects({
        department_id: studentInfo.department_id,
        semester: studentInfo.semester,
      });
      setSubjects(subs);

      // 3. Fetch summary stats
      const params = {
        subject_id: subjectId ? Number(subjectId) : undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      };
      const sumInfo = await getStudentSummary(studentId, params);
      setSummary(sumInfo);
    } catch (err) {
      console.error(err);
      setError('Failed to load student profiles and summary metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId, subjectId, dateFrom, dateTo]);

  if (loading && !student) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="h-10 w-10 text-blue-600" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  const getInitials = () => {
    if (!student?.full_name) return 'S';
    return student.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // TODO: No backend endpoint for student attendance records list — using dummy data
  // Replace with real API when available
  const getDummyRecords = () => {
    if (!student || !summary) return [];
    
    const records = [];
    const subjectsList = subjects.length > 0 ? subjects : [{ subject_code: 'SUB101', subject_name: 'Core Subject' }];
    
    // Generate records based on the present/absent count
    const totalCount = summary.total_sessions || 10;
    const presentCount = summary.present_count || 8;
    
    for (let i = 0; i < totalCount; i++) {
      const subject = subjectsList[i % subjectsList.length];
      const dateVal = new Date();
      dateVal.setDate(dateVal.getDate() - i * 2); // 2 days gap

      const isPresent = i < presentCount;
      records.push({
        id: i + 1,
        date: dateVal.toISOString().slice(0, 10),
        subject: `${subject.subject_code} - ${subject.subject_name}`,
        status: isPresent ? 'PRESENT' : 'ABSENT',
      });
    }
    return records;
  };

  const percentage = summary?.attendance_percentage || 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <Link to="/students" className="hover:text-blue-600 transition-colors">
          Students
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-slate-800 font-bold truncate max-w-[200px]">
          {student?.full_name}
        </span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Student Card info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 text-center lg:text-left">
          <div className="flex flex-col items-center lg:items-start space-y-4">
            {/* Avatar placeholder */}
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-3xl font-black text-blue-600 shadow-inner">
              {getInitials()}
            </div>
            <div className="space-y-1 w-full">
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                {student?.full_name}
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                Enrollment: {student?.enrollment_no}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center lg:justify-start">
                <Badge status={student?.status} />
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    student?.has_face_registered
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {student?.has_face_registered ? 'Face Configured' : 'No Face Model'}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 space-y-4 text-sm text-left">
            <div className="flex items-center space-x-3 text-slate-600">
              <GraduationCap className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Department / Sem</p>
                <p className="font-semibold text-slate-850">
                  {student?.department?.name} | Semester {student?.semester}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-600">
              <Mail className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs text-slate-400 font-semibold uppercase">Email Address</p>
                <p className="font-semibold text-slate-850 truncate">{student?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-slate-600">
              <Phone className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">Contact Number</p>
                <p className="font-semibold text-slate-850">{student?.mobile || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive summaries and records */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Filters</span>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {/* Subject Select */}
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.subject_code} - {sub.subject_name}
                  </option>
                ))}
              </select>

              {/* Date pickers */}
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
                placeholder="From Date"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
                placeholder="To Date"
              />
            </div>
          </div>

          {/* Tabs Menu */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('summary')}
              className={`pb-3.5 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === 'summary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Attendance Summary
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`pb-3.5 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === 'records'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Attendance Records
            </button>
          </div>

          {/* Tab Content: Summary */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Circular progress card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col items-center justify-center text-center">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                  Attendance Rate
                </h4>
                <div className="relative flex items-center justify-center h-36 w-36">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      className="stroke-slate-100"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      className="stroke-blue-600"
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-800">{percentage}%</span>
                  </div>
                </div>
              </div>

              {/* Stat cards */}
              <div className="md:col-span-2 grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600 mb-4">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Present Count</p>
                    <p className="text-3xl font-black text-slate-850 mt-1">{summary?.present_count || 0}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 mb-4">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase">Absent Count</p>
                    <p className="text-3xl font-black text-slate-850 mt-1">{summary?.absent_count || 0}</p>
                  </div>
                </div>

                <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
                  <p className="text-xs font-semibold text-slate-500">
                    Total Scheduled Classes Checked: <span className="font-bold text-slate-800">{summary?.total_sessions || 0}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Records */}
          {activeTab === 'records' && (
            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[500px] text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Subject</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {getDummyRecords().map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-slate-700">
                        {rec.date}
                      </td>
                      <td className="px-6 py-3.5 font-medium text-slate-805">
                        {rec.subject}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge status={rec.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailPage;
