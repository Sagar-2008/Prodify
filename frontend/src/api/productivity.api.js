import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

API.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  if (token) request.headers.Authorization = `Bearer ${token}`;
  return request;
});

export const getProductivity = () => API.get("/productivity");
export const importLocalProductivity = (data) => API.post("/productivity/import-local", data);
export const createQuest = (data) => API.post("/productivity/quests", data);
export const updateQuest = (id, data) => API.patch(`/productivity/quests/${id}`, data);
export const deleteQuest = (id) => API.delete(`/productivity/quests/${id}`);
export const createGoal = (data) => API.post("/productivity/goals", data);
export const updateGoal = (id, data) => API.patch(`/productivity/goals/${id}`, data);
export const deleteGoal = (id) => API.delete(`/productivity/goals/${id}`);
export const createTraining = (data) => API.post("/productivity/training", { ...data, category: data.type });
export const updateTraining = (id, data) => API.patch(`/productivity/training/${id}`, data);
export const deleteTraining = (id) => API.delete(`/productivity/training/${id}`);
export const createCategory = (data) => API.post("/productivity/categories", data);
export const deleteCategory = (id) => API.delete(`/productivity/categories/${id}`);
export const updateSettings = (data) => API.patch("/productivity/settings", data);
export const updateTheme = (theme) => API.patch("/productivity/profile/theme", { theme });
export const uploadArtwork = (data) => API.put("/productivity/profile/artwork", data);
export const getArtwork = () => API.get("/productivity/profile/artwork", { responseType: "blob" });
export const deleteArtwork = () => API.delete("/productivity/profile/artwork");
