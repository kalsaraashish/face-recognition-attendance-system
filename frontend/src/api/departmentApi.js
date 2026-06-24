import api from './axios';

export const listDepartments = async () => {
  const { data } = await api.get('/departments');
  return data;
};

export const getDepartment = async (id) => {
  const { data } = await api.get(`/departments/${id}`);
  return data;
};

export const createDepartment = async (departmentData) => {
  const { data } = await api.post('/departments', departmentData);
  return data;
};

export const updateDepartment = async (id, departmentData) => {
  const { data } = await api.put(`/departments/${id}`, departmentData);
  return data;
};

export const deleteDepartment = async (id) => {
  const { data } = await api.delete(`/departments/${id}`);
  return data;
};
