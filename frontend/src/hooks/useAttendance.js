import { useState, useCallback } from 'react';
import * as attendanceApi from '../api/attendanceApi';
import toast from 'react-hot-toast';

export const useAttendance = () => {
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.listSessions(filters);
      setSessions(data.sessions || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      setError(err);
      toast.error(err.response?.data?.detail || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  }, []);

  const createSession = async (sessionData) => {
    setLoading(true);
    const toastId = toast.loading('Creating session...');
    try {
      const newSession = await attendanceApi.createSession(sessionData);
      toast.success('Session created successfully', { id: toastId });
      return newSession;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create session', { id: toastId });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markStudentAttendance = async (attendanceData) => {
    try {
      const record = await attendanceApi.markAttendance(attendanceData);
      return record;
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to mark attendance');
      throw err;
    }
  };

  const deleteSession = async (id) => {
    setLoading(true);
    try {
      await attendanceApi.deleteSession(id);
      toast.success('Attendance session deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sessions,
    total,
    page,
    totalPages,
    loading,
    error,
    fetchSessions,
    createSession,
    markStudentAttendance,
    deleteSession,
  };
};

export default useAttendance;
