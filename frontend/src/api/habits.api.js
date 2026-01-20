import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const addHabit = (title) =>
  API.post("/habits", { title });

export const deleteHabit = (id) =>
  API.delete(`/habits/${id}`);

export const toggleHabit = (id, date) =>
  API.post(`/habits/${id}/toggle`, { date });

export const getHabitsByMonth = (year, month) =>
  API.get(`/habits/month?year=${year}&month=${month}`);

export const getTodayHabits = () =>
  API.get("/habits/today");

export const getHabitAnalytics = () =>
  API.get("/habits/analytics");

export const getPomodoroStats = () =>
  API.get("/pomodoro/stats");

