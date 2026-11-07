import { API } from "./client";

export const getJournalEntries = async () => (await API.get("/journal/")).data;

export const getJournalByMonth = async (year, month) =>
  (await API.get("/journal/month", { params: { year, month } })).data;

export const getJournalEntry = async (id) => (await API.get(`/journal/${id}`)).data;

export const saveJournalEntry = async (entryData) => (await API.post("/journal/", entryData)).data;

export const deleteJournalEntry = async (id) => (await API.delete(`/journal/${id}`)).data;

export const getJournalStats = async () => (await API.get("/journal/stats")).data;
