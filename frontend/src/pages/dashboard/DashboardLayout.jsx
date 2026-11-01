import { useEffect, useState } from "react";
import { createElement } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AudioLines, BarChart3, BookOpenText, CheckSquare2, ChevronRight, Settings2,
  Compass, LayoutDashboard, LogOut, Menu, Swords, Timer, X,
} from "lucide-react";
import { useMusic } from "../../hooks/useMusic";
import { useProductivity } from "../../context/ProductivityContext";
import "../../styles/Dashboard.css";

const navGroups = [
  { label: "COMMAND", items: [{ label: "Overview", path: "/dashboard", icon: LayoutDashboard }] },
  { label: "GROW", items: [
    { label: "Quest board", path: "/dashboard/quests", icon: Swords },
    { label: "Goals & projects", path: "/dashboard/goals", icon: Compass },
    { label: "Habits", path: "/dashboard/habits", icon: CheckSquare2 },
    { label: "Training log", path: "/dashboard/dojo", icon: BookOpenText },
  ] },
  { label: "FOCUS", items: [
    { label: "Time chamber", path: "/dashboard/pomodoro", icon: Timer },
    { label: "Soundscape", path: "/dashboard/music", icon: AudioLines },
  ] },
  { label: "REFLECT", items: [
    { label: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
    { label: "Journal", path: "/dashboard/journal", icon: BookOpenText },
    { label: "Personalize", path: "/dashboard/settings", icon: Settings2 },
  ] },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playing, preset, track } = useMusic();
  const { xp, rank, quests, power, profile, posterUrl, syncStatus, syncError, syncNow } = useProductivity();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    axios.get("http://localhost:5000/user/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }).catch(() => {
      localStorage.removeItem("token");
      navigate("/login");
    });
  }, [navigate]);

  useEffect(() => {
    const interval = window.setInterval(() => setQuoteIndex((index) => (index + 1) % 4), 9000);
    return () => window.clearInterval(interval);
  }, []);

  const quotes = [
    "Small steps, repeated, become a different life.",
    "Focus on the next useful action.",
    "You do not need a perfect day to make progress.",
    "Consistency is built one decision at a time.",
  ];
  const currentItem = navGroups.flatMap((group) => group.items).find((item) =>
    item.path === "/dashboard" ? location.pathname === item.path : location.pathname.startsWith(item.path),
  );
  const rankProgress = power?.rankProgress ?? (rank.next ? Math.min(100, Math.round(((xp - rank.floor) / (rank.next - rank.floor)) * 100)) : 100);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="zen-dashboard" data-theme={profile.theme || "capsule"}>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <button className="brand-lockup" onClick={() => navigate("/dashboard")} aria-label="ZENKAI OS home">
          <span className="brand-mark"><span /></span>
          <span><strong>ZENKAI</strong><small>PERSONAL OS</small></span>
        </button>
        <div className="sidebar-label">YOUR SYSTEM</div>
        <nav className="dashboard-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-group-label">{group.label}</div>
              {group.items.map(({ label, path, icon }) => {
                const active = path === "/dashboard" ? location.pathname === path : location.pathname.startsWith(path);
                return (
                  <NavLink key={path} to={path} className={`nav-item ${active ? "active" : ""}`} onClick={() => setSidebarOpen(false)}>
                    {createElement(icon, { size: 17, strokeWidth: 1.8 })}<span>{label}</span>{active && <ChevronRight size={14} className="nav-active-indicator" />}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="rank-card">
            <div className="rank-card-top"><span className="rank-emblem">✦</span><span>POWER LEVEL</span><strong>{String(power?.powerLevel ?? 1).padStart(6, "0")}</strong></div>
            <div className="rank-title-row"><strong>{rank.name}</strong><span>{power?.nextRank ? `${power.nextRank} · ${Number(power.xpToNextRank).toLocaleString()} XP` : "Max form"}</span></div>
            <div className="rank-track"><span style={{ width: `${rankProgress}%` }} /></div>
            {power?.nextRank && <div className="rank-next-note">Next form at level {power.nextRankLevel} · {Number(power.nextRankXp).toLocaleString()} XP target · {Math.round(power.rankProgress)}%</div>}
          </div>
          {playing && (
            <NavLink to="/dashboard/music" className="mini-player" onClick={() => setSidebarOpen(false)}>
              <span className="mini-player-icon">{preset?.icon || "♫"}</span><span><small>NOW PLAYING</small><strong>{track?.title || preset?.name || "Soundscape"}</strong></span><AudioLines size={15} />
            </NavLink>
          )}
          <button className="logout-link" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="mobile-menu-button" aria-label={sidebarOpen ? "Close menu" : "Open menu"} onClick={() => setSidebarOpen((open) => !open)}>{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="breadcrumb"><span>ZENKAI OS</span><span className="breadcrumb-slash">/</span><strong>{currentItem?.label || "Overview"}</strong></div>
          <div className="topbar-right"><span className="topbar-date">{dateLabel}</span><span className="topbar-quote">{quotes[quoteIndex]}</span><span className="topbar-dot" />{posterUrl && <button type="button" className="topbar-poster-button" title="Edit favorite character poster" aria-label="Edit favorite character poster" onClick={() => navigate("/dashboard/settings")}><img src={posterUrl} alt="" /></button>}<span className="topbar-rank">{rank.name}</span>{syncStatus === "error" ? <button type="button" className="sync-indicator sync-error" title={syncError} onClick={() => syncNow().catch(() => {})}>Sync issue · Retry</button> : <span className={`sync-indicator sync-${syncStatus}`} role="status">{syncStatus === "saving" ? "Saving" : syncStatus === "syncing" ? "Syncing" : "Synced"}</span>}</div>
        </header>
        <div className="dashboard-content"><Outlet /></div>
        <footer className="dashboard-footer"><span>ZENKAI OS <i>·</i> Built for steady progress</span><span>{quests.filter((quest) => quest.completed).length} quests completed</span></footer>
      </main>
    </div>
  );
}
