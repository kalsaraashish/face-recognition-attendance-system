import api from './axios';

export const getMyDashboard = async () => {
  const { data } = await api.get('/dashboard/me');
  return data;
};

export const getAdminDashboard = async () => {
  const { data } = await api.get('/dashboard/admin');
  return data;
};

export const getFacultyDashboard = async () => {
  const { data } = await api.get('/dashboard/faculty');
  return data;
};

export const getStudentDashboard = async () => {
  const { data } = await api.get('/dashboard/student');
  return data;
};
