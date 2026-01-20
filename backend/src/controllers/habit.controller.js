import { db } from "../config/db.js";

/* GET all habits */
export const getHabits = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [habits] = await db.query(
      "SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(habits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch habits" });
  }
};

/* ADD habit */
export const addHabit = async (req, res) => {
  const { title } = req.body;
  const userId = req.user.userId;

  if (!title?.trim()) {
    return res.status(400).json({ message: "Title required" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO habits (user_id, title) VALUES (?, ?)",
      [userId, title.trim()]
    );

    res.status(201).json({
      id: result.insertId,
      title: title.trim(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add habit" });
  }
};

/* DELETE habit (cascade-safe) */
export const deleteHabit = async (req, res) => {
  const userId = req.user.userId;
  const habitId = req.params.id;

  try {
    await db.query(
      "DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ?",
      [habitId, userId]
    );

    await db.query(
      "DELETE FROM habits WHERE id = ? AND user_id = ?",
      [habitId, userId]
    );

    res.json({ message: "Habit deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete habit" });
  }
};

/* TOGGLE habit (FIXED) */
export const toggleHabit = async (req, res) => {
  const habitId = req.params.id;
  const userId = req.user.userId;

  const date =
    req.body.date ||
    new Date().toISOString().slice(0, 10);

  try {
    const [rows] = await db.query(
      `
      SELECT id, completed
      FROM habit_logs
      WHERE habit_id = ? AND user_id = ? AND log_date = ?
      `,
      [habitId, userId, date]
    );

    if (rows.length) {
      await db.query(
        `
        UPDATE habit_logs
        SET completed = !completed
        WHERE id = ?
        `,
        [rows[0].id]
      );
    } else {
      await db.query(
        `
        INSERT INTO habit_logs (habit_id, user_id, log_date, completed)
        VALUES (?, ?, ?, 1)
        `,
        [habitId, userId, date]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Toggle failed" });
  }
};


/* GET habits by month */
export const getHabitsByMonth = async (req, res) => {
  const userId = req.user.userId;
  const { year, month } = req.query;

  try {
    const [habits] = await db.query(
      "SELECT * FROM habits WHERE user_id = ?",
      [userId]
    );

    const [logs] = await db.query(
      `SELECT habit_id, DATE_FORMAT(log_date, '%Y-%m-%d') as log_date, completed
       FROM habit_logs
       WHERE user_id = ?
       AND YEAR(log_date) = ?
       AND MONTH(log_date) = ?`,
      [userId, year, month]
    );

    console.log("✅ Habits:", habits.length, "| Logs:", logs.length, logs);

    res.json({ habits, logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch monthly habits" });
  }
};

/* GET today habits (right panel) */
export const getTodayHabits = async (req, res) => {
  const userId = req.user.userId;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const [rows] = await db.query(
      `
      SELECT h.id AS habit_id, h.title,
             IFNULL(l.completed, 0) AS completed,
             ? AS log_date
      FROM habits h
      LEFT JOIN habit_logs l
        ON h.id = l.habit_id
       AND DATE_FORMAT(l.log_date, '%Y-%m-%d') = ?
       AND l.user_id = ?
      WHERE h.user_id = ?
      `,
      [today, today, userId, userId]
    );

    console.log("✅ Today's habits:", rows.length, rows);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch today habits" });
  }
};

/* GET habit analytics - streak and monthly data */
export const getHabitAnalytics = async (req, res) => {
  const userId = req.user.userId;

  try {
    // Get current streak
    const today = new Date();
    const [streakData] = await db.query(
      `
      WITH RECURSIVE date_series AS (
        SELECT DATE_SUB(?, INTERVAL 0 DAY) as check_date
        UNION ALL
        SELECT DATE_SUB(check_date, INTERVAL 1 DAY)
        FROM date_series
        WHERE check_date > DATE_SUB(?, INTERVAL 365 DAY)
      )
      SELECT COUNT(*) as streak
      FROM date_series ds
      WHERE NOT EXISTS (
        SELECT 1 FROM habit_logs hl
        WHERE hl.user_id = ?
        AND hl.log_date = ds.check_date
        AND hl.completed = 0
        AND EXISTS (
          SELECT 1 FROM habits h
          WHERE h.user_id = ? AND h.id = hl.habit_id
        )
      )
      AND EXISTS (
        SELECT 1 FROM habit_logs hl
        WHERE hl.user_id = ?
        AND hl.log_date = ds.check_date
        AND hl.completed = 1
      )
      `,
      [today, today, userId, userId, userId]
    );

    // Get total habits count
    const [totalHabitsData] = await db.query(
      `
      SELECT COUNT(*) as total_habits
      FROM habits
      WHERE user_id = ?
      `,
      [userId]
    );

    // Get habits per day for current month
    const [monthlyData] = await db.query(
      `
      SELECT DATE(log_date) as date, COUNT(*) as habits_completed
      FROM habit_logs
      WHERE user_id = ? 
      AND YEAR(log_date) = YEAR(NOW())
      AND MONTH(log_date) = MONTH(NOW())
      AND completed = 1
      GROUP BY DATE(log_date)
      ORDER BY DATE(log_date)
      `,
      [userId]
    );

    res.json({
      streak: streakData[0]?.streak || 0,
      monthlyData: monthlyData || [],
      totalHabits: totalHabitsData[0]?.total_habits || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

