// Notes API for frontend
// This file provides functions to interact with the backend notes endpoints.
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const getSubjects = () => API.get('/api/notes/subjects');
export const addSubject = (title) => API.post('/api/notes/subjects', { title });
export const deleteSubject = (id) => API.delete(`/api/notes/subjects/${id}`);
export const getSubjectPoints = (subjectId) => API.get(`/api/notes/subjects/${subjectId}/points`);
export const addPoint = (subjectId, title, description, mastery) => API.post(`/api/notes/subjects/${subjectId}/points`, { title, description, mastery });
export const updatePoint = (subjectId, pointId, data) => API.put(`/api/notes/subjects/${subjectId}/points/${pointId}`, data);
export const deletePoint = (subjectId, pointId) => API.delete(`/api/notes/subjects/${subjectId}/points/${pointId}`);
