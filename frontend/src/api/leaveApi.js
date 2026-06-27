import api from './axios';

export const applyLeave = async (leaveData) => {
  const { data } = await api.post('/leaves', leaveData);
  return data;
};

export const getMyLeaves = async () => {
  const { data } = await api.get('/leaves/my');
  return data;
};

export const listLeaves = async () => {
  const { data } = await api.get('/leaves');
  return data;
};

export const reviewLeave = async (leaveId, status) => {
  const { data } = await api.post(`/leaves/${leaveId}/review`, { status });
  return data;
};
