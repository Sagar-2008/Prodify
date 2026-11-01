import { randomUUID } from "node:crypto";
import { db } from "../config/db.js";

const DEFAULT_RANKS = ["Earthling", "Saiyan", "Super Saiyan", "Ascended Saiyan", "Super Saiyan 2", "Super Saiyan 3", "Super Saiyan God", "Ultra Instinct"];
const MODULES = new Set(["quest", "goal", "training"]);
const THEMES = new Set(["capsule", "solar", "namek", "kai", "rose"]);
const MAX_ARTWORK_BYTES = 4 * 1024 * 1024;
const today = () => new Date().toISOString().slice(0, 10);
const text = (value, max = 160) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
const numericId = (value) => /^\d+$/.test(String(value)) ? Number(value) : null;
const fail = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({ message });
};

function rankNames(value) {
  try {
    const parsed = JSON.parse(value);
    const names = Array.isArray(parsed) ? [...new Set(parsed.map((name) => text(name, 40)).filter(Boolean))].slice(0, 16) : [];
    return names.length >= 4 ? names : DEFAULT_RANKS;
  } catch {
    return DEFAULT_RANKS;
  }
}

async function powerSummary(userId, settings) {
  const [[quest], [focus], [training]] = await Promise.all([
    db.query("SELECT COALESCE(SUM(xp_reward), 0) AS xp FROM productivity_quests WHERE user_id = ? AND is_completed = 1", [userId]),
    db.query("SELECT COUNT(*) AS sessions FROM pomodoro_sessions WHERE user_id = ?", [userId]),
    db.query("SELECT COALESCE(SUM(duration_minutes), 0) AS minutes, COALESCE(SUM(is_solved), 0) AS solved FROM productivity_training_entries WHERE user_id = ?", [userId]),
  ]);
  const questXp = Number(quest[0]?.xp || 0);
  const focusSessions = Number(focus[0]?.sessions || 0);
  const practiceMinutes = Number(training[0]?.minutes || 0);
  const solvedCount = Number(training[0]?.solved || 0);
  const baseXp = questXp
    + focusSessions * Number(settings.focus_xp)
    + Math.floor(practiceMinutes * Number(settings.training_xp_per_hour) / 60)
    + solvedCount * Number(settings.solved_bonus);
  const totalXp = Math.floor(baseXp * Number(settings.xp_multiplier));
  const xpPerLevel = Number(settings.xp_per_level);
  const level = Math.floor(totalXp / xpPerLevel) + 1;
  const names = rankNames(settings.rank_names);
  const rankIndex = Math.min(names.length - 1, Math.floor((level - 1) / 10));
  const nextRankLevel = rankIndex < names.length - 1 ? (rankIndex + 1) * 10 + 1 : null;
  const nextRankXp = nextRankLevel ? (nextRankLevel - 1) * xpPerLevel : null;
  const rankStartXp = rankIndex * 10 * xpPerLevel;
  const rankProgress = nextRankXp === null
    ? 100
    : Math.min(100, Math.max(0, ((totalXp - rankStartXp) / (nextRankXp - rankStartXp)) * 100));
  return {
    totalXp,
    powerLevel: Math.floor(Math.pow(10, Math.min((level - 1) / 10, 300))),
    level,
    levelProgress: totalXp % xpPerLevel,
    xpPerLevel,
    xpToNextLevel: xpPerLevel - (totalXp % xpPerLevel),
    rank: names[rankIndex],
    nextRank: nextRankLevel ? names[rankIndex + 1] : null,
    nextRankLevel,
    nextRankXp,
    xpToNextRank: nextRankXp === null ? null : Math.max(0, nextRankXp - totalXp),
    rankProgress,
    focusSessions,
    practiceMinutes,
    solvedCount,
    questXp,
  };
}

export const getProductivity = async (req, res) => {
  const userId = req.user.userId;
  try {
    await db.query("INSERT IGNORE INTO productivity_settings (user_id) VALUES (?)", [userId]);
    await db.query("INSERT IGNORE INTO productivity_profiles (user_id) VALUES (?)", [userId]);
    const [[quests], [goals], [training], [categories], [rows], [profileRows]] = await Promise.all([
      db.query("SELECT id, client_id, title, category, xp_reward, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date, is_completed, created_at, completed_at FROM productivity_quests WHERE user_id = ? ORDER BY due_date, created_at DESC", [userId]),
      db.query("SELECT id, client_id, title, area, kind, target, progress, DATE_FORMAT(target_date, '%Y-%m-%d') AS target_date, created_at FROM productivity_goals WHERE user_id = ? ORDER BY created_at DESC", [userId]),
      db.query("SELECT id, client_id, title, category, duration_minutes, is_solved, DATE_FORMAT(entry_date, '%Y-%m-%d') AS entry_date, created_at FROM productivity_training_entries WHERE user_id = ? ORDER BY entry_date DESC, created_at DESC", [userId]),
      db.query("SELECT id, module, name FROM productivity_categories WHERE user_id = ? ORDER BY name", [userId]),
      db.query("SELECT xp_per_level, xp_multiplier, focus_xp, training_xp_per_hour, solved_bonus, rank_names FROM productivity_settings WHERE user_id = ?", [userId]),
      db.query("SELECT theme_id, poster_mime, poster_name, DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at FROM productivity_profiles WHERE user_id = ?", [userId]),
    ]);
    const row = rows[0] || {};
    const settings = {
      xp_per_level: Number(row.xp_per_level || 100),
      xp_multiplier: Number(row.xp_multiplier || 1),
      focus_xp: Number(row.focus_xp ?? 25),
      training_xp_per_hour: Number(row.training_xp_per_hour ?? 60),
      solved_bonus: Number(row.solved_bonus ?? 20),
      rank_names: row.rank_names,
    };
    const custom = { quest: [], goal: [], training: [] };
    const profile = profileRows[0] || {};
    categories.forEach((item) => custom[item.module]?.push({ id: String(item.id), name: item.name }));
    return res.json({
      userId,
      quests: quests.map((item) => ({
        id: String(item.id), clientId: item.client_id, title: item.title, category: item.category,
        xp: Number(item.xp_reward), dueDate: item.due_date, completed: Boolean(item.is_completed),
        completedAt: item.completed_at, createdAt: new Date(item.created_at).getTime(),
      })),
      goals: goals.map((item) => ({
        id: String(item.id), clientId: item.client_id, title: item.title, area: item.area,
        kind: item.kind, target: Number(item.target), progress: Number(item.progress),
        dueDate: item.target_date, createdAt: new Date(item.created_at).getTime(),
      })),
      training: training.map((item) => ({
        id: String(item.id), clientId: item.client_id, title: item.title, type: item.category,
        minutes: Number(item.duration_minutes), solved: Boolean(item.is_solved), date: item.entry_date,
        createdAt: new Date(item.created_at).getTime(),
      })),
      categories: custom,
      settings: {
        xpPerLevel: settings.xp_per_level, xpMultiplier: settings.xp_multiplier,
        focusXp: settings.focus_xp, trainingXpPerHour: settings.training_xp_per_hour,
        solvedBonus: settings.solved_bonus, rankNames: rankNames(settings.rank_names),
        usesCustomRanks: Boolean(settings.rank_names),
      },
      profile: {
        theme: THEMES.has(profile.theme_id) ? profile.theme_id : "capsule",
        hasPoster: Boolean(profile.poster_mime),
        posterName: profile.poster_name || "",
        updatedAt: profile.updated_at || null,
      },
      power: await powerSummary(userId, settings),
    });
  } catch (error) {
    return fail(res, error, "Failed to load productivity data");
  }
};

export const importLocalData = async (req, res) => {
  const { quests = [], goals = [], training = [] } = req.body || {};
  if (![quests, goals, training].every((items) => Array.isArray(items) && items.length <= 500)) {
    return res.status(400).json({ message: "Invalid local data batch" });
  }
  const userId = req.user.userId;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (const item of quests) {
      const title = text(item.title || item.text);
      if (!title) continue;
      const id = item.clientId || item.id || randomUUID();
      await connection.query(
        "INSERT IGNORE INTO productivity_quests (user_id, client_id, title, category, xp_reward, due_date, is_completed, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, IF(? = 1, CURRENT_TIMESTAMP, NULL))",
        [userId, text("local-" + id, 80), title, text(item.category, 64) || "Personal", Math.max(0, Math.min(10000, Number(item.xp) || 10)), validDate(item.dueDate) ? item.dueDate : today(), item.completed ? 1 : 0, item.completed ? 1 : 0],
      );
    }
    for (const item of goals) {
      const title = text(item.title);
      if (!title) continue;
      const target = Math.max(1, Number(item.target) || 1);
      const id = item.clientId || item.id || randomUUID();
      await connection.query(
        "INSERT IGNORE INTO productivity_goals (user_id, client_id, title, area, kind, target, progress, target_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, text("local-" + id, 80), title, text(item.area, 64) || "Personal", text(item.kind, 32) || "Goal", target, Math.max(0, Math.min(target, Number(item.progress) || 0)), validDate(item.dueDate) ? item.dueDate : null],
      );
    }
    for (const item of training) {
      const title = text(item.title);
      if (!title) continue;
      const id = item.clientId || item.id || randomUUID();
      await connection.query(
        "INSERT IGNORE INTO productivity_training_entries (user_id, client_id, title, category, duration_minutes, is_solved, entry_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [userId, text("local-" + id, 80), title, text(item.type, 64) || "Study", Math.max(1, Math.min(720, Number(item.minutes) || 1)), item.solved ? 1 : 0, validDate(item.date) ? item.date : today()],
      );
    }
    await connection.commit();
    return res.json({ message: "Local activity imported" });
  } catch (error) {
    await connection.rollback();
    return fail(res, error, "Failed to import local activity");
  } finally {
    connection.release();
  }
};

export const createQuest = async (req, res) => {
  const title = text(req.body?.title);
  const category = text(req.body?.category, 64);
  const dueDate = req.body?.dueDate;
  const xp = Number(req.body?.xp);
  if (!title || !category || !validDate(dueDate) || !Number.isInteger(xp) || xp < 0 || xp > 10000) return res.status(400).json({ message: "Quest details are invalid" });
  try {
    const clientId = text(req.body.clientId, 80) || randomUUID();
    const [result] = await db.query(
      "INSERT INTO productivity_quests (user_id, client_id, title, category, xp_reward, due_date) VALUES (?, ?, ?, ?, ?, ?)",
      [req.user.userId, clientId, title, category, xp, dueDate],
    );
    return res.status(201).json({ id: String(result.insertId), clientId });
  } catch (error) {
    return fail(res, error, "Failed to create quest");
  }
};

export const updateQuest = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid quest ID" });
  try {
    const [rows] = await db.query("SELECT is_completed FROM productivity_quests WHERE id = ? AND user_id = ?", [id, req.user.userId]);
    if (!rows.length) return res.status(404).json({ message: "Quest not found" });
    const completed = typeof req.body?.completed === "boolean" ? req.body.completed : !Boolean(rows[0].is_completed);
    await db.query(
      "UPDATE productivity_quests SET is_completed = ?, completed_at = IF(? = 1, CURRENT_TIMESTAMP, NULL) WHERE id = ? AND user_id = ?",
      [completed ? 1 : 0, completed ? 1 : 0, id, req.user.userId],
    );
    return res.json({ id: String(id), completed });
  } catch (error) {
    return fail(res, error, "Failed to update quest");
  }
};

export const deleteQuest = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid quest ID" });
  try {
    const [result] = await db.query("DELETE FROM productivity_quests WHERE id = ? AND user_id = ?", [id, req.user.userId]);
    return result.affectedRows ? res.json({ id: String(id) }) : res.status(404).json({ message: "Quest not found" });
  } catch (error) {
    return fail(res, error, "Failed to delete quest");
  }
};

export const createGoal = async (req, res) => {
  const title = text(req.body?.title);
  const area = text(req.body?.area, 64);
  const kind = text(req.body?.kind, 32) || "Goal";
  const target = Number(req.body?.target);
  const dueDate = req.body?.dueDate || null;
  if (!title || !area || !Number.isInteger(target) || target < 1 || target > 100000 || (dueDate && !validDate(dueDate))) return res.status(400).json({ message: "Goal details are invalid" });
  try {
    const clientId = text(req.body.clientId, 80) || randomUUID();
    const [result] = await db.query(
      "INSERT INTO productivity_goals (user_id, client_id, title, area, kind, target, target_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.userId, clientId, title, area, kind, target, dueDate],
    );
    return res.status(201).json({ id: String(result.insertId), clientId });
  } catch (error) {
    return fail(res, error, "Failed to create goal");
  }
};

export const updateGoal = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid goal ID" });
  try {
    const [rows] = await db.query("SELECT target, progress FROM productivity_goals WHERE id = ? AND user_id = ?", [id, req.user.userId]);
    if (!rows.length) return res.status(404).json({ message: "Goal not found" });
    const currentTarget = Number(rows[0].target);
    if (Number.isInteger(Number(req.body?.progressDelta))) {
      const delta = Number(req.body.progressDelta);
      await db.query("UPDATE productivity_goals SET progress = LEAST(target, GREATEST(0, progress + ?)) WHERE id = ? AND user_id = ?", [delta, id, req.user.userId]);
      return res.json({ id: String(id), progress: Math.max(0, Math.min(currentTarget, Number(rows[0].progress) + delta)) });
    }
    const title = req.body?.title === undefined ? null : text(req.body.title);
    const area = req.body?.area === undefined ? null : text(req.body.area, 64);
    const kind = req.body?.kind === undefined ? null : text(req.body.kind, 32);
    const target = req.body?.target === undefined ? currentTarget : Number(req.body.target);
    const dueDate = req.body?.dueDate;
    if (title === "" || area === "" || kind === "" || !Number.isInteger(target) || target < 1 || target > 100000 || (dueDate && !validDate(dueDate))) return res.status(400).json({ message: "Goal details are invalid" });
    await db.query(
      "UPDATE productivity_goals SET title = COALESCE(?, title), area = COALESCE(?, area), kind = COALESCE(?, kind), target = ?, progress = LEAST(progress, ?), target_date = ? WHERE id = ? AND user_id = ?",
      [title, area, kind, target, target, dueDate === undefined ? null : dueDate || null, id, req.user.userId],
    );
    return res.json({ id: String(id) });
  } catch (error) {
    return fail(res, error, "Failed to update goal");
  }
};

export const deleteGoal = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid goal ID" });
  try {
    const [result] = await db.query("DELETE FROM productivity_goals WHERE id = ? AND user_id = ?", [id, req.user.userId]);
    return result.affectedRows ? res.json({ id: String(id) }) : res.status(404).json({ message: "Goal not found" });
  } catch (error) {
    return fail(res, error, "Failed to delete goal");
  }
};

export const createTrainingEntry = async (req, res) => {
  const title = text(req.body?.title);
  const category = text(req.body?.category, 64);
  const minutes = Number(req.body?.minutes);
  const entryDate = req.body?.date || today();
  if (!title || !category || !Number.isInteger(minutes) || minutes < 1 || minutes > 720 || !validDate(entryDate)) return res.status(400).json({ message: "Training details are invalid" });
  try {
    const clientId = text(req.body.clientId, 80) || randomUUID();
    const [result] = await db.query(
      "INSERT INTO productivity_training_entries (user_id, client_id, title, category, duration_minutes, is_solved, entry_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [req.user.userId, clientId, title, category, minutes, req.body.solved ? 1 : 0, entryDate],
    );
    return res.status(201).json({ id: String(result.insertId), clientId });
  } catch (error) {
    return fail(res, error, "Failed to create training entry");
  }
};

export const updateTrainingEntry = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id || typeof req.body?.solved !== "boolean") return res.status(400).json({ message: "Invalid training update" });
  try {
    const [result] = await db.query("UPDATE productivity_training_entries SET is_solved = ? WHERE id = ? AND user_id = ?", [req.body.solved ? 1 : 0, id, req.user.userId]);
    return result.affectedRows ? res.json({ id: String(id), solved: req.body.solved }) : res.status(404).json({ message: "Training entry not found" });
  } catch (error) {
    return fail(res, error, "Failed to update training entry");
  }
};

export const deleteTrainingEntry = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid training entry ID" });
  try {
    const [result] = await db.query("DELETE FROM productivity_training_entries WHERE id = ? AND user_id = ?", [id, req.user.userId]);
    return result.affectedRows ? res.json({ id: String(id) }) : res.status(404).json({ message: "Training entry not found" });
  } catch (error) {
    return fail(res, error, "Failed to delete training entry");
  }
};

export const createCategory = async (req, res) => {
  const moduleName = text(req.body?.module, 16).toLowerCase();
  const name = text(req.body?.name, 64);
  if (!MODULES.has(moduleName) || !name) return res.status(400).json({ message: "Choose a valid area and category name" });
  try {
    await db.query("INSERT IGNORE INTO productivity_categories (user_id, module, name) VALUES (?, ?, ?)", [req.user.userId, moduleName, name]);
    const [rows] = await db.query("SELECT id, name FROM productivity_categories WHERE user_id = ? AND module = ? AND name = ?", [req.user.userId, moduleName, name]);
    return res.status(201).json({ id: String(rows[0].id), module: moduleName, name: rows[0].name });
  } catch (error) {
    return fail(res, error, "Failed to save custom category");
  }
};

export const deleteCategory = async (req, res) => {
  const id = numericId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid category ID" });
  try {
    const [result] = await db.query("DELETE FROM productivity_categories WHERE id = ? AND user_id = ?", [id, req.user.userId]);
    return result.affectedRows ? res.json({ id: String(id) }) : res.status(404).json({ message: "Custom category not found" });
  } catch (error) {
    return fail(res, error, "Failed to delete custom category");
  }
};

export const updateSettings = async (req, res) => {
  const values = {
    xpPerLevel: Number(req.body?.xpPerLevel),
    xpMultiplier: Number(req.body?.xpMultiplier),
    focusXp: Number(req.body?.focusXp),
    trainingXpPerHour: Number(req.body?.trainingXpPerHour),
    solvedBonus: Number(req.body?.solvedBonus),
  };
  const ranks = req.body?.rankNames;
  if (!Number.isInteger(values.xpPerLevel) || values.xpPerLevel < 25 || values.xpPerLevel > 2000
    || !Number.isFinite(values.xpMultiplier) || values.xpMultiplier < 0.25 || values.xpMultiplier > 5
    || !Number.isInteger(values.focusXp) || values.focusXp < 0 || values.focusXp > 10000
    || !Number.isInteger(values.trainingXpPerHour) || values.trainingXpPerHour < 0 || values.trainingXpPerHour > 10000
    || !Number.isInteger(values.solvedBonus) || values.solvedBonus < 0 || values.solvedBonus > 10000
    || !Array.isArray(ranks) || ranks.length < 4 || ranks.length > 16 || ranks.some((name) => !text(name, 40))) {
    return res.status(400).json({ message: "Power scaling settings are invalid" });
  }
  try {
    await db.query(
      "INSERT INTO productivity_settings (user_id, xp_per_level, xp_multiplier, focus_xp, training_xp_per_hour, solved_bonus, rank_names) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE xp_per_level = VALUES(xp_per_level), xp_multiplier = VALUES(xp_multiplier), focus_xp = VALUES(focus_xp), training_xp_per_hour = VALUES(training_xp_per_hour), solved_bonus = VALUES(solved_bonus), rank_names = VALUES(rank_names)",
      [req.user.userId, values.xpPerLevel, values.xpMultiplier, values.focusXp, values.trainingXpPerHour, values.solvedBonus, JSON.stringify(ranks.map((name) => text(name, 40)))],
    );
    return res.json({ ...values, rankNames: ranks });
  } catch (error) {
    return fail(res, error, "Failed to save power scaling settings");
  }
};

export const getProfile = async (req, res) => {
  const userId = req.user.userId;
  try {
    await db.query("INSERT IGNORE INTO productivity_profiles (user_id) VALUES (?)", [userId]);
    const [rows] = await db.query(
      "SELECT theme_id, poster_mime, poster_name, DATE_FORMAT(updated_at, '%Y-%m-%d %H:%i:%s') AS updated_at FROM productivity_profiles WHERE user_id = ?",
      [userId],
    );
    const profile = rows[0];
    return res.json({
      theme: THEMES.has(profile.theme_id) ? profile.theme_id : "capsule",
      hasPoster: Boolean(profile.poster_mime),
      posterName: profile.poster_name || "",
      updatedAt: profile.updated_at,
    });
  } catch (error) {
    return fail(res, error, "Failed to load profile settings");
  }
};

export const updateTheme = async (req, res) => {
  const theme = text(req.body?.theme, 32).toLowerCase();
  if (!THEMES.has(theme)) return res.status(400).json({ message: "Choose one of the available color palettes" });
  try {
    await db.query("INSERT IGNORE INTO productivity_profiles (user_id) VALUES (?)", [req.user.userId]);
    await db.query("UPDATE productivity_profiles SET theme_id = ? WHERE user_id = ?", [theme, req.user.userId]);
    return res.json({ theme });
  } catch (error) {
    return fail(res, error, "Failed to save your color palette");
  }
};

function imageMatchesType(mime, bytes) {
  if (mime === "image/png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "image/webp") return bytes.length >= 12 && bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  if (mime === "image/gif") return bytes.length >= 6 && ["GIF87a", "GIF89a"].includes(bytes.toString("ascii", 0, 6));
  return false;
}

export const saveArtwork = async (req, res) => {
  const match = typeof req.body?.dataUrl === "string"
    ? req.body.dataUrl.match(/^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/)
    : null;
  if (!match) return res.status(400).json({ message: "Upload a PNG, JPEG, WebP, or GIF image" });

  const [, mime, encoded] = match;
  const bytes = Buffer.from(encoded, "base64");
  if (!bytes.length || bytes.length > MAX_ARTWORK_BYTES) return res.status(413).json({ message: "Choose an image smaller than 4 MB" });
  if (!imageMatchesType(mime, bytes)) return res.status(400).json({ message: "The image contents do not match their file type" });

  const fileName = text(req.body?.fileName, 160).replace(/[\\/\0]/g, "");
  try {
    await db.query(
      "INSERT INTO productivity_profiles (user_id, poster_mime, poster_name, poster_data) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE poster_mime = VALUES(poster_mime), poster_name = VALUES(poster_name), poster_data = VALUES(poster_data)",
      [req.user.userId, mime, fileName || "favorite-character", bytes],
    );
    return res.json({ saved: true, fileName: fileName || "favorite-character" });
  } catch (error) {
    return fail(res, error, "Failed to save your character poster");
  }
};

export const getArtwork = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT poster_mime, poster_data FROM productivity_profiles WHERE user_id = ? AND poster_mime IS NOT NULL",
      [req.user.userId],
    );
    if (!rows.length || !rows[0].poster_data) return res.status(404).json({ message: "No character poster has been saved" });
    return res.type(rows[0].poster_mime).set("Cache-Control", "private, no-store").send(rows[0].poster_data);
  } catch (error) {
    return fail(res, error, "Failed to load your character poster");
  }
};

export const deleteArtwork = async (req, res) => {
  try {
    await db.query(
      "UPDATE productivity_profiles SET poster_mime = NULL, poster_name = NULL, poster_data = NULL WHERE user_id = ?",
      [req.user.userId],
    );
    return res.json({ deleted: true });
  } catch (error) {
    return fail(res, error, "Failed to remove your character poster");
  }
};
