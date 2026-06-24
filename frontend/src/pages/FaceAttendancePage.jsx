import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAttendance from '../hooks/useAttendance';
import { getSession } from '../api/attendanceApi';
import CameraCapture from '../components/attendance/CameraCapture';
import SessionForm from '../components/attendance/SessionForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { formatDate } from '../utils/formatters';
import { Calendar, Video, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const FaceAttendancePage = () => {
  const [searchParams] = useSearchParams();
  const querySessionId = searchParams.get('session_id');
  const navigate = useNavigate();

  const { createSession } = useAttendance();

  // Sessions and selections
  const [todaySessions, setTodaySessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedSessionInfo, setSelectedSessionInfo] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  
  // Camera toggle and session forms
  const [cameraActive, setCameraActive] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Fetch departments and subjects metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [depts, subs] = await Promise.all([
          import('../api/departmentApi').then((m) => m.listDepartments()),
          import('../api/subjectApi').then((m) => m.listSubjects()),
        ]);
        setDepartments(depts || []);
        setSubjectsList(subs || []);
      } catch (err) {
        console.error('Failed to fetch departments/subjects for FaceAttendancePage', err);
      }
    };
    fetchMetadata();
  }, []);

  const getSubjectName = (subId) => {
    const sub = subjectsList.find((s) => s.id === subId);
    return sub ? `${sub.subject_code} - ${sub.subject_name}` : `Subject ID: ${subId}`;
  };

  const getDeptName = (deptId) => {
    const dept = departments.find((d) => d.id === deptId);
    return dept ? dept.name : `Dept ID: ${deptId}`;
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Load today's sessions
  const loadTodaySessions = async () => {
    setLoadingSessions(true);
    try {
      const today = getTodayDateString();
      const { listSessions } = await import('../api/attendanceApi');
      const res = await listSessions({ session_date: today, per_page: 100 });
      setTodaySessions(res.sessions || []);
      
      // If there's a query param pre-select it
      if (querySessionId) {
        setSelectedSessionId(querySessionId);
      } else if (res.sessions?.length > 0) {
        setSelectedSessionId(String(res.sessions[0].id));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load sessions for today');
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadTodaySessions();
  }, [querySessionId]);

  // Load specific session info when selection changes
  useEffect(() => {
    if (!selectedSessionId) {
      setSelectedSessionInfo(null);
      setCameraActive(false);
      return;
    }

    const loadSessionDetail = async () => {
      try {
        const info = await getSession(Number(selectedSessionId));
        setSelectedSessionInfo(info);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load session details');
      }
    };
    loadSessionDetail();
  }, [selectedSessionId]);

  const handleCreateSessionSubmit = async (sessionData) => {
    setCreateLoading(true);
    try {
      const newSession = await createSession(sessionData);
      setIsCreateModalOpen(false);
      
      // Reload sessions list and select new session
      await loadTodaySessions();
      setSelectedSessionId(String(newSession.id));
      
      toast.success('Session created and selected!');
    } catch (err) {
      console.error(err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleStartCamera = () => {
    if (!selectedSessionId) {
      toast.error('Please select a session first');
      return;
    }
    setCameraActive(true);
  };

  const resolvedSessionInfo = selectedSessionInfo ? {
    ...selectedSessionInfo,
    subject: {
      subject_name: getSubjectName(selectedSessionInfo.subject_id),
    },
    department: {
      name: getDeptName(selectedSessionInfo.department_id),
    }
  } : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          {cameraActive && (
            <button
              onClick={() => setCameraActive(false)}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-white border border-slate-200 shadow-sm"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-800">
              Face Recognition Attendance
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Take check-ins automatically via camera feed
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Select Session */}
      {!cameraActive && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-2xl animate-in fade-in duration-300">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
                Select Today's Lecture Session *
              </label>
              
              {loadingSessions ? (
                <div className="flex items-center space-x-2 py-2 text-slate-500">
                  <Spinner className="h-5 w-5" />
                  <span className="text-sm">Loading sessions...</span>
                </div>
              ) : todaySessions.length === 0 ? (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 text-xs font-semibold text-amber-700">
                  No lecture sessions scheduled for today yet. Use the button below to quick-create one.
                </div>
              ) : (
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none w-full"
                >
                  <option value="">-- Choose Lecture Session --</option>
                  {todaySessions.map((sess) => (
                    <option key={sess.id} value={sess.id}>
                      #{sess.id} - {getSubjectName(sess.subject_id)} ({getDeptName(sess.department_id)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {selectedSessionInfo && (
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-2 text-xs font-medium text-slate-655 animate-in fade-in duration-200">
                <p>
                  <span className="text-slate-400 font-bold uppercase mr-2">Subject:</span>
                  {getSubjectName(selectedSessionInfo.subject_id)}
                </p>
                <p>
                  <span className="text-slate-400 font-bold uppercase mr-2">Dept / Sem:</span>
                  {getDeptName(selectedSessionInfo.department_id)} | Semester {selectedSessionInfo.semester}
                </p>
                <p>
                  <span className="text-slate-400 font-bold uppercase mr-2">Scheduled:</span>
                  {selectedSessionInfo.start_time.slice(0, 5)} - {selectedSessionInfo.end_time.slice(0, 5)}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center border-t border-slate-100 pt-5 mt-6">
            <Button
              variant="secondary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4 text-blue-600" />
              Create New Session
            </Button>
            
            <Button
              variant="primary"
              onClick={handleStartCamera}
              disabled={!selectedSessionId}
              className="shadow-md shadow-blue-500/10"
            >
              <Video className="mr-2 h-4 w-4" />
              Start Camera Feed
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Camera Capture Feed */}
      {cameraActive && selectedSessionId && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <CameraCapture
            sessionId={Number(selectedSessionId)}
            sessionInfo={resolvedSessionInfo}
            onMatchSuccess={() => {}}
          />
        </div>
      )}

      {/* Quick-Create Session Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule Today's Lecture Session"
        size="md"
      >
        <SessionForm
          onSubmit={handleCreateSessionSubmit}
          onCancel={() => setIsCreateModalOpen(false)}
          loading={createLoading}
        />
      </Modal>
    </div>
  );
};

export default FaceAttendancePage;
