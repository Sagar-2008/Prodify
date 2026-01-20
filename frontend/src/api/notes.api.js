// Notes API for frontend
// This file provides functions to interact with the backend notes endpoints.
import axios from 'axios';

const API_BASE = '/api/notes';

export const getSubjects = () => axios.get(`${API_BASE}/subjects`);
export const addSubject = (title) => axios.post(`${API_BASE}/subjects`, { title });
export const deleteSubject = (id) => axios.delete(`${API_BASE}/subjects/${id}`);
export const getSubjectPoints = (subjectId) => axios.get(`${API_BASE}/subjects/${subjectId}/points`);
export const addPoint = (subjectId, title, description, mastery) => axios.post(`${API_BASE}/subjects/${subjectId}/points`, { title, description, mastery });
export const updatePoint = (subjectId, pointId, data) => axios.put(`${API_BASE}/subjects/${subjectId}/points/${pointId}`, data);
export const deletePoint = (subjectId, pointId) => axios.delete(`${API_BASE}/subjects/${subjectId}/points/${pointId}`);
