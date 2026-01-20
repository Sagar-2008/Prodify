import { useEffect, useMemo, useState } from "react";
import {
  addHabit,
  deleteHabit,
  getHabitsByMonth,
  toggleHabit,
} from "../../api/habits.api";
import "../../styles/Habits.css";

export default function Habits() {
  const today = new Date();

  const [title, setTitle] = useState("");
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  /* ---------- LOAD MONTH ---------- */
  useEffect(() => {
    (async () => {
      const res = await getHabitsByMonth(year, month);
      setHabits(res.data.habits);
      setLogs(res.data.logs);
    })();
  }, [year, month]);

  /* ---------- LISTEN TO UPDATES FROM TODAY'S HABITS ---------- */
  useEffect(() => {
    const handleTodayToggle = (event) => {
      const { habitId, date } = event.detail;
      // Only update if the toggled date is in the current month view
      const toggledDate = new Date(date);
      if (
        toggledDate.getMonth() + 1 === month &&
        toggledDate.getFullYear() === year
      ) {
        // Optimistic update - flip the checkbox state
        setLogs((prev) => {
          const existing = prev.find(
            (l) => l.habit_id === habitId && l.log_date === date,
          );

          if (existing) {
            return prev.map((l) =>
              l === existing ? { ...l, completed: l.completed ? 0 : 1 } : l,
            );
          }

          return [...prev, { habit_id: habitId, log_date: date, completed: 1 }];
        });
      }
    };

    window.addEventListener("habit-toggled-from-today", handleTodayToggle);
    return () =>
      window.removeEventListener("habit-toggled-from-today", handleTodayToggle);
  }, [year, month]);

  /* ---------- HELPERS ---------- */
  const daysInMonth = new Date(year, month, 0).getDate();

  const isChecked = (habitId, date) =>
    logs.some(
      (l) => l.habit_id === habitId && l.log_date === date && l.completed === 1,
    );

  /* ---------- ACTIONS ---------- */
  const handleAdd = async () => {
    if (!title.trim()) return;
    await addHabit(title);
    setTitle("");
    const res = await getHabitsByMonth(year, month);
    setHabits(res.data.habits);
    setLogs(res.data.logs);
    window.dispatchEvent(new Event("habits-updated"));
  };

  const handleDelete = async (id) => {
    await deleteHabit(id);
    setHabits((h) => h.filter((x) => x.id !== id));
    setLogs((l) => l.filter((x) => x.habit_id !== id));
    window.dispatchEvent(new Event("habits-updated"));
  };

  const handleToggle = async (habitId, date) => {
    // 🔥 OPTIMISTIC UPDATE
    setLogs((prev) => {
      const existing = prev.find(
        (l) => l.habit_id === habitId && l.log_date === date,
      );

      if (existing) {
        return prev.map((l) =>
          l === existing ? { ...l, completed: l.completed ? 0 : 1 } : l,
        );
      }

      return [...prev, { habit_id: habitId, log_date: date, completed: 1 }];
    });

    try {
      await toggleHabit(habitId, date);
      // Dispatch for other components (right panel) to update, but don't reload this page
      window.dispatchEvent(
        new CustomEvent("habit-toggled-from-calendar", {
          detail: { habitId, date },
        }),
      );
    } catch (error) {
      console.error("Failed to toggle habit:", error);
      // Revert optimistic update on error by reloading
      const res = await getHabitsByMonth(year, month);
      setHabits(res.data.habits);
      setLogs(res.data.logs);
    }
  };

  /* ---------- CALENDAR ---------- */
  const calendar = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  }, [year, month, daysInMonth]);

  return (
    <div className="habits-page">
      <h1>Habits</h1>

      <div className="habit-input">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New habit"
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      <div className="habit-chips">
        {habits.map((h) => (
          <span key={h.id} className="chip">
            {h.title}
            <button onClick={() => handleDelete(h.id)}>×</button>
          </span>
        ))}
      </div>

      <div className="month-nav">
        <button
          onClick={() =>
            month === 1
              ? (setMonth(12), setYear(year - 1))
              : setMonth(month - 1)
          }
        >
          ◀
        </button>
        <span>
          {new Date(year, month - 1).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() =>
            month === 12
              ? (setMonth(1), setYear(year + 1))
              : setMonth(month + 1)
          }
        >
          ▶
        </button>
      </div>

      <div className="weekday-row">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendar.map((day, idx) => (
          <div key={idx} className="day-card">
            {day && (
              <>
                <div className="day-num">{day}</div>
                {habits.map((h) => {
                  const date = `${year}-${String(month).padStart(
                    2,
                    "0",
                  )}-${String(day).padStart(2, "0")}`;

                  return (
                    <label key={h.id} className="habit-check">
                      <input
                        type="checkbox"
                        checked={isChecked(h.id, date)}
                        onChange={() => handleToggle(h.id, date)}
                      />
                      {h.title}
                    </label>
                  );
                })}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
