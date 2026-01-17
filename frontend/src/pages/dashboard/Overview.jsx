import { useNavigate } from "react-router-dom";

export default function Overview() {
  const navigate = useNavigate();

  return (
    <>
      <h1>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Focus Time</h3>
          <p>2h 10m</p>
        </div>
        <div className="stat-card">
          <h3>Habits Done</h3>
          <p>3 / 5</p>
        </div>
        <div className="stat-card">
          <h3>Streak</h3>
          <p>🔥 1 day</p>
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
