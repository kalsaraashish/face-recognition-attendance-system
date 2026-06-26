import api from './axios';

export const registerFace = async (studentId, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  const { data } = await api.post(`/face/register/${studentId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const recognizeFace = async (imageBlob) => {
  const formData = new FormData();
  formData.append('image', imageBlob, 'capture.jpg');
  const { data } = await api.post('/face/recognize', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteEncodings = async (studentId) => {
  const { data } = await api.delete(`/face/${studentId}`);
  return data;
};

export const registerFacultyFace = async (facultyId, files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });
  const { data } = await api.post(`/face/register/faculty/${facultyId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteFacultyEncodings = async (facultyId) => {
  const { data } = await api.delete(`/face/faculty/${facultyId}`);
  return data;
};


