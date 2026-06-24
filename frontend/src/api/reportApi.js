import api from './axios';

export const getDailyReport = async (params) => {
  const { data } = await api.get('/reports/daily', { params });
  return data;
};

export const getMonthlyReport = async (year, month, params) => {
  const { data } = await api.get('/reports/monthly', { params: { year, month, ...params } });
  return data;
};

export const getStudentReport = async (studentId, params) => {
  const { data } = await api.get(`/reports/student/${studentId}`, { params });
  return data;
};

export const getDepartmentReport = async (deptId, params) => {
  const { data } = await api.get(`/reports/department/${deptId}`, { params });
  return data;
};

export const exportReportUrl = (format, params) => {
  const query = new URLSearchParams(params).toString();
  return `${import.meta.env.VITE_API_BASE_URL}/reports/export/${format}?${query}`;
};
