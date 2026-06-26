import api from './axios';

export const createSession = async (sessionData) => {
  const { data } = await api.post('/attendance/session', sessionData);
  return data;
};

export const listSessions = async (params) => {
  const { data } = await api.get('/attendance/sessions', { params });
  return data;
};

export const getSession = async (id) => {
  const { data } = await api.get(`/attendance/sessions/${id}`);
  return data;
};

export const markAttendance = async (attendanceData) => {
  const { data } = await api.post('/attendance/mark', attendanceData);
  return data;
};

export const markByFace = async (sessionId, imageBlob) => {
  const formData = new FormData();
  formData.append('session_id', sessionId);
  formData.append('image', imageBlob, 'capture.jpg');
  const { data } = await api.post('/attendance/mark/face', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getSessionRecords = async (sessionId) => {
  const { data } = await api.get(`/attendance/sessions/${sessionId}/records`);
  return data;
};

export const getStudentSummary = async (studentId, params) => {
  const { data } = await api.get(`/attendance/student/${studentId}/summary`, { params });
  return data;
};

export const deleteSession = async (id) => {
  const { data } = await api.delete(`/attendance/sessions/${id}`);
  return data;
};

export const markFacultyAttendanceByFace = async (imageBlob) => {
  const formData = new FormData();
  formData.append('image', imageBlob, 'capture.jpg');
  const { data } = await api.post('/attendance/faculty/mark/face', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getFacultyTodayStatus = async () => {
  const { data } = await api.get('/attendance/faculty/today-status');
  return data;
};

export const getFacultyAttendanceHistory = async () => {
  const { data } = await api.get('/attendance/faculty/history');
  return data;
};
