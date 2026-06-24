import api from './axios';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const refreshToken = async (refresh_token) => {
  const { data } = await api.post('/auth/refresh', { refresh_token });
  return data;
};

export const changePassword = async (current_password, new_password, confirm_password) => {
  const { data } = await api.post('/auth/change-password', {
    current_password,
    new_password,
    confirm_password,
  });
  return data;
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};
