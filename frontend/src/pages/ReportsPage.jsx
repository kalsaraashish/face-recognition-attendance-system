import React, { useState, useEffect, useCallback } from 'react';
import useDepartments from '../hooks/useDepartments';
import { listSubjects } from '../api/subjectApi';
import { getDailyReport, getMonthlyReport, getDepartmentReport } from '../api/reportApi';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { formatDate } from '../utils/formatters';
import { SEMESTERS } from '../utils/constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  FileSpreadsheet,
  FileText,
  Calendar,
  SlidersHorizontal,
  RefreshCw,
  TrendingUp,
  Download,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportsPage = () => {
  const { departments, fetchDepartments } = useDepartments();

  // Section Tabs: 'view' | 'export'
  const [activeSection, setActiveSection] = useState('view');
  // Sub-tabs (View Reports): 'daily' | 'monthly' | 'department'
  const [viewTab, setViewTab] = useState('daily');

  // Common Filter Options
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // 1. Daily Report Filters & Data
  const getTodayString = () => new Date().toISOString().slice(0, 10);
  const [dailyDate, setDailyDate] = useState(getTodayString());
  const [dailyDept, setDailyDept] = useState('');
  const [dailySem, setDailySem] = useState('');
  const [dailySub, setDailySub] = useState('');
  const [dailyData, setDailyData] = useState([]);
  const [loadingDaily, setLoadingDaily] = useState(false);

  // 2. Monthly Report Filters & Data
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  const [monthlyDept, setMonthlyDept] = useState('');
  const [monthlySem, setMonthlySem] = useState('');
  const [monthlyData, setMonthlyData] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // 3. Department Report Filters & Data
  const [deptDeptId, setDeptDeptId] = useState('');
  const [deptSem, setDeptSem] = useState('');
  const [deptSub, setDeptSub] = useState('');
  const [deptFromDate, setDeptFromDate] = useState('');
  const [deptToDate, setDeptToDate] = useState('');
  const [deptData, setDeptData] = useState(null);
  const [loadingDept, setLoadingDept] = useState(false);

  // 4. Export Tab Filters & States
  const [exportDate, setExportDate] = useState(getTodayString());
  const [exportDept, setExportDept] = useState('');
  const [exportSem, setExportSem] = useState('');
  const [exporting, setExporting] = useState(null); // 'excel' | 'pdf' | null

  // Fetch departments on load
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // Load subjects based on department filters (for Daily Tab)
  useEffect(() => {
    const loadSubs = async () => {
      if (!dailyDept) {
        setSubjects([]);
        setDailySub('');
        return;
      }
      setLoadingSubjects(true);
      try {
        const subs = await listSubjects({
          department_id: Number(dailyDept),
          semester: dailySem ? Number(dailySem) : undefined,
        });
        setSubjects(subs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    loadSubs();
  }, [dailyDept, dailySem]);

  // Load daily report data
  const loadDailyReport = useCallback(async () => {
    setLoadingDaily(true);
    try {
      const res = await getDailyReport({
        report_date: dailyDate,
        department_id: dailyDept ? Number(dailyDept) : undefined,
        semester: dailySem ? Number(dailySem) : undefined,
        subject_id: dailySub ? Number(dailySub) : undefined,
      });
      setDailyData(res.records || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load daily report details');
    } finally {
      setLoadingDaily(false);
    }
  }, [dailyDate, dailyDept, dailySem, dailySub]);

  // Load monthly report data
  const loadMonthlyReport = useCallback(async () => {
    setLoadingMonthly(true);
    try {
      const res = await getMonthlyReport(Number(monthlyYear), Number(monthlyMonth), {
        department_id: monthlyDept ? Number(monthlyDept) : undefined,
        semester: monthlySem ? Number(monthlySem) : undefined,
      });
      setMonthlyData(res.summaries || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load monthly report details');
    } finally {
      setLoadingMonthly(false);
    }
  }, [monthlyYear, monthlyMonth, monthlyDept, monthlySem]);

  // Load department report data
  const loadDeptReport = useCallback(async () => {
    if (!deptDeptId) return;
    setLoadingDept(true);
    try {
      const res = await getDepartmentReport(Number(deptDeptId), {
        semester: deptSem ? Number(deptSem) : undefined,
        subject_id: deptSub ? Number(deptSub) : undefined,
        date_from: deptFromDate || undefined,
        date_to: deptToDate || undefined,
      });
      setDeptData(res);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load department report details');
    } finally {
      setLoadingDept(false);
    }
  }, [deptDeptId, deptSem, deptSub, deptFromDate, deptToDate]);

  // Initial trigger for Daily
  useEffect(() => {
    if (activeSection === 'view' && viewTab === 'daily') {
      loadDailyReport();
    }
  }, [loadDailyReport, activeSection, viewTab]);

  // Initial trigger for Monthly
  useEffect(() => {
    if (activeSection === 'view' && viewTab === 'monthly') {
      loadMonthlyReport();
    }
  }, [loadMonthlyReport, activeSection, viewTab]);

  // Initial trigger for Dept
  useEffect(() => {
    if (activeSection === 'view' && viewTab === 'department' && deptDeptId) {
      loadDeptReport();
    } else {
      setDeptData(null);
    }
  }, [loadDeptReport, activeSection, viewTab, deptDeptId]);

  // Export report handler
  const handleExport = async (format) => {
    setExporting(format);
    const toastId = toast.loading(`Preparing ${format.toUpperCase()} export...`);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({
        report_date: exportDate,
        department_id: exportDept ? String(exportDept) : '',
        semester: exportSem ? String(exportSem) : '',
      });

      const url = `${import.meta.env.VITE_API_BASE_URL}/reports/export/${format}?${params}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to generate export file');

      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `attendance_report_${exportDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      link.click();
      toast.success('Download completed successfully!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to download report. Ensure data is present.', { id: toastId });
    } finally {
      setExporting(null);
    }
  };

  const getPercentageColorClass = (pct) => {
    if (pct < 75) return 'text-red-600 font-bold';
    if (pct < 85) return 'text-amber-600 font-bold';
    return 'text-green-600 font-bold';
  };

  // Recharts Chart parsing for Top 10 department students
  const getChartData = () => {
    if (!deptData?.summaries) return [];
    return [...deptData.summaries]
      .sort((a, b) => b.attendance_percentage - a.attendance_percentage)
      .slice(0, 10)
      .map((s) => ({
        name: s.student_name,
        'Attendance %': s.attendance_percentage,
      }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Reports and Analytics
        </h2>
      </div>

      {/* Main Sections Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSection('view')}
          className={`pb-3.5 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            activeSection === 'view'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          View Reports
        </button>
        <button
          onClick={() => setActiveSection('export')}
          className={`pb-3.5 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            activeSection === 'export'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Export Reports
        </button>
      </div>

      {/* SECTION: View Reports */}
      {activeSection === 'view' && (
        <div className="space-y-6">
          {/* Sub-tabs under View */}
          <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl self-start w-fit">
            {['daily', 'monthly', 'department'].map((tab) => (
              <button
                key={tab}
                onClick={() => setViewTab(tab)}
                className={`text-xs font-semibold px-4 py-2 rounded-lg capitalize transition-colors ${
                  viewTab === tab
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-850'
                }`}
              >
                {tab} Report
              </button>
            ))}
          </div>

          {/* TAB 1: DAILY REPORT */}
          {viewTab === 'daily' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Daily Filter Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-400">
                  <SlidersHorizontal className="h-4.5 w-4.5" />
                  <span className="text-xs font-bold uppercase">Filters</span>
                </div>
                
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="date"
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
                  />
                  
                  <select
                    value={dailyDept}
                    onChange={(e) => setDailyDept(e.target.value)}
                    className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  <select
                    value={dailySem}
                    onChange={(e) => setDailySem(e.target.value)}
                    className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="">All Semesters</option>
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>

                  <select
                    value={dailySub}
                    onChange={(e) => setDailySub(e.target.value)}
                    disabled={!dailyDept || loadingSubjects}
                    className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none w-44"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.subject_code} - {sub.subject_name}</option>
                    ))}
                  </select>

                  <Button
                    variant="secondary"
                    className="text-xs py-1.5"
                    onClick={loadDailyReport}
                    loading={loadingDaily}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Daily Table */}
              <Table
                headers={['Date', 'Department', 'Subject', 'Semester', 'Enrollment No', 'Student Name', 'Status']}
                loading={loadingDaily && dailyData.length === 0}
                empty={dailyData.length === 0}
                emptyTitle="No daily logs matching criteria"
                emptyDescription="Select a valid class date, department, and filters to run logs."
              >
                {dailyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-700">{formatDate(row.date)}</td>
                    <td className="px-6 py-3.5 text-slate-655">{row.department}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{row.subject}</td>
                    <td className="px-6 py-3.5 text-slate-500">Sem {row.semester}</td>
                    <td className="px-6 py-3.5 text-slate-655">{row.enrollment_no}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{row.student_name}</td>
                    <td className="px-6 py-3.5"><Badge status={row.status} /></td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {/* TAB 2: MONTHLY REPORT */}
          {viewTab === 'monthly' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Monthly Filter Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-400">
                  <SlidersHorizontal className="h-4.5 w-4.5" />
                  <span className="text-xs font-bold uppercase">Filters</span>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <select
                    value={monthlyYear}
                    onChange={(e) => setMonthlyYear(e.target.value)}
                    className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>

                  <select
                    value={monthlyMonth}
                    onChange={(e) => setMonthlyMonth(e.target.value)}
                    className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
                  >
                    {Array.from({ length: 12 }).map((_, mIdx) => (
                      <option key={mIdx + 1} value={mIdx + 1}>
                        {new Date(0, mIdx).toLocaleString('en', { month: 'long' })}
                      </option>
                    ))}
                  </select>

                  <select
                    value={monthlyDept}
                    onChange={(e) => setMonthlyDept(e.target.value)}
                    className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  <select
                    value={monthlySem}
                    onChange={(e) => setMonthlySem(e.target.value)}
                    className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="">All Semesters</option>
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>

                  <Button
                    variant="secondary"
                    className="text-xs py-1.5"
                    onClick={loadMonthlyReport}
                    loading={loadingMonthly}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Monthly Table */}
              <Table
                headers={['Enrollment No', 'Name', 'Total Sessions', 'Present', 'Absent', 'Percentage']}
                loading={loadingMonthly && monthlyData.length === 0}
                empty={monthlyData.length === 0}
                emptyTitle="No monthly logs matching criteria"
                emptyDescription="Select a valid class date, department, and filters to run logs."
              >
                {monthlyData.map((row) => (
                  <tr key={row.student_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-750">{row.enrollment_no}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{row.student_name}</td>
                    <td className="px-6 py-3.5 text-slate-550">{row.total_sessions}</td>
                    <td className="px-6 py-3.5 text-green-700 font-semibold">{row.present_count}</td>
                    <td className="px-6 py-3.5 text-red-700 font-semibold">{row.absent_count}</td>
                    <td className={`px-6 py-3.5 ${getPercentageColorClass(row.attendance_percentage)}`}>
                      {row.attendance_percentage}%
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          )}

          {/* TAB 3: DEPARTMENT REPORT */}
          {viewTab === 'department' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Dept Filter Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-400">
                  <SlidersHorizontal className="h-4.5 w-4.5" />
                  <span className="text-xs font-bold uppercase">Filters</span>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <select
                    value={deptDeptId}
                    onChange={(e) => setDeptDeptId(e.target.value)}
                    className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="">-- Choose Dept (Required) --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  <select
                    value={deptSem}
                    onChange={(e) => setDeptSem(e.target.value)}
                    className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="">All Semesters</option>
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={deptFromDate}
                    onChange={(e) => setDeptFromDate(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
                    placeholder="From Date"
                  />

                  <input
                    type="date"
                    value={deptToDate}
                    onChange={(e) => setDeptToDate(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700"
                    placeholder="To Date"
                  />

                  <Button
                    variant="secondary"
                    className="text-xs py-1.5"
                    onClick={loadDeptReport}
                    disabled={!deptDeptId}
                    loading={loadingDept}
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Refresh
                  </Button>
                </div>
              </div>

              {!deptDeptId ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                  <AlertTriangle className="h-10 w-10 text-amber-500 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">
                    Please select a department from the dropdown filter to load department summaries.
                  </p>
                </div>
              ) : (
                <>
                  {/* Dept report charts & table */}
                  {loadingDept && !deptData ? (
                    <div className="flex h-32 items-center justify-center bg-white border border-slate-200 rounded-xl">
                      <Spinner className="h-8 w-8 text-blue-600" />
                    </div>
                  ) : deptData ? (
                    <div className="space-y-6">
                      {/* BarChart Top 10 */}
                      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex items-center space-x-2 mb-4">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <h3 className="text-base font-bold text-slate-800 tracking-tight">
                            Top 10 Students by Attendance Rate
                          </h3>
                        </div>
                        <div className="h-80 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                              <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} angle={-30} textAnchor="end" interval={0} height={60} />
                              <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                              <Tooltip />
                              <Bar dataKey="Attendance %" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={45} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Summary Table */}
                      <Table
                        headers={['Enrollment No', 'Name', 'Total Sessions', 'Present', 'Absent', 'Percentage']}
                        empty={!deptData.summaries || deptData.summaries.length === 0}
                        emptyTitle="No department summaries registered"
                      >
                        {deptData.summaries?.map((row) => (
                          <tr key={row.student_id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3.5 font-semibold text-slate-750">{row.enrollment_no}</td>
                            <td className="px-6 py-3.5 font-bold text-slate-900">{row.student_name}</td>
                            <td className="px-6 py-3.5 text-slate-550">{row.total_sessions}</td>
                            <td className="px-6 py-3.5 text-green-700 font-semibold">{row.present_count}</td>
                            <td className="px-6 py-3.5 text-red-700 font-semibold">{row.absent_count}</td>
                            <td className={`px-6 py-3.5 ${getPercentageColorClass(row.attendance_percentage)}`}>
                              {row.attendance_percentage}%
                            </td>
                          </tr>
                        ))}
                      </Table>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION: Export Reports */}
      {activeSection === 'export' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6 max-w-xl animate-in fade-in duration-300">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Export Daily Attendance Sheet
          </h3>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Select Date *
              </label>
              <input
                type="date"
                value={exportDate}
                onChange={(e) => setExportDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none w-full bg-white text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Department (Optional)
                </label>
                <select
                  value={exportDept}
                  onChange={(e) => setExportDept(e.target.value)}
                  className="border border-slate-205 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none w-full text-slate-800"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Semester (Optional)
                </label>
                <select
                  value={exportSem}
                  onChange={(e) => setExportSem(e.target.value)}
                  className="border border-slate-205 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none w-full text-slate-800"
                >
                  <option value="">All Semesters</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 border-t border-slate-100 pt-5 mt-6">
            <Button
              variant="primary"
              onClick={() => handleExport('excel')}
              loading={exporting === 'excel'}
              className="flex-1 shadow-md shadow-blue-500/10"
            >
              <FileSpreadsheet className="mr-2 h-4.5 w-4.5" />
              Download Excel (.xlsx)
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => handleExport('pdf')}
              loading={exporting === 'pdf'}
              className="flex-1"
            >
              <FileText className="mr-2 h-4.5 w-4.5 text-red-500" />
              Download PDF (.pdf)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
