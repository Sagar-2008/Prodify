import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, AudioLines, Check, ChevronRight, CirclePlay, Clock3, Flame, Plus, Sparkles, Target, Timer, Zap } from "lucide-react";
import { getTodayHabits, getPomodoroStats, toggleHabit } from "../../api/habits.api";
import { useProductivity } from "../../context/ProductivityContext";
import { usePomodoro } from "../../context/PomodoroContext";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}
const formatTimer = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

export default function Overview() {
  const navigate = useNavigate();
  const { quests, goals, training, today, xp, rank, power, toggleQuest } = useProductivity();
  const { timeLeft, running, isSession, setRunning, sessionDuration, breakDuration, updateSessionDuration, updateBreakDuration } = usePomodoro();
  const [todayHabits, setTodayHabits] = useState([]);
  const [pomodoroStats, setPomodoroStats] = useState(null);

  useEffect(() => {
    let alive = true;
    getTodayHabits().then((response) => { if (alive) setTodayHabits(response.data); }).catch((error) => console.error("Failed to load overview habits:", error));
    getPomodoroStats().then((response) => { if (alive) setPomodoroStats(response.data.data); }).catch((error) => console.error("Failed to load focus stats:", error));
    return () => { alive = false; };
  }, []);

  const trainingTotals = { sessions: training.length, solved: training.filter((entry) => entry.solved).length };

  const todayQuests = useMemo(() => quests.filter((quest) => quest.dueDate === today).sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt), [quests, today]);
  const completedQuests = todayQuests.filter((quest) => quest.completed).length;
  const completedHabits = todayHabits.filter((habit) => habit.completed === 1).length;
  const focusHours = pomodoroStats ? (Number(pomodoroStats.total_minutes || 0) / 60).toFixed(1) : "0.0";
  const activeGoals = goals.filter((goal) => goal.progress < goal.target).slice(0, 2);
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const timerDuration = (isSession ? sessionDuration : breakDuration) * 60;

  const handleHabitToggle = async (habit) => {
    const previous = habit.completed;
    const next = previous === 1 || previous === true ? 0 : 1;
    setTodayHabits((items) => items.map((item) => item.habit_id === habit.habit_id ? { ...item, completed: next } : item));
    try {
      await toggleHabit(habit.habit_id, habit.log_date);
      window.dispatchEvent(new CustomEvent("habit-toggled-from-today", { detail: { habitId: habit.habit_id, date: habit.log_date } }));
    } catch (error) {
      console.error("Failed to toggle habit:", error);
      try { const response = await getTodayHabits(); setTodayHabits(response.data); } catch { /* retain the optimistic value until next refresh */ }
    }
  };

  return (
    <div className="overview-page">
      <section className="overview-hero">
        <div className="hero-copy">
          <span className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL OPERATING SYSTEM</span>
          <p className="hero-date">{dateLabel}</p>
          <h1>{greeting()}.<br /><span>Make today count.</span></h1>
          <p className="hero-description">One clear priority. A little focused effort. That is how the next version of you gets built.</p>
          <div className="hero-actions">
            <button className="primary-action" onClick={() => navigate("/dashboard/quests")}><Plus size={17} /> Set a quest</button>
            <button className="secondary-action" onClick={() => { setRunning(true); navigate("/dashboard/pomodoro"); }}><CirclePlay size={17} /> Enter the Time Chamber</button>
          </div>
        </div>
        <div className="hero-power-card">
          <div className="power-orbit orbit-one" /><div className="power-orbit orbit-two" />
          <div className="power-core"><span>POWER LEVEL</span><strong>{String(power?.powerLevel ?? 1).padStart(6, "0")}</strong><small>{xp.toLocaleString()} EXPERIENCE</small></div>
          <div className="power-rank"><span>CURRENT FORM · LEVEL {power?.level || 1}</span><strong>{rank.name}</strong><span>{power?.nextRank ? `NEXT: ${power.nextRank} · ${Number(power.xpToNextRank).toLocaleString()} XP` : "STRONGEST FORM REACHED"}</span></div>
          <div className="power-spark spark-a" /><div className="power-spark spark-b" /><div className="power-spark spark-c" />
        </div>
        <div className="hero-index"><span>01</span><i /><span>FOCUS</span></div>
      </section>

      <section className="overview-metrics" aria-label="Your progress">
        <article className="metric-card"><span className="metric-icon metric-blue"><Clock3 size={17} /></span><span className="metric-label">FOCUS TIME</span><strong>{focusHours}<small>h</small></strong><span className="metric-foot">all-time recorded</span></article>
        <article className="metric-card"><span className="metric-icon metric-orange"><Target size={17} /></span><span className="metric-label">DAILY QUESTS</span><strong>{completedQuests}<small> / {todayQuests.length}</small></strong><span className="metric-foot">{todayQuests.length ? "keep your momentum" : "ready when you are"}</span></article>
        <article className="metric-card"><span className="metric-icon metric-green"><Flame size={17} /></span><span className="metric-label">HABITS TODAY</span><strong>{completedHabits}<small> / {todayHabits.length}</small></strong><span className="metric-foot">small wins, repeated</span></article>
        <article className="metric-card"><span className="metric-icon metric-violet"><Zap size={17} /></span><span className="metric-label">TRAINING COMPLETED</span><strong>{trainingTotals.solved}</strong><span className="metric-foot">{trainingTotals.sessions} sessions logged</span></article>
      </section>

      <div className="overview-columns">
        <section className="overview-panel quest-overview-panel">
          <div className="panel-heading"><div><span className="eyebrow">MISSION CONTROL</span><h2>Today’s quests</h2></div><button className="text-link" onClick={() => navigate("/dashboard/quests")}>Quest board <ArrowRight size={15} /></button></div>
          {todayQuests.length ? <div className="overview-quest-list">
            {todayQuests.slice(0, 5).map((quest) => <div className={`overview-quest ${quest.completed ? "done" : ""}`} key={quest.id}><button className="overview-quest-check" aria-label={quest.completed ? `Reopen ${quest.title}` : `Complete ${quest.title}`} aria-pressed={quest.completed} onClick={() => toggleQuest(quest.id, !quest.completed).catch(() => {})}>{quest.completed && <Check size={14} />}</button><span className="overview-quest-title">{quest.title}<small>{quest.category}</small></span><span className="overview-quest-xp"><Zap size={12} /> {quest.xp}</span></div>)}
            {todayQuests.length > 5 && <button className="list-more" onClick={() => navigate("/dashboard/quests")}>View {todayQuests.length - 5} more quests <ChevronRight size={14} /></button>}
          </div> : <div className="overview-empty"><span className="empty-plus"><Plus size={17} /></span><div><strong>No quests on today’s board.</strong><p>Choose one thing you would feel good about finishing.</p></div><button className="small-add-button" onClick={() => navigate("/dashboard/quests")}>Add one</button></div>}
        </section>

        <section className="overview-panel focus-overview-panel">
          <div className="panel-heading"><div><span className="eyebrow">TIME CHAMBER</span><h2>{isSession ? "Make space to focus." : "Take a moment to reset."}</h2></div><span className={`session-dot ${running ? "is-running" : ""}`} /></div>
          <div className="focus-timer-row"><div className="focus-clock"><Timer size={17} /><strong>{formatTimer(timeLeft)}</strong></div><span>{running ? "SESSION IN PROGRESS" : isSession ? "READY WHEN YOU ARE" : "BREAK MODE"}</span></div>
          <div className="focus-progress-track"><span style={{ width: `${Math.min(100, Math.max(0, (1 - timeLeft / timerDuration) * 100))}%` }} /></div>
          <div className="focus-duration-controls" aria-label="Focus and break durations">
            <label>FOCUS<input type="number" min="1" max="60" value={sessionDuration} disabled={running} onChange={(event) => updateSessionDuration(event.target.value)} /><span>min</span></label>
            <label>BREAK<input type="number" min="1" max="30" value={breakDuration} disabled={running} onChange={(event) => updateBreakDuration(event.target.value)} /><span>min</span></label>
            {running && <small>Pause to adjust the timer.</small>}
          </div>
          <div className="focus-card-bottom"><p>{running ? "Your timer keeps running as you move around the app." : "A single focused session is a strong place to begin."}</p><button className="focus-start-button" onClick={() => { setRunning(!running); navigate("/dashboard/pomodoro"); }}>{running ? "Open timer" : "Start focus"}<ArrowRight size={15} /></button></div>
        </section>
      </div>

      <div className="overview-columns lower-overview">
        <section className="overview-panel habit-overview-panel">
          <div className="panel-heading"><div><span className="eyebrow">CONSISTENCY SYSTEM</span><h2>Today’s habits</h2></div><button className="text-link" onClick={() => navigate("/dashboard/habits")}>Open habits <ArrowRight size={15} /></button></div>
          {todayHabits.length ? <div className="habit-overview-list">{todayHabits.slice(0, 4).map((habit) => <button type="button" className={`habit-overview-row ${habit.completed === 1 || habit.completed === true ? "is-complete" : ""}`} key={habit.habit_id} aria-pressed={habit.completed === 1 || habit.completed === true} onClick={() => handleHabitToggle(habit)}><span className={`habit-status ${habit.completed === 1 || habit.completed === true ? "checked" : ""}`}>{(habit.completed === 1 || habit.completed === true) && <Check size={12} />}</span><span>{habit.title}</span><span className="habit-today-tag">TODAY</span></button>)}</div> : <div className="compact-empty"><span>No habits scheduled here yet.</span><button onClick={() => navigate("/dashboard/habits")}>Set up habits <ChevronRight size={14} /></button></div>}
          <button className="panel-footer-link" onClick={() => navigate("/dashboard/habits")}>View habit calendar <ArrowRight size={14} /></button>
        </section>
        <section className="overview-panel goals-overview-panel">
          <div className="panel-heading"><div><span className="eyebrow">THE LONG GAME</span><h2>Goals in motion</h2></div><button className="text-link" onClick={() => navigate("/dashboard/goals")}>All goals <ArrowRight size={15} /></button></div>
          {activeGoals.length ? <div className="goal-overview-list">{activeGoals.map((goal) => { const percent = Math.min(100, Math.round(goal.progress / goal.target * 100)); return <div className="goal-overview-item" key={goal.id}><div className="goal-overview-title"><span>{goal.title}</span><small>{goal.progress}/{goal.target} steps</small></div><div className="goal-overview-track"><span style={{ width: `${percent}%` }} /></div></div>; })}</div> : <div className="compact-empty"><span>Your next chapter starts with one clear goal.</span><button onClick={() => navigate("/dashboard/goals")}>Create a goal <ChevronRight size={14} /></button></div>}
          <button className="panel-footer-link" onClick={() => navigate("/dashboard/goals")}>Open goals & projects <ArrowRight size={14} /></button>
        </section>
      </div>

      <div className="overview-closing"><div><AudioLines size={16} /><span>Set the atmosphere. Stay with the work.</span></div><button onClick={() => navigate("/dashboard/music")}>Open soundscape <ArrowRight size={14} /></button></div>
    </div>
  );
}
