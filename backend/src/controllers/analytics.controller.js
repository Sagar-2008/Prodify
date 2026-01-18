import { db } from "../config/db.js";

// ================= GET ANALYTICS =================
export const getAnalytics = async (req, res) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    // Total focus hours
    const [focusStats] = await db.query(
      `SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration_minutes), 0) as total_minutes
       FROM pomodoro_sessions 
       WHERE user_id = ? AND session_type = 'focus'`,
      [userId]
    );

    const totalHours = Math.round((focusStats[0].total_minutes / 60) * 10) / 10;

    // Current streak (consecutive days with at least one completed habit)
    const [streakData] = await db.query(
      `SELECT DISTINCT DATE(created_at) as log_date
       FROM habit_logs
       WHERE habit_id IN (SELECT id FROM habits WHERE user_id = ?)
       AND completed = TRUE
       ORDER BY log_date DESC`,
      [userId]
    );

    let currentStreak = 0;
    if (streakData.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);

      for (const row of streakData) {
        const logDate = new Date(row.log_date);
        logDate.setHours(0, 0, 0, 0);

        if (logDate.getTime() === checkDate.getTime()) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else if (currentStreak === 0 && logDate.getTime() === checkDate.getTime() - 86400000) {
          // Start counting if yesterday had a completion
          checkDate.setDate(checkDate.getDate() - 1);
          currentStreak = 1;
        } else {
          break;
        }
      }
    }

    // Habit completion percentage for current month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [monthlyHabits] = await db.query(
      `SELECT id, title FROM habits WHERE user_id = ?`,
      [userId]
    );

    const [monthlyLogs] = await db.query(
      `SELECT habit_id, COUNT(*) as completed_count
       FROM habit_logs
       WHERE habit_id IN (SELECT id FROM habits WHERE user_id = ?)
       AND YEAR(log_date) = ?
       AND MONTH(log_date) = ?
       AND completed = TRUE
       GROUP BY habit_id`,
      [userId, currentYear, currentMonth]
    );

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const totalPossibleCompletions = monthlyHabits.length * daysInMonth;
    const totalCompleted = monthlyLogs.reduce((sum, log) => sum + log.completed_count, 0);

    const habitCompletionPercentage =
      totalPossibleCompletions > 0
        ? Math.round((totalCompleted / totalPossibleCompletions) * 100)
        : 0;

    // Focus hours per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [dailyFocus] = await db.query(
      `SELECT 
        DATE(completed_at) as date,
        SUM(duration_minutes) as minutes
       FROM pomodoro_sessions
       WHERE user_id = ? 
       AND session_type = 'focus'
       AND completed_at >= ?
       GROUP BY DATE(completed_at)
       ORDER BY date ASC`,
      [userId, sevenDaysAgo]
    );

    const dailyFocusHours = dailyFocus.map((row) => ({
      date: row.date.toISOString().split("T")[0],
      hours: Math.round((row.minutes / 60) * 10) / 10,
    }));

    return res.status(200).json({
      message: "Analytics retrieved successfully",
      data: {
        totalFocusHours: totalHours,
        currentStreak: currentStreak,
        habitCompletionPercentage: habitCompletionPercentage,
        dailyFocusHours: dailyFocusHours,
        totalSessions: focusStats[0].total_sessions,
      },
    });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    return res.status(500).json({ message: "Failed to fetch analytics" });
  }
};
