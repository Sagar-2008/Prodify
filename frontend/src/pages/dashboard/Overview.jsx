import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTodayHabits, getPomodoroStats } from "../../api/habits.api";

export default function Overview() {
  const navigate = useNavigate();
  const [todayHabits, setTodayHabits] = useState([]);
  const [pomodoroStats, setPomodoroStats] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [habitRes, pomodoroRes] = await Promise.all([
          getTodayHabits(),
          getPomodoroStats(),
        ]);

        setTodayHabits(habitRes.data);
        setPomodoroStats(pomodoroRes.data.data);
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      }
    })();
  }, []);

  const completedHabits = todayHabits.filter((h) => h.completed === 1).length;
  const focusHours = pomodoroStats
    ? (pomodoroStats.total_minutes / 60).toFixed(1)
    : "0";

  return (
    <>
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Focus Time</h3>
          <p>{focusHours}h</p>
        </div>
        <div className="stat-card">
          <h3>Habits Done</h3>
          <p>
            {completedHabits} / {todayHabits.length}
          </p>
        </div>
        <div className="stat-card">
          <h3>Sessions</h3>
          <p>{pomodoroStats?.total_sessions || 0}</p>
        </div>
      </div>

      <div className="welcome-card">
        <h3>What do you want to work on?</h3>
        <p>Start a Pomodoro, check today’s habits, or review your analytics.</p>

        <div className="cta-actions">
          <button onClick={() => navigate("/dashboard/pomodoro")}>
            Start Pomodoro
          </button>
          <button onClick={() => navigate("/dashboard/habits")}>
            View Habits
          </button>
        </div>
      </div>
    </>
  );
}
