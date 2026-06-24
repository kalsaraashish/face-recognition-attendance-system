import api from './axios';

export const listSubjects = async (params) => {
  const { data } = await api.get('/subjects', { params });
  return data;
};

export const getSubject = async (id) => {
  const { data } = await api.get(`/subjects/${id}`);
  return data;
};

export const createSubject = async (subjectData) => {
  const { data } = await api.post('/subjects', subjectData);
  return data;
};

export const updateSubject = async (id, subjectData) => {
  const { data } = await api.put(`/subjects/${id}`, subjectData);
  return data;
};

export const deleteSubject = async (id) => {
  const { data } = await api.delete(`/subjects/${id}`);
  return data;
};
