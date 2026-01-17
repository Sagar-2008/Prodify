import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Typed from "typed.js";
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

  const [habits, setHabits] = useState([
    { id: 1, text: "Drink water", done: true },
    { id: 2, text: "Read 10 pages", done: false },
  ]);

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

  /* TYPED QUOTE */
  useEffect(() => {
    typedInstance.current = new Typed(quoteRef.current, {
      strings: QUOTES,
      typeSpeed: 40,
      backSpeed: 0,
      backDelay: 2600,
      startDelay: 500,
      loop: true,
      showCursor: true,
    });

    return () => typedInstance.current.destroy();
  }, []);

  const toggleHabit = (id) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h))
    );
  };

  const menu = [
    { label: "Pomodoro", path: "/dashboard/pomodoro" },
    { label: "Habits", path: "/dashboard/habits" },
    { label: "Music", path: "/dashboard/music" },
    { label: "Notes", path: "/dashboard/notes" },
    { label: "Analytics", path: "/dashboard/analytics" },
  ];

  return (
    <div className="dashboard">
      {/* LEFT */}
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

        <div className="motivation-card">
          <div className="motivation-icon">🎯</div>
          <h3 className="motivation-title">Today's Focus</h3>
          <p className="motivation-text">Stay focused, one task at a time.</p>
          <div className="progress-ring">
            <div className="progress-fill" style={{ width: "65%" }} />
          </div>
          <p className="progress-text">65% Complete</p>
        </div>
      </aside>

      {/* CENTER */}
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

      {/* RIGHT */}
      <aside className="right-panel">
        <div className="card">
          <h4>Now Playing</h4>
          <p>Nothing playing</p>
        </div>

        <div className="card">
          <h4>Today’s Habits</h4>
          <ul className="habit-list">
            {habits.map((h) => (
              <li key={h.id}>
                <label>
                  <span>{h.text}</span>
                  <input
                    type="checkbox"
                    checked={h.done}
                    onChange={() => toggleHabit(h.id)}
                  />
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="quick-header-right">
            <h4>Quick Tasks</h4>
            <button className="add-btn-right">＋</button>
          </div>
          <ul className="quick-tasks-right">
            <li>Finish notes</li>
            <li>Study 30 mins</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
