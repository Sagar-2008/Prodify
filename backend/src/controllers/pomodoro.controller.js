import { db } from "../config/db.js";

export const savePomodoroSession = async (req, res) => {
  const { taskName, duration } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!taskName || !duration) {
    return res.status(400).json({ message: "Missing taskName or duration" });
  }

  try {
    const completedAt = new Date();

    await db.query(
      `INSERT INTO pomodoro_sessions (user_id, task_name, session_type, duration_minutes, completed_at)
       VALUES (?, ?, 'focus', ?, ?)`,
      [userId, taskName, duration, completedAt]
    );

    return res.status(201).json({ 
      message: "Pomodoro session saved successfully",
      data: {
        taskName,
        duration,
        completedAt
      }
    });
  } catch (err) {
    console.error("Error saving Pomodoro session:", err);
    return res.status(500).json({ message: "Failed to save Pomodoro session" });
  }
};

export const getPomodoroSessions = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const [sessions] = await db.query(
      `SELECT id, task_name, session_type, duration_minutes, completed_at 
       FROM pomodoro_sessions 
       WHERE user_id = ? 
       ORDER BY completed_at DESC`,
      [userId]
    );

    return res.status(200).json({ 
      message: "Pomodoro sessions retrieved successfully",
      data: sessions
    });
  } catch (err) {
    console.error("Error fetching Pomodoro sessions:", err);
    return res.status(500).json({ message: "Failed to fetch Pomodoro sessions" });
  }
};

export const getPomodoroStats = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total_sessions,
        SUM(duration_minutes) as total_minutes,
        AVG(duration_minutes) as avg_duration
       FROM pomodoro_sessions 
       WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({ 
      message: "Pomodoro stats retrieved successfully",
      data: stats[0]
    });
  } catch (err) {
    console.error("Error fetching Pomodoro stats:", err);
    return res.status(500).json({ message: "Failed to fetch Pomodoro stats" });
  }
};
