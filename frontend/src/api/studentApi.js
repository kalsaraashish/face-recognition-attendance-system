import api from './axios';

export const listStudents = async (params) => {
  const { data } = await api.get('/students', { params });
  return data;
};

export const searchStudents = async (q, params) => {
  const { data } = await api.get('/students/search', { params: { q, ...params } });
  return data;
};

export const getStudent = async (id) => {
  const { data } = await api.get(`/students/${id}`);
  return data;
};

export const createStudent = async (studentData) => {
  const { data } = await api.post('/students', studentData);
  return data;
};

export const updateStudent = async (id, studentData) => {
  const { data } = await api.put(`/students/${id}`, studentData);
  return data;
};

export const deleteStudent = async (id) => {
  const { data } = await api.delete(`/students/${id}`);
  return data;
};
