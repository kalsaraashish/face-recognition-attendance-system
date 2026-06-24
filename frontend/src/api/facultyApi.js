import api from './axios';

export const listFaculty = async (params) => {
  const { data } = await api.get('/faculty', { params });
  return data;
};

export const getFaculty = async (id) => {
  const { data } = await api.get(`/faculty/${id}`);
  return data;
};

export const createFaculty = async (facultyData) => {
  const { data } = await api.post('/faculty', facultyData);
  return data;
};

export const updateFaculty = async (id, facultyData) => {
  const { data } = await api.put(`/faculty/${id}`, facultyData);
  return data;
};

export const deleteFaculty = async (id) => {
  const { data } = await api.delete(`/faculty/${id}`);
  return data;
};
