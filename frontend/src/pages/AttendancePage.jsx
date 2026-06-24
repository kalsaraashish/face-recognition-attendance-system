import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAttendance from '../hooks/useAttendance';
import useDepartments from '../hooks/useDepartments';
import { listFaculty } from '../api/facultyApi';
import { listSubjects } from '../api/subjectApi';
import { getStudentSummary, getSessionRecords, markAttendance } from '../api/attendanceApi';
import { listStudents } from '../api/studentApi';
import Table from '../components/common/Table';
import SessionForm from '../components/attendance/SessionForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import Spinner from '../components/common/Spinner';
import { formatDate, formatTime } from '../utils/formatters';
import { Plus, SlidersHorizontal, Calendar, Eye, Camera, Check, X, ShieldAlert, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AttendancePage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab
  const defaultTab = searchParams.get('tab') || 'sessions';
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Synchronize URL search params
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  const {
    sessions,
    total,
    page,
    totalPages,
    loading,
    fetchSessions,
    createSession,
    deleteSession,
  } = useAttendance();

  const { departments, fetchDepartments } = useDepartments();

  // Filters (Sessions Tab)
  const [facultyId, setFacultyId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [facultiesList, setFacultiesList] = useState([]);
  
  // Create Session Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Delete Session Confirmation
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Manual Attendance Tab State
  const [allSessionsList, setAllSessionsList] = useState([]);
  const [loadingAllSessions, setLoadingAllSessions] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedSessionInfo, setSelectedSessionInfo] = useState(null);
  
  // Students and their attendance state
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState({}); // studentId -> 'PRESENT' | 'ABSENT' | 'UNMARKED'
  const [existingRecordsMap, setExistingRecordsMap] = useState({}); // studentId -> record detail if already marked
  const [markingStates, setMarkingStates] = useState({}); // studentId -> loading boolean
  const [batchSaving, setBatchSaving] = useState(false);
  const [subjectsList, setSubjectsList] = useState([]);

  // Fetch departments and optionally faculty on mount
  useEffect(() => {
    fetchDepartments();
    const fetchAllSubjects = async () => {
      try {
        const res = await listSubjects();
        setSubjectsList(res || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAllSubjects();
    if (isAdmin) {
      const fetchFacultyList = async () => {
        try {
          const res = await listFaculty({ per_page: 100 });
          setFacultiesList(res.faculties || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchFacultyList();
    }
  }, [fetchDepartments, isAdmin]);

  // Load Sessions (Sessions Tab)
  const loadSessions = useCallback(() => {
    if (activeTab !== 'sessions') return;
    const filters = {
      page,
      per_page: 15,
      faculty_id: facultyId ? Number(facultyId) : undefined,
      department_id: departmentId ? Number(departmentId) : undefined,
      session_date: sessionDate || undefined,
    };
    fetchSessions(filters);
  }, [page, facultyId, departmentId, sessionDate, fetchSessions, activeTab]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Load Sessions list for dropdown (Mark Tab)
  useEffect(() => {
    if (activeTab !== 'mark') return;
    const fetchAllSessions = async () => {
      setLoadingAllSessions(true);
      try {
        const res = await fetchSessions({ per_page: 100 }); // fetch first 100 to populate dropdown
        setAllSessionsList(res.sessions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAllSessions(false);
      }
    };
    fetchAllSessions();
  }, [activeTab]);

  // Handle selected session load students and marked records (Mark Tab)
  useEffect(() => {
    if (activeTab !== 'mark' || !selectedSessionId) {
      setStudents([]);
      setAttendanceMap({});
      setExistingRecordsMap({});
      setSelectedSessionInfo(null);
      return;
    }

    const loadSessionStudents = async () => {
      setLoadingStudents(true);
      try {
        // 1. Get Session detail info
        const sessId = Number(selectedSessionId);
        const sessionInfo = allSessionsList.find((s) => s.id === sessId);
        setSelectedSessionInfo(sessionInfo);

        if (!sessionInfo) return;

        // 2. Load all students belonging to the session's department + semester
        const studentsData = await listStudents({
          department_id: sessionInfo.department_id,
          semester: sessionInfo.semester,
          per_page: 100,
          status: true, // Only active students
        });
        setStudents(studentsData.students || []);

        // 3. Load already marked records for this session
        const markedRecords = await getSessionRecords(sessId);
        
        // Build maps
        const tempAttMap = {};
        const tempExistMap = {};
        
        // Default all to unmarked
        studentsData.students.forEach((stu) => {
          tempAttMap[stu.id] = 'UNMARKED';
        });

        // Overlay marked records
        markedRecords.forEach((rec) => {
          tempAttMap[rec.student_id] = rec.status; // 'PRESENT' or 'ABSENT'
          tempExistMap[rec.student_id] = rec;
        });

        setAttendanceMap(tempAttMap);
        setExistingRecordsMap(tempExistMap);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load class students or attendance records');
      } finally {
        setLoadingStudents(false);
      }
    };
    loadSessionStudents();
  }, [selectedSessionId, allSessionsList, activeTab]);

  const handlePageChange = (newPage) => {
    fetchSessions({
      page: newPage,
      per_page: 15,
      faculty_id: facultyId ? Number(facultyId) : undefined,
      department_id: departmentId ? Number(departmentId) : undefined,
      session_date: sessionDate || undefined,
    });
  };

  const handleCreateSessionSubmit = async (sessionData) => {
    setCreateLoading(true);
    try {
      await createSession(sessionData);
      setIsCreateOpen(false);
      loadSessions();
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteClick = (sess) => {
    setDeleteTarget(sess);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteSession(deleteTarget.id);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      loadSessions();
    } catch (err) {
      console.error(err);
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Toggle present/absent local state in manual marking grid
  const handleLocalToggle = (studentId, newStatus) => {
    // If it's already saved in backend, we should warn or disallow toggling unless they update
    // But since backend doesn't support PUT on attendance records directly (only duplicate check-ins give 409 Conflict),
    // let's update local map. Wait, we can submit new status.
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: newStatus,
    }));
  };

  // Save individual student check-in
  const saveIndividualMark = async (studentId) => {
    const status = attendanceMap[studentId];
    if (status === 'UNMARKED') return;

    setMarkingStates((prev) => ({ ...prev, [studentId]: true }));
    try {
      const record = await markAttendance({
        session_id: Number(selectedSessionId),
        student_id: studentId,
        status: status,
      });
      setExistingRecordsMap((prev) => ({ ...prev, [studentId]: record }));
      toast.success(`Marked ${status.toLowerCase()} for student`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to mark attendance');
    } finally {
      setMarkingStates((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  // Batch Save all unmarked students
  const handleBatchSave = async () => {
    const unmarkedStudents = students.filter(
      (stu) => !existingRecordsMap[stu.id] && attendanceMap[stu.id] !== 'UNMARKED'
    );

    if (unmarkedStudents.length === 0) {
      toast.error('No new attendance markings to save.');
      return;
    }

    setBatchSaving(true);
    const toastId = toast.loading(`Saving attendance for ${unmarkedStudents.length} students...`);
    
    let successCount = 0;
    let failCount = 0;

    for (let stu of unmarkedStudents) {
      try {
        const record = await markAttendance({
          session_id: Number(selectedSessionId),
          student_id: stu.id,
          status: attendanceMap[stu.id],
        });
        setExistingRecordsMap((prev) => ({ ...prev, [stu.id]: record }));
        successCount++;
      } catch (err) {
        console.error(err);
        failCount++;
      }
    }

    setBatchSaving(false);
    if (failCount === 0) {
      toast.success(`Successfully saved attendance logs for all ${successCount} students!`, { id: toastId });
    } else {
      toast.error(`Saved ${successCount} student logs, failed on ${failCount} logs.`, { id: toastId });
    }
  };

  const getSubjectName = (subId) => {
    const sub = subjectsList.find((s) => s.id === subId);
    return sub ? `${sub.subject_code} - ${sub.subject_name}` : `Subject ID: ${subId}`;
  };

  const getDeptName = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : `Dept ID: ${deptId}`;
  };

  const tableHeaders = [
    'Session ID',
    'Date',
    'Department',
    'Semester',
    'Subject',
    'Time Slot',
    'Actions',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Attendance Sessions
        </h2>
        {activeTab === 'sessions' && (
          <Button
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            className="shadow-md shadow-blue-500/10"
          >
            <Plus className="mr-2 h-4.5 w-4.5" />
            Create Session
          </Button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3.5 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === 'sessions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Sessions List
        </button>
        <button
          onClick={() => setActiveTab('mark')}
          className={`pb-3.5 px-4 text-sm font-semibold border-b-2 transition-colors -mb-px ${
            activeTab === 'mark'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Mark Attendance (Manual)
        </button>
      </div>

      {/* TAB 1: Sessions */}
      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-slate-400">
                <SlidersHorizontal className="h-4.5 w-4.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">Filters</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Faculty filter (ADMIN ONLY) */}
                {isAdmin && (
                  <select
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                  >
                    <option value="">All Faculty</option>
                    {facultiesList.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Department dropdown */}
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="border border-slate-250 bg-white rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                {/* Date Picker */}
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sessions List Table */}
          <Table
            headers={tableHeaders}
            loading={loading && sessions.length === 0}
            empty={sessions.length === 0}
            emptyTitle="No attendance sessions found"
            emptyDescription="Create a new class session to start tracking check-ins."
            emptyActionLabel="Create Session"
            onEmptyAction={() => setIsCreateOpen(true)}
          >
            {sessions.map((sess) => (
              <tr key={sess.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-slate-700">#{sess.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900">{formatDate(sess.session_date)}</td>
                <td className="px-6 py-4 text-slate-655">{getDeptName(sess.department_id)}</td>
                <td className="px-6 py-4 text-slate-655">Semester {sess.semester}</td>
                <td className="px-6 py-4 font-semibold text-slate-800">
                  {getSubjectName(sess.subject_id)}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {formatTime(sess.start_time)} - {formatTime(sess.end_time)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => navigate(`/attendance/session/${sess.id}`)}
                      title="View Records"
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/attendance/face?session_id=${sess.id}`)}
                      title="Take Camera Attendance"
                      className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      <Camera className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(sess)}
                      title="Delete Session"
                      className="rounded-lg p-1.5 text-slate-450 hover:bg-slate-100 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>

          {/* Pagination */}
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}

      {/* TAB 2: Mark Attendance */}
      {activeTab === 'mark' && (
        <div className="space-y-6">
          {/* Dropdown: Select Session */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Attendance Session
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none w-full md:w-96"
              disabled={loadingAllSessions}
            >
              <option value="">-- Choose Session --</option>
              {allSessionsList.map((sess) => (
                <option key={sess.id} value={sess.id}>
                  Session #{sess.id} - {formatDate(sess.session_date)} ({sess.subject?.subject_code})
                </option>
              ))}
            </select>
            {loadingAllSessions && <Spinner className="inline ml-3 h-5 w-5" />}
          </div>

          {/* Student marking grid */}
          {selectedSessionId && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Batch Save Action Header */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">
                    Class List: {getSubjectName(selectedSessionInfo?.subject_id)}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {getDeptName(selectedSessionInfo?.department_id)} | Semester {selectedSessionInfo?.semester}
                  </p>
                </div>

                <Button variant="primary" onClick={handleBatchSave} loading={batchSaving} disabled={students.length === 0}>
                  <Check className="mr-2 h-4 w-4" />
                  Save Marks
                </Button>
              </div>

              {/* Students Grid list */}
              {loadingStudents ? (
                <div className="flex h-40 items-center justify-center bg-white rounded-xl border border-slate-200">
                  <Spinner className="h-8 w-8 text-blue-600" />
                </div>
              ) : students.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                  <p className="text-center text-slate-500 py-6 font-medium">
                    No active students enrolled in this department and semester.
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full min-w-[600px] text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Enrollment No</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Student Name</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Manual Toggle</th>
                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Save Status</th>
                        <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {students.map((stu) => {
                        const savedRecord = existingRecordsMap[stu.id];
                        const localStatus = attendanceMap[stu.id];
                        const isMarking = markingStates[stu.id];

                        return (
                          <tr key={stu.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-700">{stu.enrollment_no}</td>
                            <td className="px-6 py-4 font-medium text-slate-900">{stu.full_name || `${stu.first_name} ${stu.last_name}`}</td>
                            <td className="px-6 py-4">
                              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => handleLocalToggle(stu.id, 'PRESENT')}
                                  disabled={!!savedRecord}
                                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                                    localStatus === 'PRESENT'
                                      ? 'bg-green-600 text-white shadow-sm'
                                      : 'text-slate-500 hover:text-slate-700'
                                  } disabled:opacity-80`}
                                >
                                  Present
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleLocalToggle(stu.id, 'ABSENT')}
                                  disabled={!!savedRecord}
                                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                                    localStatus === 'ABSENT'
                                      ? 'bg-red-500 text-white shadow-sm'
                                      : 'text-slate-500 hover:text-slate-700'
                                  } disabled:opacity-80`}
                                >
                                  Absent
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {savedRecord ? (
                                <Badge status={savedRecord.status} />
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400">
                                  <ShieldAlert className="h-3 w-3 mr-1" />
                                  Unsaved Changes
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right">
                              {savedRecord ? (
                                <span className="text-xs text-slate-400 font-semibold italic">Saved ✓</span>
                              ) : (
                                <Button
                                  variant="secondary"
                                  className="text-xs py-1"
                                  onClick={() => saveIndividualMark(stu.id)}
                                  disabled={localStatus === 'UNMARKED' || batchSaving}
                                  loading={isMarking}
                                >
                                  Save Log
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Session Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule New Lecture Session"
        size="md"
      >
        <SessionForm
          onSubmit={handleCreateSessionSubmit}
          onCancel={() => setIsCreateOpen(false)}
          loading={createLoading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Attendance Session?"
        message={`Are you sure you want to delete session #${deleteTarget?.id} for subject "${getSubjectName(
          deleteTarget?.subject_id
        )}"? This will delete all attendance records associated with this session. This action cannot be undone.`}
        loading={deleteLoading}
      />
    </div>
  );
};

export default AttendancePage;
