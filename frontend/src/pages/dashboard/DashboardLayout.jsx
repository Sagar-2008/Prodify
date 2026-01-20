import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Typed from "typed.js";
import { useMusic } from "../../hooks/useMusic";
import { getTodayHabits, toggleHabit } from "../../api/habits.api";
import "../../styles/Dashboard.css";

const QUOTES = [
  "Small steps every day lead to big wins.",
  "Discipline beats motivation.",
  "Focus on progress, not perfection.",
  "Consistency creates confidence.",
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const quoteRef = useRef(null);
  const typedInstance = useRef(null);
  const { playing, preset, track } = useMusic();

  const [todayHabits, setTodayHabits] = useState([]);
  const [quickTasks, setQuickTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("quickTasks");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse quick tasks:", e);
      return [];
    }
  });
  const [newTaskInput, setNewTaskInput] = useState("");

  /* AUTH CHECK */
  useEffect(() => {
    axios
      .get("http://localhost:5000/user/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .catch(() => {
        localStorage.clear();
        navigate("/login");
      });
  }, [navigate]);

  /* LOAD TODAY HABITS */
  useEffect(() => {
    const load = async () => {
      const res = await getTodayHabits();
      setTodayHabits(res.data);
    };

    load();

    // Only listen to calendar toggle events
    window.addEventListener("habit-toggled-from-calendar", load);

    return () => {
      window.removeEventListener("habit-toggled-from-calendar", load);
    };
  }, []);

  /* TYPED QUOTE */
  useEffect(() => {
    typedInstance.current = new Typed(quoteRef.current, {
      strings: QUOTES,
      typeSpeed: 40,
      backDelay: 2600,
      loop: true,
      showCursor: true,
    });

    return () => typedInstance.current.destroy();
  }, []);

  const handleToggle = async (habitId, date) => {
    try {
      // Optimistic update
      setTodayHabits((prev) =>
        prev.map((h) =>
          h.habit_id === habitId && h.log_date === date
            ? { ...h, completed: h.completed ? 0 : 1 }
            : h,
        ),
      );

      await toggleHabit(habitId, date);
      // Dispatch event so calendar syncs back
      const event = new CustomEvent("habit-toggled-from-today", {
        detail: { habitId, date },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Failed to toggle habit:", error);
      // Reload on error
      const res = await getTodayHabits();
      setTodayHabits(res.data);
    }
  };

  const handleAddQuickTask = () => {
    if (!newTaskInput.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskInput,
      completed: false,
    };
    const updated = [...quickTasks, newTask];
    setQuickTasks(updated);
    localStorage.setItem("quickTasks", JSON.stringify(updated));
    setNewTaskInput("");
  };

  const handleToggleQuickTask = (taskId) => {
    const updated = quickTasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t,
    );
    setQuickTasks(updated);
    localStorage.setItem("quickTasks", JSON.stringify(updated));
  };

  const handleDeleteQuickTask = (taskId) => {
    const updated = quickTasks.filter((t) => t.id !== taskId);
    setQuickTasks(updated);
    localStorage.setItem("quickTasks", JSON.stringify(updated));
  };

  const menu = [
    { label: "Overview", path: "/dashboard/" },
    { label: "Pomodoro", path: "/dashboard/pomodoro" },
    { label: "Habits", path: "/dashboard/habits" },
    { label: "Music", path: "/dashboard/music" },
    { label: "Notes", path: "/dashboard/notes" },
    { label: "Analytics", path: "/dashboard/analytics" },
  ];

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2 className="logo">Prodify</h2>
        <nav className="menu">
          {menu.map((m) => (
            <button
              key={m.path}
              className={location.pathname === m.path ? "active" : ""}
              onClick={() => navigate(m.path)}
            >
              {m.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <p className="quote">
            <span ref={quoteRef} />
          </p>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </header>

        <section className="content">
          <Outlet />
        </section>
      </main>

      <aside className="right-panel">
        <div className="card">
          <h4>Now Playing</h4>
          {playing ? (
            <>
              <div style={{ fontSize: 24 }}>{preset?.icon}</div>
              <p>{track?.title}</p>
            </>
          ) : (
            <p>Nothing playing</p>
          )}
        </div>

        <div className="card">
          <h4>Today’s Habits</h4>
          <ul className="habit-list">
            {todayHabits.map((h) => (
              <li key={h.habit_id}>
                <label>
                  <span>{h.title}</span>
                  <input
                    type="checkbox"
                    checked={h.completed === 1}
                    onChange={() => handleToggle(h.habit_id, h.log_date)}
                  />
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="quick-header-right">
            <h4>Quick Tasks</h4>
            <button
              className="add-btn-right"
              onClick={() => {
                const input = document.getElementById("quick-task-input");
                if (input) input.focus();
              }}
            >
              ＋
            </button>
          </div>
          <div className="quick-task-input-wrapper">
            <input
              id="quick-task-input"
              type="text"
              placeholder="Add a quick task..."
              value={newTaskInput}
              onChange={(e) => setNewTaskInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddQuickTask()}
              className="quick-task-input"
            />
            {newTaskInput.trim() && (
              <button
                className="quick-task-add-btn"
                onClick={handleAddQuickTask}
              >
                Add
              </button>
            )}
          </div>
          <ul className="quick-tasks-right">
            {quickTasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : ""}>
                <label>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleQuickTask(task.id)}
                  />
                  <span>{task.text}</span>
                </label>
                <button
                  className="delete-task-btn"
                  onClick={() => handleDeleteQuickTask(task.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
