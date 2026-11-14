import { useEffect, useRef, useState } from "react";
import { createElement } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { API } from "../../api/client";
import {
  AudioLines, BarChart3, BookOpenText, CheckSquare2, ChevronRight, Settings2,
  Compass, LayoutDashboard, LogOut, Menu, Search, Swords, Timer, X,
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
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia("(min-width: 861px)").matches);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [selectedCommand, setSelectedCommand] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const commandInputRef = useRef(null);
  const commandTriggerRef = useRef(null);

  useEffect(() => {
    API.get("/user/me").catch(() => {
      localStorage.removeItem("token");
      navigate("/login");
    });
  }, [navigate]);

  useEffect(() => {
    const interval = window.setInterval(() => setQuoteIndex((index) => (index + 1) % 4), 9000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const onShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
      if (event.key === "Escape" && commandOpen) {
        setCommandOpen(false);
        setCommandQuery("");
        commandTriggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [commandOpen]);

  useEffect(() => {
    if (!commandOpen) return undefined;
    const frame = window.requestAnimationFrame(() => commandInputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [commandOpen]);

  const quotes = [
    "Small steps, repeated, become a different life.",
    "Focus on the next useful action.",
    "You do not need a perfect day to make progress.",
    "Consistency is built one decision at a time.",
  ];
  const currentItem = navGroups.flatMap((group) => group.items).find((item) =>
    item.path === "/dashboard" ? location.pathname === item.path : location.pathname.startsWith(item.path),
  );
  const commandItems = navGroups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })))
    .filter((item) => `${item.label} ${item.group}`.toLowerCase().includes(commandQuery.trim().toLowerCase()));
  const rankProgress = power?.rankProgress ?? (rank.next ? Math.min(100, Math.round(((xp - rank.floor) / (rank.next - rank.floor)) * 100)) : 100);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const closeSidebarOnMobile = () => {
    if (window.matchMedia("(max-width: 860px)").matches) setSidebarOpen(false);
  };

  const openCommand = () => {
    setCommandQuery("");
    setSelectedCommand(0);
    setCommandOpen(true);
  };

  const chooseCommand = (item) => {
    setCommandOpen(false);
    setCommandQuery("");
    navigate(item.path);
  };

  return (
    <div className={`zen-dashboard ${sidebarOpen ? "" : "sidebar-collapsed"}`} data-theme={profile.theme || "capsule"}>
      {sidebarOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside id="dashboard-sidebar" className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
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
                  <NavLink key={path} to={path} className={`nav-item ${active ? "active" : ""}`} onClick={closeSidebarOnMobile}>
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
            <NavLink to="/dashboard/music" className="mini-player" onClick={closeSidebarOnMobile}>
              <span className="mini-player-icon">{preset?.icon || "♫"}</span><span><small>NOW PLAYING</small><strong>{track?.title || preset?.name || "Soundscape"}</strong></span><AudioLines size={15} />
            </NavLink>
          )}
          <button className="logout-link" onClick={logout}><LogOut size={16} /> Sign out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="mobile-menu-button" aria-label={sidebarOpen ? "Close navigation" : "Open navigation"} aria-controls="dashboard-sidebar" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((open) => !open)}>{sidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
          <div className="breadcrumb"><span>ZENKAI OS</span><span className="breadcrumb-slash">/</span><strong>{currentItem?.label || "Overview"}</strong></div>
          <button ref={commandTriggerRef} type="button" className="command-trigger" aria-label="Search sections (Ctrl or Command plus K)" onClick={openCommand}><Search size={15} /><span>Jump to</span><kbd>Ctrl K</kbd></button>
          <div className="topbar-right"><span className="topbar-date">{dateLabel}</span><span className="topbar-quote">{quotes[quoteIndex]}</span><span className="topbar-dot" />{posterUrl && <button type="button" className="topbar-poster-button" title="Edit favorite character poster" aria-label="Edit favorite character poster" onClick={() => navigate("/dashboard/settings")}><img src={posterUrl} alt="" /></button>}<span className="topbar-rank">{rank.name}</span>{syncStatus === "error" ? <button type="button" className="sync-indicator sync-error" title={syncError} onClick={() => syncNow().catch(() => {})}>Sync issue · Retry</button> : <span className={`sync-indicator sync-${syncStatus}`} role="status">{syncStatus === "saving" ? "Saving" : syncStatus === "syncing" ? "Syncing" : "Synced"}</span>}</div>
        </header>
        <div className="dashboard-content"><Outlet /></div>
        <footer className="dashboard-footer"><span>ZENKAI OS <i>·</i> Built for steady progress</span><span>{quests.filter((quest) => quest.completed).length} quests completed</span></footer>
      </main>
      {commandOpen && (
        <div className="command-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setCommandOpen(false); }}>
          <section className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-title" onKeyDown={(event) => {
            if (event.key === "ArrowDown" && commandItems.length) { event.preventDefault(); setSelectedCommand((index) => (index + 1) % commandItems.length); }
            if (event.key === "ArrowUp" && commandItems.length) { event.preventDefault(); setSelectedCommand((index) => (index - 1 + commandItems.length) % commandItems.length); }
            if (event.key === "Enter" && commandItems[selectedCommand]) { event.preventDefault(); chooseCommand(commandItems[selectedCommand]); }
            if (event.key === "Tab") {
              const controls = event.currentTarget.querySelectorAll("input, button");
              const first = controls[0];
              const last = controls[controls.length - 1];
              if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
              else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }
          }}>
            <div className="command-search-row"><Search size={18} /><label id="command-title" className="command-sr-only" htmlFor="command-search">Jump to a section</label><input ref={commandInputRef} id="command-search" type="search" value={commandQuery} onChange={(event) => { setCommandQuery(event.target.value); setSelectedCommand(0); }} placeholder="Find a section..." autoComplete="off" /><kbd>ESC</kbd></div>
            <div className="command-results" role="listbox" aria-label="Dashboard sections">
              {commandItems.length ? commandItems.map((item, index) => {
                const Icon = item.icon;
                return <button key={item.path} type="button" role="option" aria-selected={selectedCommand === index} className={`command-option ${selectedCommand === index ? "selected" : ""}`} onMouseEnter={() => setSelectedCommand(index)} onClick={() => chooseCommand(item)}><span className="command-option-icon"><Icon size={16} /></span><span className="command-option-copy"><strong>{item.label}</strong><small>{item.group}</small></span><ChevronRight size={15} className="command-option-arrow" /></button>;
              }) : <div className="command-empty"><span>No sections found</span><small>Try another keyword.</small></div>}
            </div>
            <div className="command-hint"><span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span><span><kbd>↵</kbd> to open</span></div>
          </section>
        </div>
      )}
    </div>
  );
}
