import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Analytics.css";

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000/analytics";

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(API_BASE, { headers: getHeaders() });
      setAnalytics(res.data.data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="analytics-error">Failed to load analytics</div>;
  }

  const { totalFocusHours, currentStreak, habitCompletionPercentage, dailyFocusHours, totalSessions } = analytics;

  // Simple bar chart data
  const maxHours = Math.max(...(dailyFocusHours.map((d) => d.hours) || [1]), 1);

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics</h1>
        <p>Track your productivity progress and achievements</p>
      </div>

      {/* Stats Cards */}
      <div className="analytics-stats">
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">{totalFocusHours.toFixed(1)}</div>
            <div className="stat-label">Total Focus Hours</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{currentStreak}</div>
            <div className="stat-label">Current Streak (days)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{habitCompletionPercentage}%</div>
            <div className="stat-label">Habit Completion</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{totalSessions || 0}</div>
            <div className="stat-label">Total Sessions</div>
          </div>
        </div>
      </div>

      {/* Daily Focus Chart */}
      {dailyFocusHours && dailyFocusHours.length > 0 && (
        <div className="chart-container">
          <h2>Focus Hours (Last 7 Days)</h2>
          <div className="chart-wrapper">
            <div className="chart-bars">
              {dailyFocusHours.map((day, idx) => (
                <div key={idx} className="chart-bar-container">
                  <div className="chart-bar-wrapper">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${(day.hours / maxHours) * 100}%`,
                      }}
                    >
                      <span className="chart-bar-value">{day.hours.toFixed(1)}h</span>
                    </div>
                  </div>
                  <div className="chart-label">
                    {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(!dailyFocusHours || dailyFocusHours.length === 0) && (
        <div className="analytics-empty">
          <p>No focus data yet. Start completing Pomodoro sessions to see your progress!</p>
        </div>
      )}
    </div>
  );
}
