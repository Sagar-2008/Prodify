import { db } from "../config/db.js";

// ================= CREATE HABIT =================
export const createHabit = async (req, res) => {
  const { title } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!title || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO habits (user_id, title) VALUES (?, ?)`,
      [userId, title.trim()]
    );

    return res.status(201).json({
      message: "Habit created successfully",
      data: {
        id: result.insertId,
        title: title.trim(),
        userId,
      },
    });
  } catch (err) {
    console.error("Error creating habit:", err);
    return res.status(500).json({ message: "Failed to create habit" });
  }
};

// ================= GET HABITS =================
export const getHabits = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const [habits] = await db.query(
      `SELECT id, title, created_at FROM habits WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    return res.status(200).json({
      message: "Habits retrieved successfully",
      data: habits,
    });
  } catch (err) {
    console.error("Error fetching habits:", err);
    return res.status(500).json({ message: "Failed to fetch habits" });
  }
};

// ================= TOGGLE HABIT LOG =================
export const toggleHabitLog = async (req, res) => {
  const { habitId, date } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!habitId || !date) {
    return res.status(400).json({ message: "habitId and date are required" });
  }

  try {
    // Verify habit belongs to user
    const [habitCheck] = await db.query(
      `SELECT id FROM habits WHERE id = ? AND user_id = ?`,
      [habitId, userId]
    );

    if (habitCheck.length === 0) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Check if log exists
    const [existing] = await db.query(
      `SELECT id, completed FROM habit_logs WHERE habit_id = ? AND log_date = ?`,
      [habitId, date]
    );

    if (existing.length > 0) {
      // Update existing log
      const newCompleted = !existing[0].completed;
      await db.query(
        `UPDATE habit_logs SET completed = ? WHERE id = ?`,
        [newCompleted, existing[0].id]
      );

      return res.status(200).json({
        message: "Habit log updated",
        data: { completed: newCompleted },
      });
    } else {
      // Create new log (default to completed=true when toggling)
      await db.query(
        `INSERT INTO habit_logs (habit_id, log_date, completed) VALUES (?, ?, ?)`,
        [habitId, date, true]
      );

      return res.status(201).json({
        message: "Habit log created",
        data: { completed: true },
      });
    }
  } catch (err) {
    console.error("Error toggling habit log:", err);
    return res.status(500).json({ message: "Failed to toggle habit log" });
  }
};

// ================= GET MONTHLY HABIT DATA =================
export const getMonthlyHabitData = async (req, res) => {
  const { month, year } = req.query;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const targetMonth = month || new Date().getMonth() + 1;
  const targetYear = year || new Date().getFullYear();

  try {
    // Get all habits for user
    const [habits] = await db.query(
      `SELECT id, title FROM habits WHERE user_id = ?`,
      [userId]
    );

    // Get all logs for the month
    const [logs] = await db.query(
      `SELECT habit_id, log_date, completed 
       FROM habit_logs 
       WHERE habit_id IN (SELECT id FROM habits WHERE user_id = ?)
       AND YEAR(log_date) = ? 
       AND MONTH(log_date) = ?`,
      [userId, targetYear, targetMonth]
    );

    // Structure the response
    const habitData = habits.map((habit) => {
      const habitLogs = logs.filter((log) => log.habit_id === habit.id);
      const logMap = {};
      habitLogs.forEach((log) => {
        logMap[log.log_date.toISOString().split("T")[0]] = log.completed;
      });

      return {
        id: habit.id,
        title: habit.title,
        logs: logMap,
      };
    });

    return res.status(200).json({
      message: "Monthly habit data retrieved",
      data: habitData,
      month: parseInt(targetMonth),
      year: parseInt(targetYear),
    });
  } catch (err) {
    console.error("Error fetching monthly habit data:", err);
    return res.status(500).json({ message: "Failed to fetch monthly habit data" });
  }
};
