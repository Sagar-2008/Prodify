import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "../api/productivity.api";

const ProductivityContext = createContext(null);
const KEYS = {
  quests: "zenkai.quests.v1",
  goals: "zenkai.goals.v1",
  training: "zenkai.training.v1",
  categories: "zenkai.categories.v1",
  settings: "zenkai.settings.v1",
};
const DEFAULT_RANKS = ["Earthling", "Saiyan", "Super Saiyan", "Ascended Saiyan", "Super Saiyan 2", "Super Saiyan 3", "Super Saiyan God", "Ultra Instinct"];
const DEFAULT_SETTINGS = { xpPerLevel: 100, xpMultiplier: 1, focusXp: 25, trainingXpPerHour: 60, solvedBonus: 20, rankNames: DEFAULT_RANKS };
const emptyCategories = () => ({ quest: [], goal: [], training: [] });

function rankFor(xp, profile) {
  const names = Array.isArray(profile.rankNames) && profile.rankNames.length >= 4 ? profile.rankNames : DEFAULT_RANKS;
  const perLevel = Number(profile.xpPerLevel) || 100;
  const level = Math.floor(xp / perLevel) + 1;
  const index = Math.min(names.length - 1, Math.floor((level - 1) / 10));
  return { name: names[index], next: index < names.length - 1 ? (index + 1) * 10 * perLevel : null, floor: index * 10 * perLevel };
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function readArray(key, fallback = []) {
  const value = readStorage(key, fallback);
  return Array.isArray(value) ? value : fallback;
}

function todayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function initialQuests() {
  const saved = readStorage(KEYS.quests, null);
  if (Array.isArray(saved)) return saved;
  const legacy = readStorage("quickTasks", []);
  if (!Array.isArray(legacy)) return [];
  return legacy.map((task, index) => ({ id: task.id ?? `legacy-${index}`, title: task.text || "Untitled quest", category: "Personal", xp: 10, dueDate: todayKey(), completed: Boolean(task.completed), createdAt: Date.now() }));
}

const makeId = () => globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function ProductivityProvider({ children }) {
  const [quests, setQuests] = useState(initialQuests);
  const [goals, setGoals] = useState(() => readArray(KEYS.goals));
  const [training, setTraining] = useState(() => readArray(KEYS.training));
  const [categories, setCategories] = useState(() => {
    const cached = readStorage(KEYS.categories, emptyCategories());
    return cached && typeof cached === "object" && !Array.isArray(cached) ? cached : emptyCategories();
  });
  const [settings, setSettings] = useState(() => readStorage(KEYS.settings, DEFAULT_SETTINGS));
  const [profile, setProfile] = useState({ theme: "capsule", hasPoster: false, posterName: "", updatedAt: null });
  const [posterAsset, setPosterAsset] = useState({ url: "", version: "" });
  const [artworkRefreshKey, setArtworkRefreshKey] = useState(0);
  const [power, setPower] = useState(null);
  const [syncStatus, setSyncStatus] = useState("syncing");
  const [syncError, setSyncError] = useState("");

  const hydrate = useCallback((data) => {
    setQuests(data.quests || []);
    setGoals(data.goals || []);
    setTraining(data.training || []);
    setCategories(data.categories || emptyCategories());
    setSettings(data.settings || DEFAULT_SETTINGS);
    setProfile(data.profile || { theme: "capsule", hasPoster: false, posterName: "", updatedAt: null });
    setPower(data.power || null);
  }, []);

  const refresh = useCallback(async () => {
    const response = await api.getProductivity();
    hydrate(response.data);
    return response.data;
  }, [hydrate]);

  const syncNow = useCallback(async () => {
    setSyncStatus("syncing");
    setSyncError("");
    try {
      let data = await refresh();
      const userId = String(data.userId);
      const owner = localStorage.getItem("zenkai.local-data-owner.v1");
      if (!owner) {
        const legacyData = {
          quests: readStorage(KEYS.quests, initialQuests()),
          goals: readArray(KEYS.goals),
          training: readArray(KEYS.training),
        };
        if (legacyData.quests.length || legacyData.goals.length || legacyData.training.length) {
          await api.importLocalProductivity(legacyData);
          data = await refresh();
        }
        localStorage.setItem("zenkai.local-data-owner.v1", userId);
      }
      setSyncStatus("synced");
      return data;
    } catch (error) {
      setSyncStatus("error");
      setSyncError(error.response?.data?.message || "Could not sync your productivity data. Check the backend and database, then retry.");
      throw error;
    }
  }, [refresh]);

  useEffect(() => {
    const timer = window.setTimeout(() => syncNow().catch(() => {}), 0);
    return () => window.clearTimeout(timer);
  }, [syncNow]);

  useEffect(() => {
    const refreshAfterFocusSession = () => syncNow().catch(() => {});
    window.addEventListener("productivity-data-updated", refreshAfterFocusSession);
    return () => window.removeEventListener("productivity-data-updated", refreshAfterFocusSession);
  }, [syncNow]);

  useEffect(() => { localStorage.setItem(KEYS.quests, JSON.stringify(quests)); }, [quests]);
  useEffect(() => { localStorage.setItem(KEYS.goals, JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem(KEYS.training, JSON.stringify(training)); }, [training]);
  useEffect(() => { localStorage.setItem(KEYS.categories, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(KEYS.settings, JSON.stringify(settings)); }, [settings]);

  const artworkVersion = `${profile.updatedAt || "new"}:${artworkRefreshKey}`;
  useEffect(() => {
    if (!profile.hasPoster) return undefined;
    let cancelled = false;
    let objectUrl = "";
    api.getArtwork().then(({ data }) => {
      objectUrl = URL.createObjectURL(data);
      if (cancelled) URL.revokeObjectURL(objectUrl);
      else setPosterAsset({ url: objectUrl, version: artworkVersion });
    }).catch(() => {
      if (!cancelled) setPosterAsset({ url: "", version: artworkVersion });
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [profile.hasPoster, profile.updatedAt, artworkRefreshKey, artworkVersion]);

  const mutate = useCallback(async (request) => {
    setSyncStatus("saving");
    setSyncError("");
    try {
      const result = await request();
      await refresh();
      setSyncStatus("synced");
      return result;
    } catch (error) {
      setSyncStatus("error");
      setSyncError(error.response?.data?.message || "Could not save this change. Check your connection and retry.");
      throw error;
    }
  }, [refresh]);

  const addQuest = (quest) => mutate(() => api.createQuest({ ...quest, clientId: makeId() }));
  const toggleQuest = (id, completed) => mutate(() => api.updateQuest(id, { completed }));
  const deleteQuest = (id) => mutate(() => api.deleteQuest(id));
  const addGoal = (goal) => mutate(() => api.createGoal({ ...goal, clientId: makeId() }));
  const adjustGoal = (id, amount) => mutate(() => api.updateGoal(id, { progressDelta: amount }));
  const updateGoal = (id, goal) => mutate(() => api.updateGoal(id, goal));
  const deleteGoal = (id) => mutate(() => api.deleteGoal(id));
  const addTraining = (entry) => mutate(() => api.createTraining({ ...entry, clientId: makeId() }));
  const toggleSolved = (id, solved) => mutate(() => api.updateTraining(id, { solved }));
  const deleteTraining = (id) => mutate(() => api.deleteTraining(id));
  const addCategory = (module, name) => mutate(() => api.createCategory({ module, name }));
  const removeCategory = (id) => mutate(() => api.deleteCategory(id));
  const saveSettings = (nextSettings) => mutate(() => api.updateSettings(nextSettings));
  const saveTheme = (theme) => mutate(() => api.updateTheme(theme));
  const saveArtwork = async (dataUrl, fileName) => {
    const result = await mutate(() => api.uploadArtwork({ dataUrl, fileName }));
    setArtworkRefreshKey((key) => key + 1);
    return result;
  };
  const removeArtwork = () => mutate(() => api.deleteArtwork());

  const fallbackXp = quests.reduce((total, quest) => total + (quest.completed ? Number(quest.xp) || 0 : 0), 0);
  const xp = power?.totalXp ?? fallbackXp;
  const rank = power
    ? { name: power.rank, next: xp + power.xpToNextLevel, floor: xp - power.levelProgress }
    : rankFor(xp, settings);
  const posterUrl = profile.hasPoster && posterAsset.version === artworkVersion ? posterAsset.url : "";

  const value = {
    quests, goals, training, categories, settings, profile, posterUrl, power, xp, rank, today: todayKey(), syncStatus, syncError,
    syncNow, addQuest, toggleQuest, deleteQuest, addGoal, adjustGoal, updateGoal, deleteGoal,
    addTraining, toggleSolved, deleteTraining, addCategory, removeCategory, saveSettings,
    saveTheme, saveArtwork, removeArtwork,
  };

  return <ProductivityContext.Provider value={value}>{children}</ProductivityContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProductivity() {
  const value = useContext(ProductivityContext);
  if (!value) throw new Error("useProductivity must be used inside ProductivityProvider");
  return value;
}
