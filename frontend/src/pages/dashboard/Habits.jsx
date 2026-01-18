import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Habits.css";

export default function Habits() {
  const [habits, setHabits] = useState([]);
  const [habitData, setHabitData] = useState([]);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:5000/habits";

  // Get auth headers
  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  // Fetch habits and monthly data
  useEffect(() => {
    fetchHabits();
    fetchMonthlyData();
  }, [currentMonth, currentYear]);

  const fetchHabits = async () => {
    try {
      const res = await axios.get(API_BASE, { headers: getHeaders() });
      setHabits(res.data.data || []);
    } catch (err) {
      console.error("Error fetching habits:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/monthly`, {
        params: { month: currentMonth, year: currentYear },
        headers: getHeaders(),
      });
      setHabitData(res.data.data || []);
    } catch (err) {
      console.error("Error fetching monthly data:", err);
    }
  };

  const createHabit = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    try {
      await axios.post(API_BASE, { title: newHabitTitle }, { headers: getHeaders() });
      setNewHabitTitle("");
      fetchHabits();
      fetchMonthlyData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create habit");
    }
  };

  const toggleHabit = async (habitId, date) => {
    try {
      await axios.post(
        `${API_BASE}/toggle`,
        { habitId, date },
        { headers: getHeaders() }
      );
      fetchMonthlyData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to toggle habit");
    }
  };

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  // Get day labels (1-31)
  const getDayLabels = () => {
    const days = getDaysInMonth(currentMonth, currentYear);
    return Array.from({ length: days }, (_, i) => i + 1);
  };

  // Format date as YYYY-MM-DD
  const formatDate = (day) => {
    return `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  // Check if habit is completed for a date
  const isCompleted = (habitId, date) => {
    const habit = habitData.find((h) => h.id === habitId);
    if (!habit || !habit.logs) return false;
    return habit.logs[date] === true;
  };

  // Month navigation
  const changeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  if (loading) {
    return <div className="habits-loading">Loading habits...</div>;
  }

  return (
    <div className="habits-page">
      <div className="habits-header">
        <h1>Habit Tracker</h1>
        <p>Track your daily habits with a monthly calendar view</p>
      </div>

      {/* Create Habit Form */}
      <form onSubmit={createHabit} className="habit-form">
        <input
          type="text"
          placeholder="Enter habit name (e.g., 'Read 10 pages')"
          value={newHabitTitle}
          onChange={(e) => setNewHabitTitle(e.target.value)}
          className="habit-input"
        />
        <button type="submit" className="btn-primary habit-btn">
          Add Habit
        </button>
      </form>

      {/* Month Navigation */}
      <div className="month-navigation">
        <button onClick={() => changeMonth(-1)} className="month-btn">
          ← Previous
        </button>
        <h2>
          {monthNames[currentMonth - 1]} {currentYear}
        </h2>
        <button onClick={() => changeMonth(1)} className="month-btn">
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      {habits.length === 0 ? (
        <div className="habits-empty">
          <p>No habits yet. Create your first habit above!</p>
        </div>
      ) : (
        <div className="habits-calendar">
          <div className="calendar-header">
            <div className="habit-name-header">Habit</div>
            <div className="days-header">
              {getDayLabels().map((day) => (
                <div key={day} className="day-header">
                  {day}
                </div>
              ))}
            </div>
          </div>

          {habits.map((habit) => (
            <div key={habit.id} className="habit-row">
              <div className="habit-name">{habit.title}</div>
              <div className="habit-days">
                {getDayLabels().map((day) => {
                  const date = formatDate(day);
                  const completed = isCompleted(habit.id, date);

                  return (
                    <button
                      key={day}
                      className={`habit-day ${completed ? "completed" : ""}`}
                      onClick={() => toggleHabit(habit.id, date)}
                      title={date}
                    >
                      {completed ? "✓" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
